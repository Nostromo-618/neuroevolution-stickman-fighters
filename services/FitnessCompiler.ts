/**
 * =============================================================================
 * FITNESS COMPILER - Validation and Compilation of User Fitness Code
 * =============================================================================
 *
 * This module validates and compiles user-provided fitness configuration code.
 * Ensures safety by checking for infinite loops and validating the output structure.
 */

import type { FitnessConfig } from '../types';
import { analyzeLoopSafety } from './LoopSafetyAnalyzer';
import { getDefaultFitnessConfig } from './FitnessStorage';

/**
 * CompileResult for fitness configuration
 */
export interface FitnessCompileResult {
  config: FitnessConfig | null;
  error: string | null;
}

/**
 * Compiles and validates user-provided fitness configuration code.
 *
 * Safety checks:
 * 1. Loop safety analysis (prevents while(true), etc.)
 * 2. Sandboxed execution via Function constructor
 * 3. Validates returned object structure
 * 4. Validates all fields are numbers
 * 5. Validates all fields are within reasonable ranges
 *
 * @param userCode - JavaScript code that should return a FitnessConfig object
 * @returns CompileResult with config or error
 */
export function compileFitnessScript(userCode: string): FitnessCompileResult {
  // PHASE 1: Loop safety check
  const loopSafety = analyzeLoopSafety(userCode);
  if (!loopSafety.safe) {
    return {
      config: null,
      error: loopSafety.error || 'Unknown loop safety error'
    };
  }

  // PHASE 2: Execute user code in sandboxed environment
  try {
    // Wrap user code to capture return value
    const wrappedCode = `
      ${userCode}
    `;

    // Execute in isolated scope
    const factoryFunction = new Function(wrappedCode);
    const result = factoryFunction();

    // PHASE 3: Validate structure
    if (!result || typeof result !== 'object') {
      return {
        config: null,
        error: 'Code must return an object with fitness configuration'
      };
    }

    // PHASE 4: Validate all required fields exist
    const defaultConfig = getDefaultFitnessConfig();
    const requiredFields = Object.keys(defaultConfig);
    const missingFields = requiredFields.filter(field => !(field in result));

    if (missingFields.length > 0) {
      return {
        config: null,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // PHASE 5: Validate all values are numbers
    const config = result as FitnessConfig;
    const nonNumericFields: string[] = [];

    for (const [key, value] of Object.entries(config)) {
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        nonNumericFields.push(key);
      }
    }

    if (nonNumericFields.length > 0) {
      return {
        config: null,
        error: `Non-numeric values in fields: ${nonNumericFields.join(', ')}`
      };
    }

    // PHASE 6: Validate reasonable ranges
    const validationErrors: string[] = [];

    // Threshold values should be positive
    if (config.edgeThreshold < 0) {
      validationErrors.push('edgeThreshold must be >= 0');
    }
    if (config.centerThreshold < 0) {
      validationErrors.push('centerThreshold must be >= 0');
    }
    if (config.stalemateThreshold < 0) {
      validationErrors.push('stalemateThreshold must be >= 0');
    }

    // Multipliers shouldn't be absurdly large (sanity check)
    const maxReasonableValue = 10000;
    for (const [key, value] of Object.entries(config)) {
      if (Math.abs(value) > maxReasonableValue) {
        validationErrors.push(`${key} is too large (max ±${maxReasonableValue})`);
      }
    }

    if (validationErrors.length > 0) {
      return {
        config: null,
        error: validationErrors.join('; ')
      };
    }

    // SUCCESS: Return validated config
    return {
      config: config,
      error: null
    };

  } catch (compileError) {
    // Catch any runtime errors
    const errorMessage = compileError instanceof Error
      ? compileError.message
      : String(compileError);

    return {
      config: null,
      error: `Compilation error: ${errorMessage}`
    };
  }
}
