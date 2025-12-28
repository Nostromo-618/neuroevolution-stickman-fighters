import { useEffect, MutableRefObject } from 'react';
import { TrainingSettings, GameState, Genome } from '../types';
import { Fighter } from '../services/GameEngine';
import { InputManager } from '../services/InputManager';
import { ScriptWorkerManager } from '../services/CustomScriptRunner';
import { useMatchSetup } from './useMatchSetup';
import { useMatchUpdate } from './useMatchUpdate';

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
    const { startMatch } = useMatchSetup({
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

    const { update, requestRef } = useMatchUpdate({
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

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [requestRef]);

    return { update, startMatch, requestRef };
};
