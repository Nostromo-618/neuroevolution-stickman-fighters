<template>
  <div>
    <!-- Script Editor Modal -->
    <ScriptEditor
      v-model="scriptEditorOpen"
      @save="handleScriptSave"
    />

    <UCard class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl">
      <div class="space-y-6">
        <MatchConfiguration
          :settings="settings"
          :set-settings="setSettings"
          :game-state="gameState"
          :on-open-script-editor="() => scriptEditorOpen = true"
          :on-toggle-running="toggleRunning"
          :on-reset-match="props.onResetMatch"
          :is-running="settings.isRunning"
        />

        <TrainingParameters
          :settings="settings"
          :set-settings="setSettings"
          :best-fitness="bestFitness"
          :game-state="gameState"
          @export-weights="props.onExportWeights"
          @import-weights="props.onImportWeights"
          @reset-genome="props.onResetGenome"
        />

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
  gameState: GameState;
  onResetMatch: () => void;
  onResetGenome: () => void;
  onModeChange: (mode: 'TRAINING' | 'ARCADE') => void;
  onExportWeights: () => void;
  onImportWeights: () => void;
  onScriptRecompile?: () => void;
  bestFitness: number;
}

const props = defineProps<Props>();

const scriptEditorOpen = ref(false);

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

