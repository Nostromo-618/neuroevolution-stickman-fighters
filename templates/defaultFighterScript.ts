/**
 * =============================================================================
 * DEFAULT FIGHTER SCRIPT TEMPLATE
 * =============================================================================
 * 
 * A balanced, educational template for new users to learn from.
 * Demonstrates all key concepts: state analysis, movement, defense, offense.
 * 
 * Updated for Rock-Paper-Scissors combat system:
 * - BLOCK perfectly counters PUNCH (0 damage + attacker stun)
 * - CROUCH perfectly counters KICK (0 damage + attacker stun)
 * - Defensive counters only work when FACING the attacker!
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
 *   state        Current action (5=punch, 6=kick)     0 to 7
 * 
 * ============================================================
 * OUTPUTS - Actions you can take:
 * ============================================================
 * 
 *   ACTION       WHAT IT DOES                         ENERGY COST
 *   ─────────────────────────────────────────────────────────────
 *   left         Move left                            ~0 (minimal)
 *   right        Move right                           ~0 (minimal)
 *   up           Jump                                 15 energy
 *   down         Crouch (COUNTERS KICKS!)             ~0.5/frame
 *   action1      Punch (quick, 5 damage)              10 energy
 *   action2      Kick (strong, 10 damage)             20 energy
 *   action3      Block (COUNTERS PUNCHES!)            ~0.5/frame
 * 
 * ============================================================
 * COMBAT SYSTEM (Rock-Paper-Scissors):
 * ============================================================
 * 
 *   - BLOCK beats PUNCH → 0 damage, attacker stunned!
 *   - CROUCH beats KICK → 0 damage, attacker stunned!
 *   - PUNCH vs CROUCH → 50% damage (partial dodge)
 *   - KICK vs BLOCK → 50% damage (partial block)
 *   - Must be FACING attacker for counters to work!
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
  
  // Am I facing the opponent? (IMPORTANT for counters!)
  const iAmFacingOpponent = 
    (opponentIsToMyRight && self.direction === 1) ||
    (opponentIsToMyLeft && self.direction === -1);
  
  // What attack is the opponent doing?
  const PUNCH_STATE = 5;
  const KICK_STATE = 6;
  const opponentIsPunching = opponent.state === PUNCH_STATE;
  const opponentIsKicking = opponent.state === KICK_STATE;
  const opponentIsAttacking = opponentIsPunching || opponentIsKicking;
  
  
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
  const TOO_FAR_AWAY = 100;      // Need to get closer
  const TOO_CLOSE = 25;          // Might want to back up
  const MINIMUM_ENERGY_FOR_CHASE = 20;
  
  // If opponent is far away, move toward them
  if (distanceToOpponent > TOO_FAR_AWAY && self.energy > MINIMUM_ENERGY_FOR_CHASE) {
    if (opponentIsToMyRight) {
      moveRight = true;
    } else {
      moveLeft = true;
    }
  }
  
  // If opponent is very close, sometimes back away (20% chance)
  const shouldRetreat = Math.random() < 0.2;
  if (distanceToOpponent < TOO_CLOSE && shouldRetreat) {
    if (opponentIsToMyRight) {
      moveLeft = true;   // Back away to the left
    } else {
      moveRight = true;  // Back away to the right
    }
  }
  
  
  // ============================================================
  // STEP 4: Decide on DEFENSE (Rock-Paper-Scissors!)
  // ============================================================
  
  const DEFENSE_RANGE = 130;           // How close before we defend
  const MINIMUM_ENERGY_TO_DEFEND = 15;
  
  // Only try to counter if we're facing the opponent!
  const canCounter = 
      iAmFacingOpponent && 
      distanceToOpponent < DEFENSE_RANGE && 
      self.energy > MINIMUM_ENERGY_TO_DEFEND;
  
  if (canCounter && opponentIsAttacking) {
    if (opponentIsPunching) {
      // BLOCK counters PUNCH → Perfect defense!
      doBlock = true;
      moveLeft = false;
      moveRight = false;
    } else if (opponentIsKicking) {
      // CROUCH counters KICK → Perfect dodge!
      crouch = true;
      moveLeft = false;
      moveRight = false;
    }
  }
  
  
  // ============================================================
  // STEP 5: Decide on OFFENSE
  // ============================================================
  
  const PUNCH_RANGE = 80;            // Close range for punches
  const KICK_RANGE = 120;            // Medium range for kicks
  const MINIMUM_ENERGY_FOR_PUNCH = 10;
  const MINIMUM_ENERGY_FOR_KICK = 20;
  
  // Only attack if: not defending AND ready to act AND have energy
  const isDefending = doBlock || crouch;
  const canAttack = !isDefending && iAmReadyToAct && self.energy > MINIMUM_ENERGY_FOR_PUNCH;
  
  if (canAttack) {
    // Close range: prefer punch (60% chance), sometimes kick
    if (distanceToOpponent < PUNCH_RANGE) {
      const preferPunch = Math.random() < 0.6;
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
  
  const MINIMUM_ENERGY_TO_JUMP = 15;
  const JUMP_CHANCE = 0.03;  // 3% chance each frame = occasional jumps
  
  // Sometimes jump to dodge attacks or mix up movement
  const shouldJump = 
      iAmOnTheGround && 
      self.energy > MINIMUM_ENERGY_TO_JUMP && 
      Math.random() < JUMP_CHANCE;
  
  if (shouldJump && !isDefending) {
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
    down: crouch,         // Press crouch? (COUNTERS KICKS!)
    action1: doPunch,     // Press punch button?
    action2: doKick,      // Press kick button?
    action3: doBlock      // Press block button? (COUNTERS PUNCHES!)
  };
}
`;

