/**
 * =============================================================================
 * CUSTOM SCRIPT RUNNER - User-Defined Fighter Logic Execution
 * =============================================================================
 * 
 * This module handles compilation and execution of user-written JavaScript code
 * for custom fighter AI. It provides:
 * - Safe compilation of user code into executable functions
 * - Runtime execution with error handling
 * - A balanced default template for new users
 * - LocalStorage persistence
 * - JSON export/import functionality
 * 
 * SECURITY NOTE:
 * User code runs via `new Function()` which executes in the same context as
 * the page. This is acceptable for a local educational tool.
 * 
 * =============================================================================
 */

import { InputState } from '../types';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * FighterState - Information about a fighter at the current frame
 * This is passed to user scripts so they can make decisions.
 */
export interface FighterState {
    x: number;           // Horizontal position (0 = left, ~800 = right)
    y: number;           // Vertical position (0 = top, ~380 = ground)
    vx: number;          // Horizontal velocity
    vy: number;          // Vertical velocity
    health: number;      // Current health (0-100)
    energy: number;      // Current energy (0-100)
    state: number;       // Current action state (0-7)
    direction: -1 | 1;   // Facing direction
    cooldown: number;    // Frames until next action
    width: number;       // Hitbox width
    height: number;      // Hitbox height
}

/**
 * Result of running a custom script
 */
export interface CustomScriptResult {
    success: boolean;
    error?: string;
    action?: InputState;
}

/**
 * Result of compiling user code
 */
export interface CompileResult {
    fn: ((self: FighterState, opponent: FighterState) => InputState) | null;
    error: string | null;
}

// =============================================================================
// LOCALSTORAGE KEY
// =============================================================================

const STORAGE_KEY = 'neuroevolution-custom-fighter-script';

// =============================================================================
// DEFAULT TEMPLATE
// =============================================================================

/**
 * Returns the default balanced fighter template.
 * This is a simplified version of ScriptedFighter.ts logic,
 * designed to be readable and educational for users.
 */
export function getDefaultTemplate(): string {
    return `/**
 * Custom Fighter AI - Write Your Own Logic!
 * 
 * This function is called every frame (60 times per second).
 * Analyze the game state and return which actions to take.
 * 
 * INPUTS:
 *   self     - Your fighter's state
 *   opponent - Enemy fighter's state
 * 
 * Both have these properties:
 *   - x, y: Position (x: 0-800, y: 0-380 where 380 is ground)
 *   - vx, vy: Velocity
 *   - health: 0-100
 *   - energy: 0-100 (actions cost energy!)
 *   - state: Current action (0=idle, 1=left, 2=right, etc.)
 *   - direction: -1 (facing left) or 1 (facing right)
 *   - cooldown: Frames until you can act again
 * 
 * OUTPUTS (return object with these booleans):
 *   - left/right: Move horizontally
 *   - up: Jump (costs 25 energy)
 *   - down: Crouch (blocks kicks better)
 *   - action1: Punch (quick, 30 energy, 5 damage)
 *   - action2: Kick (slow, 60 energy, 10 damage)
 *   - action3: Block (reduces damage, costs energy/sec)
 */

function decide(self, opponent) {
  // Calculate distance to opponent
  const distance = Math.abs(self.x - opponent.x);
  const opponentToRight = opponent.x > self.x;
  
  // Initialize all actions to false
  let left = false, right = false, up = false, down = false;
  let punch = false, kick = false, block = false;
  
  // === MOVEMENT: Approach if far, back off if too close ===
  if (distance > 200 && self.energy > 30) {
    // Too far - move toward opponent
    if (opponentToRight) right = true;
    else left = true;
  } else if (distance < 50 && Math.random() < 0.3) {
    // Very close - sometimes back away
    if (opponentToRight) left = true;
    else right = true;
  }
  
  // === DEFENSE: Block when opponent is attacking ===
  const opponentAttacking = opponent.cooldown > 15 && opponent.cooldown < 35;
  if (opponentAttacking && distance < 130 && self.energy > 20) {
    block = true;
    left = false;
    right = false;
  }
  
  // === OFFENSE: Attack when in range ===
  if (!block && self.cooldown === 0 && self.energy > 30) {
    // Punch range (close)
    if (distance < 80) {
      if (Math.random() < 0.7) punch = true;
      else if (self.energy > 60) kick = true;
    }
    // Kick range (medium)
    else if (distance < 120 && self.energy > 60) {
      kick = true;
    }
  }
  
  // === JUMP: Dodge low attacks occasionally ===
  if (self.y >= 270 && self.energy > 25 && Math.random() < 0.05) {
    up = true;
  }
  
  return { left, right, up, down, action1: punch, action2: kick, action3: block };
}
`;
}

// =============================================================================
// SCRIPT COMPILATION
// =============================================================================

/**
 * Compiles user code string into an executable function.
 * 
 * The user code should define a `decide(self, opponent)` function.
 * We wrap it and extract that function.
 * 
 * @param code - User's JavaScript code
 * @returns Compiled function or error message
 */
export function compileScript(code: string): CompileResult {
    try {
        // Wrap user code to capture the decide function
        // We execute the user code, then return the decide function
        const wrappedCode = `
      ${code}
      return typeof decide === 'function' ? decide : null;
    `;

        // Create function from string (takes no arguments, returns the decide function)
        const factory = new Function(wrappedCode);
        const decideFn = factory();

        if (!decideFn) {
            return {
                fn: null,
                error: 'No "decide" function found. Make sure you define: function decide(self, opponent) { ... }'
            };
        }

        // Wrap to ensure it returns valid InputState
        const safeFn = (self: FighterState, opponent: FighterState): InputState => {
            try {
                const result = decideFn(self, opponent);

                // Validate and sanitize output
                return {
                    left: Boolean(result?.left),
                    right: Boolean(result?.right),
                    up: Boolean(result?.up),
                    down: Boolean(result?.down),
                    action1: Boolean(result?.action1),
                    action2: Boolean(result?.action2),
                    action3: Boolean(result?.action3),
                };
            } catch (runtimeError: any) {
                // Runtime error - return no actions
                console.warn('Custom script runtime error:', runtimeError.message);
                return { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
            }
        };

        return { fn: safeFn, error: null };
    } catch (syntaxError: any) {
        return {
            fn: null,
            error: `Syntax Error: ${syntaxError.message}`
        };
    }
}

// =============================================================================
// SCRIPT EXECUTION
// =============================================================================

/**
 * Runs a compiled script function with the current game state.
 * 
 * @param fn - Compiled decide function
 * @param self - Current fighter's state
 * @param opponent - Opponent fighter's state
 * @returns Result with success status and action or error
 */
export function runScript(
    fn: (self: FighterState, opponent: FighterState) => InputState,
    self: FighterState,
    opponent: FighterState
): CustomScriptResult {
    try {
        const action = fn(self, opponent);
        return { success: true, action };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            action: { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false }
        };
    }
}

// =============================================================================
// WEB WORKER MANAGER - Secure Sandboxed Execution
// =============================================================================

/**
 * ScriptWorkerManager - Runs user scripts in an isolated Web Worker
 * 
 * Web Workers provide security isolation:
 * - No access to DOM (document, window)
 * - No access to page JavaScript context
 * - Runs in a separate thread
 * 
 * ARCHITECTURE:
 * Since the game loop runs at 60 FPS synchronously and workers are async,
 * we use a "cached action" pattern:
 * 1. Send current state to worker
 * 2. Worker computes action and responds
 * 3. We cache the response
 * 4. Game loop reads the cached action (1 frame latency, ~16ms)
 * 
 * This is imperceptible to players while providing full security isolation.
 */
export class ScriptWorkerManager {
    private worker: Worker | null = null;
    private cachedAction: InputState = { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
    private isCompiled: boolean = false;
    private lastError: string | null = null;

    /**
     * Initialize worker with user code
     * @param code - User's JavaScript code
     * @returns Promise that resolves to compile result
     */
    async compile(code: string): Promise<{ success: boolean; error: string | null }> {
        // Terminate existing worker if any
        this.terminate();

        return new Promise((resolve) => {
            try {
                // Create new worker
                this.worker = new Worker(
                    new URL('./CustomScriptWorker.js', import.meta.url),
                    { type: 'classic' }
                );

                // Handle worker messages
                this.worker.onmessage = (e) => {
                    const { type, success, action, error } = e.data;

                    if (type === 'compiled') {
                        this.isCompiled = success;
                        this.lastError = error || null;
                        resolve({ success, error: error || null });
                    }

                    if (type === 'result') {
                        if (success && action) {
                            this.cachedAction = action;
                        }
                        if (error) {
                            this.lastError = error;
                        }
                    }
                };

                // Handle worker errors
                this.worker.onerror = (e) => {
                    this.lastError = e.message;
                    this.isCompiled = false;
                    resolve({ success: false, error: e.message });
                };

                // Send compile message
                this.worker.postMessage({ type: 'compile', code });

            } catch (err: any) {
                this.lastError = err.message;
                resolve({ success: false, error: err.message });
            }
        });
    }

    /**
     * Request action computation (async, result cached)
     * Call this each frame to keep the cached action fresh
     */
    requestAction(self: FighterState, opponent: FighterState): void {
        if (this.worker && this.isCompiled) {
            this.worker.postMessage({
                type: 'execute',
                self: self,
                opponent: opponent
            });
        }
    }

    /**
     * Get the cached action (sync, for game loop)
     * Returns the most recent computed action
     */
    getAction(): InputState {
        return this.cachedAction;
    }

    /**
     * Check if script is compiled and ready
     */
    isReady(): boolean {
        return this.isCompiled && this.worker !== null;
    }

    /**
     * Get last error message
     */
    getError(): string | null {
        return this.lastError;
    }

    /**
     * Terminate the worker and clean up
     */
    terminate(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.isCompiled = false;
        this.cachedAction = { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
    }
}

// =============================================================================
// PERSISTENCE - LocalStorage
// =============================================================================

/**
 * Saves user script to localStorage
 */
export function saveScript(code: string): void {
    try {
        localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
        console.warn('Failed to save script to localStorage:', e);
    }
}

/**
 * Loads user script from localStorage
 * @returns Saved code or null if not found
 */
export function loadScript(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
        console.warn('Failed to load script from localStorage:', e);
        return null;
    }
}

// =============================================================================
// EXPORT / IMPORT - JSON Files
// =============================================================================

/**
 * Exports script as downloadable JSON
 * @param code - Script code to export
 */
export function exportScript(code: string): void {
    const data = {
        version: 1,
        type: 'neuroevolution-fighter-script',
        code: code,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-fighter-script.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Imports script from JSON string
 * @param jsonString - JSON content to parse
 * @returns Parsed code or null if invalid
 */
export function importScript(jsonString: string): string | null {
    try {
        const data = JSON.parse(jsonString);

        if (data.type !== 'neuroevolution-fighter-script' || typeof data.code !== 'string') {
            return null;
        }

        return data.code;
    } catch (e) {
        console.warn('Failed to parse imported script:', e);
        return null;
    }
}
