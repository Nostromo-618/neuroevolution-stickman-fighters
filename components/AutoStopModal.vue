<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'max-w-md' }">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-2xl font-bold text-teal-400 mb-2">Training Paused</h3>
        </template>

        <div class="space-y-4">
          <div class="bg-slate-800/50 rounded-lg p-3 mb-4 text-sm font-mono flex items-center justify-between">
            <span class="text-slate-400">Milestone:</span>
            <span class="text-teal-300">Generation {{ currentGen }}</span>
          </div>
          <p class="text-slate-400 mb-6 leading-relaxed text-sm">
            Background training has reached its generation limit. To prevent infinite resource usage, training has been paused.
          </p>
        </div>

        <template #footer>
          <div class="space-y-3">
            <UButton
              @click="onContinue"
              color="success"
              class="w-full"
            >
              Continue (+1000 Gens)
            </UButton>
            
            <UButton
              @click="onDisable"
              color="cyan"
              variant="soft"
              class="w-full"
            >
              Don't Interrupt Again
            </UButton>
            
            <UButton
              @click="onStop"
              color="neutral"
              variant="outline"
              class="w-full"
            >
              Stop Training
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
  currentGen: number;
  onContinue: () => void;
  onStop: () => void;
  onDisable: () => void;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) {
      // User tried to close modal (e.g., clicking outside or ESC)
      // We don't allow this since prevent-close should handle it
      emit('update:modelValue', false);
    }
  }
});
</script>
