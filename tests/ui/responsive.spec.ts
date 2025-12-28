import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, isTouchControlsVisible, isNeuralNetworkVisible } from '../fixtures/game-helpers';

test.describe('Responsive Layout - Mobile', () => {
  test.beforeEach(async ({ gamePage, page }) => {
    // Only run on mobile viewports
    test.skip(page.viewportSize()!.width >= 768, 'Mobile only test');
    
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
  });

  test('should adapt layout to mobile viewport', async ({ gamePage, page }) => {
    const viewport = page.viewportSize()!;
    expect(viewport.width).toBeLessThan(768);
    
    // Verify main container exists
    const mainContainer = gamePage.page.locator('div.min-h-screen');
    await expect(mainContainer).toBeVisible();
    
    // On mobile, layout should stack vertically
    // Main container grid has class "grid grid-cols-1 lg:grid-cols-3"
    const grid = gamePage.page.locator('div.max-w-6xl.grid').first();
    const gridClass = await grid.getAttribute('class');
    expect(gridClass).toContain('grid-cols-1'); // Single column on mobile
  });

  test('should show touch controls in ARCADE mode', async ({ gamePage, page }) => {
    // Set to ARCADE mode
    const currentMode = await gamePage.getGameMode();
    if (currentMode !== 'ARCADE') {
      await gamePage.toggleGameMode();
    }
    
    // Start match to activate touch controls
    await gamePage.startMatch();
    
    // Touch controls should be visible
    const touchVisible = await isTouchControlsVisible(page);
    expect(touchVisible).toBe(true);
  });

  test('should hide neural network visualizer on mobile', async ({ gamePage, page }) => {
    await gamePage.startMatch();
    
    // Neural network visualizer should be hidden on mobile
    const nnVisible = await isNeuralNetworkVisible(page);
    expect(nnVisible).toBe(false);
  });

  test('should stack dashboard vertically on mobile', async ({ gamePage }) => {
    // Dashboard sections should stack
    // Main dashboard container has class "bg-slate-800 p-6 rounded-xl"
    const dashboard = gamePage.page.locator('div.bg-slate-800.p-6.rounded-xl').first();
    await expect(dashboard).toBeVisible();
    
    // Verify sections are in a vertical layout
    const sections = dashboard.locator('div.space-y-6 > *');
    const count = await sections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should scale canvas appropriately on mobile', async ({ gamePage, page }) => {
    const canvas = gamePage.page.locator(gamePage.selectors.canvas);
    await expect(canvas).toBeVisible();
    
    const canvasBox = await canvas.boundingBox();
    const viewport = page.viewportSize()!;
    
    // Canvas should fit within viewport
    expect(canvasBox!.width).toBeLessThanOrEqual(viewport.width);
    expect(canvasBox!.height).toBeLessThanOrEqual(viewport.height * 0.8); // Allow for header/controls
  });

  test('should keep text readable on mobile', async ({ gamePage }) => {
    // Verify header text is readable
    const header = gamePage.page.locator(gamePage.selectors.header);
    await expect(header).toBeVisible();
    
    const headerBox = await header.boundingBox();
    expect(headerBox!.height).toBeGreaterThan(20); // Text should have reasonable size
    
    // Verify button text is readable
    const startButton = gamePage.page.locator(gamePage.selectors.startButton);
    await expect(startButton).toBeVisible();
    const buttonBox = await startButton.boundingBox();
    expect(buttonBox!.height).toBeGreaterThan(30); // Buttons should be tappable
  });
});

test.describe('Responsive Layout - Desktop', () => {
  test.beforeEach(async ({ gamePage, page }) => {
    // Only run on desktop viewports
    test.skip(page.viewportSize()!.width < 768, 'Desktop only test');
    
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
  });

  test('should use three-column layout on desktop', async ({ gamePage, page }) => {
    const viewport = page.viewportSize()!;
    expect(viewport.width).toBeGreaterThanOrEqual(768);
    
    // Verify grid layout
    // Main container grid has class "grid grid-cols-1 lg:grid-cols-3"
    const grid = gamePage.page.locator('div.max-w-6xl.grid').first();
    const gridClass = await grid.getAttribute('class');
    expect(gridClass).toContain('lg:grid-cols-3'); // Three columns on large screens
  });

  test('should show neural network visualizer on desktop', async ({ gamePage, page }) => {
    await gamePage.startMatch();
    
    // Neural network visualizer should be visible on desktop
    const nnVisible = await isNeuralNetworkVisible(page);
    expect(nnVisible).toBe(true);
  });

  test('should hide touch controls on desktop', async ({ gamePage, page }) => {
    // Touch controls should not be visible on desktop
    const touchVisible = await isTouchControlsVisible(page);
    expect(touchVisible).toBe(false);
  });

  test('should have all controls accessible on desktop', async ({ gamePage }) => {
    // Verify all main controls are visible
    await expect(gamePage.page.locator(gamePage.selectors.startButton)).toBeVisible();
    await expect(gamePage.page.locator(gamePage.selectors.resetButton)).toBeVisible();
    await expect(gamePage.page.locator('h2:has-text("Match Setup")')).toBeVisible();
    await expect(gamePage.page.locator(gamePage.selectors.trainingParamsButton)).toBeVisible();
  });

  test('should not have horizontal scrolling on desktop', async ({ gamePage, page }) => {
    // Check page width vs viewport width
    const bodyWidth = await gamePage.page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()!.width;
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
  });

  test('should maintain proper spacing on desktop', async ({ gamePage }) => {
    // Verify dashboard has proper spacing
    // Main dashboard container has class "bg-slate-800 p-6 rounded-xl"
    const dashboard = gamePage.page.locator('div.bg-slate-800.p-6.rounded-xl').first();
    const dashboardBox = await dashboard.boundingBox();
    
    expect(dashboardBox).not.toBeNull();
    expect(dashboardBox!.width).toBeGreaterThan(300); // Dashboard should have reasonable width
  });
});

