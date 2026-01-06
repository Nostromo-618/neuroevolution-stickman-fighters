/**
 * =============================================================================
 * NEURAL NETWORK SERVICE
 * =============================================================================
 * 
 * This module implements a simple feedforward neural network for controlling
 * AI fighters. The network architecture is:
 * 
 *   INPUT LAYER (9 neurons)
 *        ↓ (weights + biases)
 *   HIDDEN LAYER 1 (13 neurons, ReLU activation)
 *        ↓ (weights + biases)
 *   HIDDEN LAYER 2 (13 neurons, ReLU activation)
 *        ↓ (weights + biases)
 *   OUTPUT LAYER (8 neurons, Sigmoid activation)
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
 * By adjusting the weights and biases, the network learns to produce
 * desired outputs for given inputs.
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
 * This approach is great for game AI because:
 * - No need for training data
 * - Fitness comes directly from gameplay results
 * - Can discover unexpected strategies
 * 
 * =============================================================================
 */

import type { NeuralNetworkData, NNArchitecture, FlexibleNeuralNetworkData } from '../types';

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
 * HIDDEN_NODES: Number of neurons in the hidden layer
 * 
 * The hidden layer is where "reasoning" happens.
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
// NETWORK CREATION
// =============================================================================

/**
 * Creates a new neural network with random weights
 *
 * Weight Initialization Strategy:
 * - All weights are randomly initialized between -1 and 1
 * - This range allows for both positive (excitatory) and negative (inhibitory) connections
 * - The distribution centers around 0 to prevent initial bias
 *
 * Why random initialization?
 * - Provides diversity in the initial population
 * - Each genome starts with a unique "personality"
 * - Natural selection will determine which random configurations work best
 *
 * Architecture Selection:
 * - If customArch is provided, uses that architecture
 * - Otherwise reads from localStorage via getCurrentArchitecture()
 * - Falls back to default 9→13→13→8 if nothing saved
 *
 * @param customArch - Optional custom architecture to use
 * @returns A new FlexibleNeuralNetworkData with random weights and biases
 */
export const createRandomNetwork = (customArch?: NNArchitecture): FlexibleNeuralNetworkData => {
  // Use provided architecture, or load from persistence, or fall back to default
  const arch = customArch ?? getCurrentArchitecture();

  // Create flexible network that supports 1-5 hidden layers
  return createNetworkFromArchitecture(arch);
};

/**
 * Creates a neural network with a configurable number of hidden nodes.
 *
 * @param hiddenNodes - Number of hidden layer neurons
 * @returns A new NeuralNetwork with random weights and biases
 */
export const createRandomNetworkWithArch = (hiddenNodes: number): NeuralNetworkData => {
  // Input → Hidden 1 weights
  const inputWeights = Array(INPUT_NODES).fill(0).map(() =>
    Array(hiddenNodes).fill(0).map(() => Math.random() * 2 - 1)
  );

  // Hidden 1 → Hidden 2 weights
  const hiddenWeights = Array(hiddenNodes).fill(0).map(() =>
    Array(hiddenNodes).fill(0).map(() => Math.random() * 2 - 1)
  );

  // Hidden 2 → Output weights
  const outputWeights = Array(hiddenNodes).fill(0).map(() =>
    Array(OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1)
  );

  // Biases: one per neuron in H1, H2, and output layers
  const biases = Array(hiddenNodes * 2 + OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1);

  return { inputWeights, hiddenWeights, outputWeights, biases };
};

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
 * - Large positive inputs → ~1
 * - Large negative inputs → ~0
 * - Used in output layer to produce probability-like values
 * 
 * Why sigmoid for outputs?
 * - We need values between 0 and 1 to decide action activation
 * - If output > 0.5, the action is triggered
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
 * - Introduces non-linearity
 * 
 * Why ReLU for hidden layer?
 * - Efficient computation (important for real-time games)
 * - Works well in practice for most tasks
 * - Allows network to learn non-linear relationships
 * 
 * @param t - Input value
 * @returns 0 if negative, otherwise returns input unchanged
 */
export const relu = (t: number) => Math.max(0, t);

// =============================================================================
// FORWARD PROPAGATION (PREDICTION)
// =============================================================================

/**
 * Runs the neural network forward pass (prediction)
 * 
 * This is the core inference function. Given game state inputs,
 * it computes which actions the AI wants to take.
 * 
 * Algorithm (Forward Propagation):
 * 
 * 1. HIDDEN LAYER COMPUTATION
 *    For each hidden neuron h:
 *      sum = Σ(input[i] × inputWeight[i][h]) + bias[h]
 *      hidden[h] = ReLU(sum)
 * 
 * 2. OUTPUT LAYER COMPUTATION
 *    For each output neuron o:
 *      sum = Σ(hidden[h] × outputWeight[h][o]) + bias[hiddenNodes + o]
 *      output[o] = sigmoid(sum)
 * 
 * Time Complexity: O(INPUT × HIDDEN + HIDDEN × OUTPUT)
 * 
 * @param network - The neural network to use
 * @param inputs - Array of 9 normalized input values
 * @returns Array of 8 output values (0-1 each)
 */
export const predict = (network: NeuralNetworkData, inputs: number[]): number[] => {
  // Dynamically read hidden node count from network structure
  // This allows the function to work with different architectures
  const hiddenNodes = network.inputWeights[0]?.length || HIDDEN_NODES;

  // --- STEP 1: Input → Hidden Layer 1 ---
  const hidden1Outputs: number[] = [];
  for (let h = 0; h < hiddenNodes; h++) {
    let sum = 0;
    // Weighted sum of all inputs
    for (let i = 0; i < INPUT_NODES; i++) {
      sum += (inputs[i] ?? 0) * (network.inputWeights[i]?.[h] ?? 0);
    }
    // Add bias and apply ReLU activation
    sum += network.biases[h] ?? 0;
    hidden1Outputs.push(relu(sum));
  }

  // --- STEP 2: Hidden Layer 1 → Hidden Layer 2 ---
  let hidden2Outputs: number[];

  if (network.hiddenWeights) {
    hidden2Outputs = [];
    for (let h2 = 0; h2 < hiddenNodes; h2++) {
      let sum = 0;
      // Weighted sum of hidden layer 1 outputs
      for (let h1 = 0; h1 < hiddenNodes; h1++) {
        sum += (hidden1Outputs[h1] ?? 0) * (network.hiddenWeights[h1]?.[h2] ?? 0);
      }
      // Add bias (offset by hiddenNodes) and apply ReLU activation
      sum += network.biases[hiddenNodes + h2] ?? 0;
      hidden2Outputs.push(relu(sum));
    }
  } else {
    // BACKWARD COMPATIBILITY:
    // If hiddenWeights is missing, this is an old 1-hidden-layer network.
    // Treat H1 outputs as H2 outputs directly (pass-through).
    // The "outputWeights" in the old network connect H1 -> Output.
    // Here we connect H2 (which is H1) -> Output, so it works.
    hidden2Outputs = hidden1Outputs;
  }

  // --- STEP 3: Hidden Layer 2 → Output Layer ---
  const finalOutputs: number[] = [];
  for (let o = 0; o < OUTPUT_NODES; o++) {
    let sum = 0;
    // Weighted sum of hidden layer 2 outputs
    for (let h = 0; h < hiddenNodes; h++) {
      sum += (hidden2Outputs[h] ?? 0) * (network.outputWeights[h]?.[o] ?? 0);
    }
    // Add bias and apply Sigmoid activation
    // (biases for output layer start at index hiddenNodes * 2)
    sum += network.biases[hiddenNodes * 2 + o] ?? 0;
    finalOutputs.push(sigmoid(sum));
  }

  return finalOutputs;
};

// =============================================================================
// GENETIC OPERATIONS
// =============================================================================

/**
 * Mutates a neural network by randomly adjusting weights
 * 
 * MUTATION IN GENETIC ALGORITHMS:
 * Mutation introduces small random changes to maintain genetic diversity.
 * Without mutation, the population could get stuck in local optima.
 * 
 * Our mutation strategy:
 * - For each weight, there's a `rate` probability it will be mutated
 * - If mutated, the weight is "nudged" by a small random amount (-0.25 to +0.25)
 * - This allows gradual refinement rather than drastic changes
 * 
 * Mutation Rate Guidelines:
 * - High (>20%): More exploration, faster adaptation, but less stable
 * - Low (<5%): More exploitation, slower adaptation, but more stable
 * - We use adaptive mutation: starts high (25%) and decays to (5%) over generations
 * 
 * @param network - The network to mutate
 * @param rate - Probability of mutating each weight (0-1)
 * @returns A new mutated network (original is not modified)
 */
export const mutateNetwork = (network: NeuralNetworkData, rate: number): NeuralNetworkData => {
  // Helper function to potentially mutate a single weight
  const mutateValue = (val: number) => {
    if (Math.random() < rate) {
      // 10% chance of "big mutation" for exploration (helps escape local optima)
      if (Math.random() < 0.1) {
        // Big mutation: ±2.0 range
        return val + (Math.random() * 4.0 - 2.0);
      }
      // Normal mutation: ±0.5 range (doubled from ±0.25)
      // Scale by rate - higher rate means bigger changes
      const magnitude = 0.5 + (rate * 0.5); // 0.5 to 1.0 based on rate
      return val + (Math.random() * 2 * magnitude - magnitude);
    }
    return val;
  };

  // Apply mutation to all weights and biases
  const newInputWeights = network.inputWeights.map(row => row.map(mutateValue));
  const newHiddenWeights = network.hiddenWeights.map(row => row.map(mutateValue));
  const newOutputWeights = network.outputWeights.map(row => row.map(mutateValue));
  const newBiases = network.biases.map(mutateValue);

  return {
    inputWeights: newInputWeights,
    hiddenWeights: newHiddenWeights,
    outputWeights: newOutputWeights,
    biases: newBiases
  };
};

/**
 * Combines two parent networks to create a child network (Crossover)
 * 
 * CROSSOVER IN GENETIC ALGORITHMS:
 * Crossover (also called recombination) combines genes from two parents.
 * This allows beneficial traits from both parents to be inherited.
 * 
 * Our crossover strategy (Uniform Crossover):
 * - For each weight, randomly pick from parent A (50%) or parent B (50%)
 * - This creates a child that's a "mix" of both parents
 * 
 * Why uniform crossover?
 * - Simple and effective
 * - Allows any combination of parent traits
 * - Works well when we don't know which weights are related
 * 
 * Alternative strategies (not used here):
 * - Single-point crossover: Split at one point
 * - Multi-point crossover: Split at multiple points
 * - Blend crossover: Average the weights
 * 
 * @param a - Parent A network
 * @param b - Parent B network
 * @returns A new child network with mixed weights
 */
export const crossoverNetworks = (a: NeuralNetworkData, b: NeuralNetworkData): NeuralNetworkData => {
  // Helper to randomly pick from parent A or B
  const mix = (w1: number, w2: number) => Math.random() > 0.5 ? w1 : w2;

  const newInputWeights = a.inputWeights.map((row, i) =>
    row.map((val, j) => mix(val, b.inputWeights[i]?.[j] ?? val))
  );

  const newHiddenWeights = a.hiddenWeights.map((row, i) =>
    row.map((val, j) => mix(val, b.hiddenWeights[i]?.[j] ?? val))
  );

  const newOutputWeights = a.outputWeights.map((row, i) =>
    row.map((val, j) => mix(val, b.outputWeights[i]?.[j] ?? val))
  );

  const newBiases = a.biases.map((val, i) => mix(val, b.biases[i] ?? val));

  return {
    inputWeights: newInputWeights,
    hiddenWeights: newHiddenWeights,
    outputWeights: newOutputWeights,
    biases: newBiases
  };
};

// =============================================================================
// FLEXIBLE ARCHITECTURE FUNCTIONS
// =============================================================================

/**
   * Creates a new neural network with random weights for a given architecture.
   *
   * Weight Initialization Strategy:
   * - All weights are randomly initialized between -1 and 1
   * - This range allows for both positive and negative connections
   *
   * @param arch - The architecture defining layer sizes
   * @returns A new FlexibleNeuralNetworkData with random weights and biases
   */
export const createNetworkFromArchitecture = (arch: NNArchitecture): FlexibleNeuralNetworkData => {
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
 * Runs the neural network forward pass for flexible architectures.
 *
 * Supports any number of hidden layers (1-5).
 * Uses ReLU activation for hidden layers and Sigmoid for output.
 *
 * @param network - The flexible neural network
 * @param inputs - Array of input values (must match architecture.inputNodes length)
 * @returns Array of output values (0-1 each)
 */
export const predictFlexible = (network: FlexibleNeuralNetworkData, inputs: number[]): number[] => {
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

/**
 * Mutates a flexible neural network by randomly adjusting weights.
 *
 * @param network - The network to mutate
 * @param rate - Probability of mutating each weight (0-1)
 * @returns A new mutated network (original is not modified)
 */
export const mutateFlexible = (
  network: FlexibleNeuralNetworkData,
  rate: number
): FlexibleNeuralNetworkData => {
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
 * IMPORTANT: Both parents must have the same architecture.
 * If architectures differ, parent A is returned unchanged.
 *
 * Uses uniform crossover: for each weight, randomly pick from parent A or B.
 *
 * @param a - Parent A network
 * @param b - Parent B network
 * @returns A new child network with mixed weights
 */
export const crossoverFlexible = (
  a: FlexibleNeuralNetworkData,
  b: FlexibleNeuralNetworkData
): FlexibleNeuralNetworkData => {
  // Verify architectures match
  const aLayers = a.architecture.hiddenLayers;
  const bLayers = b.architecture.hiddenLayers;

  if (aLayers.length !== bLayers.length ||
    !aLayers.every((size, i) => size === bLayers[i])) {
    console.warn('Crossover attempted with incompatible architectures, returning parent A');
    return { ...a, layerWeights: a.layerWeights.map(l => l.map(r => [...r])), biases: a.biases.map(b => [...b]) };
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

/**
 * Converts a FlexibleNeuralNetworkData to legacy NeuralNetworkData format.
 *
 * Only works for 2-hidden-layer architectures.
 * Throws error if architecture has != 2 hidden layers.
 *
 * @param flexible - The flexible network to convert
 * @returns Legacy NeuralNetworkData
 */
export const flexibleToLegacy = (flexible: FlexibleNeuralNetworkData): NeuralNetworkData => {
  if (flexible.architecture.hiddenLayers.length !== 2) {
    throw new Error('Cannot convert to legacy format: architecture must have exactly 2 hidden layers');
  }

  // Non-null assertions are safe here because we've validated we have exactly 2 hidden layers
  // which means we have exactly 3 layer weight matrices (input->h1, h1->h2, h2->output)
  return {
    inputWeights: flexible.layerWeights[0]!,
    hiddenWeights: flexible.layerWeights[1]!,
    outputWeights: flexible.layerWeights[2]!,
    biases: flexible.biases.flat()
  };
};

/**
 * Converts legacy NeuralNetworkData to FlexibleNeuralNetworkData format.
 *
 * Infers architecture from weight matrix dimensions.
 *
 * @param legacy - The legacy network to convert
 * @returns FlexibleNeuralNetworkData
 */
export const legacyToFlexible = (legacy: NeuralNetworkData): FlexibleNeuralNetworkData => {
  const h1Size = legacy.inputWeights[0]?.length ?? HIDDEN_NODES;
  const h2Size = legacy.outputWeights.length ?? HIDDEN_NODES;

  const architecture: NNArchitecture = {
    inputNodes: 9,
    hiddenLayers: [h1Size, h2Size],
    outputNodes: 8
  };

  // Split flat biases array into per-layer arrays
  const biases: number[][] = [
    legacy.biases.slice(0, h1Size),
    legacy.biases.slice(h1Size, h1Size + h2Size),
    legacy.biases.slice(h1Size + h2Size)
  ];

  return {
    architecture,
    layerWeights: [legacy.inputWeights, legacy.hiddenWeights, legacy.outputWeights],
    biases
  };
};

// =============================================================================
// IMPORT/EXPORT UTILITIES
// =============================================================================

/**
 * Exports a genome to a JSON string for saving
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
      version: '1.1',
      architecture: {
        inputNodes: INPUT_NODES,
        hiddenNodes: HIDDEN_NODES,
        outputNodes: OUTPUT_NODES
      }
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
} | {
  success: false;
  error: string;
};

/**
 * Imports a genome from a JSON string
 * 
 * Validates the structure to ensure the JSON contains valid network data.
 * Returns a result object with either the genome or an error message.
 * 
 * Validation checks:
 * - Network object exists
 * - Weight matrices have correct dimensions
 * - Bias array has correct length
 * 
 * @param jsonString - JSON string to parse
 * @returns ImportResult with genome data or error message
 */
export const importGenome = (jsonString: string): ImportResult => {
  try {
    const data = JSON.parse(jsonString);

    // Validate structure
    if (!data.network || !data.network.inputWeights || !data.network.outputWeights || !data.network.biases) {
      return { success: false, error: 'Invalid file format: missing network data' };
    }

    // Check architecture compatibility
    const fileHidden = data.network.hiddenWeights?.length || data.network.outputWeights.length;
    // Adaptation for old format (if hiddenWeights missing, effectively 0 hiddens in between? No, standard is 2 layers now)
    // For now, if missing hiddenWeights, we fail or we could auto-upgrade. Let's auto-upgrade if possible.
    const hasSecondLayer = !!data.network.hiddenWeights;

    // If importing old V1 genome (1 hidden layer), we can't easily "upgrade" it without creating new random weights
    // So for now, we'll strict check.
    if (!hasSecondLayer) {
      return {
        success: false,
        error: `Architecture mismatch: file uses old 1-hidden-layer format. App now requires 2 hidden layers.`
      };
    }

    if (data.network.inputWeights.length !== INPUT_NODES) {
      return {
        success: false,
        error: `Input dimension mismatch: file has ${data.network.inputWeights.length}, app expects ${INPUT_NODES}`
      };
    }
    if (fileHidden !== HIDDEN_NODES) {
      return {
        success: false,
        error: `Architecture mismatch: file has ${fileHidden} hidden neurons, app expects ${HIDDEN_NODES}.`
      };
    }
    const expectedBiases = HIDDEN_NODES * 2 + OUTPUT_NODES;
    if (data.network.biases.length !== expectedBiases) {
      return {
        success: false,
        error: `Bias count mismatch: file has ${data.network.biases.length}, app expects ${expectedBiases}`
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
      generation: data.generation || 1
    };
  } catch (error) {
    console.error('Failed to import genome:', error);
    return { success: false, error: 'Failed to parse file. Is this a valid JSON file?' };
  }
};