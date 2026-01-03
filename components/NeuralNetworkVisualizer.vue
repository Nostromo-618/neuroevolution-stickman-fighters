<template>
  <div :class="[
    'backdrop-blur-sm border rounded-lg p-4 shadow-2xl relative',
    isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/90 border-gray-200',
    className
  ]">
    <div class="absolute top-2 left-0 right-0 text-center pointer-events-none">
      <span :class="['text-xs uppercase tracking-[0.2em] font-bold', isDarkMode ? 'text-white/30' : 'text-gray-400']">Neural Network Architecture</span>
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
 * - Simple AI: 9 → 13 → 13 → 8
 * - Chuck AI:  9 → 32 → 32 → 8
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { Fighter } from '~/services/GameEngine';
import { NN_ARCH } from '~/services/Config';

// Get color mode
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

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

const getNodeColor = (value: number, isDark: boolean): string => {
  const brightness = Math.min(1, Math.max(0.2, value));
  if (isDark) {
    return `rgba(0, 255, 255, ${brightness})`;
  } else {
    // Blue-ish color for light mode for better visibility
    return `rgba(14, 116, 144, ${brightness})`;
  }
};

const getLineColor = (weight: number, activation: number, isDark: boolean): string => {
  const strength = Math.abs(weight) * activation;
  const opacity = Math.min(1, Math.pow(strength, 1.5) * 0.8);
  if (opacity < 0.02) return '';
  if (isDark) {
    return weight > 0
      ? `rgba(0, 240, 255, ${opacity})`
      : `rgba(255, 40, 40, ${opacity})`;
  } else {
    // Darker colors for light mode
    return weight > 0
      ? `rgba(6, 182, 212, ${opacity * 1.2})`
      : `rgba(220, 38, 38, ${opacity * 1.2})`;
  }
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
  const hiddenWeights = network.hiddenWeights;
  const outputWeights = network.outputWeights;
  const biases = network.biases;
  
  // H1 Size = columns in inputWeights (Input -> H1)
  const hidden1Size = inputWeights[0]?.length ?? NN_ARCH.HIDDEN_NODES;
  // H2 Size = rows in outputWeights (H2 -> Output)
  // Or columns in hiddenWeights if it exists
  const hidden2Size = outputWeights.length ?? NN_ARCH.HIDDEN_NODES; 
  // Output Size = columns in outputWeights
  const outputNodes = outputWeights[0]?.length ?? NN_ARCH.OUTPUT_NODES;

  // Use fallback if hiddenWeights is missing (e.g. old structure momentarily)
  // But we enforce structure now, so we assume hiddenWeights exists.
  
  // ==========================================================================
  // FORWARD PASS (compute activations for visualization)
  // ==========================================================================
  
  const hidden1Outputs: number[] = new Array(hidden1Size);
  const hidden2Outputs: number[] = new Array(hidden2Size);
  const finalOutputs: number[] = new Array(outputNodes);

  // Input -> H1
  for (let h = 0; h < hidden1Size; h++) {
    let sum = 0;
    for (let i = 0; i < inputs.length; i++) {
      const inputVal = inputs[i] ?? 0;
      const weight = inputWeights[i]?.[h] ?? 0;
      sum += inputVal * weight;
    }
    sum += biases[h] ?? 0;
    hidden1Outputs[h] = relu(sum);
  }

  // H1 -> H2
  for (let h2 = 0; h2 < hidden2Size; h2++) {
    let sum = 0;
    for (let h1 = 0; h1 < hidden1Size; h1++) {
      const h1Val = hidden1Outputs[h1] ?? 0;
      const weight = hiddenWeights?.[h1]?.[h2] ?? 0;
      sum += h1Val * weight;
    }
    sum += biases[hidden1Size + h2] ?? 0;
    hidden2Outputs[h2] = relu(sum);
  }

  // H2 -> Output
  for (let o = 0; o < outputNodes; o++) {
    let sum = 0;
    for (let h = 0; h < hidden2Size; h++) {
      const h2Val = hidden2Outputs[h] ?? 0;
      const weight = outputWeights[h]?.[o] ?? 0;
      sum += h2Val * weight;
    }
    sum += biases[hidden1Size + hidden2Size + o] ?? 0;
    finalOutputs[o] = sigmoid(sum);
  }

  // ==========================================================================
  // LAYOUT CALCULATIONS
  // ==========================================================================
  
  const inputX = 60;
  const hidden1X = width * 0.4;
  const hidden2X = width * 0.7;
  const outputX = width - 60;

  const inputStep = height / (inputs.length + 1);
  const hidden1Step = height / (hidden1Size + 1);
  const hidden2Step = height / (hidden2Size + 1);
  const outputStep = height / (outputNodes + 1);

  // ==========================================================================
  // DRAW CONNECTIONS (screen blend mode for glow effect)
  // ==========================================================================
  
  ctx.globalCompositeOperation = 'screen';

  // Input → H1
  for (let i = 0; i < inputs.length; i++) {
    const y1 = (i + 1) * inputStep;
    const inputVal = inputs[i] ?? 0;
    
    for (let h = 0; h < hidden1Size; h++) {
      const y2 = (h + 1) * hidden1Step;
      const weight = inputWeights[i]?.[h] ?? 0;
      const color = getLineColor(weight, Math.abs(inputVal), isDarkMode.value);

      if (color) {
        ctx.beginPath();
        ctx.moveTo(inputX, y1);
        ctx.lineTo(hidden1X, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
        ctx.stroke();
      }
    }
  }

  // H1 → H2
  for (let h1 = 0; h1 < hidden1Size; h1++) {
    const y1 = (h1 + 1) * hidden1Step;
    const h1Val = hidden1Outputs[h1] ?? 0;
    
    for (let h2 = 0; h2 < hidden2Size; h2++) {
      const y2 = (h2 + 1) * hidden2Step;
      const weight = hiddenWeights?.[h1]?.[h2] ?? 0;
      const color = getLineColor(weight, h1Val, isDarkMode.value);

      if (color) {
        ctx.beginPath();
        ctx.moveTo(hidden1X, y1);
        ctx.lineTo(hidden2X, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
        ctx.stroke();
      }
    }
  }

  // H2 → Output
  for (let h2 = 0; h2 < hidden2Size; h2++) {
    const y1 = (h2 + 1) * hidden2Step;
    const h2Val = hidden2Outputs[h2] ?? 0;
    
    for (let o = 0; o < outputNodes; o++) {
      const y2 = (o + 1) * outputStep;
      const weight = outputWeights[h2]?.[o] ?? 0;
      const color = getLineColor(weight, h2Val, isDarkMode.value);

      if (color) {
        ctx.beginPath();
        ctx.moveTo(hidden2X, y1);
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
    ctx.fillStyle = getNodeColor(Math.abs(inputVal), isDarkMode.value);
    ctx.fill();
    ctx.strokeStyle = isDarkMode.value ? '#333' : '#9ca3af';
    ctx.stroke();

    ctx.fillStyle = isDarkMode.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 65, 81, 0.9)';
    ctx.fillText(INPUT_LABELS[i] ?? '', inputX - 10, y);
  }

  // Hidden 1 nodes
  for (let h = 0; h < hidden1Size; h++) {
    const y = (h + 1) * hidden1Step;
    const val = hidden1Outputs[h] ?? 0;

    ctx.beginPath();
    ctx.arc(hidden1X, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = getNodeColor(val, isDarkMode.value);
    ctx.fill();
  }

  // Hidden 2 nodes
  for (let h = 0; h < hidden2Size; h++) {
    const y = (h + 1) * hidden2Step;
    const val = hidden2Outputs[h] ?? 0;

    ctx.beginPath();
    ctx.arc(hidden2X, y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = getNodeColor(val, isDarkMode.value);
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
    ctx.fillStyle = isActive ? (isDarkMode.value ? '#00FFFF' : '#0891b2') : getNodeColor(outputVal, isDarkMode.value);
    ctx.fill();
    ctx.strokeStyle = isDarkMode.value ? '#333' : '#9ca3af';
    ctx.stroke();

    ctx.fillStyle = isActive ? (isDarkMode.value ? '#FFFFFF' : '#111827') : (isDarkMode.value ? 'rgba(255, 255, 255, 0.5)' : 'rgba(75, 85, 99, 0.7)');
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
