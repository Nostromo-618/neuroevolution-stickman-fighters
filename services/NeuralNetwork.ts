import { NeuralNetwork } from '../types';

// Simple Feed Forward Network: Inputs -> Hidden Layer -> Outputs
// Inputs: distanceX, distanceY, selfHealth, enemyHealth, enemyAction, selfEnergy, facingDirection, oppCooldown, oppEnergy
export const INPUT_NODES = 9; 
export const HIDDEN_NODES = 10; // Slightly increased complexity
export const OUTPUT_NODES = 8; // Corresponds to FighterAction enum

export const createRandomNetwork = (): NeuralNetwork => {
  const inputWeights = Array(INPUT_NODES).fill(0).map(() => 
    Array(HIDDEN_NODES).fill(0).map(() => Math.random() * 2 - 1)
  );
  
  const outputWeights = Array(HIDDEN_NODES).fill(0).map(() => 
    Array(OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1)
  );

  const biases = Array(HIDDEN_NODES + OUTPUT_NODES).fill(0).map(() => Math.random() * 2 - 1);

  return { inputWeights, outputWeights, biases };
};

const sigmoid = (t: number) => 1 / (1 + Math.exp(-t));
const relu = (t: number) => Math.max(0, t);

export const predict = (network: NeuralNetwork, inputs: number[]): number[] => {
  // Input -> Hidden
  const hiddenOutputs: number[] = [];
  for (let h = 0; h < HIDDEN_NODES; h++) {
    let sum = 0;
    for (let i = 0; i < INPUT_NODES; i++) {
      sum += inputs[i] * network.inputWeights[i][h];
    }
    sum += network.biases[h];
    hiddenOutputs.push(relu(sum));
  }

  // Hidden -> Output
  const finalOutputs: number[] = [];
  for (let o = 0; o < OUTPUT_NODES; o++) {
    let sum = 0;
    for (let h = 0; h < HIDDEN_NODES; h++) {
      sum += hiddenOutputs[h] * network.outputWeights[h][o];
    }
    sum += network.biases[HIDDEN_NODES + o];
    finalOutputs.push(sigmoid(sum));
  }

  return finalOutputs;
};

export const mutateNetwork = (network: NeuralNetwork, rate: number): NeuralNetwork => {
  const mutateValue = (val: number) => {
    if (Math.random() < rate) {
      return val + (Math.random() * 0.5 - 0.25); // Nudge weight
    }
    return val;
  };

  const newInputWeights = network.inputWeights.map(row => row.map(mutateValue));
  const newOutputWeights = network.outputWeights.map(row => row.map(mutateValue));
  const newBiases = network.biases.map(mutateValue);

  return {
    inputWeights: newInputWeights,
    outputWeights: newOutputWeights,
    biases: newBiases
  };
};

export const crossoverNetworks = (a: NeuralNetwork, b: NeuralNetwork): NeuralNetwork => {
  // Simple uniform crossover
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

// Export/Import utilities
export const exportGenome = (genome: { id: string; network: NeuralNetwork; fitness: number; matchesWon: number }): string => {
  return JSON.stringify({
    id: genome.id,
    network: genome.network,
    fitness: genome.fitness,
    matchesWon: genome.matchesWon,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }, null, 2);
};

export const importGenome = (jsonString: string): { id: string; network: NeuralNetwork; fitness: number; matchesWon: number } | null => {
  try {
    const data = JSON.parse(jsonString);
    
    // Validate structure
    if (!data.network || !data.network.inputWeights || !data.network.outputWeights || !data.network.biases) {
      throw new Error('Invalid genome format: missing network data');
    }
    
    // Validate dimensions
    if (data.network.inputWeights.length !== INPUT_NODES) {
      throw new Error(`Invalid input dimension: expected ${INPUT_NODES}, got ${data.network.inputWeights.length}`);
    }
    if (data.network.outputWeights.length !== HIDDEN_NODES) {
      throw new Error(`Invalid hidden dimension: expected ${HIDDEN_NODES}, got ${data.network.outputWeights.length}`);
    }
    if (data.network.biases.length !== HIDDEN_NODES + OUTPUT_NODES) {
      throw new Error(`Invalid bias dimension: expected ${HIDDEN_NODES + OUTPUT_NODES}, got ${data.network.biases.length}`);
    }
    
    return {
      id: data.id || `imported-${Date.now()}`,
      network: data.network,
      fitness: data.fitness || 0,
      matchesWon: data.matchesWon || 0
    };
  } catch (error) {
    console.error('Failed to import genome:', error);
    return null;
  }
};