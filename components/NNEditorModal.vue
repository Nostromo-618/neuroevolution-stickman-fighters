<script setup lang="ts">
/**
 * Neural Network Editor Modal
 *
 * Full-screen modal that combines the Rete.js visual editor with the
 * educational theory glossary panel.
 *
 * Layout: 2/3 canvas + 1/3 glossary (collapsible)
 */

import { ref } from 'vue';
import { formatArchitecture, saveArchitecture } from '../services/NNArchitecturePersistence';
import type { NNArchitecture } from '../types';
import NNEditor from './NNEditor.vue';

const model = defineModel<boolean>({ default: false });

const emit = defineEmits<{
  apply: [architecture: NNArchitecture]
}>();

// UI state
const glossaryVisible = ref(true);
const confirmDialogOpen = ref(false);
const pendingArchitecture = ref<NNArchitecture | null>(null);

// Ref to NNEditor component for calling resetDirty after save
const editorRef = ref<InstanceType<typeof NNEditor> | null>(null);

// Toast
const toast = useToast();

function handleGlossaryCollapse() {
  glossaryVisible.value = false;
}

function toggleGlossary() {
  glossaryVisible.value = !glossaryVisible.value;
}

function handleEditorApply(editorArchitecture: NNArchitecture) {
  // Show confirmation dialog with the architecture from the editor
  pendingArchitecture.value = { ...editorArchitecture };
  confirmDialogOpen.value = true;
}

function confirmApply() {
  if (pendingArchitecture.value) {
    try {
      saveArchitecture(pendingArchitecture.value);

      // Reset the editor's dirty flag after successful save
      editorRef.value?.resetDirty();

      toast.add({
        title: 'Architecture Applied',
        description: 'Training population will be reset with the new architecture.',
        icon: 'i-lucide-check-circle',
        color: 'success'
      });

      emit('apply', pendingArchitecture.value);
      model.value = false;
    } catch {
      toast.add({
        title: 'Error',
        description: 'Failed to save architecture. Please try again.',
        icon: 'i-lucide-alert-triangle',
        color: 'error'
      });
    }
  }
  confirmDialogOpen.value = false;
  pendingArchitecture.value = null;
}

function cancelApply() {
  confirmDialogOpen.value = false;
  pendingArchitecture.value = null;
}

function handleClose() {
  model.value = false;
}
</script>

<template>
  <UModal
    v-model:open="model"
    fullscreen
    :ui="{ content: 'flex flex-col' }"
  >
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-brain-circuit" class="w-6 h-6 text-primary" />
          <div>
            <h1 class="text-lg font-semibold">Neural Network Designer</h1>
            <p class="text-sm text-muted">Design your fighter's AI brain architecture</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <UBadge variant="subtle" size="lg">
            {{ pendingArchitecture ? formatArchitecture(pendingArchitecture) : 'Design your architecture' }}
          </UBadge>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            size="lg"
            aria-label="Close"
            @click="handleClose"
          />
        </div>
      </div>
    </template>

    <!-- Body -->
    <template #body>
      <div class="flex-1 flex overflow-hidden">
        <!-- Canvas: 2/3 width (or full when glossary hidden) -->
        <div
          class="flex-1 transition-all duration-300"
          :class="glossaryVisible ? 'w-2/3' : 'w-full'"
        >
          <NNEditor ref="editorRef" @apply="handleEditorApply" />
        </div>

        <!-- Glossary: 1/3 width (collapsible) -->
        <div
          v-if="glossaryVisible"
          class="w-1/3 min-w-[300px] transition-all duration-300"
        >
          <NNTheoryGlossary @collapse="handleGlossaryCollapse" />
        </div>

        <!-- Show glossary button when collapsed -->
        <button
          v-if="!glossaryVisible"
          class="absolute right-4 top-1/2 -translate-y-1/2 bg-default border border-default rounded-l-lg px-2 py-4 hover:bg-muted transition-colors"
          aria-label="Show glossary"
          @click="toggleGlossary"
        >
          <UIcon name="i-lucide-panel-left-open" class="w-5 h-5" />
        </button>
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-info" class="w-4 h-4" />
          <span>Applying changes will reset your training population</span>
        </div>

        <div class="flex items-center gap-2">
          <UButton variant="ghost" @click="handleClose">
            Cancel
          </UButton>
          <UButton
            icon="i-lucide-check"
            color="primary"
            @click="editorRef?.handleApply()"
          >
            Apply & Reset Training
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- Confirmation Dialog -->
  <UModal v-model:open="confirmDialogOpen">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-yellow-500" />
        <span class="font-semibold">Confirm Architecture Change</span>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <p>
          Applying a new architecture will <strong>reset your entire training population</strong>.
          All evolved fighters will be lost.
        </p>
        <p class="text-muted text-sm">
          New architecture: <code class="text-primary">{{ pendingArchitecture ? formatArchitecture(pendingArchitecture) : '' }}</code>
        </p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="cancelApply">
          Cancel
        </UButton>
        <UButton color="error" @click="confirmApply">
          Reset & Apply
        </UButton>
      </div>
    </template>
  </UModal>
</template>
