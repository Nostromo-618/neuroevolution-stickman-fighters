/**
 * =============================================================================
 * USE MATCH SETUP - Match Initialization Hook
 * =============================================================================
 * 
 * Handles setting up new matches (spawning fighters, initializing game state).
 */

import { useCallback, MutableRefObject } from 'react';
import { TrainingSettings, GameState, Genome } from '../types';
import { Fighter } from '../services/GameEngine';
import { MatchSetup } from '../services/MatchSetup';
import { ScriptWorkerManager } from '../services/CustomScriptRunner';
import { createRandomNetwork } from '../services/NeuralNetwork';

interface MatchSetupContext {
    settingsRef: MutableRefObject<TrainingSettings>;
    gameStateRef: MutableRefObject<GameState>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    activeMatchRef: MutableRefObject<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>;
    currentMatchIndex: MutableRefObject<number>;
    populationRef: MutableRefObject<Genome[]>;
    getBestGenome: () => Genome | null;
    matchTimerRef: MutableRefObject<number>;
    customScriptWorkerARef: MutableRefObject<ScriptWorkerManager | null>;
    customScriptWorkerBRef: MutableRefObject<ScriptWorkerManager | null>;
    evolve: () => void;
}

export function useMatchSetup(ctx: MatchSetupContext) {
    const startMatch = useCallback(() => {
        ctx.matchTimerRef.current = 90;

        const workers = {
            workerA: ctx.customScriptWorkerARef.current,
            workerB: ctx.customScriptWorkerBRef.current
        };

        const spawnFighter = (type: any, x: number, color: string, isP2: boolean) =>
            MatchSetup.createFighter(type, x, color, isP2, ctx.settingsRef.current, workers, ctx.getBestGenome());

        if (ctx.settingsRef.current.gameMode === 'TRAINING') {
            const popSize = ctx.populationRef.current.length;
            const p1Type = ctx.settingsRef.current.player1Type;
            // Player 2 is always AI in Training mode
            const p2Type = 'AI';
            const isP1AI = p1Type === 'AI';
            const isP1Human = p1Type === 'HUMAN';

            // Evolution interval depends on opponent type:
            // - Human opponent: 3 matches (short loop for human interaction)
            // - Non-human (AI/script): Use population-based interval
            //   - AI vs AI: populationSize / 2 (pairs genomes)
            //   - Non-AI vs AI: populationSize (each genome fights once)
            const EVOLUTION_INTERVAL = isP1Human 
                ? 3 
                : (isP1AI ? Math.floor(popSize / 2) : popSize);
            
            // Check if we should evolve
            if (ctx.currentMatchIndex.current > 0 && ctx.currentMatchIndex.current % EVOLUTION_INTERVAL === 0) {
                ctx.evolve();
                return;
            }

            // Calculate matches remaining until evolution
            const matchesRemaining = EVOLUTION_INTERVAL - (ctx.currentMatchIndex.current % EVOLUTION_INTERVAL);
            ctx.setGameState(prev => ({ ...prev, matchesUntilEvolution: matchesRemaining }));

            const spawnOffset1 = Math.random() * 100 - 50;
            const spawnOffset2 = Math.random() * 100 - 50;

            // Determine Player 1 color and setup
            let p1Color: string;
            let p1Fighter: Fighter;
            let p1GenomeIdx: number;

            if (p1Type === 'HUMAN') {
                p1Color = '#22c55e'; // Green for human
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                p1GenomeIdx = -1;
            } else if (p1Type === 'CUSTOM_A') {
                p1Color = '#a855f7'; // Purple for script A
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                const worker = ctx.customScriptWorkerARef.current;
                if (worker && worker.isReady()) {
                    p1Fighter.isCustom = true;
                    p1Fighter.scriptWorker = worker;
                } else {
                    p1Fighter.isCustom = true; // Fallback
                }
                p1GenomeIdx = -1;
            } else if (p1Type === 'CUSTOM_B') {
                p1Color = '#14b8a6'; // Teal for script B
                p1Fighter = new Fighter(280 + spawnOffset1, p1Color, false);
                const worker = ctx.customScriptWorkerBRef.current;
                if (worker && worker.isReady()) {
                    p1Fighter.isCustom = true;
                    p1Fighter.scriptWorker = worker;
                } else {
                    p1Fighter.isCustom = true; // Fallback
                }
                p1GenomeIdx = -1;
            } else {
                // Player 1 is AI
                p1Color = '#ef4444'; // Red for AI
                if (isP1AI) {
                    // AI vs AI: pair genomes
                    const p1Idx = ctx.currentMatchIndex.current * 2;
                    let p2Idx = p1Idx + 1;
                    if (p2Idx >= popSize) p2Idx = Math.floor(Math.random() * p1Idx);
                    const g1 = ctx.populationRef.current[p1Idx];
                    const g2 = ctx.populationRef.current[p2Idx];
                    const swapSides = Math.random() > 0.5;
                    const leftGenome = swapSides ? g2 : g1;
                    const rightGenome = swapSides ? g1 : g2;
                    p1Fighter = new Fighter(280 + spawnOffset1, p1Color, true, leftGenome);
                    const p2Fighter = new Fighter(470 + spawnOffset2, '#3b82f6', true, rightGenome);
                    p2Fighter.direction = -1;
                    ctx.activeMatchRef.current = { p1: p1Fighter, p2: p2Fighter, p1GenomeIdx: p1Idx, p2GenomeIdx: p2Idx };
                    // Update matches remaining (already calculated above before this branch)
                    return; // Early return for AI vs AI case
                } else {
                    // This shouldn't happen, but handle gracefully
                    const genome = ctx.populationRef.current[ctx.currentMatchIndex.current] || ctx.getBestGenome() || { id: 'cpu', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
                    p1Fighter = new Fighter(280 + spawnOffset1, p1Color, true, genome);
                    p1GenomeIdx = ctx.currentMatchIndex.current;
                }
            }

            // Player 2 is always AI in Training mode
            const p2GenomeIdx = isP1AI ? -1 : ctx.currentMatchIndex.current;
            const p2Genome = ctx.populationRef.current[p2GenomeIdx] || ctx.getBestGenome() || { id: 'cpu', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
            const p2Fighter = new Fighter(470 + spawnOffset2, '#3b82f6', true, p2Genome);
            p2Fighter.direction = -1;

            ctx.activeMatchRef.current = { p1: p1Fighter, p2: p2Fighter, p1GenomeIdx, p2GenomeIdx };

        } else {
            // ARCADE mode
            const p1Type = ctx.settingsRef.current.player1Type;
            const p2Type = ctx.settingsRef.current.player2Type;
            const spawnOffset = Math.random() * 60 - 30;

            // Determine colors based on player types
            const p1Color = p1Type === 'HUMAN' ? '#22c55e' : '#ef4444'; // Green for human, red otherwise
            const p2Color = '#3b82f6'; // Blue for Player 2

            const f1 = spawnFighter(p1Type, 280 + spawnOffset, p1Color, false);
            const f2 = spawnFighter(p2Type, 470 - spawnOffset, p2Color, true);
            f2.direction = -1;

            ctx.activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: -1 };
        }

        const isArcade = ctx.settingsRef.current.gameMode === 'ARCADE';

        ctx.setGameState(prev => ({
            ...prev,
            matchActive: true,
            timeRemaining: 90,
            winner: null,
            roundStatus: isArcade ? 'WAITING' : 'FIGHTING'
        }));

        if (ctx.gameStateRef.current) ctx.gameStateRef.current.roundStatus = isArcade ? 'WAITING' : 'FIGHTING';

        if (isArcade) {
            setTimeout(() => {
                if (ctx.activeMatchRef.current) {
                    if (ctx.gameStateRef.current) ctx.gameStateRef.current.roundStatus = 'FIGHTING';
                    ctx.setGameState(prev => ({ ...prev, roundStatus: 'FIGHTING' }));
                }
            }, 1500);
        }

    }, [ctx.settingsRef, ctx.populationRef, ctx.getBestGenome, ctx.activeMatchRef, ctx.currentMatchIndex, ctx.matchTimerRef, ctx.customScriptWorkerARef, ctx.customScriptWorkerBRef, ctx.evolve, ctx.setGameState, ctx.gameStateRef]);

    return { startMatch };
}

