<template>
  <div 
    v-if="isVisible" 
    class="bg-black/90 backdrop-blur-sm border border-orange-500/30 rounded-lg p-3 shadow-2xl relative overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        <span class="text-xs text-orange-400 font-bold uppercase tracking-wider">Chuck Training Arena</span>
      </div>
      <div class="text-[10px] text-slate-500 font-mono flex gap-3">
        <span>Cycle {{ trainingStats.iterations }}</span>
        <span class="text-yellow-500">Rate: {{ (gameState.currentMutationRate * 100).toFixed(1) }}%</span>
      </div>
    </div>

    <!-- Training Arena Canvas -->
    <canvas
      ref="canvasRef"
      :width="CANVAS_WIDTH"
      :height="CANVAS_HEIGHT"
      class="block w-full rounded border border-slate-700"
    />

    <!-- Fighter Labels -->
    <div class="flex justify-between mt-2 text-[10px] font-mono">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded-full bg-purple-500" />
        <span class="text-purple-300">MIRROR AI</span>
        <span class="text-slate-500">(mimics you)</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-slate-500">(evolving)</span>
        <span class="text-orange-300">CHUCK AI</span>
        <div class="w-3 h-3 rounded-full bg-orange-500" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =============================================================================
 * CHUCK TRAINING CANVAS - Full-Detail Training Visualization
 * =============================================================================
 * 
 * Shows Mirror AI vs Chuck AI training matches with full stickman rendering.
 * Uses actual Fighter class for accurate physics and the same renderer as main game.
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { TrainingSettings, Genome, InputState, GameState } from '~/types';
import type { NeuralNetworkData } from '~/types';
import { Fighter, CANVAS_WIDTH as GAME_WIDTH, CANVAS_HEIGHT as GAME_HEIGHT } from '~/services/GameEngine';
import { getChuckGenome, getChuckStats, isChuckInitialized, getMirrorGenome } from '~/services/ChuckAI';
import { predict, createRandomNetwork } from '~/services/NeuralNetwork';
import { renderStickman } from '~/utils/stickmanRenderer';
import { COLORS } from '~/services/Config';

interface Props {
  settings: TrainingSettings;
  gameState: GameState;
}

const props = defineProps<Props>();

// Canvas dimensions (scaled down from main game)
const SCALE = 0.5;
const CANVAS_WIDTH = Math.floor(GAME_WIDTH * SCALE);
const CANVAS_HEIGHT = Math.floor(GAME_HEIGHT * SCALE);

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Show only in Arcade mode with Chuck AI as P2 and running
const isVisible = computed(() => {
  return props.settings.gameMode === 'ARCADE' && 
         props.settings.player2Type === 'CHUCK_AI' &&
         props.settings.isRunning;
});

// Training stats from ChuckAI service
const trainingStats = computed(() => getChuckStats());

// Fighter instances for simulation
let mirrorFighter: Fighter | null = null;
let chuckFighter: Fighter | null = null;
let animationFrameId: number | null = null;
let isRunning = false;
let matchTimer = 0;
let frameCount = 0;

// =============================================================================
// WIREFRAME GRID BACKGROUND
// =============================================================================

const renderWireframeBackground = (ctx: CanvasRenderingContext2D) => {
  // Dark background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Grid perspective parameters
  const horizonY = CANVAS_HEIGHT * 0.3;
  const groundY = CANVAS_HEIGHT - 20;

  // Horizontal grid lines (perspective)
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  
  for (let i = 0; i < 12; i++) {
    const progress = i / 11;
    const y = horizonY + (groundY - horizonY) * Math.pow(progress, 0.7);
    const alpha = 0.2 + progress * 0.4;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Vertical grid lines (converging to center)
  ctx.globalAlpha = 0.5;
  const vanishX = CANVAS_WIDTH / 2;
  const numLines = 20;
  
  for (let i = -numLines / 2; i <= numLines / 2; i++) {
    const bottomX = vanishX + i * 40;
    const topX = vanishX + i * 8;
    ctx.beginPath();
    ctx.moveTo(bottomX, groundY);
    ctx.lineTo(topX, horizonY);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;

  // Ground line glow
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(CANVAS_WIDTH, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Corner labels
  ctx.font = '10px monospace';
  ctx.fillStyle = '#22c55e';
  ctx.globalAlpha = 0.5;
  ctx.fillText('TRAINING SIMULATION', 10, 15);
  ctx.fillText(`FRAME ${frameCount}`, CANVAS_WIDTH - 80, 15);
  ctx.globalAlpha = 1.0;
};

// =============================================================================
// MATCH SIMULATION
// =============================================================================

const createTrainingGenome = (network: NeuralNetworkData | null): Genome => ({
  id: 'training',
  network: network ?? createRandomNetwork(),
  fitness: 0,
  matchesWon: 0
});

const resetMatch = () => {
  // Get genomes from ChuckAI service
  const chuckGenome = isChuckInitialized() ? getChuckGenome() : null;
  const mirrorNetwork = getMirrorGenome();

  // Mirror AI (purple) on left - uses mirror network that mimics human
  mirrorFighter = new Fighter(
    80,
    '#a855f7', // Purple
    true,
    createTrainingGenome(mirrorNetwork)
  );
  mirrorFighter.direction = 1;

  // Chuck AI (orange) on right - uses Chuck's evolved network
  chuckFighter = new Fighter(
    GAME_WIDTH - 130,
    COLORS.CHUCK_AI,
    true,
    chuckGenome ? { ...chuckGenome } : createTrainingGenome(null)
  );
  chuckFighter.direction = -1;

  matchTimer = 600; // 10 seconds at 60fps
};

const getAIInput = (fighter: Fighter, opponent: Fighter): InputState => {
  const dummy: InputState = { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };
  
  if (!fighter.genome?.network) {
    // Fallback: simple aggressive AI
    const dist = opponent.x - fighter.x;
    return {
      ...dummy,
      left: dist < -30,
      right: dist > 30,
      action1: Math.abs(dist) < 70 && Math.random() > 0.85,
      action2: Math.abs(dist) < 70 && Math.random() > 0.9
    };
  }

  // Generate normalized inputs (same as Fighter.processAi)
  const distX = (opponent.x - fighter.x) / GAME_WIDTH;
  const distY = (opponent.y - fighter.y) / GAME_HEIGHT;
  const myHealth = fighter.health / 100;
  const oppHealth = opponent.health / 100;
  const oppAction = opponent.cooldown > 15 ? 1 : 0;
  const myEnergy = fighter.energy / 100;
  const facingRight = fighter.direction === 1 ? 1 : -1;
  const oppCooldown = opponent.cooldown / 30;
  const oppEnergy = opponent.energy / 100;
  
  const inputs = [distX, distY, myHealth, oppHealth, oppAction, myEnergy, facingRight, oppCooldown, oppEnergy];
  const outputs = predict(fighter.genome.network, inputs);
  
  return {
    left: (outputs[1] ?? 0) > 0.5,
    right: (outputs[2] ?? 0) > 0.5,
    up: (outputs[3] ?? 0) > 0.5,
    down: (outputs[4] ?? 0) > 0.5,
    action1: (outputs[5] ?? 0) > 0.5,
    action2: (outputs[6] ?? 0) > 0.5,
    action3: (outputs[7] ?? 0) > 0.5
  };
};

// =============================================================================
// RENDER LOOP
// =============================================================================

const render = () => {
  if (!isRunning) return;

  const canvas = canvasRef.value;
  if (!canvas) {
    animationFrameId = requestAnimationFrame(render);
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    animationFrameId = requestAnimationFrame(render);
    return;
  }

  frameCount++;

  // Initialize fighters if needed
  if (!mirrorFighter || !chuckFighter) {
    resetMatch();
    animationFrameId = requestAnimationFrame(render);
    return;
  }

  // Only simulate when visible
  if (isVisible.value) {
    // Get AI decisions
    const mirrorInput = getAIInput(mirrorFighter, chuckFighter);
    const chuckInput = getAIInput(chuckFighter, mirrorFighter);

    // Update fighters (passing opponent for hit detection)
    mirrorFighter.update(mirrorInput, chuckFighter);
    chuckFighter.update(chuckInput, mirrorFighter);

    // Check hits
    mirrorFighter.checkHit(chuckFighter);
    chuckFighter.checkHit(mirrorFighter);

    // Collision push-apart (same logic as main arena in useMatchUpdate.ts)
    const p1 = mirrorFighter;
    const p2 = chuckFighter;
    const verticalOverlap = (p1.y + p1.height > p2.y) && (p2.y + p2.height > p1.y);
    
    if (verticalOverlap) {
      if (p1.x < p2.x) {
        const overlap = (p1.x + p1.width) - p2.x;
        if (overlap > 0) { p1.x -= overlap / 2; p2.x += overlap / 2; }
      } else {
        const overlap = (p2.x + p2.width) - p1.x;
        if (overlap > 0) { p2.x -= overlap / 2; p1.x += overlap / 2; }
      }
    }

    matchTimer--;
    if (matchTimer <= 0 || mirrorFighter.health <= 0 || chuckFighter.health <= 0) {
      resetMatch();
    }
  }

  // Clear and draw background
  renderWireframeBackground(ctx);

  // Draw fighters using real stickman renderer
  // Save context, scale, render, restore
  ctx.save();
  ctx.scale(SCALE, SCALE);
  
  // Render in proper order (back to front based on position)
  if (mirrorFighter.x < chuckFighter.x) {
    renderStickman(ctx, mirrorFighter, frameCount);
    renderStickman(ctx, chuckFighter, frameCount);
  } else {
    renderStickman(ctx, chuckFighter, frameCount);
    renderStickman(ctx, mirrorFighter, frameCount);
  }
  
  ctx.restore();

  animationFrameId = requestAnimationFrame(render);
};

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(() => {
  isRunning = true;
  resetMatch();
  render();
});

onUnmounted(() => {
  isRunning = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
});

// Reset match when game starts/stops
watch(() => props.settings.isRunning, (running) => {
  if (running && isVisible.value) {
    resetMatch();
  }
});
</script>
