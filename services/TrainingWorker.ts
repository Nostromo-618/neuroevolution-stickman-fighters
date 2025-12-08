// Self-contained Training Worker
// Runs match simulations in parallel without access to main thread modules

// --- Types (duplicated for worker isolation) ---
interface NeuralNetwork {
  inputWeights: number[][];
  outputWeights: number[][];
  biases: number[];
}

interface WorkerGenome {
  id: string;
  network: NeuralNetwork;
  fitness: number;
  matchesWon: number;
}

interface MatchJob {
  jobId: number;
  genome1: WorkerGenome;
  genome2: WorkerGenome;
  spawn1X: number;
  spawn2X: number;
}

interface MatchResult {
  jobId: number;
  genome1Fitness: number;
  genome2Fitness: number;
  genome1Won: boolean;
  genome2Won: boolean;
  genome1Health: number;
  genome2Health: number;
}

// --- Constants ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GRAVITY = 0.8;
const FRICTION = 0.85;
const GROUND_Y = 380;
const INPUT_NODES = 9;
const HIDDEN_NODES = 10;
const OUTPUT_NODES = 8;

// Fighter Actions
const IDLE = 0;
const MOVE_LEFT = 1;
const MOVE_RIGHT = 2;
const JUMP = 3;
const CROUCH = 4;
const PUNCH = 5;
const KICK = 6;
const BLOCK = 7;

// --- Neural Network (self-contained) ---
const sigmoid = (t: number) => 1 / (1 + Math.exp(-t));
const relu = (t: number) => Math.max(0, t);

function predict(network: NeuralNetwork, inputs: number[]): number[] {
  const hiddenOutputs: number[] = [];
  for (let h = 0; h < HIDDEN_NODES; h++) {
    let sum = 0;
    for (let i = 0; i < INPUT_NODES; i++) {
      sum += inputs[i] * network.inputWeights[i][h];
    }
    sum += network.biases[h];
    hiddenOutputs.push(relu(sum));
  }

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

// --- Fighter Class (self-contained) ---
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
  
  // Accumulated fitness during match
  matchFitness: number = 0;

  constructor(x: number, genome: WorkerGenome, direction: -1 | 1 = 1) {
    this.x = x;
    this.y = GROUND_Y - this.height;
    this.genome = genome;
    this.direction = direction;
  }

  update(opponent: WorkerFighter) {
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

    // AI Logic
    const activeInput = this.processAi(opponent);

    // Fitness shaping (only when opponent alive)
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

    // Cooldown management
    if (this.cooldown > 0) this.cooldown--;
    
    // Energy regen - faster when idle (rewards strategic pauses)
    const isIdle = Math.abs(this.vx) < 0.5 && this.state === IDLE;
    const regenRate = isIdle ? 0.5 : 0.2;
    if (this.energy < 100) this.energy += regenRate;

    // State management
    const isAnimationLocked = this.cooldown > 15;

    if (!isAnimationLocked) {
      // Movement costs energy (prevents erratic movement)
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

      // Jump costs significant energy (tactical use only)
      if (activeInput.up && this.y >= GROUND_Y - this.height - 1 && this.energy >= 12) {
        this.vy = -18;
        this.energy -= 12;
        this.state = JUMP;
      }
      
      // Crouch costs small energy
      if (activeInput.down && this.y >= GROUND_Y - this.height - 1 && this.energy >= 0.2) {
        this.state = CROUCH;
        this.energy -= 0.2;
        this.vx *= 0.5;
      }
      
      // Block - sustained defensive stance while held (like crouch)
      if (activeInput.action3 && this.energy >= 0.5) {
        this.state = BLOCK;
        this.energy -= 0.5;  // Block costs energy per frame
        this.vx *= 0.3; // Slow down significantly while blocking
      }
    }

    // Actions
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
        this.cooldown = 40;
        this.energy -= 15;
      }
    }

    // Hitboxes - Punch 46px (+15%), Kick 66px (+10%)
    if (this.state === PUNCH && this.cooldown < 25 && this.cooldown > 15) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 46,
        y: this.y + 20,
        w: 46,
        h: 20
      };
    } else if (this.state === KICK && this.cooldown < 30 && this.cooldown > 15) {
      this.hitbox = {
        x: this.direction === 1 ? this.x + this.width : this.x - 66,
        y: this.y + 40,
        w: 66,
        h: 30
      };
    }

    // Physics
    this.x += this.vx;
    this.y += this.vy;
    this.vy += GRAVITY;
    this.vx *= FRICTION;

    // Boundaries
    if (this.y > GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      if (this.state === JUMP) this.state = IDLE;
    }
    if (this.x < 0) this.x = 0;
    if (this.x > CANVAS_WIDTH - this.width) this.x = CANVAS_WIDTH - this.width;
  }

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

  checkHit(opponent: WorkerFighter) {
    if (this.hitbox && opponent.health > 0) {
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
          let damage = this.state === PUNCH ? 5 : 10;
          
          if (opponent.state === BLOCK) {
            damage *= 0.1;
            opponent.energy -= 5;
          }

          opponent.health = Math.max(0, opponent.health - damage);
          
          // Fitness for hits
          this.matchFitness += 50;
          opponent.matchFitness -= 20;
        }
        
        // Knockback physics (applies to both normal hits and backstabs)
        opponent.vx = this.direction * (this.state === KICK ? 15 : 8);
        opponent.vy = -5;
        
        this.hitbox = null;
      }
    }
  }
}

// --- Match Simulation ---
function runMatch(job: MatchJob): MatchResult {
  // CRITICAL: Randomly swap which genome plays which side (50% chance)
  // This ensures AI learns to fight from BOTH sides of the arena
  const swapSides = Math.random() > 0.5;
  
  const leftGenome = swapSides ? job.genome2 : job.genome1;
  const rightGenome = swapSides ? job.genome1 : job.genome2;
  const leftSpawn = swapSides ? job.spawn2X : job.spawn1X;
  const rightSpawn = swapSides ? job.spawn1X : job.spawn2X;
  
  // Clamp spawn positions to valid arena range
  const clampedLeftSpawn = Math.max(50, Math.min(350, leftSpawn));
  const clampedRightSpawn = Math.max(400, Math.min(700, rightSpawn));
  
  const f1 = new WorkerFighter(clampedLeftSpawn, leftGenome, 1);
  const f2 = new WorkerFighter(clampedRightSpawn, rightGenome, -1);

  // Track engagement (total damage dealt)
  const startHealth1 = f1.health;
  const startHealth2 = f2.health;

  // 90 seconds at 60 fps = 5400 frames
  const maxFrames = 90 * 60;
  let matchEndedByKO = false;
  
  for (let frame = 0; frame < maxFrames; frame++) {
    // Update fighters
    f1.update(f2);
    f2.update(f1);
    
    // Body collision - prevent fighters from overlapping
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
    
    // Check hits
    f1.checkHit(f2);
    f2.checkHit(f1);
    
    // End if KO
    if (f1.health <= 0 || f2.health <= 0) {
      matchEndedByKO = true;
      break;
    }
  }

  // Calculate engagement score (total damage dealt by both fighters)
  const damageDealt1 = startHealth2 - f2.health;
  const damageDealt2 = startHealth1 - f1.health;
  const totalEngagement = damageDealt1 + damageDealt2;

  // Calculate final fitness - map back to original genome order
  let leftFitness = f1.matchFitness + f1.health * 2;
  let rightFitness = f2.matchFitness + f2.health * 2;
  
  // STALEMATE PENALTY: If match times out and both fighters barely engaged
  // Punish passive play - both fighters should be actively fighting
  if (!matchEndedByKO && totalEngagement < 30) {
    // Very low engagement = both fighters were passive
    const passivityPenalty = 100;
    leftFitness -= passivityPenalty;
    rightFitness -= passivityPenalty;
  }
  
  let fitness1 = swapSides ? rightFitness : leftFitness;
  let fitness2 = swapSides ? leftFitness : rightFitness;
  
  let won1 = false;
  let won2 = false;
  
  if (f1.health > f2.health) {
    // Left fighter won
    if (swapSides) {
      fitness2 += 500;
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

// --- Worker Message Handler ---
self.onmessage = (e: MessageEvent<{ type: string; jobs?: MatchJob[] }>) => {
  const { type, jobs } = e.data;
  
  if (type === 'runMatches' && jobs) {
    const results: MatchResult[] = [];
    
    for (const job of jobs) {
      const result = runMatch(job);
      results.push(result);
    }
    
    self.postMessage({ type: 'matchResults', results });
  }
};

// Signal ready
self.postMessage({ type: 'ready' });

