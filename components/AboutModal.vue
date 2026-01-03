<script setup lang="ts">
// Props for external control
const props = withDefaults(defineProps<{
  /** When false, hides the internal trigger button for external-only control */
  showTrigger?: boolean
}>(), {
  showTrigger: true
})

const open = defineModel<boolean>('open', { default: false })
const { changelog } = useChangelog()

const version = '2.0.1'

// Get latest 5 changelog entries for display
const recentChangelog = computed(() => changelog.slice(0, 5))

const tabs = [
  {
    label: 'Features',
    icon: 'i-lucide-brain',
    slot: 'features' as const
  },
  {
    label: 'Game Engine',
    icon: 'i-lucide-cog',
    slot: 'engine' as const
  },
  {
    label: 'Neural Network',
    icon: 'i-lucide-network',
    slot: 'network' as const
  },
  {
    label: 'Rendering',
    icon: 'i-lucide-palette',
    slot: 'rendering' as const
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

const renderingLayers = [
  {
    label: 'Layer 1: Clear Canvas',
    content: 'Wipes the entire 1920x1080 frame to transparency to prevent smearing artifacts.'
  },
  {
    label: 'Layer 2: Background',
    content: 'Draws static elements: Sky gradient, stars, moon, and distant mountains. Uses parallax scrolling for depth.'
  },
  {
    label: 'Layer 3: Ground',
    content: 'Renders the floor and foreground trees. Uses simplified geometry for performance.'
  },
  {
    label: 'Layer 4: Fighters',
    content: 'The core layer. Draws procedural skeletons based on physics state, applies "stickman" styling, and renders weapons.'
  },
  {
    label: 'Layer 5: Visual Effects',
    content: 'Particle system layer: blood splashes, hit sparks, and energy auras. Uses additive blending for glow effects.'
  },
  {
    label: 'Layer 6: UI Overlay',
    content: 'Heads-up display: Health bars, energy meters, timer, and round result text. Drawn last to appear on top.'
  }
]
</script>

<template>
  <UModal
    v-model:open="open"
    title="About NeuroEvolution"
    description="AI learns to fight through natural selection"
    :ui="{
      content: 'max-w-full h-[100dvh] sm:max-w-[80vw] sm:h-[90vh]',
      body: 'flex-1 overflow-y-auto'
    }"
  >
    <!-- Trigger: Info button (only shown when showTrigger is true) -->
    <UButton
      v-if="props.showTrigger"
      icon="i-lucide-info"
      aria-label="About NeuroEvolution"
      color="neutral"
      variant="ghost"
      size="sm"
    />

    <template #header>
      <div class="flex items-center justify-between w-full">
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
        <!-- Close button for mobile accessibility -->
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="Close modal"
          class="shrink-0"
          @click="open = false"
        />
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
                  Each fighter has a neural network brain with 13 neurons per hidden layer (26 total across 2 layers)
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

        <!-- Game Engine Tab -->
        <template #engine>
          <div class="space-y-8 animate-fade-in pt-4">
            <!-- Intro -->
            <div class="prose prose-invert max-w-none">
              <p class="text-lg text-slate-300">
                The engine runs a deterministic physics simulation at <strong>60 FPS</strong> using a fixed time-step loop to ensure fairness and reproducibility.
              </p>
            </div>

            <!-- Loop Architecture -->
            <div class="dark:bg-slate-950 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
              <h4 class="text-sm font-bold dark:text-slate-400 text-gray-500 uppercase tracking-wider mb-4">Game Loop Architecture</h4>
              <div class="font-mono text-xs dark:text-slate-300 text-gray-700 dark:bg-slate-900 bg-white p-4 rounded border dark:border-slate-800 border-gray-200 overflow-x-auto whitespace-pre">
1. CHECK MATCH  → Start new match if needed
2. PHYSICS STEP → Process Inputs (Human/AI)
                → Apply Velocity & Gravity
                → Resolve Collisions
                → Update Hitboxes & Timers
3. RENDER       → Draw frame to Canvas
4. REPEAT       → requestAnimationFrame
              </div>
            </div>

            <!-- Physics Constants -->
            <div>
               <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-purple-500 pl-3">Physics Constants</h3>
               <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div class="dark:bg-slate-800 bg-gray-50 p-3 rounded text-center border dark:border-slate-700 border-gray-200">
                     <div class="text-xs dark:text-slate-400 text-gray-500 uppercase">Gravity</div>
                     <div class="text-xl font-mono font-bold text-default">0.8</div>
                     <div class="text-xs text-muted">px/frame²</div>
                  </div>
                  <div class="dark:bg-slate-800 bg-gray-50 p-3 rounded text-center border dark:border-slate-700 border-gray-200">
                     <div class="text-xs dark:text-slate-400 text-gray-500 uppercase">Friction</div>
                     <div class="text-xl font-mono font-bold text-default">0.85</div>
                     <div class="text-xs text-muted">velocity mult</div>
                  </div>
                  <div class="dark:bg-slate-800 bg-gray-50 p-3 rounded text-center border dark:border-slate-700 border-gray-200">
                     <div class="text-xs dark:text-slate-400 text-gray-500 uppercase">Ground Y</div>
                     <div class="text-xl font-mono font-bold text-default">415</div>
                     <div class="text-xs text-muted">pixels</div>
                  </div>
                  <div class="dark:bg-slate-800 bg-gray-50 p-3 rounded text-center border dark:border-slate-700 border-gray-200">
                     <div class="text-xs dark:text-slate-400 text-gray-500 uppercase">Speed Limit</div>
                     <div class="text-xl font-mono font-bold text-default">20</div>
                     <div class="text-xs text-muted">px/frame</div>
                  </div>
               </div>
            </div>

            <!-- Combat Data -->
            <div>
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-red-500 pl-3">Combat Data</h3>
              <div class="overflow-hidden rounded-lg border dark:border-slate-800 border-gray-200">
                <table class="w-full text-left text-sm">
                  <thead class="dark:bg-slate-950 bg-gray-100 dark:text-slate-400 text-gray-500">
                    <tr>
                      <th class="p-3 font-medium">Move</th>
                      <th class="p-3 font-medium">Damage</th>
                      <th class="p-3 font-medium">Energy</th>
                      <th class="p-3 font-medium">Frame Data</th>
                      <th class="p-3 font-medium">Effect</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y dark:divide-slate-800 divide-gray-200 dark:bg-slate-900/50 bg-white">
                    <tr>
                       <td class="p-3 font-bold text-default">Punch</td>
                       <td class="p-3 text-red-500 dark:text-red-400">5</td>
                       <td class="p-3 text-yellow-600 dark:text-yellow-400 font-mono">10</td>
                       <td class="p-3 text-muted">30f cooldown</td>
                       <td class="p-3 text-muted text-xs">Blocked = 0 dmg + Stun</td>
                    </tr>
                    <tr>
                       <td class="p-3 font-bold text-default">Kick</td>
                       <td class="p-3 text-red-500 dark:text-red-400">10</td>
                       <td class="p-3 text-yellow-600 dark:text-yellow-400 font-mono">20</td>
                       <td class="p-3 text-muted">20f cooldown</td>
                       <td class="p-3 text-muted text-xs">Crouched = 0 dmg + Stun</td>
                    </tr>
                    <tr>
                       <td class="p-3 font-bold text-default">Block</td>
                       <td class="p-3 text-muted">-</td>
                       <td class="p-3 text-yellow-600 dark:text-yellow-400 font-mono">0.5/f</td>
                       <td class="p-3 text-muted">Instant</td>
                       <td class="p-3 text-muted text-xs">Negates Punches</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- RPS System -->
            <div class="bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 from-gray-50 to-gray-100 p-6 rounded-xl border dark:border-slate-700 border-gray-200">
               <h3 class="text-lg font-bold text-highlighted mb-4">Strategic Counters (Rock-Paper-Scissors)</h3>
               <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div class="space-y-2">
                     <div class="text-red-500 dark:text-red-400 font-bold text-xl">BLOCK</div>
                     <div class="text-muted text-sm">counters</div>
                     <div class="text-default font-bold">PUNCH</div>
                     <p class="text-xs text-muted">Arm blocks fist perfectly. 0 Damage.</p>
                  </div>
                  <div class="space-y-2">
                     <div class="text-blue-500 dark:text-blue-400 font-bold text-xl">CROUCH</div>
                     <div class="text-muted text-sm">counters</div>
                     <div class="text-default font-bold">KICK</div>
                     <p class="text-xs text-muted">Duck under high kicks. 0 Damage.</p>
                  </div>
                  <div class="space-y-2">
                     <div class="text-green-500 dark:text-green-400 font-bold text-xl">TIMING</div>
                     <div class="text-muted text-sm">counters</div>
                     <div class="text-default font-bold">DEFENSE</div>
                     <p class="text-xs text-muted">Attacking during cooldowns or from behind.</p>
                  </div>
               </div>
            </div>
          </div>
        </template>

        <!-- Neural Network Tab -->
        <template #network>
          <div class="space-y-8 animate-fade-in pt-4">
            <!-- Into -->
            <div class="prose prose-invert max-w-none">
              <p class="text-lg text-muted">
                The AI brain is a <strong>Feed-Forward Neural Network</strong> that processes game state inputs to determine the best action 60 times per second.
              </p>
            </div>

            <!-- Diagrams -->
            <div class="dark:bg-slate-950 bg-gray-50 rounded-xl p-6 border dark:border-slate-800 border-gray-200">
               <h4 class="text-sm font-bold dark:text-slate-400 text-gray-500 uppercase tracking-wider mb-6 text-center">Network Architecture</h4>
               <div class="flex justify-between items-center max-w-lg mx-auto relative">
                  <!-- Input Layer -->
                  <div class="flex flex-col gap-2 items-center">
                    <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                    <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                     <div class="h-8 border-l border-dashed border-slate-700"></div>
                    <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                    <span class="text-xs font-mono text-blue-500 mt-2">9 Inputs</span>
                  </div>

                  <!-- Connections -->
                  <div class="flex-1 h-32 mx-4 relative opacity-30">
                     <!-- Visual flair lines -->
                     <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-y-4 rotate-12"></div>
                     <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-purple-500 transform translate-y-4 -rotate-12"></div>
                     <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  </div>

                  <!-- Hidden Layer -->
                  <div class="flex flex-col gap-2 items-center">
                    <div class="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_15px_theme(colors.purple.500)]"></div>
                    <div class="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_15px_theme(colors.purple.500)]"></div>
                    <div class="h-12 border-l border-dashed border-slate-700"></div>
                    <div class="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_15px_theme(colors.purple.500)]"></div>
                    <span class="text-xs font-mono text-purple-500 mt-2">13 × 2</span>
                  </div>

                  <!-- Connections -->
                  <div class="flex-1 h-32 mx-4 relative opacity-30">
                     <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 to-teal-500 transform -translate-y-2 -rotate-6"></div>
                     <div class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 to-teal-500 transform translate-y-2 rotate-6"></div>
                  </div>

                  <!-- Output Layer -->
                  <div class="flex flex-col gap-2 items-center">
                    <div class="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_theme(colors.teal.500)]"></div>
                    <div class="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_theme(colors.teal.500)]"></div>
                    <div class="h-8 border-l border-dashed border-slate-700"></div>
                    <div class="w-3 h-3 rounded-full bg-teal-500 shadow-[0_0_10px_theme(colors.teal.500)]"></div>
                    <span class="text-xs font-mono text-teal-500 mt-2">8 Outputs</span>
                  </div>
               </div>
            </div>

            <!-- Inputs Table -->
            <div>
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-blue-500 pl-3">Network Inputs (Sensors)</h3>
              <div class="overflow-hidden rounded-lg border dark:border-slate-800 border-gray-200">
                <table class="w-full text-left text-sm">
                  <thead class="dark:bg-slate-950 bg-gray-100 dark:text-slate-400 text-gray-500">
                    <tr>
                      <th class="p-3 font-medium">Input</th>
                      <th class="p-3 font-medium">Description</th>
                      <th class="p-3 font-medium">Range</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y dark:divide-slate-800 divide-gray-200 dark:bg-slate-900/50 bg-white">
                    <tr><td class="p-3 font-mono text-blue-500">distanceX</td><td class="p-3 text-muted">Horiz distance to opponent</td><td class="p-3 font-mono text-muted">-1 to 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">distanceY</td><td class="p-3 text-muted">Vert distance to opponent</td><td class="p-3 font-mono text-muted">-1 to 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">selfHealth</td><td class="p-3 text-muted">Own health percentage</td><td class="p-3 font-mono text-muted">0 to 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">enemyHealth</td><td class="p-3 text-muted">Enemy health percentage</td><td class="p-3 font-mono text-muted">0 to 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">facing</td><td class="p-3 text-muted">Direction facing (L/R)</td><td class="p-3 font-mono text-muted">-1 or 1</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Outputs Table -->
            <div>
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-teal-500 pl-3">Network Outputs (Actions)</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div v-for="(action, i) in ['IDLE', 'LEFT', 'RIGHT', 'JUMP', 'CROUCH', 'PUNCH', 'KICK', 'BLOCK']" :key="action" class="dark:bg-slate-800 bg-gray-50 p-3 rounded border dark:border-slate-700 border-gray-200 flex items-center gap-3">
                   <span class="dark:bg-slate-950 bg-white w-6 h-6 rounded flex items-center justify-center text-xs font-mono text-muted">{{ i }}</span>
                   <span class="font-bold text-default">{{ action }}</span>
                </div>
              </div>
              <p class="text-xs text-muted mt-2 italic">* Multiple outputs can be active simultaneously (e.g., JUMP + KICK)</p>
            </div>

             <!-- Genetic Algo -->
             <div class="dark:bg-slate-800/20 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
                <h3 class="text-lg font-bold text-highlighted mb-4">🧬 Genetic Algorithm</h3>
                <p class="mb-4 text-muted">Instead of backpropagation, we use <strong>Neuroevolution</strong> to train inputs:</p>
                <ol class="space-y-4">
                  <li class="flex gap-4">
                     <span class="flex-shrink-0 w-8 h-8 rounded-full dark:bg-slate-800 bg-white flex items-center justify-center font-bold text-muted border dark:border-slate-700 border-gray-200">1</span>
                     <div>
                        <strong class="text-teal-500 block">Selection</strong>
                        <span class="text-muted">Top performers are chosen as parents using Tournament Selection.</span>
                     </div>
                  </li>
                  <li class="flex gap-4">
                     <span class="flex-shrink-0 w-8 h-8 rounded-full dark:bg-slate-800 bg-white flex items-center justify-center font-bold text-muted border dark:border-slate-700 border-gray-200">2</span>
                     <div>
                        <strong class="text-teal-500 block">Crossover</strong>
                        <span class="text-muted">Child networks inherit weights from two parents.</span>
                     </div>
                  </li>
                  <li class="flex gap-4">
                     <span class="flex-shrink-0 w-8 h-8 rounded-full dark:bg-slate-800 bg-white flex items-center justify-center font-bold text-muted border dark:border-slate-700 border-gray-200">3</span>
                     <div>
                        <strong class="text-teal-500 block">Mutation</strong>
                        <span class="text-muted">Random small changes (±0.04) are applied to weights to discover new strategies.</span>
                     </div>
                  </li>
                </ol>
             </div>
          </div>
        </template>

        <!-- Rendering Tab -->
        <template #rendering>
          <div class="space-y-8 animate-fade-in pt-4">
            <!-- Pipeline -->
            <div>
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-pink-500 pl-3">Rendering Pipeline</h3>
              <p class="text-muted mb-4">The game uses the <code class="text-pink-500 dark:bg-slate-800 bg-gray-100 px-1 rounded">HTML5 Canvas 2D API</code> in immediate mode, redrawing the entire frame 60 times per second.</p>
              
              <UAccordion
                :items="renderingLayers"
                color="primary"
                variant="soft"
                size="sm"
              >
                <template #item="{ item }">
                  <p class="text-sm text-muted p-2">
                    {{ item.content }}
                  </p>
                </template>
              </UAccordion>
            </div>

            <!-- Frame Budget -->
            <div class="dark:bg-slate-950 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
               <h3 class="text-lg font-bold text-highlighted mb-4">16.6ms Frame Budget</h3>
               <div class="space-y-2">
                  <div class="flex h-6 w-full rounded-full overflow-hidden dark:bg-slate-900 bg-gray-200 border dark:border-slate-800 border-gray-300">
                     <div class="bg-blue-500 h-full" style="width: 30%"></div> <!-- Physics -->
                     <div class="bg-purple-500 h-full" style="width: 20%"></div> <!-- AI -->
                     <div class="bg-pink-500 h-full" style="width: 40%"></div> <!-- Render -->
                     <div class="bg-green-500 h-full" style="width: 10%"></div> <!-- Idle -->
                  </div>
                  <div class="flex justify-between text-xs font-mono text-muted pt-1">
                     <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-blue-500"></div> Physics (5ms)</span>
                     <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-purple-500"></div> AI (3ms)</span>
                     <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-pink-500"></div> Render (7ms)</span>
                     <span class="flex items-center gap-1"><div class="w-2 h-2 rounded-full bg-green-500"></div> Idle</span>
                  </div>
               </div>
            </div>

            <!-- Skeleton System -->
            <div class="dark:bg-slate-950 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
              <h3 class="text-lg font-bold text-highlighted mb-4">Skeleton Animation System</h3>
              <div class="flex flex-col md:flex-row gap-8 items-center">
                <div class="font-mono text-xs dark:bg-slate-900 bg-white p-4 rounded text-muted whitespace-pre leading-tight shrink-0 border dark:border-slate-800 border-gray-200">
        O  ← HEAD
        │
    ────┼──── SHOULDER
        │
        ║  ← TORSO
        ║
    ────┼──── HIPS
   /    │    \ 
  ○     │     ○
 KNEE   │    KNEE
        │ 
       FOOT
                </div>
                <div class="flex-1 text-sm text-muted space-y-3">
                  <p>
                    Fighters are not static sprites. They are <strong>procedurally animated skeletons</strong> defined by joint positions.
                  </p>
                  <p>
                    Each frame, logic calculates the position of elbows, hands, knees, and feet based on the current <code>ActionState</code> (e.g., PUNCH, KICK, RUN).
                  </p>
                  <p>
                    This allows for fluid transitions and dynamic posing (e.g., looking at opponent, leaning).
                  </p>
                </div>
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
          <div class="space-y-4 pt-4">
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
