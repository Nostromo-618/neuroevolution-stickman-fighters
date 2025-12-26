/**
 * =============================================================================
 * TRAINING WORKER - Parallel Match Simulation
 * =============================================================================
 * 
 * This module is a Web Worker that runs match simulations in parallel.
 * It's a self-contained copy of the game logic that runs in a separate thread.
 * 
 * WHY WEB WORKERS?
 * ----------------
 * JavaScript is single-threaded. Without workers, training would:
 * - Block the UI (freezing everything)
 * - Limit us to one CPU core
 * - Make Arcade mode unplayable during training
 * 
 * With Web Workers:
 * - Each worker runs on a separate CPU core
 * - UI thread stays responsive
 * - Training can run in background while playing
 * - Scales with number of CPU cores
 * 
 * WORKER ISOLATION
 * ----------------
 * Workers can't access DOM or import modules from main thread.
 * That's why we duplicate types and game logic here - it needs to be
 * completely self-contained.
 * 
 * MESSAGE PROTOCOL
 * ----------------
 * Main Thread → Worker:
 *   { type: 'runMatches', jobs: MatchJob[] }
 * 
 * Worker → Main Thread:
 *   { type: 'ready' }              // Worker initialized
 *   { type: 'matchResults', results: MatchResult[] }  // Matches complete
 * 
 * =============================================================================
 */

// =============================================================================
// DUPLICATED TYPES (Required for worker isolation)
// =============================================================================

/**
 * Neural network structure (same as types.ts)
 * Must be duplicated because workers can't import from main thread
 */
interface NeuralNetwork {
  inputWeights: number[][];
  outputWeights: number[][];
  biases: number[];
}

/**
 * Genome structure for workers
 * Simplified version focused on what's needed for simulation
 */
interface WorkerGenome {
  id: string;
  network: NeuralNetwork;
  fitness: number;
  matchesWon: number;
}

/**
 * Match job - describes a single match to simulate
 */
interface MatchJob {
  jobId: number;       // Unique identifier for result matching
  genome1: WorkerGenome;
  genome2: WorkerGenome;
  spawn1X: number;     // Starting X position for fighter 1
  spawn2X: number;     // Starting X position for fighter 2
}

/**
 * Match result - outcome of a simulated match
 */
interface MatchResult {
  jobId: number;
  genome1Fitness: number;  // Fitness earned by genome 1
  genome2Fitness: number;  // Fitness earned by genome 2
  genome1Won: boolean;
  genome2Won: boolean;
  genome1Health: number;   // Final health (for debugging)
  genome2Health: number;
}

// =============================================================================
// DUPLICATED CONSTANTS (Same as GameEngine.ts)
// =============================================================================

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GRAVITY = 0.8;
const FRICTION = 0.85;
const GROUND_Y = 380;
const INPUT_NODES = 9;
const HIDDEN_NODES = 24;  // Adjusted to 24 for balanced performance
const OUTPUT_NODES = 8;

// Fighter Actions (numeric constants instead of enum for simplicity in worker)
const IDLE = 0;
const MOVE_LEFT = 1;
const MOVE_RIGHT = 2;
const JUMP = 3;
const CROUCH = 4;
const PUNCH = 5;
const KICK = 6;
const BLOCK = 7;

// =============================================================================
// DUPLICATED NEURAL NETWORK (Same as NeuralNetwork.ts)
// =============================================================================

/**
 * Sigmoid activation - squashes values to (0, 1)
 */
const sigmoid = (t: number) => 1 / (1 + Math.exp(-t));

/**
 * ReLU activation - max(0, x)
 */
const relu = (t: number) => Math.max(0, t);

/**
 * Forward pass through neural network
 * Identical to NeuralNetwork.predict() but local to worker
 */
function predict(network: NeuralNetwork, inputs: number[]): number[] {
  // Hidden layer
  const hiddenOutputs: number[] = [];
  for (let h = 0; h < HIDDEN_NODES; h++) {
    let sum = 0;
    for (let i = 0; i < INPUT_NODES; i++) {
      sum += inputs[i] * network.inputWeights[i][h];
    }
    sum += network.biases[h];
    hiddenOutputs.push(relu(sum));
  }

  // Output layer
  const finalOutputs: number[] = [];
  for (let o = 0; o < OUTPUT_NODES; o++) {
    let sum = 0;
    for (let h = 0; h < HIDDEN_NODES; h++) {
      sum += hiddenOutputs[h] * network.outputWeights[h][o];
    }
    sum += network.biases[HIDDEN_NODES + o];
    finalOutputs.push(sigmoid(sum));
  }

  return finalOutputs;
}

// =============================================================================
// DUPLICATED FIGHTER CLASS (Simplified for workers)
// =============================================================================

/**
 * WorkerFighter - Simplified fighter for background simulation
 * 
 * Key differences from main thread Fighter:
 * - No color/rendering properties
 * - No human input support (AI only)
 * - matchFitness accumulates locally, then applied to result
 */
class WorkerFighter {
  x: number;
  y: number;
  vx: number = 0;
  vy: number = 0;
  width: number = 50;
  height: number = 100;
  genome: WorkerGenome;

  health: number = 100;
  energy: number = 100;
  state: number = IDLE;
  direction: -1 | 1 = 1;

  hitbox: { x: number, y: number, w: number, h: number } | null = null;
  cooldown: number = 0;

  /**
   * Accumulated fitness during this match
   * Stored separately so we can track per-match contributions
   */
  matchFitness: number = 0;

  constructor(x: number, genome: WorkerGenome, direction: -1 | 1 = 1) {
    this.x = x;
    this.y = GROUND_Y - this.height;
    this.genome = genome;
    this.direction = direction;
  }

  /**
   * Update fighter state for one frame
   * Same logic as GameEngine.Fighter.update() but simplified
   */
  update(opponent: WorkerFighter) {
    // === DEATH PHYSICS ===
    if (this.health <= 0) {
      this.y += this.vy;
      this.vy += GRAVITY;
      if (this.y > GROUND_Y - 40) {
        this.y = GROUND_Y - 40;
        this.vx *= 0.5;
        this.vy = 0;
      } else {
        this.x += this.vx;
      }
      return;
    }

    // === AI DECISION ===
    const activeInput = this.processAi(opponent);

    // === FITNESS SHAPING ===
    // Same rewards/penalties as main thread
    if (opponent.health > 0) {
      const dist = Math.abs(this.x - opponent.x);

      // Proximity reward
      if (dist < 400) this.matchFitness += 0.005;
      if (dist < 200) this.matchFitness += 0.02;
      if (dist < 80) this.matchFitness += 0.05;

      // Facing reward
      const dx = opponent.x - this.x;
      const correctFacing = (dx > 0 && this.direction === 1) || (dx < 0 && this.direction === -1);
      if (correctFacing) this.matchFitness += 0.02;

      // Aggression reward
      if (dist < 100 && (this.state === PUNCH || this.state === KICK)) {
        this.matchFitness += 0.1;
      }

      // Time penalty
      this.matchFitness -= 0.005;

      // Edge penalty
      const edgeThreshold = 60;
      if (this.x < edgeThreshold || this.x > CANVAS_WIDTH - this.width - edgeThreshold) {
        this.matchFitness -= 0.04;
      }

      // Center bonus
      const centerX = CANVAS_WIDTH / 2;
      const distFromCenter = Math.abs(this.x + this.width / 2 - centerX);
      if (distFromCenter < 150) {
        this.matchFitness += 0.015;
      }

      // Movement reward
      if (Math.abs(this.vx) > 0.5) {
        this.matchFitness += 0.008;
      }
    }

    // === COOLDOWN & ENERGY ===
    if (this.cooldown > 0) this.cooldown--;

    const isIdle = Math.abs(this.vx) < 0.5 && this.state === IDLE;
    const regenRate = isIdle ? 0.5 : 0.2;
    if (this.energy < 100) this.energy += regenRate;

    // === STATE MANAGEMENT ===
    const isAnimationLocked = this.cooldown > 15;

    if (!isAnimationLocked) {
      if (activeInput.left && this.energy >= 0.5) {
        this.vx -= 1.5;
        this.energy -= 0.5;
        this.direction = -1;
        this.state = MOVE_LEFT;
      } else if (activeInput.right && this.energy >= 0.5) {
        this.vx += 1.5;
        this.energy -= 0.5;
        this.direction = 1;
        this.state = MOVE_RIGHT;
      } else {
        this.state = IDLE;
      }

      if (activeInput.up && this.y >= GROUND_Y - this.height - 1 && this.energy >= 12) {
        this.vy = -18;
        this.energy -= 12;
        this.state = JUMP;
      }

      if (activeInput.down && this.y >= GROUND_Y - this.height - 1 && this.energy >= 0.2) {
        this.state = CROUCH;
        this.energy -= 0.2;
        this.vx *= 0.5;
      }

      if (activeInput.action3 && this.energy >= 0.5) {
        this.state = BLOCK;
        this.energy -= 0.5;
        this.vx *= 0.3;
      }
    }

    // === ATTACKS ===
    this.hitbox = null;

    if (this.cooldown === 0) {
      if (activeInput.action1 && this.energy > 10) {
        this.state = PUNCH;
        this.vx *= 0.2;
        this.cooldown = 30;
        this.energy -= 10;
      } else if (activeInput.action2 && this.energy > 15) {
        this.state = KICK;
        this.vx *= 0.2;
        this.cooldown = 20;   // Speed matched to punch (20 frames)
        this.energy -= 15;
      }
    }

    // === HITBOXES ===
    if (this.state === PUNCH && this.cooldown < 25 && this.cooldown > 15) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 46,
        y: this.y + 20,
        w: 46,
        h: 20
      };
    } else if (this.state === KICK && this.cooldown < 15 && this.cooldown > 5) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 66,
        y: this.y + 40,
        w: 66,
        h: 30
      };
    }

    // === PHYSICS ===
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY;
    this.vx *= FRICTION;

    // === BOUNDARIES ===
    if (this.y > GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      if (this.state === JUMP) this.state = IDLE;
    }
    if (this.x < 0) this.x = 0;
    if (this.x > CANVAS_WIDTH - this.width) this.x = CANVAS_WIDTH - this.width;
  }

  /**
   * AI decision making via neural network
   */
  processAi(opponent: WorkerFighter) {
    const dist = (opponent.x - this.x) / CANVAS_WIDTH;
    const distY = (opponent.y - this.y) / CANVAS_HEIGHT;
    const selfH = this.health / 100;
    const oppH = opponent.health / 100;
    const oppAction = opponent.state / 7;
    const selfE = this.energy / 100;
    const facing = this.direction;
    const oppCooldown = opponent.cooldown / 40;
    const oppEnergy = opponent.energy / 100;

    const inputs = [dist, distY, selfH, oppH, oppAction, selfE, facing, oppCooldown, oppEnergy];
    const outputs = predict(this.genome.network, inputs);

    return {
      left: outputs[MOVE_LEFT] > 0.5,
      right: outputs[MOVE_RIGHT] > 0.5,
      up: outputs[JUMP] > 0.5,
      down: outputs[CROUCH] > 0.5,
      action1: outputs[PUNCH] > 0.5,
      action2: outputs[KICK] > 0.5,
      action3: outputs[BLOCK] > 0.5,
    };
  }

  /**
   * Check and apply hit detection
   */
  checkHit(opponent: WorkerFighter) {
    if (this.hitbox && opponent.health > 0) {
      const hit =
        this.hitbox.x < opponent.x + opponent.width &&
        this.hitbox.x + this.hitbox.w > opponent.x &&
        this.hitbox.y < opponent.y + opponent.height &&
        this.hitbox.y + this.hitbox.h > opponent.y;

      if (hit) {
        // Backstab detection
        const attackerToRight = this.x > opponent.x;
        const defenderFacingAway = (attackerToRight && opponent.direction === -1) ||
          (!attackerToRight && opponent.direction === 1);

        // Damage calculation with multipliers
        let damage = this.state === PUNCH ? 5 : 10;

        // Removed backstab multiplier as requested
        if (opponent.state === BLOCK) {
          damage *= 0.5;  // Blocked: 50% damage reduction for punches, 75% for kicks
          opponent.energy -= 5;
        } else if (opponent.state === CROUCH) {
          // Crouching blocks 75% of kicks and 50% of punches
          if (this.state === KICK) {
            damage *= 0.25;  // 75% reduction for kicks
          } else {
            damage *= 0.5;   // 50% reduction for punches
          }
          opponent.energy -= 5;
        }

        opponent.health = Math.max(0, opponent.health - damage);

        // Fitness updates
        this.matchFitness += 50;
        opponent.matchFitness -= 20;

        // Knockback
        opponent.vx = this.direction * (this.state === KICK ? 15 : 8);
        opponent.vy = -5;

        this.hitbox = null;
      }
    }
  }
}

// =============================================================================
// MATCH SIMULATION
// =============================================================================

/**
 * Runs a complete match simulation and returns the result
 * 
 * MATCH FLOW:
 * 1. Create two fighters with given genomes
 * 2. Randomly swap sides (50% chance) for fairness
 * 3. Run physics loop for 90 seconds (5400 frames at 60 FPS)
 * 4. End early if KO (health <= 0)
 * 5. Calculate final fitness including win bonus
 * 
 * SIDE SWAPPING:
 * Critical for fair training! Without this, AI might only learn
 * to fight from one side of the arena.
 * 
 * @param job - Match configuration
 * @returns Match results with fitness changes
 */
function runMatch(job: MatchJob): MatchResult {
  // === ROUND-BASED SIDE SWAPPING ===
  // Alternate sides each round to prevent directional bias
  // This ensures AI learns to fight effectively from both sides
  // Use jobId to determine side assignment (even = normal, odd = swapped)
  const swapSides = job.jobId % 2 === 1;

  const leftGenome = swapSides ? job.genome2 : job.genome1;
  const rightGenome = swapSides ? job.genome1 : job.genome2;
  const leftSpawn = swapSides ? job.spawn2X : job.spawn1X;
  const rightSpawn = swapSides ? job.spawn1X : job.spawn2X;

  // Clamp spawn positions to valid arena range
  const clampedLeftSpawn = Math.max(50, Math.min(350, leftSpawn));
  const clampedRightSpawn = Math.max(400, Math.min(700, rightSpawn));

  // Create fighters
  const f1 = new WorkerFighter(clampedLeftSpawn, leftGenome, 1);   // Faces right
  const f2 = new WorkerFighter(clampedRightSpawn, rightGenome, -1); // Faces left

  // Track engagement for stalemate detection
  const startHealth1 = f1.health;
  const startHealth2 = f2.health;

  // === MAIN SIMULATION LOOP ===
  // 90 seconds at 60 FPS = 5400 frames
  const maxFrames = 90 * 60;
  let matchEndedByKO = false;

  for (let frame = 0; frame < maxFrames; frame++) {
    // Update both fighters
    f1.update(f2);
    f2.update(f1);

    // === BODY COLLISION (prevents overlap) ===
    // Only apply when fighters are at similar Y levels
    const verticalOverlap = (f1.y + f1.height > f2.y) && (f2.y + f2.height > f1.y);

    if (verticalOverlap) {
      if (f1.x < f2.x) {
        const overlap = (f1.x + f1.width) - f2.x;
        if (overlap > 0) {
          f1.x -= overlap / 2;
          f2.x += overlap / 2;
        }
      } else {
        const overlap = (f2.x + f2.width) - f1.x;
        if (overlap > 0) {
          f2.x -= overlap / 2;
          f1.x += overlap / 2;
        }
      }
    }

    // Check hits
    f1.checkHit(f2);
    f2.checkHit(f1);

    // End on KO
    if (f1.health <= 0 || f2.health <= 0) {
      matchEndedByKO = true;
      break;
    }
  }

  // === CALCULATE FINAL FITNESS ===

  // Engagement score (total damage dealt)
  const damageDealt1 = startHealth2 - f2.health;
  const damageDealt2 = startHealth1 - f1.health;
  const totalEngagement = damageDealt1 + damageDealt2;

  // Base fitness from match + remaining health bonus
  let leftFitness = f1.matchFitness + f1.health * 2;
  let rightFitness = f2.matchFitness + f2.health * 2;

  // === STALEMATE PENALTY ===
  // If match timed out with barely any fighting, punish both
  // This prevents passive/camping strategies from being viable
  if (!matchEndedByKO && totalEngagement < 30) {
    const passivityPenalty = 100;
    leftFitness -= passivityPenalty;
    rightFitness -= passivityPenalty;
  }

  // Map fitness back to original genome order (undo swap)
  let fitness1 = swapSides ? rightFitness : leftFitness;
  let fitness2 = swapSides ? leftFitness : rightFitness;

  // === WINNER DETERMINATION ===
  let won1 = false;
  let won2 = false;

  if (f1.health > f2.health) {
    // Left fighter won
    if (swapSides) {
      fitness2 += 500;  // Win bonus
      won2 = true;
    } else {
      fitness1 += 500;
      won1 = true;
    }
  } else if (f2.health > f1.health) {
    // Right fighter won
    if (swapSides) {
      fitness1 += 500;
      won1 = true;
    } else {
      fitness2 += 500;
      won2 = true;
    }
  }
  // If tied health, neither gets win bonus

  return {
    jobId: job.jobId,
    genome1Fitness: fitness1,
    genome2Fitness: fitness2,
    genome1Won: won1,
    genome2Won: won2,
    genome1Health: f1.health,
    genome2Health: f2.health
  };
}

// =============================================================================
// WORKER MESSAGE HANDLER
// =============================================================================

/**
 * Handle messages from main thread
 * 
 * Protocol:
 * - Receive: { type: 'runMatches', jobs: MatchJob[] }
 * - Respond: { type: 'matchResults', results: MatchResult[] }
 */
self.onmessage = (e: MessageEvent<{ type: string; jobs?: MatchJob[] }>) => {
  const { type, jobs } = e.data;

  if (type === 'runMatches' && jobs) {
    const results: MatchResult[] = [];

    // Run each match sequentially within this worker
    for (const job of jobs) {
      const result = runMatch(job);
      results.push(result);
    }

    // Send all results back at once
    self.postMessage({ type: 'matchResults', results });
  }
};

// Signal that worker is ready to receive jobs
self.postMessage({ type: 'ready' });
