<template>
  <div class="border-t border-slate-700 pt-4">
    <UButton
      @click="showTrainingParams = !showTrainingParams"
      color="neutral"
      variant="ghost"
      class="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest mb-4"
    >
      <span>Training Parameters</span>
      <UIcon :name="showTrainingParams ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
    </UButton>

    <div :class="['space-y-4 transition-all duration-300 overflow-hidden', showTrainingParams ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0']">
      <!-- Speed Slider -->
      <div class="space-y-2">
        <div class="flex justify-between">
          <label class="text-xs font-semibold text-slate-300">Simulation Speed</label>
          <span class="text-xs font-mono text-teal-400">{{ isHumanOpponent ? '1x' : `${settings.simulationSpeed}x` }}</span>
        </div>
        <USlider
          :model-value="isHumanOpponent ? 1 : settings.simulationSpeed"
          :min="1"
          :max="5000"
          :disabled="shouldDisableSpeed"
          @update:model-value="updateSpeed"
        />
        <p v-if="isHumanOpponent" class="text-[10px] text-slate-500 italic">
          Speed locked to 1x for Human opponent
        </p>
      </div>

      <!-- Mutation Rate Slider -->
      <div class="space-y-2">
        <div class="flex justify-between">
          <label class="text-xs font-semibold text-slate-300">Mutation Rate</label>
          <span class="text-xs font-mono text-purple-400">{{ (settings.mutationRate * 100).toFixed(0) }}%</span>
        </div>
        <USlider
          :model-value="settings.mutationRate * 100"
          :min="1"
          :max="100"
          @update:model-value="updateMutationRate"
        />
      </div>

      <!-- Background Training Toggle - Only shown in ARCADE mode -->
      <div v-if="!isTrainingActive" class="pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-300">Background Training</span>
            <span v-if="settings.backgroundTraining" class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Training active in background" />
          </div>
          <USwitch
            :model-value="settings.backgroundTraining"
            @update:model-value="toggleBackgroundTraining"
            color="success"
          />
        </div>
        <p class="text-[10px] text-slate-500 mt-1">
          AI keeps learning while you play Single Matches
        </p>
      </div>

      <!-- Weights Management -->
      <div class="grid grid-cols-2 gap-2 pt-2">
        <UButton
          @click="emit('export-weights')"
          :disabled="bestFitness === 0"
          color="neutral"
          variant="outline"
          size="sm"
          class="flex items-center justify-center gap-1.5"
        >
          <UIcon name="i-heroicons-arrow-down-tray" class="w-3 h-3" />
          EXPORT
        </UButton>
        <UButton
          @click="emit('import-weights')"
          color="neutral"
          variant="outline"
          size="sm"
          class="flex items-center justify-center gap-1.5"
        >
          <UIcon name="i-heroicons-arrow-up-tray" class="w-3 h-3" />
          IMPORT
        </UButton>
      </div>

      <!-- Reset Genome Button -->
      <div class="pt-2">
        <UButton
          @click="emit('reset-genome')"
          color="error"
          variant="solid"
          class="w-full"
          size="sm"
        >
          <UIcon name="i-heroicons-trash" class="w-3 h-3" />
          RESET GENOME
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { TrainingSettings, GameState } from '~/types';

interface Props {
  settings: TrainingSettings;
  setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
  bestFitness: number;
  gameState: GameState;
}

const emit = defineEmits<{
  'export-weights': [];
  'import-weights': [];
  'reset-genome': [];
}>();

const props = defineProps<Props>();

const showTrainingParams = ref(true);
const isTrainingActive = computed(() => props.settings.gameMode === 'TRAINING');
const isHumanOpponent = computed(() => props.settings.player1Type === 'HUMAN');
const shouldDisableSpeed = computed(() => isHumanOpponent.value);

watch(isHumanOpponent, (isHuman) => {
  if (isHuman && props.settings.simulationSpeed !== 1) {
    props.setSettings(prev => ({ ...prev, simulationSpeed: 1 }));
  }
});

const updateSpeed = (value: number | undefined) => {
  if (value !== undefined && !isHumanOpponent.value) {
    props.setSettings({ ...props.settings, simulationSpeed: value });
  }
};

const updateMutationRate = (value: number | undefined) => {
  if (value !== undefined) {
    props.setSettings({ ...props.settings, mutationRate: value / 100 });
  }
};

const toggleBackgroundTraining = () => {
  props.setSettings(s => ({ ...s, backgroundTraining: !s.backgroundTraining }));
};
</script>

