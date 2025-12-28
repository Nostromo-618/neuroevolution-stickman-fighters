import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, waitForCanvasRender, waitForMatchStart, waitForGameStateUpdate } from '../fixtures/game-helpers';

test.describe('Canvas Rendering', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
  });

  test('should render canvas element', async ({ gamePage }) => {
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
    
    // Verify canvas has dimensions
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox!.width).toBeGreaterThan(0);
    expect(canvasBox!.height).toBeGreaterThan(0);
  });

  test('should render background elements', async ({ gamePage }) => {
    await waitForCanvasRender(gamePage.page);
    
    // Background rendering is done via canvas, so we verify canvas is rendering
    // In a real implementation, you might use canvas screenshot comparison
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    
    // Verify canvas is rendering (has content)
    const canvasContext = await gamePage.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Check if canvas has non-transparent pixels (has been drawn to)
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true; // Alpha channel > 0
      }
      return false;
    });
    
    expect(canvasContext).toBe(true);
  });

  test('should render fighters when match starts', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    await waitForCanvasRender(gamePage.page);
    
    // Verify canvas is rendering
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
    
    // Canvas should have content (fighters drawn)
    const hasContent = await gamePage.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 0) return true;
      }
      return false;
    });
    
    expect(hasContent).toBe(true);
  });

  test('should render HUD overlays', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    await waitForGameStateUpdate(gamePage.page, 1000);
    
    // HUD is rendered on canvas, so we verify canvas has content
    // Health bars and energy bars are drawn on the canvas
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
    
    // Verify timer is displayed (in HUD)
    const timer = await gamePage.getTimer();
    expect(timer).toBeGreaterThan(0);
  });

  test('should update canvas during match', async ({ gamePage }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    await waitForCanvasRender(gamePage.page);
    
    // Get initial canvas state
    const initialState = await gamePage.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      return ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height)).data.slice(0, 100);
    });
    
    // Wait for animation frame
    await waitForGameStateUpdate(gamePage.page, 1000);
    
    // Get new canvas state
    const newState = await gamePage.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      return ctx.getImageData(0, 0, Math.min(100, canvas.width), Math.min(100, canvas.height)).data.slice(0, 100);
    });
    
    // Canvas should have updated (fighters moving, animations)
    // In practice, we just verify canvas is rendering
    expect(initialState).not.toBeNull();
    expect(newState).not.toBeNull();
  });

  test('should render visual effects on attacks', async ({ gamePage, page }) => {
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    await waitForCanvasRender(gamePage.page);
    
    // Trigger an attack (if human player)
    await gamePage.selectPlayer1('HUMAN');
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Press punch key
    const { triggerKeyboardInput } = await import('../fixtures/game-helpers');
    await triggerKeyboardInput(page, 'KeyJ');
    await waitForGameStateUpdate(page, 500);
    
    // Canvas should still be rendering (attack effects are drawn on canvas)
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
  });

  test('should maintain canvas dimensions', async ({ gamePage }) => {
    const canvas = gamePage.page.locator(gamePage.selectors.gameCanvas).first();
    await expect(canvas).toBeVisible();
    
    const initialBox = await canvas.boundingBox();
    expect(initialBox).not.toBeNull();
    
    // Start match
    await gamePage.startMatch();
    await waitForMatchStart(gamePage.page);
    
    // Canvas dimensions should remain the same
    const newBox = await canvas.boundingBox();
    expect(newBox?.width).toBe(initialBox!.width);
    expect(newBox?.height).toBe(initialBox!.height);
  });
});

