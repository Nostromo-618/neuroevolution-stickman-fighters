/**
 * =============================================================================
 * MIRROR TRAINER - Backpropagation Training for Mirror AI
 * =============================================================================
 * 
 * This module implements online supervised learning for the Mirror AI network.
 * Instead of heuristically setting biases, we train the network using actual
 * player input-output pairs via backpropagation.
 * 
 * Key Features:
 * - Gradient descent weight updates
 * - Recency-weighted samples (recent moves matter more)
 * - Incremental learning (train on small batches frequently)
 * 
 * This runs in a Web Worker to avoid blocking the main thread.
 * =============================================================================
 */

import type { NeuralNetworkData } from '../types';
import { NN_ARCH_CHUCK } from './Config';

// =============================================================================
// TYPES
// =============================================================================

export interface TrainingSample {
    inputs: number[];    // 9 normalized game state inputs
    targets: number[];   // 8 target outputs (0.1 for inactive, 0.9 for active)
    weight: number;      // Sample importance (recent = higher)
}

export interface TrainingConfig {
    learningRate: number;      // Step size for gradient descent (0.05-0.2)
    epochs: number;            // Passes over the data per training call
    recencyDecay: number;      // Decay factor for sample weights (0.9-0.99)
    minSamples: number;        // Minimum samples before training starts
}

// Default configuration optimized for real-time adaptation
export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
    learningRate: 0.15,        // Aggressive learning for fast adaptation
    epochs: 2,                 // Few epochs per call (called frequently)
    recencyDecay: 0.95,        // Recent samples 20x more important than 60-sample-old ones
    minSamples: 20,            // Need at least 20 samples to start training
};

// =============================================================================
// ACTIVATION FUNCTIONS & DERIVATIVES
// =============================================================================

/**
 * Sigmoid activation function: σ(x) = 1 / (1 + e^(-x))
 */
function sigmoid(x: number): number {
    // Clamp to prevent overflow
    const clampedX = Math.max(-500, Math.min(500, x));
    return 1 / (1 + Math.exp(-clampedX));
}

/**
 * Sigmoid derivative: σ'(x) = σ(x) * (1 - σ(x))
 * Used in backpropagation for output layer gradients.
 */
function sigmoidDerivative(sigmoidOutput: number): number {
    return sigmoidOutput * (1 - sigmoidOutput);
}

/**
 * ReLU activation function: max(0, x)
 */
function relu(x: number): number {
    return Math.max(0, x);
}

/**
 * ReLU derivative: 1 if x > 0, else 0
 */
function reluDerivative(x: number): number {
    return x > 0 ? 1 : 0;
}

// =============================================================================
// FORWARD PASS
// =============================================================================

interface ForwardPassResult {
    hiddenPreActivations: number[];   // Hidden layer values before ReLU
    hiddenOutputs: number[];          // Hidden layer values after ReLU
    outputPreActivations: number[];   // Output layer values before sigmoid
    outputs: number[];                // Final outputs after sigmoid
}

/**
 * Runs forward pass and stores intermediate values for backpropagation.
 */
function forwardPass(network: NeuralNetworkData, inputs: number[]): ForwardPassResult {
    const hiddenNodes = network.outputWeights.length;
    const inputNodes = NN_ARCH_CHUCK.INPUT_NODES;
    const outputNodes = NN_ARCH_CHUCK.OUTPUT_NODES;

    // Hidden layer computation
    const hiddenPreActivations: number[] = [];
    const hiddenOutputs: number[] = [];

    for (let h = 0; h < hiddenNodes; h++) {
        let sum = 0;
        for (let i = 0; i < inputNodes; i++) {
            sum += (inputs[i] ?? 0) * (network.inputWeights[i]?.[h] ?? 0);
        }
        sum += network.biases[h] ?? 0;
        hiddenPreActivations.push(sum);
        hiddenOutputs.push(relu(sum));
    }

    // Output layer computation
    const outputPreActivations: number[] = [];
    const outputs: number[] = [];

    for (let o = 0; o < outputNodes; o++) {
        let sum = 0;
        for (let h = 0; h < hiddenNodes; h++) {
            sum += (hiddenOutputs[h] ?? 0) * (network.outputWeights[h]?.[o] ?? 0);
        }
        sum += network.biases[hiddenNodes + o] ?? 0;
        outputPreActivations.push(sum);
        outputs.push(sigmoid(sum));
    }

    return { hiddenPreActivations, hiddenOutputs, outputPreActivations, outputs };
}

// =============================================================================
// BACKPROPAGATION
// =============================================================================

interface Gradients {
    inputWeightGrads: number[][];   // Gradients for input→hidden weights
    outputWeightGrads: number[][];  // Gradients for hidden→output weights
    biasGrads: number[];            // Gradients for all biases
}

/**
 * Computes gradients via backpropagation for a single sample.
 * 
 * Algorithm:
 * 1. Compute output layer errors: (output - target)
 * 2. Compute output layer deltas: error * sigmoid'(output)
 * 3. Propagate deltas back to hidden layer
 * 4. Compute weight gradients: delta * input_to_that_weight
 */
function computeGradients(
    network: NeuralNetworkData,
    inputs: number[],
    targets: number[],
    forwardResult: ForwardPassResult
): Gradients {
    const hiddenNodes = network.outputWeights.length;
    const inputNodes = NN_ARCH_CHUCK.INPUT_NODES;
    const outputNodes = NN_ARCH_CHUCK.OUTPUT_NODES;

    const { hiddenPreActivations, hiddenOutputs, outputs } = forwardResult;

    // --- OUTPUT LAYER DELTAS ---
    // δ_o = (output_o - target_o) * sigmoid'(output_o)
    const outputDeltas: number[] = [];
    for (let o = 0; o < outputNodes; o++) {
        const error = (outputs[o] ?? 0) - (targets[o] ?? 0);
        const delta = error * sigmoidDerivative(outputs[o] ?? 0);
        outputDeltas.push(delta);
    }

    // --- HIDDEN LAYER DELTAS ---
    // δ_h = (Σ δ_o * w_ho) * relu'(pre_h)
    const hiddenDeltas: number[] = [];
    for (let h = 0; h < hiddenNodes; h++) {
        let sum = 0;
        for (let o = 0; o < outputNodes; o++) {
            sum += (outputDeltas[o] ?? 0) * (network.outputWeights[h]?.[o] ?? 0);
        }
        const delta = sum * reluDerivative(hiddenPreActivations[h] ?? 0);
        hiddenDeltas.push(delta);
    }

    // --- COMPUTE GRADIENTS ---

    // Input→Hidden weight gradients: ∂E/∂w_ih = δ_h * input_i
    const inputWeightGrads: number[][] = [];
    for (let i = 0; i < inputNodes; i++) {
        const row: number[] = [];
        for (let h = 0; h < hiddenNodes; h++) {
            row.push((hiddenDeltas[h] ?? 0) * (inputs[i] ?? 0));
        }
        inputWeightGrads.push(row);
    }

    // Hidden→Output weight gradients: ∂E/∂w_ho = δ_o * hidden_h
    const outputWeightGrads: number[][] = [];
    for (let h = 0; h < hiddenNodes; h++) {
        const row: number[] = [];
        for (let o = 0; o < outputNodes; o++) {
            row.push((outputDeltas[o] ?? 0) * (hiddenOutputs[h] ?? 0));
        }
        outputWeightGrads.push(row);
    }

    // Bias gradients: ∂E/∂b = δ (bias input is always 1)
    const biasGrads: number[] = [];
    for (let h = 0; h < hiddenNodes; h++) {
        biasGrads.push(hiddenDeltas[h] ?? 0);
    }
    for (let o = 0; o < outputNodes; o++) {
        biasGrads.push(outputDeltas[o] ?? 0);
    }

    return { inputWeightGrads, outputWeightGrads, biasGrads };
}

// =============================================================================
// TRAINING FUNCTION
// =============================================================================

/**
 * Trains the Mirror AI network on a batch of samples using backpropagation.
 * 
 * This is the main entry point called from the worker.
 * 
 * @param network - Current network weights to update
 * @param samples - Training samples with inputs, targets, and weights
 * @param config - Training configuration
 * @returns Updated network with trained weights
 */
export function trainMirrorNetwork(
    network: NeuralNetworkData,
    samples: TrainingSample[],
    config: TrainingConfig = DEFAULT_TRAINING_CONFIG
): NeuralNetworkData {
    // Skip if not enough samples
    if (samples.length < config.minSamples) {
        return network;
    }

    const hiddenNodes = network.outputWeights.length;
    const inputNodes = NN_ARCH_CHUCK.INPUT_NODES;
    const outputNodes = NN_ARCH_CHUCK.OUTPUT_NODES;

    // Deep clone network for updates (Rule #9: immutability)
    const newNetwork: NeuralNetworkData = {
        inputWeights: network.inputWeights.map(row => [...row]),
        outputWeights: network.outputWeights.map(row => [...row]),
        biases: [...network.biases]
    };

    // Normalize sample weights so they sum to 1
    const totalWeight = samples.reduce((sum, s) => sum + s.weight, 0);
    const normalizedSamples = samples.map(s => ({
        ...s,
        weight: s.weight / totalWeight
    }));

    // Training loop (Rule #2: bounded iteration)
    for (let epoch = 0; epoch < config.epochs; epoch++) {
        // Accumulate gradients from all samples
        let accInputGrads: number[][] = Array(inputNodes).fill(null).map(() =>
            Array(hiddenNodes).fill(0)
        );
        let accOutputGrads: number[][] = Array(hiddenNodes).fill(null).map(() =>
            Array(outputNodes).fill(0)
        );
        let accBiasGrads: number[] = Array(hiddenNodes + outputNodes).fill(0);

        for (const sample of normalizedSamples) {
            // Forward pass
            const forwardResult = forwardPass(newNetwork, sample.inputs);

            // Backward pass
            const gradients = computeGradients(
                newNetwork,
                sample.inputs,
                sample.targets,
                forwardResult
            );

            // Accumulate weighted gradients
            for (let i = 0; i < inputNodes; i++) {
                for (let h = 0; h < hiddenNodes; h++) {
                    accInputGrads[i]![h]! += (gradients.inputWeightGrads[i]?.[h] ?? 0) * sample.weight;
                }
            }
            for (let h = 0; h < hiddenNodes; h++) {
                for (let o = 0; o < outputNodes; o++) {
                    accOutputGrads[h]![o]! += (gradients.outputWeightGrads[h]?.[o] ?? 0) * sample.weight;
                }
            }
            for (let b = 0; b < accBiasGrads.length; b++) {
                accBiasGrads[b]! += (gradients.biasGrads[b] ?? 0) * sample.weight;
            }
        }

        // Apply gradient descent: w = w - lr * gradient
        for (let i = 0; i < inputNodes; i++) {
            for (let h = 0; h < hiddenNodes; h++) {
                newNetwork.inputWeights[i]![h]! -= config.learningRate * (accInputGrads[i]?.[h] ?? 0);
            }
        }
        for (let h = 0; h < hiddenNodes; h++) {
            for (let o = 0; o < outputNodes; o++) {
                newNetwork.outputWeights[h]![o]! -= config.learningRate * (accOutputGrads[h]?.[o] ?? 0);
            }
        }
        for (let b = 0; b < accBiasGrads.length; b++) {
            newNetwork.biases[b]! -= config.learningRate * (accBiasGrads[b] ?? 0);
        }
    }

    return newNetwork;
}

/**
 * Applies recency decay to sample weights.
 * More recent samples get higher weights.
 * 
 * @param samples - Array of samples (oldest first)
 * @param decayFactor - Decay per sample (0.9-0.99)
 * @returns Samples with updated weights
 */
export function applyRecencyWeights(
    samples: Omit<TrainingSample, 'weight'>[],
    decayFactor: number
): TrainingSample[] {
    const len = samples.length;
    return samples.map((sample, index) => ({
        ...sample,
        // Most recent (last) has weight 1.0, oldest has weight decay^(len-1)
        weight: Math.pow(decayFactor, len - 1 - index)
    }));
}
