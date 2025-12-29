import { ref, type Ref } from 'vue';
import type { Genome, TrainingSettings } from '~/types';
import { createRandomNetwork } from '~/services/NeuralNetwork';

interface UsePopulationReturn {
    populationRef: Ref<Genome[]>;
    bestTrainedGenomeRef: Ref<Genome | null>;
    fitnessHistory: Ref<{ gen: number, fitness: number }[]>;
    setFitnessHistory: (updater: { gen: number, fitness: number }[] | ((prev: { gen: number, fitness: number }[]) => { gen: number, fitness: number }[])) => void;
    initPopulation: (settings: TrainingSettings, clearBest?: boolean) => void;
    getBestGenome: () => Genome | null;
}

export const usePopulation = (): UsePopulationReturn => {
    const populationRef = ref<Genome[]>([]);
    const bestTrainedGenomeRef = ref<Genome | null>(null);
    const fitnessHistory = ref<{ gen: number, fitness: number }[]>([]);

    const initPopulation = (settings: TrainingSettings, clearBest: boolean = true) => {
        const pop: Genome[] = [];
        for (let i = 0; i < settings.populationSize; i++) {
            pop.push({
                id: `gen1-${i}`,
                network: createRandomNetwork(),
                fitness: 0,
                matchesWon: 0
            });
        }
        populationRef.value = pop;
        if (clearBest) {
            bestTrainedGenomeRef.value = null;
        }
    };

    const getBestGenome = (): Genome | null => {
        if (bestTrainedGenomeRef.value) return bestTrainedGenomeRef.value;
        if (populationRef.value.length === 0) return null;
        const sorted = [...populationRef.value].sort((a, b) => b.fitness - a.fitness);
        return sorted[0] ?? null;
    };

    const setFitnessHistory = (updater: { gen: number, fitness: number }[] | ((prev: { gen: number, fitness: number }[]) => { gen: number, fitness: number }[])) => {
        if (typeof updater === 'function') {
            fitnessHistory.value = updater(fitnessHistory.value);
        } else {
            fitnessHistory.value = updater;
        }
    };

    return {
        populationRef,
        bestTrainedGenomeRef,
        fitnessHistory,
        setFitnessHistory,
        initPopulation,
        getBestGenome
    };
};
