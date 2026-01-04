import { Fighter } from './GameEngine';
import { ScriptWorkerManager } from './CustomScriptRunner';
import { SyncScriptExecutor } from './SyncScriptExecutor';
import type { Genome, TrainingSettings } from '../types';
import { createRandomNetwork } from './NeuralNetwork';
import { COLORS } from './Config';

export class MatchSetup {
    static createFighter(
        type: 'HUMAN' | 'SIMPLE_AI' | 'SCRIPTED' | 'CUSTOM_A' | 'CUSTOM_B',
        x: number,
        defaultColor: string,
        isP2: boolean,
        settings: TrainingSettings,
        workers: {
            workerA: ScriptWorkerManager | null,
            workerB: ScriptWorkerManager | null
        },
        bestGenome: Genome | null,
        syncExecutors?: {
            executorA: SyncScriptExecutor | null,
            executorB: SyncScriptExecutor | null
        }
    ): Fighter {
        // 1. HUMAN
        if (type === 'HUMAN') {
            return new Fighter(x, COLORS.HUMAN, false);
        }

        // 2. SIMPLE AI (Standard 13-node Neural Network)
        if (type === 'SIMPLE_AI') {
            const genomeToUse = bestGenome || { id: 'simple-ai', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
            return new Fighter(x, COLORS.SIMPLE_AI, true, genomeToUse);
        }

        // 3. CUSTOM SCRIPT A
        if (type === 'CUSTOM_A') {
            const f = new Fighter(x, COLORS.CUSTOM_A, false);
            f.isCustom = true;
            // Option A (Timing Fairness): Prefer sync executor for equal timing with AI
            if (syncExecutors?.executorA && syncExecutors.executorA.isReady()) {
                f.syncScriptExecutor = syncExecutors.executorA;
            }
            // Fallback to async worker (legacy, has timing issues at high speeds)
            if (workers.workerA) {
                f.scriptWorker = workers.workerA;
            }
            return f;
        }

        // 4. CUSTOM SCRIPT B
        if (type === 'CUSTOM_B') {
            const f = new Fighter(x, COLORS.CUSTOM_B, false);
            f.isCustom = true;
            // Option A (Timing Fairness): Prefer sync executor for equal timing with AI
            if (syncExecutors?.executorB && syncExecutors.executorB.isReady()) {
                f.syncScriptExecutor = syncExecutors.executorB;
            }
            // Fallback to async worker (legacy, has timing issues at high speeds)
            if (workers.workerB) {
                f.scriptWorker = workers.workerB;
            }
            return f;
        }

        // Fallback
        return new Fighter(x, defaultColor, false);
    }
}
