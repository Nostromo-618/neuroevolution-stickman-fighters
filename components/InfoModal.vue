<template>
  <UModal v-model:open="isOpen" :ui="{ width: 'max-w-5xl' }">
    <template #default>
      <!-- Modal is controlled programmatically -->
    </template>
    <template #content>
      <!-- @vue-ignore -->
      <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
        <template #header>
          <div class="flex justify-between items-start">
            <h2 class="text-2xl font-bold text-teal-400 tracking-tight flex items-center gap-2">
              <UIcon :name="headerIcon" class="w-8 h-8" />
              {{ headerTitle }}
            </h2>
            <UButton
              icon="i-heroicons-x-mark"
              color="neutral"
              variant="ghost"
              @click="isOpen = false"
            />
          </div>
        </template>

        <div class="flex flex-col md:flex-row h-[70vh]">
          <!-- Sidebar / Tabs -->
          <div class="bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-800 flex flex-row md:flex-col gap-1 p-2 md:w-56 overflow-x-auto md:overflow-y-auto shrink-0">
            <UButton
              v-for="tab in tabs"
              :key="tab"
              :color="activeTab === tab ? 'success' : 'neutral'"
              :variant="activeTab === tab ? 'solid' : 'ghost'"
              class="justify-start mb-1"
              :icon="tabIcons[tab]"
              @click="activeTab = tab"
            >
              {{ tabLabels[tab] }}
            </UButton>
          </div>

          <!-- Content Area -->
          <div class="flex-1 overflow-y-auto bg-slate-900 custom-scrollbar">
            <div class="p-6 space-y-8 text-slate-300 leading-relaxed text-sm">
              
              <!-- MODES CONTENT -->
              <div v-if="activeTab === 'MODES'" class="space-y-6 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-teal-500/30 transition-colors">
                    <UIcon name="i-heroicons-user" class="w-8 h-8 text-teal-400 mb-3" />
                    <h3 class="text-lg font-bold text-white mb-2">Arcade Mode</h3>
                    <p class="text-slate-400">Fight against the best trained AI from the current generation. Test your skills against an opponent that learns from evolution!</p>
                  </div>
                  <div class="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-teal-500/30 transition-colors">
                    <UIcon name="i-heroicons-beaker" class="w-8 h-8 text-purple-400 mb-3" />
                    <h3 class="text-lg font-bold text-white mb-2">Training Mode</h3>
                    <p class="text-slate-400">Watch the evolutionary process in real-time. Observe hundreds of AI agents fighting, mutating, and evolving to become stronger.</p>
                  </div>
                </div>
              </div>

              <!-- CONTROLS CONTENT -->
              <div v-if="activeTab === 'CONTROLS'" class="space-y-6 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-4">
                    <div class="flex items-center gap-2 text-white border-b border-slate-700 pb-2">
                      <UIcon name="i-heroicons-computer-desktop" class="w-5 h-5 text-teal-400" />
                      <h3 class="font-bold">Keyboard</h3>
                    </div>
                    <ul class="space-y-3">
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Movement</span>
                        <div class="flex gap-1"><UKbd>W</UKbd><UKbd>A</UKbd><UKbd>S</UKbd><UKbd>D</UKbd></div>
                      </li>
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Punch</span>
                        <div class="flex gap-1"><UKbd>J</UKbd> <span class="text-xs self-center text-slate-500">or</span> <UKbd>Space</UKbd></div>
                      </li>
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Kick</span>
                        <UKbd>K</UKbd>
                      </li>
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Block</span>
                        <div class="flex gap-1"><UKbd>L</UKbd> <span class="text-xs self-center text-slate-500">or</span> <UKbd>Shift</UKbd></div>
                      </li>
                    </ul>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-center gap-2 text-white border-b border-slate-700 pb-2">
                      <UIcon name="i-heroicons-device-gamepad" class="w-5 h-5 text-purple-400" />
                      <h3 class="font-bold">Gamepad</h3>
                    </div>
                    <ul class="space-y-3">
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Movement</span>
                        <span class="text-xs bg-slate-700 px-2 py-1 rounded text-white">D-Pad / Left Stick</span>
                      </li>
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Punch</span>
                        <div class="flex gap-1"><span class="text-xs bg-blue-600 px-2 py-1 rounded text-white font-bold">X</span> <span class="text-xs bg-green-600 px-2 py-1 rounded text-white font-bold">A</span></div>
                      </li>
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Kick</span>
                        <span class="text-xs bg-red-600 px-2 py-1 rounded text-white font-bold">B</span>
                      </li>
                      <li class="flex items-center justify-between bg-slate-800/30 p-2 rounded">
                        <span>Block</span>
                        <span class="text-xs bg-slate-700 px-2 py-1 rounded text-white">RB / RT</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- NETWORK CONTENT -->
              <div v-if="activeTab === 'NETWORK'" class="space-y-8 animate-fade-in">
                <!-- Into -->
                <div class="prose prose-invert max-w-none">
                  <p class="text-lg text-slate-300">
                    The AI brain is a <strong>Feed-Forward Neural Network</strong> that processes game state inputs to determine the best action 60 times per second.
                  </p>
                </div>

                <!-- Diagrams -->
                <div class="bg-slate-950 rounded-xl p-6 border border-slate-800">
                   <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Network Architecture</h4>
                   <div class="flex justify-between items-center max-w-lg mx-auto relative">
                      <!-- Input Layer -->
                      <div class="flex flex-col gap-2 items-center">
                        <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                        <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                         <div class="h-8 border-l border-dashed border-slate-700"></div>
                        <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_theme(colors.blue.500)]"></div>
                        <span class="text-xs font-mono text-blue-400 mt-2">9 Inputs</span>
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
                        <span class="text-xs font-mono text-purple-400 mt-2">16 Hidden</span>
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
                        <span class="text-xs font-mono text-teal-400 mt-2">8 Outputs</span>
                      </div>
                   </div>
                </div>

                <!-- Inputs Table -->
                <div>
                  <h3 class="text-lg font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">Network Inputs (Sensors)</h3>
                  <div class="overflow-hidden rounded-lg border border-slate-800">
                    <table class="w-full text-left text-sm">
                      <thead class="bg-slate-950 text-slate-400">
                        <tr>
                          <th class="p-3 font-medium">Input</th>
                          <th class="p-3 font-medium">Description</th>
                          <th class="p-3 font-medium">Range</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800 bg-slate-900/50">
                        <tr><td class="p-3 font-mono text-blue-400">distanceX</td><td class="p-3 text-slate-300">Horiz distance to opponent</td><td class="p-3 font-mono text-slate-500">-1 to 1</td></tr>
                        <tr><td class="p-3 font-mono text-blue-400">distanceY</td><td class="p-3 text-slate-300">Vert distance to opponent</td><td class="p-3 font-mono text-slate-500">-1 to 1</td></tr>
                        <tr><td class="p-3 font-mono text-blue-400">selfHealth</td><td class="p-3 text-slate-300">Own health percentage</td><td class="p-3 font-mono text-slate-500">0 to 1</td></tr>
                        <tr><td class="p-3 font-mono text-blue-400">enemyHealth</td><td class="p-3 text-slate-300">Enemy health percentage</td><td class="p-3 font-mono text-slate-500">0 to 1</td></tr>
                        <tr><td class="p-3 font-mono text-blue-400">facing</td><td class="p-3 text-slate-300">Direction facing (L/R)</td><td class="p-3 font-mono text-slate-500">-1 or 1</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Outputs Table -->
                <div>
                  <h3 class="text-lg font-bold text-white mb-4 border-l-4 border-teal-500 pl-3">Network Outputs (Actions)</h3>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div v-for="(action, i) in ['IDLE', 'LEFT', 'RIGHT', 'JUMP', 'CROUCH', 'PUNCH', 'KICK', 'BLOCK']" :key="action" class="bg-slate-800 p-3 rounded border border-slate-700 flex items-center gap-3">
                       <span class="bg-slate-950 w-6 h-6 rounded flex items-center justify-center text-xs font-mono text-slate-500">{{ i }}</span>
                       <span class="font-bold text-slate-200">{{ action }}</span>
                    </div>
                  </div>
                  <p class="text-xs text-slate-500 mt-2 italic">* Multiple outputs can be active simultaneously (e.g., JUMP + KICK)</p>
                </div>

                 <!-- Genetic Algo -->
                 <div class="bg-slate-800/20 p-6 rounded-xl border border-slate-800">
                    <h3 class="text-lg font-bold text-white mb-4">🧬 Genetic Algorithm</h3>
                    <p class="mb-4">Instead of backpropagation, we use <strong>Neuroevolution</strong> to train inputs:</p>
                    <ol class="space-y-4">
                      <li class="flex gap-4">
                         <span class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">1</span>
                         <div>
                            <strong class="text-teal-400 block">Selection</strong>
                            <span class="text-slate-400">Top performers are chosen as parents using Tournament Selection.</span>
                         </div>
                      </li>
                      <li class="flex gap-4">
                         <span class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">2</span>
                         <div>
                            <strong class="text-teal-400 block">Crossover</strong>
                            <span class="text-slate-400">Child networks inherit weights from two parents.</span>
                         </div>
                      </li>
                      <li class="flex gap-4">
                         <span class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">3</span>
                         <div>
                            <strong class="text-teal-400 block">Mutation</strong>
                            <span class="text-slate-400">Random small changes (±0.04) are applied to weights to discover new strategies.</span>
                         </div>
                      </li>
                    </ol>
                 </div>
              </div>


              <!-- ENGINE CONTENT -->
              <div v-if="activeTab === 'ENGINE'" class="space-y-8 animate-fade-in">
                <!-- Intro -->
                <div class="prose prose-invert max-w-none">
                  <p class="text-lg text-slate-300">
                    The engine runs a deterministic physics simulation at <strong>60 FPS</strong> using a fixed time-step loop to ensure fairness and reproducibility.
                  </p>
                </div>

                <!-- Loop Architecture -->
                <div class="bg-slate-950 p-6 rounded-xl border border-slate-800">
                  <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Game Loop Architecture</h4>
                  <div class="font-mono text-xs text-slate-300 bg-slate-900 p-4 rounded border border-slate-800 overflow-x-auto whitespace-pre">
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
                   <h3 class="text-lg font-bold text-white mb-4 border-l-4 border-purple-500 pl-3">Physics Constants</h3>
                   <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div class="bg-slate-800 p-3 rounded text-center border border-slate-700">
                         <div class="text-xs text-slate-400 uppercase">Gravity</div>
                         <div class="text-xl font-mono font-bold text-white">0.8</div>
                         <div class="text-xs text-slate-500">px/frame²</div>
                      </div>
                      <div class="bg-slate-800 p-3 rounded text-center border border-slate-700">
                         <div class="text-xs text-slate-400 uppercase">Friction</div>
                         <div class="text-xl font-mono font-bold text-white">0.85</div>
                         <div class="text-xs text-slate-500">velocity mult</div>
                      </div>
                      <div class="bg-slate-800 p-3 rounded text-center border border-slate-700">
                         <div class="text-xs text-slate-400 uppercase">Ground Y</div>
                         <div class="text-xl font-mono font-bold text-white">380</div>
                         <div class="text-xs text-slate-500">pixels</div>
                      </div>
                      <div class="bg-slate-800 p-3 rounded text-center border border-slate-700">
                         <div class="text-xs text-slate-400 uppercase">Speed Limit</div>
                         <div class="text-xl font-mono font-bold text-white">20</div>
                         <div class="text-xs text-slate-500">px/frame</div>
                      </div>
                   </div>
                </div>

                <!-- Combat Data -->
                <div>
                  <h3 class="text-lg font-bold text-white mb-4 border-l-4 border-red-500 pl-3">Combat Data</h3>
                  <div class="overflow-hidden rounded-lg border border-slate-800">
                    <table class="w-full text-left text-sm">
                      <thead class="bg-slate-950 text-slate-400">
                        <tr>
                          <th class="p-3 font-medium">Move</th>
                          <th class="p-3 font-medium">Damage</th>
                          <th class="p-3 font-medium">Energy</th>
                          <th class="p-3 font-medium">Frame Data</th>
                          <th class="p-3 font-medium">Effect</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-800 bg-slate-900/50">
                        <tr>
                           <td class="p-3 font-bold text-white">Punch</td>
                           <td class="p-3 text-red-400">5</td>
                           <td class="p-3 text-yellow-400 font-mono">10</td>
                           <td class="p-3 text-slate-400">30f cooldown</td>
                           <td class="p-3 text-slate-400 text-xs">Blocked = 0 dmg + Stun</td>
                        </tr>
                        <tr>
                           <td class="p-3 font-bold text-white">Kick</td>
                           <td class="p-3 text-red-400">10</td>
                           <td class="p-3 text-yellow-400 font-mono">20</td>
                           <td class="p-3 text-slate-400">20f cooldown</td>
                           <td class="p-3 text-slate-400 text-xs">Crouched = 0 dmg + Stun</td>
                        </tr>
                        <tr>
                           <td class="p-3 font-bold text-white">Block</td>
                           <td class="p-3 text-slate-500">-</td>
                           <td class="p-3 text-yellow-400 font-mono">0.5/f</td>
                           <td class="p-3 text-slate-400">Instant</td>
                           <td class="p-3 text-slate-400 text-xs">Negates Punches</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- RPS System -->
                <div class="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl border border-slate-700">
                   <h3 class="text-lg font-bold text-white mb-4">Strategic Counters (Rock-Paper-Scissors)</h3>
                   <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div class="space-y-2">
                         <div class="text-red-400 font-bold text-xl">BLOCK</div>
                         <div class="text-slate-500 text-sm">counters</div>
                         <div class="text-white font-bold">PUNCH</div>
                         <p class="text-xs text-slate-400">Arm blocks fist perfectly. 0 Damage.</p>
                      </div>
                      <div class="space-y-2">
                         <div class="text-blue-400 font-bold text-xl">CROUCH</div>
                         <div class="text-slate-500 text-sm">counters</div>
                         <div class="text-white font-bold">KICK</div>
                         <p class="text-xs text-slate-400">Duck under high kicks. 0 Damage.</p>
                      </div>
                      <div class="space-y-2">
                         <div class="text-green-400 font-bold text-xl">TIMING</div>
                         <div class="text-slate-500 text-sm">counters</div>
                         <div class="text-white font-bold">DEFENSE</div>
                         <p class="text-xs text-slate-400">Attacking during cooldowns or from behind.</p>
                      </div>
                   </div>
                </div>
              </div>
               
              <!-- RENDERING CONTENT -->
              <div v-if="activeTab === 'RENDERING'" class="space-y-8 animate-fade-in">
                 
                 <!-- Pipeline -->
                 <div>
                    <h3 class="text-lg font-bold text-white mb-4 border-l-4 border-pink-500 pl-3">Rendering Pipeline</h3>
                    <p class="text-slate-300 mb-4">The game uses the <code class="text-pink-300 bg-slate-800 px-1 rounded">HTML5 Canvas 2D API</code> in immediate mode, redrawing the entire frame 60 times per second.</p>
                    
                    <div class="space-y-2">
                       <div class="flex items-center p-3 bg-slate-800 rounded border-l-4 border-slate-600">
                          <span class="font-bold text-slate-300 w-24">Layer 1</span>
                          <span class="text-slate-400">Clear Canvas</span>
                       </div>
                       <div class="flex items-center p-3 bg-slate-800 rounded border-l-4 border-blue-900">
                          <span class="font-bold text-blue-300 w-24">Layer 2</span>
                          <span class="text-slate-400">Background (Sky, Moon, Stars, Mountains)</span>
                       </div>
                       <div class="flex items-center p-3 bg-slate-800 rounded border-l-4 border-green-900">
                          <span class="font-bold text-green-300 w-24">Layer 3</span>
                          <span class="text-slate-400">Ground & Close Trees</span>
                       </div>
                       <div class="flex items-center p-3 bg-slate-800 rounded border-l-4 border-red-900">
                          <span class="font-bold text-red-300 w-24">Layer 4</span>
                          <span class="text-slate-400">Fighters (Skeleton + Stickman Drawing)</span>
                       </div>
                       <div class="flex items-center p-3 bg-slate-800 rounded border-l-4 border-yellow-500">
                          <span class="font-bold text-yellow-300 w-24">Layer 5</span>
                          <span class="text-slate-400">Visual Effects (Hit glow, Particles)</span>
                       </div>
                       <div class="flex items-center p-3 bg-slate-800 rounded border-l-4 border-white">
                          <span class="font-bold text-white w-24">Layer 6</span>
                          <span class="text-slate-400">UI Overlay (Health Bars, Timer)</span>
                       </div>
                    </div>
                 </div>

                 <!-- Skeleton System -->
                 <div class="bg-slate-950 p-6 rounded-xl border border-slate-800">
                    <h3 class="text-lg font-bold text-white mb-4">Skeleton Animation System</h3>
                    <div class="flex flex-col md:flex-row gap-8 items-center">
                       <div class="font-mono text-xs bg-slate-900 p-4 rounded text-slate-300 whitespace-pre leading-tight">
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
                       <div class="flex-1 text-sm text-slate-400 space-y-3">
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

              <!-- ABOUT CONTENT -->
              <div v-if="activeTab === 'ABOUT'" class="space-y-6 animate-fade-in">
                 <div class="prose prose-invert">
                    <p>
                      **NeuroEvolution: Stickman Fighters** is an experimental project exploring the intersection of genetic algorithms, neural networks, and real-time physics simulation.
                    </p>
                    <p>
                      Built with <strong>Nuxt 3</strong>, <strong>Vue 3</strong>, and <strong>HTML5 Canvas</strong>.
                    </p>
                 </div>
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

type TabType = 'MODES' | 'CONTROLS' | 'ENGINE' | 'NETWORK' | 'RENDERING' | 'ABOUT';
const activeTab = ref<TabType>('MODES');

const tabs: TabType[] = ['MODES', 'CONTROLS', 'ENGINE', 'NETWORK', 'RENDERING', 'ABOUT'];

const tabLabels: Record<TabType, string> = {
  MODES: 'Game Modes',
  CONTROLS: 'Controls',
  ENGINE: 'Game Engine',
  NETWORK: 'Neural Network',
  RENDERING: 'Rendering',
  ABOUT: 'About'
};

const tabIcons: Record<TabType, string> = {
  MODES: 'i-heroicons-play-circle',
  CONTROLS: 'i-heroicons-command-line',
  ENGINE: 'i-heroicons-cog-6-tooth',
  NETWORK: 'i-heroicons-cpu-chip',
  RENDERING: 'i-heroicons-paint-brush',
  ABOUT: 'i-heroicons-information-circle'
};

// Computed title for header
const headerTitle = computed(() => activeTab.value === 'MODES' ? 'Select Mode' : tabLabels[activeTab.value]);
const headerIcon = computed(() => tabIcons[activeTab.value]);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0f172a; 
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569; 
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
