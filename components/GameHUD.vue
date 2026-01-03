<template>
  <div
    v-if="activeMatch"
    class="absolute top-4 left-4 right-4 grid grid-cols-3 gap-2 text-xl font-bold font-mono z-10 drop-shadow-md pointer-events-none"
  >
    <!-- Left Fighter (P1) -->
    <div class="flex flex-col items-start min-w-0">
      <span :class="[leftInfo.color, 'font-bold text-xs tracking-wider animate-pulse truncate max-w-full']">{{ leftInfo.label }}</span>
      <div class="w-28 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
        <div :class="['h-full', leftInfo.bar, 'transition-all duration-75']" :style="{ width: `${gameState.player1Health}%` }" />
      </div>
      <div class="w-28 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
        <div class="h-full bg-amber-400 transition-all duration-75" :style="{ width: `${gameState.player1Energy}%` }" />
      </div>
      <!-- P1 Win/Loss Counter -->
      <div class="flex gap-2 mt-1">
        <span class="text-emerald-400 font-bold text-[10px] tracking-wider">{{ gameState.arcadeStats.p1Wins }}W</span>
        <span class="text-rose-400 font-bold text-[10px] tracking-wider">{{ gameState.arcadeStats.p2Wins }}L</span>
      </div>
    </div>

    <!-- Center Info -->
    <div class="flex flex-col items-center pt-2 min-w-0">
      <template v-if="settings.gameMode === 'TRAINING'">
        <span class="text-slate-500 font-bold text-[10px] tracking-widest uppercase">ROUND {{ currentMatchIndex + 1 }}</span>
        <span class="text-slate-300 font-mono text-sm">{{ gameState.timeRemaining.toFixed(0) }}</span>
        <span class="text-teal-400 font-bold text-[9px] tracking-wider uppercase mt-1 text-center">
          {{ gameState.matchesUntilEvolution }} {{ gameState.matchesUntilEvolution === 1 ? 'MATCH' : 'MATCHES' }} TO EVOLVE
        </span>
      </template>
      <template v-else>
        <span class="text-slate-500 font-bold text-[10px] tracking-widest uppercase">ARCADE</span>
        <span class="text-yellow-400 font-mono text-sm">{{ gameState.timeRemaining.toFixed(0) }}</span>
      </template>
    </div>

    <!-- Right Fighter (P2) -->
    <div class="flex flex-col items-end min-w-0">
      <span :class="[rightInfo.color, 'font-bold text-xs tracking-wider animate-pulse truncate max-w-full']">{{ rightInfo.label }}</span>
      <div class="w-28 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
        <div :class="['h-full', rightInfo.bar, 'transition-all duration-75']" :style="{ width: `${gameState.player2Health}%` }" />
      </div>
      <div class="w-28 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
        <div class="h-full bg-amber-400 transition-all duration-75" :style="{ width: `${gameState.player2Energy}%` }" />
      </div>
      <!-- P2 Win/Loss Counter -->
      <div class="flex gap-2 mt-1">
        <span class="text-emerald-400 font-bold text-[10px] tracking-wider">{{ gameState.arcadeStats.p2Wins }}W</span>
        <span class="text-rose-400 font-bold text-[10px] tracking-wider">{{ gameState.arcadeStats.p1Wins }}L</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Fighter } from '~/services/GameEngine';
import type { GameState, TrainingSettings, GameMode } from '~/types';

interface Props {
  activeMatch: { p1: Fighter; p2: Fighter } | null;
  gameState: GameState;
  settings: TrainingSettings;
  currentMatchIndex: number;
}

const props = defineProps<Props>();

function getFighterInfo(f: Fighter, gameMode: GameMode, generation: number): { label: string; color: string; bar: string } {
  if (f.isCustom) {
    if (f.color === '#a855f7') return { label: 'SCRIPT A', color: 'text-purple-400', bar: 'bg-purple-400' };
    if (f.color === '#14b8a6') return { label: 'SCRIPT B', color: 'text-teal-400', bar: 'bg-teal-400' };
    return { label: 'CUSTOM', color: 'text-purple-400', bar: 'bg-purple-400' };
  }

  if (!f.isAi) {
    return { label: 'HUMAN', color: 'text-green-500', bar: 'bg-green-500' };
  }

  if (gameMode === 'TRAINING') {
    return { label: `GEN ${generation}`, color: 'text-blue-400', bar: 'bg-blue-500' };
  }
  return { label: 'AI', color: 'text-blue-500', bar: 'bg-blue-500' };
}

const leftInfo = computed(() => {
  if (!props.activeMatch) return { label: '', color: '', bar: '' };
  const p1 = props.activeMatch.p1;
  const p2 = props.activeMatch.p2;
  
  let info = getFighterInfo(p1, props.settings.gameMode, props.gameState.generation);
  
  if (props.settings.gameMode === 'TRAINING' && p1.isAi && p2.isAi && !p1.isCustom && !p2.isCustom) {
    info = { label: 'P1', color: 'text-red-500', bar: 'bg-red-500' };
  }
  
  return info;
});

const rightInfo = computed(() => {
  if (!props.activeMatch) return { label: '', color: '', bar: '' };
  const p1 = props.activeMatch.p1;
  const p2 = props.activeMatch.p2;
  
  let info = getFighterInfo(p2, props.settings.gameMode, props.gameState.generation);
  
  if (props.settings.gameMode === 'TRAINING' && p1.isAi && p2.isAi && !p1.isCustom && !p2.isCustom) {
    info = { label: 'P2', color: 'text-blue-500', bar: 'bg-blue-500' };
  }
  
  return info;
});
</script>

