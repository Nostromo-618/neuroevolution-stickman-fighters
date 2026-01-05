<template>
  <UModal v-model:open="isOpen" fullscreen :ui="{ content: 'w-[98vw] h-[95vh] max-w-[98vw] max-h-[95vh]' }">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <UCard 
        class="w-full h-full flex flex-col" 
        :ui="{ body: 'flex-1 flex flex-col min-h-0 overflow-hidden' }"
      >
      <!-- Header with buttons -->
      <template #header>
        <div class="flex flex-col gap-3">
          <!-- Top row: Title, tabs, toggle, close button -->
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-5">
              <h2 class="text-xl font-bold text-emerald-400">
                ✏️ Custom Fighter Script Editor
              </h2>

              <!-- Side-by-Side Toggle -->
              <div class="flex items-center gap-2">
                <USwitch v-model="sideBySideMode" size="sm" />
                <span class="text-sm text-gray-400">Side-by-Side</span>
              </div>

              <!-- Slot Switcher (only visible in single mode) -->
              <div v-if="!sideBySideMode" class="flex gap-1 bg-slate-800 p-1 rounded-lg">
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

            <!-- Global action buttons (Save & Close only) -->
            <div class="flex items-center gap-2">
              <!-- Single mode: Show per-script action buttons here -->
              <template v-if="!sideBySideMode">
                <UButton
                  @click="handleResetSlot(activeSlot)"
                  color="neutral"
                  variant="outline"
                  size="sm"
                >
                  Load Default ({{ activeSlot === 'slot1' ? 'A' : 'B' }})
                </UButton>
                <UButton
                  @click="handleImportSlot(activeSlot)"
                  color="neutral"
                  variant="outline"
                  size="sm"
                >
                  Import ({{ activeSlot === 'slot1' ? 'A' : 'B' }})
                </UButton>
                <UButton
                  @click="handleExportSlot(activeSlot)"
                  color="neutral"
                  variant="outline"
                  size="sm"
                >
                  Export ({{ activeSlot === 'slot1' ? 'A' : 'B' }})
                </UButton>
              </template>
              <UButton
                @click="handleSave"
                :disabled="hasAnyError || isSaving"
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
          <div class="flex gap-4">
            <div
              v-if="sideBySideMode"
              :class="[
                'flex-1 text-sm font-mono p-2 rounded-lg',
                errorA ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'
              ]"
            >
              <span class="text-gray-400 mr-2">A:</span>{{ errorA || '✓ Valid' }}
            </div>
            <div
              v-if="sideBySideMode"
              :class="[
                'flex-1 text-sm font-mono p-2 rounded-lg',
                errorB ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'
              ]"
            >
              <span class="text-gray-400 mr-2">B:</span>{{ errorB || '✓ Valid' }}
            </div>
            <div
              v-if="!sideBySideMode"
              :class="[
                'flex-1 text-sm font-mono p-2 rounded-lg',
                currentError ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'
              ]"
            >
              {{ currentError || '✓ Script is valid' }}
            </div>
          </div>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <UProgress animation="swing" class="w-64" />
        <span class="text-gray-400 text-sm">Loading Script Editor...</span>
      </div>

      <!-- Editor Area - fills remaining space with explicit height -->
      <div v-else class="flex-1 flex gap-4 min-h-0 h-full">
        <!-- Side-by-Side Mode: Both editors with individual toolbars -->
        <template v-if="sideBySideMode">
          <!-- Script A Editor -->
          <div class="flex-1 flex flex-col min-h-0 h-full">
            <div class="flex items-center justify-between mb-2 px-2">
              <span class="text-sm font-semibold text-green-400">Script A (Strategic)</span>
              <div class="flex gap-1">
                <UButton @click="handleResetSlot('slot1')" color="neutral" variant="ghost" size="xs">Load Default</UButton>
                <UButton @click="handleImportSlot('slot1')" color="neutral" variant="ghost" size="xs">Import</UButton>
                <UButton @click="handleExportSlot('slot1')" color="neutral" variant="ghost" size="xs">Export</UButton>
              </div>
            </div>
            <div ref="editorContainerA" class="flex-1 min-h-0 h-full rounded-lg overflow-hidden border border-slate-700 dark:border-slate-700 border-gray-300" style="min-height: 400px;" />
          </div>
          
          <!-- Script B Editor -->
          <div class="flex-1 flex flex-col min-h-0 h-full">
            <div class="flex items-center justify-between mb-2 px-2">
              <span class="text-sm font-semibold text-purple-400">Script B (Chaotic)</span>
              <div class="flex gap-1">
                <UButton @click="handleResetSlot('slot2')" color="neutral" variant="ghost" size="xs">Load Default</UButton>
                <UButton @click="handleImportSlot('slot2')" color="neutral" variant="ghost" size="xs">Import</UButton>
                <UButton @click="handleExportSlot('slot2')" color="neutral" variant="ghost" size="xs">Export</UButton>
              </div>
            </div>
            <div ref="editorContainerB" class="flex-1 min-h-0 h-full rounded-lg overflow-hidden border border-slate-700 dark:border-slate-700 border-gray-300" style="min-height: 400px;" />
          </div>
        </template>

        <!-- Single Mode: One editor -->
        <template v-else>
          <div ref="editorContainerSingle" class="flex-1 min-h-0 h-full rounded-lg overflow-hidden border border-slate-700" style="min-height: 400px;" />
        </template>
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

// Script code for each slot
const codeA = ref<string>('');
const codeB = ref<string>('');
const errorA = ref<string | null>(null);
const errorB = ref<string | null>(null);
const isSaving = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Editor containers
const editorContainerA = ref<HTMLDivElement | null>(null);
const editorContainerB = ref<HTMLDivElement | null>(null);
const editorContainerSingle = ref<HTMLDivElement | null>(null);

// UI state
const sideBySideMode = ref(true);
const activeSlot = ref<'slot1' | 'slot2'>('slot1');
const isLoading = ref(true);

// Editor instances
let editorInstanceA: editor.IStandaloneCodeEditor | null = null;
let editorInstanceB: editor.IStandaloneCodeEditor | null = null;
let editorInstanceSingle: editor.IStandaloneCodeEditor | null = null;
let monacoInstance: typeof import('monaco-editor') | null = null;
const cleanupFunctions: Array<() => void> = [];
let editorsInitialized = false;

// Dynamic theme based on color mode
const colorMode = useColorMode();
const editorTheme = computed(() => colorMode.value === 'dark' ? 'vs-dark' : 'vs');

// Computed: current error for single mode
const currentError = computed(() => {
  return activeSlot.value === 'slot1' ? errorA.value : errorB.value;
});

// Computed: has any error
const hasAnyError = computed(() => {
  if (sideBySideMode.value) {
    return !!errorA.value || !!errorB.value;
  }
  return !!currentError.value;
});

const switchSlot = (slot: 'slot1' | 'slot2') => {
  activeSlot.value = slot;
};

// Monaco editor configuration with VS Code default font
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

// Configure TypeScript/JS language features
const configureMonacoLanguage = (monaco: typeof import('monaco-editor')) => {
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
};

// Create an editor instance
const createEditor = (
  container: HTMLDivElement,
  initialCode: string
): editor.IStandaloneCodeEditor | null => {
  if (!monacoInstance?.editor) return null;
  
  return monacoInstance.editor.create(container, {
    ...editorOptions,
    value: initialCode
  });
};

// Initialize all editors
const initEditors = async () => {
  if (editorsInitialized) return;
  
  try {
    monacoInstance = await loader.init();
    if (!monacoInstance) return;
    
    configureMonacoLanguage(monacoInstance);
    
    if (sideBySideMode.value) {
      // Initialize both editors
      if (editorContainerA.value) {
        editorInstanceA = createEditor(editorContainerA.value, codeA.value);
        editorInstanceA?.onDidChangeModelContent(() => {
          codeA.value = editorInstanceA?.getValue() || '';
        });
      }
      
      if (editorContainerB.value) {
        editorInstanceB = createEditor(editorContainerB.value, codeB.value);
        editorInstanceB?.onDidChangeModelContent(() => {
          codeB.value = editorInstanceB?.getValue() || '';
        });
      }
      
      editorInstanceA?.focus();
    } else {
      // Initialize single editor
      if (editorContainerSingle.value) {
        const code = activeSlot.value === 'slot1' ? codeA.value : codeB.value;
        editorInstanceSingle = createEditor(editorContainerSingle.value, code);
        editorInstanceSingle?.onDidChangeModelContent(() => {
          const val = editorInstanceSingle?.getValue() || '';
          if (activeSlot.value === 'slot1') {
            codeA.value = val;
          } else {
            codeB.value = val;
          }
        });
        editorInstanceSingle?.focus();
      }
    }
    
    editorsInitialized = true;
  } catch (err) {
    console.error('Failed to load Monaco Editor:', err);
  }
};

// Dispose all editors
const disposeEditors = () => {
  editorInstanceA?.dispose();
  editorInstanceB?.dispose();
  editorInstanceSingle?.dispose();
  editorInstanceA = null;
  editorInstanceB = null;
  editorInstanceSingle = null;
  editorsInitialized = false;
};

// Watch for modal open and mode changes
watch([isOpen, sideBySideMode], async ([open, sideBySide], [prevOpen, prevSideBySide]) => {
  if (open) {
    // Load scripts on open
    if (!prevOpen) {
      codeA.value = loadScript('slot1');
      codeB.value = loadScript('slot2');
      errorA.value = null;
      errorB.value = null;
    }
    
    // Reinitialize editors if mode changed or first open
    if (!prevOpen || sideBySide !== prevSideBySide) {
      // Show loading state briefly
      isLoading.value = true;
      disposeEditors();
      
      await nextTick();
      
      // Hide loading and show editor containers
      isLoading.value = false;
      
      // Wait for containers to be in DOM
      await nextTick();
      
      // Now initialize editors (containers should exist)
      await initEditors();
    }
  }
}, { immediate: true });

// Watch for slot changes in single mode
watch(activeSlot, async (newSlot) => {
  if (!sideBySideMode.value && editorInstanceSingle) {
    const code = newSlot === 'slot1' ? codeA.value : codeB.value;
    editorInstanceSingle.setValue(code);
  }
});

// Validate scripts on change
watch(codeA, () => {
  if (codeA.value) {
    const result = compileScript(codeA.value);
    errorA.value = result.error || null;
  }
});

watch(codeB, () => {
  if (codeB.value) {
    const result = compileScript(codeB.value);
    errorB.value = result.error || null;
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
  disposeEditors();
});

const handleSave = () => {
  isSaving.value = true;
  
  // Save both scripts
  saveScript(codeA.value, 'slot1');
  saveScript(codeB.value, 'slot2');
  
  props.onSave(codeA.value);
  emit('save', codeA.value);
  isSaving.value = false;
  emit('update:modelValue', false);
};

const handleReset = () => {
  const slotLabel = sideBySideMode.value 
    ? 'both scripts' 
    : (activeSlot.value === 'slot1' ? 'Script A' : 'Script B');
  
  if (confirm(`Load default template for ${slotLabel}? Your current code will be replaced.`)) {
    if (sideBySideMode.value) {
      // Reset both
      const templateA = getDefaultTemplate('slot1');
      const templateB = getDefaultTemplate('slot2');
      codeA.value = templateA;
      codeB.value = templateB;
      editorInstanceA?.setValue(templateA);
      editorInstanceB?.setValue(templateB);
      saveScript(templateA, 'slot1');
      saveScript(templateB, 'slot2');
    } else {
      // Reset active slot only
      const template = getDefaultTemplate(activeSlot.value);
      if (activeSlot.value === 'slot1') {
        codeA.value = template;
        editorInstanceSingle?.setValue(template);
        saveScript(template, 'slot1');
      } else {
        codeB.value = template;
        editorInstanceSingle?.setValue(template);
        saveScript(template, 'slot2');
      }
    }
  }
};

const handleExport = () => {
  // Export active/first script
  const code = sideBySideMode.value ? codeA.value : (activeSlot.value === 'slot1' ? codeA.value : codeB.value);
  exportScript(code);
};

const handleImport = () => {
  fileInputRef.value?.click();
};

// Track which slot the import should go to
const pendingImportSlot = ref<'slot1' | 'slot2'>('slot1');

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target?.result as string;
    const importedCode = importScript(content);
    if (importedCode) {
      const targetSlot = pendingImportSlot.value;
      if (targetSlot === 'slot1') {
        codeA.value = importedCode;
        if (sideBySideMode.value) {
          editorInstanceA?.setValue(importedCode);
        } else if (activeSlot.value === 'slot1') {
          editorInstanceSingle?.setValue(importedCode);
        }
      } else {
        codeB.value = importedCode;
        if (sideBySideMode.value) {
          editorInstanceB?.setValue(importedCode);
        } else if (activeSlot.value === 'slot2') {
          editorInstanceSingle?.setValue(importedCode);
        }
      }
    } else {
      alert('Invalid script file. Please select a valid exported script.');
    }
  };
  reader.readAsText(file);

  (e.target as HTMLInputElement).value = '';
};

// === Per-slot handlers ===

const handleResetSlot = (slot: 'slot1' | 'slot2') => {
  const slotLabel = slot === 'slot1' ? 'Script A' : 'Script B';
  
  if (confirm(`Load default template for ${slotLabel}? Your current code will be replaced.`)) {
    const template = getDefaultTemplate(slot);
    if (slot === 'slot1') {
      codeA.value = template;
      if (sideBySideMode.value) {
        editorInstanceA?.setValue(template);
      } else if (activeSlot.value === 'slot1') {
        editorInstanceSingle?.setValue(template);
      }
      saveScript(template, 'slot1');
    } else {
      codeB.value = template;
      if (sideBySideMode.value) {
        editorInstanceB?.setValue(template);
      } else if (activeSlot.value === 'slot2') {
        editorInstanceSingle?.setValue(template);
      }
      saveScript(template, 'slot2');
    }
  }
};

const handleImportSlot = (slot: 'slot1' | 'slot2') => {
  pendingImportSlot.value = slot;
  fileInputRef.value?.click();
};

const handleExportSlot = (slot: 'slot1' | 'slot2') => {
  const code = slot === 'slot1' ? codeA.value : codeB.value;
  exportScript(code);
};

const onClose = () => {
  emit('update:modelValue', false);
};
</script>
