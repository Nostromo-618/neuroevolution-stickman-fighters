import { FighterAction, Genome, InputState } from '../types';
import { predict } from './NeuralNetwork';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;
const GRAVITY = 0.8;
const FRICTION = 0.85;
const GROUND_Y = 380;

export class Fighter {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  width: number = 50;
  height: number = 100;
  color: string;
  isAi: boolean;
  genome?: Genome;
  
  health: number = 100;
  energy: number = 100;
  state: FighterAction = FighterAction.IDLE;
  direction: -1 | 1 = 1; // 1 = right, -1 = left
  
  hitbox: { x: number, y: number, w: number, h: number } | null = null;
  cooldown: number = 0;

  constructor(x: number, color: string, isAi: boolean, genome?: Genome) {
    this.x = x;
    this.y = GROUND_Y - this.height;
    this.color = color;
    this.isAi = isAi;
    this.genome = genome;
  }

  update(input: InputState, opponent: Fighter) {
    if (this.health <= 0) {
        // Dead physics
        this.y += this.vy;
        this.vy += GRAVITY;
        if (this.y > GROUND_Y - 40) {
            this.y = GROUND_Y - 40; // Lying down height
            this.vx *= 0.5; // Slide friction
            this.vy = 0;
        } else {
             this.x += this.vx; // Fly when hit in air
        }
        return;
    }

    // AI Logic
    let activeInput = input;
    if (this.isAi && this.genome) {
      activeInput = this.processAi(opponent);

      // --- FITNESS SHAPING (CRITICAL FOR TRAINING) ---
      // We reward the AI for behaviors that LEAD to fighting, otherwise they just stand still.
      // Only apply fitness shaping when opponent is alive (prevents farming dead opponents)
      
      if (opponent.health > 0) {
        const dist = Math.abs(this.x - opponent.x);
        
        // 1. Proximity Reward (The Magnet)
        // Encourage moving closer. Reduced slightly to balance with attack rewards.
        if (dist < 400) {
            this.genome.fitness += 0.005;
        }
        if (dist < 200) {
            this.genome.fitness += 0.02;
        }
        if (dist < 80) {
            this.genome.fitness += 0.05; // Close combat range
        }

        // 2. Facing Reward
        const dx = opponent.x - this.x;
        const correctFacing = (dx > 0 && this.direction === 1) || (dx < 0 && this.direction === -1);
        if (correctFacing) {
            this.genome.fitness += 0.02;
        }
        
        // 3. Aggression Reward (encourages attacking when close)
        if (dist < 100 && (this.state === FighterAction.PUNCH || this.state === FighterAction.KICK)) {
            this.genome.fitness += 0.1; // Reward attacking in range
        }

        // 4. Time Penalty
        // Small penalty to discourage stalling.
        this.genome.fitness -= 0.005;
        
        // 5. Edge/Corner Penalty
        // Discourage camping at arena edges - prevents corner camping
        const edgeThreshold = 60;
        if (this.x < edgeThreshold || this.x > CANVAS_WIDTH - this.width - edgeThreshold) {
            this.genome.fitness -= 0.04; // Penalty for being near walls
        }

        // 6. Center Control Bonus
        // Reward being in the middle of the arena
        const centerX = CANVAS_WIDTH / 2;
        const distFromCenter = Math.abs(this.x + this.width / 2 - centerX);
        if (distFromCenter < 150) {
            this.genome.fitness += 0.015; // Bonus for center control
        }

        // 7. Movement Reward
        // Reward actual movement to prevent standing still
        if (Math.abs(this.vx) > 0.5) {
            this.genome.fitness += 0.008;
        }
      }
    }

    // Cooldown management
    if (this.cooldown > 0) this.cooldown--;
    
    // Energy Regen - faster when idle (rewards strategic pauses)
    const isIdle = Math.abs(this.vx) < 0.5 && this.state === FighterAction.IDLE;
    const regenRate = isIdle ? 0.5 : 0.2;
    if (this.energy < 100) this.energy += regenRate;

    // --- State Management ---
    // If cooldown is high, we are locked in an animation (Attack/Block)
    // We allow movement inputs only if not currently locked in an attack animation
    const isAnimationLocked = this.cooldown > 15;

    if (!isAnimationLocked) {
        // Movement Processing - NOW COSTS ENERGY (prevents erratic movement)
        if (activeInput.left && this.energy >= 0.5) {
            this.vx -= 1.5;
            this.energy -= 0.5;  // Movement costs energy
            this.direction = -1;
            this.state = FighterAction.MOVE_LEFT;
        } else if (activeInput.right && this.energy >= 0.5) {
            this.vx += 1.5;
            this.energy -= 0.5;  // Movement costs energy
            this.direction = 1;
            this.state = FighterAction.MOVE_RIGHT;
        } else {
            this.state = FighterAction.IDLE;
        }

        // Jump - NOW COSTS SIGNIFICANT ENERGY (tactical use only)
        if (activeInput.up && this.y >= GROUND_Y - this.height - 1 && this.energy >= 12) {
            this.vy = -18;
            this.energy -= 12;  // Jumping costs significant energy
            this.state = FighterAction.JUMP;
        }
        
        // Crouch - costs a small amount of energy
        if (activeInput.down && this.y >= GROUND_Y - this.height - 1 && this.energy >= 0.2) {
            this.state = FighterAction.CROUCH;
            this.energy -= 0.2;  // Crouching costs energy
            this.vx *= 0.5; // Slow down
        }
    }

    // --- Actions ---
    this.hitbox = null;
    
    // Trigger Actions (Can only trigger if cooldown is 0)
    if (this.cooldown === 0) {
      if (activeInput.action3 && this.energy > 5) {
        this.state = FighterAction.BLOCK;
        this.energy -= 0.5;
        // Block cooldown now locks animation so AI can maintain block state
        this.cooldown = 20; 
      } else if (activeInput.action1 && this.energy > 10) {
        this.state = FighterAction.PUNCH;
        this.vx *= 0.2; // Stop moving significantly
        this.cooldown = 30; // Animation duration
        this.energy -= 10;
        // Hitbox active only during specific frames of the animation (e.g., frame 10-20)
      } else if (activeInput.action2 && this.energy > 15) {
        this.state = FighterAction.KICK;
        this.vx *= 0.2;
        this.cooldown = 40; // Longer animation
        this.energy -= 15;
      }
    }

    // Activate Hitboxes based on current state and cooldown timing
    // Punch: lasts 30 frames. Hit frames: 25-15 (early in the cooldown count down)
    if (this.state === FighterAction.PUNCH && this.cooldown < 25 && this.cooldown > 15) {
        this.hitbox = {
          x: this.direction === 1 ? this.x + this.width : this.x - 40,
          y: this.y + 20,
          w: 40,
          h: 20
        };
    } else if (this.state === FighterAction.KICK && this.cooldown < 30 && this.cooldown > 15) {
         this.hitbox = {
          x: this.direction === 1 ? this.x + this.width : this.x - 60,
          y: this.y + 40, // Lower
          w: 60,
          h: 30
        };
    }

    // --- Physics Integration ---
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY;
    this.vx *= FRICTION;

    // Boundaries
    if (this.y > GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      // Landed
      if (this.state === FighterAction.JUMP) this.state = FighterAction.IDLE;
    }
    if (this.x < 0) this.x = 0;
    if (this.x > CANVAS_WIDTH - this.width) this.x = CANVAS_WIDTH - this.width;
  }

  processAi(opponent: Fighter): InputState {
    if (!this.genome) return { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };

    // Normalize inputs
    const dist = (opponent.x - this.x) / CANVAS_WIDTH; // Range -1 to 1
    const distY = (opponent.y - this.y) / CANVAS_HEIGHT;
    const selfH = this.health / 100;
    const oppH = opponent.health / 100;
    const oppAction = opponent.state / 7; // Normalize enum
    const selfE = this.energy / 100;
    const facing = this.direction; // -1 or 1
    const oppCooldown = opponent.cooldown / 40; // Normalize (max cooldown is 40 for kick)
    const oppEnergy = opponent.energy / 100;

    const inputs = [dist, distY, selfH, oppH, oppAction, selfE, facing, oppCooldown, oppEnergy];
    const outputs = predict(this.genome.network, inputs);

    // Interpret Outputs [0..1] using threshold-based activation
    // This allows AI to combine actions (e.g., move + punch) like humans can
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

  checkHit(opponent: Fighter) {
    if (this.hitbox && opponent.health > 0) {
      // Simple AABB for Hitbox vs Opponent Body
      const hit = 
        this.hitbox.x < opponent.x + opponent.width &&
        this.hitbox.x + this.hitbox.w > opponent.x &&
        this.hitbox.y < opponent.y + opponent.height &&
        this.hitbox.y + this.hitbox.h > opponent.y;

      if (hit) {
        // BACKSTAB CHECK: Instant death if defender is facing away from attacker
        // Critical martial arts rule: NEVER turn your back on your opponent
        const attackerToRight = this.x > opponent.x;
        const defenderFacingAway = (attackerToRight && opponent.direction === -1) || 
                                   (!attackerToRight && opponent.direction === 1);
        
        if (defenderFacingAway) {
          // Instant death - backstab is fatal
          // No explicit fitness bonus needed - winning the match is reward enough
          opponent.health = 0;
        } else {
          // Normal damage calculation
          let damage = this.state === FighterAction.PUNCH ? 5 : 10;
          
          // Block mitigation
          if (opponent.state === FighterAction.BLOCK) {
            damage *= 0.1;
            opponent.energy -= 5;
          }

          opponent.health = Math.max(0, opponent.health - damage);
          
          // Update Fitness if training
          if (this.genome) this.genome.fitness += 50; // Big bonus for hitting
          if (opponent.genome) opponent.genome.fitness -= 20; // Penalty for getting hit
        }
        
        // Knockback physics (applies to both normal hits and backstabs)
        opponent.vx = this.direction * (this.state === FighterAction.KICK ? 15 : 8); 
        opponent.vy = -5;
        
        this.hitbox = null; // Consume hit to prevent multiple hits per frame
      }
    }
  }
}