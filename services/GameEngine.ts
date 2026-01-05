/**
 * =============================================================================
 * GAME ENGINE - Fighter Physics & Combat System
 * =============================================================================
 * 
 * This module implements the core game mechanics including:
 * - Fighter class with physics simulation
 * - Combat system (attacks, blocks, damage)
 * - AI decision-making integration
 * - Fitness shaping for training
 * 
 * =============================================================================
 */

import { FighterAction } from '../types';
import type { Genome, InputState, FitnessConfig } from '../types';
import { predict } from './NeuralNetwork';
import { ScriptWorkerManager } from './CustomScriptRunner';
import { SyncScriptExecutor } from './SyncScriptExecutor';
import type { FighterState as CustomFighterState } from './CustomScriptRunner';
import { FeedForwardNetwork } from '../classes/FeedForwardNetwork';
import { applyFitnessShaping } from './FitnessShaping';

// =============================================================================
// GAMEPLAY CONSTANTS
// =============================================================================

import { ENERGY, WORLD } from './Config';

const GRAVITY = WORLD.GRAVITY;
const FRICTION = WORLD.FRICTION;
const GROUND_Y = WORLD.GROUND_Y;
const CANVAS_WIDTH = WORLD.CANVAS_WIDTH;
const CANVAS_HEIGHT = WORLD.CANVAS_HEIGHT;

export { CANVAS_WIDTH, CANVAS_HEIGHT };

// =============================================================================
// FIGHTER CLASS
// =============================================================================

/**
 * Fighter Class
 * 
 * Represents a combatant in the arena. Can be controlled by:
 * - Human player (via InputManager)
 * - AI (via neural network predictions)
 * - Custom Script (via SyncScriptExecutor for timing fairness)
 * 
 * The Fighter handles its own physics and state management,
 * making it self-contained for simulation.
 */
export class Fighter {
  // --- Position & Dimensions ---
  x: number;              // Horizontal position (left edge)
  y: number;              // Vertical position (top edge)
  vx: number = 0;         // Horizontal velocity (pixels/frame)
  vy: number = 0;         // Vertical velocity (pixels/frame)
  public lastInputs: number[] = []; // Stores the last inputs fed to the NN for visualization
  width: number = 55;     // Fighter hitbox width
  height: number = 110;   // Fighter hitbox height

  // --- Identity ---
  color: string;          // Display color (CSS color string)
  isAi: boolean;          // True if controlled by neural network

  isCustom: boolean;      // True if controlled by user custom script
  scriptWorker: ScriptWorkerManager | null = null; // Web Worker (async fallback)
  syncScriptExecutor: SyncScriptExecutor | null = null; // Sync executor (preferred for timing fairness)
  genome?: Genome;        // AI brain (only set for AI fighters)

  // --- Combat Stats ---
  health: number = 100;   // Current health (0 = dead)
  energy: number = ENERGY.MAX;   // Energy for actions (regenerates over time)
  state: FighterAction = FighterAction.IDLE;  // Current action/animation state
  direction: -1 | 1 = 1;  // Facing direction: 1 = right, -1 = left

  // --- Combat State ---
  /** 
   * Active hitbox for the current attack
   * Only exists during attack active frames
   * Set to null when no attack is active
   */
  hitbox: { x: number, y: number, w: number, h: number } | null = null;

  /** 
   * Action cooldown in frames
   * Counts down each frame
   * Fighter is "animation locked" while cooldown > 15
   */
  cooldown: number = 0;

  /**
   * TIMING FAIRNESS: Delayed AI Action
   * 
   * To match the Script's inherent 1-tick latency (async worker),
   * AI decisions are also delayed by 1 tick:
   * - `pendingAiInput`: The decision computed THIS tick, to be used NEXT tick
   * - `currentAiInput`: The decision computed LAST tick, used THIS tick
   * 
   * This ensures both AI and Script react with the same latency.
   */
  private pendingAiInput: InputState | null = null;
  private currentAiInput: InputState | null = null;

  /**
   * Creates a new Fighter
   * 
   * @param x - Starting X position
   * @param color - Display color for rendering
   * @param isAi - Whether this fighter is AI-controlled
   * @param genome - Optional AI genome (required if isAi is true)
   */
  constructor(x: number, color: string, isAi: boolean, genome?: Genome) {
    this.x = x;
    this.y = GROUND_Y - this.height;  // Start on the ground
    this.color = color;
    this.isAi = isAi;

    this.isCustom = false;    // Default to false; set to true externally for custom fighters
    this.genome = genome;
  }

  /**
   * Main update loop - called every frame
   *
   * This is the heart of the fighter simulation:
   * 1. Handle death state physics
   * 2. Process AI decisions (if AI)
   * 3. Apply fitness shaping rewards (training)
   * 4. Handle energy regeneration
   * 5. Process input and state changes
   * 6. Activate hitboxes during attacks
   * 7. Apply physics integration
   * 8. Enforce boundaries
   *
   * @param input - Control signals (from human or passed through for AI)
   * @param opponent - Reference to the other fighter
   * @param fitnessConfig - Optional fitness configuration for training
   */
  update(input: InputState, opponent: Fighter, fitnessConfig?: FitnessConfig) {
    // === DEATH PHYSICS ===
    if (this.handleDeathState()) return;

    // === AI/SCRIPTED DECISION MAKING WITH TIMING FAIRNESS ===
    // Both AI and Script use a 1-tick delayed decision pattern.
    // This ensures fair timing between sync (AI) and async (Script) controllers.
    let activeInput = input;

    if (this.isCustom && this.scriptWorker) {
      // Script: Uses worker's cached action (inherently 1-tick delayed)
      // Also requests next action for future tick
      activeInput = this.processCustom(opponent);
    } else if (this.isAi && this.genome) {
      // AI: Use PREVIOUS tick's decision (currentAiInput)
      // Compute THIS tick's decision for NEXT tick (pendingAiInput)

      // Step 1: Shift pending → current (use last tick's decision)
      this.currentAiInput = this.pendingAiInput;

      // Step 2: Compute new decision for next tick
      this.pendingAiInput = this.processAi(opponent);

      // Step 3: Use the delayed decision (or no-op if first tick)
      activeInput = this.currentAiInput || { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };

      if (fitnessConfig) {
        applyFitnessShaping(this, opponent, this.genome, fitnessConfig);
      }
    }

    // === UPDATE LOOP ===
    this.updateEnergyAndCooldowns();
    this.handleMovementAndStates(activeInput);
    this.handleAttacks(activeInput);
    this.updateHitboxes();
    this.updatePhysicsBounding();
  }

  // ===========================================================================
  // PRIVATE HELPER METHODS (Decomposed from update loop)
  // ===========================================================================

  /** Handles death physics (ragdoll). Returns true if dead. */
  private handleDeathState(): boolean {
    if (this.health > 0) return false;

    this.y += this.vy;
    this.vy += GRAVITY;
    if (this.y > GROUND_Y - 40) {
      this.y = GROUND_Y - 40;  // Lying down height
      this.vx *= 0.5;          // Slide friction
      this.vy = 0;
    } else {
      this.x += this.vx;      // Fly when knocked in air
    }
    return true;
  }


  /** Updates energy regeneration and action cooldowns */
  private updateEnergyAndCooldowns(): void {
    if (this.cooldown > 0) this.cooldown--;

    const isIdle = Math.abs(this.vx) < 0.5 && this.state === FighterAction.IDLE;
    const regenRate = isIdle ? ENERGY.REGEN_IDLE : ENERGY.REGEN_ACTIVE;
    if (this.energy < ENERGY.MAX) this.energy += regenRate;
  }

  /** Handles movement logic and state transitions (Jump, Crouch, Block, Move) */
  private handleMovementAndStates(activeInput: InputState): void {
    const isAnimationLocked = this.cooldown > 5;
    if (isAnimationLocked) return;

    // MOVEMENT
    if (activeInput.left && this.energy >= ENERGY.COST_MOVE) {
      this.vx -= 1.5;
      this.energy -= ENERGY.COST_MOVE;
      this.direction = -1;
      this.state = FighterAction.MOVE_LEFT;
    } else if (activeInput.right && this.energy >= ENERGY.COST_MOVE) {
      this.vx += 1.5;
      this.energy -= ENERGY.COST_MOVE;
      this.direction = 1;
      this.state = FighterAction.MOVE_RIGHT;
    } else {
      this.state = FighterAction.IDLE;
    }

    // JUMP
    if (activeInput.up && this.y >= GROUND_Y - this.height - 1 && this.energy >= ENERGY.COST_JUMP) {
      this.vy = -18;
      this.energy -= ENERGY.COST_JUMP;
      this.state = FighterAction.JUMP;
    }

    // CROUCH
    if (activeInput.down && this.y >= GROUND_Y - this.height - 1 && this.energy >= ENERGY.COST_CROUCH) {
      this.state = FighterAction.CROUCH;
      this.energy -= ENERGY.COST_CROUCH;
      this.vx *= 0.5;
    }

    // BLOCK
    if (activeInput.action3 && this.energy >= ENERGY.COST_BLOCK) {
      this.state = FighterAction.BLOCK;
      this.energy -= ENERGY.COST_BLOCK;
      this.vx *= 0.3;
    }
  }

  /** Handles attack initiation (Punch, Kick) */
  private handleAttacks(activeInput: InputState): void {
    if (this.cooldown > 0) return;

    if (activeInput.action1 && this.energy >= ENERGY.COST_PUNCH) {
      this.state = FighterAction.PUNCH;
      this.vx *= 0.2;
      this.cooldown = 20;
      this.energy -= ENERGY.COST_PUNCH;
    } else if (activeInput.action2 && this.energy >= ENERGY.COST_KICK) {
      this.state = FighterAction.KICK;
      this.vx *= 0.2;
      this.cooldown = 20;
      this.energy -= ENERGY.COST_KICK;
    }
  }

  /** Updates active hitbox based on current animation state */
  private updateHitboxes(): void {
    this.hitbox = null;

    if (this.state === FighterAction.PUNCH && this.cooldown < 15 && this.cooldown > 5) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 46,
        y: this.y + 20,
        w: 46,
        h: 20
      };
    } else if (this.state === FighterAction.KICK && this.cooldown < 15 && this.cooldown > 5) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 66,
        y: this.y + 40,
        w: 66,
        h: 30
      };
    }
  }

  /** Applies physics integration and enforces boundaries */
  private updatePhysicsBounding(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY;
    this.vx *= FRICTION;

    // Ground collision
    if (this.y > GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      if (this.state === FighterAction.JUMP) this.state = FighterAction.IDLE;
    }
    // Arena walls
    if (this.x < 0) this.x = 0;
    if (this.x > CANVAS_WIDTH - this.width) this.x = CANVAS_WIDTH - this.width;
  }

  /**
   * AI Decision Making via Neural Network
   * 
   * Converts the current game state into neural network inputs,
   * runs the forward pass, and interprets outputs as actions.
   * 
   * INPUT NORMALIZATION
   * -------------------
   * All inputs are normalized to roughly [-1, 1] or [0, 1] range:
   * - This helps the network learn effectively
   * - Different scales would cause some inputs to dominate
   * 
   * OUTPUT INTERPRETATION
   * ---------------------
   * Each output neuron corresponds to an action.
   * If output > 0.5, that action is triggered.
   * Multiple actions can be triggered simultaneously.
   * 
   * @param opponent - The other fighter
   * @returns InputState object with boolean action flags
   */
  processAi(opponent: Fighter): InputState {
    if (!this.genome) {
      return { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
    }

    // === PREPARE NORMALIZED INPUTS ===
    const dist = (opponent.x - this.x) / CANVAS_WIDTH;      // Horizontal distance (-1 to 1)
    const distY = (opponent.y - this.y) / CANVAS_HEIGHT;    // Vertical distance
    const selfH = this.health / 100;                         // Own health (0 to 1)
    const oppH = opponent.health / 100;                      // Opponent health (0 to 1)
    const oppAction = opponent.state / 7;                    // Opponent action (0 to 1)
    const selfE = this.energy / ENERGY.MAX;                  // Own energy (0 to 1)
    const facing = this.direction;                           // Facing direction (-1 or 1)
    const oppCooldown = opponent.cooldown / 40;              // Opponent cooldown (0 to 1)
    const oppEnergy = opponent.energy / ENERGY.MAX;          // Opponent energy (0 to 1)

    // 9 inputs total
    const inputs = [dist, distY, selfH, oppH, oppAction, selfE, facing, oppCooldown, oppEnergy];
    this.lastInputs = inputs; // Store inputs for visualization



    // === RUN NEURAL NETWORK ===
    let outputs: number[];

    // Check if we can use the optimized Class method (Rule #3 - No allocation)
    if (this.genome.network instanceof FeedForwardNetwork) {
      outputs = this.genome.network.predict(inputs);
    } else {
      // Fallback for legacy/worker data
      outputs = predict(this.genome.network, inputs);
    }

    // === INTERPRET OUTPUTS ===
    // Threshold-based activation: output > 0.5 means "do this action"
    // This allows the AI to combine actions (e.g., move + punch) like humans can
    return {
      left: (outputs[FighterAction.MOVE_LEFT] ?? 0) > 0.5,
      right: (outputs[FighterAction.MOVE_RIGHT] ?? 0) > 0.5,
      up: (outputs[FighterAction.JUMP] ?? 0) > 0.5,
      down: (outputs[FighterAction.CROUCH] ?? 0) > 0.5,
      action1: (outputs[FighterAction.PUNCH] ?? 0) > 0.5,
      action2: (outputs[FighterAction.KICK] ?? 0) > 0.5,
      action3: (outputs[FighterAction.BLOCK] ?? 0) > 0.5,
    };
  }

  /**
   * Computes the normalized neural network inputs for this fighter against an opponent.
   * Exposed publicly so we can record "what the human saw" for Mirror AI training.
   */
  public computeAIInputs(opponent: Fighter): number[] {
    // === PREPARE NORMALIZED INPUTS ===
    const dist = (opponent.x - this.x) / CANVAS_WIDTH;      // Horizontal distance (-1 to 1)
    const distY = (opponent.y - this.y) / CANVAS_HEIGHT;    // Vertical distance
    const selfH = this.health / 100;                         // Own health (0 to 1)
    const oppH = opponent.health / 100;                      // Opponent health (0 to 1)
    const oppAction = opponent.state / 7;                    // Opponent action (0 to 1)
    const selfE = this.energy / ENERGY.MAX;                  // Own energy (0 to 1)
    const facing = this.direction;                           // Facing direction (-1 or 1)
    const oppCooldown = opponent.cooldown / 40;              // Opponent cooldown (0 to 1)
    const oppEnergy = opponent.energy / ENERGY.MAX;          // Opponent energy (0 to 1)

    // 9 inputs total
    const inputs = [dist, distY, selfH, oppH, oppAction, selfE, facing, oppCooldown, oppEnergy];
    this.lastInputs = inputs; // Store inputs for visualization
    return inputs;
  }




  /**
   * Custom Script Decision Making via User-Defined JavaScript
   * 
   * TIMING FAIRNESS (Option A):
   * Uses SyncScriptExecutor to execute scripts synchronously on the main thread,
   * achieving timing parity with the neural network AI. This ensures both Script
   * and AI make decisions at the same rate (once per tick).
   * 
   * Falls back to async Web Worker if sync executor is not available.
   * 
   * @param opponent - The other fighter
   * @returns InputState object with boolean action flags
   */
  processCustom(opponent: Fighter): InputState {
    const neutralAction: InputState = {
      left: false, right: false, up: false, down: false,
      action1: false, action2: false, action3: false
    };

    // Build state objects for script execution
    const selfState: CustomFighterState = {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      health: this.health,
      energy: this.energy,
      state: this.state,
      direction: this.direction,
      cooldown: this.cooldown,
      width: this.width,
      height: this.height
    };

    const opponentState: CustomFighterState = {
      x: opponent.x,
      y: opponent.y,
      vx: opponent.vx,
      vy: opponent.vy,
      health: opponent.health,
      energy: opponent.energy,
      state: opponent.state,
      direction: opponent.direction,
      cooldown: opponent.cooldown,
      width: opponent.width,
      height: opponent.height
    };

    // === OPTION A: SYNCHRONOUS EXECUTION (Preferred for timing fairness) ===
    // This executes the script on the main thread, just like the AI's neural network.
    // Both make exactly one decision per tick, achieving perfect timing parity.
    if (this.syncScriptExecutor && this.syncScriptExecutor.isReady()) {
      return this.syncScriptExecutor.execute(selfState, opponentState);
    }

    // === FALLBACK: Async Web Worker (legacy behavior) ===
    // Only used if sync executor is not set up. Has timing issues at high sim speeds.
    if (this.scriptWorker && this.scriptWorker.isReady()) {
      this.scriptWorker.requestAction(selfState, opponentState);
      return this.scriptWorker.getAction();
    }

    return neutralAction;
  }

  /**
   * Checks if this fighter's attack hits the opponent
   * 
   * COLLISION DETECTION
   * -------------------
   * Uses AABB (Axis-Aligned Bounding Box) collision detection:
   * Two rectangles overlap if they overlap on BOTH axes.
   * 
   * DAMAGE CALCULATION
   * ------------------
   * Base damage: Punch = 5, Kick = 10
   * Multipliers:
   * - Blocked: 0.5x (50% damage reduction)
   * - Normal: 1.0x
   * - Backstab: 3.0x (facing away from attacker)
   * 
   * KNOCKBACK
   * ---------
   * On hit, the defender is pushed back with velocity.
   * Kicks have stronger knockback than punches.
   * 
   * @param opponent - The fighter to check collision against
   */
  checkHit(opponent: Fighter) {
    // Only check if we have an active hitbox and opponent is alive
    if (this.hitbox && opponent.health > 0) {
      // === AABB COLLISION DETECTION ===
      const hit =
        this.hitbox.x < opponent.x + opponent.width &&
        this.hitbox.x + this.hitbox.w > opponent.x &&
        this.hitbox.y < opponent.y + opponent.height &&
        this.hitbox.y + this.hitbox.h > opponent.y;

      if (hit) {
        // === BACKSTAB DETECTION ===
        // Is the attacker behind the defender?
        const attackerToRight = this.x > opponent.x;
        const defenderFacingAway = (attackerToRight && opponent.direction === -1) ||
          (!attackerToRight && opponent.direction === 1);

        // === DAMAGE CALCULATION (Rock-Paper-Scissors System) ===
        let damage = this.state === FighterAction.PUNCH ? 5 : 10;
        let isPerfectCounter = false;

        // Defensive counters ONLY work if defender is facing the attacker
        // If facing away, they take full damage regardless of stance
        const defenderFacingAttacker = !defenderFacingAway;

        if (defenderFacingAttacker && opponent.state === FighterAction.BLOCK) {
          if (this.state === FighterAction.PUNCH) {
            // PERFECT BLOCK: Block counters Punch completely
            damage = 0;
            isPerfectCounter = true;
          } else {
            // Partial block: Kick vs Block = 50% damage
            damage *= 0.5;
            opponent.energy -= ENERGY.PENALTY_HIT;
          }
        } else if (defenderFacingAttacker && opponent.state === FighterAction.CROUCH) {
          if (this.state === FighterAction.KICK) {
            // PERFECT DODGE: Crouch counters Kick completely
            damage = 0;
            isPerfectCounter = true;
          } else {
            // Partial dodge: Punch vs Crouch = 50% damage
            damage *= 0.5;
            opponent.energy -= ENERGY.PENALTY_HIT;
          }
        }
        // If defenderFacingAway: full damage, no counter effects

        // Perfect counter: stun attacker (extend cooldown)
        if (isPerfectCounter) {
          this.cooldown += 5;  // Attacker is briefly stunned
        }

        // Apply damage (clamped to 0)
        opponent.health = Math.max(0, opponent.health - damage);

        // === FITNESS UPDATE (Training Only) ===
        // Removed per-hit fitness rewards as requested
        // Only KO wins count for fitness now

        // === KNOCKBACK PHYSICS ===
        opponent.vx = this.direction * (this.state === FighterAction.KICK ? 15 : 8);
        opponent.vy = -5;  // Slight upward pop

        // Consume hitbox to prevent multiple hits per attack
        this.hitbox = null;
      }
    }
  }
}