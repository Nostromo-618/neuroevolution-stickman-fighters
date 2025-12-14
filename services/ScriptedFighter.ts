/**
 * =============================================================================
 * SCRIPTED FIGHTER - Custom JavaScript Fighter Logic
 * =============================================================================
 * 
 * Welcome! This module lets you write your own fighter AI using JavaScript.
 * Instead of relying on a neural network that learns through evolution,
 * you get to be the "brain" and define exactly how the fighter behaves.
 * 
 * WHY SCRIPTED FIGHTERS?
 * -----------------------
 * 1. LEARNING: Understand what inputs the AI sees and how to make decisions
 * 2. TESTING: Create specific behaviors to test your neural network against
 * 3. BENCHMARKING: See how your handcrafted strategy compares to evolved AI
 * 4. FUN: Sometimes it's more satisfying to code your own fighter!
 * 
 * HOW TO USE THIS FILE
 * --------------------
 * The main function is `getScriptedAction()`. It receives information about:
 * - Your fighter's position, health, energy, state, etc.
 * - The opponent's position, health, energy, state, etc.
 * 
 * Your job is to return an InputState object telling the fighter what to do:
 * - left/right: Move horizontally
 * - up: Jump
 * - down: Crouch
 * - action1: Punch (quick attack, less damage)
 * - action2: Kick (slow attack, more damage)
 * - action3: Block (reduce incoming damage)
 * 
 * RANDOMNESS FOR UNPREDICTABILITY
 * --------------------------------
 * We use native JavaScript Math.random() for randomness.
 * This makes your fighter less predictable and harder to exploit.
 * 
 * Math.random() returns a number between 0 (inclusive) and 1 (exclusive).
 * Example uses:
 * - Math.random() < 0.5    → 50% chance of being true
 * - Math.random() < 0.1    → 10% chance of being true
 * - Math.floor(Math.random() * 3)  → Random integer: 0, 1, or 2
 * 
 * =============================================================================
 */

import { InputState, FighterAction } from '../types';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================
// These types define the information you receive about each fighter.
// Understanding these is key to writing effective logic!

/**
 * FighterState - All the information about a fighter at this moment
 * 
 * This is the "view" of the world from your fighter's perspective.
 * Use this data to make smart decisions!
 */
export interface FighterState {
  // --- POSITION ---
  // x: Horizontal position (0 = left edge, ~800 = right edge)
  // Lower x = more to the left
  x: number;
  
  // y: Vertical position (0 = top, ~380 = ground level)
  // Lower y = higher in the air (yes, it's inverted!)
  y: number;
  
  // --- MOVEMENT ---
  // vx: Horizontal velocity (negative = moving left, positive = moving right)
  vx: number;
  
  // vy: Vertical velocity (negative = moving up, positive = falling down)
  vy: number;
  
  // --- RESOURCES ---
  // health: Current health points (0-100)
  // At 0, you lose!
  health: number;
  
  // energy: Current energy points (0-100)
  // Actions cost energy. It regenerates over time.
  // Without energy, you can't attack or move effectively!
  energy: number;
  
  // --- STATE ---
  // state: Current action/animation state (see FighterAction enum)
  // Useful to know if you're mid-attack, blocking, etc.
  state: FighterAction;
  
  // direction: Which way you're facing (-1 = left, 1 = right)
  direction: -1 | 1;
  
  // cooldown: Frames until you can attack again
  // High cooldown = still recovering from last attack
  cooldown: number;
  
  // width/height: Fighter hitbox dimensions
  width: number;
  height: number;
}


// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
// These functions break down the decision-making into smaller, readable pieces.
// Feel free to modify them or add your own!

/**
 * Calculates the horizontal distance to the opponent.
 * 
 * WHY THIS MATTERS:
 * Distance determines what actions are effective:
 * - Far away: Move closer or wait
 * - Medium range: Kicks can reach
 * - Close range: Punches are fast and effective
 * 
 * @param self - Your fighter's state
 * @param opponent - Opponent's state
 * @returns Positive distance in pixels (always positive, use direction separately)
 */
function getDistanceToOpponent(self: FighterState, opponent: FighterState): number {
  // Math.abs() makes the result always positive
  // We don't care about direction here, just "how far"
  return Math.abs(self.x - opponent.x);
}

/**
 * Checks if we should move toward the opponent.
 * 
 * STRATEGY:
 * - If we're far away, we generally want to get closer
 * - But not if we're low on energy (need to recover)
 * - And sometimes we stay back randomly to be unpredictable
 * 
 * @param distance - Current distance to opponent
 * @param self - Your fighter's state
 * @returns true if we should approach, false otherwise
 */
function shouldApproach(distance: number, self: FighterState): boolean {
  // Don't rush in if low on energy - we might get caught defenseless
  const hasEnoughEnergy = self.energy > 30;
  
  // We're too far if distance is more than 200 pixels
  const isTooFar = distance > 200;
  
  // 80% chance to approach when conditions are right
  // The 20% randomness makes us less predictable
  const randomApproach = Math.random() < 0.8;
  
  return hasEnoughEnergy && isTooFar && randomApproach;
}

/**
 * Checks if we're in punching range.
 * 
 * PUNCH PROPERTIES:
 * - Hitbox extends about 46 pixels from the fighter
 * - Quick attack (30 frame cooldown)
 * - Low energy cost (10 energy)
 * - Lower damage (5 points)
 * 
 * Great for: Quick pokes, interrupting attacks, finishing low-health opponents
 */
function isInPunchRange(distance: number): boolean {
  // Punch can reach about 60 pixels effectively
  // (46 hitbox + some body overlap margin)
  return distance < 80;
}

/**
 * Checks if we're in kicking range.
 * 
 * KICK PROPERTIES:
 * - Hitbox extends about 66 pixels from the fighter
 * - Slower attack (40 frame cooldown)
 * - Higher energy cost (15 energy)
 * - Higher damage (10 points)
 * 
 * Great for: Maximum damage, punishing opponent mistakes, keeping distance
 */
function isInKickRange(distance: number): boolean {
  // Kick has longer reach than punch
  // Sweet spot is medium range where kick hits but punch might miss
  return distance < 120;
}

/**
 * Determines if this is a good moment to attack.
 * 
 * ATTACK TIMING:
 * We're more likely to attack when:
 * - Opponent is in cooldown (can't counter-attack)
 * - Opponent is low on energy (can't block effectively)
 * - We have enough energy to attack
 * - We're not already in an attack animation
 * 
 * @param self - Your fighter's state
 * @param opponent - Opponent's state
 * @returns true if conditions favor attacking
 */
function isGoodTimeToAttack(self: FighterState, opponent: FighterState): boolean {
  // Don't attack if we're already mid-action
  // (cooldown > 10 means we're probably in an attack animation)
  if (self.cooldown > 10) {
    return false;
  }
  
  // Need at least 15 energy for a kick (our more expensive attack)
  if (self.energy < 15) {
    return false;
  }
  
  // Opponent is vulnerable if:
  const opponentIsVulnerable = 
    opponent.cooldown > 15 ||        // They're mid-attack, can't block
    opponent.energy < 10 ||           // Too tired to block
    opponent.state === FighterAction.JUMP;  // Airborne, less control
  
  // If opponent is vulnerable, always attack
  if (opponentIsVulnerable) {
    return true;
  }
  
  // Otherwise, 40% chance to attack anyway (keeps us aggressive)
  return Math.random() < 0.4;
}

/**
 * Determines if we should block.
 * 
 * BLOCKING STRATEGY:
 * Blocking is good when:
 * - Opponent is attacking (their cooldown is in the "active attack" window)
 * - We have enough energy to maintain the block
 * - We're close enough that their attack could hit us
 * 
 * Blocking costs energy per frame, so don't hold it forever!
 */
function shouldBlock(self: FighterState, opponent: FighterState, distance: number): boolean {
  // Need energy to block
  if (self.energy < 20) {
    return false;
  }
  
  // Opponent is probably attacking if their cooldown is between 15-30
  // (attacks set cooldown to 30-40, and hitbox is active from 15-25/30)
  const opponentIsAttacking = opponent.cooldown > 15 && opponent.cooldown < 35;
  
  // Only block if opponent is close enough to hit us
  const inDangerZone = distance < 130;
  
  // Block if we're in danger
  if (opponentIsAttacking && inDangerZone) {
    return true;
  }
  
  // Sometimes block preemptively when close (20% chance)
  // This makes us harder to read
  if (inDangerZone && Math.random() < 0.2) {
    return true;
  }
  
  return false;
}

/**
 * Checks if opponent is behind us (we're facing the wrong way).
 * 
 * BACKSTAB DANGER:
 * (Removed - backstab damage multiplier has been disabled)
 * We still need to face our opponent for optimal positioning.
 */
function isOpponentBehind(self: FighterState, opponent: FighterState): boolean {
  // Calculate where opponent is relative to us
  const opponentToRight = opponent.x > self.x;
  
  // Check if we're facing the wrong way
  // If opponent is on our right, we should face right (direction = 1)
  // If opponent is on our left, we should face left (direction = -1)
  return (opponentToRight && self.direction === -1) || 
         (!opponentToRight && self.direction === 1);
}

/**
 * Checks if jumping would be beneficial.
 * 
 * JUMPING USES:
 * - Dodge low attacks
 * - Jump over opponent (change sides)
 * - Add unpredictability
 * 
 * Be careful: Jumping costs a lot of energy (12) and you're
 * vulnerable while airborne!
 */
function shouldJump(self: FighterState, opponent: FighterState, distance: number): boolean {
  // Don't jump if already in the air
  // (using y position - ground is at ~280, in air is lower)
  const isOnGround = self.y >= 270;
  if (!isOnGround) {
    return false;
  }
  
  // Need good energy to jump (it costs 12)
  if (self.energy < 25) {
    return false;
  }
  
  // Jump to avoid low kicks (opponent is kicking)
  const opponentIsKicking = opponent.state === FighterAction.KICK && opponent.cooldown > 15;
  if (opponentIsKicking && distance < 80) {
    return true;
  }
  
  // Small random chance to jump for unpredictability
  return Math.random() < 0.05;
}


// =============================================================================
// MAIN DECISION FUNCTION
// =============================================================================

/**
 * getScriptedAction - The Main Decision Function
 * 
 * This is where all the magic happens! This function is called every frame
 * (60 times per second) and decides what the scripted fighter should do.
 * 
 * HOW IT WORKS:
 * 1. Analyze the current situation (distance, health, energy, etc.)
 * 2. Decide on priorities:
 *    - Am I in danger? → Defensive actions
 *    - Can I attack? → Offensive actions
 *    - Too far? → Movement
 * 3. Return an InputState with all actions set to true/false
 * 
 * RETURN VALUE:
 * An InputState object where each property is a boolean:
 * - true = "press this button"
 * - false = "don't press this button"
 * 
 * Multiple actions can be true simultaneously! (e.g., move + punch)
 * 
 * @param self - Complete state of the scripted fighter
 * @param opponent - Complete state of the opponent fighter
 * @returns InputState object with action decisions
 */
export function getScriptedAction(self: FighterState, opponent: FighterState): InputState {
  // ===========================================
  // STEP 1: GATHER INFORMATION
  // ===========================================
  // Before making decisions, calculate useful values
  
  const distance = getDistanceToOpponent(self, opponent);
  const opponentToRight = opponent.x > self.x;
  const opponentBehind = isOpponentBehind(self, opponent);
  
  // ===========================================
  // STEP 2: INITIALIZE ALL ACTIONS TO FALSE
  // ===========================================
  // We start with "do nothing" and then enable specific actions
  
  let moveLeft = false;
  let moveRight = false;
  let jump = false;
  let crouch = false;
  let punch = false;
  let kick = false;
  let block = false;
  
  // ===========================================
  // STEP 3: FACING CHECK (HIGHEST PRIORITY!)
  // ===========================================
  // Face our opponent for optimal positioning
  // This helps with attack accuracy and defense
  
  if (opponentBehind) {
    // Turn around! Move toward opponent to change direction
    if (opponentToRight) {
      moveRight = true;
    } else {
      moveLeft = true;
    }
  }
  
  // ===========================================
  // STEP 4: DEFENSIVE DECISIONS
  // ===========================================
  // Check if we should be defensive (blocking, dodging)
  
  if (shouldBlock(self, opponent, distance)) {
    block = true;
    // When blocking, don't move (blocking slows you anyway)
    moveLeft = false;
    moveRight = false;
  }
  
  // Consider jumping to dodge
  if (shouldJump(self, opponent, distance)) {
    jump = true;
  }
  
  // ===========================================
  // STEP 5: OFFENSIVE DECISIONS
  // ===========================================
  // If not blocking, consider attacking
  
  if (!block && isGoodTimeToAttack(self, opponent)) {
    // Choose between punch and kick based on distance
    if (isInPunchRange(distance)) {
      // In close range: prefer punch (faster)
      // But 30% chance to kick anyway for damage
      if (Math.random() < 0.7) {
        punch = true;
      } else {
        kick = true;
      }
    } else if (isInKickRange(distance)) {
      // In kick range but not punch range: kick has reach advantage
      kick = true;
    }
  }
  
  // ===========================================
  // STEP 6: MOVEMENT DECISIONS
  // ===========================================
  // If we're not attacking or blocking, consider movement
  
  if (!block && !punch && !kick) {
    if (shouldApproach(distance, self)) {
      // Move toward opponent
      if (opponentToRight) {
        moveRight = true;
      } else {
        moveLeft = true;
      }
    } else if (distance < 50 && Math.random() < 0.3) {
      // We're very close - sometimes back off to create space
      if (opponentToRight) {
        moveLeft = true;  // Back away (opponent is on our right, go left)
      } else {
        moveRight = true; // Back away (opponent is on our left, go right)
      }
    }
  }
  
  // ===========================================
  // STEP 7: COMPOSE AND RETURN THE INPUT STATE
  // ===========================================
  
  return {
    left: moveLeft,
    right: moveRight,
    up: jump,
    down: crouch,
    action1: punch,
    action2: kick,
    action3: block
  };
}


// =============================================================================
// CUSTOMIZATION IDEAS
// =============================================================================
// 
// Want to make your own fighter personality? Here are some ideas:
// 
// 1. AGGRESSIVE BERSERKER
//    - Always move toward opponent
//    - Attack whenever in range
//    - Never block
//    - Low health = more aggressive
// 
// 2. DEFENSIVE TURTLE
//    - Block most of the time
//    - Only attack when opponent is in cooldown
//    - Back away when low on energy
//    - Wait for opponent to make mistakes
// 
// 3. HIT AND RUN
//    - Attack once, then back away
//    - Keep distance until energy is full
//    - Jump a lot to avoid attacks
//    - Prefer kicks (more range)
// 
// 4. COMBO MASTER
//    - Track recent actions
//    - Follow punch with kick
//    - Punish blocked attacks
//    - Use movement to set up hits
// 
// 5. RANDOM CHAOS
//    - High random factors everywhere
//    - Unpredictable but unfocused
//    - Good for testing NN adaptability
// 
// =============================================================================
