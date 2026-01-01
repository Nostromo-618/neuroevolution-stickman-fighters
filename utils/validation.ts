/**
 * =============================================================================
 * VALIDATION SCHEMAS - External Data Validation (STANDARD Rule 5)
 * =============================================================================
 * 
 * Zod schemas for validating data from external sources (localStorage, imports).
 * This ensures that corrupted or malicious data doesn't crash the application.
 * 
 * =============================================================================
 */

import { z } from 'zod/v4';

// =============================================================================
// NEURAL NETWORK SCHEMAS
// =============================================================================

/**
 * Schema for serialized FeedForward network weights
 */
export const FeedForwardNetworkJSONSchema = z.object({
    type: z.literal('FeedForwardNetwork'),
    id: z.string().optional(),
    inputWeights: z.array(z.array(z.number())),
    outputWeights: z.array(z.array(z.number())),
    biases: z.array(z.number())
});

export type FeedForwardNetworkJSONValidated = z.infer<typeof FeedForwardNetworkJSONSchema>;

// =============================================================================
// GENOME SCHEMAS
// =============================================================================

/**
 * Schema for serialized genome (stored in localStorage or exported files)
 */
export const SerializedGenomeSchema = z.object({
    id: z.string(),
    fitness: z.number(),
    matchesWon: z.number(),
    network: FeedForwardNetworkJSONSchema
});

export type SerializedGenomeValidated = z.infer<typeof SerializedGenomeSchema>;

/**
 * Schema for exported genome file (includes metadata)
 */
export const ExportedGenomeSchema = z.object({
    version: z.string().optional(),
    generation: z.number().optional(),
    architecture: z.object({
        inputNodes: z.number(),
        hiddenNodes: z.number(),
        outputNodes: z.number()
    }).optional(),
    genome: z.object({
        id: z.string(),
        fitness: z.number(),
        matchesWon: z.number(),
        network: z.object({
            inputWeights: z.array(z.array(z.number())),
            outputWeights: z.array(z.array(z.number())),
            biases: z.array(z.number())
        })
    })
});

export type ExportedGenomeValidated = z.infer<typeof ExportedGenomeSchema>;

// =============================================================================
// SETTINGS SCHEMAS
// =============================================================================

/**
 * Schema for training settings stored in localStorage
 */
export const TrainingSettingsSchema = z.object({
    gameMode: z.enum(['TRAINING', 'ARCADE']),
    isRunning: z.boolean(),
    simulationSpeed: z.number().min(1).max(5000),
    mutationRate: z.number().min(0).max(1),
    populationSize: z.number().min(2).max(100),
    player1Type: z.string(),
    player2Type: z.string(),
    intelligentMutation: z.boolean().optional()
});

export type TrainingSettingsValidated = z.infer<typeof TrainingSettingsSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Safely parse and validate JSON data from localStorage.
 * Returns null if parsing or validation fails.
 * 
 * @param key - localStorage key
 * @param schema - Zod schema to validate against
 * @returns Validated data or null
 */
export function safeLoadFromStorage<T>(
    key: string,
    schema: z.ZodType<T>
): T | null {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const parsed = JSON.parse(raw);
        const result = schema.safeParse(parsed);

        if (result.success) {
            return result.data;
        }

        console.warn(`Validation failed for ${key}:`, result.error);
        return null;
    } catch (e) {
        console.warn(`Failed to load ${key} from storage:`, e);
        return null;
    }
}

/**
 * Validate imported genome data with detailed error reporting.
 * 
 * @param data - Unknown data from import
 * @returns Validated genome or error message
 */
export function validateImportedGenome(
    data: unknown
): { success: true; data: ExportedGenomeValidated } | { success: false; error: string } {
    const result = ExportedGenomeSchema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // Format error message for user
    const issues = result.error.issues.map(issue =>
        `${issue.path.join('.')}: ${issue.message}`
    ).join('; ');

    return {
        success: false,
        error: `Invalid genome file: ${issues}`
    };
}
