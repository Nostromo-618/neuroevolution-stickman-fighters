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

    frameRef.current++; // Increment for animation cycles

    // --- CLEAR CANVAS ---
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // =====================================================================
    // BACKGROUND RENDERING
    // =====================================================================

    // --- SKY GRADIENT ---
    // Deep space/cyber theme
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#020617');  // Almost black blue
    gradient.addColorStop(1, '#1e1b4b');  // Deep indigo
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- STAR FIELD ---
    // Static procedural stars based on position
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137.5) % CANVAS_WIDTH; // Golden angle for pseudo-random distribution
      const y = (i * 293.3) % (CANVAS_HEIGHT * 0.6);
      const size = (i % 3 === 0) ? 1.5 : 0.8;
      const opacity = 0.3 + (Math.sin(i + frameRef.current * 0.02) * 0.2); // Twinkle

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // --- MOON REMOVED ---
    // (Moon rendering code deleted as requested)

    // --- DIGITAL SKYLINE (Background) ---
    // Far layer - darker
    ctx.fillStyle = '#111827'; // Very dark grey (almost black)
    for (let i = 0; i < CANVAS_WIDTH; i += 60) {
      const h = 80 + Math.sin(i * 0.02) * 40 + (i % 100);
      ctx.fillRect(i, CANVAS_HEIGHT - 100 - h, 40, h + 100);

      // Windows
      ctx.fillStyle = '#374151'; // Dark grey windows
      if (i % 3 === 0) {
        for (let w = 0; w < h; w += 20) {
          if ((i + w) % 5 !== 0) ctx.fillRect(i + 10, CANVAS_HEIGHT - 100 - h + w + 10, 5, 8);
        }
      }
      ctx.fillStyle = '#111827'; // Restore building color
    }

    // --- DIGITAL SKYLINE (Foreground) ---
    // Near layer - lighter, more detailed
    ctx.fillStyle = '#1f2937'; // Dark grey
    for (let i = 30; i < CANVAS_WIDTH; i += 80) {
      const h = 40 + Math.cos(i * 0.03) * 30 + (i % 70);
      ctx.fillRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);

      // "Cyber" rim light on buildings
      ctx.strokeStyle = '#4b5563'; // Grey rim light
      ctx.lineWidth = 1;
      ctx.strokeRect(i, CANVAS_HEIGHT - 80 - h, 50, h + 80);
    }

    // --- GROUND ---
    // Digital grid floor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 35);

    // Grid lines
    ctx.strokeStyle = '#15803d'; // Dark green grid
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Perspective lines
    for (let i = -CANVAS_WIDTH; i < CANVAS_WIDTH * 2; i += 60) {
      ctx.moveTo(i, CANVAS_HEIGHT - 35);
      ctx.lineTo((i - CANVAS_WIDTH / 2) * 4 + CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    }
    // Horizontal lines
    for (let y = CANVAS_HEIGHT - 35; y < CANVAS_HEIGHT; y += 15) {
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();

    // Top border of ground
    ctx.fillStyle = '#22c55e'; // Bright green border
    ctx.fillRect(0, CANVAS_HEIGHT - 35, CANVAS_WIDTH, 3);


    // =====================================================================
    // STICKMAN RENDERING FUNCTION
    // =====================================================================

    const drawStickman = (f: Fighter) => {
      const { x, y, width, height, color, direction, state, health } = f;
      const isDead = health <= 0;

      // Calculate anchor points
      const cx = x + width / 2;
      const bottomY = y + height;
      const topY = y;
      let shoulderY = topY + 25;
      const hipY = bottomY - 45;

      // Styles
      const mainColor = color;
      const jointColor = '#fff';

      // Shadow removed as requested
      // ctx.fillStyle = 'rgba(0,0,0,0.5)';
      // ctx.beginPath();
      // ctx.ellipse(cx, bottomY - 5, 30, 8, 0, 0, Math.PI * 2);
      // ctx.fill();

      // Set drawing style
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Add Glow removed as requested
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // --- POSE VARIABLES ---
      let headOffset = { x: 0, y: 0 };
      let torsoAngle = 0;

      // Arm joint positions (relative to shoulder)
      let lArm = { elbow: { x: -15, y: 15 }, hand: { x: -10, y: -10 } };
      let rArm = { elbow: { x: 15, y: 15 }, hand: { x: 25, y: 0 } };

      // Leg joint positions (relative to hip)
      let lLeg = { knee: { x: -5, y: 20 }, foot: { x: -10, y: 45 } };
      let rLeg = { knee: { x: 10, y: 20 }, foot: { x: 15, y: 45 } };

      const dir = direction;

      // ... keeping logic for pose states largely same but formatted ...
      if (isDead) {
        ctx.beginPath();
        ctx.arc(cx - 30 * dir, bottomY - 10, 10, 0, Math.PI * 2);
        ctx.moveTo(cx - 20 * dir, bottomY - 5);
        ctx.lineTo(cx + 10 * dir, bottomY - 5);
        ctx.moveTo(cx - 10 * dir, bottomY - 5);
        ctx.lineTo(cx - 10 * dir, bottomY - 25);
        ctx.moveTo(cx + 10 * dir, bottomY - 5);
        ctx.lineTo(cx + 30 * dir, bottomY - 5);
        ctx.stroke();
        ctx.shadowBlur = 0;
        return;
      }

      switch (state) {
        case FighterAction.IDLE:
          headOffset.y = Math.sin(frameRef.current * 0.1) * 2;
          lArm = { elbow: { x: 10 * dir, y: 20 }, hand: { x: 20 * dir, y: -10 } };
          rArm = { elbow: { x: 15 * dir, y: 20 }, hand: { x: 25 * dir, y: -5 } };
          lLeg = { knee: { x: -5 * dir, y: 20 }, foot: { x: -15 * dir, y: 45 } };
          rLeg = { knee: { x: 10 * dir, y: 20 }, foot: { x: 20 * dir, y: 45 } };
          break;

        case FighterAction.MOVE_LEFT:
        case FighterAction.MOVE_RIGHT:
          // Improved Gait Cycle
          // Slower, weighted speed
          const wSpeed = 0.25;
          const t = frameRef.current * wSpeed;
          const stride = 20;

          // Body Bob: Highest when legs cross (t=0, PI), Lowest when legs split (t=PI/2, 3PI/2)
          // cos(2t) is 1 at 0, -1 at PI/2.
          headOffset.y = Math.abs(Math.cos(t)) * 3;

          // Enhanced Leg Function
          const getLeg = (phaseOffset: number) => {
            const localT = t + phaseOffset;
            const sinT = Math.sin(localT);
            const cosT = Math.cos(localT); // derivative, velocity direction

            // X Position (Standard swing, tweaked magnitude)
            const x = sinT * stride;

            // Y Position (Lift Logic)
            // Lift foot ONLY during forward swing (when cosT > 0)
            // Peak lift happens at peak forward velocity (cosT = 1)
            const liftParams = Math.max(0, cosT);
            const footLift = liftParams * 12; // Foot clears ground by 12px
            const kneeLift = liftParams * 8;  // Knee raises too

            return {
              knee: { x: x * dir, y: 20 - kneeLift },
              foot: { x: (x * 1.6) * dir, y: 45 - footLift }
            };
          };

          // Right leg leads at 0, Left at PI (opposition)
          rLeg = getLeg(0);
          lLeg = getLeg(Math.PI);

          // Arms swing opposite to legs
          // Simple sine swing is fine for arms
          lArm = {
            elbow: { x: Math.sin(t) * 12 * dir, y: 20 },
            hand: { x: Math.sin(t) * 22 * dir, y: 15 }
          };
          rArm = {
            elbow: { x: Math.sin(t + Math.PI) * 12 * dir, y: 20 },
            hand: { x: Math.sin(t + Math.PI) * 22 * dir, y: 15 }
          };
          break;

        case FighterAction.PUNCH:
          torsoAngle = 10 * dir * (Math.PI / 180);
          rArm = { elbow: { x: 20 * dir, y: 0 }, hand: { x: 45 * dir, y: -5 } };
          lArm = { elbow: { x: 5 * dir, y: 20 }, hand: { x: 15 * dir, y: -15 } };
          lLeg = { knee: { x: -15 * dir, y: 25 }, foot: { x: -30 * dir, y: 45 } };
          rLeg = { knee: { x: 15 * dir, y: 20 }, foot: { x: 20 * dir, y: 45 } };
          break;

        case FighterAction.KICK:
          torsoAngle = -15 * dir * (Math.PI / 180);
          rLeg = { knee: { x: 20 * dir, y: 0 }, foot: { x: 50 * dir, y: -20 } };
          lLeg = { knee: { x: -5 * dir, y: 20 }, foot: { x: -5 * dir, y: 45 } };
          lArm = { elbow: { x: -15 * dir, y: 10 }, hand: { x: -25 * dir, y: 0 } };
          rArm = { elbow: { x: 10 * dir, y: 20 }, hand: { x: 15 * dir, y: 20 } };
          break;

        case FighterAction.BLOCK:
          lArm = { elbow: { x: 15 * dir, y: 10 }, hand: { x: 20 * dir, y: -20 } };
          rArm = { elbow: { x: 15 * dir, y: 10 }, hand: { x: 20 * dir, y: -20 } };
          headOffset.y = 5;
          break;

        case FighterAction.JUMP:
          lLeg = { knee: { x: -10 * dir, y: 10 }, foot: { x: -10 * dir, y: 25 } };
          rLeg = { knee: { x: 10 * dir, y: 15 }, foot: { x: 10 * dir, y: 30 } };
          break;

        case FighterAction.CROUCH:
          shoulderY += 20;
          lLeg = { knee: { x: -20 * dir, y: 10 }, foot: { x: -20 * dir, y: 25 } };
          rLeg = { knee: { x: 20 * dir, y: 10 }, foot: { x: 20 * dir, y: 25 } };
          break;
      }

      // --- DRAW SKELETON ---

      // Function to draw simple joint circle
      const drawJoint = (jx: number, jy: number) => {
        const oldStyle = ctx.fillStyle;
        ctx.fillStyle = jointColor;
        ctx.beginPath();
        ctx.arc(jx, jy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = oldStyle;
      };

      // HEAD
      ctx.beginPath();
      ctx.fillStyle = '#f1f5f9';
      const headX = cx + headOffset.x + (torsoAngle * 20);
      const headY = topY + 15 + headOffset.y;
      ctx.arc(headX, headY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Headband
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 10, headY - 5);
      ctx.lineTo(headX + 10, headY - 5);
      ctx.stroke();

      // TORSO
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 8;
      ctx.beginPath();
      const torsoTopX = cx + (torsoAngle * 10);
      const torsoTopY = shoulderY;
      const torsoBotX = cx;
      const torsoBotY = hipY;
      ctx.moveTo(torsoTopX, torsoTopY);
      ctx.lineTo(torsoBotX, torsoBotY);
      ctx.stroke();

      // LIMBS with joints
      ctx.lineWidth = 6;
      const drawLimb = (originX: number, originY: number, config: any) => {
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        // Knee/Elbow
        const kX = originX + (config.knee?.x || config.elbow?.x);
        const kY = originY + (config.knee?.y || config.elbow?.y);
        ctx.lineTo(kX, kY);
        // Foot/Hand
        const eX = originX + (config.foot?.x || config.hand?.x);
        const eY = originY + (config.foot?.y || config.hand?.y);
        ctx.lineTo(eX, eY);
        ctx.stroke();

        // Draw joints atop
        drawJoint(originX, originY); // Shoulder/Hip
        drawJoint(kX, kY); // Elbow/Knee
        // drawJoint(eX, eY); // Hand/Foot (optional, maybe too cluttered)
      };

      if (dir === 1) {
        drawLimb(torsoBotX, torsoBotY, lLeg);
        drawLimb(torsoTopX, torsoTopY, lArm);
      } else {
        drawLimb(torsoBotX, torsoBotY, rLeg);
        drawLimb(torsoTopX, torsoTopY, rArm);
      }

      // Re-draw torso to cover back entries
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(torsoTopX, torsoTopY);
      ctx.lineTo(torsoBotX, torsoBotY);
      ctx.stroke();

      if (dir === 1) {
        drawLimb(torsoBotX, torsoBotY, rLeg);
        drawLimb(torsoTopX, torsoTopY, rArm);
      } else {
        drawLimb(torsoBotX, torsoBotY, lLeg);
        drawLimb(torsoTopX, torsoTopY, lArm);
      }

      ctx.shadowBlur = 0; // Reset glow for HUD

      // --- HUD ---
      const hpPercent = health / 100;

      // Container
      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)'; // Semi-transparent dark bg
      ctx.fillRect(x - 5, y - 35, 60, 10);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(x - 5, y - 35, 60, 10);

      // HP Fill
      ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : (hpPercent > 0.2 ? '#eab308' : '#ef4444');
      ctx.fillRect(x - 4, y - 34, 58 * hpPercent, 8);

      // Energy (Thin line below)
      ctx.fillStyle = '#eab308'; // Yellow energy
      ctx.fillRect(x - 5, y - 23, 60 * (f.energy / 100), 2);
    };

    // =====================================================================
    // RENDER ENTITIES
    // =====================================================================

    const swapSides = isTraining && roundNumber % 2 === 1;

    if (swapSides) {
      drawStickman(player2);
      drawStickman(player1);
    } else {
      drawStickman(player1);
      drawStickman(player2);
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