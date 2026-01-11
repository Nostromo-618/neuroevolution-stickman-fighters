<template>
  <UModal
    v-model:open="isOpen"
    title="Architecture Mismatch"
    description="The imported weights use a different network architecture"
    :ui="{ width: 'max-w-lg' }"
  >
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
            <h3 class="text-xl font-bold">Architecture Mismatch</h3>
          </div>
        </template>

        <div v-if="mismatchData" class="space-y-4">
          <!-- Architecture comparison -->
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-gray-100 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-slate-700">
              <div class="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Current</div>
              <div class="font-mono text-sm text-gray-800 dark:text-slate-200">{{ formatArch(mismatchData.current) }}</div>
            </div>
            <div class="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-3 border border-teal-300 dark:border-teal-700">
              <div class="text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1">Imported</div>
              <div class="font-mono text-sm text-teal-700 dark:text-teal-200">{{ formatArch(mismatchData.imported) }}</div>
            </div>
          </div>

          <!-- Warning callout -->
          <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700/50 rounded-lg p-3 text-sm">
            <p class="text-amber-800 dark:text-amber-200 leading-relaxed">
              The imported weights were trained on a different neural network topology.
              To use these weights, your current architecture will be replaced with the imported one.
            </p>
          </div>

          <!-- Import details -->
          <div class="bg-gray-50 dark:bg-slate-800/30 rounded-lg p-3 text-sm">
            <div class="flex justify-between text-gray-600 dark:text-slate-400">
              <span>Generation:</span>
              <span class="text-teal-600 dark:text-teal-300 font-mono">{{ mismatchData.pendingGeneration }}</span>
            </div>
            <div class="flex justify-between text-gray-600 dark:text-slate-400 mt-1">
              <span>Fitness:</span>
              <span class="text-teal-600 dark:text-teal-300 font-mono">{{ mismatchData.pendingGenome.fitness.toFixed(0) }}</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="space-y-2">
            <UButton
              @click="onUseImported"
              color="primary"
              class="w-full"
              icon="i-heroicons-arrow-down-tray"
            >
              Use Imported Architecture
            </UButton>
            <UButton
              @click="onCancel"
              color="neutral"
              variant="outline"
              class="w-full"
            >
              Cancel
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { NNArchitecture, Genome } from '~/types';

interface MismatchData {
  imported: NNArchitecture;
  current: NNArchitecture;
  pendingGenome: Genome;
  pendingGeneration: number;
}

interface Props {
  mismatchData: MismatchData | null;
  onUseImported: () => void;
  onCancel: () => void;
}

const props = defineProps<Props>();

const isOpen = computed({
  get: () => props.mismatchData !== null,
  set: (value) => {
    if (!value) {
      props.onCancel();
    }
  }
});

const formatArch = (arch: NNArchitecture): string => {
  const layers = [arch.inputNodes, ...arch.hiddenLayers, arch.outputNodes];
  return layers.join(' → ');
};
</script>
