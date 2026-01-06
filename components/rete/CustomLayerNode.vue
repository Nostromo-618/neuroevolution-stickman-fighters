<script setup lang="ts">
/**
 * Custom Rete.js Layer Node Component
 * 
 * Renders a neural network layer as a columnar node with neurons as circles.
 * This component is used by the Rete.js Vue plugin via the customize option.
 */
import { computed } from 'vue';

// =============================================================================
// TYPES
// =============================================================================

interface LayerNodeData {
  label: string;
  nodeCount: number;
  layerType: 'input' | 'hidden' | 'output';
  layerIndex?: number;
}

interface Props {
  // Rete.js passes node data as a mixed object - we extract our properties
  data: Record<string, unknown>;
  styles?: () => Record<string, unknown>;
  emit: (event: string, data?: unknown) => void;
}

const props = defineProps<Props>();

// Type-safe accessors for our data properties
const nodeData = computed(() => props.data as unknown as LayerNodeData);

// =============================================================================
// DARK MODE
// =============================================================================

const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

// =============================================================================
// LAYER STYLING
// =============================================================================

const layerColors = computed(() => {
  switch (nodeData.value.layerType) {
    case 'input':
      return {
        border: isDarkMode.value ? '#22d3d1' : '#0891b2',
        bg: isDarkMode.value ? 'rgba(6, 95, 70, 0.5)' : 'rgba(207, 250, 254, 0.9)',
        header: isDarkMode.value ? '#0e7490' : '#06b6d4',
        headerText: '#ffffff',
        neuron: isDarkMode.value ? '#22d3d1' : '#06b6d4'
      };
    case 'output':
      return {
        border: isDarkMode.value ? '#4ade80' : '#16a34a',
        bg: isDarkMode.value ? 'rgba(20, 83, 45, 0.5)' : 'rgba(220, 252, 231, 0.9)',
        header: isDarkMode.value ? '#15803d' : '#22c55e',
        headerText: '#ffffff',
        neuron: isDarkMode.value ? '#4ade80' : '#22c55e'
      };
    default: // hidden
      return {
        border: isDarkMode.value ? '#a855f7' : '#9333ea',
        bg: isDarkMode.value ? 'rgba(88, 28, 135, 0.5)' : 'rgba(243, 232, 255, 0.9)',
        header: isDarkMode.value ? '#7e22ce' : '#a855f7',
        headerText: '#ffffff',
        neuron: isDarkMode.value ? '#a855f7' : '#9333ea'
      };
  }
});

const isEditable = computed(() => nodeData.value.layerType === 'hidden');

// =============================================================================
// NEURONS
// =============================================================================

const neurons = computed(() => {
  return Array.from({ length: nodeData.value.nodeCount }, (_, i) => i + 1);
});

const maxVisibleNeurons = 16;
const displayNeurons = computed(() => {
  if (nodeData.value.nodeCount <= maxVisibleNeurons) {
    return neurons.value;
  }
  // Show first few, ellipsis, and last few
  return [...neurons.value.slice(0, 6), -1, ...neurons.value.slice(-3)];
});

// =============================================================================
// ACTIONS
// =============================================================================

function handleAddNeuron() {
  props.emit('addNeuron', nodeData.value.layerIndex);
}

function handleRemoveNeuron() {
  props.emit('removeNeuron', nodeData.value.layerIndex);
}

function handleCloneLayer() {
  props.emit('cloneLayer', nodeData.value.layerIndex);
}
</script>

<template>
  <div
    class="layer-node"
    :style="{
      border: `2px solid ${layerColors.border}`,
      background: layerColors.bg,
      borderRadius: '12px',
      minWidth: '90px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      userSelect: 'none'
    }"
  >
    <!-- Header -->
    <div
      class="layer-header"
      :style="{
        background: layerColors.header,
        color: layerColors.headerText,
        padding: '8px 12px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }"
    >
      <span>{{ data.label }}</span>
      <span style="opacity: 0.8; font-size: 11px;">({{ data.nodeCount }})</span>
      <UIcon
        v-if="!isEditable"
        name="i-lucide-lock"
        style="width: 12px; height: 12px; opacity: 0.7;"
      />
    </div>

    <!-- Neurons Container -->
    <div
      class="neurons-container"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '10px 8px',
        maxHeight: '280px',
        overflowY: 'auto'
      }"
    >
      <template v-for="(idx, i) in displayNeurons" :key="i">
        <!-- Ellipsis indicator -->
        <div
          v-if="idx === -1"
          :style="{
            color: layerColors.neuron,
            fontSize: '10px',
            fontWeight: '600'
          }"
        >
          ⋮
        </div>
        <!-- Neuron circle -->
        <div
          v-else
          :style="{
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: layerColors.neuron,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: '500',
            color: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }"
        >
          {{ idx }}
        </div>
      </template>
    </div>

    <!-- Controls (hidden layers only) -->
    <div
      v-if="isEditable"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '6px 8px',
        borderTop: `1px solid ${layerColors.border}40`
      }"
    >
      <!-- Neuron +/- controls -->
      <div
        :style="{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px'
        }"
      >
        <button
          :style="{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: `1px solid ${layerColors.border}`,
            background: 'transparent',
            color: layerColors.neuron,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '700'
          }"
          title="Remove neuron"
          @pointerdown.stop
          @click="handleRemoveNeuron"
        >
          −
        </button>
        <button
          :style="{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: `1px solid ${layerColors.border}`,
            background: 'transparent',
            color: layerColors.neuron,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '700'
          }"
          title="Add neuron"
          @pointerdown.stop
          @click="handleAddNeuron"
        >
          +
        </button>
      </div>

      <!-- Clone button -->
      <button
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '4px 8px',
          borderRadius: '4px',
          border: `1px solid ${layerColors.border}`,
          background: 'transparent',
          color: layerColors.neuron,
          cursor: 'pointer',
          fontSize: '11px'
        }"
        title="Clone this layer"
        @pointerdown.stop
        @click="handleCloneLayer"
      >
        <UIcon name="i-lucide-copy" style="width: 12px; height: 12px;" />
        Clone
      </button>
    </div>
  </div>
</template>
