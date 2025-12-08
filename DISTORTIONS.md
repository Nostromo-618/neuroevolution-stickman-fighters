# Evolution Distortions Catalog

## Philosophy: Pure Evolution vs Guided Evolution

In **pure neuroevolution**, fitness is determined solely by outcomes:
- Win = survive and reproduce
- Lose = eliminated from gene pool

In **guided evolution** (what this project currently uses), we add hand-crafted fitness rewards and penalties to steer AI behavior toward desired outcomes faster. This is sometimes called **fitness shaping** or **reward shaping**.

### Trade-offs

| Approach | Pros | Cons |
|----------|------|------|
| **Pure Evolution** | Emergent strategies, no human bias, discovers unexpected solutions | Slow convergence, may find degenerate strategies (e.g., both fighters stand still) |
| **Guided Evolution** | Faster learning, prevents obvious bad behaviors | Human bias limits creativity, AI optimizes for rewards not winning |

---

## Current Distortions

### 1. Per-Frame Fitness Shaping

These rewards/penalties are applied every frame during a match.

**Location:** `services/GameEngine.ts` (lines 57-112), `services/TrainingWorker.ts` (lines 129-168)

| Distortion | Value | Condition | Purpose | Removal Risk |
|------------|-------|-----------|---------|--------------|
| **Proximity Reward** | +0.005 | dist < 400px | Encourage approaching | AI might never engage |
| **Proximity Reward** | +0.02 | dist < 200px | Encourage closing distance | AI might camp at range |
| **Proximity Reward** | +0.05 | dist < 80px | Reward close combat | AI might avoid melee |
| **Facing Reward** | +0.02 | Facing opponent | Encourage proper stance | With backstab rule, may be redundant |
| **Aggression Reward** | +0.1 | Attacking within 100px | Encourage attacking in range | AI might never attack |
| **Time Penalty** | -0.005 | Every frame | Discourage stalling | Matches might timeout constantly |
| **Edge Penalty** | -0.04 | Within 60px of walls | Prevent corner camping | AI might exploit corners |
| **Center Bonus** | +0.015 | Within 150px of center | Reward arena control | AI might ignore positioning |
| **Movement Reward** | +0.008 | vx > 0.5 | Prevent standing still | AI might freeze in place |

**Total per-frame impact (90 sec match @ 60fps = 5400 frames):**
- Max proximity bonus: ~270 fitness (if always in close range)
- Time penalty: ~27 fitness lost
- These dwarf the +500 win bonus in magnitude

---

### 2. Per-Hit Fitness Shaping

Applied when a hit lands during combat.

**Location:** `services/GameEngine.ts` (lines 281-282), `services/TrainingWorker.ts` (lines 324-325)

| Distortion | Value | Condition | Purpose | Removal Risk |
|------------|-------|-----------|---------|--------------|
| **Hit Bonus** | +50 | Landing a punch/kick | Reward dealing damage | Might reduce attack attempts |
| **Hit Penalty** | -20 | Receiving a punch/kick | Punish taking damage | Might encourage reckless trading |

**Note:** These are arguably more "natural" since they correlate with winning, but they're still explicit fitness manipulation rather than pure outcome-based selection.

---

### 3. End-of-Match Fitness Shaping

Applied when a match concludes.

**Location:** `App.tsx` (lines 376-389), `services/TrainingWorker.ts` (lines 384-418)

| Distortion | Value | Condition | Purpose | Removal Risk |
|------------|-------|-----------|---------|--------------|
| **Health Remaining** | health × 2 | Match end | Reward efficient wins | Might encourage damage trading |
| **Win Bonus** | +500 | More health than opponent | Reward winning | **CORE** - This is essential |
| **Stalemate Penalty** | -100 | Timeout + <30 total damage | Punish passive play | Passive strategies dominate |

**Note:** The Win Bonus (+500) is arguably the most "natural" reward since it directly maps to evolutionary success. The others are guidance.

---

## Pure Rules (NOT Distortions)

These are environmental rules that affect gameplay equally for all fighters, with no direct fitness manipulation:

| Rule | Effect | Location |
|------|--------|----------|
| **Backstab Instant Death** | Hit while facing away = death | `GameEngine.ts`, `TrainingWorker.ts` checkHit() |
| **Energy System** | Actions cost energy, idle regens | `GameEngine.ts`, `TrainingWorker.ts` update() |
| **Block Mitigation** | Blocking reduces damage 90% | `GameEngine.ts`, `TrainingWorker.ts` checkHit() |
| **Knockback Physics** | Hits push opponent back | `GameEngine.ts`, `TrainingWorker.ts` checkHit() |

These are **environmental constraints** that shape behavior through consequences, not artificial fitness bonuses.

---

## Candidates for Removal

If pursuing purer neuroevolution, consider removing in order of impact:

### High Priority (Most Distorting)
1. **Facing Reward** - Now redundant with backstab instant death rule
2. **Proximity Rewards** - Let AI discover that closing distance leads to wins
3. **Aggression Reward** - Let AI discover that attacking leads to wins

### Medium Priority
4. **Edge Penalty** - Let AI discover corners are tactical disadvantages
5. **Center Bonus** - Let AI discover center control naturally
6. **Movement Reward** - Let AI discover movement is necessary

### Low Priority (Probably Keep)
7. **Time Penalty** - Prevents infinite stalemates
8. **Hit Bonus/Penalty** - Correlates with winning anyway
9. **Health Remaining** - Rewards dominant wins
10. **Win Bonus** - Essential for evolution to work
11. **Stalemate Penalty** - Prevents degenerate equilibria

---

## Experiment Ideas

### Experiment A: Remove Per-Frame Shaping
Remove all 7 per-frame distortions, keep hit bonuses and match-end bonuses.
- Hypothesis: AI will still learn to fight, but slower
- Risk: May develop passive/camping strategies

### Experiment B: Pure Win/Lose Only
Keep only the +500 win bonus, remove everything else.
- Hypothesis: AI will eventually learn, but may take 10x longer
- Risk: Local minima where both AIs learn to do nothing

### Experiment C: Remove Facing Reward Only
Since backstab rule exists, facing reward is redundant.
- Hypothesis: No behavioral change expected
- Risk: Very low

---

## Code Locations Quick Reference

```
services/GameEngine.ts
├── Lines 57-112: Per-frame fitness shaping
└── Lines 281-282: Hit bonus/penalty

services/TrainingWorker.ts  
├── Lines 129-168: Per-frame fitness shaping
├── Lines 324-325: Hit bonus/penalty
└── Lines 384-394: Health remaining + stalemate penalty

App.tsx
└── Lines 376-389: Health remaining + win bonus + stalemate penalty
```

