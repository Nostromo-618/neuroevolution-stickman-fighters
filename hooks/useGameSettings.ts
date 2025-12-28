import { useState, useRef, useEffect, Dispatch, SetStateAction, MutableRefObject } from 'react';
import { TrainingSettings } from '../types';

interface UseGameSettingsReturn {
    settings: TrainingSettings;
    setSettings: Dispatch<SetStateAction<TrainingSettings>>;
    settingsRef: MutableRefObject<TrainingSettings>;
}

export const useGameSettings = (): UseGameSettingsReturn => {
    const [settings, setSettings] = useState<TrainingSettings>({
        populationSize: 48,
        mutationRate: 0.1,
        hiddenLayers: [13],
        fps: 60,
        simulationSpeed: 1,
        gameMode: 'ARCADE',
        isRunning: false,
        backgroundTraining: false,
        opponentType: 'AI',
        player1Type: 'HUMAN',
        player2Type: 'AI'
    });

    const settingsRef = useRef(settings);

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    return { settings, setSettings, settingsRef };
};
