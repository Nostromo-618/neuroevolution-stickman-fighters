/**
 * =============================================================================
 * USE EVOLUTION - Genetic Algorithm Operations (STANDARD Rule 4)
 * =============================================================================
 * 
 * Extracted from index.vue to reduce component size and improve testability.
 * Handles all evolution-related operations: population reset, genome evolution,
 * and evolution interval calculations.
 */

import type { Ref } from 'vue';
import type { Genome, TrainingSettings, GameState } from '~/types';
import { mutateNetwork, crossoverNetworks, createRandomNetwork } from '~/services/NeuralNetwork';
import {
    clearGenomeStorage,
    saveBestGenome,
    savePopulation,
    saveFitnessHistory,
    saveTrainingState
} from '~/services/PersistenceManager';
import { calculateAdaptiveMutationRate } from '~/services/AdaptiveMutation';

interface EvolutionContext {
    settingsRef: Ref<TrainingSettings>;
    setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
    gameStateRef: Ref<GameState>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    populationRef: Ref<Genome[]>;
    bestTrainedGenomeRef: Ref<Genome | null>;
    setFitnessHistory: (updater: { gen: number; fitness: number; mutationRate: number }[] | ((prev: { gen: number; fitness: number; mutationRate: number }[]) => { gen: number; fitness: number; mutationRate: number }[])) => void;
    currentMatchIndex: Ref<number>;
    addToast: (type: 'success' | 'error' | 'info', message: string) => void;
    onAutoStop?: () => void;
}

/**
 * Calculate the evolution interval based on opponent type
 */
export function calculateEvolutionInterval(
    player1Type: string,
    populationSize: number
): number {
    const isHumanOpponent = player1Type === 'HUMAN';
    const isAIOpponent = player1Type === 'SIMPLE_AI';

    return isHumanOpponent
        ? 3
        : (isAIOpponent ? Math.floor(populationSize / 4) : Math.floor(populationSize / 2));
}

export function useEvolution(ctx: EvolutionContext) {
    /**
     * Reset the population with new random genomes
     */
    const resetPopulation = (clearBest: boolean = true) => {
        const newPop: Genome[] = [];
        for (let i = 0; i < ctx.settingsRef.value.populationSize; i++) {
            newPop.push({
                id: `gen1-${i}`,
                network: createRandomNetwork(),
                fitness: 0,
                matchesWon: 0
            });
        }
        ctx.populationRef.value = newPop;

        if (clearBest) {
            ctx.bestTrainedGenomeRef.value = null;
        }

        ctx.setGameState(prev => ({
            ...prev,
            generation: 1,
            bestFitness: 0,
            currentMutationRate: 0.30,
            recentBestFitness: []
        }));
    };

    /**
     * Reset match state for a new round
     */
    const resetMatch = () => {
        const popSize = ctx.populationRef.value.length;

        let matchesRemaining = popSize;
        if (ctx.settingsRef.value.gameMode === 'TRAINING') {
            const evolutionInterval = calculateEvolutionInterval(
                ctx.settingsRef.value.player1Type,
                popSize
            );
            matchesRemaining = evolutionInterval - (ctx.currentMatchIndex.value % evolutionInterval);
        }

        ctx.setGameState(prev => ({
            ...prev,
            player1Health: 100,
            player2Health: 100,
            player1Energy: 100,
            player2Energy: 100,
            timeRemaining: 90,
            matchActive: false,
            winner: null,
            roundStatus: 'WAITING',
            matchesUntilEvolution: matchesRemaining
        }));
    };

    /**
     * Reset all genome data including localStorage
     */
    const resetGenomeAndStorage = () => {
        resetPopulation(true);
        clearGenomeStorage();
        ctx.addToast('info', 'Genome reset: Population and storage cleared');
    };

    /**
     * Evolve the population to the next generation
     */
    const evolve = () => {
        const pop = ctx.populationRef.value;
        pop.sort((a, b) => b.fitness - a.fitness);
        const best = pop[0];

        if (!best) return;

        // Update best genome if this is better
        if (!ctx.bestTrainedGenomeRef.value || best.fitness > ctx.bestTrainedGenomeRef.value.fitness) {
            ctx.bestTrainedGenomeRef.value = JSON.parse(JSON.stringify(best));
        }

        // Calculate mutation rate using smart adaptive strategy or manual
        let mutationRate: number;
        if (ctx.settingsRef.value.intelligentMutation) {
            // Smart adaptive mutation with plateau detection and oscillation
            mutationRate = calculateAdaptiveMutationRate({
                generation: ctx.gameStateRef.value.generation,
                fitnessHistory: ctx.gameStateRef.value.recentBestFitness
            });
        } else {
            // Manual mutation rate from settings
            mutationRate = ctx.settingsRef.value.mutationRate;
        }

        // Update fitness history with mutation rate and persist
        const newHistoryEntry = { gen: ctx.gameStateRef.value.generation, fitness: best.fitness, mutationRate };
        ctx.setFitnessHistory(prev => {
            const updated = [...prev.slice(-20), newHistoryEntry];
            // Persist fitness history to localStorage
            saveFitnessHistory(updated);
            return updated;
        });

        // Calculate next evolution interval
        const popSize = ctx.populationRef.value.length;
        const nextEvolutionInterval = calculateEvolutionInterval(
            ctx.settingsRef.value.player1Type,
            popSize
        );

        // Update game state with new generation and track recent fitness for plateau detection
        const newGeneration = ctx.gameStateRef.value.generation + 1;
        ctx.setGameState(prev => ({
            ...prev,
            bestFitness: best.fitness,
            generation: newGeneration,
            matchesUntilEvolution: nextEvolutionInterval,
            currentMutationRate: mutationRate,
            recentBestFitness: [...prev.recentBestFitness.slice(-9), best.fitness]
        }));

        // Auto-stop training if enabled and limit reached
        if (ctx.settingsRef.value.autoStopEnabled && newGeneration >= ctx.settingsRef.value.autoStopGeneration) {
            if (ctx.onAutoStop) {
                ctx.onAutoStop();
            } else {
                // Fallback to silent pause if no callback provided
                ctx.setSettings(s => ({ ...s, isRunning: false }));
            }
            return;
        }

        const currentGen = ctx.gameStateRef.value.generation;

        // Create next generation with elitism (keep top 2)
        const elite1 = pop[0];
        const elite2 = pop[1];

        const newPop: Genome[] = [];

        if (elite1) {
            newPop.push({
                id: `gen${currentGen + 1}-0`,
                network: elite1.network,
                fitness: 0,
                matchesWon: 0
            });
        }

        if (elite2) {
            newPop.push({
                id: `gen${currentGen + 1}-1`,
                network: elite2.network,
                fitness: 0,
                matchesWon: 0
            });
        }

        // mutationRate already calculated above for fitness history

        // Selection pool (top 25%)
        const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

        // Fill rest of population with offspring
        while (newPop.length < ctx.settingsRef.value.populationSize) {
            const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
            const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];

            if (!parentA || !parentB) continue;

            let childNet = crossoverNetworks(parentA.network, parentB.network);
            childNet = mutateNetwork(childNet, mutationRate);

            newPop.push({
                id: `gen${currentGen + 1}-${newPop.length}`,
                network: childNet,
                fitness: 0,
                matchesWon: 0
            });
        }

        ctx.populationRef.value = newPop;
        ctx.currentMatchIndex.value = 0;

        // === AUTO-SAVE TO LOCALSTORAGE ===
        // Save best genome (the current best trained AI)
        if (ctx.bestTrainedGenomeRef.value) {
            saveBestGenome(ctx.bestTrainedGenomeRef.value);
        }

        // Save the new population
        savePopulation(newPop);

        // Save training state metadata for resuming
        saveTrainingState({
            generation: ctx.gameStateRef.value.generation,
            bestFitness: ctx.gameStateRef.value.bestFitness,
            currentMutationRate: ctx.gameStateRef.value.currentMutationRate,
            recentBestFitness: ctx.gameStateRef.value.recentBestFitness
        });
    };

    return {
        resetPopulation,
        resetMatch,
        resetGenomeAndStorage,
        evolve,
        calculateEvolutionInterval
    };
}
