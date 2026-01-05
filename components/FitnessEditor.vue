<template>
  <UModal v-model:open="isOpen" fullscreen :ui="{ content: 'w-[98vw] h-[95vh] max-w-[98vw] max-h-[95vh]' }">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <!-- Accessibility: Hidden title and description for screen readers -->
      <VisuallyHidden as-child>
        <DialogTitle>Neural Network Fitness Editor</DialogTitle>
      </VisuallyHidden>
      <VisuallyHidden as-child>
        <DialogDescription>
          Customize the fitness function parameters used to train AI fighters.
        </DialogDescription>
      </VisuallyHidden>

      <UCard
        class="w-full h-full flex flex-col"
        :ui="{ body: 'flex-1 flex flex-col min-h-0 overflow-hidden' }"
      >
      <!-- Header with buttons -->
      <template #header>
        <div class="flex flex-col gap-3">
          <!-- Top row: Title, buttons -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-5">
              <h2 class="text-xl font-bold text-emerald-400">
                ⚙️ Neural Network Fitness Editor
              </h2>

              <UBadge color="gray" variant="subtle" size="sm">
                JavaScript
              </UBadge>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2">
              <UButton
                @click="handleReset"
                color="neutral"
                variant="outline"
                size="sm"
              >
                Load Default
              </UButton>
              <UButton
                @click="handleImport"
                color="neutral"
                variant="outline"
                size="sm"
              >
                Import
              </UButton>
              <UButton
                @click="handleExport"
                color="neutral"
                variant="outline"
                size="sm"
              >
                Export
              </UButton>
              <UButton
                @click="handleSave"
                :disabled="hasError || isSaving"
                color="success"
                variant="solid"
                size="sm"
              >
                {{ isSaving ? 'Saving...' : 'Save & Close' }}
              </UButton>
              <UButton
                icon="i-heroicons-x-mark"
                color="neutral"
                variant="ghost"
                @click="onClose"
              />
            </div>
          </div>

          <!-- Error Display Row -->
          <div
            :class="[
              'text-sm font-mono p-2 rounded-lg',
              errorMessage ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'
            ]"
          >
            {{ errorMessage || '✓ Configuration is valid' }}
          </div>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <UProgress animation="swing" class="w-64" />
        <span class="text-gray-400 text-sm">Loading Fitness Editor...</span>
      </div>

      <!-- Editor Area - fills remaining space with explicit height -->
      <div v-else class="flex-1 min-h-0 h-full">
        <div ref="editorContainer" class="w-full h-full rounded-lg overflow-hidden border border-slate-700 dark:border-slate-700 border-gray-300" style="min-height: 400px;" />
      </div>

      <!-- Hidden file input for import -->
      <input
        ref="fileInputRef"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleFileChange"
      />
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import loader from '@monaco-editor/loader';
import type { editor } from 'monaco-editor';
import { compileFitnessScript } from '~/services/FitnessCompiler';
import { exportFitnessConfig, importFitnessConfig } from '~/services/FitnessStorage';
import { DEFAULT_FITNESS_SCRIPT } from '~/templates/defaultFitnessScript';
import type { FitnessConfig } from '~/types';
import { VisuallyHidden } from 'reka-ui';
import { DialogTitle, DialogDescription } from 'reka-ui';

interface Props {
  modelValue: boolean;
  initialCode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  initialCode: DEFAULT_FITNESS_SCRIPT
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [config: FitnessConfig];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// Editor state
const code = ref<string>(props.initialCode);
const errorMessage = ref<string | null>(null);
const isSaving = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Editor container
const editorContainer = ref<HTMLDivElement | null>(null);

// UI state
const isLoading = ref(true);

// Editor instance
let editorInstance: editor.IStandaloneCodeEditor | null = null;
let monacoInstance: typeof import('monaco-editor') | null = null;
const cleanupFunctions: Array<() => void> = [];
let editorInitialized = false;

// Dynamic theme based on color mode
const colorMode = useColorMode();
const editorTheme = computed(() => colorMode.value === 'dark' ? 'vs-dark' : 'vs');

// Computed: has error
const hasError = computed(() => !!errorMessage.value);

// Monaco editor configuration
const editorOptions: editor.IStandaloneEditorConstructionOptions = {
  language: 'javascript',
  theme: editorTheme.value,
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "'Cascadia Code', Consolas, 'Courier New', monospace",
  fontLigatures: true,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  padding: { top: 12 }
};

// Create an editor instance
const createEditor = (): editor.IStandaloneCodeEditor | null => {
  if (!monacoInstance?.editor || !editorContainer.value) return null;

  return monacoInstance.editor.create(editorContainer.value, {
    ...editorOptions,
    value: code.value
  });
};

// Initialize editor
const initEditor = async () => {
  if (editorInitialized) return;

  try {
    monacoInstance = await loader.init();
    if (!monacoInstance || !editorContainer.value) return;

    editorInstance = createEditor();
    editorInstance?.onDidChangeModelContent(() => {
      code.value = editorInstance?.getValue() || '';
    });

    editorInstance?.focus();
    editorInitialized = true;
  } catch (err) {
    console.error('Failed to load Monaco Editor:', err);
  }
};

// Dispose editor
const disposeEditor = () => {
  editorInstance?.dispose();
  editorInstance = null;
  editorInitialized = false;
};

// Watch for modal open
watch(isOpen, async (open, prevOpen) => {
  if (open && !prevOpen) {
    // Load initial code
    code.value = props.initialCode;
    errorMessage.value = null;

    // Show loading state briefly
    isLoading.value = true;
    disposeEditor();

    await nextTick();

    // Hide loading and show editor container
    isLoading.value = false;

    // Wait for container to be in DOM
    await nextTick();

    // Now initialize editor
    await initEditor();
  }
}, { immediate: true });

// Validate code on change
watch(code, () => {
  if (code.value) {
    const result = compileFitnessScript(code.value);
    errorMessage.value = result.error || null;
  }
});

// Update editor theme when color mode changes
watch(editorTheme, (newTheme) => {
  if (monacoInstance?.editor) {
    monacoInstance.editor.setTheme(newTheme);
  }
});

onMounted(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen.value) return;
    if (e.key === 'Escape') {
      emit('update:modelValue', false);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  cleanupFunctions.push(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
});

onUnmounted(() => {
  cleanupFunctions.forEach(cleanup => cleanup());
  disposeEditor();
});

const handleSave = () => {
  isSaving.value = true;

  const result = compileFitnessScript(code.value);
  if (result.config) {
    emit('save', result.config);
    isSaving.value = false;
    emit('update:modelValue', false);
  } else {
    isSaving.value = false;
    errorMessage.value = result.error || 'Unknown compilation error';
  }
};

const handleReset = () => {
  if (confirm('Load default fitness configuration? Your current code will be replaced.')) {
    code.value = DEFAULT_FITNESS_SCRIPT;
    editorInstance?.setValue(DEFAULT_FITNESS_SCRIPT);
  }
};

const handleExport = () => {
  const result = compileFitnessScript(code.value);
  if (result.config) {
    exportFitnessConfig(result.config);
  } else {
    alert('Cannot export invalid configuration. Please fix errors first.');
  }
};

const handleImport = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    const importedConfig = importFitnessConfig(content);
    if (importedConfig) {
      // Convert config back to code format
      const configCode = `return ${JSON.stringify(importedConfig, null, 2)};`;
      code.value = configCode;
      editorInstance?.setValue(configCode);
    } else {
      alert('Invalid fitness configuration file. Please select a valid exported configuration.');
    }
  };
  reader.readAsText(file);

  (e.target as HTMLInputElement).value = '';
};

const onClose = () => {
  emit('update:modelValue', false);
};
</script>
