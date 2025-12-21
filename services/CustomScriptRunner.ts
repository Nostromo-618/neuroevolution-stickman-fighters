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
 * FighterState - Information about a fighter at the current frame.
 * 
 * This object is passed to user scripts so they can analyze the game state
 * and make decisions about what actions to take.
 * 
 * USAGE EXAMPLE:
 * ```javascript
 * function decide(self, opponent) {
 *   // Access fighter properties like this:
 *   console.log(self.health);     // Your health: 0-100
 *   console.log(opponent.x);      // Opponent's horizontal position
 *   console.log(self.energy);     // Your energy for attacks
 * }
 * ```
 */
export interface FighterState {
    /** Horizontal position in pixels (0 = left edge, ~800 = right edge) */
    x: number;

    /** Vertical position in pixels (0 = top of screen, ~380 = ground level) */
    y: number;

    /** Horizontal velocity - positive = moving right, negative = moving left */
    vx: number;

    /** Vertical velocity - positive = moving down, negative = moving up (jumping) */
    vy: number;

    /** Current health points (0 = dead, 100 = full health) */
    health: number;

    /** Current energy for actions (0 = empty, 100 = full). Attacks cost energy! */
    energy: number;

    /** 
     * Current action/animation state as a number:
     * 0 = idle, 1 = moving left, 2 = moving right, 3 = jumping,
     * 4 = crouching, 5 = punching, 6 = kicking, 7 = blocking
     */
    state: number;

    /** Which direction the fighter is facing: -1 = facing left, 1 = facing right */
    direction: -1 | 1;

    /** Frames remaining until the fighter can perform another action (0 = ready) */
    cooldown: number;

    /** Width of the fighter's collision hitbox in pixels */
    width: number;

    /** Height of the fighter's collision hitbox in pixels */
    height: number;
}

/**
 * CustomScriptResult - The outcome of running a custom script.
 * 
 * After executing user code, we get back this object that tells us:
 * - Did the script run successfully?
 * - What actions should the fighter take?
 * - If it failed, what went wrong?
 */
export interface CustomScriptResult {
    /** Whether the script executed without errors */
    success: boolean;

    /** Error message if something went wrong (only present when success = false) */
    error?: string;

    /** The actions the fighter should take (only meaningful when success = true) */
    action?: InputState;
}

/**
 * CompileResult - The outcome of compiling user code.
 * 
 * Before we can run user code, we need to "compile" it - convert the text
 * into an executable function. This result tells us if that worked.
 */
export interface CompileResult {
    /** 
     * The compiled function that can be called with fighter states.
     * Will be null if compilation failed.
     */
    compiledDecideFunction: ((self: FighterState, opponent: FighterState) => InputState) | null;

    /** Error message explaining what went wrong (null if compilation succeeded) */
    error: string | null;
}

// =============================================================================
// LOCALSTORAGE KEY
// =============================================================================

/**
 * The key we use to store the user's script in the browser's localStorage.
 * This lets the script persist even after closing the browser.
 */
const LOCALSTORAGE_SCRIPT_KEY = 'neuroevolution-custom-fighter-script';

// =============================================================================
// DEFAULT TEMPLATE
// =============================================================================

/**
 * Returns the default balanced fighter template.
 * 
 * This is a simplified version of ScriptedFighter.ts logic,
 * designed to be readable and educational for users.
 * 
 * WHY THIS EXISTS:
 * When a user first opens the script editor, they need a working example
 * to learn from. This template demonstrates all the key concepts:
 * - How to read fighter state
 * - How to calculate distance
 * - How to return actions
 * 
 * @returns A string containing JavaScript code for a basic fighter AI
 */
export function getDefaultTemplate(): string {
    return `/**
 * ============================================================
 * CUSTOM FIGHTER AI - Write Your Own Logic!
 * ============================================================
 * 
 * This function runs every frame (60 times per second).
 * Look at what's happening in the game, then decide what to do!
 * 
 * ============================================================
 * INPUTS - Information you receive:
 * ============================================================
 * 
 *   self     = Your fighter (the one you're controlling)
 *   opponent = The enemy fighter
 * 
 * Both fighters have these properties:
 * 
 *   PROPERTY     MEANING                              RANGE
 *   ─────────────────────────────────────────────────────────
 *   x            Horizontal position                  0 to 800
 *   y            Vertical position (380 = ground)     0 to 380
 *   vx           Horizontal speed                     varies
 *   vy           Vertical speed                       varies
 *   health       Hit points remaining                 0 to 100
 *   energy       Power for attacks                    0 to 100
 *   cooldown     Frames until you can act again       0 = ready!
 *   direction    Which way you're facing              -1 or 1
 * 
 * ============================================================
 * OUTPUTS - Actions you can take:
 * ============================================================
 * 
 *   ACTION       WHAT IT DOES                         ENERGY COST
 *   ─────────────────────────────────────────────────────────────
 *   left         Move left                            free
 *   right        Move right                           free
 *   up           Jump                                 25 energy
 *   down         Crouch (blocks kicks better)         free
 *   action1      Punch (quick, 5 damage)              30 energy
 *   action2      Kick (slow, 10 damage)               60 energy
 *   action3      Block (reduces damage taken)         drains energy
 * 
 * ============================================================
 */

function decide(self, opponent) {
  
  // ============================================================
  // STEP 1: Analyze the situation
  // ============================================================
  
  // How far away is the opponent? (in pixels)
  const distanceToOpponent = Math.abs(self.x - opponent.x);
  
  // Which direction is the opponent?
  const opponentIsToMyRight = opponent.x > self.x;
  const opponentIsToMyLeft = opponent.x < self.x;
  
  // Am I on the ground? (can only jump from ground)
  const GROUND_LEVEL = 270;
  const iAmOnTheGround = self.y >= GROUND_LEVEL;
  
  // Am I ready to act? (cooldown must be 0)
  const iAmReadyToAct = self.cooldown === 0;
  
  // Is opponent in the middle of an attack animation?
  // (Their cooldown will be between these values during attack)
  const ATTACK_ANIMATION_START_FRAME = 15;
  const ATTACK_ANIMATION_END_FRAME = 35;
  const opponentIsCurrentlyAttacking = 
      opponent.cooldown > ATTACK_ANIMATION_START_FRAME && 
      opponent.cooldown < ATTACK_ANIMATION_END_FRAME;
  
  
  // ============================================================
  // STEP 2: Initialize all actions to "don't do this"
  // ============================================================
  
  // Movement actions
  let moveLeft = false;
  let moveRight = false;
  let jump = false;
  let crouch = false;
  
  // Attack/defense actions  
  let doPunch = false;
  let doKick = false;
  let doBlock = false;
  
  
  // ============================================================
  // STEP 3: Decide on MOVEMENT
  // ============================================================
  
  // Distance thresholds (in pixels)
  const TOO_FAR_AWAY = 200;      // Need to get closer
  const TOO_CLOSE = 50;          // Might want to back up
  const MINIMUM_ENERGY_FOR_CHASE = 30;
  
  // If opponent is far away, move toward them
  if (distanceToOpponent > TOO_FAR_AWAY && self.energy > MINIMUM_ENERGY_FOR_CHASE) {
    if (opponentIsToMyRight) {
      moveRight = true;
    } else {
      moveLeft = true;
    }
  }
  
  // If opponent is very close, sometimes back away (30% chance)
  const shouldRetreat = Math.random() < 0.3;  // Random chance each frame
  if (distanceToOpponent < TOO_CLOSE && shouldRetreat) {
    if (opponentIsToMyRight) {
      moveLeft = true;   // Back away to the left
    } else {
      moveRight = true;  // Back away to the right
    }
  }
  
  
  // ============================================================
  // STEP 4: Decide on DEFENSE
  // ============================================================
  
  const BLOCK_RANGE = 130;           // How close before we block
  const MINIMUM_ENERGY_TO_BLOCK = 20;
  
  // Block if: opponent is attacking AND they're close AND we have energy
  const shouldBlock = 
      opponentIsCurrentlyAttacking && 
      distanceToOpponent < BLOCK_RANGE && 
      self.energy > MINIMUM_ENERGY_TO_BLOCK;
  
  if (shouldBlock) {
    doBlock = true;
    // Stop moving while blocking (focus on defense)
    moveLeft = false;
    moveRight = false;
  }
  
  
  // ============================================================
  // STEP 5: Decide on OFFENSE
  // ============================================================
  
  const PUNCH_RANGE = 80;            // Close range for punches
  const KICK_RANGE = 120;            // Medium range for kicks
  const MINIMUM_ENERGY_FOR_PUNCH = 30;
  const MINIMUM_ENERGY_FOR_KICK = 60;
  
  // Only attack if: not blocking AND ready to act AND have energy
  const canAttack = !doBlock && iAmReadyToAct && self.energy > MINIMUM_ENERGY_FOR_PUNCH;
  
  if (canAttack) {
    // Close range: prefer punch (70% chance), sometimes kick
    if (distanceToOpponent < PUNCH_RANGE) {
      const preferPunch = Math.random() < 0.7;
      if (preferPunch) {
        doPunch = true;
      } else if (self.energy > MINIMUM_ENERGY_FOR_KICK) {
        doKick = true;
      }
    }
    // Medium range: use kick (longer reach)
    else if (distanceToOpponent < KICK_RANGE && self.energy > MINIMUM_ENERGY_FOR_KICK) {
      doKick = true;
    }
  }
  
  
  // ============================================================
  // STEP 6: Decide on JUMPING
  // ============================================================
  
  const MINIMUM_ENERGY_TO_JUMP = 25;
  const JUMP_CHANCE = 0.05;  // 5% chance each frame = occasional jumps
  
  // Sometimes jump to dodge attacks or mix up movement
  const shouldJump = 
      iAmOnTheGround && 
      self.energy > MINIMUM_ENERGY_TO_JUMP && 
      Math.random() < JUMP_CHANCE;
  
  if (shouldJump) {
    jump = true;
  }
  
  
  // ============================================================
  // STEP 7: Return the final decision
  // ============================================================
  
  // This object tells the game which "buttons" to press this frame
  return {
    left: moveLeft,       // Press left arrow?
    right: moveRight,     // Press right arrow?
    up: jump,             // Press jump?
    down: crouch,         // Press crouch?
    action1: doPunch,     // Press punch button?
    action2: doKick,      // Press kick button?
    action3: doBlock      // Press block button?
  };
}
`;
}

// =============================================================================
// SCRIPT COMPILATION
// =============================================================================

/**
 * Compiles user code string into an executable function.
 * 
 * HOW IT WORKS (step by step):
 * 1. We take the user's code (a string of JavaScript)
 * 2. We wrap it in extra code that extracts the "decide" function
 * 3. We use JavaScript's `new Function()` to convert the string into real code
 * 4. We wrap the result in a "safe" function that catches errors
 * 
 * WHY WE USE `new Function()`:
 * This is the simplest way to turn a string into executable code.
 * It's similar to `eval()` but slightly safer because it doesn't
 * have access to our local variables.
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * const userCode = 'function decide(self, opponent) { return { left: true }; }';
 * const result = compileScript(userCode);
 * if (result.compiledDecideFunction) {
 *   const action = result.compiledDecideFunction(myFighter, enemy);
 * }
 * ```
 * 
 * @param userCode - The JavaScript code written by the user
 * @returns An object containing either the compiled function or an error message
 */
export function compileScript(userCode: string): CompileResult {
    try {
        // STEP 1: Wrap the user's code so we can extract the "decide" function
        // We execute their code, then return the decide function if it exists
        const wrappedCode = `
      ${userCode}
      return typeof decide === 'function' ? decide : null;
    `;

        // STEP 2: Create a "factory" function from the wrapped code
        // `new Function(code)` creates a function that will execute the code
        // Think of it like: function factory() { <wrappedCode here> }
        const factoryFunction = new Function(wrappedCode);

        // STEP 3: Call the factory to get the user's decide function
        const userDecideFunction = factoryFunction();

        // STEP 4: Check if the user actually defined a "decide" function
        if (!userDecideFunction) {
            return {
                compiledDecideFunction: null,
                error: 'No "decide" function found. Make sure you define: function decide(self, opponent) { ... }'
            };
        }

        // STEP 5: Wrap the user's function in a "safe" version that:
        // - Catches any errors during execution
        // - Ensures the return value is always a valid InputState object
        // This prevents bad user code from crashing the game
        const safeDecideFunction = (self: FighterState, opponent: FighterState): InputState => {
            try {
                // Call the user's function
                const userResult = userDecideFunction(self, opponent);

                // Convert the user's result to a valid InputState
                // Using Boolean() ensures each value is true or false, even if
                // the user returned undefined, null, or some other weird value
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
                // If the user's code throws an error while running,
                // log it and return "do nothing" so the game doesn't crash
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

        // Success! Return the safe wrapper function
        return { compiledDecideFunction: safeDecideFunction, error: null };

    } catch (syntaxError: any) {
        // This catches errors in the user's code syntax (like missing brackets)
        // These happen when `new Function()` tries to parse the code
        return {
            compiledDecideFunction: null,
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
 * This is a simple wrapper that calls the compiled function and
 * catches any unexpected errors that might slip through.
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * const compiled = compileScript(userCode);
 * if (compiled.compiledDecideFunction) {
 *   const result = runScript(compiled.compiledDecideFunction, myFighter, enemy);
 *   if (result.success) {
 *     applyActions(result.action);
 *   }
 * }
 * ```
 * 
 * @param compiledDecideFunction - The compiled decide function from compileScript()
 * @param selfFighter - Current fighter's state (the one running the script)
 * @param opponentFighter - Opponent fighter's state
 * @returns Result with success status and either the action or an error
 */
export function runScript(
    compiledDecideFunction: (self: FighterState, opponent: FighterState) => InputState,
    selfFighter: FighterState,
    opponentFighter: FighterState
): CustomScriptResult {
    try {
        const action = compiledDecideFunction(selfFighter, opponentFighter);
        return { success: true, action };
    } catch (unexpectedError: any) {
        // This should rarely happen since the compiled function already has error handling,
        // but we include it as a safety net
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

// =============================================================================
// WEB WORKER MANAGER - Secure Sandboxed Execution
// =============================================================================

/**
 * ScriptWorkerManager - Runs user scripts in an isolated Web Worker.
 * 
 * WHAT IS A WEB WORKER?
 * A Web Worker is like a separate JavaScript program running alongside your page.
 * It runs in its own thread (parallel processing) and critically, it CANNOT access:
 * - The DOM (document, window, etc.)
 * - Your page's JavaScript variables
 * - Anything on the page really
 * 
 * WHY DO WE USE IT?
 * Security! If a user writes malicious code like `document.body.innerHTML = ''`,
 * it won't work in a Worker because `document` doesn't exist there.
 * 
 * THE CHALLENGE: ASYNC VS SYNC
 * The game loop runs 60 times per second and needs actions IMMEDIATELY (synchronously).
 * But Web Workers are asynchronous - you send a message and wait for a response.
 * 
 * THE SOLUTION: "CACHED ACTION" PATTERN
 * 1. Each frame, we send the current game state to the worker
 * 2. The worker computes the action and sends it back
 * 3. We CACHE (store) that response
 * 4. The game loop reads the CACHED action (not waiting for a new one)
 * 
 * This means there's a 1-frame delay (~16ms) between sending state and getting
 * the updated action. This is completely imperceptible to players!
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * const workerManager = new ScriptWorkerManager();
 * 
 * // Compile the user's script
 * await workerManager.compile(userCode);
 * 
 * // In your game loop:
 * workerManager.requestAction(myFighter, enemy);  // Send state (async)
 * const action = workerManager.getAction();        // Get cached result (sync)
 * 
 * // When done:
 * workerManager.terminate();
 * ```
 */
export class ScriptWorkerManager {
    /**
     * The actual Web Worker instance that runs user code.
     * null when no worker is active.
     */
    private workerInstance: Worker | null = null;

    /**
     * The most recently computed action from the worker.
     * This is what the game loop reads - it's always available synchronously.
     * Defaults to "do nothing" until the first real action is computed.
     */
    private cachedAction: InputState = {
        left: false,
        right: false,
        up: false,
        down: false,
        action1: false,
        action2: false,
        action3: false
    };

    /**
     * Whether the user's script has been successfully compiled in the worker.
     * We check this before trying to execute the script.
     */
    private scriptIsCompiled: boolean = false;

    /**
     * The last error message from compilation or execution.
     * null if everything is working fine.
     */
    private lastErrorMessage: string | null = null;

    /**
     * Initialize the worker with user code and compile it.
     * 
     * This creates a new Web Worker, sends the user's code to it,
     * and waits for confirmation that compilation succeeded.
     * 
     * @param userCode - The JavaScript code written by the user
     * @returns Promise that resolves to an object indicating success/failure
     */
    async compile(userCode: string): Promise<{ success: boolean; error: string | null }> {
        // If there's an existing worker, terminate it first to clean up
        this.terminate();

        // Return a Promise because we need to wait for the worker's response
        return new Promise((resolvePromise) => {
            try {
                // Create a new Web Worker from the worker script file
                // The URL constructor with import.meta.url ensures the path works
                // regardless of how the page is hosted
                this.workerInstance = new Worker(
                    new URL('./CustomScriptWorker.js', import.meta.url),
                    { type: 'classic' }  // Use classic script mode (not ES modules)
                );

                // Set up the message handler to receive responses from the worker
                this.workerInstance.onmessage = (messageEvent) => {
                    // The worker sends back different types of messages
                    const { type, success, action, error } = messageEvent.data;

                    // Handle compilation result
                    if (type === 'compiled') {
                        this.scriptIsCompiled = success;
                        this.lastErrorMessage = error || null;
                        resolvePromise({ success, error: error || null });
                    }

                    // Handle execution result (action computed by the script)
                    if (type === 'result') {
                        if (success && action) {
                            // Update the cached action with the new computed action
                            this.cachedAction = action;
                        }
                        if (error) {
                            this.lastErrorMessage = error;
                        }
                    }
                };

                // Set up error handler for unexpected worker errors
                this.workerInstance.onerror = (errorEvent) => {
                    this.lastErrorMessage = errorEvent.message;
                    this.scriptIsCompiled = false;
                    resolvePromise({ success: false, error: errorEvent.message });
                };

                // Send the compile command to the worker
                this.workerInstance.postMessage({ type: 'compile', code: userCode });

            } catch (setupError: any) {
                // This catches errors in creating the worker itself
                this.lastErrorMessage = setupError.message;
                resolvePromise({ success: false, error: setupError.message });
            }
        });
    }

    /**
     * Request the worker to compute a new action based on current game state.
     * 
     * This is ASYNCHRONOUS - it sends the state to the worker but doesn't wait
     * for a response. The response will update cachedAction when it arrives.
     * 
     * Call this every frame to keep the cached action fresh.
     * 
     * @param selfFighter - The fighter running this script
     * @param opponentFighter - The opponent fighter
     */
    requestAction(selfFighter: FighterState, opponentFighter: FighterState): void {
        // Only send if we have a worker and it has a compiled script
        if (this.workerInstance && this.scriptIsCompiled) {
            this.workerInstance.postMessage({
                type: 'execute',
                self: selfFighter,
                opponent: opponentFighter
            });
        }
    }

    /**
     * Get the cached action (SYNCHRONOUS - for use in the game loop).
     * 
     * This returns immediately with the most recently computed action.
     * It doesn't wait for the worker - that's the whole point!
     * 
     * @returns The most recently computed InputState action
     */
    getAction(): InputState {
        return this.cachedAction;
    }

    /**
     * Check if the script is compiled and ready to execute.
     * 
     * @returns true if we can call requestAction(), false otherwise
     */
    isReady(): boolean {
        return this.scriptIsCompiled && this.workerInstance !== null;
    }

    /**
     * Get the last error message (if any).
     * 
     * @returns Error message string, or null if no error
     */
    getError(): string | null {
        return this.lastErrorMessage;
    }

    /**
     * Terminate the worker and clean up all resources.
     * 
     * Call this when you're done with the worker, or before creating a new one.
     * It's important to terminate workers you're not using to free up memory
     * and CPU resources.
     */
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

// =============================================================================
// PERSISTENCE - LocalStorage
// =============================================================================

// Keys for localStorage
const LOCALSTORAGE_SCRIPT_KEY_PREFIX = 'neuroevolution_fighter_script_';

/**
 * Saves user script to the browser's localStorage.
 * 
 * @param scriptCode - The JavaScript code to save
 * @param slotId - The slot identifier (e.g., 'slot1', 'slot2')
 */
export function saveScript(scriptCode: string, slotId: string = 'slot1'): void {
    try {
        localStorage.setItem(`${LOCALSTORAGE_SCRIPT_KEY_PREFIX}${slotId}`, scriptCode);
    } catch (storageError) {
        // This can fail if localStorage is full or disabled
        console.warn('Failed to save script to localStorage:', storageError);
    }
}

/**
 * Loads user script from the browser's localStorage.
 * If no saved script exists, returns the default template so scripts work out-of-the-box.
 * 
 * @param slotId - The slot identifier (e.g., 'slot1', 'slot2')
 * @returns The saved script code, or default template if nothing was saved
 */
export function loadScript(slotId: string = 'slot1'): string {
    try {
        const saved = localStorage.getItem(`${LOCALSTORAGE_SCRIPT_KEY_PREFIX}${slotId}`);
        return saved || getDefaultTemplate();
    } catch (storageError) {
        console.warn('Failed to load script from localStorage:', storageError);
        return getDefaultTemplate();
    }
}

// =============================================================================
// EXPORT / IMPORT - JSON Files
// =============================================================================

/**
 * Exports the user's script as a downloadable JSON file.
 * 
 * HOW IT WORKS:
 * 1. Create a JavaScript object with the script code and metadata
 * 2. Convert it to a JSON string
 * 3. Create a "Blob" (a chunk of data) from the string
 * 4. Create a temporary download link and click it programmatically
 * 
 * @param scriptCode - The script code to export
 */
export function exportScript(scriptCode: string): void {
    // Create the data object with metadata
    const exportData = {
        version: 1,                                  // Version number for future compatibility
        type: 'neuroevolution-fighter-script',       // Identifier to validate on import
        code: scriptCode,                            // The actual script code
        exportedAt: new Date().toISOString()         // When it was exported
    };

    // Convert to a nicely formatted JSON string (2-space indentation)
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a Blob (Binary Large Object) from the JSON string
    // This is like creating a virtual file in memory
    const fileBlob = new Blob([jsonString], { type: 'application/json' });

    // Create a URL that points to our in-memory blob
    const downloadUrl = URL.createObjectURL(fileBlob);

    // Create a temporary invisible download link
    const downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.download = 'custom-fighter-script.json';  // Suggested filename

    // Add to page, click it (starts download), then remove it
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up the blob URL to free memory
    URL.revokeObjectURL(downloadUrl);
}

/**
 * Imports a script from a JSON string (typically from a file).
 * 
 * Validates that the JSON has the correct format before returning the code.
 * 
 * @param jsonString - The JSON content to parse (from reading a .json file)
 * @returns The extracted script code, or null if the format is invalid
 */
export function importScript(jsonString: string): string | null {
    try {
        // Try to parse the JSON string into an object
        const parsedData = JSON.parse(jsonString);

        // Validate that it's actually a fighter script file
        const isValidType = parsedData.type === 'neuroevolution-fighter-script';
        const hasCodeString = typeof parsedData.code === 'string';

        if (!isValidType || !hasCodeString) {
            // The file exists but isn't a valid fighter script
            return null;
        }

        // Everything looks good, return the code
        return parsedData.code;

    } catch (parseError) {
        // The JSON was malformed (syntax error)
        console.warn('Failed to parse imported script:', parseError);
        return null;
    }
}
