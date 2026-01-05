import { ref, watch, onUnmounted, type Ref } from 'vue';
import { WorkerPool } from '~/services/WorkerPool';
import type { Genome, TrainingSettings, GameState } from '~/types';
import { crossoverNetworks, mutateNetwork } from '~/services/NeuralNetwork';
import { debugLog, debugCritical } from '~/utils/debug';
import { calculateAdaptiveMutationRate } from '~/services/AdaptiveMutation';
import {
    saveBestGenome,
    savePopulation,
    saveFitnessHistory,
    saveTrainingState
} from '~/services/PersistenceManager';

interface UseBackgroundTrainingProps {
    settings: Ref<TrainingSettings>;
    setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
    setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
    setFitnessHistory: (updater: { gen: number, fitness: number, mutationRate: number }[] | ((prev: { gen: number, fitness: number, mutationRate: number }[]) => { gen: number, fitness: number, mutationRate: number }[])) => void;
    populationRef: Ref<Genome[]>;
    bestTrainedGenomeRef: Ref<Genome | null>;
    currentMatchIndex: Ref<number>;
    onAutoStop?: () => void;
}

export const useBackgroundTraining = ({
    settings,
    setSettings,
    setGameState,
    setFitnessHistory,
    populationRef,
    bestTrainedGenomeRef,
    currentMatchIndex,
    onAutoStop
}: UseBackgroundTrainingProps) => {
    const workerPoolRef = ref<WorkerPool | null>(null);
    const isWorkerTrainingRef = ref<boolean>(false);

    const runWorkerTrainingGeneration = async () => {
        if (isWorkerTrainingRef.value) {
            debugLog('BG_TRAIN', 'Skipping - already running');
            return;
        }
        isWorkerTrainingRef.value = true;
        debugLog('BG_TRAIN', 'Starting worker training generation');

        const pop = populationRef.value;
        if (pop.length === 0) {
            debugLog('BG_TRAIN', 'No population - aborting');
            isWorkerTrainingRef.value = false;
            return;
        }

        if (!workerPoolRef.value) {
            debugLog('BG_TRAIN', `Creating worker pool with ${settings.value.workerCount} workers`);
            workerPoolRef.value = new WorkerPool(settings.value.workerCount);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const pool = workerPoolRef.value;
        debugLog('BG_TRAIN', `Running matches with ${pop.length} genomes`);

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
            let recentBestFitness: number[] = [];

            // Calculate mutation rate using smart adaptive strategy
            setGameState(prev => {
                currentGen = prev.generation;
                newGeneration = prev.generation + 1;
                recentBestFitness = prev.recentBestFitness;

                const mutationRate = settings.value.intelligentMutation
                    ? calculateAdaptiveMutationRate({
                        generation: prev.generation,
                        fitnessHistory: prev.recentBestFitness
                    })
                    : settings.value.mutationRate;

                return {
                    ...prev,
                    bestFitness: best.fitness,
                    generation: newGeneration,
                    currentMutationRate: mutationRate,
                    recentBestFitness: [...prev.recentBestFitness.slice(-9), best.fitness]
                };
            });

            // Calculate mutation rate for history
            const mutationRate = settings.value.intelligentMutation
                ? calculateAdaptiveMutationRate({
                    generation: currentGen,
                    fitnessHistory: recentBestFitness
                })
                : settings.value.mutationRate;

            // Update and persist fitness history
            setFitnessHistory(prev => {
                const updated = [...prev.slice(-20), { gen: currentGen, fitness: best.fitness, mutationRate }];
                // Persist fitness history to localStorage
                saveFitnessHistory(updated);
                return updated;
            });

            // Auto-stop training if enabled and limit reached
            // Auto-stop training if enabled and limit reached
            if (settings.value.autoStopEnabled && newGeneration >= settings.value.autoStopGeneration) {
                if (onAutoStop) {
                    onAutoStop();
                } else {
                    // Fallback to silent pause if no callback provided
                    setSettings(s => ({ ...s, isRunning: false }));
                }
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

            // Use the already calculated smart adaptive mutation rate
            const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

            while (newPop.length < popSize) {
                const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
                const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];
                if (!parentA?.network || !parentB?.network) {
                    continue;
                }
                let childNet = crossoverNetworks(parentA.network, parentB.network);
                childNet = mutateNetwork(childNet, mutationRate);
                newPop.push({
                    id: `gen${currentGen + 1}-${newPop.length}`,
                    network: childNet,
                    fitness: 0,
                    matchesWon: 0
                });
            }

            populationRef.value = newPop;
            currentMatchIndex.value = 0;
            debugLog('BG_TRAIN', `Generation complete - gen=${currentGen + 1} bestFitness=${best.fitness}`);

            // === AUTO-SAVE TO LOCALSTORAGE ===
            // Save best genome
            if (bestTrainedGenomeRef.value) {
                saveBestGenome(bestTrainedGenomeRef.value);
            }

            // Save the new population
            savePopulation(newPop);

            // Save training state metadata
            setGameState(prev => {
                saveTrainingState({
                    generation: prev.generation,
                    bestFitness: prev.bestFitness,
                    currentMutationRate: prev.currentMutationRate,
                    recentBestFitness: prev.recentBestFitness
                });
                return prev; // No state change, just side effect
            });

        } catch (error) {
            debugCritical('BG_TRAIN', 'Worker training error', error);
            console.error('Worker training error:', error);
        }

        isWorkerTrainingRef.value = false;
        debugLog('BG_TRAIN', 'Training generation finished');
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
