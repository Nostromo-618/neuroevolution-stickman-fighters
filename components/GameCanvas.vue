<template>
  <canvas
    ref="canvasRef"
    :width="CANVAS_WIDTH"
    :height="CANVAS_HEIGHT"
    :class="[
      'rounded-lg shadow-2xl border-2 w-full max-w-4xl',
      isDarkMode ? 'border-slate-600 bg-black' : 'border-slate-300 bg-white'
    ]"
  />
</template>

<script setup lang="ts">
import { ref, watchEffect, computed } from 'vue';
import { Fighter, CANVAS_WIDTH, CANVAS_HEIGHT } from '~/services/GameEngine';
import { FighterAction } from '~/types';
import { renderBackground } from '~/utils/canvasRendering';
import { renderStickman } from '~/utils/stickmanRenderer';

interface Props {
  player1: Fighter;
  player2: Fighter;
  isTraining?: boolean;
  roundNumber?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isTraining: false,
  roundNumber: 0
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const frameRef = ref(0);

// Get color mode from Nuxt
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

watchEffect(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  frameRef.value++;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  renderBackground(ctx, frameRef.value, isDarkMode.value);

  const swapSides = props.isTraining && props.roundNumber % 2 === 1;

  if (swapSides) {
    renderStickman(ctx, props.player2, frameRef.value);
    renderStickman(ctx, props.player1, frameRef.value);
  } else {
    renderStickman(ctx, props.player1, frameRef.value);
    renderStickman(ctx, props.player2, frameRef.value);
  }

  if ((props.player1.state === FighterAction.PUNCH || props.player1.state === FighterAction.KICK) && props.player1.hitbox) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    const h = props.player1.hitbox;
    ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  if ((props.player2.state === FighterAction.PUNCH || props.player2.state === FighterAction.KICK) && props.player2.hitbox) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    const h = props.player2.hitbox;
    ctx.arc(h.x + h.w / 2, h.y + h.h / 2, 15, 0, Math.PI * 2);
    ctx.fill();
  }
});
</script>


