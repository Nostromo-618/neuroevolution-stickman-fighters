import { useRef, useCallback, useEffect, MutableRefObject } from 'react';
import { TrainingSettings, GameState, Genome } from '../types';
import { Fighter } from '../services/GameEngine';
import { MatchSetup } from '../services/MatchSetup';
import { InputManager } from '../services/InputManager';
import { ScriptWorkerManager } from '../services/CustomScriptRunner';

interface MatchContext {
    settings: TrainingSettings;
    settingsRef: MutableRefObject<TrainingSettings>;
    gameStateRef: MutableRefObject<GameState>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    activeMatchRef: MutableRefObject<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>;
    currentMatchIndex: MutableRefObject<number>;
    populationRef: MutableRefObject<Genome[]>;
    getBestGenome: () => Genome | null;
    matchTimerRef: MutableRefObject<number>;
    inputManager: MutableRefObject<InputManager | null>;
    customScriptWorkerARef: MutableRefObject<ScriptWorkerManager | null>;
    customScriptWorkerBRef: MutableRefObject<ScriptWorkerManager | null>;
    evolve: () => void;
    addToast: any;
}

export const useGameLoop = (ctx: MatchContext) => {
    const requestRef = useRef<number | null>(null);

    const startMatch = useCallback(() => {
        ctx.matchTimerRef.current = 90;

        const workers = {
            workerA: ctx.customScriptWorkerARef.current,
            workerB: ctx.customScriptWorkerBRef.current
        };

        // Helper to factory fighters
        const spawnFighter = (type: any, x: number, color: string, isP2: boolean) =>
            MatchSetup.createFighter(type, x, color, isP2, ctx.settingsRef.current, workers, ctx.getBestGenome());


        // If Training Mode
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
                    // NN on right (-1 dir), Custom on left
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
                // TRAINING VS AI
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
            // ARCADE MODE
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

        // Sync immediate ref
        if (ctx.gameStateRef.current) ctx.gameStateRef.current.roundStatus = isArcade ? 'WAITING' : 'FIGHTING';

        if (isArcade) {
            setTimeout(() => {
                if (ctx.activeMatchRef.current) {
                    if (ctx.gameStateRef.current) ctx.gameStateRef.current.roundStatus = 'FIGHTING';
                    ctx.setGameState(prev => ({ ...prev, roundStatus: 'FIGHTING' }));
                }
            }, 1500);
        }

    }, [ctx.settingsRef, ctx.populationRef, ctx.getBestGenome, ctx.activeMatchRef, ctx.currentMatchIndex, ctx.matchTimerRef, ctx.customScriptWorkerARef, ctx.customScriptWorkerBRef]);

    const update = useCallback(() => {
        // Loop Logic here (Physics, Collision, End Conditions)
        // This is the big block from App.tsx lines 594-752

        const currentSettings = ctx.settingsRef.current;
        const currentGameState = ctx.gameStateRef.current;

        if (!ctx.activeMatchRef.current && ctx.populationRef.current.length > 0) {
            startMatch();
            requestRef.current = requestAnimationFrame(update);
            return;
        }

        if (!currentSettings.isRunning || !ctx.activeMatchRef.current) {
            requestRef.current = requestAnimationFrame(update);
            return;
        }

        const match = ctx.activeMatchRef.current;
        const loops = currentSettings.gameMode === 'ARCADE' ? 1 : currentSettings.simulationSpeed;
        let matchEnded = false;

        for (let i = 0; i < loops; i++) {
            if (!currentGameState.matchActive || matchEnded) break;

            const dummyInput = { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
            let p1Input = (currentSettings.gameMode === 'ARCADE' && ctx.inputManager.current)
                ? ctx.inputManager.current.getState()
                : dummyInput;

            if (currentGameState.roundStatus === 'WAITING') {
                p1Input = dummyInput;
            }

            match.p1.update(p1Input, match.p2);

            if (currentGameState.roundStatus === 'WAITING') {
                match.p2.update(dummyInput, match.p1);
            } else {
                match.p2.update(dummyInput, match.p1);
            }

            // Collision Logic
            const p1 = match.p1;
            const p2 = match.p2;
            const verticalOverlap = (p1.y + p1.height > p2.y) && (p2.y + p2.height > p1.y);

            if (verticalOverlap) {
                if (p1.x < p2.x) {
                    const overlap = (p1.x + p1.width) - p2.x;
                    if (overlap > 0) { p1.x -= overlap / 2; p2.x += overlap / 2; }
                } else {
                    const overlap = (p2.x + p2.width) - p1.x;
                    if (overlap > 0) { p2.x -= overlap / 2; p1.x += overlap / 2; }
                }
            }

            p1.checkHit(p2);
            p2.checkHit(p1);

            if (currentGameState.roundStatus === 'FIGHTING') {
                ctx.matchTimerRef.current -= 1 / 60;
            }

            const isTimeout = ctx.matchTimerRef.current <= 0;
            const isKO = p1.health <= 0 || p2.health <= 0;

            if (isKO || isTimeout) {
                matchEnded = true;

                // Results Logic
                if (currentSettings.gameMode === 'TRAINING') {
                    // Fitness function logic
                    const p1Damage = 100 - p2.health;
                    const p2Damage = 100 - p1.health;

                    if (p1.genome) { p1.genome.fitness += p1Damage * 3 + p1.health * 2; }
                    if (p2.genome) { p2.genome.fitness += p2Damage * 3 + p2.health * 2; }

                    if (p1.health > 0 && p2.health <= 0) {
                        if (p1.genome) { p1.genome.fitness += 500; p1.genome.matchesWon++; }
                    } else if (p2.health > 0 && p1.health <= 0) {
                        if (p2.genome) { p2.genome.fitness += 500; p2.genome.matchesWon++; }
                    } else if (isTimeout) {
                        if (p1.health > p2.health && p1.genome) { p1.genome.fitness += 200; p1.genome.matchesWon++; }
                        else if (p2.health > p1.health && p2.genome) { p2.genome.fitness += 200; p2.genome.matchesWon++; }
                    }

                    if (isTimeout && (p1Damage + p2Damage) < 30) {
                        if (p1.genome) p1.genome.fitness -= 100;
                        if (p2.genome) p2.genome.fitness -= 100;
                    }

                    ctx.currentMatchIndex.current++;
                    startMatch();
                } else {
                    // Arcade
                    const playerWon = p1.health > p2.health;
                    ctx.addToast(playerWon ? 'success' : 'info', playerWon ? 'You Win!' : 'AI Wins!');
                    setTimeout(() => startMatch(), 1000);
                }
                break;
            }
        }

        ctx.setGameState(prev => ({
            ...prev,
            player1Health: match.p1.health,
            player2Health: match.p2.health,
            player1Energy: match.p1.energy,
            player2Energy: match.p2.energy,
            timeRemaining: Math.max(0, ctx.matchTimerRef.current)
        }));

        requestRef.current = requestAnimationFrame(update);

    }, [startMatch, ctx]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return { update, startMatch, requestRef };
};
