<template>
  <div 
    v-if="isVisible" 
    class="bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-2xl relative overflow-hidden"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span class="text-xs text-blue-400 font-bold uppercase tracking-wider">Simple AI Training</span>
      </div>
      <div class="text-[10px] text-slate-500 font-mono flex gap-3">
        <span>Gen {{ gameState.generation }}</span>
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
        <div class="w-3 h-3 rounded-full bg-blue-500" />
        <span class="text-blue-300">Variant A</span>
      </div>
      <div class="flex items-center gap-1">
        <span class="text-red-300">Variant B</span>
        <div class="w-3 h-3 rounded-full bg-red-500" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * =============================================================================
 * SIMPLE TRAINING CANVAS - Visualization for Simple AI Evolution
 * =============================================================================
 * 
 * Simulated matchup between two random population members.
 * Purely verification - logic is decoupled from actual evolution.
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { TrainingSettings, Genome, GameState, InputState } from '~/types';
import { Fighter, CANVAS_WIDTH as GAME_WIDTH, CANVAS_HEIGHT as GAME_HEIGHT } from '~/services/GameEngine';
import { predict } from '~/services/NeuralNetwork';
import { renderStickman } from '~/utils/stickmanRenderer';

interface Props {
  settings: TrainingSettings;
  gameState: GameState;
  population: Genome[];
}

const props = defineProps<Props>();

// Canvas dimensions (scaled down)
const SCALE = 0.5;
const CANVAS_WIDTH = Math.floor(GAME_WIDTH * SCALE);
const CANVAS_HEIGHT = Math.floor(GAME_HEIGHT * SCALE);

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Show only in Training Mode (Simple AI)
const isVisible = computed(() => {
  return props.settings.gameMode === 'TRAINING';
});

// Fighter instances for simulation
let fighterA: Fighter | null = null;
let fighterB: Fighter | null = null;
let animationFrameId: number | null = null;
let isRunning = false;
let matchTimer = 0;
let frameCount = 0;

// =============================================================================
// BACKGROUND RENDERING
// =============================================================================

const renderBackground = (ctx: CanvasRenderingContext2D) => {
  // Clear
  ctx.fillStyle = '#0f172a'; // Slate-900
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Simple grid
  ctx.strokeStyle = '#1e293b'; // Slate-800
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }

  // Ground
  const groundY = CANVAS_HEIGHT - 20;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, groundY, CANVAS_WIDTH, 20);
  ctx.strokeStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(CANVAS_WIDTH, groundY);
  ctx.stroke();
};

// =============================================================================
// MATCH LOGIC
// =============================================================================

const resetMatch = () => {
  if (props.population.length < 2) return;

  // Pick 2 random genomes
  const idxA = Math.floor(Math.random() * props.population.length);
  let idxB = Math.floor(Math.random() * props.population.length);
  while (idxB === idxA) {
    idxB = Math.floor(Math.random() * props.population.length);
  }

  fighterA = new Fighter(80, '#3b82f6', true, props.population[idxA]); // Blue
  fighterA.direction = 1;

  fighterB = new Fighter(GAME_WIDTH - 130, '#ef4444', true, props.population[idxB]); // Red
  fighterB.direction = -1;

  matchTimer = 300; // 5 seconds simulation
};

const getAIInput = (fighter: Fighter, opponent: Fighter): InputState => {
  if (!fighter.genome?.network) return { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };

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

  if (!fighterA || !fighterB) {
    resetMatch();
  }

  if (fighterA && fighterB && isVisible.value) {
     // Get AI decisions
    const inputA = getAIInput(fighterA, fighterB);
    const inputB = getAIInput(fighterB, fighterA);

    // Update fighters
    fighterA.update(inputA, fighterB);
    fighterB.update(inputB, fighterA);

    // Check hits
    fighterA.checkHit(fighterB);
    fighterB.checkHit(fighterA);

    // Collision push-apart
    const p1 = fighterA;
    const p2 = fighterB;
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
    if (matchTimer <= 0 || fighterA.health <= 0 || fighterB.health <= 0) {
      resetMatch();
    }
  }

  renderBackground(ctx);

  if (fighterA && fighterB) {
    ctx.save();
    ctx.scale(SCALE, SCALE);
    
    renderStickman(ctx, fighterA, frameCount);
    renderStickman(ctx, fighterB, frameCount);
    
    ctx.restore();
  }

  animationFrameId = requestAnimationFrame(render);
};

onMounted(() => {
  isRunning = true;
  render();
});

onUnmounted(() => {
  isRunning = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
});

watch(() => props.settings.isRunning, (running) => {
  if (running && !fighterA) {
    resetMatch();
  }
});
</script>
