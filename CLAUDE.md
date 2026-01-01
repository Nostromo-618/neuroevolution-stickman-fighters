# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NeuroFight Evolution is a real-time neuroevolution fighting game where AI fighters learn combat through genetic algorithms and neural networks. Built with Nuxt 4, Vue 3 Composition API, and TypeScript.

## Commands

```bash
# Development
pnpm dev              # Start dev server on http://localhost:3003

# Build
pnpm build            # Production build

# Testing (Playwright)
pnpm test             # Run all tests
pnpm test:ui          # Run tests with Playwright UI
pnpm test:debug       # Debug mode
pnpm test:mobile      # Mobile viewport tests only
pnpm test:desktop     # Desktop viewport tests only
```

## Architecture

### Core Data Flow

```
pages/index.vue (orchestrator)
    ├── composables/useGameSettings.ts    → TrainingSettings state
    ├── composables/useGameState.ts       → GameState (health, timer, etc.)
    ├── composables/usePopulation.ts      → Genome[] population
    ├── composables/useEvolution.ts       → Selection, crossover, mutation
    ├── composables/useGameLoop.ts        → requestAnimationFrame loop
    │       ├── useMatchSetup.ts          → Fighter spawning
    │       └── useMatchUpdate.ts         → Physics, collision, scoring
    └── composables/useBackgroundTraining.ts → Web Worker training
```

### Services Layer (Pure Logic)

| Service | Purpose |
|---------|---------|
| `NeuralNetwork.ts` | Feedforward NN: 9 inputs → 13 hidden → 8 outputs. Crossover/mutation. |
| `GameEngine.ts` | Fighter class with physics, hitboxes, state machine, AI decision-making |
| `WorkerPool.ts` | Distributes match simulations across Web Workers for parallel training |
| `TrainingWorker.ts` | Headless match simulation in worker thread |
| `InputManager.ts` | Keyboard and gamepad input handling |
| `CustomScriptRunner.ts` | Sandboxed user script execution via Web Workers |

### Game Modes

- **Training Mode**: AI vs AI matches. Population evolves after N matches. Use `turboTraining` for parallel Web Worker execution (no visualization).
- **Arcade Mode**: Human vs trained AI. Optional `backgroundTraining` continues evolution while playing.

### Neural Network Architecture

```
INPUT (9 neurons)           HIDDEN (13 neurons)        OUTPUT (8 neurons)
├── Relative X position     ├── tanh activation        ├── IDLE
├── Relative Y position                                ├── MOVE_LEFT
├── Opponent health                                    ├── MOVE_RIGHT
├── Self health                                        ├── JUMP
├── Self energy                                        ├── CROUCH
├── Opponent action (one-hot)                          ├── PUNCH
├── Distance to opponent                               ├── KICK
├── Arena boundary distance                            └── BLOCK
└── Time remaining
```

## Key Patterns

### Vue Reactive Proxies and Web Workers

Vue reactive objects cannot be passed to `postMessage`. When sending data to workers:
```typescript
// Strip reactive proxy before postMessage
JSON.parse(JSON.stringify(reactiveObject))
```

### State Updates

Use updater functions for state changes:
```typescript
setGameState(prev => ({ ...prev, generation: prev.generation + 1 }));
```

### Composable Pattern

Page orchestration in `index.vue` delegates to composables. Complex logic stays in composables, not components.

## Coding Standards (STANDARD.md)

Key rules enforced in this project:
- **No infinite loops** - Use safety counters or cycle IDs to break loops
- **No recursion** - Use explicit iteration
- **Functions ≤120 lines** - Exception for page-level orchestrators
- **Fail fast** - Use `assert()` helper for invariants
- **Zod validation** - For external data (localStorage, API)
- **`strict: true`** in TypeScript

## Test Structure

```
tests/
├── core/           # Game logic tests
├── ui/             # Component rendering tests
├── e2e/            # Full user flow tests
└── fixtures/       # Test data
```
