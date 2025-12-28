import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, waitForGameStateUpdate } from '../fixtures/game-helpers';

test.describe('Player Selection', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
  });

  test('should select Player 1 type: HUMAN', async ({ gamePage }) => {
    await gamePage.selectPlayer1('HUMAN');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify button is active
    const humanButton = gamePage.page.locator(gamePage.selectors.player1Button('HUMAN'));
    await expect(humanButton).toHaveClass(/bg-red-600/);
  });

  test('should select Player 1 type: AI', async ({ gamePage }) => {
    await gamePage.selectPlayer1('AI');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify button is active
    const aiButton = gamePage.page.locator(gamePage.selectors.player1Button('AI'));
    await expect(aiButton).toHaveClass(/bg-red-600/);
    
    // Verify AUTO badge appears
    const autoBadge = gamePage.page.locator('span:has-text("AUTO")').first();
    await expect(autoBadge).toBeVisible();
  });

  test('should select Player 1 type: SCRIPT A', async ({ gamePage }) => {
    await gamePage.selectPlayer1('SCRIPT A');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify button is active
    const scriptButton = gamePage.page.locator(gamePage.selectors.player1Button('SCRIPT A'));
    await expect(scriptButton).toHaveClass(/bg-red-600/);
    
    // Verify script editor button appears
    await expect(gamePage.page.locator(gamePage.selectors.scriptEditorButton)).toBeVisible();
  });

  test('should select Player 1 type: SCRIPT B', async ({ gamePage }) => {
    await gamePage.selectPlayer1('SCRIPT B');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify button is active
    const scriptButton = gamePage.page.locator(gamePage.selectors.player1Button('SCRIPT B'));
    await expect(scriptButton).toHaveClass(/bg-red-600/);
    
    // Verify script editor button appears
    await expect(gamePage.page.locator(gamePage.selectors.scriptEditorButton)).toBeVisible();
  });

  test('should select Player 2 type: AI', async ({ gamePage }) => {
    await gamePage.selectPlayer2('AI');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify button is active
    const aiButton = gamePage.page.locator(gamePage.selectors.player2Button('AI'));
    await expect(aiButton).toHaveClass(/bg-blue-600/);
  });

  test('should select Player 2 type: SCRIPT A', async ({ gamePage }) => {
    await gamePage.selectPlayer2('SCRIPT A');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify button is active
    const scriptButton = gamePage.page.locator(gamePage.selectors.player2Button('SCRIPT A'));
    await expect(scriptButton).toHaveClass(/bg-blue-600/);
    
    // Verify script editor button appears
    await expect(gamePage.page.locator(gamePage.selectors.scriptEditorButton)).toBeVisible();
  });

  test('should select Player 2 type: SCRIPT B', async ({ gamePage }) => {
    await gamePage.selectPlayer2('SCRIPT B');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify button is active
    const scriptButton = gamePage.page.locator(gamePage.selectors.player2Button('SCRIPT B'));
    await expect(scriptButton).toHaveClass(/bg-blue-600/);
    
    // Verify script editor button appears
    await expect(gamePage.page.locator(gamePage.selectors.scriptEditorButton)).toBeVisible();
  });

  test('should show AUTO badge for non-human players', async ({ gamePage }) => {
    // Select AI for Player 1
    await gamePage.selectPlayer1('AI');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify AUTO badge appears for Player 1
    const player1Section = gamePage.page.locator('h2:has-text("Player 1 (Left)")').locator('..');
    const autoBadge = player1Section.locator('span:has-text("AUTO")');
    await expect(autoBadge).toBeVisible();
    
    // Player 2 always has AUTO badge
    const player2Section = gamePage.page.locator('h2:has-text("Player 2 (Right)")').locator('..');
    const player2AutoBadge = player2Section.locator('span:has-text("AUTO")');
    await expect(player2AutoBadge).toBeVisible();
  });

  test('should not show AUTO badge for HUMAN player', async ({ gamePage }) => {
    await gamePage.selectPlayer1('HUMAN');
    await waitForGameStateUpdate(gamePage.page);
    
    // Verify AUTO badge does not appear for Player 1
    const player1Section = gamePage.page.locator('h2:has-text("Player 1 (Left)")').locator('..');
    const autoBadge = player1Section.locator('span:has-text("AUTO")');
    await expect(autoBadge).not.toBeVisible();
  });
});

