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
 * NEURAL NETWORK VISUALIZER - Dynamic Architecture Support
 * =============================================================================
 *
 * Hybrid approach:
 * - Static: Canvas element managed by Vue
 * - Dynamic: Weights/activations rendered via direct canvas API (no reactivity)
 *
 * Supports 1-5 hidden layers with variable neuron counts.
 * Automatically adapts to the network's actual architecture.
 */

import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { Fighter } from '~/services/GameEngine';
import { NN_ARCH } from '~/services/Config';
import type { NeuralNetworkData } from '~/types';

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
  width: 800,
  height: 250,
  className: ''
});

const canvasRef = ref<HTMLCanvasElement | null>(null);

// Static labels (don't change during runtime)
const INPUT_LABELS = ['Dist X', 'Dist Y', 'My HP', 'Op HP', 'Op Act', 'My En', 'Face', 'Op CD', 'Op En', 'ΔDist', 'ΔOpHP', 'ΔOpAct'];
const OUTPUT_LABELS = ['Idle', 'Left', 'Right', 'Jump', 'Crouch', 'Punch', 'Kick', 'Block'];
const NODE_RADIUS = 4;
const LEFT_MARGIN = 60;
const RIGHT_MARGIN = 60;

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

const getNodeColor = (value: number, isDark: boolean, layerType: 'input' | 'hidden' | 'output'): string => {
  const brightness = Math.min(1, Math.max(0.2, value));
  
  if (isDark) {
    // Cyan for input/output, purple tint for hidden
    if (layerType === 'hidden') {
      return `rgba(168, 85, 247, ${brightness})`; // Purple
    }
    return `rgba(0, 255, 255, ${brightness})`; // Cyan
  } else {
    // Light mode colors
    if (layerType === 'hidden') {
      return `rgba(147, 51, 234, ${brightness})`; // Purple-600
    }
    return `rgba(14, 116, 144, ${brightness})`; // Cyan-700
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
    ctx.fillStyle = isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.font = '14px Inter, sans-serif';
    const text = 'Waiting for Neural Network...';
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, (width - textWidth) / 2, height / 2);
    animationFrameId = requestAnimationFrame(render);
    return;
  }

  // Get the network (already in flexible format)
  const network: NeuralNetworkData = props.fighter.genome.network;
  const arch = network.architecture;
  
  // Build layer sizes array: [input, ...hidden, output]
  const layerSizes = [arch.inputNodes, ...arch.hiddenLayers, arch.outputNodes];
  const numLayers = layerSizes.length;
  
  const inputs = props.fighter.lastInputs || new Array(NN_ARCH.INPUT_NODES).fill(0);

  // ==========================================================================
  // FORWARD PASS (compute activations for visualization)
  // Store activations for each layer
  // ==========================================================================
  
  const layerActivations: number[][] = [];
  layerActivations.push([...inputs]); // Layer 0 = inputs
  
  // Forward pass through each layer
  for (let layerIdx = 0; layerIdx < network.layerWeights.length; layerIdx++) {
    const weights = network.layerWeights[layerIdx];
    const layerBiases = network.biases[layerIdx];
    const prevActivations = layerActivations[layerIdx];
    
    if (!weights || !layerBiases || !prevActivations) continue;
    
    const isOutputLayer = layerIdx === network.layerWeights.length - 1;
    const toSize = layerBiases.length;
    const nextActivations: number[] = [];
    
    for (let toNode = 0; toNode < toSize; toNode++) {
      let sum = 0;
      
      // Weighted sum of all inputs to this node
      for (let fromNode = 0; fromNode < prevActivations.length; fromNode++) {
        const weight = weights[fromNode]?.[toNode] ?? 0;
        sum += (prevActivations[fromNode] ?? 0) * weight;
      }
      
      // Add bias
      sum += layerBiases[toNode] ?? 0;
      
      // Apply activation function
      if (isOutputLayer) {
        nextActivations.push(sigmoid(sum));
      } else {
        nextActivations.push(relu(sum));
      }
    }
    
    layerActivations.push(nextActivations);
  }

  // ==========================================================================
  // LAYOUT CALCULATIONS - Dynamic for N layers
  // ==========================================================================
  
  const usableWidth = width - LEFT_MARGIN - RIGHT_MARGIN;
  
  // Calculate X positions for each layer
  const layerXPositions: number[] = [];
  for (let i = 0; i < numLayers; i++) {
    if (numLayers === 1) {
      layerXPositions.push(width / 2);
    } else {
      layerXPositions.push(LEFT_MARGIN + (i * usableWidth) / (numLayers - 1));
    }
  }
  
  // Calculate Y step (spacing between nodes) for each layer
  const layerYSteps: number[] = layerSizes.map(size => height / (size + 1));

  // ==========================================================================
  // DRAW CONNECTIONS (screen blend mode for glow effect)
  // ==========================================================================
  
  ctx.globalCompositeOperation = 'screen';

  // Draw connections between each pair of adjacent layers
  for (let layerIdx = 0; layerIdx < numLayers - 1; layerIdx++) {
    const fromSize = layerSizes[layerIdx] ?? 0;
    const toSize = layerSizes[layerIdx + 1] ?? 0;
    const fromX = layerXPositions[layerIdx] ?? 0;
    const toX = layerXPositions[layerIdx + 1] ?? 0;
    const fromStep = layerYSteps[layerIdx] ?? 1;
    const toStep = layerYSteps[layerIdx + 1] ?? 1;
    const fromActivations = layerActivations[layerIdx] ?? [];
    const weights = network.layerWeights[layerIdx];
    
    if (!weights) continue;
    
    for (let f = 0; f < fromSize; f++) {
      const y1 = (f + 1) * fromStep;
      const fromVal = fromActivations[f] ?? 0;
      
      for (let t = 0; t < toSize; t++) {
        const y2 = (t + 1) * toStep;
        const weight = weights[f]?.[t] ?? 0;
        const color = getLineColor(weight, Math.abs(fromVal), isDarkMode.value);

        if (color) {
          ctx.beginPath();
          ctx.moveTo(fromX, y1);
          ctx.lineTo(toX, y2);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
          ctx.stroke();
        }
      }
    }
  }

  ctx.globalCompositeOperation = 'source-over';

  // ==========================================================================
  // DRAW NODES
  // ==========================================================================

  for (let layerIdx = 0; layerIdx < numLayers; layerIdx++) {
    const layerSize = layerSizes[layerIdx] ?? 0;
    const x = layerXPositions[layerIdx] ?? 0;
    const yStep = layerYSteps[layerIdx] ?? 1;
    const activations = layerActivations[layerIdx] ?? [];
    
    const isInputLayer = layerIdx === 0;
    const isOutputLayer = layerIdx === numLayers - 1;
    const layerType: 'input' | 'hidden' | 'output' = isInputLayer ? 'input' : isOutputLayer ? 'output' : 'hidden';
    
    for (let n = 0; n < layerSize; n++) {
      const y = (n + 1) * yStep;
      const val = activations[n] ?? 0;
      
      // Output layer: highlight active nodes
      if (isOutputLayer) {
        const isActive = val > 0.5;
        
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS + (isActive ? 2 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isActive 
          ? (isDarkMode.value ? '#00FFFF' : '#0891b2') 
          : getNodeColor(val, isDarkMode.value, layerType);
        ctx.fill();
        ctx.strokeStyle = isDarkMode.value ? '#333' : '#9ca3af';
        ctx.stroke();

        // Output label
        ctx.textAlign = 'left';
        ctx.fillStyle = isActive 
          ? (isDarkMode.value ? '#FFFFFF' : '#111827') 
          : (isDarkMode.value ? 'rgba(255, 255, 255, 0.5)' : 'rgba(75, 85, 99, 0.7)');
        ctx.font = isActive ? 'bold 10px Inter, monospace' : '10px Inter, monospace';
        ctx.fillText(OUTPUT_LABELS[n] ?? '', x + 10, y);
      }
      // Input layer: show labels
      else if (isInputLayer) {
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = getNodeColor(Math.abs(val), isDarkMode.value, layerType);
        ctx.fill();
        ctx.strokeStyle = isDarkMode.value ? '#333' : '#9ca3af';
        ctx.stroke();

        // Input label
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '10px Inter, monospace';
        ctx.fillStyle = isDarkMode.value ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 65, 81, 0.9)';
        ctx.fillText(INPUT_LABELS[n] ?? '', x - 10, y);
      }
      // Hidden layers: just draw nodes
      else {
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = getNodeColor(val, isDarkMode.value, layerType);
        ctx.fill();
      }
    }
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
