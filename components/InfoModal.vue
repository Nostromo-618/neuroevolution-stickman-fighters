<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'max-w-2xl' }">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <UCard>
      <template #header>
        <div class="flex justify-between items-start">
          <h2 class="text-2xl font-bold text-teal-400 tracking-tight">
            {{ activeTab === 'MODES' ? 'Single Match vs Evolving' : activeTab === 'CONTROLS' ? 'Command List' : 'About NeuroFight' }}
          </h2>
          <UButton
            icon="i-heroicons-x-mark"
            color="neutral"
            variant="ghost"
            @click="isOpen = false"
          />
        </div>
      </template>

      <div class="flex flex-col md:flex-row gap-4">
        <!-- Sidebar / Tabs -->
        <div class="bg-slate-950 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col gap-2 md:w-48 overflow-x-auto">
          <UButton
            v-for="tab in tabs"
            :key="tab"
            :color="activeTab === tab ? 'success' : 'neutral'"
            :variant="activeTab === tab ? 'solid' : 'outline'"
            class="text-left"
            @click="activeTab = tab"
          >
            {{ tabLabels[tab] }}
          </UButton>
        </div>

        <!-- Content Area -->
        <div class="flex-1 p-6 overflow-y-auto bg-slate-900">
          <div class="space-y-4 text-slate-300 leading-relaxed text-sm">
            <!-- MODES CONTENT -->
            <div v-if="activeTab === 'MODES'" class="space-y-6">
              <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h3 class="text-lg font-bold text-white mb-2">Single Match Mode</h3>
                <p>Fight against the best trained AI. Perfect for testing your skills!</p>
              </div>
              <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <h3 class="text-lg font-bold text-white mb-2">Training Mode</h3>
                <p>Watch AI evolve through generations. Population-based genetic algorithm training.</p>
              </div>
            </div>

            <!-- CONTROLS CONTENT -->
            <div v-if="activeTab === 'CONTROLS'" class="space-y-4">
              <div>
                <h3 class="font-bold text-white mb-2">Keyboard</h3>
                <ul class="list-disc list-inside space-y-1">
                  <li>WASD / Arrow Keys: Move</li>
                  <li>J / Space: Punch</li>
                  <li>K: Kick</li>
                  <li>L / Shift: Block</li>
                </ul>
              </div>
              <div>
                <h3 class="font-bold text-white mb-2">Gamepad</h3>
                <ul class="list-disc list-inside space-y-1">
                  <li>D-Pad / Left Stick: Move</li>
                  <li>X / A: Punch</li>
                  <li>B: Kick</li>
                  <li>RB / RT: Block</li>
                </ul>
              </div>
            </div>

            <!-- ABOUT CONTENT -->
            <div v-if="activeTab === 'ABOUT'" class="space-y-4">
              <p>
                NeuroEvolution: Stickman Fighters is an experimental game demonstrating neuroevolution
                and genetic algorithms. AI fighters learn through generations of combat.
              </p>
            </div>
          </div>
        </div>
      </div>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const activeTab = ref<'MODES' | 'CONTROLS' | 'ABOUT'>('MODES');

const tabs: ('MODES' | 'CONTROLS' | 'ABOUT')[] = ['MODES', 'CONTROLS', 'ABOUT'];
const tabLabels = {
  MODES: 'Game Modes',
  CONTROLS: 'Controls',
  ABOUT: 'About'
};

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

