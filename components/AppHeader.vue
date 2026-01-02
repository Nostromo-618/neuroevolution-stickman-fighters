<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-3">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <AboutModal />

      <ColorModeButton />

      <UButton
        to="https://github.com/Nostromo-618/neuroevolution-stickman-fighters"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
</script>
