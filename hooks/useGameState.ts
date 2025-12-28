import { useState, useRef, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react';
import { GameState } from '../types';

interface UseGameStateReturn {
    gameState: GameState;
    setGameState: Dispatch<SetStateAction<GameState>>;
    gameStateRef: MutableRefObject<GameState>;
    matchTimerRef: MutableRefObject<number>;
    resetMatchTimer: () => void;
}

export const useGameState = (): UseGameStateReturn => {
    const [gameState, setGameState] = useState<GameState>({
        player1Health: 100, player2Health: 100,
        player1Energy: 100, player2Energy: 100,
        timeRemaining: 90, generation: 1, bestFitness: 0,
        matchActive: false,
        winner: null,
        roundStatus: 'WAITING',
        matchesUntilEvolution: 3
    });

    const gameStateRef = useRef(gameState);
    const matchTimerRef = useRef(90);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    const resetMatchTimer = () => {
        matchTimerRef.current = 90;
    };

    return {
        gameState,
        setGameState,
        gameStateRef,
        matchTimerRef,
        resetMatchTimer
    };
};
