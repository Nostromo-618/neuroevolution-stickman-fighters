import { ref, watch, type Ref } from 'vue';
import { ScriptWorkerManager, loadScript } from '~/services/CustomScriptRunner';
import type { TrainingSettings } from '~/types';

interface UseCustomScriptWorkersReturn {
    customScriptWorkerARef: Ref<ScriptWorkerManager | null>;
    customScriptWorkerBRef: Ref<ScriptWorkerManager | null>;
    recompileCustomScript: () => Promise<void>;
}

export const useCustomScriptWorkers = (settings: Ref<TrainingSettings>, addToast: (type: string, message: string) => void): UseCustomScriptWorkersReturn => {
    const customScriptWorkerARef = ref<ScriptWorkerManager | null>(null);
    const customScriptWorkerBRef = ref<ScriptWorkerManager | null>(null);

    if (process.client) {
        watch(() => [settings.value.gameMode, settings.value.opponentType, settings.value.player1Type, settings.value.player2Type], () => {
            const compileWorker = async (slot: 'slot1' | 'slot2', workerRef: Ref<ScriptWorkerManager | null>) => {
            const scriptCode = loadScript(slot);

            if (!workerRef.value) {
                workerRef.value = new ScriptWorkerManager();
            }

                if (!workerRef.value.isReady()) {
                    const result = await workerRef.value.compile(scriptCode);
                    const name = slot === 'slot1' ? 'Script A' : 'Script B';
                    if (!result.success) {
                        addToast('error', `${name} error: ${result.error}`);
                    }
                }
            };

            const needsA =
                (settings.value.gameMode === 'TRAINING' && settings.value.player1Type === 'CUSTOM_A') ||
                (settings.value.gameMode === 'ARCADE' && (settings.value.player1Type === 'CUSTOM_A' || settings.value.player2Type === 'CUSTOM_A'));

            const needsB =
                (settings.value.gameMode === 'TRAINING' && settings.value.player1Type === 'CUSTOM_B') ||
                (settings.value.gameMode === 'ARCADE' && (settings.value.player1Type === 'CUSTOM_B' || settings.value.player2Type === 'CUSTOM_B'));

            if (needsA) compileWorker('slot1', customScriptWorkerARef as Ref<ScriptWorkerManager | null>);
            if (needsB) compileWorker('slot2', customScriptWorkerBRef as Ref<ScriptWorkerManager | null>);
        }, { immediate: true });
    }

    const recompileCustomScript = async () => {
        const recompileSlot = async (slot: 'slot1' | 'slot2', workerRef: Ref<ScriptWorkerManager | null>) => {
            const scriptCode = loadScript(slot);
            if (!scriptCode) return;

            if (!workerRef.value) {
                workerRef.value = new ScriptWorkerManager();
            }

            const result = await workerRef.value.compile(scriptCode);
            const name = slot === 'slot1' ? 'Script A' : 'Script B';

            if (result.success) {
                addToast('success', `✏️ ${name} recompiled!`);
            } else {
                addToast('error', `${name} error: ${result.error}.`);
            }
        };

        if (customScriptWorkerARef.value) recompileSlot('slot1', customScriptWorkerARef as Ref<ScriptWorkerManager | null>);
        if (customScriptWorkerBRef.value) recompileSlot('slot2', customScriptWorkerBRef as Ref<ScriptWorkerManager | null>);
    };

    return { 
        customScriptWorkerARef: customScriptWorkerARef as Ref<ScriptWorkerManager | null>, 
        customScriptWorkerBRef: customScriptWorkerBRef as Ref<ScriptWorkerManager | null>, 
        recompileCustomScript 
    };
};
