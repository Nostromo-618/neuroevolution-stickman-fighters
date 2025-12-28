/**
 * =============================================================================
 * GAME CANVAS - Visual Rendering Component
 * =============================================================================
 * 
 * This component renders the game arena and fighters using HTML5 Canvas 2D.
 * It's a React component that re-renders every frame to show smooth animations.
 * 
 * RENDERING OVERVIEW
 * ------------------
 * The canvas is drawn in layers (back to front):
 * 1. Background gradient (sky)
 * 2. Moon with glow effect
 * 3. Distant forest silhouettes
 * 4. Close tree silhouettes
 * 5. Ground
 * 6. Fighter 1 (stickman)
 * 7. Fighter 2 (stickman)
 * 8. Attack visual effects
 * 
 * STICKMAN ANIMATION SYSTEM
 * -------------------------
 * Each fighter is rendered as a skeleton-based stickman:
 * - Head (circle with headband)
 * - Torso (line)
 * - Arms (2 segments each: shoulder→elbow→hand)
 * - Legs (2 segments each: hip→knee→foot)
 * 
 * Poses are defined by joint offsets relative to body anchor points.
 * Different FighterAction states trigger different poses:
 * - IDLE: Breathing animation, guard stance
 * - MOVE: Run cycle with arm/leg swing
 * - PUNCH: Arm extended forward
 * - KICK: Leg extended high
 * - BLOCK: Arms raised in guard
 * - JUMP: Legs tucked
 * - CROUCH: Lowered stance
 * 
 * =============================================================================
 */

import React, { useRef, useEffect } from 'react';
import { Fighter, CANVAS_WIDTH, CANVAS_HEIGHT } from '../services/GameEngine';
import { FighterAction } from '../types';
import { renderBackground } from '../utils/canvasRendering';
import { renderStickman } from '../utils/stickmanRenderer';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface GameCanvasProps {
  player1: Fighter;  // Reference to fighter 1 object
  player2: Fighter;  // Reference to fighter 2 object
  isTraining?: boolean;  // Whether this is a training match
  roundNumber?: number;  // Current round number for side swapping visualization
}

// =============================================================================
// GAME CANVAS COMPONENT
// =============================================================================

/**
 * GameCanvas - Renders the game arena and fighters
 * 
 * This component uses a canvas element and draws directly using the 2D context.
 * It re-renders every time the parent component updates (every frame).
 * 
 * Note: This uses useEffect for rendering, which runs after each render.
 * The actual animation loop is in App.tsx; this component just visualizes state.
 */
const GameCanvas: React.FC<GameCanvasProps> = ({ player1, player2, isTraining = false, roundNumber = 0 }) => {
  /** Reference to the canvas DOM element */
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** Frame counter for cycling animations (breathing, running) */
  const frameRef = useRef(0);

  // ==========================================================================
  // RENDER EFFECT
  // ==========================================================================

  /**
   * Main render function - runs every time the component updates
   * 
   * Canvas rendering is imperative (not declarative like React DOM).
   * We get the 2D context and draw everything manually each frame.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameRef.current++;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    renderBackground(ctx, frameRef.current);

    const swapSides = isTraining && roundNumber % 2 === 1;

    if (swapSides) {
      renderStickman(ctx, player2, frameRef.current);
      renderStickman(ctx, player1, frameRef.current);
    } else {
      renderStickman(ctx, player1, frameRef.current);
      renderStickman(ctx, player2, frameRef.current);
    }

    // =====================================================================
    // FOREGROUND UI
    // =====================================================================

    // (HUD is handled by React overlay in App.tsx to preventing double-drawing)

    // Hit effects
    if ((player1.state === FighterAction.PUNCH || player1.state === FighterAction.KICK) && player1.hitbox) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      const h = player1.hitbox;
      ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    if ((player2.state === FighterAction.PUNCH || player2.state === FighterAction.KICK) && player2.hitbox) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      const h = player2.hitbox;
      ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 15, 0, Math.PI * 2);
      ctx.fill();
    }

  }); // Effect runs every time props change

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="rounded-lg shadow-2xl border-2 border-slate-600 w-full max-w-4xl bg-black"
    />
  );
};

export default GameCanvas;