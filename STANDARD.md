# Project Coding Standard - Stability & Safety Rules

This project adheres to a strict set of 10 stability and safety rules, adapted from NASA JPL's "Power of 10" standards for modern TypeScript/React applications.

## 1. Simple Control Flow & State Machines
* **No Recursion:** Recursive functions are prohibited in logic. Use explicit `for`, `while`, or `.reduce()` loops to prevent stack overflow issues.
* **State Machines over Booleans:** Avoid "Boolean Soup" (e.g., `isLoading`, `isError`). Explicitly define UI states (e.g., `status: 'idle' | 'fetching' | 'success'`) to make invalid states impossible.
* **Guard Clauses:** Use early returns (`if (!data) return`) to keep the main logic flow at the lowest possible indentation level.
* **Linear Flow:** Prefer shallow nesting. Use `async/await` instead of callbacks or nested `.then()` blocks to maintain linear readability.

## 2. Predictable Iteration
* **No Infinite Loops:** `while (true)` is forbidden.
* **Safety Limits:** Every loop must have a statically provable or runtime-enforced upper bound. If processing unknown data sizes, implement a safety counter (e.g., `maxIterations: 1000`) that throws an error if exceeded.
* **Game Loop Safety:** High-frequency updates must be decoupled from rendering logic and wrapped in boundary-check logic to prevent "execution lock" on the main thread.

## 3. High-Performance Memory Management
* **Object Pooling (Engine):** In performance-critical sections (game loop, evolution cycles), reuse object instances instead of creating new ones to minimize Garbage Collection (GC) pressure.
    * *Note:* Do not pool React Props/State, as React relies on new object references to trigger re-renders.
* **Stable Shapes:** Initialize all class properties in the constructor. Avoid adding dynamic properties to objects at runtime to allow the engine to use optimized hidden classes.
* **React Optimization:** Use `React.memo`, `useMemo`, and `useCallback` strategically in the hot-path (canvas/controls), but strictly ensure dependency arrays are exhaustive.

## 4. Function & Component Granularity
* **One Page Rule:** No function or React component should exceed 60 lines of logic.
* **Single Responsibility:** If a component grows large, separate "View" (JSX) from "Logic" (Hooks). Extract logic into a custom `useFeature` hook.
* **Hook Composition:** Extract complex state logic into dedicated, testable hooks that return data/methods, not JSX.

## 5. Strict Assertion Density
* **Type Safety:** Explicitly type all function signatures. Avoid implicit `any`.
* **Two-Assert Guideline:** Aim for at least two assertions per non-trivial function to enforce pre-conditions (inputs) and post-conditions (results).
* **Fail Fast:** Throw a specific `InvariantError` immediately upon detecting an invalid internal state. Do not return `null` or `false` silently.
    * *Implementation:* Use the project's `assert(condition, message)` helper to enforce type narrowing (see Addendum).
* **Runtime Validation:** Use **Zod** for external boundary validation (API responses, LocalStorage).

## 6. Encapsulated Scope
* **Zero Globals:** Never attach data to `window` or `global`.
* **State Localization:** Keep state as close as possible to where it is used. Favor Component State over Context, and Context over Global Stores, unless broad synchronization is required.
* **Const by Default:** Always use `const`. Use `let` only when re-assignment is explicitly required for loop or logic state.

## 7. Explicit Result Handling
* **No Floating Promises:** Every Promise must be `await`ed or have a `.catch()` handler to prevent unhandled rejections.
* **Unmount Safety:** Async actions in `useEffect` must check if the component is still mounted before setting state, or use `AbortController` to cancel stale requests.
* **Return Status:** If a function can fail, it should return a descriptive `Result` object or throw a typed error.

## 8. Explicit Type Simplicity
* **No Magic Values:** All "magic" numbers and strings must be stored in `services/Config.ts` or as local constants.
* **Readable Types:** Favor explicit interfaces and types over complex, nested conditional types. Code must be readable by a human, not just the compiler.

## 9. Immutability & Reference Safety
* **Readonly Parameters:** Treat all objects passed as parameters as read-only. Use `Readonly<T>` in function signatures where appropriate.
* **State Purity:** In React, never mutate state or props directly. Use spread operators or `structuredClone` for deep updates.
* **Pure Functions:** Logic in `classes/` and `services/` should be pure where possible, making testing and debugging predictable.

## 10. Zero Warning Policy
* **Strict Mode:** `strict: true` is mandatory in `tsconfig.json`.
* **Exhaustive Dependencies:** You must not silence `react-hooks/exhaustive-deps`. If a dependency is missing, fix the logic or use the `useEvent` pattern; do not lie to the linter.
* **Linter Compliance:** No `// eslint-disable` comments. Fix the root cause or refine the rule project-wide. `any` and `@ts-ignore` require a documented justification block.

---

# Addendum: Required Helper Code

To satisfy **Rule 5 (Fail Fast)**, include the following helper utility in `src/utils/assert.ts`.

```typescript
// src/utils/assert.ts

class InvariantError extends Error {
  constructor(message: string) {
    super(`Invariant Violation: ${message}`);
    this.name = 'InvariantError';
  }
}

/**
 * NASA Rule 5: "Fail Fast" Assertion Helper.
 * Asserts that a condition is truthy. If not, throws a hard error.
 * This explicitly narrates to the compiler that the condition is true
 * for the remainder of the scope, removing the need for optional chaining.
 *
 * @param condition - The boolean check (must be true)
 * @param message - Descriptive error of what went wrong (no magic strings)
 */
export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    // Optional: Log to telemetry before crashing
    console.error(`CRITICAL ASSERTION FAILURE: ${message}`);
    throw new InvariantError(message);
  }
}

/**
 * Helper to ensure a value is defined (not null/undefined).
 * Useful for game entities that "should" always have data.
 */
export function assertDefined<T>(
  value: T | null | undefined, 
  name: string
): asserts value is T {
  assert(value !== null && value !== undefined, `${name} must be defined`);
}