# ⚔️ Game Engine & Physics

This document explains the combat mechanics, physics simulation, and game rules that govern the arena.

---

## Table of Contents

1. [Game Loop Architecture](#game-loop-architecture)
2. [Fighter Control Types](#fighter-control-types)
3. [Physics System](#physics-system)
4. [Fighter State Machine](#fighter-state-machine)
5. [Combat Mechanics](#combat-mechanics)
6. [Energy System](#energy-system)
7. [Collision Detection](#collision-detection)
8. [Fitness Shaping Philosophy](#fitness-shaping-philosophy)
9. [World Rules & Boundaries](#world-rules--boundaries)

---

## Game Loop Architecture

The game runs at **60 frames per second** using `requestAnimationFrame`.

```
┌─────────────────────────────────────────────────────────────┐
│                     GAME LOOP (60 FPS)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CHECK MATCH                                              │
│     └── If no active match, start a new one                 │
│                                                              │
│  2. CHECK PAUSE                                              │
│     └── If paused, skip physics but continue loop           │
│                                                              │
│  3. PHYSICS LOOP (runs N times based on speed setting)      │
│     ├── Process input (human or AI)                         │
│     ├── Update Fighter 1 state and position                 │
│     ├── Update Fighter 2 state and position                 │
│     ├── Handle body collision (prevent overlap)             │
│     ├── Check hit detection                                 │
│     ├── Update match timer                                  │
│     └── Check end conditions (KO, timeout)                  │
│                                                              │
│  4. SYNC TO VUE                                              │
│     └── Update Vue reactive state for UI rendering          │
│                                                              │
│  5. SCHEDULE NEXT FRAME                                      │
│     └── requestAnimationFrame(gameLoop)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Simulation Speed

In Training mode, the physics loop runs multiple times per frame:
- **1x**: Normal speed (real-time)
- **100x**: 100 physics steps per frame
- **5000x**: Maximum training speed

In Arcade mode, it's always 1x for fair gameplay.

---

## Fighter Control Types

Fighters can be controlled by different systems depending on the game mode and settings:

| Type | Color | Description | File |
|------|-------|-------------|------|
| **Human** | Red (`#ef4444`) | Keyboard/gamepad input in Arcade mode | `InputManager.ts` |
| **Neural AI** | Blue (`#3b82f6`) | Trained neural network decisions | `NeuralNetwork.ts` |
| **Custom A** | Purple (`#a855f7`) | User Script Slot 1 | `CustomScriptRunner.ts` |
| **Custom B** | Pink (`#d946ef`) | User Script Slot 2 | `CustomScriptRunner.ts` |

### Control Priority

In `Fighter.update()`, the decision process is:

```typescript
if (isCustom && scriptWorker) {
  // User's custom script (Web Worker)
  activeInput = processCustom(opponent);
} else if (isAi && genome) {
  // Neural network
  activeInput = processAi(opponent);
} else {
  // Human input
  activeInput = input;
}
```

### Custom Script Security

Custom scripts are handled with strict isolation protocols to ensure the application remains stable and secure:

- **Isolated Web Worker**: Scripts run in a separate thread with NO access to the DOM or page context.
- **Watchdog Pattern**: The engine uses a "cached action" pattern. If a custom script takes too long to compute, the engine simply uses the last known action, preventing UI freezes.
- **Sandbox Boundary**: The use of `new Function()` is confined to the worker's global scope, meaning it cannot "escape" to the main application.

For a detailed breakdown of the security model, see [SCRIPTED.md#security-architecture](../SCRIPTED.md#security-architecture).

---

## Physics System

### Constants

| Constant | Value | Purpose |
|----------|-------|---------|
| `CANVAS_WIDTH` | 800px | Arena width |
| `CANVAS_HEIGHT` | 450px | Arena height |
| `GROUND_Y` | 380px | Y-coordinate of ground |
| `GRAVITY` | 0.8 | Downward acceleration per frame |
| `FRICTION` | 0.85 | Horizontal velocity multiplier per frame |

### Physics Integration (Each Frame)

```typescript
// Apply velocity
fighter.x += fighter.vx;
fighter.y += fighter.vy;

// Apply gravity (pulls down)
fighter.vy += GRAVITY;

// Apply friction (slows horizontal movement)
fighter.vx *= FRICTION;
```

### Movement Feel

With FRICTION = 0.85:
- Initial velocity: 10 px/frame
- After 1 frame: 8.5 px/frame
- After 5 frames: 4.4 px/frame
- After 10 frames: 2.0 px/frame

This creates a smooth deceleration when the player stops inputting.

---

## Fighter State Machine

Each fighter has a **state** that determines their animation and available actions.

```
                         ┌─────────┐
                         │  IDLE   │◄───────────────────┐
                         └────┬────┘                    │
                              │                         │
          ┌───────────────────┼───────────────────┐     │
          │                   │                   │     │
          ▼                   ▼                   ▼     │
    ┌───────────┐      ┌───────────┐      ┌───────────┐ │
    │ MOVE_LEFT │      │ MOVE_RIGHT│      │   JUMP    │─┘
    └───────────┘      └───────────┘      └───────────┘
                                                 │
                                                 │ (on landing)
                                                 └──────────────►
          
    From IDLE, can also:
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │  CROUCH  │    │  BLOCK   │    │  PUNCH   │
    └──────────┘    └──────────┘    └────┬─────┘
                                         │ (cooldown)
                                         ▼
                                    ┌──────────┐
                                    │   KICK   │
                                    └──────────┘
```

### State Transitions

| From State | Trigger | To State | Notes |
|------------|---------|----------|-------|
| Any | Death | DEAD | Special physics |
| IDLE | Left pressed | MOVE_LEFT | |
| IDLE | Right pressed | MOVE_RIGHT | |
| IDLE | Up pressed (grounded) | JUMP | Costs 15 energy |
| IDLE | Down pressed | CROUCH | ~0.5 energy/frame |
| IDLE | Block pressed | BLOCK | ~0.5 energy/frame |
| IDLE | Punch pressed | PUNCH | 10 energy, 30 frame cooldown |
| IDLE | Kick pressed | KICK | 20 energy, 20 frame cooldown |
| JUMP | Landing | IDLE | |
| PUNCH/KICK | Cooldown ends | IDLE | |

---

## Combat Mechanics

### Attack Properties

| Attack | Damage | Energy Cost | Cooldown | Hitbox Size | Knockback |
|--------|--------|-------------|----------|-------------|-----------|
| Punch | 5 | 10 (10%) | 30 frames | 46 × 20 px | 8 px/frame |
| Kick | 10 | 20 (20%) | 20 frames | 66 × 30 px | 15 px/frame |

### Attack Timing Windows

Attacks have "active frames" where the hitbox actually exists:

```
PUNCH (30 frame cooldown):
Frame:  30  29  28  27  26  25  24  23  22  21  20  19  18  17  16  15  14  ...  0
        │                    │───────────────────│                              │
        └── Startup          └── ACTIVE FRAMES   └── Recovery ─────────────────►
```

**Active window**: Cooldown 25-15 (10 frames of hitbox)

### Damage Modifiers (Rock-Paper-Scissors System)

The combat system uses strategic counters where defensive moves perfectly negate specific attacks:

| Attack | vs Defense | Damage | Effect |
|--------|------------|--------|--------|
| **Punch** | None | 5 (100%) | Normal hit |
| **Punch** | vs BLOCK | **0 (0%)** | ✅ Perfect block, attacker stunned +5 frames |
| **Punch** | vs CROUCH | 2.5 (50%) | Partial dodge |
| **Kick** | None | 10 (100%) | Normal hit |
| **Kick** | vs BLOCK | 5 (50%) | Partial block |
| **Kick** | vs CROUCH | **0 (0%)** | ✅ Perfect dodge, attacker stunned +5 frames |

**Strategic Depth:**
- **Block** is the counter to **Punch** (arm blocks fist perfectly)
- **Crouch** is the counter to **Kick** (duck under the kick entirely)
- This creates mind games: predict opponent's attack and counter it

> [!IMPORTANT]
> **Facing Requirement**: Block and Crouch defensive counters **only work if the defender is facing the attacker**. If hit from behind while blocking/crouching, the defender takes **full damage** with no reduction.

### Backstab Detection

**Note:** The backstab damage multiplier (3× damage) has been removed from the game. However, the facing detection logic remains for potential future use or AI positioning strategies.

The system can still detect when a defender is facing away from an attacker, but it no longer affects damage calculation.

### Block Mechanics

- Holding block costs **0.5 energy per frame** (~30 energy/sec at 60 FPS)
- Full energy allows **~5.5 seconds** of continuous blocking
- **Blocking a Punch = 0 damage** (perfect counter, attacker stunned)
- **Blocking a Kick = 50% damage**
- Movement is reduced to **30%** while blocking

### Crouch Mechanics

- Holding crouch costs **0.5 energy per frame** (~30 energy/sec at 60 FPS)
- Full energy allows **~5.5 seconds** of continuous crouching
- **Crouching a Kick = 0 damage** (perfect counter, attacker stunned)
- **Crouching a Punch = 50% damage**
- Movement is reduced to **50%** while crouching

---

## Energy System

Energy is a resource that limits rapid action spam.

### Energy Costs

| Action | Energy Cost |
|--------|-------------|
| Moving (per frame) | 0.1 |
| Jumping | 15 (15% of total) |
| Crouching (per frame) | 0.5 |
| Blocking (per frame) | 0.5 |
| Punch | 10 (10% of total) |
| Kick | 20 (20% of total) |

### Energy Regeneration

| State | Regen Rate |
|-------|------------|
| Idle (standing still) | 0.5 per frame |
| Active (moving, fighting) | 0.2 per frame |

**Note:** Since `ENERGY_REGEN_ACTIVE` (0.2) > `ENERGY_COST_MOVE` (0.1), fighters gain a net +0.1 energy per frame while moving, encouraging active play.

This creates a tactical tradeoff: staying still regens energy faster but makes you vulnerable.

---

## Collision Detection

### Body Collision (Push-back)

Fighters can't overlap when at similar heights:

```typescript
// Only apply when vertically overlapping (not jumping over)
const verticalOverlap = (f1.y + f1.height > f2.y) && (f2.y + f2.height > f1.y);

if (verticalOverlap) {
  // Calculate horizontal overlap
  const overlap = (fighter1.x + fighter1.width) - fighter2.x;
  
  // Push both fighters apart equally
  fighter1.x -= overlap / 2;
  fighter2.x += overlap / 2;
}
```

### Hit Detection (AABB)

We use **Axis-Aligned Bounding Box** collision:

```typescript
// Two rectangles overlap if they overlap on BOTH axes
const hit = 
  hitbox.x < opponent.x + opponent.width &&   // hitbox left < opponent right
  hitbox.x + hitbox.w > opponent.x &&          // hitbox right > opponent left
  hitbox.y < opponent.y + opponent.height &&   // hitbox top < opponent bottom
  hitbox.y + hitbox.h > opponent.y;            // hitbox bottom > opponent top
```

```
┌─────────────────────────────────────────────┐
│                  ARENA                       │
│                                              │
│    ┌────────┐      ┌────────────┐           │
│    │Fighter │      │   Hitbox   │           │
│    │   1    ├──────┤            │           │
│    │        │      └────────────┘           │
│    └────────┘             ┌────────┐        │
│                           │Fighter │        │
│                           │   2    │        │
│                           └────────┘        │
│──────────────────────────────────────────────│
│                 GROUND                       │
└─────────────────────────────────────────────┘

If hitbox rectangle overlaps Fighter 2's rectangle → HIT!
```

---

## Fitness Shaping Philosophy

There are two approaches to training AI through evolution:

### Pure Evolution
Only reward winning:
- Winner: +500 fitness
- Loser: +0 fitness

**Pros**: No human bias, may discover unexpected strategies
**Cons**: Very slow to learn, may develop passive strategies (both stand still)

### Guided Evolution (What We Use)
Add rewards for behaviors that lead to winning:
- Approaching opponent
- Facing opponent  
- Attacking when close
- Controlling center
- etc.

**Pros**: Much faster learning, prevents degenerate strategies
**Cons**: May bias AI toward human-expected behaviors

### Our Fitness Shaping Rules

#### Per-Frame Rewards

| Behavior | Fitness/Frame | Purpose |
|----------|---------------|---------|
| Distance < 400px | +0.005 | Approach |
| Distance < 200px | +0.02 | Get closer |
| Distance < 80px | +0.05 | Engage! |
| Facing opponent | +0.02 | Proper stance |
| Attacking in range (<100px) | +0.1 | Encourage offense |
| Moving (vx > 0.5) | +0.008 | Prevent standing |
| Center of arena (<150px from center) | +0.015 | Arena control |

#### Per-Frame Penalties

| Behavior | Fitness/Frame | Purpose |
|----------|---------------|---------|
| Every frame | -0.005 | Time pressure |
| Near edge (<60px from wall) | -0.04 | Discourage corners |

#### Per-Hit Rewards

| Event | Fitness Change |
|-------|----------------|
| Landing a hit | +50 |
| Taking a hit | -20 |

#### Match End Rewards

| Outcome | Fitness Change |
|---------|----------------|
| Winning | +500 |
| Remaining health | +health × 2 |
| Stalemate (timeout + <30 damage dealt) | -100 |

### Match Impact Analysis

A 90-second match at 60 FPS = 5,400 frames.

Maximum per-frame rewards:
- Proximity (always <80px): 5,400 × 0.05 = **270 fitness**
- Always facing: 5,400 × 0.02 = **108 fitness**
- Always moving: 5,400 × 0.008 = **43 fitness**

Compare to win bonus: **500 fitness**

So per-frame shaping is significant but winning still matters most!

---

## World Rules & Boundaries

### Arena Boundaries

```
┌──────────────────────────────────────────────────────────┐
│ x=0                                            x=800     │
│                                                          │
│  ═══════════════════════════════════════════════════════│ y=0
│                                                          │
│                                                          │
│                        ARENA                             │
│                                                          │
│                    (800 × 450 px)                        │
│                                                          │
│──────────────────────────────────────────────────────────│ y=380 (GROUND)
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└──────────────────────────────────────────────────────────┘ y=450
```

### Boundary Enforcement

```typescript
// Ground
if (fighter.y > GROUND_Y - fighter.height) {
  fighter.y = GROUND_Y - fighter.height;
  fighter.vy = 0;
}

// Left wall
if (fighter.x < 0) fighter.x = 0;

// Right wall  
if (fighter.x > CANVAS_WIDTH - fighter.width) {
  fighter.x = CANVAS_WIDTH - fighter.width;
}
```

### Match Rules

| Rule | Value |
|------|-------|
| Match duration | 90 seconds |
| Starting health | 100 |
| Starting energy | 100 |
| Win condition | More health when time expires OR opponent KO'd |

### Training-Specific Rules

The training system includes special rules to ensure fair and effective AI learning:

#### Side Swapping
- **Round-based alternation**: Each training round alternates fighter starting positions
- **Deterministic assignment**: Uses `jobId % 2` to determine side assignment
- **Purpose**: Prevents directional bias and ensures AI learns to fight from both sides
- **Implementation**: [`TrainingWorker.ts - runMatch()`](../services/TrainingWorker.ts#L448)

This systematic side swapping replaces the previous random assignment, guaranteeing equal exposure to both left and right starting positions across all training rounds.

---

## Code References

### Main Game Loop
[index.vue - update() function](../pages/index.vue)

### Fighter Physics
[GameEngine.ts - Fighter.update()](../services/GameEngine.ts#L120)

### Hit Detection
[GameEngine.ts - Fighter.checkHit()](../services/GameEngine.ts#L251)

### Fitness Shaping
[GameEngine.ts - Lines 57-112](../services/GameEngine.ts#L57)

---

← Back to [Neural Network](./NEURAL_NETWORK.md) | Next: [Rendering](./RENDERING.md) →
