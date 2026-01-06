<script setup lang="ts">
/**
 * Neural Network Visual Editor
 *
 * Rete.js-based visual editor for designing custom neural network architectures.
 * Displays layers as nodes that can be added, removed, and configured.
 */

import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useNNEditor } from '../composables/useNNEditor';
import type { NNArchitecture } from '../types';

const emit = defineEmits<{
  apply: [architecture: NNArchitecture]
}>();

// Use the NN editor composable
const {
  architecture,
  isInitialized,
  isDirty,
  architectureSummary,
  parameterCount,
  canAddLayer,
  canRemoveLayer,
  initEditor,
  destroyEditor,
  addHiddenLayer,
  removeHiddenLayer,
  setLayerSize,
  resetToDefault,
  resetDirty,
  NN_CONSTRAINTS
} = useNNEditor();

// Container ref for Rete.js
const containerRef = ref<HTMLElement | null>(null);

// Selected layer for editing
const selectedLayerIndex = ref<number | null>(null);
const editingNodeCount = ref<number>(13);

// Dark mode detection
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

onMounted(async () => {
  if (containerRef.value) {
    await initEditor(containerRef.value);
  }
});

onBeforeUnmount(() => {
  destroyEditor();
});

// Watch for selected layer changes to update editing value
watch(selectedLayerIndex, (idx) => {
  if (idx !== null && architecture.value.hiddenLayers[idx] !== undefined) {
    editingNodeCount.value = architecture.value.hiddenLayers[idx];
  }
});

function handleLayerSelect(index: number) {
  selectedLayerIndex.value = index;
  editingNodeCount.value = architecture.value.hiddenLayers[index] ?? 13;
}

function applyNodeCount() {
  if (selectedLayerIndex.value !== null) {
    setLayerSize(selectedLayerIndex.value, editingNodeCount.value);
    selectedLayerIndex.value = null;
  }
}

function handleAddLayer() {
  addHiddenLayer();
}

function handleRemoveLayer() {
  if (selectedLayerIndex.value !== null) {
    removeHiddenLayer(selectedLayerIndex.value);
    selectedLayerIndex.value = null;
  }
}

function handleApply() {
  emit('apply', architecture.value);
}

// Expose methods to parent component
defineExpose({
  resetDirty,
  handleApply
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div class="flex items-center justify-between p-3 border-b border-default bg-default/80 backdrop-blur-sm">
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-plus"
          size="sm"
          :disabled="!canAddLayer"
          @click="handleAddLayer"
        >
          Add Layer
        </UButton>
        <UButton
          icon="i-lucide-trash-2"
          size="sm"
          variant="soft"
          color="error"
          :disabled="!canRemoveLayer || selectedLayerIndex === null"
          @click="handleRemoveLayer"
        >
          Remove
        </UButton>
        <UButton
          icon="i-lucide-rotate-ccw"
          size="sm"
          variant="ghost"
          @click="resetToDefault"
        >
          Reset
        </UButton>
      </div>

      <div class="flex items-center gap-4 text-sm text-muted">
        <span>Parameters: <strong class="text-default">{{ parameterCount.toLocaleString() }}</strong></span>
        <span v-if="isDirty" class="text-yellow-500 flex items-center gap-1">
          <UIcon name="i-lucide-alert-triangle" class="w-4 h-4" />
          Unsaved
        </span>
      </div>
    </div>

    <!-- Canvas -->
    <div class="flex-1 relative overflow-hidden">
      <!-- Rete.js container -->
      <div
        ref="containerRef"
        class="absolute inset-0"
        :class="isDarkMode ? 'bg-gray-900' : 'bg-gray-50'"
      />

      <!-- Loading overlay -->
      <div
        v-if="!isInitialized"
        class="absolute inset-0 flex items-center justify-center bg-default/80"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-primary" />
          <span class="text-muted">Initializing editor...</span>
        </div>
      </div>

      <!-- Simple layer visualization (fallback/overlay) -->
      <div
        v-if="isInitialized"
        class="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2"
      >
        <!-- Input Layer -->
        <div
          class="flex flex-col items-center cursor-not-allowed"
          :title="`Input Layer: ${architecture.inputNodes} nodes (fixed)`"
        >
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
            :class="isDarkMode ? 'bg-cyan-600' : 'bg-cyan-700'"
          >
            {{ architecture.inputNodes }}
          </div>
          <span class="text-xs text-muted mt-1">Input</span>
        </div>

        <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-muted" />

        <!-- Hidden Layers -->
        <template v-for="(nodeCount, idx) in architecture.hiddenLayers" :key="`hidden-${idx}`">
          <button
            class="flex flex-col items-center cursor-pointer group"
            :class="selectedLayerIndex === idx ? 'ring-2 ring-primary ring-offset-2 rounded-full' : ''"
            :title="`Hidden Layer ${idx + 1}: ${nodeCount} nodes (click to edit)`"
            @click="handleLayerSelect(idx)"
          >
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-transform group-hover:scale-110"
              :class="isDarkMode ? 'bg-purple-600' : 'bg-purple-700'"
            >
              {{ nodeCount }}
            </div>
            <span class="text-xs text-muted mt-1">H{{ idx + 1 }}</span>
          </button>
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-muted" />
        </template>

        <!-- Output Layer -->
        <div
          class="flex flex-col items-center cursor-not-allowed"
          :title="`Output Layer: ${architecture.outputNodes} nodes (fixed)`"
        >
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
            :class="isDarkMode ? 'bg-green-600' : 'bg-green-700'"
          >
            {{ architecture.outputNodes }}
          </div>
          <span class="text-xs text-muted mt-1">Output</span>
        </div>
      </div>

      <!-- Layer editing popover -->
      <div
        v-if="selectedLayerIndex !== null"
        class="absolute top-4 right-4 z-20"
      >
        <UCard class="w-56">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">Hidden Layer {{ selectedLayerIndex + 1 }}</span>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                size="xs"
                @click="selectedLayerIndex = null"
              />
            </div>
          </template>

          <div class="space-y-3">
            <UFormField label="Nodes">
              <UInput
                v-model.number="editingNodeCount"
                type="number"
                :min="NN_CONSTRAINTS.MIN_NODES_PER_LAYER"
                :max="NN_CONSTRAINTS.MAX_NODES_PER_LAYER"
                size="sm"
              />
            </UFormField>
            <div class="text-xs text-muted">
              Range: {{ NN_CONSTRAINTS.MIN_NODES_PER_LAYER }}-{{ NN_CONSTRAINTS.MAX_NODES_PER_LAYER }}
            </div>
            <UButton size="sm" block @click="applyNodeCount">
              Apply
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between p-3 border-t border-default bg-default">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-git-branch" class="w-4 h-4 text-muted" />
        <span class="text-sm font-mono">{{ architectureSummary }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Rete.js canvas styling */
:deep(.rete-editor) {
  width: 100%;
  height: 100%;
}
</style>
