import { ref, watch, type Ref } from 'vue';
import type { GameState } from '~/types';

interface UseGameStateReturn {
    gameState: Ref<GameState>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    gameStateRef: Ref<GameState>;
    matchTimerRef: Ref<number>;
    resetMatchTimer: () => void;
}

export const useGameState = (): UseGameStateReturn => {
    const gameState = ref<GameState>({
        player1Health: 100, player2Health: 100,
        player1Energy: 100, player2Energy: 100,
        timeRemaining: 90, generation: 1, bestFitness: 0,
        matchActive: false,
        winner: null,
        roundStatus: 'WAITING',
        matchesUntilEvolution: 3,
        arcadeStats: { matchesPlayed: 0, p1Wins: 0, p2Wins: 0 },
        countdownValue: null,
        currentMutationRate: 0.10
    });

    const gameStateRef = ref(gameState.value);
    const matchTimerRef = ref(90);

    watch(gameState, (newValue) => {
        gameStateRef.value = newValue;
    }, { deep: true });

    const resetMatchTimer = () => {
        matchTimerRef.value = 90;
    };

    const setGameState = (updater: GameState | ((prev: GameState) => GameState)) => {
        if (typeof updater === 'function') {
            gameState.value = updater(gameState.value);
        } else {
            gameState.value = updater;
        }
    };

    return {
        gameState,
        setGameState,
        gameStateRef,
        matchTimerRef,
        resetMatchTimer
    };
};
