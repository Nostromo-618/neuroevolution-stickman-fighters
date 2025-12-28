/**
 * =============================================================================
 * CONFIG.TS - Centralized Application Configuration
 * =============================================================================
 * 
 * Centralized application settings and physics constants acting as a single 
 * source of truth.
 * 
 * All constants are Readonly to ensure immutability.
 */

// =============================================================================
// NEURAL NETWORK ARCHITECTURE
// =============================================================================
export const NN_ARCH = {
    INPUT_NODES: 9,
    HIDDEN_NODES: 13,
    OUTPUT_NODES: 8,
} as const;

// =============================================================================
// WORLD / PHYSICS CONSTANTS
// =============================================================================
export const WORLD = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 450,
    GRAVITY: 0.8,
    FRICTION: 0.85,
    GROUND_Y: 415,
} as const;

// =============================================================================
// FIGHTER ENERGY MECHANICS
// =============================================================================
export const ENERGY = {
    MAX: 100,
    REGEN_IDLE: 0.5,
    REGEN_ACTIVE: 0.2,
    COST_MOVE: 0.1,
    COST_JUMP: 10,
    COST_CROUCH: 0.5,
    COST_BLOCK: 0.5,
    COST_PUNCH: 10,
    COST_KICK: 50,
    PENALTY_HIT: 1,
} as const;

// =============================================================================
// TRAINING SETTINGS DEFAULTS
// =============================================================================
export const TRAINING_DEFAULTS = {
    POPULATION_SIZE: 48,
    MUTATION_RATE: 0.1,
    FPS: 60,
} as const;
