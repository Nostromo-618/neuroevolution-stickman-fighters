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
            const useCustomA = ctx.settingsRef.current.opponentType === 'CUSTOM_A';
            const useCustomB = ctx.settingsRef.current.opponentType === 'CUSTOM_B';
            const useCustom = useCustomA || useCustomB;

            const totalMatches = useCustom ? popSize : Math.ceil(popSize / 2);

            if (ctx.currentMatchIndex.current >= totalMatches) {
                ctx.evolve();
                return;
            }

            const spawnOffset1 = Math.random() * 100 - 50;
            const spawnOffset2 = Math.random() * 100 - 50;

            if (useCustom) {
                const genomeIdx = ctx.currentMatchIndex.current;
                const genome = ctx.populationRef.current[genomeIdx];
                const swapSides = Math.random() > 0.5;
                const opponentColor = useCustomA ? '#a855f7' : '#14b8a6';
                const scriptWorker = useCustomA ? ctx.customScriptWorkerARef.current : ctx.customScriptWorkerBRef.current;

                let f1, f2;

                if (swapSides) {
                    f1 = new Fighter(280 + spawnOffset1, opponentColor, false);
                    if (scriptWorker && scriptWorker.isReady()) { f1.isCustom = true; f1.scriptWorker = scriptWorker; }

                    f2 = new Fighter(470 + spawnOffset2, '#3b82f6', true, genome);
                    f2.direction = -1;
                    ctx.activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: genomeIdx };
                } else {
                    f1 = new Fighter(280 + spawnOffset1, '#3b82f6', true, genome);
                    f2 = new Fighter(470 + spawnOffset2, opponentColor, false);
                    if (scriptWorker && scriptWorker.isReady()) { f2.isCustom = true; f2.scriptWorker = scriptWorker; }
                    f2.direction = -1;
                    ctx.activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: genomeIdx, p2GenomeIdx: -1 };
                }

            } else {
                const p1Idx = ctx.currentMatchIndex.current * 2;
                let p2Idx = p1Idx + 1;
                if (p2Idx >= popSize) p2Idx = Math.floor(Math.random() * p1Idx);

                const g1 = ctx.populationRef.current[p1Idx];
                const g2 = ctx.populationRef.current[p2Idx];

                const swapSides = Math.random() > 0.5;
                const leftGenome = swapSides ? g2 : g1;
                const rightGenome = swapSides ? g1 : g2;

                const f1 = new Fighter(280 + spawnOffset1, '#ef4444', true, leftGenome);
                const f2 = new Fighter(470 + spawnOffset2, '#3b82f6', true, rightGenome);
                f2.direction = -1;

                ctx.activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: p1Idx, p2GenomeIdx: p2Idx };
            }

        } else {
            const p1Type = ctx.settingsRef.current.player1Type;
            const p2Type = ctx.settingsRef.current.player2Type;
            const spawnOffset = Math.random() * 60 - 30;

            const f1 = spawnFighter(p1Type, 280 + spawnOffset, '#ef4444', false);
            const f2 = spawnFighter(p2Type, 470 - spawnOffset, '#3b82f6', true);
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

