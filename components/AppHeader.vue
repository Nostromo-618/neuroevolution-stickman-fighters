<template>
  <header class="sticky top-0 z-50 backdrop-blur-sm bg-slate-950/80 border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- Left: Logo & App Name -->
      <div class="flex items-center gap-3">
        <span class="text-xl">🥊</span>
        <span class="font-bold text-white">NeuroEvolution</span>
        <UBadge color="success" variant="subtle" size="sm">
          v{{ version }}
        </UBadge>
      </div>

      <!-- Right: GitHub Link -->
      <div class="flex items-center gap-4">
        <UButton
          to="https://github.com/Nostromo-618/neuroevolution-stickman-fighters"
          target="_blank"
          icon="i-heroicons-code-bracket"
          color="neutral"
          variant="ghost"
          aria-label="View on GitHub"
        />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const version = '2.0.0';
</script>
