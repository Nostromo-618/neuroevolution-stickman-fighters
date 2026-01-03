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
 * Renders the day mode background (bright outdoor arena).
 */
function renderDayBackground(ctx: CanvasRenderingContext2D, frameCount: number): void {
  // --- SKY GRADIENT (bright blue to lighter blue) ---
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#38bdf8'); // sky-400
  gradient.addColorStop(0.5, '#7dd3fc'); // sky-300
  gradient.addColorStop(1, '#e0f2fe'); // sky-100
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // --- CLOUDS ---
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (let i = 0; i < 8; i++) {
    const baseX = ((i * 120) + frameCount * 0.1) % (CANVAS_WIDTH + 100) - 50;
    const baseY = 30 + (i % 3) * 40 + Math.sin(i * 2.5) * 20;
    const scale = 0.6 + (i % 3) * 0.3;

    // Draw cloud puffs
    ctx.beginPath();
    ctx.arc(baseX, baseY, 20 * scale, 0, Math.PI * 2);
    ctx.arc(baseX + 25 * scale, baseY - 5, 25 * scale, 0, Math.PI * 2);
    ctx.arc(baseX + 50 * scale, baseY, 20 * scale, 0, Math.PI * 2);
    ctx.arc(baseX + 35 * scale, baseY + 10, 15 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- DISTANT MOUNTAIN RANGE (behind forest) ---
  // Back mountains - bluish gray for atmospheric perspective
  ctx.fillStyle = '#64748b'; // slate-500
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT - 35);
  for (let i = 0; i <= CANVAS_WIDTH; i += 40) {
    const peakHeight = 180 + Math.sin(i * 0.015) * 60 + Math.cos(i * 0.008) * 40;
    ctx.lineTo(i, CANVAS_HEIGHT - 35 - peakHeight);
  }
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 35);
  ctx.closePath();
  ctx.fill();

  // Front mountains - slightly darker
  ctx.fillStyle = '#475569'; // slate-600
  ctx.beginPath();
  ctx.moveTo(0, CANVAS_HEIGHT - 35);
  for (let i = 0; i <= CANVAS_WIDTH; i += 30) {
    const peakHeight = 140 + Math.cos(i * 0.02 + 1) * 50 + Math.sin(i * 0.01) * 30;
    ctx.lineTo(i, CANVAS_HEIGHT - 35 - peakHeight);
  }
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 35);
  ctx.closePath();
  ctx.fill();

  // --- DENSE PINE FOREST (behind buildings for contrast) ---
  // Back layer - darker trees
  ctx.fillStyle = '#166534'; // green-800
  for (let i = 0; i < CANVAS_WIDTH; i += 25) {
    const treeHeight = 100 + Math.sin(i * 0.08) * 30 + (i % 40);
    const treeWidth = 20 + (i % 10);
    const baseY = CANVAS_HEIGHT - 35;

    // Pine tree triangle shape
    ctx.beginPath();
    ctx.moveTo(i + treeWidth / 2, baseY - treeHeight);
    ctx.lineTo(i + treeWidth + 8, baseY);
    ctx.lineTo(i - 8, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // Front layer - slightly lighter trees for depth
  ctx.fillStyle = '#15803d'; // green-700
  for (let i = 12; i < CANVAS_WIDTH; i += 30) {
    const treeHeight = 80 + Math.cos(i * 0.06) * 25 + (i % 35);
    const treeWidth = 18 + (i % 8);
    const baseY = CANVAS_HEIGHT - 35;

    ctx.beginPath();
    ctx.moveTo(i + treeWidth / 2, baseY - treeHeight);
    ctx.lineTo(i + treeWidth + 6, baseY);
    ctx.lineTo(i - 6, baseY);
    ctx.closePath();
    ctx.fill();
  }

  // --- CITY SKYLINE (Background - light colors) ---
  ctx.fillStyle = '#cbd5e1'; // slate-300
  for (let i = 0; i < CANVAS_WIDTH; i += 60) {
    const h = 80 + Math.sin(i * 0.02) * 40 + (i % 100);
    ctx.fillRect(i, CANVAS_HEIGHT - 100 - h, 40, h + 100);

    // Windows (bright/reflective)
    ctx.fillStyle = '#f1f5f9'; // slate-100
    if (i % 3 === 0) {
      for (let w = 0; w < h; w += 20) {
        if ((i + w) % 5 !== 0) ctx.fillRect(i + 10, CANVAS_HEIGHT - 100 - h + w + 10, 5, 8);
      }
    }
    ctx.fillStyle = '#cbd5e1';
  }

  // --- CITY SKYLINE (Foreground - darker for contrast) ---
  ctx.fillStyle = '#64748b'; // slate-500 (darker)
  for (let i = 30; i < CANVAS_WIDTH; i += 80) {
    const h = 40 + Math.cos(i * 0.03) * 30 + (i % 70);
    ctx.fillRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);

    ctx.strokeStyle = '#475569'; // slate-600
    ctx.lineWidth = 1;
    ctx.strokeRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);
  }

  // --- GROUND (grass/green field) ---
  const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 35, 0, CANVAS_HEIGHT);
  groundGradient.addColorStop(0, '#22c55e'); // green-500
  groundGradient.addColorStop(1, '#16a34a'); // green-600
  ctx.fillStyle = groundGradient;
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);

  // Grass lines (subtle texture)
  ctx.strokeStyle = '#15803d'; // green-700
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < CANVAS_WIDTH; i += 8) {
    const grassHeight = 3 + Math.sin(i * 0.5 + frameCount * 0.05) * 2;
    ctx.moveTo(i, CANVAS_HEIGHT - 35);
    ctx.lineTo(i + 2, CANVAS_HEIGHT - 35 - grassHeight);
  }
  ctx.stroke();

  // Top edge highlight
  ctx.fillStyle = '#4ade80'; // green-400
  ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 2);

  // Field lines (sports arena feel)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 35);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);
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

