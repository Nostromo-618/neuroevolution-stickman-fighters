/**
 * =============================================================================
 * CUSTOM SCRIPT COMPILER - Compiles User Code into Executable Functions
 * =============================================================================
 * 
 * Compiles user-written JavaScript code into safe, executable functions.
 * 
 * SAFETY (Phase 2):
 * Before compilation, analyzes code for infinite loops using AST analysis.
 * Blocks compilation if dangerous patterns (while(true) without break) detected.
 */

import type { InputState } from '../types';
import type { FighterState, CompileResult } from './CustomScriptRunner';
import { analyzeLoopSafety } from './LoopSafetyAnalyzer';

/**
 * Compiles user code string into an executable function.
 * 
 * PHASE 2 SAFETY: Now includes infinite loop detection before compilation.
 * Scripts with while(true), for(;;), etc. without break statements are rejected.
 * 
 * @param userCode - The JavaScript code written by the user
 * @returns An object containing either the compiled function or an error message
 */
export function compileScript(userCode: string): CompileResult {
    // === PHASE 2: INFINITE LOOP DETECTION ===
    // CRITICAL: Must check before compilation since scripts now run synchronously.
    // An infinite loop will freeze the entire game.
    const loopSafety = analyzeLoopSafety(userCode);

    if (!loopSafety.safe) {
        return {
            compiledDecideFunction: null,
            error: loopSafety.error || 'Dangerous loop detected'
        };
    }

    try {
        const wrappedCode = `
      ${userCode}
      return typeof decide === 'function' ? decide : null;
    `;

        const factoryFunction = new Function(wrappedCode);
        const userDecideFunction = factoryFunction();

        if (!userDecideFunction) {
            return {
                compiledDecideFunction: null,
                error: 'No "decide" function found. Make sure you define: function decide(self, opponent) { ... }'
            };
        }

        const safeDecideFunction = (self: FighterState, opponent: FighterState): InputState => {
            try {
                const userResult = userDecideFunction(self, opponent);
                return {
                    left: Boolean(userResult?.left),
                    right: Boolean(userResult?.right),
                    up: Boolean(userResult?.up),
                    down: Boolean(userResult?.down),
                    action1: Boolean(userResult?.action1),
                    action2: Boolean(userResult?.action2),
                    action3: Boolean(userResult?.action3),
                };
            } catch (runtimeError) {
                const errorMessage = runtimeError instanceof Error ? runtimeError.message : String(runtimeError);
                console.warn('Custom script runtime error:', errorMessage);
                return {
                    left: false,
                    right: false,
                    up: false,
                    down: false,
                    action1: false,
                    action2: false,
                    action3: false
                };
            }
        };

        return { compiledDecideFunction: safeDecideFunction, error: null };

    } catch (syntaxError) {
        const errorMessage = syntaxError instanceof Error ? syntaxError.message : String(syntaxError);
        return {
            compiledDecideFunction: null,
            error: `Syntax Error: ${errorMessage}`
        };
    }
}
