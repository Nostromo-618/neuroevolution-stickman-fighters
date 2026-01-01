/**
 * =============================================================================
 * INPUT MANAGER - Player Control Handler
 * =============================================================================
 * 
 * Handles all player input from keyboard and gamepad controllers.
 * Provides a unified InputState interface regardless of input device.
 * 
 * SUPPORTED INPUT METHODS:
 * 1. Keyboard (WASD and Arrow keys)
 * 2. Gamepad (D-pad, analog sticks, and buttons)
 * 
 * KEYBOARD CONTROLS:
 * - Move: Arrow Keys or WASD
 * - Punch: J
 * - Kick: K
 * - Block: L
 * 
 * GAMEPAD CONTROLS (Standard layout):
 * - Move: D-pad or Left Stick
 * - Punch: X or A button
 * - Kick: Y or B button
 * - Block: RB, LB, or RT
 * 
 * INPUT POLLING VS EVENTS:
 * This uses a hybrid approach:
 * - Keyboard: Events track key down/up state in a Set
 * - Gamepad: Polled each frame via navigator.getGamepads()
 * 
 * ===========================================================================
 */

import type { InputState } from '../types';

// =============================================================================
// INPUT MANAGER CLASS
// =============================================================================

/**
 * InputManager
 * 
 * Singleton-like class that tracks player input state.
 * Create one instance and call getState() each frame to poll inputs.
 * 
 * Usage:
 * ```
 * const input = new InputManager();
 * 
 * // In game loop:
 * const state = input.getState();
 * if (state.left) player.moveLeft();
 * 
 * // On cleanup:
 * input.destroy();
 * ```
 */
export class InputManager {
  /** Set of currently pressed keyboard keys (by key code) */
  keys: Set<string> = new Set();

  /** Index of connected gamepad (null if none) */
  gamepadIndex: number | null = null;

  /** Touch input state for mobile controls */
  touchState: InputState = {
    left: false, right: false, up: false, down: false,
    action1: false, action2: false, action3: false
  };

  // === EVENT HANDLERS ===
  // Arrow functions to preserve 'this' context when used as callbacks

  /** Handler for keydown events - adds key to pressed set */
  private handleKeyDown = (e: KeyboardEvent) => this.keys.add(e.code);

  /** Handler for keyup events - removes key from pressed set */
  private handleKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code);

  /** Handler for gamepad connection - stores gamepad index */
  private handleGamepadConnected = (e: GamepadEvent) => {
    console.log('Gamepad connected at index %d: %s.', e.gamepad.index, e.gamepad.id);
    this.gamepadIndex = e.gamepad.index;
  };

  /**
   * Creates an InputManager and starts listening for input events
   */
  constructor() {
    // Register keyboard event listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Register gamepad connection listener
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
  }

  /**
   * Cleans up event listeners
   * 
   * IMPORTANT: Call this when the InputManager is no longer needed
   * to prevent memory leaks from lingering event listeners.
   */
  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
  }

  /**
   * Polls the current input state
   * 
   * Returns a snapshot of all control inputs at this moment.
   * Combines keyboard and gamepad inputs (either source triggers the action).
   * 
   * KEYBOARD MAPPING:
   * - Arrow Left / A → left
   * - Arrow Right / D → right
   * - Arrow Up / W → up (jump)
   * - Arrow Down / S → down (crouch)
   * - J → action1 (punch)
   * - K → action2 (kick)
   * - L → action3 (block)
   * 
   * GAMEPAD MAPPING (Standard Gamepad):
   * - D-pad/Left Stick → directional
   * - Button 0 (A) / Button 2 (X) → punch
   * - Button 1 (B) / Button 3 (Y) → kick
   * - Button 4 (LB) / Button 5 (RB) / Button 7 (RT) → block
   * 
   * @returns Current InputState with all control flags
   */
  getState(): InputState {
    // === KEYBOARD INPUT ===
    const kbState = {
      left: this.keys.has('ArrowLeft') || this.keys.has('KeyA'),
      right: this.keys.has('ArrowRight') || this.keys.has('KeyD'),
      up: this.keys.has('ArrowUp') || this.keys.has('KeyW'),
      down: this.keys.has('ArrowDown') || this.keys.has('KeyS'),
      action1: this.keys.has('KeyJ'), // Punch
      action2: this.keys.has('KeyK'), // Kick
      action3: this.keys.has('KeyL'), // Block
    };

    // === TOUCH INPUT ===
    // Used for on-screen mobile controls
    if (this.touchState) {
      kbState.left = kbState.left || this.touchState.left;
      kbState.right = kbState.right || this.touchState.right;
      kbState.up = kbState.up || this.touchState.up;
      kbState.down = kbState.down || this.touchState.down;
      kbState.action1 = kbState.action1 || this.touchState.action1;
      kbState.action2 = kbState.action2 || this.touchState.action2;
      kbState.action3 = kbState.action3 || this.touchState.action3;
    }

    // === GAMEPAD INPUT ===
    // Only check if a gamepad is connected
    if (this.gamepadIndex !== null) {
      const gp = navigator.getGamepads()[this.gamepadIndex];

      if (gp) {
        // Read analog stick values (with null checks)
        // axes[0] = left stick X (-1 to 1)
        // axes[1] = left stick Y (-1 to 1)
        const axisX = gp.axes[0] ?? 0;
        const axisY = gp.axes[1] ?? 0;

        // Apply deadzone (0.5) to prevent drift
        // Combine with keyboard input (either source triggers action)
        return {
          // Directional: analog stick, D-pad, OR keyboard
          left: kbState.left || axisX < -0.5 || (gp.buttons[14]?.pressed ?? false),   // D-pad left
          right: kbState.right || axisX > 0.5 || (gp.buttons[15]?.pressed ?? false),  // D-pad right
          up: kbState.up || axisY < -0.5 || (gp.buttons[12]?.pressed ?? false),       // D-pad up
          down: kbState.down || axisY > 0.5 || (gp.buttons[13]?.pressed ?? false),    // D-pad down

          // Action buttons: multiple mappings for flexibility
          action1: kbState.action1 || (gp.buttons[2]?.pressed ?? false) || (gp.buttons[0]?.pressed ?? false), // X or A
          action2: kbState.action2 || (gp.buttons[3]?.pressed ?? false) || (gp.buttons[1]?.pressed ?? false), // Y or B
          action3: kbState.action3 || (gp.buttons[5]?.pressed ?? false) || (gp.buttons[4]?.pressed ?? false) || (gp.buttons[7]?.pressed ?? false), // RB, LB, or RT
        };
      }
    }

    // Return keyboard/touch state if no gamepad
    return kbState;
  }

  /**
   * Updates only specific fields of the touch state.
   * Useful for handling individual button presses/releases.
   */
  setTouchState(updates: Partial<InputState>) {
    this.touchState = { ...this.touchState, ...updates };
  }
}