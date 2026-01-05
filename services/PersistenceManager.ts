/**
 * =============================================================================
 * PERSISTENCE MANAGER
 * =============================================================================
 * 
 * Handles saving and loading of application state to localStorage.
 * Ensures user progress (settings, trained AI) is preserved across sessions.
 */

import type { TrainingSettings, Genome } from '../types';
import { FeedForwardNetwork } from '../classes/FeedForwardNetwork';

const KEYS = {
    SETTINGS: 'neuroevolution_settings_v1',
    BEST_GENOME: 'neuroevolution_best_genome_v1',
    POPULATION: 'neuroevolution_population_v1',
    FITNESS_HISTORY: 'neuroevolution_fitness_history_v1',
    TRAINING_STATE: 'neuroevolution_training_state_v1'
};

// Serialized genome structure (matches what we store in localStorage)
interface SerializedGenome {
    id: string;
    fitness: number;
    matchesWon: number;
    network: ReturnType<FeedForwardNetwork['toJSON']>;
}

// Fitness history entry for chart persistence
export interface FitnessHistoryEntry {
    gen: number;
    fitness: number;
    mutationRate: number;
}

// Training state metadata for resuming
export interface TrainingStateMetadata {
    generation: number;
    bestFitness: number;
    currentMutationRate: number;
    recentBestFitness: number[];
}

// --- SETTINGS PERSISTENCE ---

export const saveSettings = (settings: TrainingSettings): void => {
    try {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
        console.warn('Failed to save settings:', e);
    }
};

export const loadSettings = (): Partial<TrainingSettings> | null => {
    try {
        const data = localStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.warn('Failed to load settings:', e);
        return null;
    }
};

// --- GENOME PERSISTENCE ---

/**
 * Serializes a Genome object, ensuring the NeuralNetwork class is properly handled.
 */
const serializeGenome = (genome: Genome): SerializedGenome => {
    // Check if network has toJSON method (FeedForwardNetwork instance)
    // Otherwise treat it as plain NeuralNetworkData
    const networkData = typeof (genome.network as unknown as { toJSON?: () => unknown }).toJSON === 'function'
        ? (genome.network as unknown as FeedForwardNetwork).toJSON()
        : genome.network;

    return {
        id: genome.id,
        fitness: genome.fitness,
        matchesWon: genome.matchesWon,
        network: networkData as ReturnType<FeedForwardNetwork['toJSON']>
    };
};

/**
 * Deserializes a Genome object, converting the saved network data back to
 * a plain NeuralNetworkData object that crossoverNetworks can use.
 * 
 * Handles two formats:
 * 1. FeedForwardNetwork format (older): { inputWeights, outputWeights, biases }
 *    - Missing hiddenWeights, needs to be created as empty
 * 2. NeuralNetworkData format (current): { inputWeights, hiddenWeights, outputWeights, biases }
 */
const deserializeGenome = (data: SerializedGenome): Genome => {
    const savedNetwork = data.network;

    // Check if it's the old FeedForwardNetwork format (no hiddenWeights)
    // or the new NeuralNetworkData format (has hiddenWeights)
    const hasHiddenWeights = 'hiddenWeights' in savedNetwork &&
        Array.isArray((savedNetwork as { hiddenWeights?: unknown }).hiddenWeights);

    let network: import('../types').NeuralNetworkData;

    if (hasHiddenWeights) {
        // Already in NeuralNetworkData format
        network = savedNetwork as unknown as import('../types').NeuralNetworkData;
    } else {
        // Old FeedForwardNetwork format - add empty hiddenWeights
        // This handles legacy saved data that lacks hiddenWeights
        const inputWeights = savedNetwork.inputWeights || [];
        const outputWeights = savedNetwork.outputWeights || [];
        const biases = savedNetwork.biases || [];

        // Create hiddenWeights with same dimensions as output layer expects
        // For legacy data, create identity-like hidden layer
        const hiddenSize = inputWeights[0]?.length || 13;
        const hiddenWeights = Array(hiddenSize).fill(0).map(() =>
            Array(hiddenSize).fill(0).map(() => Math.random() * 0.2 - 0.1)
        );

        network = {
            inputWeights,
            hiddenWeights,
            outputWeights,
            biases
        };
    }

    return {
        id: data.id,
        fitness: data.fitness,
        matchesWon: data.matchesWon,
        network
    };
};

export const saveBestGenome = (genome: Genome): void => {
    try {
        const serialized = serializeGenome(genome);
        localStorage.setItem(KEYS.BEST_GENOME, JSON.stringify(serialized));
    } catch (e) {
        console.warn('Failed to save best genome:', e);
    }
};

export const loadBestGenome = (): Genome | null => {
    try {
        const data = localStorage.getItem(KEYS.BEST_GENOME);
        if (!data) return null;
        return deserializeGenome(JSON.parse(data));
    } catch (e) {
        console.warn('Failed to load best genome:', e);
        return null;
    }
};

// Optional: Save entire population if needed (might be heavy)
export const savePopulation = (population: Genome[]): void => {
    try {
        // Limit population save to avoid quota limits if too large
        // Saving top 50 is likely safe (approx 100KB)
        const serialized = population.map(serializeGenome);
        localStorage.setItem(KEYS.POPULATION, JSON.stringify(serialized));
    } catch (e) {
        console.warn('Failed to save population:', e);
    }
};

export const loadPopulation = (): Genome[] | null => {
    try {
        const data = localStorage.getItem(KEYS.POPULATION);
        if (!data) return null;
        return JSON.parse(data).map(deserializeGenome);
    } catch (e) {
        console.warn('Failed to load population:', e);
        return null;
    }
};

// --- FITNESS HISTORY PERSISTENCE ---

export const saveFitnessHistory = (history: FitnessHistoryEntry[]): void => {
    try {
        // Keep only last 50 entries to avoid bloating storage
        const trimmed = history.slice(-50);
        localStorage.setItem(KEYS.FITNESS_HISTORY, JSON.stringify(trimmed));
    } catch (e) {
        console.warn('Failed to save fitness history:', e);
    }
};

export const loadFitnessHistory = (): FitnessHistoryEntry[] | null => {
    try {
        const data = localStorage.getItem(KEYS.FITNESS_HISTORY);
        if (!data) return null;
        return JSON.parse(data);
    } catch (e) {
        console.warn('Failed to load fitness history:', e);
        return null;
    }
};

// --- TRAINING STATE PERSISTENCE ---

export const saveTrainingState = (state: TrainingStateMetadata): void => {
    try {
        localStorage.setItem(KEYS.TRAINING_STATE, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save training state:', e);
    }
};

export const loadTrainingState = (): TrainingStateMetadata | null => {
    try {
        const data = localStorage.getItem(KEYS.TRAINING_STATE);
        if (!data) return null;
        return JSON.parse(data);
    } catch (e) {
        console.warn('Failed to load training state:', e);
        return null;
    }
};

// --- CLEAR GENOME STORAGE ---

/**
 * Clears all genome-related data from localStorage.
 * This includes settings, best genome, population, fitness history, and training state.
 * Does NOT clear custom scripts or disclaimer acceptance.
 */
export const clearGenomeStorage = (): void => {
    try {
        localStorage.removeItem(KEYS.SETTINGS);
        localStorage.removeItem(KEYS.BEST_GENOME);
        localStorage.removeItem(KEYS.POPULATION);
        localStorage.removeItem(KEYS.FITNESS_HISTORY);
        localStorage.removeItem(KEYS.TRAINING_STATE);
    } catch (e) {
        console.warn('Failed to clear genome storage:', e);
    }
};
