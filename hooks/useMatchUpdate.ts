/**
 * =============================================================================
 * USE MATCH UPDATE - Game Loop Update Hook
 * =============================================================================
 * 
 * Handles the main game loop: physics, collision, match progression.
 */

import { useRef, useCallback, MutableRefObject } from 'react';
import { TrainingSettings, GameState } from '../types';
import { Fighter } from '../services/GameEngine';
import { InputManager } from '../services/InputManager';

interface MatchUpdateContext {
    settingsRef: MutableRefObject<TrainingSettings>;
    gameStateRef: MutableRefObject<GameState>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    activeMatchRef: MutableRefObject<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>;
    populationRef: MutableRefObject<any[]>;
    matchTimerRef: MutableRefObject<number>;
    inputManager: MutableRefObject<InputManager | null>;
    currentMatchIndex: MutableRefObject<number>;
    startMatch: () => void;
    addToast: any;
}

export function useMatchUpdate(ctx: MatchUpdateContext) {
    const requestRef = useRef<number | null>(null);

    const update = useCallback(() => {
        const currentSettings = ctx.settingsRef.current;
        const currentGameState = ctx.gameStateRef.current;

        if (!ctx.activeMatchRef.current && ctx.populationRef.current.length > 0) {
            ctx.startMatch();
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

                if (currentSettings.gameMode === 'TRAINING') {
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
                    ctx.startMatch();
                } else {
                    const playerWon = p1.health > p2.health;
                    ctx.addToast(playerWon ? 'success' : 'info', playerWon ? 'You Win!' : 'AI Wins!');
                    setTimeout(() => ctx.startMatch(), 1000);
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

    }, [ctx]);

    return { update, requestRef };
}

