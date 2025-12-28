/**
 * =============================================================================
 * STICKMAN RENDERER - Fighter Visualization
 * =============================================================================
 * 
 * Renders stickman fighters with skeleton-based animation system.
 */

import { Fighter } from '../services/GameEngine';
import { FighterAction } from '../types';

/**
 * Renders a stickman fighter on the canvas.
 * 
 * @param ctx - Canvas 2D rendering context
 * @param fighter - Fighter object to render
 * @param frameCount - Current frame number for animation cycles
 */
export function renderStickman(ctx: CanvasRenderingContext2D, fighter: Fighter, frameCount: number): void {
  const { x, y, width, height, color, direction, state, health } = fighter;
  const isDead = health <= 0;

  const cx = x + width / 2;
  const bottomY = y + height;
  const topY = y;
  let shoulderY = topY + 25;
  const hipY = bottomY - 45;

  const mainColor = color;
  const jointColor = '#fff';

  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';

  let headOffset = { x: 0, y: 0 };
  let torsoAngle = 0;

  let lArm = { elbow: { x: -15, y: 15 }, hand: { x: -10, y: -10 } };
  let rArm = { elbow: { x: 15, y: 15 }, hand: { x: 25, y: 0 } };
  let lLeg = { knee: { x: -5, y: 20 }, foot: { x: -10, y: 45 } };
  let rLeg = { knee: { x: 10, y: 20 }, foot: { x: 15, y: 45 } };

  const dir = direction;

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
      headOffset.y = Math.sin(frameCount * 0.1) * 2;
      lArm = { elbow: { x: 10 * dir, y: 20 }, hand: { x: 20 * dir, y: -10 } };
      rArm = { elbow: { x: 15 * dir, y: 20 }, hand: { x: 25 * dir, y: -5 } };
      lLeg = { knee: { x: -5 * dir, y: 20 }, foot: { x: -15 * dir, y: 45 } };
      rLeg = { knee: { x: 10 * dir, y: 20 }, foot: { x: 20 * dir, y: 45 } };
      break;

    case FighterAction.MOVE_LEFT:
    case FighterAction.MOVE_RIGHT:
      const wSpeed = 0.25;
      const t = frameCount * wSpeed;
      const stride = 20;

      headOffset.y = Math.abs(Math.cos(t)) * 3;

      const getLeg = (phaseOffset: number) => {
        const localT = t + phaseOffset;
        const sinT = Math.sin(localT);
        const cosT = Math.cos(localT);

        const x = sinT * stride;
        const liftParams = Math.max(0, cosT);
        const footLift = liftParams * 12;
        const kneeLift = liftParams * 8;

        return {
          knee: { x: x * dir, y: 20 - kneeLift },
          foot: { x: (x * 1.6) * dir, y: 45 - footLift }
        };
      };

      rLeg = getLeg(0);
      lLeg = getLeg(Math.PI);

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
    const kX = originX + (config.knee?.x || config.elbow?.x);
    const kY = originY + (config.knee?.y || config.elbow?.y);
    ctx.lineTo(kX, kY);
    const eX = originX + (config.foot?.x || config.hand?.x);
    const eY = originY + (config.foot?.y || config.hand?.y);
    ctx.lineTo(eX, eY);
    ctx.stroke();

    drawJoint(originX, originY);
    drawJoint(kX, kY);
  };

  if (dir === 1) {
    drawLimb(torsoBotX, torsoBotY, lLeg);
    drawLimb(torsoTopX, torsoTopY, lArm);
  } else {
    drawLimb(torsoBotX, torsoBotY, rLeg);
    drawLimb(torsoTopX, torsoTopY, rArm);
  }

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

  ctx.shadowBlur = 0;

  // --- HUD ---
  const hpPercent = health / 100;

  ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
  ctx.fillRect(x - 5, y - 35, 60, 10);
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(x - 5, y - 35, 60, 10);

  ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : (hpPercent > 0.2 ? '#eab308' : '#ef4444');
  ctx.fillRect(x - 4, y - 34, 58 * hpPercent, 8);

  ctx.fillStyle = '#eab308';
  ctx.fillRect(x - 5, y - 23, 60 * (fighter.energy / 100), 2);
}

