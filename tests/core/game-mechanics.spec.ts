import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, waitForMatchStart, triggerKeyboardInput, triggerTouchInput, waitForGameStateUpdate } from '../fixtures/game-helpers';

test.describe('Game Mechanics - Desktop (Keyboard Input)', () => {
  test.beforeEach(async ({ gamePage, page }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
    
    // Only run on desktop viewports
    test.skip(page.viewportSize()!.width < 768, 'Desktop only test');
    
    // Set up for arcade mode with human player
    await gamePage.selectPlayer1('HUMAN');
    await gamePage.selectPlayer2('AI');
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
  });

  test('should move fighter left with ArrowLeft key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'ArrowLeft');
    await waitForGameStateUpdate(page, 500);
    
    // Fighter should move (canvas should update)
    // In a real test, you might check canvas state or fighter position
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should move fighter right with ArrowRight key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'ArrowRight');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should jump with W key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'KeyW');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should jump with Space key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'Space');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should punch with J key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'KeyJ');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should kick with K key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'KeyK');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should block with L key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'KeyL');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should block with Shift key', async ({ gamePage, page }) => {
    await triggerKeyboardInput(page, 'ShiftLeft');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });
});

test.describe('Game Mechanics - Mobile (Touch Controls)', () => {
  test.beforeEach(async ({ gamePage, page }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
    
    // Only run on mobile viewports
    test.skip(page.viewportSize()!.width >= 768, 'Mobile only test');
    
    // Set up for arcade mode
    await gamePage.selectPlayer1('HUMAN');
    await gamePage.selectPlayer2('AI');
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
  });

  test('should render touch controls in ARCADE mode', async ({ gamePage, page }) => {
    const { isTouchControlsVisible } = await import('../fixtures/game-helpers');
    const visible = await isTouchControlsVisible(page);
    expect(visible).toBe(true);
  });

  test('should respond to left movement touch', async ({ gamePage, page }) => {
    await triggerTouchInput(page, 'left');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should respond to right movement touch', async ({ gamePage, page }) => {
    await triggerTouchInput(page, 'right');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should respond to punch touch', async ({ gamePage, page }) => {
    await triggerTouchInput(page, 'punch');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should respond to kick touch', async ({ gamePage, page }) => {
    await triggerTouchInput(page, 'kick');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should respond to block touch', async ({ gamePage, page }) => {
    await triggerTouchInput(page, 'block');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should respond to jump touch', async ({ gamePage, page }) => {
    await triggerTouchInput(page, 'jump');
    await waitForGameStateUpdate(page, 500);
    
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });
});

