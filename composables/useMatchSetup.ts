/**
 * =============================================================================
 * USE MATCH SETUP - Match Initialization Composable
 * =============================================================================
 * 
 * Handles setting up new matches (spawning fighters, initializing game state).
 */

import { ref, type Ref } from 'vue';
import type { TrainingSettings, GameState, Genome } from '~/types';
import { Fighter } from '~/services/GameEngine';
import { MatchSetup } from '~/services/MatchSetup';
import type { ScriptWorkerManager } from '~/services/CustomScriptRunner';
import { createRandomNetwork } from '~/services/NeuralNetwork';
import { calculateEvolutionInterval } from './useEvolution';

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
    evolve: () => void;
}

export function useMatchSetup(ctx: MatchSetupContext) {
    const waitingTimeoutRef = ref<ReturnType<typeof setTimeout> | null>(null);

    const clearWaitingTimeout = () => {
        if (waitingTimeoutRef.value) {
            clearTimeout(waitingTimeoutRef.value);
            waitingTimeoutRef.value = null;
        }
    };

    const startMatch = () => {
        clearWaitingTimeout();
        ctx.matchTimerRef.value = 90;

        const workers = {
            workerA: ctx.customScriptWorkerARef.value,
            workerB: ctx.customScriptWorkerBRef.value
        };

        const spawnFighter = (type: 'HUMAN' | 'AI' | 'CUSTOM_A' | 'CUSTOM_B', x: number, color: string, isP2: boolean) =>
            MatchSetup.createFighter(type, x, color, isP2, ctx.settingsRef.value, workers, ctx.getBestGenome());

        if (ctx.settingsRef.value.gameMode === 'TRAINING') {
            const popSize = ctx.populationRef.value.length;
            const p1Type = ctx.settingsRef.value.player1Type;
            const p2Type = 'AI';
            const isP1AI = p1Type === 'AI';
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
                p1Color = '#22c55e';
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                p1GenomeIdx = -1;
            } else if (p1Type === 'CUSTOM_A') {
                p1Color = '#a855f7';
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                const worker = ctx.customScriptWorkerARef.value;
                if (worker && worker.isReady()) {
                    p1Fighter.isCustom = true;
                    p1Fighter.scriptWorker = worker;
                } else {
                    p1Fighter.isCustom = true;
                }
                p1GenomeIdx = -1;
            } else if (p1Type === 'CUSTOM_B') {
                p1Color = '#14b8a6';
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                const worker = ctx.customScriptWorkerBRef.value;
                if (worker && worker.isReady()) {
                    p1Fighter.isCustom = true;
                    p1Fighter.scriptWorker = worker;
                } else {
                    p1Fighter.isCustom = true;
                }
                p1GenomeIdx = -1;
            } else {
                p1Color = '#ef4444';
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
                    const p2Fighter = new Fighter(470 + spawnOffset2, '#3b82f6', true, rightGenome);
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
            const p2Fighter = new Fighter(470 + spawnOffset2, '#3b82f6', true, p2Genome);
            p2Fighter.direction = -1;

            ctx.activeMatchRef.value = { p1: p1Fighter, p2: p2Fighter, p1GenomeIdx, p2GenomeIdx };

        } else {
            const p1Type = ctx.settingsRef.value.player1Type;
            const p2Type = ctx.settingsRef.value.player2Type;
            const spawnOffset = Math.random() * 60 - 30;

            const p1Color = p1Type === 'HUMAN' ? '#22c55e' : '#ef4444';
            const p2Color = '#3b82f6';

            const f1 = spawnFighter(p1Type, 280 + spawnOffset, p1Color, false);
            const f2 = spawnFighter(p2Type, 470 - spawnOffset, p2Color, true);
            f2.direction = -1;

            ctx.activeMatchRef.value = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: -1 };
        }

        const isArcade = ctx.settingsRef.value.gameMode === 'ARCADE';

        ctx.setGameState(prev => ({
            ...prev,
            matchActive: true,
            timeRemaining: 90,
            winner: null,
            roundStatus: isArcade ? 'WAITING' : 'FIGHTING'
        }));

        if (isArcade) {
            waitingTimeoutRef.value = setTimeout(() => {
                if (ctx.activeMatchRef.value) {
                    ctx.setGameState(prev => ({ ...prev, roundStatus: 'FIGHTING' }));
                }
                waitingTimeoutRef.value = null;
            }, 1500);
        }
    };

    return { startMatch, clearWaitingTimeout };
}
