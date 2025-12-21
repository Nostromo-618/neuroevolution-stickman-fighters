# Neural Network Training Improvements

## Analysis Date: 2025-12-21

## Issues Identified

### Issue 1: Extremely Sparse Fitness Signal (CRITICAL)
**Location:** `App.tsx` lines 696-708

The fitness system only rewards **KO wins** with a flat +500 bonus. With random initial networks, the probability of getting a KO is extremely low. Most matches end in timeouts or draws, meaning most genomes get 0 fitness. This creates a very sparse reward signal that makes learning nearly impossible.

### Issue 2: Worker Training Uses Full Fitness Shaping (Mismatch)
**Location:** `TrainingWorker.ts` vs `App.tsx`

The worker-based training uses rich fitness shaping (proximity, aggression, hit rewards), but visible training removes all intermediate rewards. Two different training systems running with different fitness functions!

### Issue 3: Network Architecture May Be Too Simple
**Location:** `NeuralNetwork.ts`

- 9 inputs
- 10 hidden neurons (single layer)
- 8 outputs

Fighting games require complex decision-making. A single hidden layer with 10 neurons may lack capacity for nuanced behaviors.

### Issue 4: Selection Pressure is Weak
**Location:** `App.tsx` evolve function

Selecting from top 50% is too generous. Strong selection pressure (top 10-20%) would accelerate learning.

### Issue 5: Small Mutation Step Size
**Location:** `NeuralNetwork.ts`

Mutation step of ±0.25 is too conservative. Early training needs larger mutations to explore solution space.

### Issue 6: Population Size May Be Too Small
Default sizes need 50-200 individuals for complex tasks.

---

## Fixes Implemented

### Fix 1: Restore Proper Fitness Shaping (App.tsx lines 696-737)
**Before:** Only KO wins rewarded (+500)
**After:** Rich reward system:
- Damage dealt: +3 points per damage point
- Remaining health: +2 points per health point  
- KO bonus: +500 for knockout wins
- Timeout wins: +200 for having more health when time runs out
- Stalemate penalty: -100 if timeout with <30 total damage dealt

### Fix 2: Strengthen Selection Pressure (App.tsx)
**Before:** Parents selected from top 50% of population
**After:** Parents selected from top 25% (stronger selection pressure)
- `selectionPoolSize = Math.floor(pop.length / 4)`

### Fix 3: Improve Mutation Strategy (NeuralNetwork.ts)
**Before:** Small mutations only (±0.25)
**After:** 
- Base mutation: ±0.5 to ±1.0 (scales with mutation rate)
- 10% chance of "big mutation" (±2.0) for exploration
- Helps escape local optima

### Fix 4: Improved Adaptive Mutation Rate (App.tsx)
**Before:** 25% → 5% over ~50 generations
**After:** 30% → 5% over ~30 generations
- Faster decay encourages more exploration early, refinement later
- Formula: `Math.max(0.05, 0.30 - (currentGen * 0.008))`

### Fix 5: Increase Network Capacity (NeuralNetwork.ts, TrainingWorker.ts, types.ts)
**Before:** 10 hidden neurons
**After:** 16 hidden neurons (+60% capacity)
- Total weights: 90+80=170 → 144+128=272 weights
- More capacity for complex fighting patterns

### Fix 6: Increase Population Size (App.tsx)
**Before:** 24 genomes per generation
**After:** 48 genomes per generation
- Better genetic diversity
- More exploration of solution space

### Fix 7: Improved Import/Export (NeuralNetwork.ts, App.tsx)
**Before:** 
- Export didn't save generation number
- Import failed silently on architecture mismatch
- "Arcade Only" option was confusing
- Imported genome easily "washed out" by random parents

**After:**
- Export saves generation + architecture metadata (version 1.1 format)
- Import shows clear error messages for incompatible files
- Import restores generation counter for seamless continuation
- Import seeds 25% of population (12 genomes) with imported weights
- Simplified UI: single "Continue Training" button, hidden in Arcade mode

---

## Expected Results
- Faster learning (visible improvement within 10-20 generations instead of 50+)
- More aggressive fighters that approach and attack
- Better timing and spacing behaviors
- More diverse strategies in the population
- Fighters that actually land hits and KO opponents
- Seamless save/load workflow for sharing trained AIs
