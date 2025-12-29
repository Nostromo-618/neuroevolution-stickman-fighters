import { ref, watch, type Ref } from 'vue';
import type { TrainingSettings } from '~/types';

interface UseGameSettingsReturn {
    settings: Ref<TrainingSettings>;
    setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
    settingsRef: Ref<TrainingSettings>;
}

export const useGameSettings = (): UseGameSettingsReturn => {
    const settings = ref<TrainingSettings>({
        populationSize: 48,
        mutationRate: 0.1,
        hiddenLayers: [13],
        fps: 60,
        simulationSpeed: 1,
        gameMode: 'TRAINING',
        isRunning: false,
        backgroundTraining: false,
        opponentType: 'AI',
        player1Type: 'AI',
        player2Type: 'AI'
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
