/**
 * =============================================================================
 * USE FITNESS CONFIG - Reactive Fitness Configuration State
 * =============================================================================
 *
 * Composable for managing fitness configuration state across the application.
 * Provides reactive access to the current fitness config and methods to update it.
 */

import { ref, readonly } from 'vue';
import type { FitnessConfig } from '../types';
import { loadFitnessConfig, saveFitnessConfig } from '../services/FitnessStorage';

// Global state (singleton pattern)
const fitnessConfig = ref<FitnessConfig>(loadFitnessConfig());

/**
 * Composable for fitness configuration management.
 *
 * @returns Reactive fitness config and update method
 */
export function useFitnessConfig() {
  const updateFitnessConfig = (newConfig: FitnessConfig) => {
    fitnessConfig.value = newConfig;
    saveFitnessConfig(newConfig);
  };

  const resetFitnessConfig = () => {
    const defaultConfig = loadFitnessConfig();
    fitnessConfig.value = defaultConfig;
    saveFitnessConfig(defaultConfig);
  };

  return {
    fitnessConfig: readonly(fitnessConfig),
    updateFitnessConfig,
    resetFitnessConfig
  };
}
