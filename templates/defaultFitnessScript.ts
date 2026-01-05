/**
 * =============================================================================
 * DEFAULT FITNESS CONFIGURATION TEMPLATE
 * =============================================================================
 *
 * This is the default fitness configuration script shown in the Fitness Editor.
 * Users can modify these values to customize how AI fighters are rewarded during training.
 */

export const DEFAULT_FITNESS_SCRIPT = `/**
 * FITNESS CONFIGURATION
 *
 * Customize how AI fighters are rewarded during training.
 * All values are additive to the genome's fitness score.
 *
 * PER-FRAME REWARDS (applied every game frame, 60 times per second):
 * ----------------------------------------------------------------
 * proximityReward400: Reward for being < 400px from opponent
 * proximityReward200: Reward for being < 200px from opponent
 * proximityReward80:  Reward for being < 80px from opponent
 * facingReward:       Reward for facing the opponent's direction
 * aggressionReward:   Reward for attacking when in range (< 100px)
 * timePenalty:        Penalty per frame (negative, discourages stalling)
 * edgePenalty:        Penalty for being at arena edge (negative)
 * centerBonus:        Reward for controlling arena center
 * edgeThreshold:      Distance from edge to trigger penalty (pixels)
 * centerThreshold:    Distance from center to get bonus (pixels)
 *
 * MATCH-END BONUSES (applied when match ends):
 * --------------------------------------------
 * damageMultiplier:   Multiplier for damage dealt to opponent
 * healthMultiplier:   Multiplier for remaining health
 * koWinBonus:         Bonus for winning by knockout
 * timeoutWinBonus:    Bonus for winning by timeout (less than KO)
 * stalematePenalty:   Penalty for passive matches (negative)
 * stalemateThreshold: Minimum total damage to avoid stalemate penalty
 *
 * TUNING TIPS:
 * -----------
 * - Higher proximity rewards → More aggressive fighters
 * - Higher edge penalty → Fighters avoid corners
 * - Higher center bonus → Fighters fight for map control
 * - Higher aggressionReward → More offensive playstyle
 * - Higher damageMultiplier → Prioritize damage over survival
 * - Higher healthMultiplier → Prioritize survival over damage
 */

return {
  // Per-frame shaping (60 times per second)
  proximityReward400: 0.005,   // Small reward for approach
  proximityReward200: 0.02,    // Medium reward for engagement range
  proximityReward80: 0.08,     // Large reward for close combat
  facingReward: 0.01,          // Reward proper positioning
  aggressionReward: 0.15,      // Reward attacking in range
  timePenalty: -0.005,         // Slight penalty to discourage stalling
  edgePenalty: -0.03,          // Penalty for being cornered
  centerBonus: 0.02,           // Reward map control
  edgeThreshold: 60,           // Pixels from edge (0-400)
  centerThreshold: 150,        // Pixels from center (0-400)

  // Match-end bonuses (once per match)
  damageMultiplier: 2.0,       // Damage dealt weight
  healthMultiplier: 2.5,       // Remaining health weight
  koWinBonus: 300,             // Knockout victory bonus
  timeoutWinBonus: 150,        // Timeout victory bonus
  stalematePenalty: -100,      // Penalty for passive play
  stalemateThreshold: 30       // Min damage to avoid penalty
};
`;
