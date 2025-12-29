<template>
  <div>
    <!-- Script Editor Modal -->
    <ScriptEditor
      v-model="scriptEditorOpen"
      @save="handleScriptSave"
    />

    <InfoModal
      v-model="infoModalOpen"
    />

    <UCard class="bg-slate-800 border border-slate-700 shadow-2xl">
      <div class="space-y-6">
        <MatchConfiguration
          :settings="settings"
          :set-settings="setSettings"
          :game-state="gameState"
          :on-open-script-editor="() => scriptEditorOpen = true"
          :on-open-info="() => infoModalOpen = true"
        />

        <!-- ACTION BUTTONS (Start/Reset) -->
        <div class="grid grid-cols-2 gap-2">
          <UButton
            :color="settings.isRunning ? 'warning' : 'success'"
            @click="toggleRunning"
            class="flex items-center justify-center gap-2"
          >
            <UIcon :name="settings.isRunning ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-4 h-4" />
            {{ settings.isRunning ? 'PAUSE' : 'START' }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            @click="props.onResetMatch"
          >
            RESET
          </UButton>
        </div>

        <TrainingParameters
          :settings="settings"
          :set-settings="setSettings"
          :best-fitness="bestFitness"
          :game-state="gameState"
          @export-weights="props.onExportWeights"
          @import-weights="props.onImportWeights"
          @reset-genome="props.onResetGenome"
        />

        <FitnessChart
          :fitness-history="fitnessHistory"
          :current-gen="currentGen"
          :best-fitness="bestFitness"
          :is-training-active="isTrainingActive"
        />

        <!-- Usage Hint -->
        <p v-if="isTrainingActive" class="text-[10px] text-slate-500 text-center italic">
          Visualizing evolution... Uncheck "TRAINING" to play manually.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TrainingSettings, GameState } from '~/types';
import { saveScript } from '~/services/CustomScriptRunner';

interface Props {
  settings: TrainingSettings;
  setSettings: (updater: TrainingSettings | ((prev: TrainingSettings) => TrainingSettings)) => void;
  fitnessHistory: { gen: number; fitness: number }[];
  currentGen: number;
  bestFitness: number;
  gameState: GameState;
  onResetMatch: () => void;
  onResetGenome: () => void;
  onModeChange: (mode: 'TRAINING' | 'ARCADE') => void;
  onExportWeights: () => void;
  onImportWeights: () => void;
  onScriptRecompile?: () => void;
}

const props = defineProps<Props>();

const scriptEditorOpen = ref(false);
const infoModalOpen = ref(false);

const isTrainingActive = computed(() => props.settings.gameMode === 'TRAINING');

const handleScriptSave = (code: string) => {
  saveScript(code);
  if (props.onScriptRecompile) {
    props.onScriptRecompile();
  }
};

const toggleRunning = () => {
  props.setSettings(s => ({ ...s, isRunning: !s.isRunning }));
};
</script>

