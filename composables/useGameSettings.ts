import { ref, watch, type Ref } from 'vue';
import type { TrainingSettings } from '~/types';
import { FEATURE_FLAGS } from '~/services/Config';
import { saveSettings, loadSettings } from '~/services/PersistenceManager';

interface UseGameSettingsReturn {
    settings: Ref<TrainingSettings>;
    setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
    settingsRef: Ref<TrainingSettings>;
}

// Calculate smart defaults for background training
const getHardwareConcurrency = () => typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
const hasMultipleThreads = () => getHardwareConcurrency() > 1;
const getDefaultWorkerCount = () => Math.max(1, Math.floor(getHardwareConcurrency() / 2)); // 50% of threads

// Default settings factory
const createDefaultSettings = (): TrainingSettings => ({
    populationSize: 48,
    mutationRate: 0.1,
    hiddenLayers: [13],
    fps: 60,
    simulationSpeed: 1,
    gameMode: 'ARCADE',                      // Default to ARCADE mode
    isRunning: false,
    backgroundTraining: false,                // Disabled by default; auto-enables with Simple AI
    turboTraining: true,
    workerCount: getDefaultWorkerCount(),     // 50% of threads (e.g., 4 of 8)
    intelligentMutation: true,                // Use adaptive mutation rate by default
    autoStopEnabled: true,                    // Auto-stop training after 1000 generations by default
    autoStopGeneration: 1000,                 // Stop training at this generation
    opponentType: 'SIMPLE_AI',
    player1Type: 'HUMAN',                     // Default to human player
    player2Type: 'CUSTOM_A'                   // Default to Script A opponent
});

export const useGameSettings = (): UseGameSettingsReturn => {
    // Load persisted settings and merge with defaults (handles new fields gracefully)
    const defaults = createDefaultSettings();
    const persisted = loadSettings();
    const initialSettings: TrainingSettings = {
        ...defaults,
        ...(persisted || {}),
        // Always start paused on fresh load - user must explicitly start
        isRunning: false
    };

    const settings = ref<TrainingSettings>(initialSettings);

    const settingsRef = ref(settings.value);

    watch(settings, (newValue) => {
        settingsRef.value = newValue;
        // Auto-save settings to localStorage on any change
        saveSettings(newValue);
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
