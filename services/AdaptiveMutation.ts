/**
 * =============================================================================
 * ADAPTIVE MUTATION - Smart Mutation Rate Strategy (STANDARD Rule 4)
 * =============================================================================
 * 
 * Implements a combined adaptive mutation strategy:
 * 1. Base decay: Starts at 30%, decays to 5% floor over generations
 * 2. Plateau detection: If no fitness improvement for N generations, spike back up
 * 3. Periodic oscillation: Every M generations, add a mini-spike to escape local minima
 */

// Configuration constants (Rule 8: No magic values)
const ADAPTIVE_MUTATION_CONFIG = {
    /** Initial mutation rate (30%) */
    INITIAL_RATE: 0.30,
    /** Minimum mutation rate floor (5%) */
    FLOOR_RATE: 0.05,
    /** Decay per generation (0.8% per gen) */
    DECAY_PER_GEN: 0.008,
    /** Generations without improvement to trigger plateau spike */
    PLATEAU_THRESHOLD: 5,
    /** Mutation rate to spike to on plateau (20%) */
    PLATEAU_SPIKE_RATE: 0.20,
    /** Interval for periodic mini-spikes (every 25 generations) */
    OSCILLATION_INTERVAL: 25,
    /** Mini-spike boost amount (5%) */
    OSCILLATION_BOOST: 0.05,
    /** Maximum rate cap (35%) */
    MAX_RATE: 0.35
} as const;

export interface MutationContext {
    /** Current generation number */
    generation: number;
    /** History of recent best fitness values (most recent last) */
    fitnessHistory: number[];
}

/**
 * Detects if fitness has stagnated (plateau)
 * @returns true if no significant improvement in last N generations
 */
function detectPlateau(fitnessHistory: number[]): boolean {
    if (fitnessHistory.length < ADAPTIVE_MUTATION_CONFIG.PLATEAU_THRESHOLD) {
        return false;
    }

    const recentHistory = fitnessHistory.slice(-ADAPTIVE_MUTATION_CONFIG.PLATEAU_THRESHOLD);
    const oldest = recentHistory[0] ?? 0;
    const newest = recentHistory[recentHistory.length - 1] ?? 0;

    // Consider it a plateau if improvement is less than 1%
    const improvement = newest - oldest;
    const improvementRatio = oldest > 0 ? improvement / oldest : improvement;

    return improvementRatio < 0.01;
}

/**
 * Checks if we're at an oscillation interval (periodic spike)
 */
function isOscillationPoint(generation: number): boolean {
    return generation > 0 && generation % ADAPTIVE_MUTATION_CONFIG.OSCILLATION_INTERVAL === 0;
}

/**
 * Calculate the base decay rate (without spikes)
 */
function calculateBaseDecayRate(generation: number): number {
    const decayed = ADAPTIVE_MUTATION_CONFIG.INITIAL_RATE - (generation * ADAPTIVE_MUTATION_CONFIG.DECAY_PER_GEN);
    return Math.max(ADAPTIVE_MUTATION_CONFIG.FLOOR_RATE, decayed);
}

/**
 * Calculate the smart adaptive mutation rate
 * 
 * Strategy:
 * 1. Start with base decay rate
 * 2. If plateau detected, spike to PLATEAU_SPIKE_RATE
 * 3. If at oscillation interval, add OSCILLATION_BOOST
 * 4. Clamp between FLOOR_RATE and MAX_RATE
 * 
 * @param ctx - Context containing generation and fitness history
 * @returns The calculated mutation rate (0-1)
 */
export function calculateAdaptiveMutationRate(ctx: MutationContext): number {
    let rate = calculateBaseDecayRate(ctx.generation);

    // Check for plateau (stagnation)
    const isPlateau = detectPlateau(ctx.fitnessHistory);
    if (isPlateau) {
        rate = Math.max(rate, ADAPTIVE_MUTATION_CONFIG.PLATEAU_SPIKE_RATE);
    }

    // Apply periodic oscillation boost
    if (isOscillationPoint(ctx.generation)) {
        rate += ADAPTIVE_MUTATION_CONFIG.OSCILLATION_BOOST;
    }

    // Clamp to valid range
    return Math.max(
        ADAPTIVE_MUTATION_CONFIG.FLOOR_RATE,
        Math.min(ADAPTIVE_MUTATION_CONFIG.MAX_RATE, rate)
    );
}

/**
 * Simple decay-only mutation rate (for backward compatibility or manual mode)
 */
export function calculateSimpleDecayRate(generation: number): number {
    return calculateBaseDecayRate(generation);
}

export { ADAPTIVE_MUTATION_CONFIG };
