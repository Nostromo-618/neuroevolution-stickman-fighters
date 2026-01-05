import { ref, watch, type Ref } from 'vue';
import type { GameState } from '~/types';
import { loadTrainingState } from '~/services/PersistenceManager';

interface UseGameStateReturn {
    gameState: Ref<GameState>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    gameStateRef: Ref<GameState>;
    matchTimerRef: Ref<number>;
    resetMatchTimer: () => void;
}

// Default game state factory
const createDefaultGameState = (): GameState => ({
    player1Health: 100, player2Health: 100,
    player1Energy: 100, player2Energy: 100,
    timeRemaining: 90, generation: 1, bestFitness: 0,
    matchActive: false,
    winner: null,
    roundStatus: 'WAITING',
    matchesUntilEvolution: 3,
    arcadeStats: { matchesPlayed: 0, p1Wins: 0, p2Wins: 0 },
    countdownValue: null,
    currentMutationRate: 0.30,
    recentBestFitness: []
});

export const useGameState = (): UseGameStateReturn => {
    // Load persisted training state and merge with defaults
    const defaults = createDefaultGameState();
    const persistedState = loadTrainingState();

    const initialState: GameState = persistedState
        ? {
            ...defaults,
            generation: persistedState.generation,
            bestFitness: persistedState.bestFitness,
            currentMutationRate: persistedState.currentMutationRate,
            recentBestFitness: persistedState.recentBestFitness
        }
        : defaults;

    const gameState = ref<GameState>(initialState);

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
