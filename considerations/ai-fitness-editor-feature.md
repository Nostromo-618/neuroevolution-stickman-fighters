# AI Fitness Editor Feature Plan

## Overview

Add a Monaco-based editor for customizing the fitness function used in neuroevolution training. This feature mirrors the existing Script Editor patterns but targets fitness calculation parameters instead of fighter AI scripts.

## User Requirements

- **Button location**: Below "Open Script Editor" button in MatchConfiguration.vue
- **Controls**: Load Default, Import, Export, Save & Close (same as Script Editor)
- **Persistence**: LocalStorage with sanitization/validation
- **Live updates**: Apply immediately to running training with toast notification
- **Documentation**: Update About modal with fitness editor info

## Fitness Parameters to Expose

### Per-Frame Shaping (from FitnessShaping.ts)
| Parameter | Current Value | Description |
|-----------|---------------|-------------|
| `proximityReward400` | 0.005 | Reward when distance < 400px |
| `proximityReward200` | 0.02 | Reward when distance < 200px |
| `proximityReward80` | 0.08 | Reward when distance < 80px |
| `facingReward` | 0.01 | Reward for facing opponent |
| `aggressionReward` | 0.15 | Reward for attacking in range |
| `timePenalty` | -0.005 | Penalty per frame (discourages stalling) |
| `edgePenalty` | -0.03 | Penalty for being at arena edge |
| `centerBonus` | 0.02 | Bonus for controlling center |
| `edgeThreshold` | 60 | Pixels from edge to trigger penalty |
| `centerThreshold` | 150 | Pixels from center to get bonus |

### Match-End Bonuses (from TrainingWorker.ts / useMatchUpdate.ts)
| Parameter | Current Value | Description |
|-----------|---------------|-------------|
| `damageMultiplier` | 2.0 | Multiplier for damage dealt |
| `healthMultiplier` | 2.5 | Multiplier for remaining health |
| `koWinBonus` | 300 | Bonus for winning by KO |
| `timeoutWinBonus` | 150 | Bonus for winning by timeout |
| `stalematePenalty` | -100 | Penalty when timeout with < 30 total damage |
| `stalemateThreshold` | 30 | Minimum damage to avoid stalemate penalty |

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 Create Fitness Configuration Types
**File:** `types.ts` (add to existing)

```typescript
export interface FitnessConfig {
  // Per-frame shaping
  proximityReward400: number;
  proximityReward200: number;
  proximityReward80: number;
  facingReward: number;
  aggressionReward: number;
  timePenalty: number;
  edgePenalty: number;
  centerBonus: number;
  edgeThreshold: number;
  centerThreshold: number;
  // Match-end bonuses
  damageMultiplier: number;
  healthMultiplier: number;
  koWinBonus: number;
  timeoutWinBonus: number;
  stalematePenalty: number;
  stalemateThreshold: number;
}
```

#### 1.2 Create Fitness Storage Service
**File:** `services/FitnessStorage.ts` (new file)

Mirror the pattern from `CustomScriptStorage.ts`:
- `saveFitnessConfig(config: FitnessConfig): void`
- `loadFitnessConfig(): FitnessConfig`
- `exportFitnessConfig(config: FitnessConfig): void` (download as JSON)
- `importFitnessConfig(jsonString: string): FitnessConfig | null`
- `getDefaultFitnessConfig(): FitnessConfig`

LocalStorage key: `neuroevolution_fitness_config`

Export format:
```json
{
  "version": 1,
  "type": "neuroevolution-fitness-config",
  "config": { ... },
  "exportedAt": "ISO timestamp"
}
```

#### 1.3 Create Default Fitness Template
**File:** `templates/defaultFitnessScript.ts` (new file)

JavaScript template for the Monaco editor:
```javascript
/**
 * FITNESS CONFIGURATION
 * Customize how AI fighters are rewarded during training.
 *
 * PER-FRAME REWARDS (applied every game frame):
 * - proximityReward*: Rewards for being close to opponent
 * - facingReward: Reward for facing the opponent
 * - aggressionReward: Reward for attacking when in range
 * - timePenalty: Penalty per frame to discourage stalling
 * - edgePenalty: Penalty for being cornered
 * - centerBonus: Reward for controlling arena center
 *
 * MATCH-END BONUSES (applied when match ends):
 * - damageMultiplier: How much to value damage dealt
 * - healthMultiplier: How much to value remaining health
 * - koWinBonus: Bonus for knockout victory
 * - timeoutWinBonus: Bonus for timeout victory
 * - stalematePenalty: Penalty for passive matches
 */

return {
  // Per-frame shaping
  proximityReward400: 0.005,
  proximityReward200: 0.02,
  proximityReward80: 0.08,
  facingReward: 0.01,
  aggressionReward: 0.15,
  timePenalty: -0.005,
  edgePenalty: -0.03,
  centerBonus: 0.02,
  edgeThreshold: 60,
  centerThreshold: 150,

  // Match-end bonuses
  damageMultiplier: 2.0,
  healthMultiplier: 2.5,
  koWinBonus: 300,
  timeoutWinBonus: 150,
  stalematePenalty: -100,
  stalemateThreshold: 30
};
```

#### 1.4 Create Fitness Compiler/Validator
**File:** `services/FitnessCompiler.ts` (new file)

```typescript
export interface FitnessCompileResult {
  config: FitnessConfig | null;
  error: string | null;
}

export function compileFitnessScript(userCode: string): FitnessCompileResult
```

Validation steps:
1. Run through `analyzeLoopSafety()` (reuse from CustomScriptCompiler)
2. Execute code in sandboxed Function constructor
3. Validate returned object has all required fields
4. Validate all values are numbers within reasonable ranges
5. Return parsed FitnessConfig or error message

### Phase 2: State Management

#### 2.1 Create Fitness Composable
**File:** `composables/useFitnessConfig.ts` (new file)

```typescript
export function useFitnessConfig() {
  const fitnessConfig = ref<FitnessConfig>(loadFitnessConfig());

  const updateFitnessConfig = (newConfig: FitnessConfig) => {
    fitnessConfig.value = newConfig;
    saveFitnessConfig(newConfig);
  };

  return {
    fitnessConfig: readonly(fitnessConfig),
    updateFitnessConfig
  };
}
```

#### 2.2 Integrate with FitnessShaping.ts
**File:** `services/FitnessShaping.ts` (modify)

Change `applyFitnessShaping()` to accept config parameter:
```typescript
export function applyFitnessShaping(
  fighter: Fighter,
  opponent: Fighter,
  genome: Genome,
  config: FitnessConfig  // NEW
): void
```

Replace hardcoded values with config references.

#### 2.3 Update Match Update Composable
**File:** `composables/useMatchUpdate.ts` (modify)

- Import fitness config from composable
- Pass config to `applyFitnessShaping()` calls
- Use config values for match-end calculations

### Phase 3: UI Components

#### 3.1 Create FitnessEditor Component
**File:** `components/FitnessEditor.vue` (new file, ~300 lines)

Pattern after `ScriptEditor.vue` but simplified (single editor, no slots):

Structure:
```vue
<template>
  <UModal v-model:open="isOpen" fullscreen>
    <UCard>
      <template #header>
        <!-- Title, buttons: Load Default, Import, Export, Save & Close, Close -->
        <!-- Real-time validation status -->
      </template>

      <!-- Monaco Editor -->
      <div ref="editorContainer" class="..." />

      <!-- Hidden file input for import -->
      <input type="file" accept=".json" />
    </UCard>
  </UModal>
</template>
```

Features:
- Monaco editor with JavaScript syntax highlighting
- Real-time validation as user types
- Error display (red) or valid indicator (green)
- Same button layout as ScriptEditor
- Dynamic light/dark theme support
- Ctrl+S to save

#### 3.2 Add Button to MatchConfiguration
**File:** `components/MatchConfiguration.vue` (modify)

After the "Open Script Editor" button (line ~113), add:
```vue
<UButton
  @click="onOpenFitnessEditor"
  color="secondary"
  variant="outline"
  class="w-full"
  size="sm"
>
  <UIcon name="i-heroicons-calculator" class="w-4 h-4" />
  Open NN Fitness Editor
</UButton>
```

Add new prop: `onOpenFitnessEditor: () => void`

#### 3.3 Update Dashboard Component
**File:** `components/Dashboard.vue` (modify)

- Add `<FitnessEditor>` component
- Add `fitnessEditorOpen` ref
- Pass `onOpenFitnessEditor` callback to MatchConfiguration
- Handle save event with toast

### Phase 4: Toast Notifications

#### 4.1 Add Toast on Save
When fitness config is saved, show toast:
- Success: "Fitness config applied to live training"
- Note: "Background/turbo workers will use new config on next start"

Use existing `useToast()` pattern from pages/index.vue.

### Phase 5: About Modal Update

#### 5.1 Update Training Tab
**File:** `components/AboutModal.vue` (modify)

Add new section after "Fitness Calculation" (around line 404):

```vue
<!-- Fitness Editor -->
<div class="dark:bg-gradient-to-r dark:from-purple-950/30 ...">
  <h3>Custom Fitness Editor</h3>
  <p>Customize the AI reward function to train different fighting styles:</p>
  <ul>
    <li>Per-frame shaping: proximity, aggression, positioning rewards</li>
    <li>Match-end bonuses: damage, health, win bonuses</li>
    <li>Export/import your fitness configs</li>
  </ul>
  <UAlert>
    Changes apply immediately to live training.
    Background workers use new config on next training start.
  </UAlert>
</div>
```

#### 5.2 Update Tips Tab (line ~1250)
Add entry:
```vue
<div class="flex items-start gap-3">
  <UIcon name="i-lucide-calculator" />
  <div>
    <p>Customize Fitness</p>
    <p>Open NN Fitness Editor to tune how AI fighters are rewarded</p>
  </div>
</div>
```

### Phase 6: Technical Considerations

#### 6.1 Hot-Reload Limitation
**Important**: The TrainingWorker.ts has fitness calculation hardcoded. Changes to fitness config will:
- Apply immediately to main-thread training (Live Training mode)
- NOT affect running background/turbo workers (they use hardcoded values)
- Apply to background workers only when they're restarted

Toast should communicate this clearly.

#### 6.2 Future Enhancement (Out of Scope)
To fully support hot-reload in workers, would need:
1. Add message protocol to workers for config updates
2. Refactor worker fitness to use injected config
3. This is complex and can be a future feature

## Files to Create
1. `services/FitnessStorage.ts`
2. `services/FitnessCompiler.ts`
3. `templates/defaultFitnessScript.ts`
4. `composables/useFitnessConfig.ts`
5. `components/FitnessEditor.vue`

## Files to Modify
1. `types.ts` - Add FitnessConfig interface
2. `services/FitnessShaping.ts` - Accept config parameter
3. `composables/useMatchUpdate.ts` - Use fitness config
4. `components/MatchConfiguration.vue` - Add button
5. `components/Dashboard.vue` - Add editor modal
6. `components/AboutModal.vue` - Add documentation

## Testing Checklist
- [ ] Default config loads correctly
- [ ] Editor validates code in real-time
- [ ] Invalid configs show clear errors
- [ ] Save persists to localStorage
- [ ] Export downloads valid JSON
- [ ] Import parses and validates JSON
- [ ] Changes apply to live training immediately
- [ ] Toast appears on save
- [ ] Dark/light theme works in editor
- [ ] Ctrl+S keyboard shortcut works
- [ ] About modal shows new documentation

## Estimated Scope
- ~5-6 new files
- ~6 modified files
- Follows established patterns from ScriptEditor
- Low risk due to similarity with existing implementation
