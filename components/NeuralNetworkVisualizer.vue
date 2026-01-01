<template>
  <div :class="['bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-4 shadow-2xl relative', className]">
    <div class="absolute top-2 left-0 right-0 text-center pointer-events-none">
      <span class="text-xs text-white/30 uppercase tracking-[0.2em] font-bold">Neural Network Architecture</span>
    </div>
    <canvas
      ref="canvasRef"
      :width="width"
      :height="height"
      class="block w-full h-auto"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * =============================================================================
 * NEURAL NETWORK VISUALIZER - Optimized for 60FPS
 * =============================================================================
 * 
 * Hybrid approach:
 * - Static: Canvas element managed by Vue
 * - Dynamic: Weights/activations rendered via direct canvas API (no reactivity)
 * 
 * Supports variable architectures:
 * - Simple AI: 9 → 13 → 8
 * - Chuck AI:  9 → 64 → 8
 */

import { ref, onMounted, onUnmounted } from 'vue';
import type { Fighter } from '~/services/GameEngine';
import { NN_ARCH } from '~/services/Config';

interface Props {
  fighter: Fighter | null;
  width?: number;
  height?: number;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 600,
  height: 200,
  className: ''
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Static labels (don't change during runtime)
const INPUT_LABELS = ['Dist X', 'Dist Y', 'My HP', 'Op HP', 'Op Act', 'My En', 'Face', 'Op CD', 'Op En'];
const OUTPUT_LABELS = ['Idle', 'Left', 'Right', 'Jump', 'Crouch', 'Punch', 'Kick', 'Block'];
const NODE_RADIUS = 4;

let animationFrameId: number | null = null;
let isRunning = false;

// =============================================================================
// ACTIVATION FUNCTIONS (inlined for performance)
// =============================================================================

const relu = (x: number): number => Math.max(0, x);
const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));

// =============================================================================
// COLOR HELPERS
// =============================================================================

const getNodeColor = (value: number): string => {
  const brightness = Math.min(1, Math.max(0.2, value));
  return `rgba(0, 255, 255, ${brightness})`;
};

const getLineColor = (weight: number, activation: number): string => {
  const strength = Math.abs(weight) * activation;
  const opacity = Math.min(1, Math.pow(strength, 1.5) * 0.8);
  if (opacity < 0.02) return '';
  return weight > 0
    ? `rgba(0, 240, 255, ${opacity})`
    : `rgba(255, 40, 40, ${opacity})`;
};

// =============================================================================
// RENDER LOOP (Direct DOM, no Vue reactivity)
// =============================================================================

const render = (): void => {
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

  const width = props.width;
  const height = props.height;
  ctx.clearRect(0, 0, width, height);

  // No fighter - show waiting message
  if (!props.fighter || !props.fighter.genome) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.font = '14px Inter, sans-serif';
    const text = 'Waiting for Neural Network...';
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, (width - textWidth) / 2, height / 2);
    animationFrameId = requestAnimationFrame(render);
    return;
  }

  const network = props.fighter.genome.network;
  const inputs = props.fighter.lastInputs || new Array(NN_ARCH.INPUT_NODES).fill(0);

  // Dynamically detect hidden layer size from network structure
  const inputWeights = network.inputWeights;
  const outputWeights = network.outputWeights;
  const biases = network.biases;
  
  // Hidden nodes = number of columns in inputWeights[0] or rows in outputWeights
  const hiddenNodes = inputWeights[0]?.length ?? NN_ARCH.HIDDEN_NODES;
  const outputNodes = outputWeights[0]?.length ?? NN_ARCH.OUTPUT_NODES;

  // ==========================================================================
  // FORWARD PASS (compute activations for visualization)
  // ==========================================================================
  
  const hiddenOutputs: number[] = new Array(hiddenNodes);
  const finalOutputs: number[] = new Array(outputNodes);

  // Hidden layer
  for (let h = 0; h < hiddenNodes; h++) {
    let sum = 0;
    for (let i = 0; i < inputs.length; i++) {
      const inputVal = inputs[i] ?? 0;
      const weight = inputWeights[i]?.[h] ?? 0;
      sum += inputVal * weight;
    }
    sum += biases[h] ?? 0;
    hiddenOutputs[h] = relu(sum);
  }

  // Output layer
  for (let o = 0; o < outputNodes; o++) {
    let sum = 0;
    for (let h = 0; h < hiddenNodes; h++) {
      const hiddenVal = hiddenOutputs[h] ?? 0;
      const weight = outputWeights[h]?.[o] ?? 0;
      sum += hiddenVal * weight;
    }
    sum += biases[hiddenNodes + o] ?? 0;
    finalOutputs[o] = sigmoid(sum);
  }

  // ==========================================================================
  // LAYOUT CALCULATIONS
  // ==========================================================================
  
  const inputX = 60;
  const hiddenX = width / 2;
  const outputX = width - 60;

  const inputStep = height / (inputs.length + 1);
  const hiddenStep = height / (hiddenNodes + 1);
  const outputStep = height / (outputNodes + 1);

  // ==========================================================================
  // DRAW CONNECTIONS (screen blend mode for glow effect)
  // ==========================================================================
  
  ctx.globalCompositeOperation = 'screen';

  // Input → Hidden connections
  for (let i = 0; i < inputs.length; i++) {
    const y1 = (i + 1) * inputStep;
    const inputVal = inputs[i] ?? 0;
    
    for (let h = 0; h < hiddenNodes; h++) {
      const y2 = (h + 1) * hiddenStep;
      const weight = inputWeights[i]?.[h] ?? 0;
      const color = getLineColor(weight, Math.abs(inputVal));

      if (color) {
        ctx.beginPath();
        ctx.moveTo(inputX, y1);
        ctx.lineTo(hiddenX, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
        ctx.stroke();
      }
    }
  }

  // Hidden → Output connections
  for (let h = 0; h < hiddenNodes; h++) {
    const y1 = (h + 1) * hiddenStep;
    const hiddenVal = hiddenOutputs[h] ?? 0;
    
    for (let o = 0; o < outputNodes; o++) {
      const y2 = (o + 1) * outputStep;
      const weight = outputWeights[h]?.[o] ?? 0;
      const color = getLineColor(weight, hiddenVal);

      if (color) {
        ctx.beginPath();
        ctx.moveTo(hiddenX, y1);
        ctx.lineTo(outputX, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
        ctx.stroke();
      }
    }
  }

  ctx.globalCompositeOperation = 'source-over';

  // ==========================================================================
  // DRAW NODES
  // ==========================================================================

  // Input nodes with labels
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '10px Inter, monospace';

  for (let i = 0; i < inputs.length; i++) {
    const y = (i + 1) * inputStep;
    const inputVal = inputs[i] ?? 0;

    ctx.beginPath();
    ctx.arc(inputX, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = getNodeColor(Math.abs(inputVal));
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(INPUT_LABELS[i] ?? '', inputX - 10, y);
  }

  // Hidden nodes (no labels - too many)
  for (let h = 0; h < hiddenNodes; h++) {
    const y = (h + 1) * hiddenStep;
    const hiddenVal = hiddenOutputs[h] ?? 0;

    ctx.beginPath();
    ctx.arc(hiddenX, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = getNodeColor(hiddenVal);
    ctx.fill();
  }

  // Output nodes with labels (highlight active outputs)
  ctx.textAlign = 'left';

  for (let o = 0; o < outputNodes; o++) {
    const y = (o + 1) * outputStep;
    const outputVal = finalOutputs[o] ?? 0;
    const isActive = outputVal > 0.5;

    ctx.beginPath();
    ctx.arc(outputX, y, NODE_RADIUS + (isActive ? 2 : 0), 0, Math.PI * 2);
    ctx.fillStyle = isActive ? '#00FFFF' : getNodeColor(outputVal);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();

    ctx.fillStyle = isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
    ctx.font = isActive ? 'bold 10px Inter, monospace' : '10px Inter, monospace';
    ctx.fillText(OUTPUT_LABELS[o] ?? '', outputX + 10, y);
  }

  // Schedule next frame
  animationFrameId = requestAnimationFrame(render);
};

// =============================================================================
// LIFECYCLE
// =============================================================================

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
</script>
