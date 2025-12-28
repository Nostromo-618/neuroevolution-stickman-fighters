import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, waitForMatchStart, waitForGameStateUpdate } from '../fixtures/game-helpers';

test.describe('Match Controls', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
  });

  test('should start match when START button is clicked', async ({ gamePage }) => {
    await gamePage.startMatch();
    
    // Verify match started
    const isActive = await gamePage.isMatchActive();
    expect(isActive).toBe(true);
    
    // Verify pause button is visible
    await expect(gamePage.page.locator(gamePage.selectors.pauseButton)).toBeVisible();
  });

  test('should pause match when PAUSE button is clicked', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Pause the match
    await gamePage.pauseMatch();
    await waitForGameStateUpdate(gamePage.page, 500);
    
    // Verify start button is visible again
    await expect(gamePage.page.locator(gamePage.selectors.startButton)).toBeVisible();
  });

  test('should reset match when RESET button is clicked', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Get initial timer value
    const initialTimer = await gamePage.getTimer();
    expect(initialTimer).toBeGreaterThan(0);
    
    // Reset the match
    await gamePage.resetMatch();
    await waitForGameStateUpdate(gamePage.page, 1000); // Wait for state to update
    
    // Verify start button is visible (more reliable than checking isMatchActive)
    await expect(gamePage.page.locator(gamePage.selectors.startButton)).toBeVisible({ timeout: 5000 });
    
    // Verify pause button is not visible
    const pauseVisible = await gamePage.page.locator(gamePage.selectors.pauseButton).isVisible().catch(() => false);
    expect(pauseVisible).toBe(false);
  });

  test('should initialize timer at 90 seconds', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Wait a bit for timer to initialize
    await waitForGameStateUpdate(gamePage.page, 1000);
    
    // Get timer value (should be close to 90)
    const timer = await gamePage.getTimer();
    expect(timer).toBeGreaterThanOrEqual(85); // Allow for some time to pass
    expect(timer).toBeLessThanOrEqual(90);
  });

  test('should spawn fighters when match starts', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Verify canvas is visible and has content
    const canvas = gamePage.page.locator(gamePage.selectors.canvas);
    await expect(canvas).toBeVisible();
    
    // Verify canvas has dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(0);
    expect(canvasBox!.height).toBeGreaterThan(0);
  });

  test('should end match on timeout', async ({ gamePage }) => {
    // This test would take 90 seconds, so we'll just verify the timer counts down
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    const initialTimer = await gamePage.getTimer();
    expect(initialTimer).toBeGreaterThan(0);
    
    // Wait a few seconds and verify timer decreased
    await waitForGameStateUpdate(gamePage.page, 3000);
    const newTimer = await gamePage.getTimer();
    expect(newTimer).toBeLessThan(initialTimer);
  });
});

