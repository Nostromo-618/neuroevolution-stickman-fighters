<script setup lang="ts">
/**
 * Neural Network Visual Editor
 *
 * Rete.js-based visual editor for designing custom neural network architectures.
 * Uses Option B: Each layer is a Rete node with neurons rendered as circles inside.
 *
 * Features:
 * - Zoomable/pannable canvas (via Rete.js)
 * - Layers as draggable column nodes
 * - Neurons shown as circles inside layers
 * - Add/remove neurons via +/- buttons
 * - Clone layer functionality
 * - Connection lines between layers
 */

import { ref, onMounted, onBeforeUnmount, computed, h, defineComponent } from 'vue';
import { useNNEditor } from '../composables/useNNEditor';
import CustomLayerNode from './rete/CustomLayerNode.vue';
import type { NNArchitecture } from '../types';

// =============================================================================
// EMITS
// =============================================================================

const emit = defineEmits<{
  apply: [architecture: NNArchitecture]
}>();

// =============================================================================
// COMPOSABLE
// =============================================================================

const {
  architecture,
  isInitialized,
  isDirty,
  showConnections,
  areaTransform,
  connectionLines,
  architectureSummary,
  parameterCount,
  canAddLayer,
  canRemoveLayer,
  initEditor,
  destroyEditor,
  zoomToFit,
  addHiddenLayer,
  removeHiddenLayer,
  cloneHiddenLayer,
  addNeuronToLayer,
  removeNeuronFromLayer,
  resetToDefault,
  toggleConnections,
  refreshConnectionLines,
  resetDirty
} = useNNEditor();

// =============================================================================
// REFS
// =============================================================================

const containerRef = ref<HTMLElement | null>(null);

// =============================================================================
// CUSTOM NODE WRAPPER
// =============================================================================

/**
 * Wrapper component that bridges Rete.js props to our CustomLayerNode
 * and handles event propagation back to the composable.
 */
const CustomLayerNodeWrapper = defineComponent({
  props: {
    // Using broad types as Rete.js injects various node properties at runtime
    data: { type: Object as () => Record<string, unknown>, required: true },
    styles: { type: Function as unknown as () => () => Record<string, unknown>, default: () => ({}) },
    emit: { type: Function as unknown as () => (event: string, data?: unknown) => void, required: true }
  },
  setup(props) {
    // Create an emit handler that routes events to our composable
    const handleEmit = async (event: string, layerIndex?: unknown) => {
      if (typeof layerIndex !== 'number') return;
      
      switch (event) {
        case 'addNeuron':
          await addNeuronToLayer(layerIndex);
          break;
        case 'removeNeuron':
          await removeNeuronFromLayer(layerIndex);
          break;
        case 'cloneLayer':
          await cloneHiddenLayer(layerIndex);
          break;
      }
    };

    return () => h(CustomLayerNode, {
      data: props.data as Record<string, unknown>,
      styles: props.styles as () => Record<string, unknown>,
      emit: handleEmit
    });
  }
});

// =============================================================================
// LIFECYCLE
// =============================================================================

onMounted(async () => {
  if (containerRef.value) {
    await initEditor(containerRef.value, CustomLayerNodeWrapper);
  }
});

onBeforeUnmount(() => {
  destroyEditor();
});

// =============================================================================
// DARK MODE
// =============================================================================

const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

// =============================================================================
// ACTIONS
// =============================================================================

function handleApply() {
  emit('apply', architecture.value);
}

async function handleReset() {
  await resetToDefault();
}

async function handleAddLayer() {
  await addHiddenLayer();
}

async function handleRemoveLayer() {
  await removeHiddenLayer();
}

async function handleZoomToFit() {
  await zoomToFit();
}

// =============================================================================
// EXPOSE
// =============================================================================

defineExpose({
  resetDirty,
  handleApply
});
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Toolbar -->
    <div
      class="flex items-center justify-between p-3 border-b"
      :class="isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'"
    >
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-plus"
          size="sm"
          color="primary"
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
          :disabled="!canRemoveLayer"
          @click="handleRemoveLayer"
        >
          Remove Last
        </UButton>
        <UButton
          icon="i-lucide-rotate-ccw"
          size="sm"
          variant="ghost"
          @click="handleReset"
        >
          Reset
        </UButton>
        
        <span class="mx-2 h-5 w-px bg-gray-300 dark:bg-gray-600" />
        
        <UButton
          icon="i-lucide-maximize-2"
          size="sm"
          variant="ghost"
          @click="handleZoomToFit"
        >
          Fit View
        </UButton>
        <UButton
          :icon="showConnections ? 'i-lucide-eye' : 'i-lucide-eye-off'"
          size="sm"
          variant="ghost"
          @click="toggleConnections"
        >
          {{ showConnections ? 'Hide Lines' : 'Show Lines' }}
        </UButton>
      </div>

      <div class="flex items-center gap-4 text-sm">
        <span :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'">
          Parameters: <strong :class="isDarkMode ? 'text-white' : 'text-gray-900'">{{ parameterCount.toLocaleString() }}</strong>
        </span>
        <span v-if="isDirty" class="flex items-center gap-1 text-yellow-500">
          <UIcon name="i-lucide-alert-triangle" class="w-4 h-4" />
          Unsaved
        </span>
      </div>
    </div>

    <!-- Canvas Container (Rete.js mounts here) -->
    <div
      class="flex-1 relative overflow-hidden"
      :class="isDarkMode ? 'bg-gray-950' : 'bg-gray-50'"
    >
      <!-- Rete.js container -->
      <div
        ref="containerRef"
        class="absolute inset-0"
        :style="{ background: isDarkMode ? 'radial-gradient(circle, #1f2937 1px, transparent 1px)' : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }"
      />

      <!-- Connection Lines SVG Overlay -->
      <svg
        v-if="showConnections && isInitialized && connectionLines.length > 0"
        class="absolute inset-0 pointer-events-none"
        :style="{
          width: '100%',
          height: '100%',
          overflow: 'visible'
        }"
      >
        <g :transform="`translate(${areaTransform.x}, ${areaTransform.y}) scale(${areaTransform.k})`">
          <line
            v-for="(line, idx) in connectionLines"
            :key="idx"
            :x1="line.x1"
            :y1="line.y1"
            :x2="line.x2"
            :y2="line.y2"
            :stroke="isDarkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.12)'"
            stroke-width="1"
            stroke-linecap="round"
          />
        </g>
      </svg>

      <!-- Loading overlay -->
      <div
        v-if="!isInitialized"
        class="absolute inset-0 flex items-center justify-center"
        :class="isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-primary" />
          <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">Initializing editor...</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      class="flex items-center justify-between p-3 border-t"
      :class="isDarkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-git-branch" class="w-4 h-4" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'" />
        <span class="text-sm font-mono" :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">
          {{ architectureSummary }}
        </span>
      </div>
      <div class="text-xs" :class="isDarkMode ? 'text-gray-500' : 'text-gray-400'">
        Scroll to zoom • Drag to pan • Drag nodes to reposition
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Rete.js canvas styling */
:deep(.rete-background) {
  background: transparent !important;
}

/* Make nodes have pointer cursor */
:deep(.node) {
  cursor: grab;
}

:deep(.node):active {
  cursor: grabbing;
}

/* Hide default Rete.js connections - we render our own SVG connections */
:deep(.connection) {
  display: none !important;
}
</style>
