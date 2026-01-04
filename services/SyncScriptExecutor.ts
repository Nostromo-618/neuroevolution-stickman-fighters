/**
 * =============================================================================
 * SYNC SCRIPT EXECUTOR - Synchronous Script Execution for Timing Fairness
 * =============================================================================
 * 
 * This module provides synchronous script execution to achieve timing parity
 * with neural network AI. The Web Worker approach (ScriptWorkerManager) has
 * inherent async latency that causes unfairness at high simulation speeds.
 * 
 * TIMING FAIRNESS PROBLEM:
 * - Web Workers can only respond once per browser frame
 * - At 100x sim speed, Script gets 1 decision while AI gets 100
 * - This causes AI to win ~95% at high speeds despite Script being stronger
 * 
 * SOLUTION: Execute scripts synchronously in the main thread, just like AI.
 * 
 * SAFETY CONSIDERATIONS:
 * - Infinite loop detection in CustomScriptCompiler prevents save/compile
 * - Runtime errors are caught and return neutral actions
 * - Scripts have limited execution context (no access to window/document)
 * 
 * =============================================================================
 */

import type { InputState } from '../types';
import type { FighterState, CompileResult } from './CustomScriptRunner';
import { compileScript } from './CustomScriptCompiler';

/**
 * Result of synchronous script execution
 */
export interface SyncExecutionResult {
    success: boolean;
    action: InputState;
    error?: string;
}

/**
 * SyncScriptExecutor - Executes user scripts synchronously on the main thread.
 * 
 * This class stores a compiled script function and executes it synchronously
 * when `execute()` is called. This achieves timing parity with the neural
 * network AI, which also computes synchronously.
 */
export class SyncScriptExecutor {
    private compiledFn: ((self: FighterState, opponent: FighterState) => InputState) | null = null;
    private lastError: string | null = null;
    private isCompiled: boolean = false;

    /**
     * Compiles user script code into an executable function.
     * 
     * @param userCode - The JavaScript code written by the user
     * @returns Compilation result with success status
     */
    compile(userCode: string): { success: boolean; error: string | null } {
        try {
            const result: CompileResult = compileScript(userCode);

            if (result.error || !result.compiledDecideFunction) {
                this.lastError = result.error || 'Failed to compile script';
                this.isCompiled = false;
                this.compiledFn = null;
                return { success: false, error: this.lastError };
            }

            this.compiledFn = result.compiledDecideFunction;
            this.isCompiled = true;
            this.lastError = null;
            return { success: true, error: null };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.lastError = errorMessage;
            this.isCompiled = false;
            this.compiledFn = null;
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Executes the compiled script synchronously.
     * 
     * IMPORTANT: This runs on the main thread, so the script MUST complete
     * quickly. Infinite loop detection should prevent problematic scripts
     * from being saved/compiled in the first place.
     * 
     * @param self - Current fighter's state
     * @param opponent - Opponent fighter's state
     * @returns InputState with the script's decisions
     */
    execute(self: FighterState, opponent: FighterState): InputState {
        // Default neutral action
        const neutralAction: InputState = {
            left: false,
            right: false,
            up: false,
            down: false,
            action1: false,
            action2: false,
            action3: false
        };

        if (!this.isCompiled || !this.compiledFn) {
            return neutralAction;
        }

        try {
            // Execute synchronously - this is the key to timing fairness
            return this.compiledFn(self, opponent);
        } catch (runtimeError) {
            const errorMessage = runtimeError instanceof Error ? runtimeError.message : String(runtimeError);
            console.warn('[SyncScriptExecutor] Runtime error:', errorMessage);
            this.lastError = errorMessage;
            return neutralAction;
        }
    }

    /**
     * Checks if the executor has a compiled function ready.
     */
    isReady(): boolean {
        return this.isCompiled && this.compiledFn !== null;
    }

    /**
     * Gets the last error message.
     */
    getError(): string | null {
        return this.lastError;
    }

    /**
     * Gets the compiled function (for testing/debugging).
     */
    getCompiledFunction(): ((self: FighterState, opponent: FighterState) => InputState) | null {
        return this.compiledFn;
    }
}
