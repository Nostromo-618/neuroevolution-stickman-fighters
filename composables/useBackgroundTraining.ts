import { ref, watch, onUnmounted, type Ref } from 'vue';
import { WorkerPool } from '~/services/WorkerPool';
import type { Genome, TrainingSettings, GameState } from '~/types';
import { crossoverNetworks, mutateNetwork } from '~/services/NeuralNetwork';

interface UseBackgroundTrainingProps {
    settings: Ref<TrainingSettings>;
    setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    setFitnessHistory: (updater: { gen: number, fitness: number }[] | ((prev: { gen: number, fitness: number }[]) => { gen: number, fitness: number }[])) => void;
    populationRef: Ref<Genome[]>;
    bestTrainedGenomeRef: Ref<Genome | null>;
    currentMatchIndex: Ref<number>;
}

export const useBackgroundTraining = ({
    settings,
    setSettings,
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
            workerPoolRef.value = new WorkerPool(settings.value.workerCount);
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
            let newGeneration = 0;
            setGameState(prev => {
                currentGen = prev.generation;
                newGeneration = prev.generation + 1;
                return {
                    ...prev,
                    bestFitness: best.fitness,
                    generation: newGeneration,
                    currentMutationRate: settings.value.intelligentMutation
                        ? Math.max(0.05, 0.30 - (newGeneration * 0.008))
                        : settings.value.mutationRate
                };
            });

            setFitnessHistory(prev => [...prev.slice(-20), { gen: currentGen, fitness: best.fitness }]);

            // Auto-stop training if enabled and limit reached
            if (settings.value.autoStopEnabled && newGeneration >= settings.value.autoStopGeneration) {
                setSettings(s => ({ ...s, isRunning: false }));
                isWorkerTrainingRef.value = false;
                return;
            }

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

    // Training cycle ID to prevent overlapping runs
    let trainingCycleId = 0;

    if (process.client) {
        // Recreate worker pool when worker count changes
        watch(() => settings.value.workerCount, (newCount) => {
            if (workerPoolRef.value) {
                workerPoolRef.value.terminate();
                workerPoolRef.value = null;  // Set to null so runWorkerTrainingGeneration creates fresh pool
            }
            // Reset the training lock - old cycle's promise will never resolve since workers are terminated
            isWorkerTrainingRef.value = false;
        });

        watch(() => [
            settings.value.backgroundTraining,
            settings.value.gameMode,
            settings.value.turboTraining,
            settings.value.isRunning,
            settings.value.workerCount  // Include workerCount to restart training cycle when changed
        ], () => {
            // Reset training lock when settings change to ensure cycles can restart
            isWorkerTrainingRef.value = false;
            // Increment cycle ID to invalidate any running cycles
            trainingCycleId++;

            // Run workers for:
            // 1. Training mode with turbo enabled and running
            // 2. Arcade mode with background training enabled AND running (user pressed Start)
            const shouldRunWorkers =
                (settings.value.gameMode === 'TRAINING' && settings.value.turboTraining && settings.value.isRunning) ||
                (settings.value.backgroundTraining && settings.value.gameMode === 'ARCADE' && settings.value.isRunning);

            if (shouldRunWorkers) {
                const currentCycleId = trainingCycleId;

                // Rule #2: Use recursive setTimeout instead of while(true)
                const runTrainingCycle = async () => {
                    // Stop if settings changed or cycle invalidated
                    const stillValid =
                        currentCycleId === trainingCycleId &&
                        ((settings.value.gameMode === 'TRAINING' && settings.value.turboTraining && settings.value.isRunning) ||
                            (settings.value.backgroundTraining && settings.value.gameMode === 'ARCADE' && settings.value.isRunning));

                    if (!stillValid) {
                        return;
                    }

                    await runWorkerTrainingGeneration();

                    // Schedule next cycle (non-blocking)
                    setTimeout(runTrainingCycle, 10);
                };

                runTrainingCycle();
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
