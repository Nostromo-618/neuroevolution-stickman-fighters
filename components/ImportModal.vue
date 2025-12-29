<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'max-w-md' }">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <UCard>
      <template #header>
        <h3 class="text-2xl font-bold text-teal-400 mb-2">Import Weights</h3>
      </template>

      <div v-if="pendingImport" class="space-y-4">
        <div class="bg-slate-800/50 rounded-lg p-3 mb-4 text-sm font-mono">
          <span class="text-slate-400">Generation:</span>
          <span class="text-teal-300">{{ pendingImport.generation }}</span>
          <span class="mx-2 text-slate-600">|</span>
          <span class="text-slate-400">Fitness:</span>
          <span class="text-teal-300">{{ pendingImport.genome.fitness.toFixed(0) }}</span>
        </div>
        <p class="text-slate-400 mb-6 leading-relaxed text-sm">
          This will inject the weights into training and continue from Generation {{ pendingImport.generation }}.
        </p>
      </div>

      <template #footer>
        <div class="space-y-3">
          <UButton
            v-if="pendingImport"
            @click="onConfirm"
            color="success"
            class="w-full"
          >
            Continue Training (Gen {{ pendingImport.generation }})
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
import type { Genome } from '~/types';

interface Props {
  pendingImport: { genome: Genome; generation: number } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const props = defineProps<Props>();

const isOpen = computed({
  get: () => props.pendingImport !== null,
  set: (value) => {
    if (!value) {
      props.onCancel();
    }
  }
});
</script>

