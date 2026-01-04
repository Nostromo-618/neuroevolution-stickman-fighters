<template>
  <div class="border-t border-gray-200 dark:border-slate-700 pt-4">
    <UButton
      @click="showTrainingParams = !showTrainingParams"
      color="neutral"
      variant="ghost"
      class="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest mb-4"
    >
      <span>Training Parameters</span>
      <UIcon :name="showTrainingParams ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="w-4 h-4" />
    </UButton>

    <div :class="['space-y-4 transition-all duration-300 overflow-hidden', showTrainingParams ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0']">
      <!-- Speed Slider - Only shown in TRAINING mode when Turbo is OFF -->
      <div v-if="isTrainingActive && !settings.turboTraining" class="space-y-2">
        <div class="flex justify-between">
          <label class="text-xs font-semibold text-gray-700 dark:text-slate-300">Simulation Speed</label>
          <span class="text-xs font-mono text-teal-400">{{ isHumanOpponent ? '1x' : `${settings.simulationSpeed}x` }}</span>
        </div>
        <USlider
          :model-value="isHumanOpponent ? 1 : settings.simulationSpeed"
          :min="1"
          :max="maxSimulationSpeed"
          :disabled="shouldDisableSpeed"
          @update:model-value="updateSpeed"
        />
        <p v-if="isHumanOpponent" class="text-[10px] text-gray-500 dark:text-slate-500 italic">
          Speed locked to 1x for Human opponent
        </p>
      </div>

      <!-- Intelligent Mutation Toggle - Only shown in TRAINING mode -->
      <div v-if="isTrainingActive" class="pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-700 dark:text-slate-300">Intelligent Mutation</span>
            <span v-if="settings.intelligentMutation" class="w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="Adaptive mutation active" />
          </div>
          <USwitch
            :model-value="settings.intelligentMutation"
            @update:model-value="toggleIntelligentMutation"
            color="secondary"
          />
        </div>
        <p class="text-[10px] text-gray-500 dark:text-slate-500 mt-1">
          {{ settings.intelligentMutation ? 'Mutation auto-adjusts: high initially, decreases over time' : 'Manual mutation rate control' }}
        </p>
      </div>

      <!-- Mutation Rate Slider - Only in TRAINING mode when Intelligent Mutation is OFF -->
      <div v-if="isTrainingActive && !settings.intelligentMutation" class="space-y-2">
        <div class="flex justify-between">
          <label class="text-xs font-semibold text-gray-700 dark:text-slate-300">Mutation Rate</label>
          <span class="text-xs font-mono text-purple-400">{{ (settings.mutationRate * 100).toFixed(0) }}%</span>
        </div>
        <USlider
          :model-value="settings.mutationRate * 100"
          :min="1"
          :max="100"
          @update:model-value="updateMutationRate"
        />
      </div>

      <!-- Background AI vs AI Training Toggle - Only shown in ARCADE mode -->
      <div v-if="!isTrainingActive" class="pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-700 dark:text-slate-300">Background AI vs AI</span>
            <span v-if="settings.backgroundTraining && canUseBackground" class="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Training active in background" />
          </div>
          <USwitch
            :model-value="settings.backgroundTraining"
            :disabled="!canUseBackground"
            @update:model-value="toggleBackgroundTraining"
            color="success"
          />
        </div>
        <p class="text-[10px] text-gray-500 dark:text-slate-500 mt-1">
          {{ !canUseBackground
            ? 'Not available with Custom Scripts (workers only support AI vs AI)'
            : 'AI keeps learning while you play Arcade (uses intelligent mutation)' }}
        </p>
      </div>

      <!-- Turbo AI vs AI Training Toggle - Only shown in TRAINING mode -->
      <div v-if="isTrainingActive" class="pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-700 dark:text-slate-300">Turbo AI vs AI</span>
            <span v-if="settings.turboTraining && settings.isRunning && canUseTurbo" class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Turbo training active" />
          </div>
          <USwitch
            :model-value="settings.turboTraining"
            :disabled="!canUseTurbo"
            @update:model-value="toggleTurboTraining"
            color="success"
          />
        </div>
        <p class="text-[10px] text-gray-500 dark:text-slate-500 mt-1">
          {{ !canUseTurbo
            ? 'Not available with Custom Scripts (workers only support AI vs AI)'
            : 'Parallel workers, no visualization (faster)' }}
        </p>
      </div>

      <!-- Auto-Stop Training Toggle - Only shown in TRAINING mode -->
      <div v-if="isTrainingActive" class="pt-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-gray-700 dark:text-slate-300">Auto-Stop Training</span>
            <span v-if="settings.autoStopEnabled" class="w-2 h-2 bg-amber-500 rounded-full" title="Auto-stop enabled" />
          </div>
          <USwitch
            :model-value="settings.autoStopEnabled"
            @update:model-value="toggleAutoStop"
            color="warning"
          />
        </div>
        <p class="text-[10px] text-gray-500 dark:text-slate-500 mt-1">
          {{ settings.autoStopEnabled ? `Training will stop at Gen ${settings.autoStopGeneration}` : 'Training will run indefinitely' }}
        </p>
      </div>

      <!-- Auto-Stop Generation Limit - Only shown when Auto-Stop is enabled -->
      <div v-if="isTrainingActive && settings.autoStopEnabled" class="space-y-2">
        <div class="flex justify-between">
          <label class="text-xs font-semibold text-gray-700 dark:text-slate-300">Stop At Generation</label>
          <span class="text-xs font-mono text-amber-400">{{ settings.autoStopGeneration }}</span>
        </div>
        <USlider
          :model-value="settings.autoStopGeneration"
          :min="10"
          :max="10000"
          :step="10"
          @update:model-value="updateAutoStopGeneration"
        />
      </div>

      <!-- Worker Threads Slider -->
      <div class="space-y-2">
        <div class="flex justify-between">
          <label class="text-xs font-semibold text-gray-700 dark:text-slate-300">Worker Threads</label>
          <span class="text-xs font-mono text-cyan-400">{{ settings.workerCount }}</span>
        </div>
        <USlider
          :model-value="settings.workerCount"
          :min="1"
          :max="8"
          @update:model-value="updateWorkerCount"
        />
        <p class="text-[10px] text-gray-500 dark:text-slate-500">
          Fewer workers = less CPU usage ({{ maxWorkers }} cores detected)
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

// Check if Custom Script is selected (workers only support AI vs AI)
const hasCustomScriptP1 = computed(() => props.settings.player1Type.includes('CUSTOM'));
const hasCustomScriptP2 = computed(() => props.settings.player2Type.includes('CUSTOM'));
const canUseTurbo = computed(() => !hasCustomScriptP1.value);
const canUseBackground = computed(() => !hasCustomScriptP2.value);

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

const toggleTurboTraining = () => {
  props.setSettings(s => ({ ...s, turboTraining: !s.turboTraining }));
};

const toggleIntelligentMutation = () => {
  props.setSettings(s => ({ ...s, intelligentMutation: !s.intelligentMutation }));
};

const toggleAutoStop = () => {
  props.setSettings(s => ({ ...s, autoStopEnabled: !s.autoStopEnabled }));
};

const updateAutoStopGeneration = (value: number | undefined) => {
  if (value !== undefined) {
    props.setSettings({ ...props.settings, autoStopGeneration: value });
  }
};

const maxWorkers = computed(() =>
  typeof navigator !== 'undefined' ? Math.min(navigator.hardwareConcurrency || 4, 8) : 8
);

const maxSimulationSpeed = computed(() => props.settings.turboTraining ? 5000 : 100);

watch(() => props.settings.turboTraining, (isTurbo) => {
  if (!isTurbo && props.settings.simulationSpeed > 100) {
    props.setSettings(s => ({ ...s, simulationSpeed: 100 }));
  }
});

const updateWorkerCount = (value: number | undefined) => {
  if (value !== undefined) {
    props.setSettings({ ...props.settings, workerCount: value });
  }
};
</script>
