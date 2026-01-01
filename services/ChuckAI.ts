/**
 * =============================================================================
 * CHUCK AI SERVICE - Adaptive Mirror AI Opponent System
 * =============================================================================
 * 
 * Chuck AI is an advanced opponent that uses "Mirror Learning":
 * 1. Records and analyzes opponent moves
 * 2. Creates a "Mirror AI" that mimics opponent fighting style
 * 3. Trains Chuck against this Mirror AI in background
 * 4. Chuck evolves strategies specifically countering the opponent
 * 
 * This creates an opponent that adapts to the player's fighting style,
 * making Chuck progressively harder as it learns their patterns.
 * =============================================================================
 */

import type { Genome, InputState, NeuralNetworkData } from '../types';
import { createChuckNetwork, crossoverNetworks, mutateNetwork, predict } from './NeuralNetwork';
import { NN_ARCH_CHUCK } from './Config';

// =============================================================================
// CONSTANTS
// =============================================================================

const HISTORY_BUFFER_SIZE = 100;       // Number of opponent moves to track
const MIRROR_UPDATE_INTERVAL = 10;     // Update mirror after N new moves
const BACKGROUND_TRAINING_MATCHES = 5; // Matches per training cycle

// Real-time training constants (Rule #2: bounded iteration)
const REALTIME_TRAINING_INTERVAL = 120;    // Train every 2 seconds (60fps × 2)
const REALTIME_TRAINING_VARIANTS = 2;      // Fewer variants for speed

// =============================================================================
// TYPES
// =============================================================================

interface ChuckAIState {
    chuckGenome: Genome;                  // Chuck's current neural network
    mirrorGenome: Genome | null;          // Generated opponent mimic
    opponentHistory: InputState[];        // Sliding window of opponent actions
    trainingIterations: number;           // How many background matches run
    movesSinceLastUpdate: number;         // Counter for mirror updates
    framesSinceTraining: number;          // Counter for real-time training
}

// =============================================================================
// GLOBAL STATE (Module-level singleton)
// =============================================================================

let chuckState: ChuckAIState | null = null;

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Initialize Chuck AI with a fresh genome.
 * Call this when starting a new session or resetting Chuck.
 */
export function initializeChuckAI(): void {
    chuckState = {
        chuckGenome: {
            id: 'chuck-ai',
            network: createChuckNetwork(),
            fitness: 0,
            matchesWon: 0
        },
        mirrorGenome: null,
        opponentHistory: [],
        trainingIterations: 0,
        movesSinceLastUpdate: 0,
        framesSinceTraining: 0
    };
}

/**
 * Get Chuck's current genome for use in matches.
 * Initializes if not already done.
 */
export function getChuckGenome(): Genome {
    if (!chuckState) {
        initializeChuckAI();
    }
    // Assert chuckState is defined after initialization
    if (!chuckState) {
        throw new Error('ChuckAI: Failed to initialize state');
    }
    return chuckState.chuckGenome;
}

/**
 * Get Mirror AI's current network for visualization.
 * Returns null if no mirror has been generated yet.
 */
export function getMirrorGenome(): NeuralNetworkData | null {
    if (!chuckState || !chuckState.mirrorGenome) {
        return null;
    }
    return chuckState.mirrorGenome.network;
}

// =============================================================================
// OPPONENT MONITORING
// =============================================================================

/**
 * Record an opponent's move for pattern analysis.
 * Call this every frame with the opponent's current input state.
 * 
 * @param input - The opponent's input state this frame
 */
export function recordOpponentMove(input: InputState): void {
    if (!chuckState) {
        initializeChuckAI();
    }
    if (!chuckState) return;

    // Add to history buffer (sliding window)
    chuckState.opponentHistory.push({ ...input });

    // Maintain buffer size limit (Rule #2: bounded iteration)
    if (chuckState.opponentHistory.length > HISTORY_BUFFER_SIZE) {
        chuckState.opponentHistory.shift();
    }

    chuckState.movesSinceLastUpdate++;

    // Periodically update the Mirror AI
    if (chuckState.movesSinceLastUpdate >= MIRROR_UPDATE_INTERVAL) {
        updateMirrorAI();
        chuckState.movesSinceLastUpdate = 0;
    }
}

/**
 * Get the number of recorded opponent moves.
 */
export function getOpponentHistorySize(): number {
    return chuckState?.opponentHistory.length ?? 0;
}

// =============================================================================
// MIRROR AI GENERATION
// =============================================================================

/**
 * Generate or update the Mirror AI based on opponent behavior patterns.
 * 
 * The Mirror AI attempts to replicate the opponent's fighting style by:
 * 1. Analyzing action frequencies in the history
 * 2. Biasing network weights toward commonly used actions
 * 3. Creating an opponent proxy for Chuck to train against
 */
function updateMirrorAI(): void {
    if (!chuckState) return;
    if (chuckState.opponentHistory.length < 20) return; // Need enough data

    // Analyze opponent patterns
    const patterns = analyzeOpponentPatterns(chuckState.opponentHistory);

    // Create or update mirror genome
    const mirrorNetwork = createMirrorNetwork(patterns);

    chuckState.mirrorGenome = {
        id: 'mirror-ai',
        network: mirrorNetwork,
        fitness: 0,
        matchesWon: 0
    };
}

/**
 * Analyze opponent move history to extract patterns.
 * Returns frequency data for each action type.
 */
function analyzeOpponentPatterns(history: InputState[]): ActionPatterns {
    const patterns: ActionPatterns = {
        leftFreq: 0,
        rightFreq: 0,
        jumpFreq: 0,
        crouchFreq: 0,
        punchFreq: 0,
        kickFreq: 0,
        blockFreq: 0,
        aggressiveness: 0
    };

    const len = history.length;
    if (len === 0) return patterns;

    // Count action frequencies
    for (const input of history) {
        if (input.left) patterns.leftFreq++;
        if (input.right) patterns.rightFreq++;
        if (input.up) patterns.jumpFreq++;
        if (input.down) patterns.crouchFreq++;
        if (input.action1) patterns.punchFreq++;
        if (input.action2) patterns.kickFreq++;
        if (input.action3) patterns.blockFreq++;
    }

    // Normalize to 0-1
    patterns.leftFreq /= len;
    patterns.rightFreq /= len;
    patterns.jumpFreq /= len;
    patterns.crouchFreq /= len;
    patterns.punchFreq /= len;
    patterns.kickFreq /= len;
    patterns.blockFreq /= len;

    // Calculate aggressiveness (attack frequency)
    patterns.aggressiveness = (patterns.punchFreq + patterns.kickFreq) / 2;

    return patterns;
}

interface ActionPatterns {
    leftFreq: number;
    rightFreq: number;
    jumpFreq: number;
    crouchFreq: number;
    punchFreq: number;
    kickFreq: number;
    blockFreq: number;
    aggressiveness: number;
}

/**
 * Create a neural network that mimics the observed patterns.
 * 
 * Key improvements for accurate style matching:
 * 1. Strong positive bias for frequently used actions
 * 2. Strong negative bias to suppress rarely used actions
 * 3. Contrast enhancement to make dominant actions stand out
 */
function createMirrorNetwork(patterns: ActionPatterns): NeuralNetworkData {
    const network = createChuckNetwork();
    const hiddenNodes = NN_ARCH_CHUCK.HIDDEN_NODES;

    // Output indices: 0:IDLE 1:LEFT 2:RIGHT 3:JUMP 4:CROUCH 5:PUNCH 6:KICK 7:BLOCK
    // Map patterns to output biases with STRONG influence
    const actionFreqs = [
        0,                      // IDLE - neutral
        patterns.leftFreq,      // LEFT
        patterns.rightFreq,     // RIGHT  
        patterns.jumpFreq,      // JUMP
        patterns.crouchFreq,    // CROUCH
        patterns.punchFreq,     // PUNCH
        patterns.kickFreq,      // KICK
        patterns.blockFreq      // BLOCK
    ];

    // Find max frequency to compute relative weights
    const maxFreq = Math.max(...actionFreqs.slice(1), 0.01);

    // Apply strong biases: boost used actions, suppress unused ones
    for (let i = 1; i < 8; i++) {
        const freq = actionFreqs[i] ?? 0;
        const biasIdx = hiddenNodes + i;

        // Normalize to 0-1 range relative to most-used action
        const normalized = freq / maxFreq;

        // Strong bias scaling:
        // - High freq (near 1.0) → +5 bias (strongly encouraged)
        // - Low freq (near 0.0) → -3 bias (strongly suppressed)
        const bias = (normalized * 8) - 3;

        network.biases[biasIdx] = bias;
    }

    return network;
}

// =============================================================================
// BACKGROUND TRAINING
// =============================================================================

/**
 * Run a background training cycle where Chuck fights the Mirror AI.
 * This evolves Chuck's strategies to counter the opponent's style.
 * 
 * Call this periodically while in ARCADE mode with Chuck AI.
 */
export function runChuckTrainingCycle(): void {
    if (!chuckState) return;
    if (!chuckState.mirrorGenome) return; // Need opponent data first

    // Create training population with Chuck variants
    const chuck = chuckState.chuckGenome;
    const chuckVariants: Genome[] = [chuck];

    // Generate mutated variants
    for (let i = 1; i < 5; i++) {
        chuckVariants.push({
            id: `chuck-variant-${i}`,
            network: mutateNetwork(chuck.network, 0.1),
            fitness: 0,
            matchesWon: 0
        });
    }

    // Simulate matches against Mirror AI (simplified fitness)
    // In a full implementation, this would run actual headless matches
    for (const variant of chuckVariants) {
        variant.fitness = simulateMatchAgainstMirror(variant, chuckState.mirrorGenome);
    }

    // Select best performer
    chuckVariants.sort((a, b) => b.fitness - a.fitness);
    const best = chuckVariants[0];

    if (best && best.fitness > chuck.fitness) {
        // Create evolved Chuck through crossover
        chuckState.chuckGenome = {
            id: 'chuck-ai',
            network: crossoverNetworks(chuck.network, best.network),
            fitness: best.fitness,
            matchesWon: chuck.matchesWon + (best.matchesWon > 0 ? 1 : 0)
        };
    }

    chuckState.trainingIterations++;
}

/**
 * Run incremental real-time training during active fights.
 * This is a lightweight version of runChuckTrainingCycle that:
 * - Runs every ~2 seconds (120 frames at 60fps)
 * - Uses fewer variants (2 instead of 5) for performance
 * - Provides faster adaptation during the fight itself
 * 
 * Call this every frame from the game loop when fighting Chuck.
 */
export function runIncrementalTraining(): void {
    if (!chuckState) return;

    // Throttle: only train every REALTIME_TRAINING_INTERVAL frames
    chuckState.framesSinceTraining++;
    if (chuckState.framesSinceTraining < REALTIME_TRAINING_INTERVAL) return;
    chuckState.framesSinceTraining = 0;

    // Skip if no mirror data yet (need pattern data first)
    if (!chuckState.mirrorGenome) return;

    // Create small training batch (Rule #2: bounded, fixed iteration)
    const chuck = chuckState.chuckGenome;
    const chuckVariants: Genome[] = [chuck];

    // Generate only REALTIME_TRAINING_VARIANTS mutations for speed
    for (let i = 1; i <= REALTIME_TRAINING_VARIANTS; i++) {
        chuckVariants.push({
            id: `chuck-realtime-${i}`,
            network: mutateNetwork(chuck.network, 0.08), // Lower mutation for stability
            fitness: 0,
            matchesWon: 0
        });
    }

    // Quick fitness evaluation against Mirror AI
    for (const variant of chuckVariants) {
        variant.fitness = simulateMatchAgainstMirror(variant, chuckState.mirrorGenome);
    }

    // Select best performer
    chuckVariants.sort((a, b) => b.fitness - a.fitness);
    const best = chuckVariants[0];

    // Update Chuck if a better variant is found
    if (best && best.fitness > chuck.fitness) {
        chuckState.chuckGenome = {
            id: 'chuck-ai',
            network: crossoverNetworks(chuck.network, best.network),
            fitness: best.fitness,
            matchesWon: chuck.matchesWon
        };
    }
}

/**
 * Simplified match simulation for background training.
 * Returns a fitness score based on strategic advantages.
 */
function simulateMatchAgainstMirror(chuck: Genome, mirror: Genome): number {
    // Create sample inputs representing different game states
    const testInputs = [
        [0.5, 0, 1, 1, 0, 1, 1, 0, 1],  // Mid distance, full resources
        [0.1, 0, 0.5, 0.8, 0.3, 0.8, 1, 0.2, 0.7],  // Close, low health
        [0.8, 0, 0.8, 0.3, 0.5, 0.5, -1, 0, 0.5],  // Far, advantage
        [-0.5, 0, 0.7, 0.7, 0.2, 0.6, 1, 0.5, 0.6], // Left side scenario
    ];

    let fitness = 0;

    for (const inputs of testInputs) {
        const chuckOutputs = predict(chuck.network, inputs);
        const mirrorOutputs = predict(mirror.network, inputs);

        // Reward strategic countering
        // If mirror attacks, reward blocking
        const mirrorAttacking = (mirrorOutputs[5] ?? 0) > 0.5 || (mirrorOutputs[6] ?? 0) > 0.5;
        const chuckBlocking = (chuckOutputs[7] ?? 0) > 0.5;
        if (mirrorAttacking && chuckBlocking) fitness += 10;

        // If mirror blocks, reward waiting or repositioning
        const mirrorBlocking = (mirrorOutputs[7] ?? 0) > 0.5;
        const chuckMoving = (chuckOutputs[1] ?? 0) > 0.5 || (chuckOutputs[2] ?? 0) > 0.5;
        if (mirrorBlocking && chuckMoving) fitness += 5;

        // Reward aggressive play when opponent is passive
        const mirrorPassive = !mirrorAttacking && !mirrorBlocking;
        const chuckAttacking = (chuckOutputs[5] ?? 0) > 0.5 || (chuckOutputs[6] ?? 0) > 0.5;
        if (mirrorPassive && chuckAttacking) fitness += 15;

        // Punish predictable behavior (similar outputs)
        const similarity = calculateOutputSimilarity(chuckOutputs, mirrorOutputs);
        fitness -= similarity * 5;
    }

    return Math.max(0, fitness);
}

/**
 * Calculate how similar two output arrays are (0-1).
 */
function calculateOutputSimilarity(a: number[], b: number[]): number {
    let sum = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        sum += Math.abs((a[i] ?? 0) - (b[i] ?? 0));
    }
    return 1 - (sum / len);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get current training statistics for display.
 */
export function getChuckStats(): { iterations: number; historySize: number; hasMirror: boolean } {
    return {
        iterations: chuckState?.trainingIterations ?? 0,
        historySize: chuckState?.opponentHistory.length ?? 0,
        hasMirror: chuckState?.mirrorGenome !== null
    };
}

/**
 * Reset Chuck AI to initial state.
 */
export function resetChuckAI(): void {
    chuckState = null;
    initializeChuckAI();
}

/**
 * Check if Chuck AI is initialized.
 */
export function isChuckInitialized(): boolean {
    return chuckState !== null;
}
