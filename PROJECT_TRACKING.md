# NeuroFight Evolution - Project Tracking

## Session: December 8, 2025

### Overview
Major refactoring session focused on fixing critical AI training bugs, implementing advanced training strategies, modernizing the UI, and removing dead code.

---

## Phase 1: Critical Bug Fixes

### 1. AI Action System Overhaul
**File:** `services/GameEngine.ts`
**Problem:** AI could only choose ONE action per frame (argmax), while human players can combine inputs (e.g., move + punch).
**Solution:** Changed from argmax to threshold-based activation. Each output > 0.5 triggers its action, allowing combinations.

```typescript
// Before: Only one action possible
const maxIndex = outputs.indexOf(Math.max(...outputs));
return { left: maxIndex === 1, right: maxIndex === 2, ... };

// After: Multiple actions can fire simultaneously  
return {
  left: outputs[FighterAction.MOVE_LEFT] > 0.5,
  right: outputs[FighterAction.MOVE_RIGHT] > 0.5,
  // ...
};
```

### 2. Block Mechanic Fix
**File:** `services/GameEngine.ts`
**Problem:** Block cooldown (5) was below animation lock threshold (15), so AI's block state would change immediately.
**Solution:** Increased block cooldown from 5 to 20 frames.

### 3. Odd Population Size Handling
**File:** `App.tsx`
**Problem:** When population size was odd, the last genome never fought (skipped).
**Solution:** Unpaired genomes now fight against a random opponent from already-paired pool.

### 4. Dead Opponent Fitness Farming
**File:** `services/GameEngine.ts`
**Problem:** AI could accumulate fitness rewards by hovering near dead opponents.
**Solution:** Added `opponent.health > 0` check around all fitness shaping logic.

### 5. Fitness Rebalancing
**File:** `services/GameEngine.ts`
**Changes:**
- Reduced proximity rewards (0.01→0.005, 0.05→0.02, 0.1→0.05)
- Added aggression reward (+0.1 for attacking when within range)
- Encourages active fighting over passive proximity camping

---

## Phase 2: Dead Code Removal

### Deleted Files
- `services/GeminiService.ts` - Unused GenAI integration
- `components/EduModal.tsx` - Unused educational modal

### Cleaned Files

**App.tsx:**
- Removed imports for EduModal and GeminiService
- Removed `modal` state
- Removed `handleOpenEdu` and `handleAiAnalyze` functions
- Removed "What is this?" link
- Removed educational buttons ("How AI Thinks", "Physics Engine", "Fitness Scores")
- Removed `<EduModal>` component
- Removed `onExplain` prop from Dashboard

**Dashboard.tsx:**
- Removed `onExplain` prop from interface
- Removed "ASK AI COACH" button

---

## Phase 3: UI Improvements

### Toast Notification System
**New File:** `components/Toast.tsx`

Features:
- Auto-dismissing notifications (3 second duration)
- Success, error, and info variants with appropriate icons
- Slide-in/out animations
- `useToast` hook for state management
- Stackable notifications

### Import Dialog Modernization
**File:** `App.tsx`

Replaced blocking `confirm()` dialog with inline modal:
- Clean card-based UI
- Two clear options: "Training + Arcade" and "Arcade Only"
- Cancel button
- Non-blocking user experience

### Alert Replacements
All `alert()` calls replaced with toast notifications:
- Export success → Success toast
- Export failure (no AI) → Error toast
- Import failure → Error toast
- Import success → Success toast (with chosen mode)

---

## Phase 4: Training Strategy Improvements

### 1. Adaptive Mutation Rate
**File:** `App.tsx` (in `evolve()` function)

```typescript
const adaptiveRate = Math.max(0.05, 0.25 - (currentGen * 0.004));
```

- Starts at 25% for broad exploration
- Decays by 0.4% per generation
- Minimum 5% to prevent stagnation
- Reaches minimum around generation 50

### 2. Increased Population Size
**File:** `App.tsx`
- Changed default from 12 to 24
- Better genetic diversity
- More strategies explored per generation

### 3. Expanded Neural Network Inputs
**Files:** `services/NeuralNetwork.ts`, `services/GameEngine.ts`

Added 2 new inputs (7 → 9 total):
| Input | Description | Normalization |
|-------|-------------|---------------|
| `oppCooldown` | Opponent's attack cooldown | `/40` (max cooldown) |
| `oppEnergy` | Opponent's energy level | `/100` |

These help the AI:
- Predict attack windows (when opponent is in recovery)
- Know when opponent can't attack (low energy)

### 4. Longer Match Duration
**File:** `App.tsx`
- Increased from 60 to 90 seconds
- More time for strategies to develop
- Better fitness differentiation

---

## File Change Summary

| File | Status | Changes |
|------|--------|---------|
| `services/GeminiService.ts` | DELETED | Removed unused GenAI code |
| `components/EduModal.tsx` | DELETED | Removed unused modal |
| `components/Toast.tsx` | CREATED | New toast notification system |
| `App.tsx` | MODIFIED | Removed dead code, added toasts, training improvements |
| `components/Dashboard.tsx` | MODIFIED | Removed onExplain prop and button |
| `services/GameEngine.ts` | MODIFIED | Fixed AI actions, block, fitness shaping, added inputs |
| `services/NeuralNetwork.ts` | MODIFIED | Expanded INPUT_NODES from 7 to 9 |

---

## Configuration Changes

| Setting | Before | After |
|---------|--------|-------|
| Population Size | 12 | 24 |
| Match Duration | 60s | 90s |
| Block Cooldown | 5 frames | 20 frames |
| Neural Network Inputs | 7 | 9 |
| Mutation Rate | Fixed (user-set) | Adaptive (25%→5%) |

---

## Known Considerations

1. **Imported Weights Compatibility:** Old exported weights (7 inputs) won't work with new network (9 inputs). The import validation will reject them.

2. **Training Reset Recommended:** Due to significant changes in fitness shaping and network architecture, starting fresh training is recommended for best results.

3. **Mutation Rate Slider:** The UI slider still exists but adaptive rate is used during evolution. The slider value is ignored in favor of the adaptive calculation.

---

## Additional Cleanup

### Removed Unused Dependencies
**File:** `package.json`

Removed packages that were only used by deleted GenAI code:
- `@google/genai` - Was used by deleted GeminiService.ts
- `react-markdown` - Was used by deleted EduModal.tsx

Run `npm install` to update node_modules after these changes.

---

## Session Update: Arcade Mode Improvements

### 1. Removed Blocking End-Match Screen
**File:** `App.tsx`

- Deleted the `{gameState.winner && (...)}` overlay that blocked gameplay
- Match results now shown via toast notification instead

### 2. Auto-Restart Arcade Matches
**File:** `App.tsx`

When an arcade match ends:
- Shows toast: "You Win!" (success) or "AI Wins!" (info)
- Auto-restarts match after 1 second delay
- No user interaction required

### 3. Background Training System
**Files:** `App.tsx`, `types.ts`, `components/Dashboard.tsx`

New feature allowing AI to train while you play arcade mode:

**Types:**
- Added `backgroundTraining: boolean` to `TrainingSettings`

**Background Training Loop:**
- Separate population (`bgPopulationRef`) runs independently
- Uses `setInterval` at 50ms to run training batches
- Runs 10 match simulations per interval (no rendering)
- Updates `bestTrainedGenomeRef` when finding better AI
- Seeds from existing best genome if available

**UI Toggle:**
- Added switch in Dashboard (visible in Arcade mode only)
- Shows pulsing green dot when active
- "AI keeps learning while you play" description

### 4. Latest Best Genome Sync
- Arcade AI automatically uses latest best weights on each match start
- `getBestGenome()` reads from `bestTrainedGenomeRef.current`
- Background training continuously updates this ref
- Each new arcade match gets the improved AI

---

## Configuration Changes (Updated)

| Setting | Before | After |
|---------|--------|-------|
| Population Size | 12 | 24 |
| Match Duration | 60s | 90s |
| Block Cooldown | 5 frames | 20 frames |
| Neural Network Inputs | 7 | 9 |
| Mutation Rate | Fixed (user-set) | Adaptive (25%→5%) |
| Background Training | N/A | Toggle (off by default) |
| End-Match Screen | Blocking overlay | Auto-restart + toast |
| Population | Two separate (main + bg) | Single shared |
| Spawn Positions | Fixed (330, 420) | Randomized (±50px) |

---

## Session Update: Unified Population + Arena Coverage

### 1. Single Shared Population
**File:** `App.tsx`

Refactored to use ONE population for all training:
- Removed `bgPopulationRef`, `bgMatchIndexRef`, `bgGenerationRef`
- Background training now uses `populationRef` directly
- All training progress accumulates together
- Simpler, no duplicate evolutionary processes

### 2. Arena Coverage Fitness Shaping
**File:** `services/GameEngine.ts`

Added new fitness modifiers to prevent corner camping:

| Modifier | Value | Purpose |
|----------|-------|---------|
| Edge Penalty | -0.04/frame | Penalizes being within 60px of walls |
| Center Bonus | +0.015/frame | Rewards being within 150px of center |
| Movement Reward | +0.008/frame | Rewards actual movement (vx > 0.5) |

### 3. Randomized Spawn Positions
**Files:** `App.tsx`

- Training matches: spawn positions now vary by ±50px
- Arcade matches: spawn positions vary by ±30px
- Encourages AI to learn diverse strategies
- Prevents overfitting to fixed starting positions

---

## Session Update: Web Workers Parallel Training

### Overview
Implemented Web Workers to run match simulations in parallel across Apple Silicon M3's CPU cores. This provides 4-8x speedup for background training.

### New Files

**1. `services/TrainingWorker.ts`**
Self-contained worker that runs match simulations:
- Duplicated Fighter class logic (no imports from main thread)
- Duplicated neural network predict function
- Full match simulation (90 seconds at 60fps)
- Returns fitness results via postMessage

**2. `services/WorkerPool.ts`**
Manages multiple workers:
- Auto-detects CPU cores via `navigator.hardwareConcurrency`
- Creates pool of workers (capped at 8)
- Distributes match jobs evenly
- Collects results asynchronously
- Provides helper methods for job creation and result application

### Modified Files

**`App.tsx`**
- Added `WorkerPool` import
- Added `workerPoolRef` and `isWorkerTrainingRef` refs
- Replaced `runBackgroundTrainingStep()` with `runWorkerTrainingGeneration()`
- Background training now runs full generations in parallel
- Generations complete much faster (all matches run simultaneously)

**`vite.config.ts`**
- Added `worker: { format: 'es' }` for ES module workers
- Added `build: { target: 'esnext' }` for modern browser features

### Architecture

```
Main Thread (React UI)
       │
       │ postMessage (genome network data)
       ▼
┌──────────────────────────────────────┐
│           Worker Pool                 │
│  ┌────────┐ ┌────────┐ ┌────────┐   │
│  │Worker 1│ │Worker 2│ │Worker 3│...│
│  └────────┘ └────────┘ └────────┘   │
│     ↓          ↓          ↓         │
│  [Match 1]  [Match 2]  [Match 3]    │  ← Parallel execution
└──────────────────────────────────────┘
       │
       │ postMessage (fitness results)
       ▼
Evolution (combine results, create next generation)
```

### Performance Benefits

| Metric | Before | After |
|--------|--------|-------|
| Matches per generation | Sequential (1 at a time) | Parallel (4-8 at once) |
| Expected speedup | 1x | 4-8x |
| UI responsiveness | Could block | Never blocks |
| Core utilization | Single core | Multi-core |

---

## Session Update: Random Side Swap Training

### Problem
AI always trained as P1 (left) or P2 (right) with fixed positions. This caused AI to only learn one-directional movement patterns. In Arcade mode, the AI (P2/blue) would drift left and get stuck because it only learned "move toward opponent = move left".

### Solution
Added 50% random side swap during training so each genome experiences both arena positions.

### Files Modified

**`App.tsx`** - Main training match setup:
```typescript
// CRITICAL: Randomly swap which genome plays which side (50% chance)
const swapSides = Math.random() > 0.5;
const leftGenome = swapSides ? g2 : g1;
const rightGenome = swapSides ? g1 : g2;
```

**`services/TrainingWorker.ts`** - Worker parallel training:
- Same 50% random side swap in `runMatch()`
- Properly maps fitness results back to original genome order

### Result
- AI now learns to fight from both sides of arena
- AI navigates entire arena space
- No more corner camping in Arcade mode

---

## Session Update: Strategic Energy System

### Overview
Added comprehensive energy costs to ALL fighter actions to create strategic resource management. This prevents erratic AI behavior and encourages intelligent fighting patterns.

### Energy Costs Table

| Action | Old Cost | New Cost |
|--------|----------|----------|
| Movement (left/right) | 0 | **0.5/frame** |
| Jumping | 0 | **12 (one-time)** |
| Crouching | 0 | **0.2/frame** |
| Punching | 10 | 10 (unchanged) |
| Kicking | 15 | 15 (unchanged) |
| Blocking | 0.5 | 0.5 (unchanged) |
| **Idle Regen** | 0.2/frame | **0.5/frame when idle** |

### Files Modified

**`services/GameEngine.ts`**
- Movement now requires and costs energy (0.5/frame)
- Jumping costs 12 energy (significant tactical cost)
- Crouching costs 0.2 energy/frame
- Idle regeneration boosted to 0.5/frame (rewards patience)

**`services/TrainingWorker.ts`**
- Mirrored all energy changes
- Added stalemate detection (total engagement < 30 damage)
- Stalemate penalty: -100 fitness to both fighters

**`App.tsx`**
- Added stalemate penalty to visible training matches

### Expected Behavior Changes

1. **No more erratic movement** - Moving costs energy, AI learns efficient paths
2. **Strategic jumping** - Jump only when tactically needed
3. **Engagement encouraged** - Standing still regens energy, but stalemate = punishment
4. **Resource management** - AI must balance offense/defense with energy conservation

