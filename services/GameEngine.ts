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
 * GAME ENGINE OVERVIEW
 * --------------------
 * The game runs at 60 FPS. Each frame:
 * 1. Process input (human or AI)
 * 2. Update physics (position, velocity, gravity)
 * 3. Check for collisions and hits
 * 4. Apply damage and effects
 * 5. Update fitness scores (training mode)
 * 
 * PHYSICS MODEL
 * -------------
 * - Gravity constantly pulls fighters down
 * - Friction slows horizontal movement
 * - Fighters are constrained to the arena boundaries
 * - Vertical collision handled for jumping over opponents
 * 
 * COMBAT SYSTEM
 * -------------
 * - Punch: Quick attack, 5 damage, 30 frame cooldown, 30% energy cost
 * - Kick: Strong attack, 10 damage, 40 frame cooldown, 60% energy cost
 * - Block: Reduces incoming damage by 50% for punches, 75% for kicks, 50% energy per second
 * - Crouch: Reduces incoming damage by 50% for punches, 75% for kicks, 50% energy per second
 * - Jump: 25% energy cost
 *
 * =============================================================================
 */

import { FighterAction, Genome, InputState } from '../types';
import { predict } from './NeuralNetwork';
import { getScriptedAction, FighterState } from './ScriptedFighter';

// =============================================================================
// WORLD CONSTANTS
// =============================================================================

/** Canvas width in pixels - defines the arena width */
export const CANVAS_WIDTH = 800;

/** Canvas height in pixels - defines the arena height */
export const CANVAS_HEIGHT = 450;

/** 
 * Gravity acceleration (pixels per frame²)
 * Applied every frame to vertical velocity
 * Creates natural jumping arcs
 */
const GRAVITY = 0.8;

/** 
 * Friction coefficient (velocity multiplier per frame)
 * Values < 1 slow down horizontal movement
 * 0.85 = fighter loses 15% speed each frame
 */
const FRICTION = 0.85;

/** 
 * Y-coordinate of the ground level
 * Fighters cannot fall below this point
 */
const GROUND_Y = 380;

// =============================================================================
// FIGHTER CLASS
// =============================================================================

/**
 * Fighter Class
 * 
 * Represents a combatant in the arena. Can be controlled by:
 * - Human player (via InputManager)
 * - AI (via neural network predictions)
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
  width: number = 50;     // Fighter hitbox width
  height: number = 100;   // Fighter hitbox height

  // --- Identity ---
  color: string;          // Display color (CSS color string)
  isAi: boolean;          // True if controlled by neural network
  isScripted: boolean;    // True if controlled by ScriptedFighter module
  genome?: Genome;        // AI brain (only set for AI fighters)

  // --- Combat Stats ---
  health: number = 100;   // Current health (0 = dead)
  energy: number = 100;   // Energy for actions (regenerates over time)
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
    this.isScripted = false;  // Default to false; set to true externally for scripted fighters
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
   */
  update(input: InputState, opponent: Fighter) {
    // === DEATH PHYSICS ===
    // Dead fighters ragdoll to the ground
    if (this.health <= 0) {
      this.y += this.vy;
      this.vy += GRAVITY;
      if (this.y > GROUND_Y - 40) {
        this.y = GROUND_Y - 40;  // Lying down height
        this.vx *= 0.5;          // Slide friction
        this.vy = 0;
      } else {
        this.x += this.vx;      // Fly when knocked in air
      }
      return;  // Skip all other logic when dead
    }

    // === AI/SCRIPTED DECISION MAKING ===
    // Determine input based on control type: Human, Neural Network AI, or Scripted
    let activeInput = input;

    // SCRIPTED FIGHTER: Use the ScriptedFighter module for decisions
    // This takes priority over isAi since a fighter can't be both
    if (this.isScripted) {
      activeInput = this.processScripted(opponent);
    }
    // NEURAL NETWORK AI: Use the neural network for decisions
    else if (this.isAi && this.genome) {
      activeInput = this.processAi(opponent);

      // =================================================================
      // FITNESS SHAPING (Training Mode Only)
      // =================================================================
      // 
      // WHY FITNESS SHAPING?
      // Pure win/loss evolution is slow. We guide learning by rewarding
      // behaviors that correlate with winning:
      // - Getting closer to opponent
      // - Facing the opponent
      // - Attacking when in range
      // - Staying mobile
      // - Controlling center of arena
      // 
      // These are "distortions" that speed up learning but may bias
      // the AI toward certain strategies. See docs/GAME_ENGINE.md for
      // a full analysis of each distortion.
      // =================================================================

      if (opponent.health > 0) {  // Only shape fitness when opponent alive
        const dist = Math.abs(this.x - opponent.x);

        // 1. PROXIMITY REWARD ("The Magnet")
        // Encourages AI to approach opponent rather than run away
        // Without this, AI often learns to avoid damage by avoiding combat
        if (dist < 400) {
          this.genome.fitness += 0.005;  // Slight reward for being in range
        }
        if (dist < 200) {
          this.genome.fitness += 0.02;   // More reward for medium range
        }
        if (dist < 80) {
          this.genome.fitness += 0.05;   // Best reward for close combat
        }

        // 2. FACING REWARD
        // Encourages AI to face opponent (also prevents backstabs)
        const dx = opponent.x - this.x;
        const correctFacing = (dx > 0 && this.direction === 1) || (dx < 0 && this.direction === -1);
        if (correctFacing) {
          this.genome.fitness += 0.02;
        }

        // 3. AGGRESSION REWARD
        // Encourages attacking when close enough to hit
        if (dist < 100 && (this.state === FighterAction.PUNCH || this.state === FighterAction.KICK)) {
          this.genome.fitness += 0.1;
        }

        // 4. TIME PENALTY
        // Small constant penalty to discourage stalling
        this.genome.fitness -= 0.005;

        // 5. EDGE/CORNER PENALTY
        // Discourage camping at arena edges (bad tactical position)
        const edgeThreshold = 60;
        if (this.x < edgeThreshold || this.x > CANVAS_WIDTH - this.width - edgeThreshold) {
          this.genome.fitness -= 0.04;
        }

        // 6. CENTER CONTROL BONUS
        // Reward being in the middle of the arena (dominant position)
        const centerX = CANVAS_WIDTH / 2;
        const distFromCenter = Math.abs(this.x + this.width / 2 - centerX);
        if (distFromCenter < 150) {
          this.genome.fitness += 0.015;
        }

        // 7. MOVEMENT REWARD
        // Reward actual movement to prevent standing still
        if (Math.abs(this.vx) > 0.5) {
          this.genome.fitness += 0.008;
        }
      }
    }

    // === COOLDOWN MANAGEMENT ===
    if (this.cooldown > 0) this.cooldown--;

    // === ENERGY REGENERATION ===
    // Energy regens faster when idle (encourages strategic pauses)
    const isIdle = Math.abs(this.vx) < 0.5 && this.state === FighterAction.IDLE;
    const regenRate = isIdle ? 0.5 : 0.2;
    if (this.energy < 100) this.energy += regenRate;

    // === STATE MANAGEMENT ===
    // Animation lock: can't change state during attack recovery
    const isAnimationLocked = this.cooldown > 15;

    if (!isAnimationLocked) {
      // --- MOVEMENT (costs energy to prevent erratic behavior) ---
      if (activeInput.left && this.energy >= 0.5) {
        this.vx -= 1.5;
        this.energy -= 0.5;
        this.direction = -1;
        this.state = FighterAction.MOVE_LEFT;
      } else if (activeInput.right && this.energy >= 0.5) {
        this.vx += 1.5;
        this.energy -= 0.5;
        this.direction = 1;
        this.state = FighterAction.MOVE_RIGHT;
      } else {
        this.state = FighterAction.IDLE;
      }

      // --- JUMP (costs 25% of total energy) ---
      if (activeInput.up && this.y >= GROUND_Y - this.height - 1 && this.energy >= 25) {
        this.vy = -18;
        this.energy -= 25;
        this.state = FighterAction.JUMP;
      }

      // --- CROUCH (costs 50% of total energy per second, blocks 75% kicks and 50% punches) ---
      if (activeInput.down && this.y >= GROUND_Y - this.height - 1 && this.energy >= 50) {
        this.state = FighterAction.CROUCH;
        this.energy -= 50;  // 50% of total energy per second
        this.vx *= 0.5;  // Slow down while crouching
      }

      // --- BLOCK (costs 50% of total energy per second, blocks 75% punches and 50% kicks) ---
      if (activeInput.action3 && this.energy >= 50) {
        this.state = FighterAction.BLOCK;
        this.energy -= 50;  // 50% of total energy per second
        this.vx *= 0.3;  // Significant slowdown while blocking
      }
    }

    // === ATTACK ACTIONS ===
    this.hitbox = null;  // Clear hitbox by default

    // Attacks can only be initiated when not in cooldown
    if (this.cooldown === 0) {
      // PUNCH: Quick attack, less damage, faster recovery (30% of total energy)
      if (activeInput.action1 && this.energy >= 30) {
        this.state = FighterAction.PUNCH;
        this.vx *= 0.2;       // Stop moving significantly
        this.cooldown = 30;   // 30 frames of animation
        this.energy -= 30;    // Energy cost (30% of 100)
      }
      // KICK: Strong attack, more damage, slower recovery (60% of total energy)
      else if (activeInput.action2 && this.energy >= 60) {
        this.state = FighterAction.KICK;
        this.vx *= 0.2;
        this.cooldown = 40;   // Longer animation
        this.energy -= 60;    // Higher energy cost (60% of 100)
      }
    }

    // === HITBOX ACTIVATION ===
    // Hitboxes are only active during specific frames of the attack animation
    // This creates attack "windows" where the hit can land
    // Punch: Hitbox active frames 15-25 (of 30 total)
    // Kick: Hitbox active frames 15-30 (of 40 total)
    if (this.state === FighterAction.PUNCH && this.cooldown < 25 && this.cooldown > 15) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 46,
        y: this.y + 20,
        w: 46,   // Punch reach
        h: 20
      };
    } else if (this.state === FighterAction.KICK && this.cooldown < 30 && this.cooldown > 15) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 66,
        y: this.y + 40,  // Kicks aim lower
        w: 66,   // Kick has longer reach
        h: 30
      };
    }

    // === PHYSICS INTEGRATION ===
    this.x += this.vx;       // Apply horizontal velocity
    this.y += this.vy;       // Apply vertical velocity
    this.vy += GRAVITY;      // Apply gravity to vertical velocity
    this.vx *= FRICTION;     // Apply friction to horizontal velocity

    // === BOUNDARY ENFORCEMENT ===
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
    const selfE = this.energy / 100;                         // Own energy (0 to 1)
    const facing = this.direction;                           // Facing direction (-1 or 1)
    const oppCooldown = opponent.cooldown / 40;              // Opponent cooldown (0 to 1)
    const oppEnergy = opponent.energy / 100;                 // Opponent energy (0 to 1)

    // 9 inputs total
    const inputs = [dist, distY, selfH, oppH, oppAction, selfE, facing, oppCooldown, oppEnergy];

    // === RUN NEURAL NETWORK ===
    const outputs = predict(this.genome.network, inputs);

    // === INTERPRET OUTPUTS ===
    // Threshold-based activation: output > 0.5 means "do this action"
    // This allows the AI to combine actions (e.g., move + punch) like humans can
    return {
      left: outputs[FighterAction.MOVE_LEFT] > 0.5,
      right: outputs[FighterAction.MOVE_RIGHT] > 0.5,
      up: outputs[FighterAction.JUMP] > 0.5,
      down: outputs[FighterAction.CROUCH] > 0.5,
      action1: outputs[FighterAction.PUNCH] > 0.5,
      action2: outputs[FighterAction.KICK] > 0.5,
      action3: outputs[FighterAction.BLOCK] > 0.5,
    };
  }

  /**
   * Scripted Decision Making via ScriptedFighter Module
   * 
   * Similar to processAi, but instead of using a neural network,
   * this method calls the user-defined scripted logic.
   * 
   * The ScriptedFighter module receives a FighterState object with
   * all relevant information about both fighters, and returns an
   * InputState with the desired actions.
   * 
   * This is great for:
   * - Testing specific behaviors against the neural network
   * - Creating benchmark opponents
   * - Learning how fighting game AI works
   * 
   * @param opponent - The other fighter
   * @returns InputState object with boolean action flags
   */
  processScripted(opponent: Fighter): InputState {
    // === BUILD FIGHTER STATE FOR SCRIPTED MODULE ===
    // The ScriptedFighter module uses its own FighterState interface
    // that contains all the information needed for decision-making

    const selfState: FighterState = {
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

    const opponentState: FighterState = {
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

    // === CALL SCRIPTED LOGIC ===
    // The getScriptedAction function lives in services/ScriptedFighter.ts
    // Users can modify that file to change the fighter's behavior
    return getScriptedAction(selfState, opponentState);
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

        // === DAMAGE CALCULATION ===
        let damage = this.state === FighterAction.PUNCH ? 5 : 10;

        // Removed backstab multiplier as requested
        if (opponent.state === FighterAction.BLOCK) {
          damage *= 0.5;  // Blocked: 50% damage reduction for punches, 75% for kicks
          opponent.energy -= 5;  // Blocking costs extra energy when hit
        } else if (opponent.state === FighterAction.CROUCH) {
          // Crouching blocks 75% of kicks and 50% of punches
          if (this.state === FighterAction.KICK) {
            damage *= 0.25;  // 75% reduction for kicks
          } else {
            damage *= 0.5;   // 50% reduction for punches
          }
          opponent.energy -= 5;  // Crouching costs extra energy when hit
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