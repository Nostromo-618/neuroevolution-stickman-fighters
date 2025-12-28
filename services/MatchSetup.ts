import { Fighter } from './GameEngine';
import { ScriptWorkerManager } from './CustomScriptRunner';
import { Genome, TrainingSettings } from '../types';
import { createRandomNetwork } from './NeuralNetwork';

export class MatchSetup {
    static createFighter(
        type: 'HUMAN' | 'AI' | 'SCRIPTED' | 'CUSTOM_A' | 'CUSTOM_B',
        x: number,
        defaultColor: string,
        isP2: boolean,
        settings: TrainingSettings,
        workers: {
            workerA: ScriptWorkerManager | null,
            workerB: ScriptWorkerManager | null
        },
        bestGenome: Genome | null
    ): Fighter {
        // 1. HUMAN
        if (type === 'HUMAN') {
            return new Fighter(x, '#22c55e', false); // Always green for human
        }

        // 2. AI (Neural Network)
        if (type === 'AI') {
            const genomeToUse = bestGenome || { id: 'cpu', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
            return new Fighter(x, defaultColor, true, genomeToUse);
        }

        // 3. CUSTOM SCRIPT A
        if (type === 'CUSTOM_A') {
            const f = new Fighter(x, '#a855f7', false);
            const worker = workers.workerA;
            if (worker && worker.isReady()) {
                f.isCustom = true;
                f.scriptWorker = worker;
            } else {
                f.isCustom = true; // Fallback
            }
            return f;
        }

        // 4. CUSTOM SCRIPT B
        if (type === 'CUSTOM_B') {
            const f = new Fighter(x, '#14b8a6', false);
            const worker = workers.workerB;
            if (worker && worker.isReady()) {
                f.isCustom = true;
                f.scriptWorker = worker;
            } else {
                f.isCustom = true; // Fallback
            }
            return f;
        }

        // Fallback
        return new Fighter(x, defaultColor, false);
    }
}
