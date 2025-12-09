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

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface GameCanvasProps {
  player1: Fighter;  // Reference to fighter 1 object
  player2: Fighter;  // Reference to fighter 2 object
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
const GameCanvas: React.FC<GameCanvasProps> = ({ player1, player2 }) => {
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

    frameRef.current++; // Increment for animation cycles

    // --- CLEAR CANVAS ---
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // =====================================================================
    // BACKGROUND RENDERING
    // =====================================================================

    // --- SKY GRADIENT ---
    // Creates a dark blue gradient from top to bottom
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0f172a');  // Dark top
    gradient.addColorStop(1, '#1e293b');  // Slightly lighter bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- MOON ---
    // Glowing moon in the upper right corner
    ctx.fillStyle = '#f8fafc';
    ctx.shadowBlur = 40;         // Glow effect radius
    ctx.shadowColor = '#e2e8f0'; // Glow color
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 100, 80, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;  // Reset shadow for other drawings

    // --- DISTANT FOREST (Background trees) ---
    // Creates a silhouette of distant trees with sine wave variation
    ctx.fillStyle = '#1e3a8a';  // Dark blue
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      const h = 50 + Math.sin(i * 0.05) * 20;  // Vary height with sine
      ctx.fillRect(i, CANVAS_HEIGHT - 120 - h, 20, h + 50);
    }

    // --- CLOSE TREES (Foreground) ---
    // Individual triangular trees with more detail
    ctx.fillStyle = '#064e3b';  // Dark green
    [50, 250, 450, 650].forEach(x => {
      ctx.beginPath();
      ctx.moveTo(x, CANVAS_HEIGHT - 80);       // Base left
      ctx.lineTo(x + 30, CANVAS_HEIGHT - 400); // Tip
      ctx.lineTo(x + 60, CANVAS_HEIGHT - 80);  // Base right
      ctx.fill();
    });

    // --- GROUND ---
    // Two layers: dark base and lighter grass top
    ctx.fillStyle = '#022c22';  // Dark ground
    ctx.fillRect(0, CANVAS_HEIGHT - 70, CANVAS_WIDTH, 70);
    ctx.fillStyle = '#14532d';  // Grass highlight
    ctx.fillRect(0, CANVAS_HEIGHT - 75, CANVAS_WIDTH, 10);

    // =====================================================================
    // STICKMAN RENDERING FUNCTION
    // =====================================================================

    /**
     * Draws a single stickman fighter
     * 
     * SKELETON STRUCTURE:
     * - Head at top center
     * - Shoulder point (torso top)
     * - Hip point (torso bottom)
     * - Each limb defined by joint positions
     * 
     * ANIMATION SYSTEM:
     * Each state defines offsets for joints relative to anchor points.
     * The offsets are multiplied by direction (-1 or 1) for mirroring.
     * 
     * @param f - The Fighter object to render
     */
    const drawStickman = (f: Fighter) => {
      const { x, y, width, height, color, direction, state, health } = f;
      const isDead = health <= 0;

      // Calculate anchor points
      const cx = x + width / 2;           // Center X
      const bottomY = y + height;         // Bottom of bounding box
      const topY = y;                     // Top of bounding box
      let shoulderY = topY + 25;          // Shoulder Y position
      const hipY = bottomY - 45;          // Hip Y position

      // Set drawing style
      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // --- POSE VARIABLES ---
      // These define joint positions relative to anchor points
      let headOffset = { x: 0, y: 0 };
      let torsoAngle = 0;

      // Arm joint positions (relative to shoulder)
      let lArm = { elbow: { x: -15, y: 15 }, hand: { x: -10, y: -10 } };
      let rArm = { elbow: { x: 15, y: 15 }, hand: { x: 25, y: 0 } };

      // Leg joint positions (relative to hip)
      let lLeg = { knee: { x: -5, y: 20 }, foot: { x: -10, y: 45 } };
      let rLeg = { knee: { x: 10, y: 20 }, foot: { x: 15, y: 45 } };

      // Direction multiplier for mirroring
      const dir = direction;

      // ===================================================================
      // DEATH POSE
      // ===================================================================

      if (isDead) {
        // Draw fighter lying flat on the ground
        ctx.beginPath();
        // Head (offset to side)
        ctx.arc(cx - 30 * dir, bottomY - 10, 10, 0, Math.PI * 2);
        // Body (horizontal)
        ctx.moveTo(cx - 20 * dir, bottomY - 5);
        ctx.lineTo(cx + 10 * dir, bottomY - 5);
        // Limbs spread
        ctx.moveTo(cx - 10 * dir, bottomY - 5);
        ctx.lineTo(cx - 10 * dir, bottomY - 25);
        ctx.moveTo(cx + 10 * dir, bottomY - 5);
        ctx.lineTo(cx + 30 * dir, bottomY - 5);
        ctx.stroke();
        return;
      }

      // ===================================================================
      // STATE-BASED POSES
      // ===================================================================

      switch (state) {
        case FighterAction.IDLE:
          // Subtle breathing animation using sine wave
          headOffset.y = Math.sin(frameRef.current * 0.1) * 2;
          // Fighting stance: guard up
          lArm = { elbow: { x: 10 * dir, y: 20 }, hand: { x: 20 * dir, y: -10 } };
          rArm = { elbow: { x: 15 * dir, y: 20 }, hand: { x: 25 * dir, y: -5 } };
          // Wide stance
          lLeg = { knee: { x: -5 * dir, y: 20 }, foot: { x: -15 * dir, y: 45 } };
          rLeg = { knee: { x: 10 * dir, y: 20 }, foot: { x: 20 * dir, y: 45 } };
          break;

        case FighterAction.MOVE_LEFT:
        case FighterAction.MOVE_RIGHT:
          // Run cycle animation
          const runTime = frameRef.current * 0.5;  // Animation speed
          const stride = 20;                        // Step distance

          // Legs alternate in sine wave pattern
          lLeg = {
            knee: { x: Math.sin(runTime) * stride * dir, y: 20 - Math.abs(Math.cos(runTime)) * 5 },
            foot: { x: Math.sin(runTime) * stride * 1.5 * dir, y: 45 }
          };
          rLeg = {
            knee: { x: Math.sin(runTime + Math.PI) * stride * dir, y: 20 - Math.abs(Math.cos(runTime + Math.PI)) * 5 },
            foot: { x: Math.sin(runTime + Math.PI) * stride * 1.5 * dir, y: 45 }
          };

          // Arms swing opposite to legs
          lArm = { elbow: { x: Math.sin(runTime + Math.PI) * 15 * dir, y: 20 }, hand: { x: Math.sin(runTime + Math.PI) * 25 * dir, y: 10 } };
          rArm = { elbow: { x: Math.sin(runTime) * 15 * dir, y: 20 }, hand: { x: Math.sin(runTime) * 25 * dir, y: 10 } };
          break;

        case FighterAction.PUNCH:
          // Slight torso rotation toward punch
          torsoAngle = 10 * dir * (Math.PI / 180);
          // Extended punching arm
          rArm = { elbow: { x: 20 * dir, y: 0 }, hand: { x: 45 * dir, y: -5 } };
          // Guard arm
          lArm = { elbow: { x: 5 * dir, y: 20 }, hand: { x: 15 * dir, y: -15 } };
          // Lunge stance
          lLeg = { knee: { x: -15 * dir, y: 25 }, foot: { x: -30 * dir, y: 45 } };
          rLeg = { knee: { x: 15 * dir, y: 20 }, foot: { x: 20 * dir, y: 45 } };
          break;

        case FighterAction.KICK:
          // Torso leans back
          torsoAngle = -15 * dir * (Math.PI / 180);
          // High kick leg
          rLeg = { knee: { x: 20 * dir, y: 0 }, foot: { x: 50 * dir, y: -20 } };
          // Planted supporting leg
          lLeg = { knee: { x: -5 * dir, y: 20 }, foot: { x: -5 * dir, y: 45 } };
          // Arms for balance
          lArm = { elbow: { x: -15 * dir, y: 10 }, hand: { x: -25 * dir, y: 0 } };
          rArm = { elbow: { x: 10 * dir, y: 20 }, hand: { x: 15 * dir, y: 20 } };
          break;

        case FighterAction.BLOCK:
          // Arms raised in protective stance
          lArm = { elbow: { x: 15 * dir, y: 10 }, hand: { x: 20 * dir, y: -20 } };
          rArm = { elbow: { x: 15 * dir, y: 10 }, hand: { x: 20 * dir, y: -20 } };
          headOffset.y = 5; // Head tucked down
          break;

        case FighterAction.JUMP:
          // Legs tucked while airborne
          lLeg = { knee: { x: -10 * dir, y: 10 }, foot: { x: -10 * dir, y: 25 } };
          rLeg = { knee: { x: 10 * dir, y: 15 }, foot: { x: 10 * dir, y: 30 } };
          break;

        case FighterAction.CROUCH:
          // Lower the body
          shoulderY += 20;
          // Deep leg bend
          lLeg = { knee: { x: -20 * dir, y: 10 }, foot: { x: -20 * dir, y: 25 } };
          rLeg = { knee: { x: 20 * dir, y: 10 }, foot: { x: 20 * dir, y: 25 } };
          break;
      }

      // ===================================================================
      // DRAW HEAD
      // ===================================================================

      ctx.beginPath();
      ctx.fillStyle = '#f1f5f9';  // Light color for head
      ctx.arc(cx + headOffset.x + (torsoAngle * 20), topY + 15 + headOffset.y, 12, 0, Math.PI * 2);
      ctx.fill();

      // Headband (colored stripe)
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + headOffset.x + (torsoAngle * 20) - 10, topY + 10 + headOffset.y);
      ctx.lineTo(cx + headOffset.x + (torsoAngle * 20) + 10, topY + 10 + headOffset.y);
      ctx.stroke();

      // ===================================================================
      // DRAW TORSO
      // ===================================================================

      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      const torsoTopX = cx + (torsoAngle * 10);
      const torsoTopY = shoulderY;
      const torsoBotX = cx;
      const torsoBotY = hipY;
      ctx.moveTo(torsoTopX, torsoTopY);
      ctx.lineTo(torsoBotX, torsoBotY);
      ctx.stroke();

      // ===================================================================
      // DRAW LIMBS
      // ===================================================================

      ctx.lineWidth = 6;

      /**
       * Helper function to draw a two-segment limb
       * 
       * @param originX - X anchor point (shoulder or hip)
       * @param originY - Y anchor point
       * @param config - Joint configuration with knee/elbow and foot/hand
       */
      const drawLimb = (originX: number, originY: number, config: any) => {
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        // Draw to midpoint (knee or elbow)
        const kX = originX + config.knee?.x || originX + config.elbow?.x;
        const kY = originY + config.knee?.y || originY + config.elbow?.y;
        ctx.lineTo(kX, kY);
        // Draw to endpoint (foot or hand)
        ctx.lineTo(originX + (config.foot?.x || config.hand?.x), originY + (config.foot?.y || config.hand?.y));
        ctx.stroke();
      };

      // --- DEPTH ORDERING ---
      // Draw back limbs first, then torso, then front limbs
      // This creates proper layering (front limbs appear in front)

      if (dir === 1) {
        // Facing right: left limbs are in back
        drawLimb(torsoBotX, torsoBotY, lLeg);
        drawLimb(torsoTopX, torsoTopY, lArm);
      } else {
        // Facing left: right limbs are in back
        drawLimb(torsoBotX, torsoBotY, rLeg);
        drawLimb(torsoTopX, torsoTopY, rArm);
      }

      // Redraw torso to cover back limb connection points
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(torsoTopX, torsoTopY);
      ctx.lineTo(torsoBotX, torsoBotY);
      ctx.stroke();

      // Draw front limbs
      if (dir === 1) {
        drawLimb(torsoBotX, torsoBotY, rLeg);
        drawLimb(torsoTopX, torsoTopY, rArm);
      } else {
        drawLimb(torsoBotX, torsoBotY, lLeg);
        drawLimb(torsoTopX, torsoTopY, lArm);
      }

      // ===================================================================
      // DRAW HUD ELEMENTS
      // ===================================================================

      // Health bar (above fighter)
      const hpPercent = health / 100;
      ctx.fillStyle = '#ef4444';  // Red background
      ctx.fillRect(x, y - 30, 50, 6);
      ctx.fillStyle = '#22c55e';  // Green fill
      ctx.fillRect(x, y - 30, 50 * hpPercent, 6);

      // Energy bar (below health bar)
      ctx.fillStyle = '#eab308';  // Yellow/gold
      ctx.fillRect(x, y - 22, 50 * (f.energy / 100), 3);
    };

    // =====================================================================
    // RENDER BOTH FIGHTERS
    // =====================================================================

    drawStickman(player1);
    drawStickman(player2);

    // =====================================================================
    // ATTACK VISUAL EFFECTS
    // =====================================================================

    // Draw a glow effect around active hitboxes
    // This helps visualize when attacks are active

    if ((player1.state === FighterAction.PUNCH || player1.state === FighterAction.KICK) && player1.hitbox) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      const h = player1.hitbox;
      ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    if ((player2.state === FighterAction.PUNCH || player2.state === FighterAction.KICK) && player2.hitbox) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      const h = player2.hitbox;
      ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 20, 0, Math.PI * 2);
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