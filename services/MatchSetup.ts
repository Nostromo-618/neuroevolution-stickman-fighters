import { Fighter } from './GameEngine';
import { ScriptWorkerManager } from './CustomScriptRunner';
import type { Genome, TrainingSettings } from '../types';
import { createRandomNetwork } from './NeuralNetwork';
import { getChuckGenome } from './ChuckAI';
import { COLORS } from './Config';

export class MatchSetup {
    static createFighter(
        type: 'HUMAN' | 'SIMPLE_AI' | 'CHUCK_AI' | 'SCRIPTED' | 'CUSTOM_A' | 'CUSTOM_B',
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
            return new Fighter(x, COLORS.HUMAN, false);
        }

        // 2. SIMPLE AI (Standard 13-node Neural Network)
        if (type === 'SIMPLE_AI') {
            const genomeToUse = bestGenome || { id: 'simple-ai', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
            return new Fighter(x, COLORS.SIMPLE_AI, true, genomeToUse);
        }

        // 3. CHUCK AI (Advanced 64-node Adaptive Neural Network)
        if (type === 'CHUCK_AI') {
            const chuckGenome = getChuckGenome();
            const fighter = new Fighter(x, COLORS.CHUCK_AI, true, chuckGenome);
            fighter.isChuckAI = true; // Mark for special handling
            return fighter;
        }

        // 4. CUSTOM SCRIPT A
        if (type === 'CUSTOM_A') {
            const f = new Fighter(x, COLORS.CUSTOM_A, false);
            const worker = workers.workerA;
            if (worker && worker.isReady()) {
                f.isCustom = true;
                f.scriptWorker = worker;
            } else {
                f.isCustom = true; // Fallback
            }
            return f;
        }

        // 5. CUSTOM SCRIPT B
        if (type === 'CUSTOM_B') {
            const f = new Fighter(x, COLORS.CUSTOM_B, false);
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

