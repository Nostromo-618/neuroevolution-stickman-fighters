/**
 * =============================================================================
 * DEBUG UTILITY - Toggleable Debug Logging
 * =============================================================================
 * 
 * Provides verbose logging for diagnosing simulation freezes.
 * Toggle DEBUG_ENABLED in Config.ts to enable/disable.
 */

import { DEBUG_FLAGS } from '~/services/Config';

let lastLogTime = 0;
let frameCount = 0;
let loopCount = 0;

/**
 * Log a debug message with category prefix.
 * Only logs if DEBUG_FLAGS.VERBOSE_LOGGING is true.
 */
export function debugLog(category: string, message: string, data?: unknown): void {
    if (!DEBUG_FLAGS.VERBOSE_LOGGING) return;

    const timestamp = performance.now().toFixed(2);
    const prefix = `[DEBUG ${timestamp}ms] [${category}]`;

    if (data !== undefined) {
        console.log(prefix, message, data);
    } else {
        console.log(prefix, message);
    }
}

/**
 * Log frame timing - throttled to every 60 frames to avoid spam.
 */
export function debugFrame(category: string, message: string): void {
    if (!DEBUG_FLAGS.VERBOSE_LOGGING) return;

    frameCount++;
    if (frameCount % 60 === 0) {
        const now = performance.now();
        const delta = now - lastLogTime;
        const fps = (60 / delta) * 1000;
        lastLogTime = now;
        console.log(`[DEBUG FRAME ${frameCount}] [${category}] ${message} | FPS: ${fps.toFixed(1)}`);
    }
}

/**
 * Log loop iteration - throttled to every N iterations.
 */
export function debugLoop(category: string, message: string, throttle: number = 100): void {
    if (!DEBUG_FLAGS.VERBOSE_LOGGING) return;

    loopCount++;
    if (loopCount % throttle === 0) {
        console.log(`[DEBUG LOOP ${loopCount}] [${category}] ${message}`);
    }
}

/**
 * Always log critical state changes (not throttled).
 */
export function debugCritical(category: string, message: string, data?: unknown): void {
    if (!DEBUG_FLAGS.VERBOSE_LOGGING) return;

    const timestamp = performance.now().toFixed(2);
    const prefix = `[🔴 CRITICAL ${timestamp}ms] [${category}]`;

    if (data !== undefined) {
        console.warn(prefix, message, data);
    } else {
        console.warn(prefix, message);
    }
}

/**
 * Reset frame/loop counters (call on match start).
 */
export function debugReset(): void {
    frameCount = 0;
    loopCount = 0;
    lastLogTime = performance.now();
    if (DEBUG_FLAGS.VERBOSE_LOGGING) {
        console.log('[DEBUG] Counters reset');
    }
}
