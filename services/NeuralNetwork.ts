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
 *   HIDDEN LAYER (10 neurons, ReLU activation)
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

import { NeuralNetworkData } from '../types';

import { NN_ARCH } from './Config';

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
 * @returns A new NeuralNetwork with random weights and biases
 */
export const createRandomNetwork = (): NeuralNetworkData => {
  // Input → Hidden weights (9 inputs × 16 hidden = 144 weights)
  const inputWeights = Array(INPUT_NODES).fill(0).map(() =>
    Array(HIDDEN_NODES).fill(0).map(() => Math.random() * 2 - 1)
  );

  // Hidden → Output weights (16 hidden × 8 outputs = 128 weights)
  const outputWeights = Array(HIDDEN_NODES).fill(0).map(() =>
    Array(OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1)
  );

  // Biases: one per neuron in hidden and output layers (16 + 8 = 24)
  const biases = Array(HIDDEN_NODES + OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1);

  return { inputWeights, outputWeights, biases };
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
 *      sum = Σ(hidden[h] × outputWeight[h][o]) + bias[HIDDEN_NODES + o]
 *      output[o] = sigmoid(sum)
 * 
 * Time Complexity: O(INPUT × HIDDEN + HIDDEN × OUTPUT)
 * For our network: O(9×10 + 10×8) = O(170) operations per call
 * 
 * @param network - The neural network to use
 * @param inputs - Array of 9 normalized input values
 * @returns Array of 8 output values (0-1 each)
 */
export const predict = (network: NeuralNetworkData, inputs: number[]): number[] => {
  // --- STEP 1: Input → Hidden Layer ---
  const hiddenOutputs: number[] = [];
  for (let h = 0; h < HIDDEN_NODES; h++) {
    let sum = 0;
    // Weighted sum of all inputs
    for (let i = 0; i < INPUT_NODES; i++) {
      sum += inputs[i] * network.inputWeights[i][h];
    }
    // Add bias and apply ReLU activation
    sum += network.biases[h];
    hiddenOutputs.push(relu(sum));
  }

  // --- STEP 2: Hidden → Output Layer ---
  const finalOutputs: number[] = [];
  for (let o = 0; o < OUTPUT_NODES; o++) {
    let sum = 0;
    // Weighted sum of hidden layer outputs
    for (let h = 0; h < HIDDEN_NODES; h++) {
      sum += hiddenOutputs[h] * network.outputWeights[h][o];
    }
    // Add bias and apply Sigmoid activation
    // (biases for output layer start at index HIDDEN_NODES)
    sum += network.biases[HIDDEN_NODES + o];
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
  const newOutputWeights = network.outputWeights.map(row => row.map(mutateValue));
  const newBiases = network.biases.map(mutateValue);

  return {
    inputWeights: newInputWeights,
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
    row.map((val, j) => mix(val, b.inputWeights[i][j]))
  );

  const newOutputWeights = a.outputWeights.map((row, i) =>
    row.map((val, j) => mix(val, b.outputWeights[i][j]))
  );

  const newBiases = a.biases.map((val, i) => mix(val, b.biases[i]));

  return {
    inputWeights: newInputWeights,
    outputWeights: newOutputWeights,
    biases: newBiases
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
    const fileHidden = data.network.outputWeights.length;
    const fileBiases = data.network.biases.length;

    if (data.network.inputWeights.length !== INPUT_NODES) {
      return {
        success: false,
        error: `Input dimension mismatch: file has ${data.network.inputWeights.length}, app expects ${INPUT_NODES}`
      };
    }
    if (fileHidden !== HIDDEN_NODES) {
      return {
        success: false,
        error: `Architecture mismatch: file has ${fileHidden} hidden neurons, app expects ${HIDDEN_NODES}. This file was exported from an older version.`
      };
    }
    if (fileBiases !== HIDDEN_NODES + OUTPUT_NODES) {
      return {
        success: false,
        error: `Bias count mismatch: file has ${fileBiases}, app expects ${HIDDEN_NODES + OUTPUT_NODES}`
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