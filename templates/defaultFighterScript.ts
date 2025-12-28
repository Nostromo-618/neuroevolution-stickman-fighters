/**
 * =============================================================================
 * DEFAULT FIGHTER SCRIPT TEMPLATE
 * =============================================================================
 * 
 * A balanced, educational template for new users to learn from.
 * Demonstrates all key concepts: state analysis, movement, defense, offense.
 */

export const DEFAULT_FIGHTER_SCRIPT = `/**
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

