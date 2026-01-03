<template>
  <div :class="[
    'min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700',
    'bg-gray-50 dark:bg-slate-950'
  ]">
    <div class="max-w-md w-full space-y-8">
      <div class="space-y-4">
        <div :class="[
          'inline-block p-4 rounded-full mb-4 border',
          'bg-gray-100 border-gray-200 dark:bg-slate-900 dark:border-slate-700'
        ]">
          <UIcon 
            name="i-heroicons-hand-raised" 
            class="h-12 w-12 text-blue-500 dark:text-blue-400" 
          />
        </div>
        <h1 :class="[
          'text-4xl font-extrabold tracking-tight mb-2',
          'text-gray-900 dark:text-white'
        ]">
          Farewell
        </h1>
        <p class="text-gray-500 dark:text-slate-400 text-lg leading-relaxed">
          We're sorry to see you go. To protect both you and the project, accepting the disclaimer is required to use this application.
        </p>
      </div>

      <div class="pt-8 space-y-4">
        <p class="text-gray-400 dark:text-slate-500 text-sm">
          Changed your mind? You can always return and review the terms again.
        </p>
        <UButton
          @click="onReturn"
          color="success"
          variant="outline"
          size="lg"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
          Return to Disclaimer
        </UButton>
      </div>

      <div class="pt-12">
        <p class="text-gray-400 dark:text-slate-600 text-xs">
          © 2025 NeuroEvolution: Stickman Fighters Team
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  onReturn: () => void;
}

defineProps<Props>();
</script>
