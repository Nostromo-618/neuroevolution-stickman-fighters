/**
 * =============================================================================
 * FITNESS SHAPING - Training Reward System
 * =============================================================================
 * 
 * Applies fitness rewards/penalties during training to guide AI learning.
 * Provides intermediate rewards for good behaviors (proximity, aggression, etc.)
 * rather than only rewarding final match outcomes.
 */

import { Fighter, CANVAS_WIDTH } from './GameEngine';
import { FighterAction } from '../types';
import type { Genome } from '../types';

/**
 * Applies fitness shaping rewards/penalties during training.
 * 
 * This function is called every frame during training matches to provide
 * intermediate feedback to the AI, helping it learn faster than if it
 * only received rewards at match end.
 * 
 * @param fighter - The fighter being evaluated
 * @param opponent - The opponent fighter
 * @param genome - The genome to update fitness for
 */
export function applyFitnessShaping(fighter: Fighter, opponent: Fighter, genome: Genome): void {
    if (opponent.health <= 0) return;

    const dist = Math.abs(fighter.x - opponent.x);

    // 1. PROXIMITY REWARD
    if (dist < 400) genome.fitness += 0.005;
    if (dist < 200) genome.fitness += 0.02;
    if (dist < 80) genome.fitness += 0.05;

    // 2. FACING REWARD
    const dx = opponent.x - fighter.x;
    const correctFacing = (dx > 0 && fighter.direction === 1) || (dx < 0 && fighter.direction === -1);
    if (correctFacing) genome.fitness += 0.02;

    // 3. AGGRESSION REWARD
    if (dist < 100 && (fighter.state === FighterAction.PUNCH || fighter.state === FighterAction.KICK)) {
        genome.fitness += 0.1;
    }

    // 4. TIME PENALTY
    genome.fitness -= 0.005;

    // 5. EDGE/CORNER PENALTY
    const edgeThreshold = 60;
    if (fighter.x < edgeThreshold || fighter.x > CANVAS_WIDTH - fighter.width - edgeThreshold) {
        genome.fitness -= 0.04;
    }

    // 6. CENTER CONTROL BONUS
    const centerX = CANVAS_WIDTH / 2;
    const distFromCenter = Math.abs(fighter.x + fighter.width / 2 - centerX);
    if (distFromCenter < 150) {
        genome.fitness += 0.015;
    }

    // 7. MOVEMENT REWARD
    if (Math.abs(fighter.vx) > 0.5) {
        genome.fitness += 0.008;
    }
}

