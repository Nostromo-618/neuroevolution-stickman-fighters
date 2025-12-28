/**
 * =============================================================================
 * CANVAS RENDERING UTILITIES - Background & Environment
 * =============================================================================
 * 
 * Utility functions for rendering the game background, sky, and environment.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../services/GameEngine';

/**
 * Renders the background (sky gradient, stars, skyline, ground).
 * 
 * @param ctx - Canvas 2D rendering context
 * @param frameCount - Current frame number for animation
 */
export function renderBackground(ctx: CanvasRenderingContext2D, frameCount: number): void {
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

