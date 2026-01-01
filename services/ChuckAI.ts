/**
 * =============================================================================
 * CHUCK AI SERVICE - Adaptive Mirror AI Opponent System
 * =============================================================================
 * 
 * Chuck AI is an advanced opponent that uses "Mirror Learning":
 * 1. Records opponent moves WITH game state context
 * 2. Trains a "Mirror AI" via backpropagation to mimic opponent style
 * 3. Trains Chuck against this Mirror AI in background
 * 4. Chuck evolves strategies specifically countering the opponent
 * 
 * Real-Time Adaptation:
 * - Uses Web Worker for training (no frame drops)
 * - Updates every ~60 frames (1 second)
 * - Recency-weighted samples (recent moves matter more)
 * - Mirror adapts within 5-10 seconds to style changes
 * =============================================================================
 */

import type { Genome, InputState, NeuralNetworkData } from '../types';
import { createChuckNetwork, crossoverNetworks, mutateNetwork, predict } from './NeuralNetwork';
import { NN_ARCH_CHUCK, MIRROR_CONFIG } from './Config';
import type { TrainingConfig, TrainingSample } from './MirrorTrainer';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Contextual move recording - captures WHAT action AND WHEN it was taken.
 * This enables the Mirror AI to learn input-output mappings.
 */
interface ContextualMove {
    inputs: number[];     // The 9 normalized game state inputs at that moment
    outputs: boolean[];   // What actions the player took [L, R, U, D, P, K, B]
}

interface ChuckAIState {
    chuckGenome: Genome;                  // Chuck's current neural network
    mirrorGenome: Genome | null;          // Generated opponent mimic
    contextualHistory: ContextualMove[];  // Sliding window of moves with context
    trainingIterations: number;           // How many background matches run
    framesSinceTraining: number;          // Counter for real-time training
    isTrainingInProgress: boolean;        // Prevent overlapping training requests
}

// =============================================================================
// WORKER MANAGEMENT
// =============================================================================

let mirrorWorker: Worker | null = null;
let workerReady = false;

/**
 * Initialize the Mirror training worker.
 */
function initializeWorker(): void {
    if (mirrorWorker) return;

    try {
        mirrorWorker = new Worker(
            new URL('./MirrorTrainerWorker.ts', import.meta.url),
            { type: 'module' }
        );

        mirrorWorker.onmessage = (event) => {
            const { data } = event;

            if (data.type === 'ready') {
                workerReady = true;
                console.log('[ChuckAI] Mirror training worker ready');
            } else if (data.type === 'trained') {
                handleTrainedNetwork(data.network);
            } else if (data.type === 'error') {
                console.error('[ChuckAI] Training error:', data.message);
                if (chuckState) {
                    chuckState.isTrainingInProgress = false;
                }
            }
        };

        mirrorWorker.onerror = (error) => {
            console.error('[ChuckAI] Worker error:', error.message);
            workerReady = false;
        };
    } catch (error) {
        console.error('[ChuckAI] Failed to create worker:', error);
    }
}

/**
 * Handle trained network received from worker.
 */
function handleTrainedNetwork(network: NeuralNetworkData): void {
    if (!chuckState) return;

    chuckState.mirrorGenome = {
        id: 'mirror-ai',
        network: network,
        fitness: 0,
        matchesWon: 0
    };
    chuckState.isTrainingInProgress = false;
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
    initializeWorker();

    chuckState = {
        chuckGenome: {
            id: 'chuck-ai',
            network: createChuckNetwork(),
            fitness: 0,
            matchesWon: 0
        },
        mirrorGenome: null,
        contextualHistory: [],
        trainingIterations: 0,
        framesSinceTraining: 0,
        isTrainingInProgress: false
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
// CONTEXTUAL OPPONENT MONITORING
// =============================================================================

/**
 * Record an opponent's move WITH game state context.
 * This is the key improvement - we now know WHEN each action was taken.
 * 
 * @param input - The opponent's input state this frame
 * @param gameStateInputs - The 9 normalized inputs representing game state
 */
export function recordOpponentMove(input: InputState, gameStateInputs?: number[]): void {
    if (!chuckState) {
        initializeChuckAI();
    }
    if (!chuckState) return;

    // Only record if we have game state context
    if (!gameStateInputs || gameStateInputs.length !== 9) {
        return;
    }

    // Convert InputState to outputs array [L, R, U, D, P, K, B]
    const outputs: boolean[] = [
        input.left,
        input.right,
        input.up,
        input.down,
        input.action1,  // Punch
        input.action2,  // Kick
        input.action3   // Block
    ];

    // Only record if player did something (not idle)
    const didSomething = outputs.some(o => o);
    if (!didSomething) return;

    // Add to contextual history
    chuckState.contextualHistory.push({
        inputs: [...gameStateInputs],
        outputs: outputs
    });

    // Maintain buffer size limit (Rule #2: bounded iteration)
    if (chuckState.contextualHistory.length > MIRROR_CONFIG.HISTORY_SIZE) {
        chuckState.contextualHistory.shift();
    }
}

/**
 * Get the number of recorded opponent moves.
 */
export function getOpponentHistorySize(): number {
    return chuckState?.contextualHistory.length ?? 0;
}

// =============================================================================
// REAL-TIME MIRROR TRAINING
// =============================================================================

/**
 * Trigger real-time Mirror AI training.
 * Called every frame from the game loop - internally throttled.
 */
export function runRealtimeMirrorTraining(): void {
    if (!chuckState) return;

    // Throttle: only train every UPDATE_INTERVAL_FRAMES
    chuckState.framesSinceTraining++;
    if (chuckState.framesSinceTraining < MIRROR_CONFIG.UPDATE_INTERVAL_FRAMES) return;
    chuckState.framesSinceTraining = 0;

    // Skip if training already in progress or worker not ready
    if (chuckState.isTrainingInProgress || !workerReady || !mirrorWorker) return;

    // Skip if not enough samples
    if (chuckState.contextualHistory.length < MIRROR_CONFIG.MIN_SAMPLES) return;

    // Prepare training data
    const samples: Omit<TrainingSample, 'weight'>[] = chuckState.contextualHistory.map(move => ({
        inputs: move.inputs,
        // Convert boolean outputs to target values (0.1 for false, 0.9 for true)
        // We use 8 outputs to match network architecture (IDLE, L, R, U, D, P, K, B)
        targets: [
            0.1,  // IDLE - always low when player is doing something
            move.outputs[0] ? 0.9 : 0.1,  // LEFT
            move.outputs[1] ? 0.9 : 0.1,  // RIGHT
            move.outputs[2] ? 0.9 : 0.1,  // UP (Jump)
            move.outputs[3] ? 0.9 : 0.1,  // DOWN (Crouch)
            move.outputs[4] ? 0.9 : 0.1,  // PUNCH
            move.outputs[5] ? 0.9 : 0.1,  // KICK
            move.outputs[6] ? 0.9 : 0.1,  // BLOCK
        ]
    }));

    // Get or create base network for training
    const baseNetwork = chuckState.mirrorGenome?.network ?? createChuckNetwork();

    const config: TrainingConfig = {
        learningRate: MIRROR_CONFIG.LEARNING_RATE,
        epochs: MIRROR_CONFIG.EPOCHS_PER_UPDATE,
        recencyDecay: MIRROR_CONFIG.RECENCY_DECAY,
        minSamples: MIRROR_CONFIG.MIN_SAMPLES
    };

    // Send training request to worker
    chuckState.isTrainingInProgress = true;
    mirrorWorker.postMessage({
        type: 'train',
        network: baseNetwork,
        samples: samples,
        config: config
    });
}

// =============================================================================
// BACKGROUND TRAINING (Chuck vs Mirror)
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

    // Generate mutated variants (Rule #2: bounded loop)
    for (let i = 1; i < 5; i++) {
        chuckVariants.push({
            id: `chuck-variant-${i}`,
            network: mutateNetwork(chuck.network, 0.1),
            fitness: 0,
            matchesWon: 0
        });
    }

    // Simulate matches against Mirror AI
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
 * Now redirects to runRealtimeMirrorTraining for the new system.
 */
export function runIncrementalTraining(): void {
    runRealtimeMirrorTraining();
}

/**
 * Simplified match simulation for background training.
 * Returns a fitness score based on strategic advantages.
 */
function simulateMatchAgainstMirror(chuck: Genome, mirror: Genome): number {
    // Create sample inputs representing different game states
    const testInputs = [
        [0.5, 0, 1, 1, 0, 1, 1, 0, 1],        // Mid distance, full resources
        [0.1, 0, 0.5, 0.8, 0.3, 0.8, 1, 0.2, 0.7],  // Close, low health
        [0.8, 0, 0.8, 0.3, 0.5, 0.5, -1, 0, 0.5],   // Far, advantage
        [-0.5, 0, 0.7, 0.7, 0.2, 0.6, 1, 0.5, 0.6], // Left side scenario
    ];

    let fitness = 0;

    for (const inputs of testInputs) {
        const chuckOutputs = predict(chuck.network, inputs);
        const mirrorOutputs = predict(mirror.network, inputs);

        // Reward strategic countering
        const mirrorAttacking = (mirrorOutputs[5] ?? 0) > 0.5 || (mirrorOutputs[6] ?? 0) > 0.5;
        const chuckBlocking = (chuckOutputs[7] ?? 0) > 0.5;
        if (mirrorAttacking && chuckBlocking) fitness += 10;

        const mirrorBlocking = (mirrorOutputs[7] ?? 0) > 0.5;
        const chuckMoving = (chuckOutputs[1] ?? 0) > 0.5 || (chuckOutputs[2] ?? 0) > 0.5;
        if (mirrorBlocking && chuckMoving) fitness += 5;

        const mirrorPassive = !mirrorAttacking && !mirrorBlocking;
        const chuckAttacking = (chuckOutputs[5] ?? 0) > 0.5 || (chuckOutputs[6] ?? 0) > 0.5;
        if (mirrorPassive && chuckAttacking) fitness += 15;

        // Punish predictable behavior
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
export function getChuckStats(): { iterations: number; historySize: number; hasMirror: boolean; isTraining: boolean } {
    return {
        iterations: chuckState?.trainingIterations ?? 0,
        historySize: chuckState?.contextualHistory.length ?? 0,
        hasMirror: chuckState?.mirrorGenome !== null,
        isTraining: chuckState?.isTrainingInProgress ?? false
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

/**
 * Terminate the worker when no longer needed.
 */
export function terminateMirrorWorker(): void {
    if (mirrorWorker) {
        mirrorWorker.terminate();
        mirrorWorker = null;
        workerReady = false;
    }
}
