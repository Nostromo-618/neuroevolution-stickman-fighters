# Memory Neurons Analysis

**Status**: Deferred for future consideration  
**Date**: January 8, 2026

## Problem Statement

AI fighters sometimes exhibit "corner staring" behavior - approaching the opponent but facing away. The current feed-forward architecture lacks temporal awareness.

## What Memory Neurons Would Give Us

- Track opponent patterns over time (e.g., "they always punch after jump")
- Learn sequences like combos
- Counter predictable behaviors

## Why It's Premature

1. **Architecture Change Required**: LSTM/GRU cells need gates and hidden state between frames
2. **Neuroevolution Struggles with Recurrence**: Backprop through time is what makes LSTMs work
3. **Inputs Already Encode Temporal Info**: `oppCooldown`, `enemyAction` provide some context
4. **Low-Hanging Fruit First**: Current 9→13→13→8 architecture (~380 params) hasn't hit ceiling

## Better Alternative: Frame Delta Inputs

Add velocity-like signals to the neural network inputs:
- `enemyHealthDelta` - health change since last frame
- `distanceDelta` - approach/retreat speed
- `enemyActionDelta` - action change detection

This is feed-forward friendly and provides temporal signal without recurrence.

## Prerequisites Before Memory Neurons

1. ✅ Implement flexible NN editor (DONE)
2. ⏳ Optimize fitness values for aggressive play (IN PROGRESS)
3. ⏳ Try 3-layer architectures (9→16→16→16→8)
4. ⏳ Train for longer generations (500+)
5. ⏳ Add delta inputs if still needed

## Implementation Complexity (If We Proceed)

- Add LSTM cell computation to `NeuralNetwork.ts`
- Store hidden state in `Fighter` or `Genome`
- Reset hidden state between matches
- Significantly larger parameter count
- Longer training required

## Recommendation

Wait until the simpler improvements are exhausted before adding memory neurons.
