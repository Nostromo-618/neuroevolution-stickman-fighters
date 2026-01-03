import { onUnmounted, type Ref } from 'vue';
import type { TrainingSettings, GameState, Genome } from '~/types';
import { Fighter } from '~/services/GameEngine';
import type { InputManager } from '~/services/InputManager';
import type { ScriptWorkerManager } from '~/services/CustomScriptRunner';
import { useMatchSetup } from './useMatchSetup';
import { useMatchUpdate } from './useMatchUpdate';

interface MatchContext {
    settings: Ref<TrainingSettings>;
    settingsRef: Ref<TrainingSettings>;
    gameStateRef: Ref<GameState>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    activeMatchRef: Ref<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>;
    currentMatchIndex: Ref<number>;
    populationRef: Ref<Genome[]>;
    getBestGenome: () => Genome | null;
    matchTimerRef: Ref<number>;
    inputManager: Ref<InputManager | null>;
    customScriptWorkerARef: Ref<ScriptWorkerManager | null>;
    customScriptWorkerBRef: Ref<ScriptWorkerManager | null>;
    evolve: () => void;
    addToast: (type: 'success' | 'error' | 'info', message: string, clearFirst?: boolean) => void;
}

export const useGameLoop = (ctx: MatchContext) => {
    const { startMatch, clearWaitingTimeout, startCountdown, clearCountdownInterval } = useMatchSetup({
        settingsRef: ctx.settingsRef,
        gameStateRef: ctx.gameStateRef,
        setGameState: ctx.setGameState,
        activeMatchRef: ctx.activeMatchRef,
        currentMatchIndex: ctx.currentMatchIndex,
        populationRef: ctx.populationRef,
        getBestGenome: ctx.getBestGenome,
        matchTimerRef: ctx.matchTimerRef,
        customScriptWorkerARef: ctx.customScriptWorkerARef,
        customScriptWorkerBRef: ctx.customScriptWorkerBRef,
        evolve: ctx.evolve
    });

    const { update, requestRef, clearMatchRestartTimeout } = useMatchUpdate({
        settingsRef: ctx.settingsRef,
        gameStateRef: ctx.gameStateRef,
        setGameState: ctx.setGameState,
        activeMatchRef: ctx.activeMatchRef,
        populationRef: ctx.populationRef,
        matchTimerRef: ctx.matchTimerRef,
        inputManager: ctx.inputManager,
        currentMatchIndex: ctx.currentMatchIndex,
        startMatch,
        addToast: ctx.addToast
    });

    onUnmounted(() => {
        if (requestRef.value !== null) {
            cancelAnimationFrame(requestRef.value);
        }
        clearWaitingTimeout();
        clearMatchRestartTimeout();
        clearCountdownInterval();
    });

    return { update, startMatch, requestRef, clearWaitingTimeout, clearMatchRestartTimeout, startCountdown, clearCountdownInterval };
};
