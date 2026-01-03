# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A neuroevolution fighting game where AI fighters learn combat through genetic algorithms and neural networks. Built with Nuxt 4, Vue 3, TypeScript, and Canvas 2D rendering. Supports Xbox gamepad via Bluetooth.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 3003, http://localhost:3000/neuroevolution-stickman-fighters/)
pnpm build            # Production build
pnpm test             # Run all Playwright tests
pnpm test:ui          # Run tests with UI
pnpm test:debug       # Debug tests
pnpm test:mobile      # Mobile viewport tests only
pnpm test:desktop     # Desktop viewport tests only
```

## Architecture

### Core Services (`services/`)

- **NeuralNetwork.ts** - Feedforward neural network (9 inputs → 13 hidden × 2 layers → 8 outputs). Handles forward propagation, mutation, and crossover for genetic algorithms.
- **GameEngine.ts** - Fighter physics, combat mechanics, collision detection, damage calculation.
- **TrainingWorker.ts / WorkerPool.ts** - Web Workers for parallel neuroevolution training. Population competes in fights, winners reproduce.
- **MirrorTrainer.ts** - Real-time AI that adapts to player behavior during arcade matches.
- **CustomScriptRunner.ts / CustomScriptWorker.js** - Sandboxed execution of user-written fighter AI scripts via Web Workers.
- **Config.ts** - All magic numbers, physics constants, and feature flags. Single source of truth for configuration.
- **InputManager.ts** - Keyboard and gamepad input handling.

### Composables (`composables/`)

Reactive state management following Vue Composition API patterns:
- **useEvolution.ts** - Evolution loop orchestration (population, generations, fitness tracking)
- **useBackgroundTraining.ts** - Background worker management for training while playing
- **useMatchSetup.ts** - Match configuration (player types, scripts, AI selection)
- **useMatchUpdate.ts** - Frame-by-frame match state updates
- **useGameLoop.ts** - requestAnimationFrame game loop with pause/resume
- **useCustomScriptWorkers.ts** - Custom script worker lifecycle management

### Types (`types.ts`)

Central type definitions including:
- `FighterAction` enum (IDLE=0 through BLOCK=7) - maps directly to neural network outputs
- `NeuralNetworkData` - weight matrices for the feedforward network
- `Genome` - complete AI individual with network, fitness, and stats
- `Fighter`, `GameState` - runtime game state types

## Coding Standards

This project follows strict stability rules (see `STANDARD.md` and `.cursor/rules/coding-standard-cursor.mdc`):

1. **No recursion** - Use explicit loops only
2. **No `while(true)`** - All loops need provable upper bounds
3. **State machines over booleans** - Use `status: 'idle' | 'fetching' | 'success'` patterns
4. **Guard clauses** - Early returns to keep low indentation
5. **Object pooling** in game engine - Reuse objects to minimize GC
6. **120 line max** for functions/components (except page orchestrators)
7. **`assert()` helper** for fail-fast invariants (`utils/assert.ts`)
8. **Zod** for external data validation
9. **All constants in `Config.ts`** - No magic numbers
10. **`strict: true`** in TypeScript, zero warnings policy

## Key Patterns

- **Vue reactivity with game state**: Game engine uses object pooling internally, but `structuredClone` or spreads for Vue state updates
- **Web Workers**: Training and custom scripts run in workers for parallelism and sandboxing
- **Neural network architecture**: Standard AI uses 13 hidden nodes, Chuck AI uses 32 hidden nodes (configured in `Config.ts`)
- **Player types**: Human, Simple AI (neural network), Chuck AI (larger network, feature-flagged off by default), Custom Script A/B
