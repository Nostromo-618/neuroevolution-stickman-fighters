/**
 * =============================================================================
 * USE MODE SWITCH - Game Mode Management (STANDARD Rule 4)
 * =============================================================================
 * 
 * Extracted from index.vue to reduce component size.
 * Handles switching between TRAINING and ARCADE modes.
 */

import type { Ref } from 'vue';
import type { Fighter } from '~/services/GameEngine';
import type { TrainingSettings, GameState, Genome } from '~/types';
import { calculateEvolutionInterval } from './useEvolution';

interface ModeSwitchContext {
    settings: Ref<TrainingSettings>;
    setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    activeMatchRef: Ref<{ p1: Fighter; p2: Fighter; p1GenomeIdx: number; p2GenomeIdx: number } | null>;
    currentMatchIndex: Ref<number>;
    populationRef: Ref<Genome[]>;
}

export function useModeSwitch(ctx: ModeSwitchContext) {
    /**
     * Handle switching between TRAINING and ARCADE modes
     */
    const handleModeChange = (mode: 'TRAINING' | 'ARCADE') => {
        ctx.setSettings(prev => ({
            ...prev,
            gameMode: mode,
            isRunning: false,
            ...(mode === 'TRAINING' && {
                player1Type: prev.player1Type || 'AI',
                player2Type: 'AI'
            })
        }));

        let evolutionInterval = 3;
        if (mode === 'TRAINING') {
            const popSize = ctx.populationRef.value.length;
            evolutionInterval = calculateEvolutionInterval(
                ctx.settings.value.player1Type,
                popSize
            );
        }

        ctx.setGameState(prev => ({
            ...prev,
            winner: null,
            matchActive: false,
            ...(mode === 'TRAINING' && { matchesUntilEvolution: evolutionInterval })
        }));

        ctx.activeMatchRef.value = null;

        if (mode === 'TRAINING') {
            ctx.currentMatchIndex.value = 0;
        }
    };

    return {
        handleModeChange
    };
}
