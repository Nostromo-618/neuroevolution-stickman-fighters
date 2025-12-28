import { useState, useRef, useCallback, MutableRefObject } from 'react';
import { Genome, TrainingSettings } from '../types';
import { createRandomNetwork } from '../services/NeuralNetwork';

interface UsePopulationReturn {
    populationRef: MutableRefObject<Genome[]>;
    bestTrainedGenomeRef: MutableRefObject<Genome | null>;
    fitnessHistory: { gen: number, fitness: number }[];
    setFitnessHistory: React.Dispatch<React.SetStateAction<{ gen: number, fitness: number }[]>>;
    initPopulation: (settings: TrainingSettings, clearBest?: boolean) => void;
    getBestGenome: () => Genome | null;
}

export const usePopulation = (): UsePopulationReturn => {
    const populationRef = useRef<Genome[]>([]);
    const bestTrainedGenomeRef = useRef<Genome | null>(null);
    const [fitnessHistory, setFitnessHistory] = useState<{ gen: number, fitness: number }[]>([]);

    const initPopulation = useCallback((settings: TrainingSettings, clearBest: boolean = true) => {
        const pop: Genome[] = [];
        for (let i = 0; i < settings.populationSize; i++) {
            pop.push({
                id: `gen1-${i}`,
                network: createRandomNetwork(),
                fitness: 0,
                matchesWon: 0
            });
        }
        populationRef.current = pop;
        if (clearBest) {
            bestTrainedGenomeRef.current = null;
        }
    }, []);

    const getBestGenome = useCallback((): Genome | null => {
        if (bestTrainedGenomeRef.current) return bestTrainedGenomeRef.current;
        if (populationRef.current.length === 0) return null;
        // Note: This sort is expensive if called every frame, but usually called only on startMatch
        // Optimization: Could cache this if needed, but for <100 size it's fine.
        const sorted = [...populationRef.current].sort((a, b) => b.fitness - a.fitness);
        return sorted[0];
    }, []);

    return {
        populationRef,
        bestTrainedGenomeRef,
        fitnessHistory,
        setFitnessHistory,
        initPopulation,
        getBestGenome
    };
};
