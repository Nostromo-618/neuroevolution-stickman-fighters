import { test as base, Page } from '@playwright/test';

/**
 * Page Object Model fixtures for NeuroEvolution Stickman Fighters
 * 
 * Provides reusable selectors and helper methods for common page interactions.
 */
export class GamePage {
  constructor(public page: Page) {}

  // Selectors
  selectors = {
    // Header
    header: 'h1:has-text("NeuroEvolution: Stickman Fighters")',
    modeText: 'p.text-slate-400',
    
    // Match Configuration
    trainingToggle: 'button[title*="Switch"]',
    modeLabel: 'span:has-text("TRAINING"), span:has-text("SINGLE MATCH")',
    player1Selector: 'h2:has-text("Player 1 (Left)")',
    player2Selector: 'h2:has-text("Player 2 (Right)")',
    player1Button: (type: string) => `button:has-text("${type}")`,
    player2Button: (type: string) => `button:has-text("${type}")`,
    scriptEditorButton: 'button:has-text("Open Script Editor")',
    
    // Match Controls
    startButton: 'button:has-text("START")',
    pauseButton: 'button:has-text("PAUSE")',
    resetButton: 'button:has-text("RESET")',
    
    // Dashboard
    trainingParamsButton: 'button:has-text("Training Parameters")',
    simulationSpeedSlider: 'input[type="range"]',
    mutationRateSlider: 'input[type="range"]',
    backgroundTrainingToggle: 'button[aria-label*="Background Training"], button:has-text("Background Training")',
    exportButton: 'button:has-text("EXPORT")',
    importButton: 'button:has-text("IMPORT")',
    
    // Game Canvas (first canvas is the game canvas)
    canvas: 'canvas.rounded-lg',
    gameCanvas: 'canvas.rounded-lg.shadow-2xl',
    
    // HUD
    timer: 'text=/\\d+/',
    player1Health: '[class*="YOU"]',
    player2Health: '[class*="AI"]',
    
    // Touch Controls (mobile)
    touchControls: '[class*="TouchControls"]',
    touchLeft: 'button[aria-label*="left"], button:has-text("←")',
    touchRight: 'button[aria-label*="right"], button:has-text("→")',
    touchPunch: 'button[aria-label*="punch"], button:has-text("PUNCH")',
    touchKick: 'button[aria-label*="kick"], button:has-text("KICK")',
    touchBlock: 'button[aria-label*="block"], button:has-text("BLOCK")',
    touchJump: 'button[aria-label*="jump"], button:has-text("JUMP")',
    
    // Neural Network Visualizer
    neuralNetworkVisualizer: '[class*="NeuralNetworkVisualizer"]',
    
    // Toast notifications
    toast: '[class*="Toast"]',
  };

  /**
   * Navigate to the game page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad() {
    await this.page.waitForSelector(this.selectors.header);
    await this.page.waitForSelector(this.selectors.canvas);
  }

  /**
   * Get current game mode
   */
  async getGameMode(): Promise<'TRAINING' | 'ARCADE'> {
    const modeText = await this.page.textContent(this.selectors.modeText);
    return modeText?.includes('Evolution') ? 'TRAINING' : 'ARCADE';
  }

  /**
   * Toggle between TRAINING and ARCADE mode
   */
  async toggleGameMode() {
    await this.page.click(this.selectors.trainingToggle);
    await this.page.waitForTimeout(500); // Wait for state update
  }

  /**
   * Select player type
   */
  async selectPlayer1(type: 'HUMAN' | 'AI' | 'SCRIPT A' | 'SCRIPT B') {
    const buttonText = type === 'SCRIPT A' ? 'SCRIPT A' : type === 'SCRIPT B' ? 'SCRIPT B' : type;
    // Find button within Player 1 section to avoid ambiguity
    const player1Section = this.page.locator('h2:has-text("Player 1 (Left)")').locator('..');
    const button = player1Section.locator(`button:has-text("${buttonText}")`).first();
    await button.click();
    await this.page.waitForTimeout(200); // Wait for state update
  }

  async selectPlayer2(type: 'AI' | 'SCRIPT A' | 'SCRIPT B') {
    const buttonText = type === 'SCRIPT A' ? 'SCRIPT A' : type === 'SCRIPT B' ? 'SCRIPT B' : type;
    // Find button within Player 2 section to avoid ambiguity
    const player2Section = this.page.locator('h2:has-text("Player 2 (Right)")').locator('..');
    const button = player2Section.locator(`button:has-text("${buttonText}")`).first();
    await button.click();
    await this.page.waitForTimeout(200); // Wait for state update
  }

  /**
   * Start a match
   */
  async startMatch() {
    await this.page.click(this.selectors.startButton);
    await this.page.waitForTimeout(1000); // Wait for match initialization
  }

  /**
   * Pause a match
   */
  async pauseMatch() {
    await this.page.click(this.selectors.pauseButton);
  }

  /**
   * Reset a match
   */
  async resetMatch() {
    await this.page.click(this.selectors.resetButton);
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if match is active
   */
  async isMatchActive(): Promise<boolean> {
    const pauseButton = await this.page.locator(this.selectors.pauseButton).isVisible().catch(() => false);
    return pauseButton;
  }

  /**
   * Get timer value
   */
  async getTimer(): Promise<number> {
    const timerText = await this.page.locator(this.selectors.timer).first().textContent();
    const match = timerText?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
}

type GamePageFixture = {
  gamePage: GamePage;
};

export const test = base.extend<GamePageFixture>({
  gamePage: async ({ page }, use) => {
    const gamePage = new GamePage(page);
    await use(gamePage);
  },
});

export { expect } from '@playwright/test';

