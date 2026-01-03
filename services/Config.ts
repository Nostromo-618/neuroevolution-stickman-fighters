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
// DEBUG FLAGS
// =============================================================================
export const DEBUG_FLAGS = {
    /** Enable verbose console logging for diagnosing simulation freezes */
    VERBOSE_LOGGING: true,  // Toggle this to enable/disable debug output
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================
export const FEATURE_FLAGS = {
    ENABLE_CHUCK_AI: false,    // Set to true to enable Chuck AI mode
} as const;

// =============================================================================
// NEURAL NETWORK ARCHITECTURE
// =============================================================================

/**
 * Standard Simple AI architecture (13 hidden nodes)
 */
export const NN_ARCH = {
    INPUT_NODES: 9,
    HIDDEN_NODES: 13,
    OUTPUT_NODES: 8,
} as const;

/**
 * Chuck AI architecture (32 hidden nodes for balanced performance)
 */
export const NN_ARCH_CHUCK = {
    INPUT_NODES: 9,
    HIDDEN_NODES: 32,
    OUTPUT_NODES: 8,
} as const;

// =============================================================================
// FIGHTER COLORS
// =============================================================================
export const COLORS = {
    HUMAN: '#22c55e',       // Green (Tailwind green-500)
    SIMPLE_AI: '#3b82f6',   // Blue (Tailwind blue-500)
    CHUCK_AI: '#f97316',    // Orange (Tailwind orange-500)
    CUSTOM_A: '#a855f7',    // Purple (Tailwind purple-500)
    CUSTOM_B: '#14b8a6',    // Teal (Tailwind teal-500)
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
    COST_JUMP: 15,
    COST_CROUCH: 0.5,
    COST_BLOCK: 0.5,
    COST_PUNCH: 10,
    COST_KICK: 20,
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

// =============================================================================
// MIRROR AI TRAINING SETTINGS
// =============================================================================
export const MIRROR_CONFIG = {
    HISTORY_SIZE: 150,           // Contextual history buffer size
    UPDATE_INTERVAL_FRAMES: 60,  // Train every 1 second (60fps × 1)
    LEARNING_RATE: 0.15,         // Aggressive for fast adaptation
    EPOCHS_PER_UPDATE: 2,        // Training passes per cycle
    RECENCY_DECAY: 0.95,         // Recent samples weighted higher
    MIN_SAMPLES: 20,             // Minimum samples before training starts
} as const;

