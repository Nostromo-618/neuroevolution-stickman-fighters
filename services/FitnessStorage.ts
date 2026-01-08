/**
 * =============================================================================
 * FITNESS STORAGE - LocalStorage Persistence for Fitness Configuration
 * =============================================================================
 *
 * This module handles storage, retrieval, import, and export of custom fitness
 * configurations. Mirrors the pattern from CustomScriptStorage.ts.
 */

import type { FitnessConfig } from '../types';

const LOCALSTORAGE_FITNESS_KEY = 'neuroevolution_fitness_config';

/**
 * Returns the default fitness configuration.
 * AGGRESSIVE PROFILE: Optimized for offensive play and proper facing.
 */
export function getDefaultFitnessConfig(): FitnessConfig {
  return {
    // Per-frame shaping - AGGRESSIVE PROFILE
    proximityReward400: 0.003,
    proximityReward200: 0.015,
    proximityReward80: 0.12,
    facingReward: 0.05,          // 5x increase - fixes "corner staring"
    aggressionReward: 0.25,
    timePenalty: -0.008,
    edgePenalty: -0.05,
    centerBonus: 0.03,
    edgeThreshold: 80,
    centerThreshold: 120,
    // Match-end bonuses - DAMAGE FOCUSED
    damageMultiplier: 3.0,
    healthMultiplier: 2.0,
    koWinBonus: 400,
    timeoutWinBonus: 100,
    stalematePenalty: -150,
    stalemateThreshold: 40
  };
}

/**
 * Converts a FitnessConfig object back into JavaScript code format
 * for display in the Monaco editor.
 *
 * @param config - The fitness configuration to convert
 * @returns JavaScript code string that returns the config
 */
export function configToJavascript(config: FitnessConfig): string {
  return `/**
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
  proximityReward400: ${config.proximityReward400},   // Small reward for approach
  proximityReward200: ${config.proximityReward200},    // Medium reward for engagement range
  proximityReward80: ${config.proximityReward80},     // Large reward for close combat
  facingReward: ${config.facingReward},          // Reward proper positioning
  aggressionReward: ${config.aggressionReward},      // Reward attacking in range
  timePenalty: ${config.timePenalty},         // Slight penalty to discourage stalling
  edgePenalty: ${config.edgePenalty},          // Penalty for being cornered
  centerBonus: ${config.centerBonus},           // Reward map control
  edgeThreshold: ${config.edgeThreshold},           // Pixels from edge (0-400)
  centerThreshold: ${config.centerThreshold},        // Pixels from center (0-400)

  // Match-end bonuses (once per match)
  damageMultiplier: ${config.damageMultiplier},       // Damage dealt weight
  healthMultiplier: ${config.healthMultiplier},       // Remaining health weight
  koWinBonus: ${config.koWinBonus},             // Knockout victory bonus
  timeoutWinBonus: ${config.timeoutWinBonus},        // Timeout victory bonus
  stalematePenalty: ${config.stalematePenalty},      // Penalty for passive play
  stalemateThreshold: ${config.stalemateThreshold}       // Min damage to avoid penalty
};
`;
}

/**
 * Saves a fitness configuration to localStorage.
 *
 * @param config - The fitness configuration to save
 */
export function saveFitnessConfig(config: FitnessConfig): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('LocalStorage not available. Fitness config not saved.');
    return;
  }

  try {
    const jsonString = JSON.stringify(config);
    localStorage.setItem(LOCALSTORAGE_FITNESS_KEY, jsonString);
  } catch (storageError) {
    console.error('Failed to save fitness config to localStorage:', storageError);
  }
}

/**
 * Loads a fitness configuration from localStorage.
 * Returns default config if nothing is saved or if there's an error.
 *
 * @returns The loaded or default fitness configuration
 */
export function loadFitnessConfig(): FitnessConfig {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getDefaultFitnessConfig();
  }

  try {
    const stored = localStorage.getItem(LOCALSTORAGE_FITNESS_KEY);
    if (!stored) {
      return getDefaultFitnessConfig();
    }

    const parsed = JSON.parse(stored) as FitnessConfig;
    // Validate that all required fields exist
    const defaultConfig = getDefaultFitnessConfig();
    const allFieldsPresent = Object.keys(defaultConfig).every(key => key in parsed);

    if (!allFieldsPresent) {
      console.warn('Stored fitness config is incomplete. Using defaults.');
      return getDefaultFitnessConfig();
    }

    return parsed;
  } catch (parseError) {
    console.error('Failed to load fitness config from localStorage:', parseError);
    return getDefaultFitnessConfig();
  }
}

/**
 * Exports a fitness configuration as a downloadable JSON file.
 *
 * @param config - The fitness configuration to export
 */
export function exportFitnessConfig(config: FitnessConfig): void {
  const exportData = {
    version: 1,
    type: 'neuroevolution-fitness-config',
    config: config,
    exportedAt: new Date().toISOString()
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fitness-config-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports a fitness configuration from a JSON string.
 * Validates the structure before returning.
 *
 * @param jsonString - The JSON string to parse
 * @returns The parsed fitness configuration, or null if invalid
 */
export function importFitnessConfig(jsonString: string): FitnessConfig | null {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (parsed.type !== 'neuroevolution-fitness-config') {
      console.error('Invalid import file: wrong type');
      return null;
    }

    if (!parsed.config || typeof parsed.config !== 'object') {
      console.error('Invalid import file: missing config object');
      return null;
    }

    const config = parsed.config as FitnessConfig;
    const defaultConfig = getDefaultFitnessConfig();
    const allFieldsPresent = Object.keys(defaultConfig).every(key => key in config);

    if (!allFieldsPresent) {
      console.error('Invalid import file: missing required fields');
      return null;
    }

    // Validate that all values are numbers
    const allValuesNumeric = Object.values(config).every(val => typeof val === 'number');
    if (!allValuesNumeric) {
      console.error('Invalid import file: non-numeric values found');
      return null;
    }

    return config;
  } catch (parseError) {
    console.error('Failed to parse imported fitness config:', parseError);
    return null;
  }
}
