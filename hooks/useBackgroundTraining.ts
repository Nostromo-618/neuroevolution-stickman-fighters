import { useRef, useCallback, useEffect, MutableRefObject } from 'react';
import { WorkerPool } from '../services/WorkerPool';
import { Genome, TrainingSettings, GameState } from '../types';
import { crossoverNetworks, mutateNetwork } from '../services/NeuralNetwork';

interface UseBackgroundTrainingProps {
    settings: TrainingSettings;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setFitnessHistory: React.Dispatch<React.SetStateAction<{ gen: number, fitness: number }[]>>;
    populationRef: MutableRefObject<Genome[]>;
    bestTrainedGenomeRef: MutableRefObject<Genome | null>;
    currentMatchIndex: MutableRefObject<number>;
}

export const useBackgroundTraining = ({
    settings,
    setGameState,
    setFitnessHistory,
    populationRef,
    bestTrainedGenomeRef,
    currentMatchIndex
}: UseBackgroundTrainingProps) => {
    const workerPoolRef = useRef<WorkerPool | null>(null);
    const isWorkerTrainingRef = useRef<boolean>(false);
    const settingsRef = useRef(settings); // Need latest settings in loop

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    const runWorkerTrainingGeneration = useCallback(async () => {
        if (isWorkerTrainingRef.current) return;
        isWorkerTrainingRef.current = true;

        const pop = populationRef.current;
        if (pop.length === 0) {
            isWorkerTrainingRef.current = false;
            return;
        }

        if (!workerPoolRef.current) {
            workerPoolRef.current = new WorkerPool();
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const pool = workerPoolRef.current;

        try {
            const jobs = WorkerPool.createJobsFromPopulation(pop);
            const results = await pool.runMatches(jobs);
            WorkerPool.applyResults(pop, jobs, results);

            pop.sort((a, b) => b.fitness - a.fitness);
            const best = pop[0];

            if (!bestTrainedGenomeRef.current || best.fitness > bestTrainedGenomeRef.current.fitness) {
                bestTrainedGenomeRef.current = JSON.parse(JSON.stringify(best));
            }

            // We need to access currentGen safely. Since we're in a callback,
            // and this runs repeatedly, using a state setter callback is safest for reading prev state
            let currentGen = 0;
            setGameState(prev => {
                currentGen = prev.generation;
                return { ...prev, bestFitness: best.fitness, generation: prev.generation + 1 };
            });
            // NOTE: currentGen here will be the OLD generation before update, which is consistent with "slice(-20), { gen: currentGen }" logs

            setFitnessHistory(prev => [...prev.slice(-20), { gen: currentGen, fitness: best.fitness }]);

            // Create new generation
            const popSize = pop.length;
            const newPop: Genome[] = [
                { ...pop[0], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
                { ...pop[1], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` }
            ];

            const adaptiveRate = Math.max(0.05, 0.30 - (currentGen * 0.008));
            const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

            while (newPop.length < popSize) {
                const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
                const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];
                let childNet = crossoverNetworks(parentA.network, parentB.network);
                childNet = mutateNetwork(childNet, adaptiveRate);
                newPop.push({
                    id: `gen${currentGen + 1}-${newPop.length}`,
                    network: childNet,
                    fitness: 0,
                    matchesWon: 0
                });
            }

            populationRef.current = newPop;
            currentMatchIndex.current = 0;

        } catch (error) {
            console.error('Worker training error:', error);
        }

        isWorkerTrainingRef.current = false;
    }, [populationRef, bestTrainedGenomeRef, currentMatchIndex, setGameState, setFitnessHistory]);

    useEffect(() => {
        if (settings.backgroundTraining && settings.gameMode === 'ARCADE') {
            const runContinuousTraining = async () => {
                while (settingsRef.current.backgroundTraining && settingsRef.current.gameMode === 'ARCADE') {
                    await runWorkerTrainingGeneration();
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            };
            runContinuousTraining();
        }

        return () => {
            // No cleanup needed for workers unless we want to kill them
            // Keep them alive for typical user session
        };
    }, [settings.backgroundTraining, settings.gameMode, runWorkerTrainingGeneration]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (workerPoolRef.current) {
                workerPoolRef.current.terminate();
                workerPoolRef.current = null;
            }
        };
    }, []);

    return { isWorkerTrainingRef };
};
