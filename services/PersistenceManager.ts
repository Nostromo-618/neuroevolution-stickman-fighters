/**
 * =============================================================================
 * PERSISTENCE MANAGER
 * =============================================================================
 * 
 * Handles saving and loading of application state to localStorage.
 * Ensures user progress (settings, trained AI) is preserved across sessions.
 */

import type { TrainingSettings, Genome, NeuralNetworkData } from '../types';

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
    network: NeuralNetworkData;
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
 * Serializes a Genome object for localStorage persistence.
 */
const serializeGenome = (genome: Genome): SerializedGenome => {
    return {
        id: genome.id,
        fitness: genome.fitness,
        matchesWon: genome.matchesWon,
        network: genome.network
    };
};

/**
 * Deserializes a Genome object, converting the saved network data back to NeuralNetworkData.
 * 
 * Expects format: { architecture, layerWeights, biases }
 * Legacy formats are no longer supported - users must reset genome.
 */
const deserializeGenome = (data: SerializedGenome): Genome | null => {
    const savedNetwork = data.network;

    // Validate NeuralNetworkData format (has layerWeights and architecture)
    if ('layerWeights' in savedNetwork && 'architecture' in savedNetwork) {
        return {
            id: data.id,
            fitness: data.fitness,
            matchesWon: data.matchesWon,
            network: savedNetwork as unknown as NeuralNetworkData
        };
    }

    // Legacy format detected - cannot deserialize
    console.warn('Legacy genome format detected. Please reset genome to use new architecture.');
    return null;
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
        const genome = deserializeGenome(JSON.parse(data));
        if (!genome) {
            // Clear invalid legacy data
            localStorage.removeItem(KEYS.BEST_GENOME);
        }
        return genome;
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
        const parsed = JSON.parse(data) as SerializedGenome[];
        const deserialized = parsed.map(deserializeGenome).filter((g): g is Genome => g !== null);
        
        // If some genomes failed to deserialize (legacy format), clear and return null
        if (deserialized.length < parsed.length) {
            console.warn('Some genomes in legacy format - clearing population');
            localStorage.removeItem(KEYS.POPULATION);
            return null;
        }
        
        return deserialized;
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
