/**
 * =============================================================================
 * CANVAS RENDERING UTILITIES - Background & Environment
 * =============================================================================
 * 
 * Utility functions for rendering the game background, sky, and environment.
 * Supports both dark mode (night/cyberpunk) and light mode (day/outdoor).
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../services/GameEngine';

/**
 * Renders the night mode background (cyberpunk city).
 */
function renderNightBackground(ctx: CanvasRenderingContext2D, frameCount: number): void {
  // --- SKY GRADIENT ---
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#020617');
  gradient.addColorStop(1, '#1e1b4b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // --- STAR FIELD ---
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 50; i++) {
    const x = (i * 137.5) % CANVAS_WIDTH;
    const y = (i * 293.3) % (CANVAS_HEIGHT * 0.6);
    const size = (i % 3 === 0) ? 1.5 : 0.8;
    const opacity = 0.3 + (Math.sin(i + frameCount * 0.02) * 0.2);

    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // --- DIGITAL SKYLINE (Background) ---
  ctx.fillStyle = '#111827';
  for (let i = 0; i < CANVAS_WIDTH; i += 60) {
    const h = 80 + Math.sin(i * 0.02) * 40 + (i % 100);
    ctx.fillRect(i, CANVAS_HEIGHT - 100 - h, 40, h + 100);

    // Windows
    ctx.fillStyle = '#374151';
    if (i % 3 === 0) {
      for (let w = 0; w < h; w += 20) {
        if ((i + w) % 5 !== 0) ctx.fillRect(i + 10, CANVAS_HEIGHT - 100 - h + w + 10, 5, 8);
      }
    }
    ctx.fillStyle = '#111827';
  }

  // --- DIGITAL SKYLINE (Foreground) ---
  ctx.fillStyle = '#1f2937';
  for (let i = 30; i < CANVAS_WIDTH; i += 80) {
    const h = 40 + Math.cos(i * 0.03) * 30 + (i % 70);
    ctx.fillRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);

    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1;
    ctx.strokeRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);
  }

  // --- GROUND ---
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);

  // Grid lines
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = -CANVAS_WIDTH; i < CANVAS_WIDTH * 2; i += 60) {
    ctx.moveTo(i, CANVAS_HEIGHT - 35);
    ctx.lineTo((i - CANVAS_WIDTH / 2) * 4 + CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  }
  for (let y = CANVAS_HEIGHT - 35; y < CANVAS_HEIGHT; y += 15) {
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
  }
  ctx.stroke();

  // Top border of ground
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 3);
}

/**
 * Renders the day mode background with atmospheric perspective.
 * 
 * Design Principles Applied:
 * 1. Atmospheric Perspective - distant objects are lighter/hazier
 * 2. Reduced Visual Frequency - soft curves instead of sharp angles
 * 3. Desaturated Palette - neutral grays so vibrant fighters pop
 * 4. Figure-Ground Separation - low-contrast background, high-contrast fighters
 */
function renderDayBackground(ctx: CanvasRenderingContext2D, frameCount: number): void {
  // --- SKY GRADIENT (Soft/Atmospheric) ---
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#f1f5f9'); // slate-100 (near white/hazy)
  gradient.addColorStop(0.6, '#e2e8f0'); // slate-200
  gradient.addColorStop(1, '#cbd5e1'); // slate-300 (blends into mountains)
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // --- SOFT SUN GLOW (no harsh edges) ---
  const sunGradient = ctx.createRadialGradient(
    CANVAS_WIDTH * 0.75, 60, 0,
    CANVAS_WIDTH * 0.75, 60, 100
  );
  sunGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  sunGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
  sunGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sunGradient;
  ctx.fillRect(CANVAS_WIDTH * 0.5, 0, CANVAS_WIDTH * 0.5, 200);

  // --- DISTANT HILLS (Rolling curves - Layer 1, lightest) ---
  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT - 200);
  // Bezier curves for smooth rolling hills
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.15, CANVAS_HEIGHT - 250,
    CANVAS_WIDTH * 0.25, CANVAS_HEIGHT - 180,
    CANVAS_WIDTH * 0.4, CANVAS_HEIGHT - 220
  );
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.55, CANVAS_HEIGHT - 260,
    CANVAS_WIDTH * 0.7, CANVAS_HEIGHT - 190,
    CANVAS_WIDTH * 0.85, CANVAS_HEIGHT - 230
  );
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.95, CANVAS_HEIGHT - 250,
    CANVAS_WIDTH, CANVAS_HEIGHT - 200,
    CANVAS_WIDTH, CANVAS_HEIGHT - 180
  );
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // --- MID-GROUND HILLS (Layer 2, slightly darker) ---
  ctx.fillStyle = '#64748b'; // slate-500
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT - 140);
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.1, CANVAS_HEIGHT - 180,
    CANVAS_WIDTH * 0.2, CANVAS_HEIGHT - 120,
    CANVAS_WIDTH * 0.35, CANVAS_HEIGHT - 160
  );
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.5, CANVAS_HEIGHT - 200,
    CANVAS_WIDTH * 0.65, CANVAS_HEIGHT - 130,
    CANVAS_WIDTH * 0.8, CANVAS_HEIGHT - 170
  );
  ctx.bezierCurveTo(
    CANVAS_WIDTH * 0.9, CANVAS_HEIGHT - 190,
    CANVAS_WIDTH * 0.95, CANVAS_HEIGHT - 150,
    CANVAS_WIDTH, CANVAS_HEIGHT - 120
  );
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.fill();

  // --- TREELINE SILHOUETTE (Soft canopy - rounded blobs) ---
  ctx.fillStyle = '#475569'; // slate-600
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT);
  // Draw overlapping semicircles for soft tree canopy
  for (let i = -30; i < CANVAS_WIDTH + 60; i += 50) {
    const treeHeight = 70 + Math.sin(i * 0.05) * 20;
    const treeWidth = 40 + (i % 20);
    ctx.moveTo(i, CANVAS_HEIGHT - 35);
    ctx.arc(i, CANVAS_HEIGHT - 35, treeWidth, Math.PI, 0, false);
  }
  ctx.fill();

  // --- FOREGROUND VEGETATION (Soft bushes/hedge - closest layer) ---
  ctx.fillStyle = '#334155'; // slate-700
  ctx.beginPath();
  for (let i = -20; i < CANVAS_WIDTH + 40; i += 35) {
    const bushSize = 25 + Math.sin(i * 0.08) * 10;
    ctx.moveTo(i + bushSize, CANVAS_HEIGHT - 35);
    ctx.arc(i, CANVAS_HEIGHT - 35, bushSize, 0, Math.PI, true);
  }
  ctx.fill();

  // --- GROUND (Neutral flat surface) ---
  const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 35, 0, CANVAS_HEIGHT);
  groundGradient.addColorStop(0, '#cbd5e1'); // slate-300
  groundGradient.addColorStop(1, '#94a3b8'); // slate-400
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);

  // Subtle top border
  ctx.fillStyle = '#64748b'; // slate-500
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 2);

  // Very subtle perspective lines (low opacity)
  ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)'; // slate-500 with low opacity
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < CANVAS_WIDTH; i += 120) {
    ctx.moveTo(i, CANVAS_HEIGHT - 35);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT + 50);
  }
  ctx.stroke();
}

/**
 * Renders the background (sky gradient, stars/clouds, skyline, ground).
 * 
 * @param ctx - Canvas 2D rendering context
 * @param frameCount - Current frame number for animation
 * @param isDarkMode - Whether to render night (true) or day (false) mode
 */
export function renderBackground(ctx: CanvasRenderingContext2D, frameCount: number, isDarkMode: boolean = true): void {
  if (isDarkMode) {
    renderNightBackground(ctx, frameCount);
  } else {
    renderDayBackground(ctx, frameCount);
  }
}
