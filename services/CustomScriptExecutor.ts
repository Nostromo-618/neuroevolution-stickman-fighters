/**
 * =============================================================================
 * CUSTOM SCRIPT EXECUTOR - Executes Compiled Script Functions
 * =============================================================================
 * 
 * Runs compiled script functions with error handling.
 */

import type { FighterState, CustomScriptResult } from './CustomScriptRunner';
import type { InputState } from '../types';

/**
 * Runs a compiled script function with the current game state.
 * 
 * @param compiledDecideFunction - The compiled decide function from compileScript()
 * @param selfFighter - Current fighter's state (the one running the script)
 * @param opponentFighter - Opponent fighter's state
 * @returns Result with success status and either the action or an error
 */
export function runScript(
    compiledDecideFunction: (self: FighterState, opponentFighter: FighterState) => InputState,
    selfFighter: FighterState,
    opponentFighter: FighterState
): CustomScriptResult {
    try {
        const action = compiledDecideFunction(selfFighter, opponentFighter);
        return { success: true, action };
    } catch (unexpectedError: any) {
        return {
            success: false,
            error: unexpectedError.message,
            action: {
                left: false,
                right: false,
                up: false,
                down: false,
                action1: false,
                action2: false,
                action3: false
            }
        };
    }
}

