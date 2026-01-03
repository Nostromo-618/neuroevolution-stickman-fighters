<script setup lang="ts">
const colorMode = useColorMode()

// Mobile menu state
const mobileMenuOpen = ref(false)

// About modal state (shared between desktop button and mobile menu)
const aboutModalOpen = ref(false)

// Color mode options
const colorModes = [
  { value: 'light', label: 'Light', icon: 'i-lucide-sun' },
  { value: 'dark', label: 'Dark', icon: 'i-lucide-moon' },
  { value: 'system', label: 'System', icon: 'i-lucide-monitor' }
] as const

const currentColorModeIcon = computed(() => {
  const mode = colorMode.preference || 'system'
  if (mode === 'system') return 'i-lucide-monitor'
  return mode === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'
})

function setColorMode(mode: 'light' | 'dark' | 'system') {
  colorMode.preference = mode
}

function openAboutModal() {
  mobileMenuOpen.value = false
  aboutModalOpen.value = true
}
</script>

<template>
  <UHeader v-model:open="mobileMenuOpen">
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-3" style="cursor: pointer;">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <!-- Desktop icons (hidden on mobile) -->
    <template #right>
      <div class="hidden lg:flex items-center gap-1.5">
        <!-- Desktop About button (triggers shared modal) -->
        <UButton
          icon="i-lucide-info"
          aria-label="About NeuroEvolution"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="aboutModalOpen = true"
        />

        <ColorModeButton />

        <UButton
          to="https://github.com/Nostromo-618/neuroevolution-stickman-fighters"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </div>
    </template>

    <!-- Mobile menu body (slides down from top) -->
    <template #body>
      <nav class="flex flex-col gap-1 p-2">
        <!-- About -->
        <button
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left hover:bg-elevated transition-colors"
          @click="openAboutModal"
        >
          <UIcon name="i-lucide-info" class="size-5 text-muted" />
          <span class="text-sm font-medium text-default">About</span>
        </button>

        <!-- Theme submenu -->
        <div class="px-3 py-2">
          <div class="flex items-center gap-3 mb-2">
            <UIcon :name="currentColorModeIcon" class="size-5 text-muted" />
            <span class="text-sm font-medium text-default">Theme</span>
          </div>
          <div class="flex gap-2 ml-8">
            <button
              v-for="mode in colorModes"
              :key="mode.value"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors"
              :class="[
                colorMode.preference === mode.value
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-elevated text-muted'
              ]"
              @click="setColorMode(mode.value)"
            >
              <UIcon :name="mode.icon" class="size-4" />
              <span>{{ mode.label }}</span>
            </button>
          </div>
        </div>

        <!-- GitHub -->
        <a
          href="https://github.com/Nostromo-618/neuroevolution-stickman-fighters"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left hover:bg-elevated transition-colors"
        >
          <UIcon name="i-simple-icons-github" class="size-5 text-muted" />
          <span class="text-sm font-medium text-default">GitHub</span>
          <UIcon name="i-lucide-external-link" class="size-3.5 text-muted ml-auto" />
        </a>
      </nav>
    </template>
  </UHeader>

  <!-- Single About modal instance (controlled by desktop button and mobile menu) -->
  <AboutModal v-model:open="aboutModalOpen" :show-trigger="false" />
</template>
