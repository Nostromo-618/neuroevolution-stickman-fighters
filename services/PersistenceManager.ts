/**
 * =============================================================================
 * PERSISTENCE MANAGER
 * =============================================================================
 * 
 * Handles saving and loading of application state to localStorage.
 * Ensures user progress (settings, trained AI) is preserved across sessions.
 */

import { TrainingSettings } from '../types';
import { Genome } from '../types';
import { FeedForwardNetwork } from '../classes/FeedForwardNetwork';

const KEYS = {
    SETTINGS: 'neuroevolution_settings_v1',
    BEST_GENOME: 'neuroevolution_best_genome_v1',
    POPULATION: 'neuroevolution_population_v1' // Optional: Save full state
};

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
const serializeGenome = (genome: Genome): any => {
    return {
        ...genome,
        network: genome.network // Use class-specific serialization
    };
};

/**
 * Deserializes a Genome object, reconstructing the FeedForwardNetwork class.
 */
const deserializeGenome = (data: any): Genome => {
    const network = new FeedForwardNetwork(data.network.id || 'restored');
    network.fromJSON(data.network);

    return {
        ...data,
        network: network
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

// --- CLEAR GENOME STORAGE ---

/**
 * Clears all genome-related data from localStorage.
 * This includes settings, best genome, and population.
 * Does NOT clear custom scripts or disclaimer acceptance.
 */
export const clearGenomeStorage = (): void => {
    try {
        localStorage.removeItem(KEYS.SETTINGS);
        localStorage.removeItem(KEYS.BEST_GENOME);
        localStorage.removeItem(KEYS.POPULATION);
    } catch (e) {
        console.warn('Failed to clear genome storage:', e);
    }
};
