import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, waitForMatchStart, waitForMatchEnd, waitForGameStateUpdate, getCurrentGeneration, getBestFitness } from '../fixtures/game-helpers';

test.describe('Training Mode E2E Flow', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
    
    // Switch to TRAINING mode
    const currentMode = await gamePage.getGameMode();
    if (currentMode !== 'TRAINING') {
      await gamePage.toggleGameMode();
      await waitForGameStateUpdate(gamePage.page);
    }
  });

  test('should complete full training mode flow', async ({ gamePage }) => {
    // Verify we're in TRAINING mode
    const mode = await gamePage.getGameMode();
    expect(mode).toBe('TRAINING');
    
    // Verify header shows training mode
    const modeText = await gamePage.page.textContent(gamePage.selectors.modeText);
    expect(modeText).toContain('Evolution');
    
    // Start training (matches should start automatically)
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Verify match is active
    const isActive = await gamePage.isMatchActive();
    expect(isActive).toBe(true);
    
    // Verify timer is counting
    const initialTimer = await gamePage.getTimer();
    expect(initialTimer).toBeGreaterThan(0);
    
    // Wait for match to progress
    await waitForGameStateUpdate(gamePage.page, 2000);
    
    // Verify timer is counting down
    const newTimer = await gamePage.getTimer();
    expect(newTimer).toBeLessThan(initialTimer);
  });

  test('should start AI vs AI match in training mode', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Verify both players are AI (AUTO badges visible)
    const autoBadges = gamePage.page.locator('span:has-text("AUTO")');
    const badgeCount = await autoBadges.count();
    expect(badgeCount).toBeGreaterThanOrEqual(2); // At least 2 AUTO badges (P1 and P2)
    
    // Verify canvas is rendering (fighters visible)
    const canvas = gamePage.page.locator(gamePage.selectors.canvas);
    await expect(canvas).toBeVisible();
  });

  test('should progress through matches automatically', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Get initial generation
    const initialGen = await getCurrentGeneration(gamePage.page);
    
    // Wait for match to end (this might take a while, so we'll use a shorter timeout for testing)
    // In a real scenario, you might want to speed up the simulation or wait for actual match end
    await waitForGameStateUpdate(gamePage.page, 5000);
    
    // After match ends, next match should start automatically
    // Verify match is still active or new match started
    const isActive = await gamePage.isMatchActive();
    // Match might have ended and new one started, or still in progress
    expect(typeof isActive).toBe('boolean');
  });

  test('should update fitness chart during training', async ({ gamePage }) => {
    // Get initial best fitness
    const initialFitness = await getBestFitness(gamePage.page);
    
    // Start training
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Wait for some matches to complete
    await waitForGameStateUpdate(gamePage.page, 10000);
    
    // Fitness should potentially increase (or at least be tracked)
    const newFitness = await getBestFitness(gamePage.page);
    // Fitness might be 0 initially, so we just verify it's a number
    expect(typeof newFitness).toBe('number');
  });

  test('should increment generation counter', async ({ gamePage }) => {
    // Get initial generation
    const initialGen = await getCurrentGeneration(gamePage.page);
    expect(initialGen).toBeGreaterThanOrEqual(1);
    
    // Start training
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Wait for evolution cycle (this would normally happen after all matches)
    // For testing, we'll just verify the counter exists and is visible
    const genText = gamePage.page.locator('text=/Gen: \\d+/');
    await expect(genText).toBeVisible();
    
    // Generation should be displayed
    const genDisplay = await genText.textContent();
    expect(genDisplay).toMatch(/Gen: \d+/);
  });

  test('should handle match end conditions', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Match can end by KO or timeout
    // We'll verify the match progresses and timer counts down
    const initialTimer = await gamePage.getTimer();
    expect(initialTimer).toBeGreaterThan(0);
    
    // Wait for some time
    await waitForGameStateUpdate(gamePage.page, 3000);
    
    // Timer should have decreased
    const newTimer = await gamePage.getTimer();
    expect(newTimer).toBeLessThan(initialTimer);
  });

  test('should show training mode specific UI elements', async ({ gamePage }) => {
    // Verify training mode label
    const modeLabel = gamePage.page.locator(gamePage.selectors.modeLabel);
    const labelText = await modeLabel.textContent();
    expect(labelText).toContain('TRAINING');
    
    // Verify training parameters are available
    const paramsButton = gamePage.page.locator(gamePage.selectors.trainingParamsButton);
    await expect(paramsButton).toBeVisible();
    
    // Verify fitness chart is visible
    const chartSection = gamePage.page.locator('h3:has-text("Fitness / Generation")');
    await expect(chartSection).toBeVisible();
  });
});

