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

const version = '2.0.7'

// Get all changelog entries for display
const recentChangelog = computed(() => changelog)

const tabs = [
  {
    label: 'Features',
    icon: 'i-lucide-brain',
    slot: 'features' as const
  },
  {
    label: 'Training',
    icon: 'i-lucide-graduation-cap',
    slot: 'training' as const
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
    label: 'Layer 5: Hitbox Indicators',
    content: 'Renders subtle white semi-transparent circles to indicate active attack hitboxes during punches and kicks. Purely visual feedback for debugging and player awareness.'
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

        <!-- Training Tab -->
        <template #training>
          <div class="space-y-8 animate-fade-in pt-4">
            <!-- Intro -->
            <div class="prose prose-invert max-w-none">
              <p class="text-lg text-slate-300">
                AI fighters evolve through <strong>neuroevolution</strong> — competing in matches, earning fitness scores, and passing their successful neural network weights to the next generation.
              </p>
            </div>

            <!-- Training Modes Overview -->
            <div class="dark:bg-slate-950 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-teal-500 pl-3">Training Modes</h3>
              
              <div class="grid md:grid-cols-3 gap-4">
                <!-- Live Training -->
                <div class="dark:bg-slate-900 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <h4 class="font-bold text-default">Live Training</h4>
                  </div>
                  <p class="text-xs text-muted mb-2">
                    Watch AI evolve in real-time. Train against <strong class="text-green-400">Custom Scripts</strong> or other AI fighters.
                  </p>
                  <UBadge color="green" variant="soft" size="sm">Script Compatible</UBadge>
                </div>

                <!-- Turbo Training -->
                <div class="dark:bg-slate-900 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 rounded-full bg-amber-500" />
                    <h4 class="font-bold text-default">Turbo Training</h4>
                  </div>
                  <p class="text-xs text-muted mb-2">
                    Lightning-fast AI vs AI training. Up to <strong class="text-amber-400">99x speed</strong> via Web Workers.
                  </p>
                  <UBadge color="amber" variant="soft" size="sm">AI vs AI Only</UBadge>
                </div>

                <!-- Background Training -->
                <div class="dark:bg-slate-900 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500" />
                    <h4 class="font-bold text-default">Background Training</h4>
                  </div>
                  <p class="text-xs text-muted mb-2">
                    AI trains in background while you play <strong class="text-blue-400">Arcade mode</strong>. Multitask learning!
                  </p>
                  <UBadge color="blue" variant="soft" size="sm">AI vs AI Only</UBadge>
                </div>
              </div>
            </div>

            <!-- Live Training Deep Dive -->
            <div class="dark:bg-gradient-to-r dark:from-green-950/30 dark:to-slate-950 bg-gradient-to-r from-green-50 to-gray-50 p-6 rounded-xl border dark:border-green-900/50 border-green-200">
              <h3 class="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-play-circle" class="size-5" />
                Live Training: Script vs AI
              </h3>
              
              <div class="space-y-4">
                <p class="text-muted text-sm">
                  This is the most <strong class="text-green-400">powerful training strategy</strong>: write a challenging script, then let the AI evolve specifically to beat YOUR strategy!
                </p>

                <div class="dark:bg-slate-900/50 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200">
                  <h4 class="text-sm font-bold text-default mb-2">How It Works</h4>
                  <ol class="text-xs text-muted space-y-1 list-decimal list-inside">
                    <li>Write a script with your best fighting strategy in Script A or B</li>
                    <li>Set Training mode opponent to your Custom Script</li>
                    <li>Start Live Training (non-turbo)</li>
                    <li>AI fighters battle your script round by round</li>
                    <li>Each match updates the AI's fitness score</li>
                    <li>After enough matches, the best AI evolve and mutate</li>
                    <li>Repeat until AI learns to counter your strategy!</li>
                  </ol>
                </div>

                <UAlert
                  color="success"
                  variant="soft"
                  icon="i-lucide-sparkles"
                  title="Pro Tip"
                  description="Your script acts as a consistent sparring partner. The AI will specifically adapt to beat whatever patterns you programmed!"
                />
              </div>
            </div>

            <!-- Mode Comparison Table -->
            <div>
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-purple-500 pl-3">Mode Comparison</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="dark:bg-slate-950 bg-gray-100 dark:text-slate-400 text-gray-500">
                    <tr>
                      <th class="p-3 font-medium">Mode</th>
                      <th class="p-3 font-medium">Script Support</th>
                      <th class="p-3 font-medium">Genome Updated</th>
                      <th class="p-3 font-medium">Speed</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y dark:divide-slate-800 divide-gray-200 dark:bg-slate-900/50 bg-white">
                    <tr>
                      <td class="p-3 font-bold text-green-400">Live Training</td>
                      <td class="p-3"><span class="text-green-400">✓ Yes</span></td>
                      <td class="p-3"><span class="text-green-400">✓ Yes</span></td>
                      <td class="p-3 text-muted">1x (real-time)</td>
                    </tr>
                    <tr>
                      <td class="p-3 font-bold text-amber-400">Turbo Training</td>
                      <td class="p-3"><span class="text-red-400">✗ No</span></td>
                      <td class="p-3"><span class="text-green-400">✓ Yes</span></td>
                      <td class="p-3 text-muted">Up to 99x</td>
                    </tr>
                    <tr>
                      <td class="p-3 font-bold text-blue-400">Background (Arcade)</td>
                      <td class="p-3"><span class="text-red-400">✗ No</span></td>
                      <td class="p-3"><span class="text-green-400">✓ Yes</span></td>
                      <td class="p-3 text-muted">Parallel workers</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Fitness Formula -->
            <div class="dark:bg-slate-950 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-amber-500 pl-3">Fitness Calculation</h3>
              <p class="text-muted text-sm mb-4">
                Each match updates the genome's fitness score based on combat performance:
              </p>

              <div class="space-y-4">
                <div class="dark:bg-slate-900 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200 font-mono text-xs">
                  <div class="text-slate-500 mb-2">// Per-match fitness calculation</div>
                  <div><span class="text-purple-400">damageDealt</span> = <span class="text-blue-400">100</span> - opponent.health</div>
                  <div><span class="text-purple-400">healthRemaining</span> = self.health</div>
                  <div class="mt-2 text-slate-500">// Base rewards</div>
                  <div>fitness += <span class="text-purple-400">damageDealt</span> × <span class="text-amber-400">2</span></div>
                  <div>fitness += <span class="text-purple-400">healthRemaining</span> × <span class="text-amber-400">2.5</span></div>
                  <div class="mt-2 text-slate-500">// Win bonuses</div>
                  <div class="text-green-400">if (won by KO) fitness += 300</div>
                  <div class="text-yellow-400">if (won by timeout) fitness += 150</div>
                  <div class="mt-2 text-slate-500">// Penalty for passive play</div>
                  <div class="text-red-400">if (timeout && totalDamage &lt; 30) fitness -= 100</div>
                </div>

                <div class="grid md:grid-cols-3 gap-3">
                  <div class="dark:bg-slate-800 bg-gray-100 p-3 rounded text-center border dark:border-slate-700 border-gray-200">
                    <div class="text-xs dark:text-slate-400 text-gray-500 uppercase">Damage Weight</div>
                    <div class="text-xl font-mono font-bold text-amber-400">2x</div>
                  </div>
                  <div class="dark:bg-slate-800 bg-gray-100 p-3 rounded text-center border dark:border-slate-700 border-gray-200">
                    <div class="text-xs dark:text-slate-400 text-gray-500 uppercase">Health Weight</div>
                    <div class="text-xl font-mono font-bold text-green-400">2.5x</div>
                  </div>
                  <div class="dark:bg-slate-800 bg-gray-100 p-3 rounded text-center border dark:border-slate-700 border-gray-200">
                    <div class="text-xs dark:text-slate-400 text-gray-500 uppercase">KO Bonus</div>
                    <div class="text-xl font-mono font-bold text-purple-400">+300</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Smart Adaptive Mutation -->
            <div class="dark:bg-gradient-to-r dark:from-amber-950/30 dark:to-slate-950 bg-gradient-to-r from-amber-50 to-gray-50 p-6 rounded-xl border dark:border-amber-900/50 border-amber-200">
              <h3 class="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-trending-up" class="size-5" />
                Smart Adaptive Mutation
              </h3>
              
              <div class="space-y-4">
                <p class="text-muted text-sm">
                  When <strong class="text-amber-400">Intelligent Mutation</strong> is enabled, the mutation rate automatically adapts using a combined strategy:
                </p>

                <div class="grid md:grid-cols-3 gap-4">
                  <!-- Base Decay -->
                  <div class="dark:bg-slate-900/50 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-3 h-3 rounded-full bg-teal-500" />
                      <h4 class="font-bold text-default text-sm">Base Decay</h4>
                    </div>
                    <p class="text-xs text-muted mb-2">
                      Starts at <strong class="text-teal-400">30%</strong>, decays by 0.8% per generation down to a <strong class="text-teal-400">5% floor</strong>.
                    </p>
                    <div class="font-mono text-xs text-teal-500">30% → 5%</div>
                  </div>

                  <!-- Plateau Spike -->
                  <div class="dark:bg-slate-900/50 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-3 h-3 rounded-full bg-red-500" />
                      <h4 class="font-bold text-default text-sm">Plateau Detection</h4>
                    </div>
                    <p class="text-xs text-muted mb-2">
                      If no fitness improvement for <strong class="text-red-400">5 generations</strong>, spikes back to <strong class="text-red-400">20%</strong>.
                    </p>
                    <div class="font-mono text-xs text-red-500">Stagnation → 20%</div>
                  </div>

                  <!-- Oscillation -->
                  <div class="dark:bg-slate-900/50 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200">
                    <div class="flex items-center gap-2 mb-2">
                      <div class="w-3 h-3 rounded-full bg-blue-500" />
                      <h4 class="font-bold text-default text-sm">Periodic Boost</h4>
                    </div>
                    <p class="text-xs text-muted mb-2">
                      Every <strong class="text-blue-400">25 generations</strong>, adds a <strong class="text-blue-400">+5%</strong> boost to escape local minima.
                    </p>
                    <div class="font-mono text-xs text-blue-500">Gen 25, 50, 75...</div>
                  </div>
                </div>

                <div class="dark:bg-slate-900/50 bg-white p-4 rounded-lg border dark:border-slate-700 border-gray-200 font-mono text-xs">
                  <div class="text-slate-500 mb-2">// Mutation rate calculation</div>
                  <div><span class="text-purple-400">baseRate</span> = max(<span class="text-amber-400">0.05</span>, <span class="text-amber-400">0.30</span> - generation × <span class="text-amber-400">0.008</span>)</div>
                  <div class="mt-1"><span class="text-red-400">if</span> (noImprovement for 5 gens) rate = max(rate, <span class="text-amber-400">0.20</span>)</div>
                  <div><span class="text-blue-400">if</span> (generation % 25 === 0) rate += <span class="text-amber-400">0.05</span></div>
                  <div class="mt-1"><span class="text-green-400">return</span> clamp(rate, <span class="text-amber-400">0.05</span>, <span class="text-amber-400">0.35</span>)</div>
                </div>

                <UAlert
                  color="warning"
                  variant="soft"
                  icon="i-lucide-chart-line"
                  title="Visualize in Real-Time"
                  description="Watch the amber dashed line on the Fitness Chart to see mutation rate changes. Spikes indicate plateau recovery or periodic boosts!"
                />
              </div>
            </div>

            <!-- Why Scripts Don't Work in Workers -->
            <div class="dark:bg-slate-800/30 bg-gray-50 p-6 rounded-xl border dark:border-slate-700 border-gray-200">
              <h3 class="text-sm font-bold text-highlighted mb-3 flex items-center gap-2">
                <UIcon name="i-lucide-info" class="size-4 text-blue-400" />
                Why Scripts Only Work in Live Training
              </h3>
              <p class="text-xs text-muted leading-relaxed">
                <strong>Turbo</strong> and <strong>Background</strong> training use Web Workers — separate threads that can't access the main browser context. Custom scripts need the sandboxed execution environment on the main thread for security. This is why Script vs AI training runs at 1x speed but is the only way to train against your custom strategies.
              </p>
            </div>

            <!-- Training Tips -->
            <UAlert
              color="primary"
              variant="soft"
              icon="i-lucide-lightbulb"
              title="Recommended Training Strategy"
            >
              <template #description>
                <ol class="mt-2 space-y-1 text-xs text-muted list-decimal list-inside">
                  <li><strong>Initial evolution:</strong> Use Turbo Training (AI vs AI) to quickly establish base fighting skills</li>
                  <li><strong>Strategy refinement:</strong> Write a challenging script that exploits AI weaknesses</li>
                  <li><strong>Targeted training:</strong> Run Live Training with your script to evolve counter-strategies</li>
                  <li><strong>Iterate:</strong> Update your script to be harder, retrain, repeat!</li>
                </ol>
              </template>
            </UAlert>
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

            <!-- Physics Formulas -->
            <div class="dark:bg-slate-950 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-blue-500 pl-3">Physics Formulas (Per Frame)</h3>

              <div class="space-y-4">
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-lucide-move-vertical" class="size-4 text-blue-500" />
                    <h4 class="text-sm font-semibold text-default">Vertical Motion (Gravity)</h4>
                  </div>
                  <code class="block dark:bg-slate-900 bg-white p-3 rounded border dark:border-slate-800 border-gray-200 text-xs font-mono">
                    y += velocityY
                    velocityY += 0.8  // gravity acceleration
                  </code>
                  <p class="text-xs text-muted mt-2">Applied every frame until fighter touches ground (y = 305px)</p>
                </div>

                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-lucide-move-horizontal" class="size-4 text-blue-500" />
                    <h4 class="text-sm font-semibold text-default">Horizontal Motion (Friction)</h4>
                  </div>
                  <code class="block dark:bg-slate-900 bg-white p-3 rounded border dark:border-slate-800 border-gray-200 text-xs font-mono">
                    x += velocityX
                    velocityX *= 0.85  // friction damping
                  </code>
                  <p class="text-xs text-muted mt-2">Reduces speed by 15% each frame, simulating ground friction</p>
                </div>

                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <UIcon name="i-lucide-zap" class="size-4 text-yellow-500" />
                    <h4 class="text-sm font-semibold text-default">Energy System</h4>
                  </div>
                  <code class="block dark:bg-slate-900 bg-white p-3 rounded border dark:border-slate-800 border-gray-200 text-xs font-mono">
                    // Idle regeneration: +0.5 per frame
                    // Active regeneration: +0.2 per frame
                    // Movement cost: -0.5 per frame
                    // Jump cost: -12 (one-time)
                    // Punch cost: -10 (one-time)
                    // Kick cost: -15 (one-time)
                  </code>
                </div>
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

            <!-- Activation Functions -->
            <div class="dark:bg-slate-950 bg-gray-50 p-6 rounded-xl border dark:border-slate-800 border-gray-200">
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-purple-500 pl-3">Activation Functions</h3>

              <div class="grid md:grid-cols-2 gap-6">
                <!-- ReLU -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                    <h4 class="font-bold text-default">ReLU (Hidden Layers)</h4>
                  </div>
                  <code class="block dark:bg-slate-900 bg-white p-3 rounded border dark:border-slate-800 border-gray-200 text-xs font-mono text-purple-500">
                    f(x) = max(0, x)
                  </code>
                  <p class="text-xs text-muted">
                    Rectified Linear Unit: Outputs the input if positive, otherwise 0. Fast to compute and prevents vanishing gradients.
                  </p>
                  <UBadge color="purple" variant="soft" size="sm">Non-linear</UBadge>
                </div>

                <!-- Sigmoid -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-teal-500"></div>
                    <h4 class="font-bold text-default">Sigmoid (Output Layer)</h4>
                  </div>
                  <code class="block dark:bg-slate-900 bg-white p-3 rounded border dark:border-slate-800 border-gray-200 text-xs font-mono text-teal-500">
                    f(x) = 1 / (1 + e^(-x))
                  </code>
                  <p class="text-xs text-muted">
                    Squashes values to (0, 1) range. Perfect for binary decision outputs (attack: yes/no, move left: yes/no).
                  </p>
                  <UBadge color="teal" variant="soft" size="sm">Probabilistic</UBadge>
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
                    <tr><td class="p-3 font-mono text-blue-500">oppAction</td><td class="p-3 text-muted">Opponent's current action</td><td class="p-3 font-mono text-muted">0 to 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">selfEnergy</td><td class="p-3 text-muted">Own energy level</td><td class="p-3 font-mono text-muted">0 to 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">facing</td><td class="p-3 text-muted">Direction facing (L/R)</td><td class="p-3 font-mono text-muted">-1 or 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">oppCooldown</td><td class="p-3 text-muted">Opponent attack cooldown</td><td class="p-3 font-mono text-muted">0 to 1</td></tr>
                    <tr><td class="p-3 font-mono text-blue-500">oppEnergy</td><td class="p-3 text-muted">Opponent energy level</td><td class="p-3 font-mono text-muted">0 to 1</td></tr>
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

             <!-- Forward Propagation Example -->
             <UAlert
               color="primary"
               variant="soft"
               icon="i-lucide-lightbulb"
               title="How the Network Makes Decisions"
               description="Each frame (60 times per second), the network performs forward propagation:"
             >
               <template #description>
                 <ol class="mt-3 space-y-2 text-xs text-muted">
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">1.</span>
                     <span>Collect 9 sensor inputs from game state</span>
                   </li>
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">2.</span>
                     <span>Multiply by input weights (9×13 matrix) + apply biases → 13 hidden neurons</span>
                   </li>
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">3.</span>
                     <span>Apply ReLU activation to hidden layer 1</span>
                   </li>
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">4.</span>
                     <span>Multiply by hidden weights (13×13 matrix) + apply biases → 13 more hidden neurons</span>
                   </li>
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">5.</span>
                     <span>Apply ReLU activation to hidden layer 2</span>
                   </li>
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">6.</span>
                     <span>Multiply by output weights (13×8 matrix) + apply biases → 8 action outputs</span>
                   </li>
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">7.</span>
                     <span>Apply Sigmoid activation → values between 0 and 1</span>
                   </li>
                   <li class="flex gap-2">
                     <span class="font-bold text-primary">8.</span>
                     <span>If output > 0.5, activate that action (PUNCH, JUMP, etc.)</span>
                   </li>
                 </ol>
               </template>
             </UAlert>
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

            <!-- Canvas Optimization Techniques -->
            <div>
              <h3 class="text-lg font-bold text-highlighted mb-4 border-l-4 border-pink-500 pl-3">Performance Optimizations</h3>

              <div class="grid md:grid-cols-2 gap-4">
                <UCard>
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-layers" class="size-5 text-pink-500" />
                      <h4 class="font-semibold text-default">Layer Culling</h4>
                    </div>
                  </template>
                  <p class="text-xs text-muted">
                    Background layers (sky, mountains) only redraw when theme changes, not every frame.
                  </p>
                </UCard>

                <UCard>
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-minimize-2" class="size-5 text-pink-500" />
                      <h4 class="font-semibold text-default">Geometry Simplification</h4>
                    </div>
                  </template>
                  <p class="text-xs text-muted">
                    Stickman fighters use simple line segments instead of complex meshes for 60fps performance.
                  </p>
                </UCard>

                <UCard>
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-target" class="size-5 text-pink-500" />
                      <h4 class="font-semibold text-default">Hitbox Visualization</h4>
                    </div>
                  </template>
                  <p class="text-xs text-muted">
                    Only rendered during active attacks, using semi-transparent white circles for debugging.
                  </p>
                </UCard>

                <UCard>
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-gauge" class="size-5 text-pink-500" />
                      <h4 class="font-semibold text-default">Fixed Time Step</h4>
                    </div>
                  </template>
                  <p class="text-xs text-muted">
                    Renders at 60 FPS using requestAnimationFrame for smooth, deterministic physics.
                  </p>
                </UCard>
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
                  Turbo AI vs AI Training
                </p>
                <p class="text-xs text-muted">
                  Runs training via Web Workers without rendering. Only available for AI vs AI (Custom Scripts require the main thread for synchronous execution).
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-cpu"
                class="size-5 text-primary shrink-0 mt-0.5"
              />
              <div>
                <p class="text-sm font-medium text-default">
                  Background AI vs AI Training
                </p>
                <p class="text-xs text-muted">
                  In Arcade mode, AI continues learning in background workers while you play. Only works with Simple AI opponent (not Custom Scripts).
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
