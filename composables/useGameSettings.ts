import { ref, watch, type Ref } from 'vue';
import type { TrainingSettings } from '~/types';
import { FEATURE_FLAGS } from '~/services/Config';

interface UseGameSettingsReturn {
    settings: Ref<TrainingSettings>;
    setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
    settingsRef: Ref<TrainingSettings>;
}

// Calculate smart defaults for background training
const getHardwareConcurrency = () => typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
const hasMultipleThreads = () => getHardwareConcurrency() > 1;
const getDefaultWorkerCount = () => Math.max(1, Math.floor(getHardwareConcurrency() / 2)); // 50% of threads

export const useGameSettings = (): UseGameSettingsReturn => {
    const settings = ref<TrainingSettings>({
        populationSize: 48,
        mutationRate: 0.1,
        hiddenLayers: [13],
        fps: 60,
        simulationSpeed: 1,
        gameMode: 'ARCADE',                      // Default to ARCADE mode
        isRunning: false,
        backgroundTraining: hasMultipleThreads(), // Auto-enable when multiple threads available
        turboTraining: true,
        workerCount: getDefaultWorkerCount(),     // 50% of threads (e.g., 4 of 8)
        intelligentMutation: true,                // Use adaptive mutation rate by default
        autoStopEnabled: true,                    // Auto-stop training after 1000 generations by default
        autoStopGeneration: 1000,                 // Stop training at this generation
        opponentType: 'SIMPLE_AI',
        player1Type: 'HUMAN',                     // Default to human player
        player2Type: FEATURE_FLAGS.ENABLE_CHUCK_AI ? 'CHUCK_AI' : 'SIMPLE_AI'
    });

    const settingsRef = ref(settings.value);

    watch(settings, (newValue) => {
        settingsRef.value = newValue;
    }, { deep: true });

    const setSettings = (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => {
        if (typeof updater === 'function') {
            settings.value = updater(settings.value);
        } else {
            settings.value = updater;
        }
    };

    return { settings, setSettings, settingsRef };
};
