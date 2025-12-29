<template>
  <UModal v-model:open="isOpen" fullscreen :ui="{ content: 'w-[98vw] h-[95vh] max-w-[98vw] max-h-[95vh]' }">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <UCard class="w-full h-full flex flex-col">
      <!-- Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-5">
            <h2 class="text-xl font-bold text-purple-400">
              ✏️ Custom Fighter Script Editor
            </h2>

            <!-- Slot Switcher Tabs -->
            <div class="flex gap-1 bg-slate-800 p-1 rounded-lg">
              <UButton
                :color="activeSlot === 'slot1' ? 'success' : 'neutral'"
                :variant="activeSlot === 'slot1' ? 'solid' : 'outline'"
                size="xs"
                @click="switchSlot('slot1')"
              >
                Script A
              </UButton>
              <UButton
                :color="activeSlot === 'slot2' ? 'success' : 'neutral'"
                :variant="activeSlot === 'slot2' ? 'solid' : 'outline'"
                size="xs"
                @click="switchSlot('slot2')"
              >
                Script B
              </UButton>
            </div>

            <UBadge color="gray" variant="subtle" size="sm">
              JavaScript
            </UBadge>
          </div>
          <UButton
            icon="i-heroicons-x-mark"
            color="neutral"
            variant="ghost"
            @click="onClose"
          />
        </div>
      </template>

      <!-- Editor -->
      <div ref="editorContainer" class="flex-1 min-h-[60vh] rounded-lg overflow-hidden border border-slate-700" />

      <!-- Footer -->
      <template #footer>
        <div class="flex justify-between items-center gap-3">
          <!-- Error Display -->
          <div
            :class="[
              'flex-1 text-sm font-mono p-2 rounded-lg',
              error ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'
            ]"
          >
            {{ error || '✓ Script is valid' }}
          </div>

          <!-- Buttons -->
          <div class="flex gap-2">
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
              :disabled="!!error || isSaving"
              color="success"
              variant="solid"
              size="sm"
            >
              {{ isSaving ? 'Saving...' : 'Save & Close' }}
            </UButton>
          </div>

          <!-- Hidden file input for import -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleFileChange"
          />
        </div>
      </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue';
import loader from '@monaco-editor/loader';
import type { editor } from 'monaco-editor';
import {
  getDefaultTemplate,
  loadScript,
  saveScript,
  exportScript,
  importScript,
  compileScript
} from '~/services/CustomScriptRunner';

interface Props {
  modelValue: boolean;
  onSave?: (code: string) => void;
}

const props = withDefaults(defineProps<Props>(), {
  onSave: () => {}
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [code: string];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const code = ref<string>('');
const error = ref<string | null>(null);
const isSaving = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const editorContainer = ref<HTMLDivElement | null>(null);
const activeSlot = ref<'slot1' | 'slot2'>('slot1');
let editorInstance: editor.IStandaloneCodeEditor | null = null;
let monacoInstance: typeof import('monaco-editor') | null = null;
const cleanupFunctions: Array<() => void> = [];
let editorInitialized = false;

const switchSlot = (slot: 'slot1' | 'slot2') => {
  activeSlot.value = slot;
};

// Initialize Monaco when modal opens
const initMonaco = async () => {
  if (editorInitialized || !editorContainer.value) return;
  
  try {
    monacoInstance = await loader.init();
    if (!monacoInstance) return;
    const monaco = monacoInstance;

    if (monaco.languages && monaco.languages.typescript) {
      const tsLang = monaco.languages.typescript as any;
      if (tsLang.javascriptDefaults && typeof tsLang.javascriptDefaults.addExtraLib === 'function') {
        tsLang.javascriptDefaults.addExtraLib(`
      interface FighterState {
        x: number;
        y: number;
        vx: number;
        vy: number;
        health: number;
        energy: number;
        state: number;
        direction: -1 | 1;
        cooldown: number;
        width: number;
        height: number;
      }

      interface Actions {
        left: boolean;
        right: boolean;
        up: boolean;
        down: boolean;
        action1: boolean;
        action2: boolean;
        action3: boolean;
      }

      declare function decide(self: FighterState, opponent: FighterState): Actions;
    `, 'fighter-types.d.ts');
      }
    }

    if (!monaco.editor) return;
    editorInstance = monaco.editor.create(editorContainer.value, {
      value: code.value,
      language: 'javascript',
      theme: 'vs-dark',
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      wordWrap: 'on',
      padding: { top: 12 }
    });

    editorInstance.onDidChangeModelContent(() => {
      code.value = editorInstance?.getValue() || '';
    });

    editorInstance.focus();
    editorInitialized = true;
  } catch (err) {
    console.error('Failed to load Monaco Editor:', err);
  }
};

watch([isOpen, activeSlot], async () => {
  if (isOpen.value) {
    code.value = loadScript(activeSlot.value);
    error.value = null;
    
    // Wait for DOM to be ready before initializing Monaco
    await nextTick();
    
    // Check if editor needs (re)initialization
    // The editor container may have been recreated when modal reopened
    const needsInit = !editorInitialized || 
                      !editorInstance || 
                      !editorContainer.value?.children.length;
    
    if (needsInit) {
      // Reset state for fresh initialization
      editorInitialized = false;
      editorInstance?.dispose();
      editorInstance = null;
      await initMonaco();
    }
    
    if (editorInstance) {
      editorInstance.setValue(code.value);
      editorInstance.focus();
    }
  }
});

watch(code, () => {
  if (code.value) {
    const result = compileScript(code.value);
    error.value = result.error || null;
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

// Top-level cleanup
onUnmounted(() => {
  cleanupFunctions.forEach(cleanup => cleanup());
  editorInstance?.dispose();
});

const handleSave = () => {
  isSaving.value = true;
  saveScript(code.value, activeSlot.value);
  props.onSave(code.value);
  emit('save', code.value);
  isSaving.value = false;
  emit('update:modelValue', false);
};

const handleReset = () => {
  if (confirm(`Load default template for ${activeSlot.value === 'slot1' ? 'Script A' : 'Script B'}? Your current code will be replaced.`)) {
    const template = getDefaultTemplate();
    code.value = template;
    if (editorInstance) {
      editorInstance.setValue(template);
    }
    saveScript(template, activeSlot.value);
  }
};

const handleExport = () => {
  exportScript(code.value);
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
    const importedCode = importScript(content);
    if (importedCode) {
      code.value = importedCode;
      if (editorInstance) {
        editorInstance.setValue(importedCode);
      }
    } else {
      alert('Invalid script file. Please select a valid exported script.');
    }
  };
  reader.readAsText(file);

  (e.target as HTMLInputElement).value = '';
};

const onClose = () => {
  emit('update:modelValue', false);
};
</script>

