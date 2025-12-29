/**
 * =============================================================================
 * ASSERTION UTILITIES - Fail Fast (STANDARD Rule 5)
 * =============================================================================
 * 
 * These utilities implement the "Fail Fast" principle from our coding standards.
 * When an invalid state is detected, we throw immediately with a clear error
 * rather than returning null/undefined and letting bugs propagate silently.
 * 
 * Benefits:
 * - Bugs are caught earlier, closer to their source
 * - TypeScript can narrow types after assertions
 * - Error messages are clear and actionable
 * - No more defensive optional chaining everywhere
 * 
 * =============================================================================
 */

/**
 * Custom error class for assertion failures.
 * Makes it easy to distinguish invariant violations from other errors.
 */
export class InvariantError extends Error {
    constructor(message: string) {
        super(`Invariant Violation: ${message}`);
        this.name = 'InvariantError';
    }
}

/**
 * Asserts that a condition is truthy. If not, throws an InvariantError.
 * 
 * This function is a "type assertion" - after calling it, TypeScript
 * knows that the condition is true for the rest of the scope.
 * 
 * @example
 * ```ts
 * const fighter = getFighter();
 * assert(fighter !== null, 'Fighter must exist');
 * // TypeScript now knows fighter is not null
 * fighter.attack(); // No optional chaining needed!
 * ```
 * 
 * @param condition - The condition to check (must be truthy)
 * @param message - Descriptive error message explaining what went wrong
 * @throws {InvariantError} If condition is falsy
 */
export function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        console.error(`CRITICAL ASSERTION FAILURE: ${message}`);
        throw new InvariantError(message);
    }
}

/**
 * Asserts that a value is defined (not null or undefined).
 * 
 * This is a specialized version of assert() for the common case of
 * checking that a value exists before using it.
 * 
 * @example
 * ```ts
 * const genome = genomes.find(g => g.id === id);
 * assertDefined(genome, 'genome');
 * // TypeScript now knows genome is Genome, not Genome | undefined
 * genome.fitness += 100;
 * ```
 * 
 * @param value - The value to check
 * @param name - Name of the variable (for error messages)
 * @throws {InvariantError} If value is null or undefined
 */
export function assertDefined<T>(
    value: T | null | undefined,
    name: string
): asserts value is T {
    assert(value !== null && value !== undefined, `${name} must be defined`);
}

/**
 * Asserts that a value is a non-empty string.
 * 
 * @param value - The value to check
 * @param name - Name of the variable (for error messages)
 * @throws {InvariantError} If value is not a non-empty string
 */
export function assertNonEmptyString(
    value: unknown,
    name: string
): asserts value is string {
    assert(
        typeof value === 'string' && value.length > 0,
        `${name} must be a non-empty string`
    );
}

/**
 * Asserts that a number is within a valid range.
 * 
 * @param value - The number to check
 * @param min - Minimum allowed value (inclusive)
 * @param max - Maximum allowed value (inclusive)
 * @param name - Name of the variable (for error messages)
 * @throws {InvariantError} If value is outside the range
 */
export function assertInRange(
    value: number,
    min: number,
    max: number,
    name: string
): void {
    assert(
        value >= min && value <= max,
        `${name} must be between ${min} and ${max}, got ${value}`
    );
}

/**
 * Type-safe exhaustive check for switch statements.
 * 
 * Use this in the default case of a switch to ensure all cases are handled.
 * If a new case is added to the union type but not handled, TypeScript
 * will show a compile-time error.
 * 
 * @example
 * ```ts
 * type Mode = 'TRAINING' | 'ARCADE';
 * function handleMode(mode: Mode) {
 *   switch (mode) {
 *     case 'TRAINING': return train();
 *     case 'ARCADE': return play();
 *     default: assertNever(mode);
 *   }
 * }
 * ```
 * 
 * @param value - The value that should be of type `never`
 * @throws {InvariantError} Always (this should never be reached)
 */
export function assertNever(value: never): never {
    throw new InvariantError(`Unexpected value: ${JSON.stringify(value)}`);
}
