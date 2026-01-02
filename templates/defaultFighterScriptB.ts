/**
 * =============================================================================
 * DEFAULT FIGHTER SCRIPT B TEMPLATE - THE CHAOTIC CHALLENGER
 * =============================================================================
 * 
 * A randomized, unpredictable fighter template for Script B slot.
 * Based on the same structure as Script A, but uses heavy randomization
 * to create a more chaotic, less predictable opponent.
 * 
 * Educational purpose: Demonstrates how randomness affects AI behavior.
 * Compare this to Script A to see how deterministic vs random decisions differ!
 */

export const DEFAULT_FIGHTER_SCRIPT_B = `/**
 * ============================================================
 * CHAOTIC CHALLENGER AI - Unpredictable Random Fighter
 * ============================================================
 * 
 * This script uses HEAVY RANDOMIZATION to create an unpredictable fighter.
 * Unlike Script A which makes logical decisions, this fighter:
 * - Randomly decides whether to attack, defend, or move
 * - Uses random thresholds that change every frame
 * - Sometimes makes "bad" decisions on purpose
 * 
 * Compare this to Script A to learn how randomness affects AI behavior!
 * 
 * ============================================================
 * KEY LEARNING POINT: Randomness vs Strategy
 * ============================================================
 * 
 * Random AI can be surprisingly effective because:
 * - Opponents can't predict your next move
 * - Occasional "lucky" hits can change the fight
 * - Good for testing your own AI against unpredictable opponents
 * 
 * But random AI is limited because:
 * - Doesn't learn or adapt
 * - Makes suboptimal choices frequently
 * - No concept of timing or spacing
 * 
 * ============================================================
 */

function decide(self, opponent) {
  
  // ============================================================
  // HELPER: Random Number Generator Utilities
  // ============================================================
  
  /**
   * Returns a random number between min and max (inclusive).
   * Example: randomBetween(10, 50) might return 27
   */
  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Returns true with the given probability (0 to 1).
   * Example: randomChance(0.3) returns true 30% of the time
   */
  function randomChance(probability) {
    return Math.random() < probability;
  }
  
  /**
   * Picks a random element from an array.
   * Example: randomPick(['punch', 'kick', 'block']) might return 'kick'
   */
  function randomPick(options) {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }
  
  
  // ============================================================
  // STEP 1: Analyze the situation (same as Script A)
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
  
  // Am I facing the opponent?
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
  // STEP 3: RANDOM MOVEMENT BEHAVIOR
  // ============================================================
  // Unlike Script A, we use RANDOM thresholds each frame!
  
  // Generate random thresholds for this frame (adds unpredictability)
  const randomDistanceThreshold = randomBetween(50, 150);
  const chaseChance = randomChance(0.7);  // 70% chance to chase
  const retreatChance = randomChance(0.15);  // 15% chance to retreat
  
  // Random walk: Sometimes move even when not chasing
  const randomWalkChance = randomChance(0.1);  // 10% random movement
  
  if (randomWalkChance) {
    // Random direction! Complete chaos!
    const randomDirection = randomPick(['left', 'right', 'stay']);
    if (randomDirection === 'left') moveLeft = true;
    if (randomDirection === 'right') moveRight = true;
  } else if (distanceToOpponent > randomDistanceThreshold && chaseChance) {
    // Chase the opponent (but with random threshold)
    if (opponentIsToMyRight) {
      moveRight = true;
    } else {
      moveLeft = true;
    }
  } else if (retreatChance) {
    // Random retreat! Run away for no reason!
    if (opponentIsToMyRight) {
      moveLeft = true;
    } else {
      moveRight = true;
    }
  }
  
  
  // ============================================================
  // STEP 4: RANDOM DEFENSE BEHAVIOR
  // ============================================================
  // Sometimes we defend even when not being attacked!
  // Sometimes we ignore attacks! Pure chaos!
  
  const shouldDefendAnyway = randomChance(0.1);  // 10% random defense
  const shouldIgnoreAttack = randomChance(0.3);  // 30% chance to ignore attack!
  const randomDefenseRange = randomBetween(80, 180);
  
  const isInDefenseRange = distanceToOpponent < randomDefenseRange;
  
  // Random defensive action even when not attacked
  if (shouldDefendAnyway && isInDefenseRange) {
    const randomDefense = randomPick(['block', 'crouch', 'nothing']);
    if (randomDefense === 'block') doBlock = true;
    if (randomDefense === 'crouch') crouch = true;
  }
  // React to attacks (but sometimes ignore them!)
  else if (opponentIsAttacking && isInDefenseRange && !shouldIgnoreAttack && iAmFacingOpponent) {
    // 50/50 chance to pick the RIGHT defense vs WRONG defense
    const picksCorrectDefense = randomChance(0.5);
    
    if (opponentIsPunching) {
      // Correct: block. Wrong: crouch
      if (picksCorrectDefense) {
        doBlock = true;
      } else {
        crouch = true;  // Oops! Wrong defense!
      }
    } else if (opponentIsKicking) {
      // Correct: crouch. Wrong: block
      if (picksCorrectDefense) {
        crouch = true;
      } else {
        doBlock = true;  // Oops! Wrong defense!
      }
    }
    
    // Stop moving while defending
    moveLeft = false;
    moveRight = false;
  }
  
  
  // ============================================================
  // STEP 5: RANDOM OFFENSE BEHAVIOR
  // ============================================================
  // Attack at random times! Random attack selection!
  
  const randomAttackRange = randomBetween(60, 140);
  const attackChance = randomChance(0.4);  // 40% chance to attack when in range
  const spamAttackChance = randomChance(0.05);  // 5% chance to attack from ANY distance!
  
  const isDefending = doBlock || crouch;
  const hasEnoughEnergy = self.energy > 15;
  
  // Sometimes attack wildly from any distance (spam attack!)
  if (spamAttackChance && iAmReadyToAct && hasEnoughEnergy && !isDefending) {
    const randomAttack = randomPick(['punch', 'kick', 'punch', 'punch']);  // Favor punch
    if (randomAttack === 'punch') doPunch = true;
    if (randomAttack === 'kick' && self.energy > 20) doKick = true;
  }
  // Normal range-based attack (with randomness)
  else if (distanceToOpponent < randomAttackRange && attackChance && iAmReadyToAct && hasEnoughEnergy && !isDefending) {
    // Random attack selection! No logic, just vibes!
    const attackSelection = randomBetween(1, 100);
    
    if (attackSelection <= 50) {
      // 50% chance: Punch
      doPunch = true;
    } else if (attackSelection <= 80) {
      // 30% chance: Kick (if enough energy)
      if (self.energy > 20) {
        doKick = true;
      } else {
        doPunch = true;  // Fallback to punch
      }
    } else {
      // 20% chance: Do nothing! Fake out!
      // (This creates "hesitation" which can bait opponents)
    }
  }
  
  
  // ============================================================
  // STEP 6: RANDOM JUMPING BEHAVIOR
  // ============================================================
  // Jump WAY more often than Script A! Bouncy chaos!
  
  const jumpChance = randomChance(0.12);  // 12% per frame = LOTS of jumping!
  const panicJumpChance = randomChance(0.2);  // 20% chance when being attacked
  
  // Random jumping
  if (iAmOnTheGround && self.energy > 10 && !isDefending) {
    if (jumpChance) {
      jump = true;
    }
    // Panic jump when being attacked!
    else if (opponentIsAttacking && panicJumpChance) {
      jump = true;
    }
  }
  
  
  // ============================================================
  // STEP 7: CHAOS FACTOR - Random Action Override!
  // ============================================================
  // 5% chance to completely randomize EVERYTHING!
  // This creates truly unpredictable moments.
  
  const totalChaosMode = randomChance(0.05);
  
  if (totalChaosMode) {
    // Reset everything
    moveLeft = false;
    moveRight = false;
    jump = false;
    crouch = false;
    doPunch = false;
    doKick = false;
    doBlock = false;
    
    // Pick completely random actions!
    if (randomChance(0.5)) moveLeft = randomChance(0.5);
    if (randomChance(0.5)) moveRight = randomChance(0.5);
    if (randomChance(0.3) && iAmOnTheGround) jump = true;
    if (randomChance(0.3)) crouch = true;
    if (randomChance(0.3) && iAmReadyToAct) doPunch = true;
    if (randomChance(0.2) && iAmReadyToAct) doKick = true;
    if (randomChance(0.3)) doBlock = true;
  }
  
  
  // ============================================================
  // STEP 8: Return the final decision
  // ============================================================
  
  return {
    left: moveLeft,
    right: moveRight,
    up: jump,
    down: crouch,
    action1: doPunch,
    action2: doKick,
    action3: doBlock
  };
}
`;
