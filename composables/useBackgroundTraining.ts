import { ref, watch, onUnmounted, type Ref } from 'vue';
import { WorkerPool } from '~/services/WorkerPool';
import type { Genome, TrainingSettings, GameState } from '~/types';
import { crossoverNetworks, mutateNetwork } from '~/services/NeuralNetwork';

interface UseBackgroundTrainingProps {
    settings: Ref<TrainingSettings>;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    setFitnessHistory: (updater: { gen: number, fitness: number }[] | ((prev: { gen: number, fitness: number }[]) => { gen: number, fitness: number }[])) => void;
    populationRef: Ref<Genome[]>;
    bestTrainedGenomeRef: Ref<Genome | null>;
    currentMatchIndex: Ref<number>;
}

export const useBackgroundTraining = ({
    settings,
    setGameState,
    setFitnessHistory,
    populationRef,
    bestTrainedGenomeRef,
    currentMatchIndex
}: UseBackgroundTrainingProps) => {
    const workerPoolRef = ref<WorkerPool | null>(null);
    const isWorkerTrainingRef = ref<boolean>(false);

    const runWorkerTrainingGeneration = async () => {
        if (isWorkerTrainingRef.value) return;
        isWorkerTrainingRef.value = true;

        const pop = populationRef.value;
        if (pop.length === 0) {
            isWorkerTrainingRef.value = false;
            return;
        }

        if (!workerPoolRef.value) {
            workerPoolRef.value = new WorkerPool();
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const pool = workerPoolRef.value;

        try {
            const jobs = WorkerPool.createJobsFromPopulation(pop);
            const results = await pool.runMatches(jobs);
            WorkerPool.applyResults(pop, jobs, results);

            pop.sort((a, b) => b.fitness - a.fitness);
            const best = pop[0];

            if (!best) {
                isWorkerTrainingRef.value = false;
                return;
            }

            if (!bestTrainedGenomeRef.value || best.fitness > bestTrainedGenomeRef.value.fitness) {
                bestTrainedGenomeRef.value = JSON.parse(JSON.stringify(best));
            }

            let currentGen = 0;
            setGameState(prev => {
                currentGen = prev.generation;
                return { ...prev, bestFitness: best.fitness, generation: prev.generation + 1 };
            });

            setFitnessHistory(prev => [...prev.slice(-20), { gen: currentGen, fitness: best.fitness }]);

            const popSize = pop.length;
            if (pop.length < 2 || !pop[0]?.network || !pop[1]?.network) {
                isWorkerTrainingRef.value = false;
                return;
            }
            const newPop: Genome[] = [
                { ...pop[0], network: pop[0].network, fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
                { ...pop[1], network: pop[1].network, fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` }
            ];

            const adaptiveRate = Math.max(0.05, 0.30 - (currentGen * 0.008));
            const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

            while (newPop.length < popSize) {
                const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
                const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];
                if (!parentA?.network || !parentB?.network) {
                    continue;
                }
                let childNet = crossoverNetworks(parentA.network, parentB.network);
                childNet = mutateNetwork(childNet, adaptiveRate);
                newPop.push({
                    id: `gen${currentGen + 1}-${newPop.length}`,
                    network: childNet,
                    fitness: 0,
                    matchesWon: 0
                });
            }

            populationRef.value = newPop;
            currentMatchIndex.value = 0;

        } catch (error) {
            console.error('Worker training error:', error);
        }

        isWorkerTrainingRef.value = false;
    };

    if (process.client) {
        watch(() => [settings.value.backgroundTraining, settings.value.gameMode], () => {
            if (settings.value.backgroundTraining && settings.value.gameMode === 'ARCADE') {
                const runContinuousTraining = async () => {
                    while (settings.value.backgroundTraining && settings.value.gameMode === 'ARCADE') {
                        await runWorkerTrainingGeneration();
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                };
                runContinuousTraining();
            }
        }, { immediate: true });
    }

    onUnmounted(() => {
        if (workerPoolRef.value) {
            workerPoolRef.value.terminate();
            workerPoolRef.value = null;
        }
    });

    return { isWorkerTrainingRef };
};
