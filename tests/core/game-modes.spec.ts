import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, waitForGameStateUpdate } from '../fixtures/game-helpers';

test.describe('Game Mode Switching', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
  });

  test('should switch from ARCADE to TRAINING mode', async ({ gamePage }) => {
    // Verify initial mode is ARCADE
    const initialMode = await gamePage.getGameMode();
    expect(initialMode).toBe('ARCADE');
    
    // Verify header text
    const modeText = await gamePage.page.textContent(gamePage.selectors.modeText);
    expect(modeText).toContain('Single Match Mode');
    
    // Switch to TRAINING mode
    await gamePage.toggleGameMode();
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify mode changed
    const newMode = await gamePage.getGameMode();
    expect(newMode).toBe('TRAINING');
    
    // Verify header text updated
    const newModeText = await gamePage.page.textContent(gamePage.selectors.modeText);
    expect(newModeText).toContain('Evolution');
    
    // Verify toggle button state
    const toggleButton = gamePage.page.locator(gamePage.selectors.trainingToggle);
    await expect(toggleButton).toHaveClass(/bg-blue-600/);
  });

  test('should switch from TRAINING to ARCADE mode', async ({ gamePage }) => {
    // Start in TRAINING mode
    await gamePage.toggleGameMode();
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify we're in TRAINING mode
    let mode = await gamePage.getGameMode();
    expect(mode).toBe('TRAINING');
    
    // Switch back to ARCADE
    await gamePage.toggleGameMode();
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify mode changed back
    mode = await gamePage.getGameMode();
    expect(mode).toBe('ARCADE');
    
    // Verify header text
    const modeText = await gamePage.page.textContent(gamePage.selectors.modeText);
    expect(modeText).toContain('Single Match Mode');
  });

  test('should reset game state on mode switch', async ({ gamePage }) => {
    // Start a match in ARCADE mode
    await gamePage.startMatch();
    await waitForGameStateUpdate(gamePage.page, 1000);
    
    // Verify match is active
    const isActive = await gamePage.isMatchActive();
    expect(isActive).toBe(true);
    
    // Switch to TRAINING mode
    await gamePage.toggleGameMode();
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify match is no longer active (reset)
    const isActiveAfterSwitch = await gamePage.isMatchActive();
    expect(isActiveAfterSwitch).toBe(false);
  });

  test('should update UI elements on mode switch', async ({ gamePage }) => {
    // Check initial state
    const modeLabel = gamePage.page.locator(gamePage.selectors.modeLabel);
    let labelText = await modeLabel.textContent();
    expect(labelText).toContain('SINGLE MATCH');
    
    // Switch to TRAINING
    await gamePage.toggleGameMode();
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify label updated
    labelText = await modeLabel.textContent();
    expect(labelText).toContain('TRAINING');
  });

  test('should show/hide touch controls based on mode', async ({ gamePage, page }) => {
    const { isTouchControlsVisible } = await import('../fixtures/game-helpers');
    
    // In ARCADE mode, touch controls should be visible (on mobile)
    const isMobile = page.viewportSize()!.width < 768;
    
    if (isMobile) {
      // Start match to activate touch controls
      await gamePage.startMatch();
      await gamePage.page.waitForTimeout(1000);
      
      const touchVisible = await isTouchControlsVisible(page);
      // Touch controls only appear when match is active in ARCADE mode
      expect(await gamePage.getGameMode()).toBe('ARCADE');
    }
  });
});

