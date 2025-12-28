import { Page, expect } from '@playwright/test';

/**
 * Game-specific helper functions for test utilities
 * 
 * Provides functions for waiting on game state, extracting game data,
 * and simulating game inputs.
 */

/**
 * Wait for a match to start
 * Checks for match initialization by waiting for pause button or timer to appear
 */
export async function waitForMatchStart(page: Page, timeout = 5000): Promise<void> {
  await Promise.race([
    page.waitForSelector('button:has-text("PAUSE")', { timeout }),
    page.waitForFunction(() => {
      const timer = document.querySelector('text');
      return timer && timer.textContent && parseInt(timer.textContent) < 90;
    }, { timeout }),
  ]);
}

/**
 * Wait for a match to end
 * Checks for match end by waiting for start button to reappear or toast notification
 */
export async function waitForMatchEnd(page: Page, timeout = 100000): Promise<void> {
  await Promise.race([
    page.waitForSelector('button:has-text("START")', { timeout }),
    page.waitForSelector('[class*="Toast"]', { timeout }),
  ]);
}

/**
 * Get fighter health from HUD
 * Extracts health value from the game HUD display
 */
export async function getFighterHealth(page: Page, player: 1 | 2): Promise<number> {
  // Health is displayed in the HUD overlay on canvas
  // For now, we'll check if the health bar element exists
  // In a real implementation, you might need to read from canvas or HUD elements
  const healthElement = player === 1 
    ? page.locator('[class*="YOU"]')
    : page.locator('[class*="AI"]');
  
  // Health is typically shown as a percentage or number
  // This is a placeholder - actual implementation depends on HUD structure
  return 100; // Default, would need canvas reading for actual value
}

/**
 * Trigger keyboard input for fighter movement
 */
export async function triggerKeyboardInput(
  page: Page,
  key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD' | 'KeyJ' | 'KeyK' | 'KeyL' | 'Space' | 'ShiftLeft'
): Promise<void> {
  await page.keyboard.press(key);
}

/**
 * Trigger touch input for mobile controls
 * TouchControls uses SVG icons, so we find buttons by their position/structure
 */
export async function triggerTouchInput(
  page: Page,
  action: 'left' | 'right' | 'punch' | 'kick' | 'block' | 'jump'
): Promise<void> {
  // Touch controls are in a div with lg:hidden class
  const touchControlsContainer = page.locator('div.lg\\:hidden').filter({ has: page.locator('button[class*="absolute"]') });
  
  let button;
  switch (action) {
    case 'left':
      // Left button has SVG with path containing "M10 19l-7-7"
      button = touchControlsContainer.locator('button').filter({ has: page.locator('svg path[d*="M10 19l-7-7"]') }).first();
      break;
    case 'right':
      // Right button has SVG with path containing "M14 5l7 7"
      button = touchControlsContainer.locator('button').filter({ has: page.locator('svg path[d*="M14 5l7 7"]') }).first();
      break;
    case 'punch':
      // Punch button has text "P" in a span
      button = touchControlsContainer.locator('button').filter({ has: page.locator('span:has-text("P")') }).first();
      break;
    case 'kick':
      // Kick button has text "K" in a span
      button = touchControlsContainer.locator('button').filter({ has: page.locator('span:has-text("K")') }).first();
      break;
    case 'block':
      // Block button has SVG shield icon
      button = touchControlsContainer.locator('button').filter({ has: page.locator('svg path[d*="M9 12l2 2 4-4"]') }).first();
      break;
    case 'jump':
      // Jump is the "up" button in the D-pad, has SVG with path containing "M5 10l7-7"
      button = touchControlsContainer.locator('button').filter({ has: page.locator('svg path[d*="M5 10l7-7"]') }).first();
      break;
  }
  
  if (!button || (await button.count()) === 0) {
    throw new Error(`Could not find touch control button for action: ${action}`);
  }
  
  await button.first().dispatchEvent('touchstart');
  await page.waitForTimeout(100);
  await button.first().dispatchEvent('touchend');
}

/**
 * Wait for canvas to render
 */
export async function waitForCanvasRender(page: Page): Promise<void> {
  // Use game canvas specifically (first canvas with rounded-lg class)
  const canvas = page.locator('canvas.rounded-lg.shadow-2xl').first();
  await canvas.waitFor({ state: 'visible' });
  
  // Wait for canvas to have content (non-zero dimensions)
  await page.waitForFunction(() => {
    const canvas = document.querySelector('canvas.rounded-lg.shadow-2xl');
    return canvas && canvas.width > 0 && canvas.height > 0;
  });
}

/**
 * Check if touch controls are visible
 */
export async function isTouchControlsVisible(page: Page): Promise<boolean> {
  try {
    // Touch controls are in a div with lg:hidden class (visible on mobile)
    const touchControls = page.locator('div.lg\\:hidden').filter({ has: page.locator('button[class*="absolute"]') });
    return await touchControls.first().isVisible();
  } catch {
    return false;
  }
}

/**
 * Check if neural network visualizer is visible
 */
export async function isNeuralNetworkVisible(page: Page): Promise<boolean> {
  try {
    // Neural network visualizer has className="hidden md:block" - visible on desktop (md+), hidden on mobile
    // Check for the neural network canvas specifically (second canvas without rounded-lg)
    const nnCanvas = page.locator('canvas').filter({ hasNot: page.locator('.rounded-lg') }).first();
    // Or check if the container with "hidden md:block" is actually visible
    const nnContainer = page.locator('div.hidden.md\\:block').filter({ has: page.locator('canvas') });
    return await nnContainer.isVisible().catch(() => false);
  } catch {
    return false;
  }
}

/**
 * Wait for game state to update
 * Generic function to wait for React state changes
 */
export async function waitForGameStateUpdate(page: Page, timeout = 2000): Promise<void> {
  await page.waitForTimeout(timeout);
}

/**
 * Get current generation number from dashboard
 */
export async function getCurrentGeneration(page: Page): Promise<number> {
  const genText = await page.locator('text=/Gen: \\d+/').textContent();
  const match = genText?.match(/Gen: (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get best fitness from dashboard
 */
export async function getBestFitness(page: Page): Promise<number> {
  const fitnessText = await page.locator('text=/Best: \\d+/').textContent();
  const match = fitnessText?.match(/Best: (\d+)/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Verify match timer is counting down
 */
export async function verifyTimerCountdown(page: Page, initialTime: number, waitMs = 2000): Promise<void> {
  await page.waitForTimeout(waitMs);
  const currentTime = await page.locator('text=/\\d+/').first().textContent();
  const current = currentTime ? parseInt(currentTime.match(/\d+/)![0], 10) : 0;
  expect(current).toBeLessThan(initialTime);
}

/**
 * Check if disclaimer modal is visible
 */
export async function isDisclaimerVisible(page: Page): Promise<boolean> {
  return await page.locator('[class*="DisclaimerModal"]').isVisible().catch(() => false);
}

/**
 * Accept disclaimer if present
 */
export async function acceptDisclaimer(page: Page): Promise<void> {
  const acceptButton = page.locator('button:has-text("Accept"), button:has-text("I Agree")');
  if (await acceptButton.isVisible()) {
    await acceptButton.click();
    await page.waitForTimeout(500);
  }
}

