/**
 * =============================================================================
 * USE MATCH UPDATE - Game Loop Update Composable
 * =============================================================================
 * 
 * Handles the main game loop: physics, collision, match progression.
 */

import { ref, type Ref } from 'vue';
import type { TrainingSettings, GameState } from '~/types';
import { Fighter } from '~/services/GameEngine';
import type { InputManager } from '~/services/InputManager';
import { debugFrame, debugCritical, debugLog } from '~/utils/debug';
import { useFitnessConfig } from '~/composables/useFitnessConfig';

interface MatchUpdateContext {
    settingsRef: Ref<TrainingSettings>;
    gameStateRef: Ref<GameState>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    activeMatchRef: Ref<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>;
    populationRef: Ref<any[]>;
    matchTimerRef: Ref<number>;
    inputManager: Ref<InputManager | null>;
    currentMatchIndex: Ref<number>;
    startMatch: () => void;
    addToast: (type: 'success' | 'error' | 'info', message: string, clearFirst?: boolean) => void;
}

export function useMatchUpdate(ctx: MatchUpdateContext) {
    const requestRef = ref<number | null>(null);
    const matchRestartTimeoutRef = ref<ReturnType<typeof setTimeout> | null>(null);
    const { fitnessConfig } = useFitnessConfig();

    const clearMatchRestartTimeout = () => {
        if (matchRestartTimeoutRef.value) {
            clearTimeout(matchRestartTimeoutRef.value);
            matchRestartTimeoutRef.value = null;
        }
    };

    const update = () => {
        debugFrame('LOOP', `mode=${ctx.settingsRef.value.gameMode} running=${ctx.settingsRef.value.isRunning}`);

        const currentSettings = ctx.settingsRef.value;
        const currentGameState = ctx.gameStateRef.value;

        // Skip sequential loop when turbo training handles it via workers
        if (currentSettings.gameMode === 'TRAINING' && currentSettings.turboTraining && currentSettings.isRunning) {
            debugLog('LOOP', 'Skipping - turbo training active');
            requestRef.value = requestAnimationFrame(update);
            return;
        }

        // Start match if no active match exists
        // Training: auto-start when population ready
        // Arcade: always spawn if no active match (reset/mode-change clears match ref)
        if (!ctx.activeMatchRef.value) {
            debugLog('LOOP', 'No active match - attempting to start');
            const isTraining = currentSettings.gameMode === 'TRAINING';
            const canStart = isTraining
                ? ctx.populationRef.value.length > 0
                : true;  // Arcade: always ready to spawn fighters
            if (canStart) {
                debugCritical('MATCH', 'Starting new match');
                ctx.startMatch();
            } else {
                debugLog('LOOP', 'Cannot start match yet - waiting for population');
            }
            requestRef.value = requestAnimationFrame(update);
            return;
        }

        if (!currentSettings.isRunning || !ctx.activeMatchRef.value) {
            debugLog('LOOP', `Paused - isRunning=${currentSettings.isRunning} hasMatch=${!!ctx.activeMatchRef.value}`);
            requestRef.value = requestAnimationFrame(update);
            return;
        }

        // Freeze BOTH players during countdown - ensures fair simultaneous start
        if (currentGameState.roundStatus === 'COUNTDOWN') {
            debugLog('LOOP', `Countdown - value=${currentGameState.countdownValue}`);
            requestRef.value = requestAnimationFrame(update);
            return;
        }

        const match = ctx.activeMatchRef.value;
        const loops = currentSettings.gameMode === 'ARCADE' ? 1 : currentSettings.simulationSpeed;
        let matchEnded = false;

        // === TIMING FAIRNESS FIX v2 ===
        // Instead of caching once per frame, we compute fresh decisions EACH tick.
        // The original issue was: at high sim speeds, Script A was stuck on stale decisions
        // while AI got fresh ones. Now we let both compute fresh each tick.
        // 
        // The Script's worker-based latency is inherent (1 frame behind),
        // but this is consistent and fair - the same latency exists at 1x and 99x.
        // The AI now also operates with similar decision timing.
        // See: considerations/timing-fairness-sim-speed-options.md

        const dummyInput = { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
        const isP1Human = !match.p1.isAi && !match.p1.isCustom;

        for (let i = 0; i < loops; i++) {
            if (!currentGameState.matchActive || matchEnded) break;

            // Get human input (only for human players)
            let p1Input = (isP1Human && ctx.inputManager.value)
                ? ctx.inputManager.value.getState()
                : dummyInput;

            // Freeze inputs during WAITING phase
            if (currentGameState.roundStatus === 'WAITING') {
                p1Input = dummyInput;
            }

            // IMPORTANT: Do NOT use cached inputs - let Fighter compute fresh each tick
            // This ensures both AI and Script react to current game state each tick.
            // The Script's async worker lag is inherent but consistent.
            match.p1.update(p1Input, match.p2, fitnessConfig.value);
            match.p2.update(dummyInput, match.p1, fitnessConfig.value);

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
                ctx.matchTimerRef.value -= 1 / 60;
            }

            const isTimeout = ctx.matchTimerRef.value <= 0;
            const isKO = p1.health <= 0 || p2.health <= 0;

            if (isKO || isTimeout) {
                matchEnded = true;
                debugCritical('MATCH', `Match ended: isKO=${isKO} isTimeout=${isTimeout} p1Health=${p1.health} p2Health=${p2.health}`);

                if (currentSettings.gameMode === 'TRAINING') {
                    const p1Damage = 100 - p2.health;
                    const p2Damage = 100 - p1.health;
                    const config = fitnessConfig.value;

                    if (p1.genome) { p1.genome.fitness += p1Damage * config.damageMultiplier + p1.health * config.healthMultiplier; }
                    if (p2.genome) { p2.genome.fitness += p2Damage * config.damageMultiplier + p2.health * config.healthMultiplier; }

                    if (p1.health > 0 && p2.health <= 0) {
                        if (p1.genome) { p1.genome.fitness += config.koWinBonus; p1.genome.matchesWon++; }
                    } else if (p2.health > 0 && p1.health <= 0) {
                        if (p2.genome) { p2.genome.fitness += config.koWinBonus; p2.genome.matchesWon++; }
                    } else if (isTimeout) {
                        if (p1.health > p2.health && p1.genome) { p1.genome.fitness += config.timeoutWinBonus; p1.genome.matchesWon++; }
                        else if (p2.health > p1.health && p2.genome) { p2.genome.fitness += config.timeoutWinBonus; p2.genome.matchesWon++; }
                    }

                    if (isTimeout && (p1Damage + p2Damage) < config.stalemateThreshold) {
                        if (p1.genome) p1.genome.fitness += config.stalematePenalty;
                        if (p2.genome) p2.genome.fitness += config.stalematePenalty;
                    }

                    // Track session wins for HUD display
                    const p1Won = (p1.health > 0 && p2.health <= 0) || (isTimeout && p1.health > p2.health);
                    const p2Won = (p2.health > 0 && p1.health <= 0) || (isTimeout && p2.health > p1.health);
                    ctx.setGameState(prev => ({
                        ...prev,
                        arcadeStats: {
                            matchesPlayed: prev.arcadeStats.matchesPlayed + 1,
                            p1Wins: prev.arcadeStats.p1Wins + (p1Won ? 1 : 0),
                            p2Wins: prev.arcadeStats.p2Wins + (p2Won ? 1 : 0)
                        }
                    }));

                    ctx.currentMatchIndex.value++;
                    debugLog('TRAINING', `Starting next match #${ctx.currentMatchIndex.value}`);
                    ctx.startMatch();
                } else {
                    // ARCADE mode match end
                    debugCritical('ARCADE', 'Match ended - transitioning to ROUND_END');
                    const p1Won = p1.health > p2.health;
                    ctx.setGameState(prev => ({
                        ...prev,
                        matchActive: false,
                        roundStatus: 'ROUND_END',  // Keep arena visible, show result
                        arcadeStats: {
                            matchesPlayed: prev.arcadeStats.matchesPlayed + 1,
                            p1Wins: prev.arcadeStats.p1Wins + (p1Won ? 1 : 0),
                            p2Wins: prev.arcadeStats.p2Wins + (p1Won ? 0 : 1)
                        }
                    }));

                    // Keep activeMatchRef populated so arena stays visible
                    // (Don't set to null - that causes "Initializing Arena..." flash)
                    clearMatchRestartTimeout();
                    debugLog('ARCADE', 'Scheduling match restart in 1000ms');
                    matchRestartTimeoutRef.value = setTimeout(() => {
                        debugCritical('ARCADE', 'Match restart timeout fired - starting new match');
                        ctx.startMatch();  // This will respawn fighters and start countdown
                        matchRestartTimeoutRef.value = null;
                    }, 1000);
                }
                break;
            }
        }

        // Only update state if values changed (Rule #3: minimize allocations)
        const currentState = ctx.gameStateRef.value;
        const newP1H = match.p1.health;
        const newP2H = match.p2.health;
        const newP1E = match.p1.energy;
        const newP2E = match.p2.energy;
        const newTime = Math.max(0, ctx.matchTimerRef.value);

        if (
            currentState.player1Health !== newP1H ||
            currentState.player2Health !== newP2H ||
            currentState.player1Energy !== newP1E ||
            currentState.player2Energy !== newP2E ||
            currentState.timeRemaining !== newTime
        ) {
            ctx.setGameState(prev => ({
                ...prev,
                player1Health: newP1H,
                player2Health: newP2H,
                player1Energy: newP1E,
                player2Energy: newP2E,
                timeRemaining: newTime
            }));
        }

        requestRef.value = requestAnimationFrame(update);
    };

    return { update, requestRef, clearMatchRestartTimeout };
}
