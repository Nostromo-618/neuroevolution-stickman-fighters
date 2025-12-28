import { useRef, useCallback, useEffect, MutableRefObject } from 'react';
import { ScriptWorkerManager, loadScript } from '../services/CustomScriptRunner';
import { TrainingSettings } from '../types';



// Simplified interface
interface UseCustomScriptWorkersReturn {
    customScriptWorkerARef: MutableRefObject<ScriptWorkerManager | null>;
    customScriptWorkerBRef: MutableRefObject<ScriptWorkerManager | null>;
    recompileCustomScript: () => Promise<void>;
}

export const useCustomScriptWorkers = (settings: TrainingSettings, addToast: any): UseCustomScriptWorkersReturn => {
    const customScriptWorkerARef = useRef<ScriptWorkerManager | null>(null);
    const customScriptWorkerBRef = useRef<ScriptWorkerManager | null>(null);

    // Pre-compile custom script workers based on selection
    useEffect(() => {
        const compileWorker = async (slot: 'slot1' | 'slot2', workerRef: MutableRefObject<ScriptWorkerManager | null>) => {
            const scriptCode = loadScript(slot);

            if (!workerRef.current) {
                workerRef.current = new ScriptWorkerManager();
            }

            if (!workerRef.current.isReady()) {
                const result = await workerRef.current.compile(scriptCode);
                const name = slot === 'slot1' ? 'Script A' : 'Script B';
                if (!result.success) {
                    addToast('error', `${name} error: ${result.error}`);
                }
            }
        };

        const needsA =
            (settings.gameMode === 'TRAINING' && settings.opponentType === 'CUSTOM_A') ||
            (settings.gameMode === 'ARCADE' && (settings.player1Type === 'CUSTOM_A' || settings.player2Type === 'CUSTOM_A'));

        const needsB =
            (settings.gameMode === 'TRAINING' && settings.opponentType === 'CUSTOM_B') ||
            (settings.gameMode === 'ARCADE' && (settings.player1Type === 'CUSTOM_B' || settings.player2Type === 'CUSTOM_B'));

        if (needsA) compileWorker('slot1', customScriptWorkerARef);
        if (needsB) compileWorker('slot2', customScriptWorkerBRef);

    }, [settings.gameMode, settings.opponentType, settings.player1Type, settings.player2Type, addToast]);

    const recompileCustomScript = useCallback(async () => {
        const recompileSlot = async (slot: 'slot1' | 'slot2', workerRef: MutableRefObject<ScriptWorkerManager | null>) => {
            const scriptCode = loadScript(slot);
            if (!scriptCode) return;

            if (!workerRef.current) {
                workerRef.current = new ScriptWorkerManager();
            }

            const result = await workerRef.current.compile(scriptCode);
            const name = slot === 'slot1' ? 'Script A' : 'Script B';

            if (result.success) {
                addToast('success', `✏️ ${name} recompiled!`);
            } else {
                addToast('error', `${name} error: ${result.error}.`);
            }
        };

        if (customScriptWorkerARef.current) recompileSlot('slot1', customScriptWorkerARef);
        if (customScriptWorkerBRef.current) recompileSlot('slot2', customScriptWorkerBRef);
    }, [addToast]);

    return { customScriptWorkerARef, customScriptWorkerBRef, recompileCustomScript };
};
