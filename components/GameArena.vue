<template>
  <div class="relative group">
    <GameHUD
      :active-match="activeMatch"
      :game-state="gameState"
      :settings="settings"
      :current-match-index="currentMatchIndex"
    />

    <GameCanvas
      v-if="activeMatch"
      :player1="activeMatch.p1"
      :player2="activeMatch.p2"
      :is-training="settings.gameMode === 'TRAINING'"
      :round-number="currentMatchIndex"
    />
    <div
      v-else
      class="w-full h-[450px] flex items-center justify-center bg-gray-100 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700"
    >
      <span class="text-gray-500 dark:text-slate-400 font-mono">Initializing Arena...</span>
    </div>

    <!-- Turbo AI vs AI Training Overlay -->
    <div
      v-if="settings.gameMode === 'TRAINING' && settings.turboTraining && settings.isRunning"
      class="absolute inset-0 flex items-center justify-center bg-gray-100/90 dark:bg-slate-900/90 rounded-xl"
    >
      <div class="text-center">
        <div class="text-3xl font-black text-emerald-500 dark:text-emerald-400 tracking-tight mb-2">TURBO AI vs AI</div>
        <div class="text-xl font-mono text-gray-700 dark:text-slate-300">Generation {{ gameState.generation }}</div>
        <div class="text-sm font-mono text-gray-500 dark:text-slate-400 mt-1">Best Fitness: {{ gameState.bestFitness.toFixed(0) }}</div>
        <div class="mt-4 flex items-center justify-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span class="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider">Training via Web Workers</span>
        </div>
      </div>
    </div>



    <!-- Countdown Overlay (3, 2, 1, FIGHT!) -->
    <Transition name="countdown">
      <div
        v-if="gameState.countdownValue !== null"
        class="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      >
        <div 
          class="text-9xl font-black tracking-tight drop-shadow-2xl"
          :class="gameState.countdownValue === 0 ? 'text-orange-500' : 'text-white'"
        >
          {{ gameState.countdownValue === 0 ? 'FIGHT!' : gameState.countdownValue }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Fighter } from '~/services/GameEngine';
import type { GameState, TrainingSettings } from '~/types';

interface Props {
  activeMatch: { p1: Fighter; p2: Fighter; p1GenomeIdx: number; p2GenomeIdx: number } | null;
  gameState: GameState;
  settings: TrainingSettings;
  currentMatchIndex: number;
}

defineProps<Props>();
</script>

