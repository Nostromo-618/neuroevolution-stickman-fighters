<script setup lang="ts">
/**
 * Neural Network Theory Glossary
 *
 * Educational sidebar panel that explains NN concepts to help users
 * understand what they're building in the visual editor.
 */

import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'neuroevolution_glossary_collapsed_v1';

const isCollapsed = ref(false);

// Glossary terms
const glossaryTerms = [
  {
    term: 'Neural Network',
    definition: 'A computational model inspired by the brain. It processes inputs through layers of "neurons" to produce outputs.',
    icon: 'i-lucide-brain'
  },
  {
    term: 'Neuron (Node)',
    definition: 'The basic unit of a neural network. Each neuron receives inputs, applies weights, sums them, adds a bias, and outputs a value.',
    icon: 'i-lucide-circle-dot'
  },
  {
    term: 'Hidden Layer',
    definition: 'Layers between input and output where the network learns complex patterns. More layers = more complexity.',
    icon: 'i-lucide-layers'
  },
  {
    term: 'Weights',
    definition: 'Numbers that determine connection strength between neurons. These are what evolution optimizes!',
    icon: 'i-lucide-git-fork'
  },
  {
    term: 'Bias',
    definition: 'An offset added to each neuron\'s sum before activation. Helps the network make better decisions.',
    icon: 'i-lucide-plus-circle'
  },
  {
    term: 'Activation Function',
    definition: 'A math function applied to each neuron\'s output. Introduces non-linearity so the network can learn complex patterns.',
    icon: 'i-lucide-function-square'
  },
  {
    term: 'ReLU',
    definition: 'max(0, x) — Returns the input if positive, else 0. Fast and effective for hidden layers.',
    icon: 'i-lucide-trending-up'
  },
  {
    term: 'Sigmoid',
    definition: '1/(1+e^-x) — Squashes any value into 0-1 range. Used for outputs as probabilities.',
    icon: 'i-lucide-goal'
  },
  {
    term: 'Forward Pass',
    definition: 'Computing the output by passing inputs through all layers. Each layer transforms data into the next.',
    icon: 'i-lucide-arrow-right'
  },
  {
    term: 'Neuroevolution',
    definition: 'Training neural networks using genetic algorithms instead of backpropagation. Survival of the fittest!',
    icon: 'i-lucide-dna'
  },
  {
    term: 'Mutation',
    definition: 'Random changes to network weights. Allows exploration of new strategies.',
    icon: 'i-lucide-shuffle'
  },
  {
    term: 'Crossover',
    definition: 'Combining two parent networks to create offspring. Preserves good traits from both parents.',
    icon: 'i-lucide-git-merge'
  }
];

const emit = defineEmits<{
  collapse: []
}>();

onMounted(() => {
  // Load collapse state from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      isCollapsed.value = JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
});

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed.value));
  } catch {
    // Ignore errors
  }

  if (isCollapsed.value) {
    emit('collapse');
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-default border-l border-default">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-default sticky top-0 bg-default z-10">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-book-open" class="w-5 h-5 text-primary" />
        <h2 class="font-semibold text-lg">Theory Glossary</h2>
      </div>
      <UButton
        icon="i-lucide-panel-right-close"
        variant="ghost"
        size="sm"
        :aria-label="isCollapsed ? 'Show glossary' : 'Hide glossary'"
        @click="toggleCollapse"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <p class="text-muted text-sm mb-4">
        Learn about neural network concepts as you design your fighter's brain!
      </p>

      <UAccordion
        :items="glossaryTerms.map((item, idx) => ({
          label: item.term,
          icon: item.icon,
          slot: `item-${idx}`,
          content: item.definition
        }))"
        variant="subtle"
      >
        <template v-for="(item, idx) in glossaryTerms" :key="item.term" #[`item-${idx}`]>
          <p class="text-muted text-sm leading-relaxed">
            {{ item.definition }}
          </p>
        </template>
      </UAccordion>

      <!-- Tips Section -->
      <UCard variant="subtle" class="mt-6">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-lightbulb" class="w-4 h-4 text-yellow-500" />
            <span class="font-medium text-sm">Pro Tips</span>
          </div>
        </template>

        <ul class="text-xs text-muted space-y-2">
          <li>• <strong>Wider layers</strong> can detect more patterns</li>
          <li>• <strong>Deeper networks</strong> learn hierarchical features</li>
          <li>• <strong>Too many nodes</strong> may slow training</li>
          <li>• Start simple, add complexity if needed</li>
        </ul>
      </UCard>
    </div>
  </div>
</template>
