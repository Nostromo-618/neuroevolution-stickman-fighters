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
  // Per-frame shaping (60 times per second) - AGGRESSIVE PROFILE
  proximityReward400: 0.003,   // Reduced long-range incentive
  proximityReward200: 0.015,   // Slight reduction
  proximityReward80: 0.12,     // Increased close combat reward
  facingReward: 0.05,          // 5x increase - fixes "corner staring"
  aggressionReward: 0.25,      // Increased attacking reward
  timePenalty: -0.008,         // Increased time pressure
  edgePenalty: -0.05,          // Increased edge punishment
  centerBonus: 0.03,           // Slight increase for map control
  edgeThreshold: 80,           // Wider edge zone
  centerThreshold: 120,        // Tighter center zone

  // Match-end bonuses (once per match) - DAMAGE FOCUSED
  damageMultiplier: 3.0,       // Prioritize dealing damage
  healthMultiplier: 2.0,       // Less defensive focus
  koWinBonus: 400,             // Increased KO incentive
  timeoutWinBonus: 100,        // Decreased timeout value
  stalematePenalty: -150,      // Increased passive penalty
  stalemateThreshold: 40       // Higher minimum damage requirement
};
`;
