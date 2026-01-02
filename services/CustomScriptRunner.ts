/**
 * =============================================================================
 * CUSTOM SCRIPT RUNNER - User-Defined Fighter Logic Execution
 * =============================================================================
 * 
 * This module coordinates custom script execution. Functions are split into
 * separate modules for better organization:
 * - CustomScriptCompiler.ts - Compilation logic
 * - CustomScriptExecutor.ts - Execution logic
 * - CustomScriptStorage.ts - Storage and file I/O
 * - templates/defaultFighterScript.ts - Default template
 * 
 * This file maintains backward compatibility by re-exporting all functions
 * and contains the ScriptWorkerManager class for Web Worker execution.
 * 
 * =============================================================================
 */

import type { InputState } from '../types';
import CustomScriptWorker from './CustomScriptWorker.js?worker';

// Re-export functions from separate modules
export { compileScript } from './CustomScriptCompiler';
export { runScript } from './CustomScriptExecutor';
export { saveScript, loadScript, exportScript, importScript } from './CustomScriptStorage';
import { DEFAULT_FIGHTER_SCRIPT } from '../templates/defaultFighterScript';
import { DEFAULT_FIGHTER_SCRIPT_B } from '../templates/defaultFighterScriptB';

/**
 * Returns the default script template for a given slot.
 * - slot1 (Script A): Strategic, logical fighter template
 * - slot2 (Script B): Chaotic, randomized fighter template
 * 
 * @param slotId - Optional slot identifier (defaults to 'slot1')
 * @returns The default script template for that slot
 */
export function getDefaultTemplate(slotId?: string): string {
    if (slotId === 'slot2') {
        return DEFAULT_FIGHTER_SCRIPT_B;
    }
    return DEFAULT_FIGHTER_SCRIPT;
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * FighterState - Information about a fighter at the current frame.
 */
export interface FighterState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    health: number;
    energy: number;
    state: number;
    direction: -1 | 1;
    cooldown: number;
    width: number;
    height: number;
}

/**
 * CustomScriptResult - The outcome of running a custom script.
 */
export interface CustomScriptResult {
    success: boolean;
    error?: string;
    action?: InputState;
}

/**
 * CompileResult - The outcome of compiling user code.
 */
export interface CompileResult {
    compiledDecideFunction: ((self: FighterState, opponent: FighterState) => InputState) | null;
    error: string | null;
}

// =============================================================================
// WEB WORKER MANAGER - Secure Sandboxed Execution
// =============================================================================

/**
 * ScriptWorkerManager - Runs user scripts in an isolated Web Worker.
 * 
 * Uses a "cached action" pattern to provide synchronous access to
 * asynchronous worker results in the game loop.
 */
export class ScriptWorkerManager {
    private workerInstance: Worker | null = null;
    private cachedAction: InputState = {
        left: false,
        right: false,
        up: false,
        down: false,
        action1: false,
        action2: false,
        action3: false
    };
    private scriptIsCompiled: boolean = false;
    private lastErrorMessage: string | null = null;

    async compile(userCode: string): Promise<{ success: boolean; error: string | null }> {
        this.terminate();

        return new Promise((resolvePromise) => {
            try {
                this.workerInstance = new CustomScriptWorker();
                if (!this.workerInstance) throw new Error('Worker creation failed');
                const worker = this.workerInstance;

                worker.onmessage = (messageEvent) => {
                    const { type, success, action, error } = messageEvent.data;

                    if (type === 'compiled') {
                        this.scriptIsCompiled = success;
                        this.lastErrorMessage = error || null;
                        resolvePromise({ success, error: error || null });
                    }

                    if (type === 'result') {
                        if (success && action) {
                            this.cachedAction = action;
                        }
                        if (error) {
                            this.lastErrorMessage = error;
                        }
                    }
                };

                worker.onerror = (errorEvent) => {
                    this.lastErrorMessage = errorEvent.message;
                    this.scriptIsCompiled = false;
                    resolvePromise({ success: false, error: errorEvent.message });
                };

                worker.postMessage({ type: 'compile', code: userCode });

            } catch (setupError) {
                const errorMessage = setupError instanceof Error ? setupError.message : String(setupError);
                this.lastErrorMessage = errorMessage;
                resolvePromise({ success: false, error: errorMessage });
            }
        });
    }

    requestAction(selfFighter: FighterState, opponentFighter: FighterState): void {
        if (this.workerInstance && this.scriptIsCompiled) {
            this.workerInstance.postMessage({
                type: 'execute',
                self: selfFighter,
                opponent: opponentFighter
            });
        }
    }

    getAction(): InputState {
        return this.cachedAction;
    }

    isReady(): boolean {
        return this.scriptIsCompiled && this.workerInstance !== null;
    }

    getError(): string | null {
        return this.lastErrorMessage;
    }

    terminate(): void {
        if (this.workerInstance) {
            this.workerInstance.terminate();
            this.workerInstance = null;
        }
        this.scriptIsCompiled = false;
        this.cachedAction = {
            left: false,
            right: false,
            up: false,
            down: false,
            action1: false,
            action2: false,
            action3: false
        };
    }
}
