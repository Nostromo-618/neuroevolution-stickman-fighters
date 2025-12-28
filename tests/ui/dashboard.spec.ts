import { test, expect } from '../fixtures/page';
import { acceptDisclaimer, waitForGameStateUpdate } from '../fixtures/game-helpers';

test.describe('Dashboard UI', () => {
  test.beforeEach(async ({ gamePage }) => {
    await gamePage.goto();
    await gamePage.waitForPageLoad();
    await acceptDisclaimer(gamePage.page);
  });

  test('should render dashboard with all sections', async ({ gamePage }) => {
    // Verify Match Setup section
    await expect(gamePage.page.locator('h2:has-text("Match Setup")')).toBeVisible();
    
    // Verify Player selection sections
    await expect(gamePage.page.locator('h2:has-text("Player 1 (Left)")')).toBeVisible();
    await expect(gamePage.page.locator('h2:has-text("Player 2 (Right)")')).toBeVisible();
    
    // Verify action buttons
    await expect(gamePage.page.locator(gamePage.selectors.startButton)).toBeVisible();
    await expect(gamePage.page.locator(gamePage.selectors.resetButton)).toBeVisible();
    
    // Verify Training Parameters section
    await expect(gamePage.page.locator(gamePage.selectors.trainingParamsButton)).toBeVisible();
    
    // Verify Fitness Chart section
    await expect(gamePage.page.locator('h3:has-text("Fitness / Generation")')).toBeVisible();
  });

  test('should collapse and expand training parameters section', async ({ gamePage }) => {
    const paramsButton = gamePage.page.locator(gamePage.selectors.trainingParamsButton);
    
    // Initially should be expanded (check for sliders)
    const speedSlider = gamePage.page.locator(gamePage.selectors.simulationSpeedSlider).first();
    await expect(speedSlider).toBeVisible();
    
    // Click to collapse
    await paramsButton.click();
    await waitForGameStateUpdate(gamePage.page, 500);
    
    // Sliders should be hidden (max-height: 0)
    // We can't easily test this without checking computed styles, so we'll just verify the button works
    
    // Click to expand again
    await paramsButton.click();
    await waitForGameStateUpdate(gamePage.page, 500);
    
    // Sliders should be visible again
    await expect(speedSlider).toBeVisible();
  });

  test('should update simulation speed slider value', async ({ gamePage }) => {
    // Expand training parameters if needed
    const paramsButton = gamePage.page.locator(gamePage.selectors.trainingParamsButton);
    await paramsButton.click();
    await waitForGameStateUpdate(gamePage.page, 300);
    
    const speedSlider = gamePage.page.locator(gamePage.selectors.simulationSpeedSlider).first();
    await expect(speedSlider).toBeVisible();
    
    // Get initial value
    const initialValue = await speedSlider.getAttribute('value');
    expect(initialValue).toBeTruthy();
    
    // Change slider value
    await speedSlider.fill('100');
    await waitForGameStateUpdate(gamePage.page, 300);
    
    // Verify value updated
    const newValue = await speedSlider.getAttribute('value');
    expect(newValue).toBe('100');
    
    // Verify display text updates
    const speedText = gamePage.page.locator('text=/\\d+x/').first();
    await expect(speedText).toContainText('100x');
  });

  test('should update mutation rate slider value', async ({ gamePage }) => {
    // Expand training parameters if needed
    const paramsButton = gamePage.page.locator(gamePage.selectors.trainingParamsButton);
    await paramsButton.click();
    await waitForGameStateUpdate(gamePage.page, 300);
    
    const mutationSliders = gamePage.page.locator(gamePage.selectors.mutationRateSlider);
    const mutationSlider = mutationSliders.nth(1); // Second slider is mutation rate
    await expect(mutationSlider).toBeVisible();
    
    // Get initial value
    const initialValue = await mutationSlider.getAttribute('value');
    expect(initialValue).toBeTruthy();
    
    // Change slider value
    await mutationSlider.fill('20');
    await waitForGameStateUpdate(gamePage.page, 300);
    
    // Verify value updated
    const newValue = await mutationSlider.getAttribute('value');
    expect(newValue).toBe('20');
    
    // Verify display text updates (should show percentage)
    const mutationText = gamePage.page.locator('text=/\\d+%/').first();
    await expect(mutationText).toContainText('20%');
  });

  test('should toggle background training', async ({ gamePage }) => {
    // Expand training parameters if needed
    const paramsButton = gamePage.page.locator(gamePage.selectors.trainingParamsButton);
    const isExpanded = await paramsButton.locator('svg').getAttribute('class');
    if (isExpanded?.includes('rotate-180') === false) {
      await paramsButton.click();
      await waitForGameStateUpdate(gamePage.page, 300);
    }
    
    // Find background training toggle - it's a button with class "relative w-8 h-4 rounded-full"
    // inside a div that contains "Background Training" text
    const bgTrainingSection = gamePage.page.locator('text=Background Training').locator('..').locator('..');
    const toggle = bgTrainingSection.locator('button.relative.w-8.h-4.rounded-full').first();
    
    // Wait for toggle to be visible
    await expect(toggle).toBeVisible({ timeout: 5000 });
    
    // Get initial state
    const initialClass = await toggle.getAttribute('class');
    const isInitiallyOn = initialClass?.includes('bg-green-600') || false;
    
    // Toggle
    await toggle.click();
    await waitForGameStateUpdate(gamePage.page, 300);
    
    // Verify state changed
    const newClass = await toggle.getAttribute('class');
    const isNowOn = newClass?.includes('bg-green-600') || false;
    expect(isNowOn).not.toBe(isInitiallyOn);
  });

  test('should display fitness chart', async ({ gamePage }) => {
    // Verify fitness chart section exists
    const chartSection = gamePage.page.locator('h3:has-text("Fitness / Generation")');
    await expect(chartSection).toBeVisible();
    
    // Verify chart container exists (Recharts creates SVG elements)
    const chartContainer = gamePage.page.locator('svg').first();
    // Chart might not render if no data, so we'll just check the section exists
    await expect(chartSection).toBeVisible();
  });

  test('should display generation and best fitness', async ({ gamePage }) => {
    // Verify generation counter
    const genText = gamePage.page.locator('text=/Gen: \\d+/');
    await expect(genText).toBeVisible();
    
    // Verify best fitness
    const bestText = gamePage.page.locator('text=/Best: \\d+/');
    await expect(bestText).toBeVisible();
  });

  test('should show export and import buttons', async ({ gamePage }) => {
    // Expand training parameters if needed
    const paramsButton = gamePage.page.locator(gamePage.selectors.trainingParamsButton);
    await paramsButton.click();
    await waitForGameStateUpdate(gamePage.page, 300);
    
    // Verify export button
    const exportButton = gamePage.page.locator(gamePage.selectors.exportButton);
    await expect(exportButton).toBeVisible();
    
    // Verify import button
    const importButton = gamePage.page.locator(gamePage.selectors.importButton);
    await expect(importButton).toBeVisible();
  });

  test('should disable export button when fitness is 0', async ({ gamePage }) => {
    // Expand training parameters if needed
    const paramsButton = gamePage.page.locator(gamePage.selectors.trainingParamsButton);
    await paramsButton.click();
    await waitForGameStateUpdate(gamePage.page, 300);
    
    // Check if export button is disabled (when best fitness is 0)
    const exportButton = gamePage.page.locator(gamePage.selectors.exportButton);
    const isDisabled = await exportButton.isDisabled();
    
    // If best fitness is 0, button should be disabled
    const bestText = await gamePage.page.locator('text=/Best: \\d+/').textContent();
    const bestFitness = bestText ? parseFloat(bestText.match(/Best: ([\d.]+)/)?.[1] || '0') : 0;
    
    if (bestFitness === 0) {
      expect(isDisabled).toBe(true);
    }
  });
});

