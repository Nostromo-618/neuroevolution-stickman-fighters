/**
 * =============================================================================
 * NN ARCHITECTURE PERSISTENCE SERVICE
 * =============================================================================
 *
 * Handles saving and loading of custom neural network architectures to localStorage.
 * Ensures user-designed topologies persist across browser sessions.
 *
 * Storage key: 'neuroevolution_nn_architecture_v1'
 */

import type { NNArchitecture } from '../types';
import { DEFAULT_NN_ARCHITECTURE } from '../types';

const STORAGE_KEY = 'neuroevolution_nn_architecture_v1';

// Architecture constraints (enforced by UI and validated here)
export const NN_CONSTRAINTS = {
    MIN_HIDDEN_LAYERS: 1,
    MAX_HIDDEN_LAYERS: 5,
    MIN_NODES_PER_LAYER: 4,
    MAX_NODES_PER_LAYER: 50,
} as const;

/**
 * Validates an architecture against constraints.
 * Returns true if valid, false otherwise.
 */
export function isValidArchitecture(arch: NNArchitecture): boolean {
    // Check hidden layers count
    if (
        arch.hiddenLayers.length < NN_CONSTRAINTS.MIN_HIDDEN_LAYERS ||
        arch.hiddenLayers.length > NN_CONSTRAINTS.MAX_HIDDEN_LAYERS
    ) {
        return false;
    }

    // Check each layer's node count
    for (const nodeCount of arch.hiddenLayers) {
        if (
            nodeCount < NN_CONSTRAINTS.MIN_NODES_PER_LAYER ||
            nodeCount > NN_CONSTRAINTS.MAX_NODES_PER_LAYER ||
            !Number.isInteger(nodeCount)
        ) {
            return false;
        }
    }

    // Check fixed layers
    if (arch.inputNodes !== 12 || arch.outputNodes !== 8) {
        return false;
    }

    return true;
}

/**
 * Compares two architectures for topological compatibility.
 * Returns true if they have identical structure (same number of layers,
 * same number of nodes per layer).
 *
 * @param a - First architecture to compare
 * @param b - Second architecture to compare
 * @returns true if architectures are identical, false otherwise
 */
export function architecturesMatch(a: NNArchitecture, b: NNArchitecture): boolean {
    // Input/output nodes are fixed but check anyway for safety
    if (a.inputNodes !== b.inputNodes || a.outputNodes !== b.outputNodes) {
        return false;
    }

    // Check hidden layer count
    if (a.hiddenLayers.length !== b.hiddenLayers.length) {
        return false;
    }

    // Check each hidden layer has the same node count
    return a.hiddenLayers.every((size, i) => size === b.hiddenLayers[i]);
}

/**
 * Saves a custom architecture to localStorage.
 * Validates the architecture before saving.
 *
 * @param arch - The architecture to save
 * @throws Error if architecture is invalid
 */
export function saveArchitecture(arch: NNArchitecture): void {
    if (!isValidArchitecture(arch)) {
        console.error('Invalid architecture:', arch);
        throw new Error('Cannot save invalid architecture');
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arch));
    } catch (e) {
        console.warn('Failed to save architecture:', e);
    }
}

/**
 * Loads a custom architecture from localStorage.
 * Returns null if no saved architecture or if invalid.
 *
 * @returns The saved architecture or null
 */
export function loadArchitecture(): NNArchitecture | null {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;

        const parsed = JSON.parse(data) as NNArchitecture;

        // Validate loaded architecture
        if (!isValidArchitecture(parsed)) {
            console.warn('Loaded architecture is invalid, clearing storage');
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }

        return parsed;
    } catch (e) {
        console.warn('Failed to load architecture:', e);
        return null;
    }
}

/**
 * Returns the default architecture.
 * This is the legacy 9→13→13→8 topology.
 *
 * @returns Default NNArchitecture
 */
export function getDefaultArchitecture(): NNArchitecture {
    return { ...DEFAULT_NN_ARCHITECTURE };
}

/**
 * Returns the current architecture (loaded from storage or default).
 *
 * @returns Current active NNArchitecture
 */
export function getCurrentArchitecture(): NNArchitecture {
    return loadArchitecture() ?? getDefaultArchitecture();
}

/**
 * Clears the saved architecture, reverting to default.
 */
export function clearArchitecture(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn('Failed to clear architecture:', e);
    }
}

/**
 * Formats an architecture as a human-readable string.
 * e.g., "9 → 13 → 13 → 8"
 *
 * @param arch - The architecture to format
 * @returns Formatted string representation
 */
export function formatArchitecture(arch: NNArchitecture): string {
    const layers = [arch.inputNodes, ...arch.hiddenLayers, arch.outputNodes];
    return layers.join(' → ');
}

/**
 * Calculates the total number of parameters (weights + biases) in an architecture.
 * Useful for displaying complexity or enforcing max parameter limits.
 *
 * @param arch - The architecture to analyze
 * @returns Total parameter count
 */
export function calculateParameterCount(arch: NNArchitecture): number {
    const layers = [arch.inputNodes, ...arch.hiddenLayers, arch.outputNodes];
    let params = 0;

    for (let i = 0; i < layers.length - 1; i++) {
        const from = layers[i] ?? 0;
        const to = layers[i + 1] ?? 0;
        // Weights: from × to
        params += from * to;
        // Biases: one per target node
        params += to;
    }

    return params;
}
