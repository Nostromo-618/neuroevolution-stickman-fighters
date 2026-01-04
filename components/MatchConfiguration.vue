<template>
  <div class="space-y-4">
    <!-- Mode Toggle Buttons -->
    <div class="flex gap-2 bg-gray-100 dark:bg-slate-900/50 p-2 rounded-lg border border-gray-200 dark:border-slate-700/50">
      <UButton
        :color="!isTrainingActive ? 'success' : 'neutral'"
        :variant="!isTrainingActive ? 'solid' : 'outline'"
        size="xs"
        class="flex-1 font-bold text-xs"
        @click="setArcadeMode"
      >
        ARCADE
      </UButton>
      <UButton
        :color="isTrainingActive ? 'success' : 'neutral'"
        :variant="isTrainingActive ? 'solid' : 'outline'"
        size="xs"
        class="flex-1 font-bold text-xs"
        @click="setTrainingMode"
      >
        TRAINING
      </UButton>
    </div>

    <!-- ACTION BUTTONS (Start/Reset) - Directly below mode buttons -->
    <div class="grid grid-cols-2 gap-2">
      <UButton
        :color="isRunning ? 'warning' : 'success'"
        @click="onToggleRunning"
        class="flex items-center justify-center gap-2"
      >
        <UIcon :name="isRunning ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-4 h-4" />
        {{ startButtonText }}
      </UButton>
      <UButton
        color="neutral"
        variant="outline"
        @click="onResetMatch"
      >
        RESET MATCH
      </UButton>
    </div>

    <div :class="['grid gap-4', isTrainingActive ? 'grid-cols-1' : 'grid-cols-2']">
      <!-- Player 1 Selector -->
      <div class="space-y-1">
        <h2 class="text-[10px] font-bold text-red-400 uppercase tracking-widest flex justify-between">
          <span>Player 1 (Left)</span>
          <span v-if="settings.player1Type !== 'HUMAN'" class="text-[8px] bg-red-900/50 px-1 rounded text-red-200">AUTO</span>
        </h2>
        <div :class="['flex flex-col gap-1 p-1 rounded-lg', !canChangeSettings ? 'bg-gray-100 dark:bg-slate-900/50 opacity-50' : 'bg-gray-100 dark:bg-slate-900']">
          <UButton
            v-for="type in currentPlayer1Types"
            :key="type"
            :color="settings.player1Type === type ? 'success' : 'neutral'"
            :variant="settings.player1Type === type ? 'solid' : 'outline'"
            size="xs"
            :disabled="!canChangeSettings"
            @click="canChangeSettings && setPlayer1Type(type)"
            class="text-[10px] font-bold"
          >
            {{ getPlayerTypeLabel(type) }}
          </UButton>
        </div>
      </div>

      <!-- Player 2 Selector - Only shown in ARCADE mode -->
      <div v-if="!isTrainingActive" class="space-y-1">
        <h2 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex justify-between">
          <span>Player 2 (Right)</span>
          <span class="text-[8px] bg-blue-900/50 px-1 rounded text-blue-200">AUTO</span>
        </h2>
        <div :class="['flex flex-col gap-1 p-1 rounded-lg', !canChangeSettings ? 'bg-gray-100 dark:bg-slate-900/50 opacity-50' : 'bg-gray-100 dark:bg-slate-900']">
          <UButton
            v-for="type in currentPlayer2Types"
            :key="type"
            :color="settings.player2Type === type ? 'success' : 'neutral'"
            :variant="settings.player2Type === type ? 'solid' : 'outline'"
            size="xs"
            :disabled="!canChangeSettings"
            @click="canChangeSettings && setPlayer2Type(type)"
            class="text-[10px] font-bold"
          >
            {{ getPlayerTypeLabel(type) }}
          </UButton>
        </div>
      </div>

      <!-- Player 2 Info - Only shown in TRAINING mode -->
      <div v-if="isTrainingActive" class="space-y-1">
        <h2 class="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex justify-between">
          <span>Player 2 (Right)</span>
          <span class="text-[8px] bg-blue-900/50 px-1 rounded text-blue-200">AI</span>
        </h2>
        <div class="flex flex-col gap-1 bg-gray-100 dark:bg-slate-900/50 p-1 rounded-lg border border-gray-200 dark:border-slate-700">
          <div class="py-1.5 rounded-md text-[10px] font-bold text-gray-500 dark:text-slate-500 text-center">
            Always AI (Training)
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Script Button -->
    <UButton
      @click="onOpenScriptEditor"
      color="secondary"
      variant="solid"
      class="w-full"
      size="sm"
    >
      <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
      Open Script Editor
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TrainingSettings, GameState } from '~/types';

interface Props {
  settings: TrainingSettings;
  setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
  gameState: GameState;
  onOpenScriptEditor: () => void;
  onToggleRunning: () => void;
  onResetMatch: () => void;
  isRunning: boolean;
}

const props = defineProps<Props>();

const isTrainingActive = computed(() => props.settings.gameMode === 'TRAINING');

/**
 * Stability Rule 5: Explicit state guards
 * Allow opponent changes ONLY in pristine state (fresh load or after reset).
 * 
 * Pristine state checked by THREE conditions (ALL must be true):
 * 1. matchesPlayed === 0 (no completed matches yet)
 * 2. !isRunning (not currently playing)
 * 3. roundStatus === 'WAITING' (in initial/reset state, not mid-match)
 * 
 * This ensures:
 * - Fresh load: matchesPlayed=0, !isRunning, WAITING ✅
 * - After Reset: matchesPlayed=0, !isRunning, WAITING ✅
 * - Running: isRunning=true ❌ (blocked by condition 2)
 * - Paused mid-match: roundStatus='FIGHTING' ❌ (blocked by condition 3)
 */
const canChangeSettings = computed(() => {
  return (
    props.gameState.arcadeStats.matchesPlayed === 0 &&
    !props.isRunning &&
    props.gameState.roundStatus === 'WAITING'
  );
});

// Button text: START (never started) -> PAUSE (running) -> RESUME (paused after start)
const startButtonText = computed(() => {
  if (props.isRunning) return 'PAUSE';
  // If roundStatus is WAITING, the match hasn't started yet
  if (props.gameState.roundStatus === 'WAITING') {
    return isTrainingActive.value ? 'START TRAINING' : 'START MATCH';
  }
  // Match was started and is now paused
  return 'RESUME';
});

// Arcade mode: Player 1 can be Human or AI
// Training mode: No Human
const arcadePlayer1Types = ['HUMAN', 'SIMPLE_AI', 'CUSTOM_A', 'CUSTOM_B'] as const;
const trainingPlayer1Types = ['SIMPLE_AI', 'CUSTOM_A', 'CUSTOM_B'] as const;
const arcadePlayer2Types = ['SIMPLE_AI', 'CUSTOM_A', 'CUSTOM_B'] as const;
const trainingPlayer2Types = ['SIMPLE_AI', 'CUSTOM_A', 'CUSTOM_B'] as const;

// Use computed to dynamically select available types based on mode
const currentPlayer1Types = computed(() => 
  isTrainingActive.value ? trainingPlayer1Types : arcadePlayer1Types
);
const currentPlayer2Types = computed(() => 
  isTrainingActive.value ? trainingPlayer2Types : arcadePlayer2Types
);

const hasCustomScript = computed(() => {
  return props.settings.player1Type.includes('CUSTOM') || 
         props.settings.player2Type.includes('CUSTOM') || 
         props.settings.opponentType.includes('CUSTOM');
});

const setArcadeMode = () => {
  if (props.settings.gameMode === 'ARCADE') return;
  props.setSettings(prev => ({
    ...prev,
    gameMode: 'ARCADE',
    isRunning: false
  }));
};

const setTrainingMode = () => {
  if (props.settings.gameMode === 'TRAINING') return;
  props.setSettings(prev => ({
    ...prev,
    gameMode: 'TRAINING',
    isRunning: false,
    player1Type: prev.player1Type === 'HUMAN' ? 'SIMPLE_AI' : prev.player1Type,
    player2Type: 'SIMPLE_AI'
  }));
};

const setPlayer1Type = (type: (typeof arcadePlayer1Types)[number] | (typeof trainingPlayer1Types)[number]) => {
  props.setSettings(s => ({
    ...s,
    player1Type: type,
    // Auto-disable turbo when Script is selected (workers only support AI vs AI)
    ...(type.includes('CUSTOM') && { turboTraining: false }),
    ...(type === 'HUMAN' && { simulationSpeed: 1 })
  }));
};

const setPlayer2Type = (type: (typeof arcadePlayer2Types)[number] | (typeof trainingPlayer2Types)[number]) => {
  props.setSettings(s => ({
    ...s,
    player2Type: type,
    // Auto-enable background training when Simple AI is selected
    ...(type === 'SIMPLE_AI' && { backgroundTraining: true }),
    // Auto-disable background training when Script is selected (workers only support AI vs AI)
    ...(type.includes('CUSTOM') && { backgroundTraining: false })
  }));
};

/** Get human-readable label for player type */
const getPlayerTypeLabel = (type: string): string => {
  switch (type) {
    case 'HUMAN': return 'HUMAN';
    case 'SIMPLE_AI': return 'SIMPLE AI';
    case 'CUSTOM_A': return 'SCRIPT A';
    case 'CUSTOM_B': return 'SCRIPT B';
    default: return type;
  }
};
</script>

