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
import { ref, watchEffect, onUnmounted } from 'vue';
import type { Fighter } from '~/services/GameEngine';
import { HIDDEN_NODES, OUTPUT_NODES, relu, sigmoid } from '~/services/NeuralNetwork';

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

const INPUT_LABELS = ['Dist X', 'Dist Y', 'My HP', 'Op HP', 'Op Act', 'My En', 'Face', 'Op CD', 'Op En'];
const OUTPUT_LABELS = ['Idle', 'Left', 'Right', 'Jump', 'Crouch', 'Punch', 'Kick', 'Block'];
const NODE_RADIUS = 4;

let animationFrameId: number | null = null;

const getNodeColor = (value: number) => {
  const brightness = Math.min(1, Math.max(0.2, value));
  return `rgba(0, 255, 255, ${brightness})`;
};

const getLineColor = (weight: number, activation: number) => {
  const strength = Math.abs(weight) * activation;
  const opacity = Math.min(1, Math.pow(strength, 1.5) * 0.8);
  if (opacity < 0.02) return 'transparent';
  return weight > 0
    ? `rgba(0, 240, 255, ${opacity})`
    : `rgba(255, 40, 40, ${opacity})`;
};

watchEffect(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const render = () => {
    const width = props.width ?? 600;
    const height = props.height ?? 200;
    ctx.clearRect(0, 0, width, height);

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
    const inputs = props.fighter.lastInputs || new Array(9).fill(0);

    let hiddenOutputs: number[] = [];
    let finalOutputs: number[] = [];

    const inputWeights = network.inputWeights;
    const outputWeights = network.outputWeights;
    const netInstance = network as any;

    if (typeof netInstance.getActivations === 'function') {
      const activations = netInstance.getActivations(inputs);
      hiddenOutputs = activations.hidden;
      finalOutputs = activations.output;
    } else {
      const biases = network.biases;

      for (let h = 0; h < HIDDEN_NODES; h++) {
        let sum = 0;
        for (let i = 0; i < inputs.length; i++) {
          const inputVal = inputs[i];
          const weight = inputWeights[i]?.[h];
          if (inputVal !== undefined && weight !== undefined) {
            sum += inputVal * weight;
          }
        }
        const bias = biases[h];
        if (bias !== undefined) {
          sum += bias;
        }
        hiddenOutputs.push(relu(sum));
      }

      for (let o = 0; o < OUTPUT_NODES; o++) {
        let sum = 0;
        for (let h = 0; h < HIDDEN_NODES; h++) {
          const hiddenVal = hiddenOutputs[h];
          const weight = outputWeights[h]?.[o];
          if (hiddenVal !== undefined && weight !== undefined) {
            sum += hiddenVal * weight;
          }
        }
        const bias = biases[HIDDEN_NODES + o];
        if (bias !== undefined) {
          sum += bias;
        }
        finalOutputs.push(sigmoid(sum));
      }
    }

    const inputX = 60;
    const hiddenX = width / 2;
    const outputX = width - 60;

    const inputStep = height / (inputs.length + 1);
    const hiddenStep = height / (HIDDEN_NODES + 1);
    const outputStep = height / (OUTPUT_NODES + 1);

    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < inputs.length; i++) {
      const y1 = (i + 1) * inputStep;
      for (let h = 0; h < HIDDEN_NODES; h++) {
        const y2 = (h + 1) * hiddenStep;
        const weight = inputWeights[i]?.[h] ?? 0;
        const inputVal = inputs[i] ?? 0;
        const color = getLineColor(weight, Math.abs(inputVal));

        if (color !== 'transparent') {
          ctx.beginPath();
          ctx.moveTo(inputX, y1);
          ctx.lineTo(hiddenX, y2);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(0.1, Math.abs(weight) * 0.5);
          ctx.stroke();
        }
      }
    }

    for (let h = 0; h < HIDDEN_NODES; h++) {
      const y1 = (h + 1) * hiddenStep;
      for (let o = 0; o < OUTPUT_NODES; o++) {
        const y2 = (o + 1) * outputStep;
        const weight = outputWeights[h]?.[o] ?? 0;
        const hiddenVal = hiddenOutputs[h] ?? 0;
        const color = getLineColor(weight, hiddenVal);

        if (color !== 'transparent') {
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

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '10px Inter, monospace';

    for (let i = 0; i < inputs.length; i++) {
      const y = (i + 1) * inputStep;

      ctx.beginPath();
      ctx.arc(inputX, y, NODE_RADIUS, 0, Math.PI * 2);
      const inputVal = inputs[i] ?? 0;
      ctx.fillStyle = getNodeColor(Math.abs(inputVal));
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      const label = INPUT_LABELS[i] ?? '';
      ctx.fillText(label, inputX - 10, y);
    }

    for (let h = 0; h < HIDDEN_NODES; h++) {
      const y = (h + 1) * hiddenStep;

      ctx.beginPath();
      ctx.arc(hiddenX, y, NODE_RADIUS, 0, Math.PI * 2);
      const hiddenVal = hiddenOutputs[h] ?? 0;
      ctx.fillStyle = getNodeColor(hiddenVal);
      ctx.fill();
    }

    ctx.textAlign = 'left';

    for (let o = 0; o < OUTPUT_NODES; o++) {
      const y = (o + 1) * outputStep;

      const outputVal = finalOutputs[o] ?? 0;
      ctx.beginPath();
      ctx.arc(outputX, y, NODE_RADIUS + (outputVal > 0.5 ? 2 : 0), 0, Math.PI * 2);
      ctx.fillStyle = outputVal > 0.5 ? '#00FFFF' : getNodeColor(outputVal);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();

      ctx.fillStyle = outputVal > 0.5 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
      ctx.font = outputVal > 0.5 ? 'bold 10px Inter, monospace' : '10px Inter, monospace';
      const outputLabel = OUTPUT_LABELS[o] ?? '';
      ctx.fillText(outputLabel, outputX + 10, y);
    }

    animationFrameId = requestAnimationFrame(render);
  };

  render();
});

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

