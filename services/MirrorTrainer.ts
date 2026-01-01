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
    hidden1PreActivations: number[];  // H1 values before ReLU
    hidden1Outputs: number[];         // H1 values after ReLU
    hidden2PreActivations: number[];  // H2 values before ReLU
    hidden2Outputs: number[];         // H2 values after ReLU
    outputPreActivations: number[];   // Output values before sigmoid
    outputs: number[];                // Final outputs
}

/**
 * Runs forward pass and stores intermediate values for backpropagation.
 */
function forwardPass(network: NeuralNetworkData, inputs: number[]): ForwardPassResult {
    // Determine hidden node counts (assume symmetrical if hiddenWeights exists)
    // Fallback logic for old networks handled here for robustness
    const hiddenNodes = network.inputWeights[0]?.length || network.outputWeights.length;
    const inputNodes = NN_ARCH_CHUCK.INPUT_NODES;
    const outputNodes = NN_ARCH_CHUCK.OUTPUT_NODES;

    // --- LAYER 1: Input -> Hidden 1 ---
    const hidden1PreActivations: number[] = [];
    const hidden1Outputs: number[] = [];

    for (let h = 0; h < hiddenNodes; h++) {
        let sum = 0;
        for (let i = 0; i < inputNodes; i++) {
            sum += (inputs[i] ?? 0) * (network.inputWeights[i]?.[h] ?? 0);
        }
        sum += network.biases[h] ?? 0;
        hidden1PreActivations.push(sum);
        hidden1Outputs.push(relu(sum));
    }

    // --- LAYER 2: Hidden 1 -> Hidden 2 ---
    const hidden2PreActivations: number[] = [];
    const hidden2Outputs: number[] = [];

    // Check if hiddenWeights exist (backward compatibility)
    if (network.hiddenWeights) {
        for (let h2 = 0; h2 < hiddenNodes; h2++) {
            let sum = 0;
            for (let h1 = 0; h1 < hiddenNodes; h1++) {
                sum += (hidden1Outputs[h1] ?? 0) * (network.hiddenWeights[h1]?.[h2] ?? 0);
            }
            sum += network.biases[hiddenNodes + h2] ?? 0;
            hidden2PreActivations.push(sum);
            hidden2Outputs.push(relu(sum));
        }
    } else {
        // Fallback: H2 = H1
        // We push dummies to arrays to keep length consistent, but this branch 
        // implies the network structure is old. We should probably force training 
        // on new structure or fail gracefully. For now, pass-through.
        for (let i = 0; i < hiddenNodes; i++) {
            hidden2PreActivations.push(hidden1PreActivations[i]!);
            hidden2Outputs.push(hidden1Outputs[i]!);
        }
    }

    // --- LAYER 3: Hidden 2 -> Output ---
    const outputPreActivations: number[] = [];
    const outputs: number[] = [];

    for (let o = 0; o < outputNodes; o++) {
        let sum = 0;
        for (let h = 0; h < hiddenNodes; h++) {
            sum += (hidden2Outputs[h] ?? 0) * (network.outputWeights[h]?.[o] ?? 0);
        }
        // Bias offset: H1 biases (0..H-1) + H2 biases (H..2H-1) -> Output biases start at 2H
        // NOTE: If old network, bias length is only H+O. If new, 2H+O.
        const biasIndex = network.hiddenWeights ? (hiddenNodes * 2 + o) : (hiddenNodes + o);
        sum += network.biases[biasIndex] ?? 0;
        outputPreActivations.push(sum);
        outputs.push(sigmoid(sum));
    }

    return {
        hidden1PreActivations, hidden1Outputs,
        hidden2PreActivations, hidden2Outputs,
        outputPreActivations, outputs
    };
}

// =============================================================================
// BACKPROPAGATION
// =============================================================================

interface Gradients {
    inputWeightGrads: number[][];    // Input -> H1
    hiddenWeightGrads: number[][];   // H1 -> H2 (NEW)
    outputWeightGrads: number[][];   // H2 -> Output
    biasGrads: number[];             // All biases
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
    // If hiddenWeights is missing, effectively abort or return empty (compatibility mode)
    // But we assume the caller ensures new network structure.
    const hiddenNodes = network.inputWeights[0]?.length || network.outputWeights.length;
    const inputNodes = NN_ARCH_CHUCK.INPUT_NODES;
    const outputNodes = NN_ARCH_CHUCK.OUTPUT_NODES;

    const {
        hidden1PreActivations, hidden1Outputs,
        hidden2PreActivations, hidden2Outputs,
        outputs
    } = forwardResult;

    const hasHiddenWeights = !!network.hiddenWeights;

    // --- 1. OUTPUT LAYER DELTAS (δ_o) ---
    // δ_o = (output - target) * σ'(output)
    const outputDeltas: number[] = [];
    for (let o = 0; o < outputNodes; o++) {
        const error = (outputs[o] ?? 0) - (targets[o] ?? 0);
        const delta = error * sigmoidDerivative(outputs[o] ?? 0);
        outputDeltas.push(delta);
    }

    // --- 2. HIDDEN LAYER 2 DELTAS (δ_h2) ---
    // δ_h2 = (Σ δ_o * w_h2o) * relu'(pre_h2)
    const hidden2Deltas: number[] = [];
    for (let h2 = 0; h2 < hiddenNodes; h2++) {
        let sum = 0;
        for (let o = 0; o < outputNodes; o++) {
            sum += (outputDeltas[o] ?? 0) * (network.outputWeights[h2]?.[o] ?? 0);
        }
        const delta = sum * reluDerivative(hidden2PreActivations[h2] ?? 0);
        hidden2Deltas.push(delta);
    }

    // --- 3. HIDDEN LAYER 1 DELTAS (δ_h1) ---
    // δ_h1 = (Σ δ_h2 * w_h1h2) * relu'(pre_h1)
    const hidden1Deltas: number[] = [];
    if (hasHiddenWeights) {
        for (let h1 = 0; h1 < hiddenNodes; h1++) {
            let sum = 0;
            for (let h2 = 0; h2 < hiddenNodes; h2++) {
                sum += (hidden2Deltas[h2] ?? 0) * (network.hiddenWeights[h1]?.[h2] ?? 0);
            }
            const delta = sum * reluDerivative(hidden1PreActivations[h1] ?? 0);
            hidden1Deltas.push(delta);
        }
    } else {
        // Fallback for 1-layer nets (δ_h1 = δ_h2 effectively, but structure is different)
        // Just use h2 deltas? No, without weights it's undefined.
        // We'll just fill with 0s to avoid crash.
        for (let i = 0; i < hiddenNodes; i++) hidden1Deltas.push(0);
    }

    // --- 4. COMPUTE WEIGHT GRADIENTS ---

    // A. Output Weights (H2 -> Output): ∂E/∂w = δ_o * h2_out
    const outputWeightGrads: number[][] = [];
    for (let h = 0; h < hiddenNodes; h++) {
        const row: number[] = [];
        for (let o = 0; o < outputNodes; o++) {
            row.push((outputDeltas[o] ?? 0) * (hidden2Outputs[h] ?? 0));
        }
        outputWeightGrads.push(row);
    }

    // B. Hidden Weights (H1 -> H2): ∂E/∂w = δ_h2 * h1_out
    const hiddenWeightGrads: number[][] = [];
    if (hasHiddenWeights) {
        for (let h1 = 0; h1 < hiddenNodes; h1++) {
            const row: number[] = [];
            for (let h2 = 0; h2 < hiddenNodes; h2++) {
                row.push((hidden2Deltas[h2] ?? 0) * (hidden1Outputs[h1] ?? 0));
            }
            hiddenWeightGrads.push(row);
        }
    }

    // C. Input Weights (Input -> H1): ∂E/∂w = δ_h1 * input
    const inputWeightGrads: number[][] = [];
    for (let i = 0; i < inputNodes; i++) {
        const row: number[] = [];
        for (let h1 = 0; h1 < hiddenNodes; h1++) {
            row.push((hidden1Deltas[h1] ?? 0) * (inputs[i] ?? 0));
        }
        inputWeightGrads.push(row);
    }

    // D. Bias Gradients
    const biasGrads: number[] = [];
    // H1 Biases (Indices 0..H-1)
    for (const d of hidden1Deltas) biasGrads.push(d);
    // H2 Biases (Indices H..2H-1)
    if (hasHiddenWeights) {
        for (const d of hidden2Deltas) biasGrads.push(d);
    }
    // Output Biases (Indices 2H..2H+O)
    for (const d of outputDeltas) biasGrads.push(d);

    return { inputWeightGrads, hiddenWeightGrads, outputWeightGrads, biasGrads };
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

    const hasHiddenWeights = !!network.hiddenWeights;

    // Deep clone network for updates (Rule #9: immutability)
    const newNetwork: NeuralNetworkData = {
        inputWeights: network.inputWeights.map(row => [...row]),
        hiddenWeights: hasHiddenWeights ? network.hiddenWeights!.map(row => [...row]) : [],
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
        let accHiddenGrads: number[][] = Array(hiddenNodes).fill(null).map(() =>
            Array(hiddenNodes).fill(0)
        );
        let accOutputGrads: number[][] = Array(hiddenNodes).fill(null).map(() =>
            Array(outputNodes).fill(0)
        );
        // H1 + H2 + Out = 2H + O (or H+O if old)
        let accBiasGrads: number[] = Array(newNetwork.biases.length).fill(0);

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
            // Inputs
            for (let i = 0; i < inputNodes; i++) {
                for (let h = 0; h < hiddenNodes; h++) {
                    accInputGrads[i]![h]! += (gradients.inputWeightGrads[i]?.[h] ?? 0) * sample.weight;
                }
            }
            // Hidden (H1->H2)
            if (hasHiddenWeights) {
                for (let h1 = 0; h1 < hiddenNodes; h1++) {
                    for (let h2 = 0; h2 < hiddenNodes; h2++) {
                        accHiddenGrads[h1]![h2]! += (gradients.hiddenWeightGrads[h1]?.[h2] ?? 0) * sample.weight;
                    }
                }
            }
            // Output
            for (let h = 0; h < hiddenNodes; h++) {
                for (let o = 0; o < outputNodes; o++) {
                    accOutputGrads[h]![o]! += (gradients.outputWeightGrads[h]?.[o] ?? 0) * sample.weight;
                }
            }
            // Biases
            for (let b = 0; b < accBiasGrads.length; b++) {
                accBiasGrads[b]! += (gradients.biasGrads[b] ?? 0) * sample.weight;
            }
        }

        // Apply updates
        for (let i = 0; i < inputNodes; i++) {
            for (let h = 0; h < hiddenNodes; h++) {
                newNetwork.inputWeights[i]![h]! -= config.learningRate * (accInputGrads[i]?.[h] ?? 0);
            }
        }
        if (hasHiddenWeights) {
            for (let h1 = 0; h1 < hiddenNodes; h1++) {
                for (let h2 = 0; h2 < hiddenNodes; h2++) {
                    newNetwork.hiddenWeights[h1]![h2]! -= config.learningRate * (accHiddenGrads[h1]?.[h2] ?? 0);
                }
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
