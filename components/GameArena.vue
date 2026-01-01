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
      class="w-full h-[450px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700"
    >
      <span class="text-slate-400 font-mono">Initializing Arena...</span>
    </div>

    <!-- Turbo Training Overlay -->
    <div
      v-if="settings.gameMode === 'TRAINING' && settings.turboTraining && settings.isRunning"
      class="absolute inset-0 flex items-center justify-center bg-slate-900/90 rounded-xl"
    >
      <div class="text-center">
        <div class="text-3xl font-black text-emerald-400 tracking-tight mb-2">TURBO TRAINING</div>
        <div class="text-xl font-mono text-slate-300">Generation {{ gameState.generation }}</div>
        <div class="text-sm font-mono text-slate-400 mt-1">Best Fitness: {{ gameState.bestFitness.toFixed(0) }}</div>
        <div class="mt-4 flex items-center justify-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span class="text-xs text-slate-500 uppercase tracking-wider">Training via Web Workers</span>
        </div>
      </div>
    </div>

    <!-- Game Over Overlays -->
    <div
      v-if="!gameState.matchActive && gameState.roundStatus === 'FIGHTING'"
      class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl"
    >
      <div class="text-center">
        <h2 class="text-5xl font-black text-white italic tracking-tighter mb-2">
          {{ gameState.winner === 'Player 1' ? 'VICTORY' : 'DEFEAT' }}
        </h2>
        <p class="text-slate-400 font-mono">RESTARTING MATCH...</p>
      </div>
    </div>
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

