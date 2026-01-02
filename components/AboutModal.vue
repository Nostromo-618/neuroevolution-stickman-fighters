<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const { changelog } = useChangelog()

const version = '2.0.0'

// Get latest 5 changelog entries for display
const recentChangelog = computed(() => changelog.slice(0, 5))

const tabs = [
  {
    label: 'Features',
    icon: 'i-lucide-brain',
    slot: 'features' as const
  },
  {
    label: 'Controls',
    icon: 'i-lucide-gamepad-2',
    slot: 'controls' as const
  },
  {
    label: 'Privacy',
    icon: 'i-lucide-eye-off',
    slot: 'privacy' as const
  },
  {
    label: 'Tips',
    icon: 'i-lucide-lightbulb',
    slot: 'tips' as const
  },
  {
    label: 'Changelog',
    icon: 'i-lucide-history',
    slot: 'changelog' as const
  },
  {
    label: 'Disclaimer',
    icon: 'i-lucide-file-text',
    slot: 'disclaimer' as const
  }
]
</script>

<template>
  <UModal
    v-model:open="open"
    title="About NeuroEvolution"
    description="AI learns to fight through natural selection"
    :ui="{
      content: 'sm:max-w-[80vw] sm:h-[80vh]',
      body: 'flex-1 overflow-y-auto'
    }"
  >
    <!-- Trigger: Info button -->
    <UButton
      icon="i-lucide-info"
      aria-label="About NeuroEvolution"
      color="neutral"
      variant="ghost"
      size="sm"
    />

    <template #header>
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-primary/10">
          <UIcon
            name="i-lucide-brain"
            class="size-6 text-primary"
          />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-highlighted">
            About NeuroEvolution: Stickman Fighters
          </h2>
          <p class="text-sm text-muted">
            AI learns to fight through natural selection
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <UTabs
        :items="tabs"
        variant="link"
        color="primary"
        :ui="{
          list: 'overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0',
          trigger: 'flex-shrink-0 whitespace-nowrap'
        }"
        class="w-full"
      >
        <!-- Features Tab -->
        <template #features>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-dna"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Genetic Algorithm
                </p>
                <p class="text-xs text-muted">
                  AI fighters evolve through mutation and selection over generations
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-network"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Neural Network
                </p>
                <p class="text-xs text-muted">
                  Each fighter has a neural network brain with 16 hidden neurons
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-swords"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Arcade Mode
                </p>
                <p class="text-xs text-muted">
                  Fight against trained AI or watch Script vs Script battles
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-flask-conical"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Training Mode
                </p>
                <p class="text-xs text-muted">
                  Watch AI evolve through generations with real-time fitness tracking
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-code"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Custom Scripts
                </p>
                <p class="text-xs text-muted">
                  Write JavaScript to control fighters with Script A and Script B
                </p>
              </div>
            </div>
          </div>
        </template>

        <!-- Controls Tab -->
        <template #controls>
          <div class="space-y-4 pt-4">
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-keyboard"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div class="flex-1">
                <p class="text-sm font-medium text-default mb-2">
                  Keyboard Controls
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs text-muted">
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">W A S D</kbd>
                    <span>Move</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">↑ ← ↓ →</kbd>
                    <span>Move</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">J</kbd>
                    <span>Punch</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">Space</kbd>
                    <span>Punch</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">K</kbd>
                    <span>Kick</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">L</kbd>
                    <span>Block</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-gamepad-2"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div class="flex-1">
                <p class="text-sm font-medium text-default mb-2">
                  Gamepad Controls
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs text-muted">
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">D-Pad</kbd>
                    <span>Move</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">Left Stick</kbd>
                    <span>Move</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">X / A</kbd>
                    <span>Punch</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">B</kbd>
                    <span>Kick</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <kbd class="px-1.5 py-0.5 rounded bg-muted/20">RB / RT</kbd>
                    <span>Block</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-smartphone"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Touch Controls
                </p>
                <p class="text-xs text-muted">
                  On-screen buttons appear on mobile devices
                </p>
              </div>
            </div>
          </div>
        </template>

        <!-- Privacy Tab -->
        <template #privacy>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-hard-drive"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  100% Local Storage
                </p>
                <p class="text-xs text-muted">
                  All data stays on your device, never sent anywhere
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-user-x"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  No Accounts
                </p>
                <p class="text-xs text-muted">
                  No sign-up, no email, no personal info required
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-scan-eye"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Zero Tracking
                </p>
                <p class="text-xs text-muted">
                  No analytics, no cookies, no fingerprinting
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-wifi-off"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Works Offline
                </p>
                <p class="text-xs text-muted">
                  Full functionality without internet connection
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-heart-handshake"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Free & Open Source
                </p>
                <p class="text-xs text-muted">
                  No ads, no subscriptions, source code on GitHub
                </p>
              </div>
            </div>
          </div>
        </template>

        <!-- Tips Tab -->
        <template #tips>
          <div class="space-y-3 pt-4">
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-play"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Start Training
                </p>
                <p class="text-xs text-muted">
                  Switch to Training mode and click Start to begin AI evolution
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-zap"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Turbo Mode
                </p>
                <p class="text-xs text-muted">
                  Enable Turbo mode for faster training without rendering
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-download"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Export Progress
                </p>
                <p class="text-xs text-muted">
                  Save your trained AI to a file and import it later
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-code"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Write Scripts
                </p>
                <p class="text-xs text-muted">
                  Open Script Editor to write custom JavaScript fighter logic
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-monitor"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Theme Toggle
                </p>
                <p class="text-xs text-muted">
                  Click the theme icon in header for light/dark/system modes
                </p>
              </div>
            </div>
          </div>
        </template>

        <!-- Changelog Tab -->
        <template #changelog>
          <div class="space-y-4 pt-4 max-h-64 overflow-y-auto">
            <div
              v-for="entry in recentChangelog"
              :key="entry.version"
              class="border-b border-default pb-3 last:border-0"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-semibold text-primary">v{{ entry.version }}</span>
                <span class="text-xs text-muted">{{ entry.date }}</span>
              </div>
              <div class="space-y-1.5">
                <div
                  v-if="entry.changes.added?.length"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    name="i-lucide-plus-circle"
                    class="size-3.5 text-success shrink-0 mt-0.5"
                  />
                  <ul class="text-xs text-muted space-y-0.5">
                    <li
                      v-for="(item, i) in entry.changes.added"
                      :key="i"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
                <div
                  v-if="entry.changes.changed?.length"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    name="i-lucide-edit"
                    class="size-3.5 text-info shrink-0 mt-0.5"
                  />
                  <ul class="text-xs text-muted space-y-0.5">
                    <li
                      v-for="(item, i) in entry.changes.changed"
                      :key="i"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
                <div
                  v-if="entry.changes.fixed?.length"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    name="i-lucide-wrench"
                    class="size-3.5 text-warning shrink-0 mt-0.5"
                  />
                  <ul class="text-xs text-muted space-y-0.5">
                    <li
                      v-for="(item, i) in entry.changes.fixed"
                      :key="i"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
                <div
                  v-if="entry.changes.removed?.length"
                  class="flex items-start gap-2"
                >
                  <UIcon
                    name="i-lucide-minus-circle"
                    class="size-3.5 text-error shrink-0 mt-0.5"
                  />
                  <ul class="text-xs text-muted space-y-0.5">
                    <li
                      v-for="(item, i) in entry.changes.removed"
                      :key="i"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Disclaimer Tab -->
        <template #disclaimer>
          <div class="space-y-4 pt-4">
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-alert-triangle"
                class="size-5 text-warning shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Experimental Application
                </p>
                <p class="text-xs text-muted">
                  NeuroEvolution is provided as-is for experimental and educational purposes
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-shield-alert"
                class="size-5 text-warning shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  No Warranties or Liability
                </p>
                <p class="text-xs text-muted">
                  The developer assumes no responsibility for data loss, damages, or issues
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-user-check"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  User Responsibility
                </p>
                <p class="text-xs text-muted">
                  You assume full responsibility for using this application
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-hard-drive"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Local Storage Only
                </p>
                <p class="text-xs text-muted">
                  All data is stored locally. The developer is not responsible for data loss
                </p>
              </div>
            </div>

            <div class="p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p class="text-xs text-warning flex items-start gap-2">
                <UIcon
                  name="i-lucide-info"
                  class="size-4 shrink-0 mt-0.5"
                />
                <span>By using this application, you acknowledge that you have read, understood, and agree to the full disclaimer.</span>
              </p>
            </div>

            <div class="pt-2 border-t border-border">
              <a
                href="https://github.com/Nostromo-618/neuroevolution-stickman-fighters/blob/main/DISCLAIMER.md"
                target="_blank"
                class="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <UIcon
                  name="i-lucide-external-link"
                  class="size-3"
                />
                <span>View full disclaimer on GitHub</span>
              </a>
            </div>
          </div>
        </template>
      </UTabs>
    </template>

    <template #footer>
      <div class="flex items-center justify-between w-full text-xs text-muted">
        <span>v{{ version }}</span>
        <a
          href="https://github.com/Nostromo-618/neuroevolution-stickman-fighters"
          target="_blank"
          class="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <UIcon
            name="i-simple-icons-github"
            class="size-4"
          />
          <span>View on GitHub</span>
        </a>
      </div>
    </template>
  </UModal>
</template>
