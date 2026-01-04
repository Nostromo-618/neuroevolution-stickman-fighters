/**
 * =============================================================================
 * useSyncScriptExecutors - Manages Synchronous Script Executors
 * =============================================================================
 * 
 * This composable creates and manages SyncScriptExecutor instances for
 * custom scripts. These execute scripts synchronously on the main thread
 * to achieve timing parity with the neural network AI.
 * 
 * TIMING FAIRNESS (Option A):
 * - Web Workers can only respond once per frame
 * - At 100x sim speed, async Script gets 1 decision while AI gets 100
 * - Sync execution gives Script the same 100 decisions per frame
 * 
 * =============================================================================
 */

import { ref, watch, type Ref } from 'vue';
import { SyncScriptExecutor } from '~/services/SyncScriptExecutor';
import { loadScript } from '~/services/CustomScriptRunner';
import type { TrainingSettings } from '~/types';

interface UseSyncScriptExecutorsReturn {
    syncExecutorARef: Ref<any>;
    syncExecutorBRef: Ref<any>;
    recompileSyncExecutors: () => void;
}

export const useSyncScriptExecutors = (
    settings: Ref<TrainingSettings>,
    addToast: (type: 'success' | 'error' | 'info', message: string) => void
): UseSyncScriptExecutorsReturn => {
    const syncExecutorARef = ref<SyncScriptExecutor | null>(null);
    const syncExecutorBRef = ref<SyncScriptExecutor | null>(null);

    /**
     * Compiles a script into a sync executor
     */
    const compileExecutor = (
        slot: 'slot1' | 'slot2',
        executorRef: Ref<any>
    ) => {
        const scriptCode = loadScript(slot);
        const name = slot === 'slot1' ? 'Script A' : 'Script B';

        if (!executorRef.value) {
            executorRef.value = new SyncScriptExecutor();
        }

        const result = executorRef.value.compile(scriptCode);

        if (!result.success) {
            // Don't toast on initial load failures - the async worker will handle it
            console.warn(`[SyncExecutor] ${name} compile error:`, result.error);
        }
    };

    // Watch for settings changes and compile executors when needed
    if (process.client) {
        watch(() => [
            settings.value.gameMode,
            settings.value.opponentType,
            settings.value.player1Type,
            settings.value.player2Type
        ], () => {
            const needsA =
                (settings.value.gameMode === 'TRAINING' && settings.value.player1Type === 'CUSTOM_A') ||
                (settings.value.gameMode === 'ARCADE' &&
                    (settings.value.player1Type === 'CUSTOM_A' || settings.value.player2Type === 'CUSTOM_A'));

            const needsB =
                (settings.value.gameMode === 'TRAINING' && settings.value.player1Type === 'CUSTOM_B') ||
                (settings.value.gameMode === 'ARCADE' &&
                    (settings.value.player1Type === 'CUSTOM_B' || settings.value.player2Type === 'CUSTOM_B'));

            if (needsA) compileExecutor('slot1', syncExecutorARef);
            if (needsB) compileExecutor('slot2', syncExecutorBRef);
        }, { immediate: true });
    }

    /**
     * Recompiles both sync executors (called when user saves script)
     */
    const recompileSyncExecutors = () => {
        if (syncExecutorARef.value) {
            const scriptCode = loadScript('slot1');
            const result = syncExecutorARef.value.compile(scriptCode);
            if (result.success) {
                console.log('[SyncExecutor] Script A recompiled successfully');
            }
        }

        if (syncExecutorBRef.value) {
            const scriptCode = loadScript('slot2');
            const result = syncExecutorBRef.value.compile(scriptCode);
            if (result.success) {
                console.log('[SyncExecutor] Script B recompiled successfully');
            }
        }
    };

    return {
        syncExecutorARef,
        syncExecutorBRef,
        recompileSyncExecutors
    };
};
