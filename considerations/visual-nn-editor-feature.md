# Visual Neural Network Editor - Feature Implementation Plan

> **Goal**: Allow users to design custom neural network architectures using a Rete.js-based visual editor with a beautiful, zoomable, draggable canvas—then train fighters with those custom topologies.

![Rete.js Undirected Example](/Users/misteruser/.gemini/antigravity/brain/c45fbc7f-8e88-4d96-a354-4e9c7fc0a2fa/uploaded_image_1767675630941.png)

---

## Executive Summary

This feature enables users to graphically design neural network topologies (add/remove hidden layers, adjust neurons per layer) via a Rete.js node graph editor. The designed architecture then becomes the "brain" for evolving AI fighters—enabling users to test hypotheses like "2 narrow layers vs 1 wide layer."

**This is an educational project** — the visual NN designer is a core learning tool, not a hidden "pro" feature.

---

## Confirmed Design Decisions

| Decision | Answer | Notes |
|----------|--------|-------|
| **Scope** | All modes (Training + Arcade) | Custom architectures apply everywhere |
| **Constraints** | ≤5 hidden layers, ≤50 nodes/layer | Performance ceiling enforced |
| **Architecture Change** | Requires population reset | User confirmation before reset |
| **Feature Visibility** | Prominent, not hidden | Educational focus with theory glossary |
| **Theme Support** | Dark / Light / System | Must follow global `colorMode` |

---

## UI Layout: Educational Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NN EDITOR MODAL (Full Screen or Large Modal)                                │
├────────────────────────────────────────────┬────────────────────────────────┤
│                                            │                                │
│        RETE.JS CANVAS (2/3 width)          │   THEORY GLOSSARY (1/3 width) │
│                                            │                                │
│   ┌─────┐      ┌─────┐      ┌─────┐       │   ── Neural Networks ──        │
│   │INPUT│ ───▶ │ H1  │ ───▶ │ H2  │ ─┐    │   A neural network is a...    │
│   │  9  │      │ 13  │      │ 13  │  │    │                                │
│   └─────┘      └─────┘      └─────┘  │    │   ── Hidden Layers ──          │
│                                      │    │   Hidden layers allow the...   │
│   • Drag to reposition               │    │                                │
│   • Scroll to zoom                   ▼    │   ── Activation Functions ──   │
│   • Click node to edit count   ┌─────┐    │   ReLU: max(0, x)...           │
│                                │OUTPUT    │   Sigmoid: 1/(1+e^-x)...       │
│                                │  8  │    │                                │
│                                └─────┘    │   [▶ Hide Glossary]            │
│                                            │                                │
├────────────────────────────────────────────┴────────────────────────────────┤
│  [+ Add Layer]   Architecture: 9 → 13 → 13 → 8   [Apply & Reset Training]  │
└─────────────────────────────────────────────────────────────────────────────┘

When glossary is hidden:
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RETE.JS CANVAS (FULL WIDTH)                         │
│                                                                             │
│      ┌─────┐           ┌─────┐           ┌─────┐           ┌─────┐         │
│      │INPUT│ ────────▶ │ H1  │ ────────▶ │ H2  │ ────────▶ │OUTPUT         │
│      │  9  │           │ 13  │           │ 13  │           │  8  │         │
│      └─────┘           └─────┘           └─────┘           └─────┘         │
│                                                                             │
│                                                    [◀ Show Glossary]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Analysis

### Current Neural Network System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CURRENT HARDCODED ARCHITECTURE (services/NeuralNetwork.ts)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INPUT (9)  →  HIDDEN₁ (13)  →  HIDDEN₂ (13)  →  OUTPUT (8)               │
│      ↓              ↓                ↓               ↓                      │
│   Fixed          Fixed            Fixed           Fixed                     │
│   (Game         (Config.ts)      (Config.ts)     (FighterAction)           │
│    State)                                                                   │
│                                                                             │
│   Key Files:                                                                │
│   • services/Config.ts        → NN_ARCH.HIDDEN_NODES = 13                  │
│   • services/NeuralNetwork.ts → createRandomNetwork(), predict()           │
│   • types.ts                  → NeuralNetworkData interface                │
│   • services/PersistenceManager.ts → serializeGenome/deserializeGenome     │
│   • components/NeuralNetworkVisualizer.vue → renders 9→13→13→8             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Proposed Flexible Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ NEW FLEXIBLE ARCHITECTURE                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   INPUT (9)  →  [HIDDEN LAYERS...]  →  OUTPUT (8)                          │
│      ↓               ↓                      ↓                               │
│   Fixed         User-Defined            Fixed                               │
│                 via Rete.js                                                 │
│                                                                             │
│   Examples:                                                                 │
│   • Minimal:    9 → 8 → 8 (1 hidden, 8 nodes)                              │
│   • Standard:   9 → 13 → 13 → 8 (2 hidden, 13 nodes each)                  │
│   • Deep:       9 → 20 → 15 → 10 → 8 (3 hidden, variable nodes)            │
│   • Wide:       9 → 50 → 8 (1 hidden, 50 nodes)                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Proposed Changes

### Phase 1: Type System & Core NN Refactor

#### [MODIFY] [types.ts](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/types.ts)

Add new types to support flexible architectures:

```typescript
/** Describes a neural network topology (layer structure) */
export interface NNArchitecture {
  inputNodes: 9;           // Fixed (game state inputs)
  hiddenLayers: number[];  // e.g., [13, 13] or [20, 15, 10]
  outputNodes: 8;          // Fixed (fighter actions)
}

/** Extended network data with variable hidden layers */
export interface FlexibleNeuralNetworkData {
  architecture: NNArchitecture;
  layerWeights: number[][][]; // weights[layer][fromNode][toNode]
  biases: number[][];         // biases[layer][node]
}
```

---

#### [MODIFY] [NeuralNetwork.ts](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/services/NeuralNetwork.ts)

Refactor to support variable-depth architectures:

- **`createNetworkFromArchitecture(arch: NNArchitecture)`**: Create random network for any topology
- **`predictFlexible(network: FlexibleNeuralNetworkData, inputs: number[])`**: Forward pass for N hidden layers
- **`mutateFlexible(...)`**: Mutate variable-depth network
- **`crossoverFlexible(...)`**: Crossover compatible architectures (same topology only)
- Maintain backward-compat functions for hardcoded 9→13→13→8

---

#### [NEW] [services/NNArchitecturePersistence.ts](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/services/NNArchitecturePersistence.ts)

Handle saving/loading custom architectures to localStorage:

```typescript
const STORAGE_KEY = 'neuroevolution_nn_architecture_v1';

export function saveArchitecture(arch: NNArchitecture): void;
export function loadArchitecture(): NNArchitecture | null;
export function getDefaultArchitecture(): NNArchitecture;
```

---

### Phase 2: Rete.js Integration

#### [NEW] [composables/useNNEditor.ts](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/composables/useNNEditor.ts)

Composable for Rete.js editor lifecycle and state:

```typescript
export function useNNEditor() {
  const architecture = ref<NNArchitecture>(getDefaultArchitecture());
  const editorRef = ref<NodeEditor | null>(null);
  
  async function initEditor(container: HTMLElement): Promise<void>;
  function addHiddenLayer(): void;
  function removeHiddenLayer(index: number): void;
  function setLayerSize(layerIndex: number, size: number): void;
  function getArchitecture(): NNArchitecture;
  function applyArchitecture(): void; // Saves and triggers population reset
  
  return { architecture, editorRef, initEditor, addHiddenLayer, ... };
}
```

---

#### [NEW] [components/NNEditor.vue](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/components/NNEditor.vue)

Main visual editor component:

- **Canvas**: Rete.js area with zoom/pan
- **Node Types**:
  - `InputLayerNode` (fixed, 9 ports)
  - `HiddenLayerNode` (configurable node count, draggable)
  - `OutputLayerNode` (fixed, 8 ports)
- **Connections**: Undirected-style circular nodes
- **Controls**: Add Layer, Remove Layer, Apply Architecture
- **Visual**: Match the Rete.js undirected example aesthetic (circular nodes, smooth curves)
- **Theme**: Dynamically switch colors based on `useColorMode()` (dark/light/system)

---

#### [NEW] [components/NNTheoryGlossary.vue](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/components/NNTheoryGlossary.vue)

Collapsible educational panel with NN theory content (1/3 width, right side):

**Glossary Topics:**

| Term | Brief Explanation |
|------|-------------------|
| **Neural Network** | Computational model inspired by biological brains |
| **Neuron (Node)** | Basic unit that receives inputs, applies weights, and outputs a value |
| **Hidden Layer** | Intermediate layers between input and output |
| **Weights** | Strength of connections between neurons (learned via evolution) |
| **Bias** | Offset added to neuron sum before activation |
| **Activation Function** | Non-linear function applied to neuron output |
| **ReLU** | `max(0, x)` — fast, avoids vanishing gradient |
| **Sigmoid** | `1/(1+e^-x)` — outputs 0-1 probability |
| **Forward Pass** | Computing output from inputs through all layers |
| **Neuroevolution** | Training NNs via genetic algorithms, not backpropagation |
| **Mutation** | Random weight changes for exploration |
| **Crossover** | Combining two parent networks to create offspring |

**Component Features:**
- Collapsible with smooth animation
- Persists collapse state to localStorage
- Scrollable content with sticky header
- Links to relevant Wikipedia/resources
- Theme-aware styling (dark/light/system)

**State persistence key:** `neuroevolution_glossary_collapsed_v1`

---

#### [NEW] [components/NNEditorModal.vue](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/components/NNEditorModal.vue)

Full-screen modal wrapper containing NNEditor + NNTheoryGlossary:

**Layout Structure:**
```vue
<template>
  <UModal fullscreen>
    <div class="flex h-full">
      <!-- Canvas: 2/3 width (or full when glossary hidden) -->
      <div :class="glossaryVisible ? 'w-2/3' : 'w-full'">
        <NNEditor @apply="handleApply" />
      </div>
      
      <!-- Glossary: 1/3 width (collapsible) -->
      <NNTheoryGlossary 
        v-if="glossaryVisible" 
        class="w-1/3 border-l" 
        @collapse="glossaryVisible = false" 
      />
      
      <!-- Show button when collapsed -->
      <button v-else @click="glossaryVisible = true">
        ◀ Show Glossary
      </button>
    </div>
    
    <!-- Footer -->
    <div class="border-t p-4 flex justify-between">
      <span>Architecture: {{ architectureSummary }}</span>
      <UButton @click="handleApply">Apply & Reset Training</UButton>
    </div>
  </UModal>
</template>
```

**Features:**
- Opens via button in Training Parameters panel
- Shows current architecture summary (e.g., "9 → 20 → 15 → 8")
- "Apply & Reset Training" with confirmation toast
- Warning about losing current progress

---

### Phase 3: Evolution Engine Integration

#### [MODIFY] [useEvolution.ts](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/composables/useEvolution.ts)

Update evolution logic to use custom architecture:

- Load architecture from persistence on init
- Pass architecture to `createNetworkFromArchitecture()` when creating new population
- Ensure crossover only happens between same-architecture genomes

---

#### [MODIFY] [TrainingWorker.ts](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/services/TrainingWorker.ts)

Update web worker to handle flexible architectures:

- Accept architecture config via worker message
- Use `predictFlexible()` for headless sim
- Include architecture in evolved genomes

---

#### [MODIFY] [PersistenceManager.ts](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/services/PersistenceManager.ts)

Extend genome serialization for flexible architectures:

- Include architecture in serialized genome
- Validate architecture match on load (or show migration warning)
- Clear population when architecture changes

---

### Phase 4: UI Integration

#### [MODIFY] [TrainingParameters.vue](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/components/TrainingParameters.vue)

Add "Edit Network Architecture" button:

- Shows current architecture summary (e.g., "9 → 20 → 15 → 8")
- Opens NNEditorModal on click
- Disabled during active training (requires reset)

---

#### [MODIFY] [NeuralNetworkVisualizer.vue](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/components/NeuralNetworkVisualizer.vue)

Already supports dynamic layer sizes (reads from network structure). Minor update:

- Add layer count detection for N hidden layers (currently assumes 2)
- Adjust X positions dynamically based on layer count

---

### Phase 5: Package Installation

#### [MODIFY] [package.json](file:///Users/misteruser/Desktop/GitHub/neuroevolution-stickman-fighters/package.json)

Add Rete.js dependencies:

```json
{
  "dependencies": {
    "rete": "^2.0.0",
    "rete-vue-plugin": "^2.0.0",
    "rete-area-plugin": "^2.0.0",
    "rete-connection-plugin": "^2.0.0",
    "rete-render-utils": "^2.0.0"
  }
}
```

---

## Verification Plan

### Automated Tests (Playwright)

New E2E test file: `tests/nn-editor.spec.ts`

```typescript
// Test cases to implement:
test('can open NN editor modal from training parameters');
test('can add hidden layer and see node count update');
test('can remove hidden layer');
test('can adjust node count per layer');
test('apply architecture resets population and shows toast');
test('architecture persists after page refresh');
test('training uses custom architecture (verify via network visualizer)');
```

**Run command:**
```bash
pnpm test tests/nn-editor.spec.ts
```

---

### Manual Verification

#### 1. Editor UX Verification
1. Start dev server: `pnpm dev`
2. Navigate to Training mode
3. Click "Edit Network Architecture" in Training Parameters
4. Verify Rete.js canvas loads with 3 nodes (Input → Hidden → Output)
5. Add a second hidden layer, verify connection updates
6. Drag nodes around, verify pan/zoom works
7. Apply changes, verify toast notification appears

#### 2. Training Verification
1. Create custom architecture: 9 → 20 → 8 (1 wide hidden layer)
2. Apply and start training
3. Verify Neural Network Visualizer shows 3 columns (not 4)
4. Watch training for ~5 generations, verify fitness evolves

#### 3. Persistence Verification
1. Configure custom architecture
2. Apply and train for a few generations
3. Refresh the page
4. Verify architecture is restored
5. Verify population matches saved state

---

## Implementation Notes

### Theme Styling Requirements

The NN Editor must respect the global app theme via `useColorMode()`. All Rete.js custom components need theme-aware styles:

```typescript
// composables/useNNEditor.ts
const colorMode = useColorMode();
const isDarkMode = computed(() => colorMode.value === 'dark');

// Pass to Rete.js render plugin for node/connection styling
```

**Color Scheme (matching existing NeuralNetworkVisualizer):**

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Canvas BG | `bg-black/80` | `bg-white/90` |
| Node Fill | `rgba(0, 255, 255, α)` | `rgba(14, 116, 144, α)` |
| Positive Weight | `rgba(0, 240, 255, α)` | `rgba(6, 182, 212, α)` |
| Negative Weight | `rgba(255, 40, 40, α)` | `rgba(220, 38, 38, α)` |
| Text | `text-white/70` | `text-gray-700` |
| Border | `border-white/10` | `border-gray-200` |

**Glossary Panel Colors:**
- Use Nuxt UI `UCard` with `variant="subtle"` for auto-theming
- Heading text: `text-primary`
- Body text: `text-muted`

---

### Rete.js Undirected Style

To match the [undirected example](https://retejs.org/examples/undirected):

1. **Circular Nodes**: Custom node component with CSS `border-radius: 50%`
2. **Single Port**: Unified input/output socket (transparent, larger radius)
3. **Straight Lines**: Use `rete-connection-path-plugin` for linear paths
4. **Selection**: `rete-connection-plugin` with selectable connections
5. **Theme-Aware**: CSS variables or conditional classes based on `isDarkMode`

### Architecture Constraints (Enforced)

| Constraint | Min | Max | Reason |
|------------|-----|-----|--------|
| Hidden Layers | 1 | 5 | Prevent over-complexity |
| Nodes per Layer | 4 | 50 | Performance ceiling |
| Total Parameters | - | 10,000 | Prevent huge models |

### Migration Strategy

For v2.0.7 → v2.1.0:
- Existing genomes with hardcoded 9→13→13→8 architecture will load as "legacy"
- Users can continue training with legacy architecture
- Changing architecture requires population reset (with confirmation)

---

## File Impact Summary

| File | Change Type | Complexity | Risk |
|------|-------------|------------|------|
| `types.ts` | MODIFY | Low | Low |
| `services/NeuralNetwork.ts` | MODIFY | High | Medium |
| `services/NNArchitecturePersistence.ts` | NEW | Low | Low |
| `composables/useNNEditor.ts` | NEW | High | Medium |
| `components/NNEditor.vue` | NEW | High | Medium |
| `components/NNEditorModal.vue` | NEW | Medium | Low |
| `composables/useEvolution.ts` | MODIFY | Medium | Medium |
| `services/TrainingWorker.ts` | MODIFY | Medium | High |
| `services/PersistenceManager.ts` | MODIFY | Medium | Medium |
| `components/TrainingParameters.vue` | MODIFY | Low | Low |
| `components/NeuralNetworkVisualizer.vue` | MODIFY | Medium | Low |
| `components/NNTheoryGlossary.vue` | NEW | Medium | Low |
| `package.json` | MODIFY | Low | Low |

---

## ✅ All Design Decisions Confirmed

This plan is ready for implementation. All user decisions have been incorporated:

- ✅ Scope: All modes (Training + Arcade)
- ✅ Constraints: ≤5 hidden layers, ≤50 nodes/layer
- ✅ Architecture change requires population reset
- ✅ Prominent educational feature with theory glossary
- ✅ Theme support: dark/light/system via `useColorMode()`

---

## ADDENDUM: Comprehensive Manual Testing Guide

### Prerequisites
- Dev server running: `pnpm dev`
- Browser DevTools open (Console + Network tabs)
- Test in both Dark and Light modes

---

### Test Suite 1: Modal & UI Basics

#### 1.1 Opening the Editor
- [ ] Navigate to **Training mode**
- [ ] Expand **Training Parameters** section
- [ ] Verify "Network Architecture" section displays current architecture (e.g., `9 → 13 → 13 → 8`)
- [ ] Click **"Design"** button
- [ ] Verify **NNEditorModal** opens in fullscreen
- [ ] Verify modal header shows "Neural Network Designer"
- [ ] Verify architecture badge in header matches current architecture

#### 1.2 Modal Layout
- [ ] Verify **Rete.js canvas** occupies ~2/3 of width
- [ ] Verify **Theory Glossary** panel visible on right (~1/3 width)
- [ ] Verify glossary has sticky header with "Theory Glossary" title
- [ ] Verify glossary shows book icon
- [ ] Verify footer shows architecture summary and buttons

#### 1.3 Closing the Modal
- [ ] Click **X button** in header
- [ ] Verify modal closes
- [ ] Click "Design" again to reopen
- [ ] Click **Cancel** button in footer
- [ ] Verify modal closes
- [ ] Press **ESC key** (if supported)
- [ ] Verify modal closes

---

### Test Suite 2: Theory Glossary Panel

#### 2.1 Glossary Content
- [ ] Verify glossary shows intro text: "Learn about neural network concepts..."
- [ ] Verify **12 accordion items** are present:
  - Neural Network
  - Neuron (Node)
  - Hidden Layer
  - Weights
  - Bias
  - Activation Function
  - ReLU
  - Sigmoid
  - Forward Pass
  - Neuroevolution
  - Mutation
  - Crossover
- [ ] Click each accordion item
- [ ] Verify each expands to show definition text
- [ ] Verify icons display correctly for each term

#### 2.2 Pro Tips Section
- [ ] Scroll to bottom of glossary
- [ ] Verify **"Pro Tips"** card is visible
- [ ] Verify lightbulb icon (yellow)
- [ ] Verify 4 tips are listed:
  - Wider layers can detect more patterns
  - Deeper networks learn hierarchical features
  - Too many nodes may slow training
  - Start simple, add complexity if needed

#### 2.3 Glossary Collapse/Expand
- [ ] Click **collapse button** (panel-right-close icon) in glossary header
- [ ] Verify glossary panel hides smoothly
- [ ] Verify canvas expands to full width
- [ ] Verify **"Show Glossary"** button appears on right edge
- [ ] Click "Show Glossary" button
- [ ] Verify glossary re-appears
- [ ] Verify canvas shrinks back to 2/3 width

#### 2.4 Glossary Persistence
- [ ] Collapse the glossary
- [ ] Close the modal
- [ ] Reopen the modal
- [ ] Verify glossary remains collapsed
- [ ] Expand the glossary
- [ ] Close and reopen modal
- [ ] Verify glossary remains expanded
- [ ] Check localStorage for key: `neuroevolution_glossary_collapsed_v1`

---

### Test Suite 3: Rete.js Canvas Basics

#### 3.1 Initial Canvas State
- [ ] Verify canvas shows **3 layer circles** by default:
  - **Input** (cyan/blue, labeled "9")
  - **Hidden 1** (purple, labeled "13")
  - **Hidden 2** (purple, labeled "13")
  - **Output** (green, labeled "8")
- [ ] Verify circles are connected by arrows (→)
- [ ] Verify circles are horizontally aligned
- [ ] Verify "Loading..." overlay does NOT appear (editor initialized)

#### 3.2 Layer Circle Interaction
- [ ] **Hover** over Input layer circle
- [ ] Verify tooltip shows: "Input Layer: 9 nodes (fixed)"
- [ ] Verify circle scales up slightly (group-hover:scale-110)
- [ ] **Click** Input layer circle
- [ ] Verify nothing happens (not editable)
- [ ] **Click** Hidden 1 layer circle
- [ ] Verify circle gets **ring highlight** (ring-2 ring-primary)
- [ ] Verify **editing popover** appears in top-right corner

#### 3.3 Layer Editing Popover
- [ ] With Hidden 1 selected, verify popover shows:
  - Title: "Hidden Layer 1"
  - Input field with current value (13)
  - Range text: "Range: 4-50"
  - "Apply" button
- [ ] Change input value to **20**
- [ ] Click **Apply**
- [ ] Verify circle updates to show "20"
- [ ] Verify popover closes
- [ ] Verify architecture summary updates: `9 → 20 → 13 → 8`

#### 3.4 Node Count Constraints
- [ ] Select Hidden 1 layer
- [ ] Try to set node count to **3** (below min)
- [ ] Click Apply
- [ ] Verify value is clamped to **4**
- [ ] Try to set node count to **100** (above max)
- [ ] Click Apply
- [ ] Verify value is clamped to **50**
- [ ] Set valid value (e.g., 25)
- [ ] Verify it applies successfully

---

### Test Suite 4: Adding/Removing Layers

#### 4.1 Add Hidden Layer
- [ ] Click **"+ Add Layer"** button in toolbar
- [ ] Verify new Hidden 3 circle appears
- [ ] Verify it's labeled "H3" with default "13" nodes
- [ ] Verify connections update: Input → H1 → H2 → H3 → Output
- [ ] Verify architecture summary updates: `9 → 13 → 13 → 13 → 8`
- [ ] Verify parameter count increases

#### 4.2 Add Multiple Layers
- [ ] Add another layer (4th hidden)
- [ ] Verify architecture: `9 → 13 → 13 → 13 → 13 → 8`
- [ ] Add another layer (5th hidden - max)
- [ ] Verify architecture: `9 → 13 → 13 → 13 → 13 → 13 → 8`
- [ ] Verify **"+ Add Layer"** button becomes **disabled**
- [ ] Verify button tooltip/state indicates max layers reached

#### 4.3 Remove Hidden Layer
- [ ] Click **Hidden 2** circle to select it
- [ ] Click **"Remove"** button in toolbar
- [ ] Verify Hidden 2 disappears
- [ ] Verify connections update to skip removed layer
- [ ] Verify remaining layers renumber (H3 becomes H2, etc.)
- [ ] Verify architecture summary updates

#### 4.4 Remove to Minimum
- [ ] Keep removing layers until only **1 hidden layer** remains
- [ ] Verify architecture: `9 → 13 → 8`
- [ ] Verify **"Remove"** button becomes **disabled**
- [ ] Try to remove last hidden layer
- [ ] Verify nothing happens (min constraint enforced)

#### 4.5 Remove Without Selection
- [ ] Deselect all layers (click canvas background)
- [ ] Verify **"Remove"** button is **disabled**
- [ ] Verify button state indicates "no layer selected"

---

### Test Suite 5: Reset Functionality

#### 5.1 Reset to Default
- [ ] Create custom architecture: `9 → 20 → 15 → 10 → 8`
- [ ] Click **"Reset"** button in toolbar
- [ ] Verify architecture resets to: `9 → 13 → 13 → 8`
- [ ] Verify canvas updates to show 2 hidden layers
- [ ] Verify parameter count resets

#### 5.2 Reset After Multiple Changes
- [ ] Add 3 layers
- [ ] Edit node counts to various values
- [ ] Click "Reset"
- [ ] Verify all changes are reverted
- [ ] Verify default architecture restored

---

### Test Suite 6: Architecture Application

#### 6.1 Apply Without Changes
- [ ] Open editor with default architecture
- [ ] Click **"Apply & Reset Training"** button
- [ ] Verify **confirmation dialog** appears
- [ ] Verify dialog shows warning about population reset
- [ ] Verify dialog shows current architecture
- [ ] Click **"Cancel"**
- [ ] Verify dialog closes, no changes applied

#### 6.2 Apply Custom Architecture
- [ ] Create architecture: `9 → 25 → 8`
- [ ] Click "Apply & Reset Training"
- [ ] Click **"Reset & Apply"** in confirmation dialog
- [ ] Verify **success toast** appears: "Architecture Applied"
- [ ] Verify toast message mentions population reset
- [ ] Verify modal closes
- [ ] Verify TrainingParameters shows new architecture: `9 → 25 → 8`

#### 6.3 Unsaved Changes Indicator
- [ ] Open editor
- [ ] Make any change (add layer, edit nodes)
- [ ] Verify **"Unsaved"** indicator appears in toolbar
- [ ] Verify indicator shows warning icon (yellow)
- [ ] Apply changes
- [ ] Verify "Unsaved" indicator disappears

---

### Test Suite 7: Persistence & State

#### 7.1 Architecture Persistence
- [ ] Create architecture: `9 → 30 → 20 → 10 → 8`
- [ ] Apply changes
- [ ] **Refresh the page** (F5)
- [ ] Verify TrainingParameters shows: `9 → 30 → 20 → 10 → 8`
- [ ] Open editor
- [ ] Verify canvas shows 3 hidden layers with correct node counts
- [ ] Check localStorage for key: `neuroevolution_nn_architecture_v1`

#### 7.2 Persistence After Browser Restart
- [ ] Set custom architecture
- [ ] Apply changes
- [ ] **Close browser tab**
- [ ] **Reopen application**
- [ ] Verify architecture persisted

#### 7.3 Clear Architecture
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Delete key: `neuroevolution_nn_architecture_v1`
- [ ] Refresh page
- [ ] Verify default architecture loads: `9 → 13 → 13 → 8`

---

### Test Suite 8: Theme Support

#### 8.1 Dark Mode
- [ ] Switch app to **Dark mode** (if not already)
- [ ] Open NN Editor
- [ ] Verify canvas background is dark (`bg-gray-900`)
- [ ] Verify layer circles have dark-mode colors:
  - Input: `bg-cyan-600`
  - Hidden: `bg-purple-600`
  - Output: `bg-green-600`
- [ ] Verify glossary panel has dark background
- [ ] Verify text is light-colored
- [ ] Verify borders are subtle (`border-default`)

#### 8.2 Light Mode
- [ ] Switch app to **Light mode**
- [ ] Open NN Editor
- [ ] Verify canvas background is light (`bg-gray-50`)
- [ ] Verify layer circles have light-mode colors:
  - Input: `bg-cyan-700`
  - Hidden: `bg-purple-700`
  - Output: `bg-green-700`
- [ ] Verify glossary panel has light background
- [ ] Verify text is dark-colored
- [ ] Verify borders are visible

#### 8.3 System Mode
- [ ] Switch app to **System mode**
- [ ] Change OS theme (if possible)
- [ ] Verify editor theme follows OS preference
- [ ] Toggle OS theme
- [ ] Verify editor updates dynamically

---

### Test Suite 9: Edge Cases & Error Handling

#### 9.1 Rapid Clicking
- [ ] Rapidly click "Add Layer" button 10 times
- [ ] Verify max 5 layers enforced
- [ ] Verify no duplicate layers created
- [ ] Verify UI remains stable

#### 9.2 Invalid Input Handling
- [ ] Select a hidden layer
- [ ] In popover input, type **"abc"** (non-numeric)
- [ ] Click Apply
- [ ] Verify input is rejected or defaults to valid value
- [ ] Type **"-5"** (negative)
- [ ] Verify value is clamped to minimum (4)

#### 9.3 Concurrent Edits
- [ ] Select Hidden 1, change to 20
- [ ] **Without clicking Apply**, select Hidden 2
- [ ] Verify Hidden 1 popover closes
- [ ] Verify Hidden 1 value did NOT change (not applied)
- [ ] Edit Hidden 2, click Apply
- [ ] Verify only Hidden 2 changes

#### 9.4 Modal State After Error
- [ ] Create architecture with 5 layers
- [ ] Open browser DevTools → Console
- [ ] Simulate localStorage error (make it read-only if possible)
- [ ] Try to apply changes
- [ ] Verify **error toast** appears
- [ ] Verify modal remains open
- [ ] Verify architecture not corrupted

---

### Test Suite 10: Accessibility & UX

#### 10.1 Keyboard Navigation
- [ ] Open editor
- [ ] Press **Tab** key repeatedly
- [ ] Verify focus moves through:
  - Close button
  - Add Layer button
  - Remove button
  - Reset button
  - Layer circles (if focusable)
  - Glossary collapse button
  - Apply button
- [ ] Verify focus indicators are visible

#### 10.2 Screen Reader (Optional)
- [ ] Enable screen reader (VoiceOver on Mac, NVDA on Windows)
- [ ] Navigate through editor
- [ ] Verify buttons have descriptive labels
- [ ] Verify layer circles announce their state
- [ ] Verify architecture summary is readable

#### 10.3 Tooltips & Help Text
- [ ] Hover over "Add Layer" button
- [ ] Verify tooltip explains action
- [ ] Hover over disabled "Remove" button
- [ ] Verify tooltip explains why it's disabled
- [ ] Hover over parameter count
- [ ] Verify it shows total trainable parameters

#### 10.4 Responsive Behavior (if applicable)
- [ ] Resize browser window to narrow width
- [ ] Verify glossary collapses or stacks vertically
- [ ] Verify canvas remains usable
- [ ] Verify buttons don't overflow

---

### Test Suite 11: Integration with Training

#### 11.1 Architecture Display in Training Parameters
- [ ] Set architecture: `9 → 40 → 8`
- [ ] Apply changes
- [ ] Verify TrainingParameters shows: `9 → 40 → 8` in purple/mono font
- [ ] Verify "Design" button remains enabled when training is stopped

#### 11.2 Disabled During Active Training
- [ ] Start training (click "START MATCH")
- [ ] Verify "Design" button becomes **disabled**
- [ ] Verify helper text appears: "Stop training to modify architecture"
- [ ] Stop training
- [ ] Verify "Design" button re-enables

#### 11.3 Population Reset Warning
- [ ] Train for a few generations (build up fitness)
- [ ] Stop training
- [ ] Open editor, change architecture
- [ ] Apply changes
- [ ] Verify confirmation dialog warns about losing progress
- [ ] Confirm reset
- [ ] Verify generation counter resets to 1
- [ ] Verify fitness resets to 0

---

### Test Suite 12: Console & Network Checks

#### 12.1 Console Errors
- [ ] Open browser DevTools → Console
- [ ] Perform all actions in Test Suites 1-11
- [ ] Verify **no errors** appear in console
- [ ] Verify **no warnings** (except expected Rete.js deprecations)

#### 12.2 Network Requests
- [ ] Open DevTools → Network tab
- [ ] Open editor
- [ ] Verify no unexpected network requests
- [ ] Verify Rete.js assets load successfully (if CDN used)

#### 12.3 Performance
- [ ] Open DevTools → Performance tab
- [ ] Record while opening editor and adding 5 layers
- [ ] Stop recording
- [ ] Verify no long tasks (>50ms)
- [ ] Verify smooth 60fps animation

---

### Test Suite 13: Cross-Browser Testing

#### 13.1 Chrome/Edge
- [ ] Run all test suites in Chrome
- [ ] Verify all functionality works

#### 13.2 Firefox
- [ ] Run all test suites in Firefox
- [ ] Verify all functionality works
- [ ] Check for Firefox-specific rendering issues

#### 13.3 Safari (if on Mac)
- [ ] Run all test suites in Safari
- [ ] Verify all functionality works
- [ ] Check for Safari-specific issues (especially localStorage)

---

## Testing Checklist Summary

**Total Test Cases: ~150**

- [ ] Test Suite 1: Modal & UI Basics (9 tests)
- [ ] Test Suite 2: Theory Glossary Panel (18 tests)
- [ ] Test Suite 3: Rete.js Canvas Basics (12 tests)
- [ ] Test Suite 4: Adding/Removing Layers (18 tests)
- [ ] Test Suite 5: Reset Functionality (6 tests)
- [ ] Test Suite 6: Architecture Application (9 tests)
- [ ] Test Suite 7: Persistence & State (9 tests)
- [ ] Test Suite 8: Theme Support (12 tests)
- [ ] Test Suite 9: Edge Cases & Error Handling (12 tests)
- [ ] Test Suite 10: Accessibility & UX (12 tests)
- [ ] Test Suite 11: Integration with Training (9 tests)
- [ ] Test Suite 12: Console & Network Checks (6 tests)
- [ ] Test Suite 13: Cross-Browser Testing (9 tests)

---

## Known Issues to Watch For

1. **Rete.js Type Errors**: Complex generics bypassed with `any` types - runtime works correctly
2. **Theme Switching**: Verify canvas colors update when theme changes while modal is open
3. **LocalStorage Quota**: Large architectures may hit storage limits on some browsers
4. **Mobile Support**: Not optimized for mobile - test on desktop only for now

---

## Reporting Issues

When reporting bugs, please include:
- Browser + version
- Test suite + test case number
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if visual issue)

