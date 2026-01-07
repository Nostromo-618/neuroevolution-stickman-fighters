/**
 * =============================================================================
 * NEURAL NETWORK SERVICE
 * =============================================================================
 * 
 * This module implements a feedforward neural network for controlling AI fighters.
 * The network architecture is user-configurable (1-5 hidden layers):
 * 
 *   INPUT LAYER (9 neurons)
 *        ↓ (weights + biases)
 *   HIDDEN LAYER 1 (configurable neurons, ReLU activation)
 *        ↓ (weights + biases)
 *   [HIDDEN LAYER 2-5] (optional, configurable)
 *        ↓ (weights + biases)
 *   OUTPUT LAYER (8 neurons, Sigmoid activation)
 * 
 * Default architecture: 9 → 13 → 13 → 8 (two hidden layers)
 * 
 * WHAT IS A NEURAL NETWORK?
 * -------------------------
 * A neural network is a computational model inspired by biological brains.
 * It consists of layers of "neurons" connected by weighted connections.
 * 
 * Each neuron:
 * 1. Receives inputs (numbers)
 * 2. Multiplies each input by a weight
 * 3. Sums all weighted inputs
 * 4. Adds a bias (offset)
 * 5. Applies an activation function
 * 6. Outputs the result
 * 
 * WHY NEUROEVOLUTION?
 * -------------------
 * Traditional neural networks learn via backpropagation (calculus-based).
 * Neuroevolution uses genetic algorithms instead:
 * 
 * 1. Create random networks (random weights)
 * 2. Test them by fighting
 * 3. Keep the best performers
 * 4. Combine winners (crossover) and add random changes (mutation)
 * 5. Repeat for generations
 * 
 * =============================================================================
 */

import type { NeuralNetworkData, NNArchitecture } from '../types';
import { NN_ARCH } from './Config';
import { getCurrentArchitecture } from './NNArchitecturePersistence';

// =============================================================================
// NETWORK ARCHITECTURE CONSTANTS
// =============================================================================

/**
 * INPUT_NODES: Number of input neurons
 * 
 * The 9 inputs represent the fighter's perception of the game state:
 * 1. distanceX     - Horizontal distance to opponent (normalized -1 to 1)
 * 2. distanceY     - Vertical distance to opponent (normalized)
 * 3. selfHealth    - Own health (0 to 1)
 * 4. enemyHealth   - Opponent's health (0 to 1)
 * 5. enemyAction   - Opponent's current action (normalized 0 to 1)
 * 6. selfEnergy    - Own energy level (0 to 1)
 * 7. facingDirection - Which way we're facing (-1 or 1)
 * 8. oppCooldown   - Opponent's action cooldown (normalized)
 * 9. oppEnergy     - Opponent's energy level (0 to 1)
 */
export const INPUT_NODES = NN_ARCH.INPUT_NODES;

/**
 * HIDDEN_NODES: Default number of neurons in hidden layers
 */
export const HIDDEN_NODES = NN_ARCH.HIDDEN_NODES;

/**
 * OUTPUT_NODES: Number of output neurons (one per FighterAction)
 * 
 * Each output corresponds to a possible action:
 * 0: IDLE, 1: MOVE_LEFT, 2: MOVE_RIGHT, 3: JUMP,
 * 4: CROUCH, 5: PUNCH, 6: KICK, 7: BLOCK
 */
export const OUTPUT_NODES = NN_ARCH.OUTPUT_NODES;

// =============================================================================
// ACTIVATION FUNCTIONS
// =============================================================================

/**
 * Sigmoid Activation Function
 * 
 * Formula: σ(x) = 1 / (1 + e^(-x))
 * 
 * Properties:
 * - Output range: (0, 1)
 * - S-shaped curve
 * - Used in output layer to produce probability-like values
 * 
 * @param t - Input value
 * @returns Output between 0 and 1
 */
export const sigmoid = (t: number) => 1 / (1 + Math.exp(-t));

/**
 * ReLU (Rectified Linear Unit) Activation Function
 * 
 * Formula: ReLU(x) = max(0, x)
 * 
 * Properties:
 * - Output range: [0, ∞)
 * - Very fast to compute
 * - No "vanishing gradient" problem
 * 
 * @param t - Input value
 * @returns 0 if negative, otherwise returns input unchanged
 */
export const relu = (t: number) => Math.max(0, t);

// =============================================================================
// NETWORK CREATION
// =============================================================================

/**
 * Creates a new neural network with random weights for a given architecture.
 *
 * Weight Initialization Strategy:
 * - All weights are randomly initialized between -1 and 1
 * - This range allows for both positive and negative connections
 *
 * @param arch - The architecture defining layer sizes
 * @returns A new NeuralNetworkData with random weights and biases
 */
export const createNetworkFromArchitecture = (arch: NNArchitecture): NeuralNetworkData => {
  const layers = [arch.inputNodes, ...arch.hiddenLayers, arch.outputNodes];
  const layerWeights: number[][][] = [];
  const biases: number[][] = [];

  // Create weights between each adjacent layer pair
  for (let i = 0; i < layers.length - 1; i++) {
    const fromSize = layers[i] ?? 0;
    const toSize = layers[i + 1] ?? 0;

    // Weights: fromSize × toSize matrix
    const weights: number[][] = [];
    for (let f = 0; f < fromSize; f++) {
      weights.push(Array(toSize).fill(0).map(() => Math.random() * 2 - 1));
    }
    layerWeights.push(weights);

    // Biases: one per target node
    biases.push(Array(toSize).fill(0).map(() => Math.random() * 2 - 1));
  }

  return {
    architecture: { ...arch },
    layerWeights,
    biases
  };
};

/**
 * Creates a new neural network with random weights.
 *
 * Architecture Selection:
 * - If customArch is provided, uses that architecture
 * - Otherwise reads from localStorage via getCurrentArchitecture()
 * - Falls back to default 9→13→13→8 if nothing saved
 *
 * @param customArch - Optional custom architecture to use
 * @returns A new NeuralNetworkData with random weights and biases
 */
export const createRandomNetwork = (customArch?: NNArchitecture): NeuralNetworkData => {
  const arch = customArch ?? getCurrentArchitecture();
  return createNetworkFromArchitecture(arch);
};

// =============================================================================
// FORWARD PROPAGATION (PREDICTION)
// =============================================================================

/**
 * Runs the neural network forward pass (prediction).
 *
 * Supports any number of hidden layers (1-5).
 * Uses ReLU activation for hidden layers and Sigmoid for output.
 *
 * Algorithm:
 * 1. For each layer transition (input→hidden1→...→output):
 *    - Compute weighted sum: sum = Σ(activation[i] × weight[i][j]) + bias[j]
 *    - Apply activation function (ReLU for hidden, Sigmoid for output)
 *
 * @param network - The neural network to use
 * @param inputs - Array of input values (must match architecture.inputNodes length)
 * @returns Array of output values (0-1 each)
 */
export const predict = (network: NeuralNetworkData, inputs: number[]): number[] => {
  let currentActivations = [...inputs];

  // Forward pass through each layer
  for (let layerIdx = 0; layerIdx < network.layerWeights.length; layerIdx++) {
    const weights = network.layerWeights[layerIdx];
    const layerBiases = network.biases[layerIdx];

    // Skip if layer data is missing (shouldn't happen with valid network)
    if (!weights || !layerBiases) continue;

    const isOutputLayer = layerIdx === network.layerWeights.length - 1;

    const nextActivations: number[] = [];
    const toSize = layerBiases.length;

    for (let toNode = 0; toNode < toSize; toNode++) {
      let sum = 0;

      // Weighted sum of all inputs to this node
      for (let fromNode = 0; fromNode < currentActivations.length; fromNode++) {
        const weight = weights[fromNode]?.[toNode] ?? 0;
        sum += (currentActivations[fromNode] ?? 0) * weight;
      }

      // Add bias
      sum += layerBiases[toNode] ?? 0;

      // Apply activation function
      if (isOutputLayer) {
        // Sigmoid for output layer (probability-like values 0-1)
        nextActivations.push(sigmoid(sum));
      } else {
        // ReLU for hidden layers
        nextActivations.push(relu(sum));
      }
    }

    currentActivations = nextActivations;
  }

  return currentActivations;
};

// =============================================================================
// GENETIC OPERATIONS
// =============================================================================

/**
 * Mutates a neural network by randomly adjusting weights.
 * 
 * MUTATION IN GENETIC ALGORITHMS:
 * Mutation introduces small random changes to maintain genetic diversity.
 * Without mutation, the population could get stuck in local optima.
 * 
 * Our mutation strategy:
 * - For each weight, there's a `rate` probability it will be mutated
 * - 10% chance of "big mutation" (±2.0) for exploration
 * - 90% chance of "small mutation" (±0.5 to ±1.0) for refinement
 *
 * @param network - The network to mutate
 * @param rate - Probability of mutating each weight (0-1)
 * @returns A new mutated network (original is not modified)
 */
export const mutateNetwork = (network: NeuralNetworkData, rate: number): NeuralNetworkData => {
  const mutateValue = (val: number): number => {
    if (Math.random() < rate) {
      // 10% chance of "big mutation" for exploration
      if (Math.random() < 0.1) {
        return val + (Math.random() * 4.0 - 2.0);
      }
      // Normal mutation: scale by rate
      const magnitude = 0.5 + (rate * 0.5);
      return val + (Math.random() * 2 * magnitude - magnitude);
    }
    return val;
  };

  const newLayerWeights = network.layerWeights.map(layer =>
    layer.map(row => row.map(mutateValue))
  );

  const newBiases = network.biases.map(layer =>
    layer.map(mutateValue)
  );

  return {
    architecture: { ...network.architecture },
    layerWeights: newLayerWeights,
    biases: newBiases
  };
};

/**
 * Combines two parent networks to create a child network (Crossover).
 * 
 * CROSSOVER IN GENETIC ALGORITHMS:
 * Crossover combines genes from two parents, allowing beneficial traits
 * from both to be inherited.
 * 
 * Our crossover strategy (Uniform Crossover):
 * - For each weight, randomly pick from parent A (50%) or parent B (50%)
 * 
 * IMPORTANT: Both parents must have the same architecture.
 * If architectures differ, parent A is returned unchanged.
 *
 * @param a - Parent A network
 * @param b - Parent B network
 * @returns A new child network with mixed weights
 */
export const crossoverNetworks = (a: NeuralNetworkData, b: NeuralNetworkData): NeuralNetworkData => {
  // Verify architectures match
  const aLayers = a.architecture.hiddenLayers;
  const bLayers = b.architecture.hiddenLayers;

  if (aLayers.length !== bLayers.length ||
    !aLayers.every((size, i) => size === bLayers[i])) {
    console.warn('Crossover attempted with incompatible architectures, returning parent A');
    return {
      ...a,
      layerWeights: a.layerWeights.map(l => l.map(r => [...r])),
      biases: a.biases.map(b => [...b])
    };
  }

  const mix = (w1: number, w2: number) => Math.random() > 0.5 ? w1 : w2;

  const newLayerWeights = a.layerWeights.map((layer, layerIdx) =>
    layer.map((row, rowIdx) =>
      row.map((val, colIdx) => mix(val, b.layerWeights[layerIdx]?.[rowIdx]?.[colIdx] ?? val))
    )
  );

  const newBiases = a.biases.map((layer, layerIdx) =>
    layer.map((val, nodeIdx) => mix(val, b.biases[layerIdx]?.[nodeIdx] ?? val))
  );

  return {
    architecture: { ...a.architecture },
    layerWeights: newLayerWeights,
    biases: newBiases
  };
};

// =============================================================================
// IMPORT/EXPORT UTILITIES
// =============================================================================

/**
 * Exports a genome to a JSON string for saving.
 * 
 * This allows trained AI weights to be:
 * - Saved to a file
 * - Shared with others
 * - Loaded later for continued training or play
 * 
 * @param genome - The genome to export
 * @param generation - Current generation number (for continuation)
 * @returns JSON string representation
 */
export const exportGenome = (
  genome: { id: string; network: NeuralNetworkData; fitness: number; matchesWon: number },
  generation: number = 1
): string => {
  return JSON.stringify({
    id: genome.id,
    network: genome.network,
    fitness: genome.fitness,
    matchesWon: genome.matchesWon,
    generation: generation,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      architecture: genome.network.architecture
    }
  }, null, 2);
};

/**
 * Import result type - either success with genome or error with message
 */
export type ImportResult = {
  success: true;
  genome: {
    id: string;
    network: NeuralNetworkData;
    fitness: number;
    matchesWon: number;
  };
  generation: number;
  importedArchitecture: NNArchitecture;
} | {
  success: false;
  error: string;
};

/**
 * Imports a genome from a JSON string.
 * 
 * Validates the structure to ensure the JSON contains valid network data.
 * Returns a result object with either the genome or an error message.
 * 
 * @param jsonString - JSON string to parse
 * @returns ImportResult with genome data or error message
 */
export const importGenome = (jsonString: string): ImportResult => {
  try {
    const data = JSON.parse(jsonString);

    // Validate structure
    if (!data.network) {
      return { success: false, error: 'Invalid file format: missing network data' };
    }

    // Check for new flexible format
    if (data.network.architecture && data.network.layerWeights && data.network.biases) {
      // Validate architecture
      const arch = data.network.architecture;
      if (arch.inputNodes !== INPUT_NODES) {
        return {
          success: false,
          error: `Input dimension mismatch: file has ${arch.inputNodes}, app expects ${INPUT_NODES}`
        };
      }
      if (arch.outputNodes !== OUTPUT_NODES) {
        return {
          success: false,
          error: `Output dimension mismatch: file has ${arch.outputNodes}, app expects ${OUTPUT_NODES}`
        };
      }
      if (!Array.isArray(arch.hiddenLayers) || arch.hiddenLayers.length < 1 || arch.hiddenLayers.length > 5) {
        return {
          success: false,
          error: `Invalid hidden layers: must have 1-5 hidden layers`
        };
      }

      return {
        success: true,
        genome: {
          id: data.id || `imported-${Date.now()}`,
          network: data.network,
          fitness: data.fitness || 0,
          matchesWon: data.matchesWon || 0
        },
        generation: data.generation || 1,
        importedArchitecture: arch as NNArchitecture
      };
    }

    // Legacy format not supported
    return {
      success: false,
      error: 'Legacy genome format not supported. Please export a new genome with v3.0.1+.'
    };
  } catch (error) {
    console.error('Failed to import genome:', error);
    return { success: false, error: 'Failed to parse file. Is this a valid JSON file?' };
  }
};
