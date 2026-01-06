<template>
  <div>
    <!-- Script Editor Modal -->
    <ScriptEditor
      v-model="scriptEditorOpen"
      @save="handleScriptSave"
    />

    <!-- Fitness Editor Modal -->
    <FitnessEditor
      v-model="fitnessEditorOpen"
      :initial-code="fitnessEditorCode"
      @save="handleFitnessSave"
    />

    <UCard class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl">
      <div class="space-y-6">
        <MatchConfiguration
          :settings="settings"
          :set-settings="setSettings"
          :game-state="gameState"
          :on-open-script-editor="() => scriptEditorOpen = true"
          :on-open-fitness-editor="() => fitnessEditorOpen = true"
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
          @architecture-change="handleArchitectureChange"
        />

      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { TrainingSettings, GameState, FitnessConfig, NNArchitecture } from '~/types';
import { saveScript } from '~/services/CustomScriptRunner';
import { useFitnessConfig } from '~/composables/useFitnessConfig';
import { DEFAULT_FITNESS_SCRIPT } from '~/templates/defaultFitnessScript';
import { configToJavascript } from '~/services/FitnessStorage';

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

const emit = defineEmits<{
  'architecture-change': [architecture: NNArchitecture];
}>();

const toast = useToast();

const scriptEditorOpen = ref(false);
const fitnessEditorOpen = ref(false);

const isTrainingActive = computed(() => props.settings.gameMode === 'TRAINING');
const { fitnessConfig, updateFitnessConfig } = useFitnessConfig();

// Compute editor code from saved config (reactive)
const fitnessEditorCode = computed(() => configToJavascript(fitnessConfig.value));

const handleScriptSave = (code: string) => {
  saveScript(code);
  if (props.onScriptRecompile) {
    props.onScriptRecompile();
  }
};

const handleFitnessSave = (config: FitnessConfig) => {
  updateFitnessConfig(config);
  toast.add({
    title: 'Fitness config applied to live training',
    description: 'Background/turbo workers will use new config on next training start',
    color: 'green'
  });
};

const toggleRunning = () => {
  props.setSettings(s => ({ ...s, isRunning: !s.isRunning }));
};

/**
 * Forwards architecture-change event from TrainingParameters to parent page.
 * The parent page will handle population reset with new architecture.
 */
const handleArchitectureChange = (architecture: NNArchitecture) => {
  emit('architecture-change', architecture);
};
</script>

