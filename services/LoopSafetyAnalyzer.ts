/**
 * =============================================================================
 * LOOP SAFETY ANALYZER - Detects Dangerous Infinite Loops in User Scripts
 * =============================================================================
 * 
 * CRITICAL FOR SYNCHRONOUS EXECUTION:
 * Since scripts now run synchronously on the main thread (Option A), infinite
 * loops will freeze the entire game. This module analyzes user code and blocks
 * compilation if dangerous patterns are detected.
 * 
 * DANGEROUS PATTERNS DETECTED:
 * - while(true) without break
 * - for(;;) without break
 * - do { } while(true) without break
 * - while(1) or while("truthy") without break
 * 
 * =============================================================================
 */

import * as acorn from 'acorn';

/**
 * Result of loop safety analysis
 */
export interface LoopSafetyResult {
    safe: boolean;
    error: string | null;
    dangerousLoops: Array<{
        line: number;
        type: string;
        reason: string;
    }>;
}

/**
 * Analyzes JavaScript code for potentially infinite loops.
 * 
 * @param userCode - The user's script code
 * @returns Analysis result with safety status and details
 */
export function analyzeLoopSafety(userCode: string): LoopSafetyResult {
    const dangerousLoops: LoopSafetyResult['dangerousLoops'] = [];

    try {
        // Parse the code into an Abstract Syntax Tree (AST)
        const ast = acorn.parse(userCode, {
            ecmaVersion: 2020,
            locations: true // Include line/column info
        });

        // Walk through the AST looking for loop nodes
        walkAST(ast, (node: any) => {
            // Check while loops: while(condition) { }
            if (node.type === 'WhileStatement') {
                const hasBreak = containsBreakOrReturn(node.body);
                const alwaysTrue = isAlwaysTruthy(node.test);

                if (alwaysTrue && !hasBreak) {
                    dangerousLoops.push({
                        line: node.loc?.start.line || 0,
                        type: 'while',
                        reason: 'Infinite while loop detected (condition always true, no break/return)'
                    });
                }
            }

            // Check for loops: for(;;) { } or for(init; test; update) { }
            if (node.type === 'ForStatement') {
                const hasBreak = containsBreakOrReturn(node.body);
                const noTest = !node.test; // for(;;) has no test
                const alwaysTrue = node.test && isAlwaysTruthy(node.test);

                if ((noTest || alwaysTrue) && !hasBreak) {
                    dangerousLoops.push({
                        line: node.loc?.start.line || 0,
                        type: 'for',
                        reason: 'Infinite for loop detected (no exit condition or always true, no break/return)'
                    });
                }
            }

            // Check do-while loops: do { } while(condition)
            if (node.type === 'DoWhileStatement') {
                const hasBreak = containsBreakOrReturn(node.body);
                const alwaysTrue = isAlwaysTruthy(node.test);

                if (alwaysTrue && !hasBreak) {
                    dangerousLoops.push({
                        line: node.loc?.start.line || 0,
                        type: 'do-while',
                        reason: 'Infinite do-while loop detected (condition always true, no break/return)'
                    });
                }
            }
        });

        if (dangerousLoops.length > 0) {
            const errorLines = dangerousLoops.map(loop => `Line ${loop.line}: ${loop.reason}`).join('\n');
            return {
                safe: false,
                error: `🚫 INFINITE LOOP DETECTED\n\n${errorLines}\n\nFix: Add a break statement or return inside the loop.`,
                dangerousLoops
            };
        }

        return {
            safe: true,
            error: null,
            dangerousLoops: []
        };

    } catch (parseError) {
        // If we can't parse the code, let the compiler catch it later
        // (syntax errors will be caught during compilation)
        return {
            safe: true,
            error: null,
            dangerousLoops: []
        };
    }
}

/**
 * Recursively walks an AST and calls visitor on each node
 */
function walkAST(node: any, visitor: (node: any) => void): void {
    if (!node || typeof node !== 'object') return;

    visitor(node);

    // Recursively visit all child nodes
    for (const key in node) {
        if (key === 'loc' || key === 'range') continue; // Skip metadata
        const child = node[key];

        if (Array.isArray(child)) {
            child.forEach(item => walkAST(item, visitor));
        } else if (typeof child === 'object') {
            walkAST(child, visitor);
        }
    }
}

/**
 * Checks if a loop body contains a break or return statement
 */
function containsBreakOrReturn(body: any): boolean {
    let hasExit = false;

    walkAST(body, (node: any) => {
        if (node.type === 'BreakStatement' || node.type === 'ReturnStatement') {
            hasExit = true;
        }
    });

    return hasExit;
}

/**
 * Checks if a test condition is always truthy
 */
function isAlwaysTruthy(test: any): boolean {
    if (!test) return false;

    // Literal true, 1, "string", etc.
    if (test.type === 'Literal') {
        return Boolean(test.value);
    }

    // Identifier: true (literal identifier)
    if (test.type === 'Identifier' && test.name === 'true') {
        return true;
    }

    // UnaryExpression: !false
    if (test.type === 'UnaryExpression' && test.operator === '!' && test.argument.type === 'Literal') {
        return !test.argument.value;
    }

    return false;
}
