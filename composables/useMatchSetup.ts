/**
 * =============================================================================
 * USE MATCH SETUP - Match Initialization Composable
 * =============================================================================
 * 
 * Handles setting up new matches (spawning fighters, initializing game state).
 * 
 * TIMING FAIRNESS (Option A):
 * Now supports SyncScriptExecutor for synchronous script execution,
 * achieving timing parity with neural network AI.
 */

import { ref, type Ref } from 'vue';
import type { TrainingSettings, GameState, Genome } from '~/types';
import { Fighter } from '~/services/GameEngine';
import { MatchSetup } from '~/services/MatchSetup';
import type { ScriptWorkerManager } from '~/services/CustomScriptRunner';
import type { SyncScriptExecutor } from '~/services/SyncScriptExecutor';
import { createRandomNetwork } from '~/services/NeuralNetwork';
import { calculateEvolutionInterval } from './useEvolution';
import { COLORS } from '~/services/Config';
import { debugLog, debugCritical, debugReset } from '~/utils/debug';

interface MatchSetupContext {
    settingsRef: Ref<TrainingSettings>;
    gameStateRef: Ref<GameState>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    activeMatchRef: Ref<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>;
    currentMatchIndex: Ref<number>;
    populationRef: Ref<Genome[]>;
    getBestGenome: () => Genome | null;
    matchTimerRef: Ref<number>;
    customScriptWorkerARef: Ref<ScriptWorkerManager | null>;
    customScriptWorkerBRef: Ref<ScriptWorkerManager | null>;
    // Option A: Sync executors for timing fairness
    syncScriptExecutorARef?: Ref<SyncScriptExecutor | null>;
    syncScriptExecutorBRef?: Ref<SyncScriptExecutor | null>;
    evolve: () => void;
}

export function useMatchSetup(ctx: MatchSetupContext) {
    const waitingTimeoutRef = ref<ReturnType<typeof setTimeout> | null>(null);
    const countdownIntervalRef = ref<ReturnType<typeof setInterval> | null>(null);

    const clearWaitingTimeout = () => {
        if (waitingTimeoutRef.value) {
            clearTimeout(waitingTimeoutRef.value);
            waitingTimeoutRef.value = null;
        }
    };

    const clearCountdownInterval = () => {
        if (countdownIntervalRef.value) {
            clearInterval(countdownIntervalRef.value);
            countdownIntervalRef.value = null;
        }
    };

    const startMatch = () => {
        debugCritical('SETUP', `startMatch called - mode=${ctx.settingsRef.value.gameMode} p1Type=${ctx.settingsRef.value.player1Type} p2Type=${ctx.settingsRef.value.player2Type}`);
        debugReset();  // Reset frame counters for new match

        clearWaitingTimeout();
        clearCountdownInterval();  // Clear any existing countdown
        ctx.matchTimerRef.value = 90;

        const workers = {
            workerA: ctx.customScriptWorkerARef.value,
            workerB: ctx.customScriptWorkerBRef.value
        };

        // Option A: Sync executors for timing fairness
        const syncExecutors = {
            executorA: ctx.syncScriptExecutorARef?.value ?? null,
            executorB: ctx.syncScriptExecutorBRef?.value ?? null
        };

        const spawnFighter = (type: 'HUMAN' | 'SIMPLE_AI' | 'CUSTOM_A' | 'CUSTOM_B', x: number, color: string, isP2: boolean) =>
            MatchSetup.createFighter(type, x, color, isP2, ctx.settingsRef.value, workers, ctx.getBestGenome(), syncExecutors);

        if (ctx.settingsRef.value.gameMode === 'TRAINING') {
            const popSize = ctx.populationRef.value.length;
            const p1Type = ctx.settingsRef.value.player1Type;
            const p2Type = 'SIMPLE_AI'; // Training always uses Simple AI for P2
            const isP1AI = p1Type === 'SIMPLE_AI';
            const EVOLUTION_INTERVAL = calculateEvolutionInterval(p1Type, popSize);

            if (ctx.currentMatchIndex.value > 0 && ctx.currentMatchIndex.value % EVOLUTION_INTERVAL === 0) {
                ctx.evolve();
                return;
            }

            const matchesRemaining = EVOLUTION_INTERVAL - (ctx.currentMatchIndex.value % EVOLUTION_INTERVAL);
            ctx.setGameState(prev => ({ ...prev, matchesUntilEvolution: matchesRemaining }));

            const spawnOffset1 = Math.random() * 100 - 50;
            const spawnOffset2 = Math.random() * 100 - 50;

            let p1Color: string;
            let p1Fighter: Fighter;
            let p1GenomeIdx: number;

            if (p1Type === 'HUMAN') {
                p1Color = COLORS.HUMAN;
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                p1GenomeIdx = -1;
            } else if (p1Type === 'CUSTOM_A') {
                p1Color = COLORS.CUSTOM_A;
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                p1Fighter.isCustom = true;
                // Option A: Prefer sync executor for timing fairness
                if (ctx.syncScriptExecutorARef?.value?.isReady()) {
                    p1Fighter.syncScriptExecutor = ctx.syncScriptExecutorARef.value;
                }
                // Fallback to async worker
                if (ctx.customScriptWorkerARef.value) {
                    p1Fighter.scriptWorker = ctx.customScriptWorkerARef.value;
                }
                p1GenomeIdx = -1;
            } else if (p1Type === 'CUSTOM_B') {
                p1Color = COLORS.CUSTOM_B;
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                p1Fighter.isCustom = true;
                // Option A: Prefer sync executor for timing fairness
                if (ctx.syncScriptExecutorBRef?.value?.isReady()) {
                    p1Fighter.syncScriptExecutor = ctx.syncScriptExecutorBRef.value;
                }
                // Fallback to async worker
                if (ctx.customScriptWorkerBRef.value) {
                    p1Fighter.scriptWorker = ctx.customScriptWorkerBRef.value;
                }
                p1GenomeIdx = -1;
            } else {
                // p1Type is SIMPLE_AI
                p1Color = COLORS.SIMPLE_AI;
                if (isP1AI) {
                    const p1Idx = ctx.currentMatchIndex.value * 2;
                    let p2Idx = p1Idx + 1;
                    if (p2Idx >= popSize) p2Idx = Math.floor(Math.random() * p1Idx);
                    const g1 = ctx.populationRef.value[p1Idx];
                    const g2 = ctx.populationRef.value[p2Idx];
                    const swapSides = Math.random() > 0.5;
                    const leftGenome = swapSides ? g2 : g1;
                    const rightGenome = swapSides ? g1 : g2;
                    p1Fighter = new Fighter(280 + spawnOffset1, p1Color, true, leftGenome);
                    const p2Fighter = new Fighter(470 + spawnOffset2, COLORS.SIMPLE_AI, true, rightGenome);
                    p2Fighter.direction = -1;
                    ctx.activeMatchRef.value = { p1: p1Fighter, p2: p2Fighter, p1GenomeIdx: p1Idx, p2GenomeIdx: p2Idx };
                    return;
                } else {
                    const genome = ctx.populationRef.value[ctx.currentMatchIndex.value] || ctx.getBestGenome() || { id: 'cpu', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
                    p1Fighter = new Fighter(280 + spawnOffset1, p1Color, true, genome);
                    p1GenomeIdx = ctx.currentMatchIndex.value;
                }
            }

            const p2GenomeIdx = isP1AI ? -1 : ctx.currentMatchIndex.value;
            const p2Genome = ctx.populationRef.value[p2GenomeIdx] || ctx.getBestGenome() || { id: 'cpu', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
            const p2Fighter = new Fighter(470 + spawnOffset2, COLORS.SIMPLE_AI, true, p2Genome);
            p2Fighter.direction = -1;

            ctx.activeMatchRef.value = { p1: p1Fighter, p2: p2Fighter, p1GenomeIdx, p2GenomeIdx };

        } else {
            const p1Type = ctx.settingsRef.value.player1Type;
            const p2Type = ctx.settingsRef.value.player2Type;
            const spawnOffset = Math.random() * 60 - 30;

            const p1Color = p1Type === 'HUMAN' ? COLORS.HUMAN : COLORS.SIMPLE_AI;
            const p2Color = COLORS.SIMPLE_AI;

            const f1 = spawnFighter(p1Type, 280 + spawnOffset, p1Color, false);
            const f2 = spawnFighter(p2Type, 470 - spawnOffset, p2Color, true);
            f2.direction = -1;

            ctx.activeMatchRef.value = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: -1 };
        }

        const isArcade = ctx.settingsRef.value.gameMode === 'ARCADE';
        const shouldStartCountdown = isArcade && ctx.settingsRef.value.isRunning;
        const isSubsequentRound = ctx.gameStateRef.value.arcadeStats.matchesPlayed > 0;

        ctx.setGameState(prev => ({
            ...prev,
            matchActive: true,
            timeRemaining: 90,
            winner: null,
            // Arcade: start in WAITING unless isRunning (then will start countdown)
            // Training: start FIGHTING immediately
            roundStatus: isArcade ? 'WAITING' : 'FIGHTING',
            countdownValue: null
        }));

        // For subsequent rounds while playing, start countdown immediately (with fast timing)
        if (shouldStartCountdown) {
            startCountdown(isSubsequentRound);
        }
    };

    /**
     * Start the countdown sequence for Arcade mode.
     * Called when isRunning becomes true and match is in WAITING status.
     * @param fast - If true, uses 3x faster timing (for subsequent rounds)
     */
    const startCountdown = (fast: boolean = false) => {
        debugLog('COUNTDOWN', `startCountdown called - fast=${fast} mode=${ctx.settingsRef.value.gameMode}`);

        if (ctx.settingsRef.value.gameMode !== 'ARCADE') {
            debugLog('COUNTDOWN', 'Skipping - not ARCADE mode');
            return;
        }

        clearCountdownInterval();
        let count = 3;

        // First round: 700ms per step (~2.8s total)
        // Subsequent rounds: 233ms per step (~0.9s total) - keeps user in flow
        const interval = fast ? 233 : 700;
        debugLog('COUNTDOWN', `Starting countdown with interval=${interval}ms`);

        ctx.setGameState(prev => ({
            ...prev,
            roundStatus: 'COUNTDOWN',
            countdownValue: 3
        }));

        countdownIntervalRef.value = setInterval(() => {
            count--;
            debugLog('COUNTDOWN', `Tick: count=${count}`);

            if (count > 0) {
                ctx.setGameState(prev => ({ ...prev, countdownValue: count }));
            } else if (count === 0) {
                ctx.setGameState(prev => ({ ...prev, countdownValue: 0 }));
            } else {
                debugCritical('COUNTDOWN', 'Countdown complete - starting FIGHTING');
                clearCountdownInterval();
                ctx.setGameState(prev => ({
                    ...prev,
                    roundStatus: 'FIGHTING',
                    countdownValue: null
                }));
            }
        }, interval);
    };

    return { startMatch, clearWaitingTimeout, startCountdown, clearCountdownInterval };
}
