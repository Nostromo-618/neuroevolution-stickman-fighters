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
import { clearGenomeStorage } from '~/services/PersistenceManager';

interface EvolutionContext {
    settingsRef: Ref<TrainingSettings>;
    gameStateRef: Ref<GameState>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    populationRef: Ref<Genome[]>;
    bestTrainedGenomeRef: Ref<Genome | null>;
    setFitnessHistory: (updater: { gen: number; fitness: number }[] | ((prev: { gen: number; fitness: number }[]) => { gen: number; fitness: number }[])) => void;
    currentMatchIndex: Ref<number>;
    addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

/**
 * Calculate the evolution interval based on opponent type
 */
export function calculateEvolutionInterval(
    player1Type: string,
    populationSize: number
): number {
    const isHumanOpponent = player1Type === 'HUMAN';
    const isAIOpponent = player1Type === 'AI';

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
            bestFitness: 0
        }));
    };

    /**
     * Reset match state for a new round
     */
    const resetMatch = () => {
        const popSize = ctx.populationRef.value.length;
        const isHumanOpponent = ctx.settingsRef.value.player1Type === 'HUMAN';
        const isAIOpponent = ctx.settingsRef.value.player1Type === 'AI';

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

        // Update fitness history
        ctx.setFitnessHistory(prev => [
            ...prev.slice(-20),
            { gen: ctx.gameStateRef.value.generation, fitness: best.fitness }
        ]);

        // Calculate next evolution interval
        const popSize = ctx.populationRef.value.length;
        const nextEvolutionInterval = calculateEvolutionInterval(
            ctx.settingsRef.value.player1Type,
            popSize
        );

        // Update game state
        ctx.setGameState(prev => ({
            ...prev,
            bestFitness: best.fitness,
            generation: prev.generation + 1,
            matchesUntilEvolution: nextEvolutionInterval
        }));

        const currentGen = ctx.gameStateRef.value.generation;

        // Create next generation with elitism (keep top 2)
        const newPop: Genome[] = [
            { ...pop[0], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
        ];

        if (pop[1]) {
            newPop.push({ ...pop[1], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` });
        }

        // Adaptive mutation rate (decays over generations)
        const adaptiveRate = Math.max(0.05, 0.30 - (currentGen * 0.008));

        // Selection pool (top 25%)
        const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

        // Fill rest of population with offspring
        while (newPop.length < ctx.settingsRef.value.populationSize) {
            const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
            const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];

            if (!parentA || !parentB) continue;

            let childNet = crossoverNetworks(parentA.network, parentB.network);
            childNet = mutateNetwork(childNet, adaptiveRate);

            newPop.push({
                id: `gen${currentGen + 1}-${newPop.length}`,
                network: childNet,
                fitness: 0,
                matchesWon: 0
            });
        }

        ctx.populationRef.value = newPop;
        ctx.currentMatchIndex.value = 0;
    };

    return {
        resetPopulation,
        resetMatch,
        resetGenomeAndStorage,
        evolve,
        calculateEvolutionInterval
    };
}
