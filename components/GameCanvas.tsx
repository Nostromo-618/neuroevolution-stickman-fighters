import React, { useRef, useEffect } from 'react';
import { Fighter, CANVAS_WIDTH, CANVAS_HEIGHT } from '../services/GameEngine';
import { FighterAction } from '../types';

interface GameCanvasProps {
  player1: Fighter;
  player2: Fighter;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ player1, player2 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    frameRef.current++; // Ticks for animation loops

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // --- Background ---
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Moon
    ctx.fillStyle = '#f8fafc';
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH - 100, 80, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Forest Background Layers
    // Distant trees
    ctx.fillStyle = '#1e3a8a';
    for(let i=0; i<CANVAS_WIDTH; i+=40) {
        const h = 50 + Math.sin(i * 0.05) * 20;
        ctx.fillRect(i, CANVAS_HEIGHT - 120 - h, 20, h + 50);
    }
    
    // Close trees
    ctx.fillStyle = '#064e3b';
    [50, 250, 450, 650].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, CANVAS_HEIGHT - 80);
        ctx.lineTo(x + 30, CANVAS_HEIGHT - 400);
        ctx.lineTo(x + 60, CANVAS_HEIGHT - 80);
        ctx.fill();
    });

    // Ground
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, CANVAS_HEIGHT - 70, CANVAS_WIDTH, 70);
    ctx.fillStyle = '#14532d'; // Grass top
    ctx.fillRect(0, CANVAS_HEIGHT - 75, CANVAS_WIDTH, 10);


    // --- Fighter Renderer ---
    const drawStickman = (f: Fighter) => {
      const { x, y, width, height, color, direction, state, health } = f;
      const isDead = health <= 0;
      
      const cx = x + width / 2;
      const bottomY = y + height;
      const topY = y;
      let shoulderY = topY + 25;
      const hipY = bottomY - 45;

      ctx.strokeStyle = color;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // --- Animation Offsets ---
      let headOffset = { x: 0, y: 0 };
      let torsoAngle = 0;
      let lArm = { elbow: {x: -15, y: 15}, hand: {x: -10, y: -10} }; // Relative to Shoulder
      let rArm = { elbow: {x: 15, y: 15}, hand: {x: 25, y: 0} };
      let lLeg = { knee: {x: -5, y: 20}, foot: {x: -10, y: 45} }; // Relative to Hip
      let rLeg = { knee: {x: 10, y: 20}, foot: {x: 15, y: 45} };

      // Directional Multiplier
      const dir = direction; // 1 or -1

      if (isDead) {
         // Dead Pose (Laying flat)
         ctx.beginPath();
         // Head
         ctx.arc(cx - 30 * dir, bottomY - 10, 10, 0, Math.PI*2);
         // Body
         ctx.moveTo(cx - 20 * dir, bottomY - 5);
         ctx.lineTo(cx + 10 * dir, bottomY - 5);
         // Arms/Legs spread
         ctx.moveTo(cx - 10 * dir, bottomY - 5);
         ctx.lineTo(cx - 10 * dir, bottomY - 25);
         ctx.moveTo(cx + 10 * dir, bottomY - 5);
         ctx.lineTo(cx + 30 * dir, bottomY - 5);
         ctx.stroke();
         return; 
      }

      // State Machine for Poses
      switch (state) {
        case FighterAction.IDLE:
          // Breathing bounce
          headOffset.y = Math.sin(frameRef.current * 0.1) * 2;
          // Guard
          lArm = { elbow: {x: 10 * dir, y: 20}, hand: {x: 20 * dir, y: -10} };
          rArm = { elbow: {x: 15 * dir, y: 20}, hand: {x: 25 * dir, y: -5} };
          // Stance
          lLeg = { knee: {x: -5 * dir, y: 20}, foot: {x: -15 * dir, y: 45} };
          rLeg = { knee: {x: 10 * dir, y: 20}, foot: {x: 20 * dir, y: 45} };
          break;

        case FighterAction.MOVE_LEFT:
        case FighterAction.MOVE_RIGHT:
          // Run Cycle
          const runTime = frameRef.current * 0.5;
          const stride = 20;
          lLeg = { 
              knee: {x: Math.sin(runTime) * stride * dir, y: 20 - Math.abs(Math.cos(runTime))*5}, 
              foot: {x: Math.sin(runTime) * stride * 1.5 * dir, y: 45} 
          };
          rLeg = { 
              knee: {x: Math.sin(runTime + Math.PI) * stride * dir, y: 20 - Math.abs(Math.cos(runTime + Math.PI))*5}, 
              foot: {x: Math.sin(runTime + Math.PI) * stride * 1.5 * dir, y: 45} 
          };
          // Arms Swing
          lArm = { elbow: {x: Math.sin(runTime + Math.PI)*15*dir, y: 20}, hand: {x: Math.sin(runTime + Math.PI)*25*dir, y: 10} };
          rArm = { elbow: {x: Math.sin(runTime)*15*dir, y: 20}, hand: {x: Math.sin(runTime)*25*dir, y: 10} };
          break;

        case FighterAction.PUNCH:
           torsoAngle = 10 * dir * (Math.PI / 180);
           // Punching Arm (Right arm if dir 1)
           rArm = { elbow: {x: 20 * dir, y: 0}, hand: {x: 45 * dir, y: -5} }; // Straight out
           lArm = { elbow: {x: 5 * dir, y: 20}, hand: {x: 15 * dir, y: -15} }; // Guard
           // Lunge legs
           lLeg = { knee: {x: -15 * dir, y: 25}, foot: {x: -30 * dir, y: 45} };
           rLeg = { knee: {x: 15 * dir, y: 20}, foot: {x: 20 * dir, y: 45} };
           break;

        case FighterAction.KICK:
           torsoAngle = -15 * dir * (Math.PI / 180);
           // Kicking Leg (Right leg)
           rLeg = { knee: {x: 20 * dir, y: 0}, foot: {x: 50 * dir, y: -20} }; // High kick
           lLeg = { knee: {x: -5 * dir, y: 20}, foot: {x: -5 * dir, y: 45} }; // Planted
           // Arms balance
           lArm = { elbow: {x: -15 * dir, y: 10}, hand: {x: -25 * dir, y: 0} };
           rArm = { elbow: {x: 10 * dir, y: 20}, hand: {x: 15 * dir, y: 20} };
           break;
        
        case FighterAction.BLOCK:
           lArm = { elbow: {x: 15 * dir, y: 10}, hand: {x: 20 * dir, y: -20} }; // High guard
           rArm = { elbow: {x: 15 * dir, y: 10}, hand: {x: 20 * dir, y: -20} };
           headOffset.y = 5; // Tuck head
           break;

         case FighterAction.JUMP:
           lLeg = { knee: {x: -10 * dir, y: 10}, foot: {x: -10 * dir, y: 25} }; // Tucked
           rLeg = { knee: {x: 10 * dir, y: 15}, foot: {x: 10 * dir, y: 30} };
           break;
          
         case FighterAction.CROUCH:
           shoulderY += 20; // Lower body
           lLeg = { knee: {x: -20 * dir, y: 10}, foot: {x: -20 * dir, y: 25} }; // Deep bend
           rLeg = { knee: {x: 20 * dir, y: 10}, foot: {x: 20 * dir, y: 25} };
           break;
      }

      // Draw Head
      ctx.beginPath();
      ctx.fillStyle = '#f1f5f9';
      ctx.arc(cx + headOffset.x + (torsoAngle * 20), topY + 15 + headOffset.y, 12, 0, Math.PI * 2);
      ctx.fill();
      // Headband
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + headOffset.x + (torsoAngle * 20) - 10, topY + 10 + headOffset.y);
      ctx.lineTo(cx + headOffset.x + (torsoAngle * 20) + 10, topY + 10 + headOffset.y);
      ctx.stroke();

      // Draw Torso
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

      // Draw Limbs (Back limbs first for depth)
      ctx.lineWidth = 6;
      const drawLimb = (originX: number, originY: number, config: any) => {
         ctx.beginPath();
         ctx.moveTo(originX, originY);
         const kX = originX + config.knee?.x || originX + config.elbow?.x;
         const kY = originY + config.knee?.y || originY + config.elbow?.y;
         ctx.lineTo(kX, kY);
         const fX = originX + config.foot?.x || originX + config.hand?.x;
         const fY = originY + config.foot?.y || originX + config.hand?.y;
         // Adjust foot/hand to be relative to knee/elbow? No, config is relative to origin for simplicity in switch
         // Let's fix math: config is relative to origin.
         // Knee/Elbow is midpoint. Foot/Hand is endpoint relative to origin? 
         // Actually in switch I did relative to origin logic roughly.
         // Let's refine: Knee is absolute offset from hip. Foot is absolute offset from hip.
         ctx.lineTo(originX + (config.foot?.x || config.hand?.x), originY + (config.foot?.y || config.hand?.y));
         ctx.stroke();
      };

      // Back Leg (Left usually if facing right)
      // Actually depends on direction which is back.
      // Render order: Back Arm/Leg -> Torso -> Front Arm/Leg
      // Simplification: Always render Left then Right? No, render "Back" then "Front".
      // If dir=1, Left is back.
      
      if (dir === 1) {
          drawLimb(torsoBotX, torsoBotY, lLeg); // Back Leg
          drawLimb(torsoTopX, torsoTopY, lArm); // Back Arm
      } else {
          drawLimb(torsoBotX, torsoBotY, rLeg); 
          drawLimb(torsoTopX, torsoTopY, rArm); 
      }

      // Redraw Torso (to cover back limb joints)
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(torsoTopX, torsoTopY);
      ctx.lineTo(torsoBotX, torsoBotY);
      ctx.stroke();

      if (dir === 1) {
          drawLimb(torsoBotX, torsoBotY, rLeg); // Front Leg
          drawLimb(torsoTopX, torsoTopY, rArm); // Front Arm
      } else {
          drawLimb(torsoBotX, torsoBotY, lLeg); 
          drawLimb(torsoTopX, torsoTopY, lArm); 
      }

      // Draw Health Bar
      const hpPercent = health / 100;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x, y - 30, 50, 6);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x, y - 30, 50 * hpPercent, 6);
      
      // Energy Bar (Small under HP)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x, y - 22, 50 * (f.energy/100), 3);
    };

    drawStickman(player1);
    drawStickman(player2);

    // Visual FX for hits
    // Simple particle system would be nice, but simple flash is okay
    if ((player1.state === FighterAction.PUNCH || player1.state === FighterAction.KICK) && player1.hitbox) {
         ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
         ctx.beginPath();
         const h = player1.hitbox;
         ctx.arc(h.x + h.w/2, h.y + h.h/2, 20, 0, Math.PI*2);
         ctx.fill();
    }
    if ((player2.state === FighterAction.PUNCH || player2.state === FighterAction.KICK) && player2.hitbox) {
         ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
         ctx.beginPath();
         const h = player2.hitbox;
         ctx.arc(h.x + h.w/2, h.y + h.h/2, 20, 0, Math.PI*2);
         ctx.fill();
    }

  }); // Render every commit

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