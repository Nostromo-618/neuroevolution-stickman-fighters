<template>
  <div class="space-y-4">
    <!-- Header & Training Toggle -->
    <div class="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
      <div class="flex items-center gap-2">
        <h2 class="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">
          Match Setup
        </h2>
      </div>

      <!-- Visual Training Toggle -->
      <div class="flex items-center gap-2">
        <span :class="['text-[10px] font-bold', isTrainingActive ? 'text-success' : 'text-muted']">
          {{ isTrainingActive ? 'TRAINING' : 'ARCADE' }}
        </span>
        <USwitch
          :model-value="isTrainingActive"
          @update:model-value="toggleTrainingMode"
          color="success"
        />
      </div>
    </div>

    <div :class="['grid gap-4', isTrainingActive ? 'grid-cols-1' : 'grid-cols-2']">
      <!-- Player 1 Selector -->
      <div class="space-y-1">
        <h2 class="text-[10px] font-bold text-red-400 uppercase tracking-widest flex justify-between">
          <span>Player 1 (Left)</span>
          <span v-if="settings.player1Type !== 'HUMAN'" class="text-[8px] bg-red-900/50 px-1 rounded text-red-200">AUTO</span>
        </h2>
        <div :class="['flex flex-col gap-1 p-1 rounded-lg', isMatchRunning ? 'bg-slate-900/50 opacity-50' : 'bg-slate-900']">
          <UButton
            v-for="type in currentPlayer1Types"
            :key="type"
            :color="settings.player1Type === type ? 'success' : 'neutral'"
            :variant="settings.player1Type === type ? 'solid' : 'outline'"
            size="xs"
            :disabled="isMatchRunning"
            @click="!isMatchRunning && setPlayer1Type(type)"
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
        <div class="flex flex-col gap-1 bg-slate-900 p-1 rounded-lg">
          <UButton
            v-for="type in currentPlayer2Types"
            :key="type"
            :color="settings.player2Type === type ? 'success' : 'neutral'"
            :variant="settings.player2Type === type ? 'solid' : 'outline'"
            size="xs"
            @click="setPlayer2Type(type)"
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
        <div class="flex flex-col gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700">
          <div class="py-1.5 rounded-md text-[10px] font-bold text-slate-500 text-center">
            Always AI (Training)
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Script Button - Always visible -->
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
import { FEATURE_FLAGS } from '~/services/Config';
import type { TrainingSettings, GameState } from '~/types';

interface Props {
  settings: TrainingSettings;
  setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
  gameState: GameState;
  onOpenScriptEditor: () => void;
}

const props = defineProps<Props>();

const isTrainingActive = computed(() => props.settings.gameMode === 'TRAINING');
const isMatchRunning = computed(() => isTrainingActive.value && props.settings.isRunning);

// Arcade mode: Player 1 can be Human or AI (no Chuck - Chuck is opponent only)
// Training mode: No Human, No Chuck (Chuck is ARCADE-exclusive)
const arcadePlayer1Types = ['HUMAN', 'SIMPLE_AI', 'CUSTOM_A', 'CUSTOM_B'] as const;
const trainingPlayer1Types = ['SIMPLE_AI', 'CUSTOM_A', 'CUSTOM_B'] as const;
// Player 2: Chuck only available in ARCADE mode when enabled
const arcadePlayer2Types = FEATURE_FLAGS.ENABLE_CHUCK_AI
    ? ['SIMPLE_AI', 'CHUCK_AI', 'CUSTOM_A', 'CUSTOM_B'] as const
    : ['SIMPLE_AI', 'CUSTOM_A', 'CUSTOM_B'] as const;
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

const toggleTrainingMode = () => {
  const newMode = props.settings.gameMode === 'ARCADE' ? 'TRAINING' : 'ARCADE';
  props.setSettings(prev => ({
    ...prev,
    gameMode: newMode,
    isRunning: false,
    ...(newMode === 'TRAINING' && {
      player1Type: prev.player1Type === 'HUMAN' ? 'SIMPLE_AI' : prev.player1Type,
      player2Type: 'SIMPLE_AI'
    })
  }));
};

const setPlayer1Type = (type: (typeof arcadePlayer1Types)[number] | (typeof trainingPlayer1Types)[number]) => {
  props.setSettings(s => ({
    ...s,
    player1Type: type,
    ...(type === 'HUMAN' && { simulationSpeed: 1 })
  }));
};

const setPlayer2Type = (type: (typeof arcadePlayer2Types)[number] | (typeof trainingPlayer2Types)[number]) => {
  props.setSettings(s => ({ ...s, player2Type: type }));
};

/** Get human-readable label for player type */
const getPlayerTypeLabel = (type: string): string => {
  switch (type) {
    case 'HUMAN': return 'HUMAN';
    case 'SIMPLE_AI': return 'SIMPLE AI';
    case 'CHUCK_AI': return 'CHUCK AI';
    case 'CUSTOM_A': return 'SCRIPT A';
    case 'CUSTOM_B': return 'SCRIPT B';
    default: return type;
  }
};
</script>

