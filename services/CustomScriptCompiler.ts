/**
 * =============================================================================
 * CUSTOM SCRIPT COMPILER - Compiles User Code into Executable Functions
 * =============================================================================
 * 
 * Compiles user-written JavaScript code into safe, executable functions.
 */

import { InputState } from '../types';
import { FighterState, CompileResult } from './CustomScriptRunner';

/**
 * Compiles user code string into an executable function.
 * 
 * @param userCode - The JavaScript code written by the user
 * @returns An object containing either the compiled function or an error message
 */
export function compileScript(userCode: string): CompileResult {
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
            } catch (runtimeError: any) {
                console.warn('Custom script runtime error:', runtimeError.message);
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

    } catch (syntaxError: any) {
        return {
            compiledDecideFunction: null,
            error: `Syntax Error: ${syntaxError.message}`
        };
    }
}

