# 🧠 Neural Network & Genetic Algorithm

This document explains how the AI brain works and how it evolves to become better at fighting.

---

## Table of Contents

1. [What is a Neural Network?](#what-is-a-neural-network)
2. [Network Architecture](#network-architecture)
3. [Forward Propagation](#forward-propagation)
4. [Activation Functions](#activation-functions)
5. [What is Neuroevolution?](#what-is-neuroevolution)
6. [The Genetic Algorithm](#the-genetic-algorithm)
7. [Fitness Function](#fitness-function)
8. [Code Deep Dive](#code-deep-dive)

---

## What is a Neural Network?

A **neural network** is a computational model loosely inspired by biological brains. It consists of interconnected "neurons" organized in layers that process information.

```
                    ┌──────────────────────────────────────────┐
                    │           NEURAL NETWORK                 │
                    │                                          │
   INPUTS           │    HIDDEN         OUTPUT                 │
  (What AI sees)    │    (Processing)   (Decisions)            │
                    │                                          │
  Distance ──────►  │    ○ ───┐                                │
  Health ─────────► │    ○ ───┼───► ○ Move Left                │
  Opponent ───────► │    ○ ───┼───► ○ Move Right               │
  Energy ─────────► │    ○ ───┼───► ○ Jump                     │
  ...               │    ○ ───┼───► ○ Punch                    │
                    │    ○ ───┼───► ○ Kick                     │
                    │    ○ ───┘───► ○ Block                    │
                    │                                          │
                    └──────────────────────────────────────────┘
```

Each connection has a **weight** (a number). The network learns by adjusting these weights.

---

## Network Architecture

Our network has three layers:

| Layer | Neurons | Purpose |
|-------|---------|---------|
| **Input** | 9 | Perceive game state |
| **Hidden** | 16 | Process and combine information |
| **Output** | 8 | Decide which actions to take |

### Input Neurons (9 total)

The AI "sees" the game through these normalized values:

| Input | Description | Range |
|-------|-------------|-------|
| `distanceX` | Horizontal distance to opponent | -1 to 1 |
| `distanceY` | Vertical distance to opponent | -1 to 1 |
| `selfHealth` | Own health percentage | 0 to 1 |
| `enemyHealth` | Opponent's health percentage | 0 to 1 |
| `enemyAction` | What opponent is doing | 0 to 1 |
| `selfEnergy` | Own energy for actions | 0 to 1 |
| `facingDirection` | Which way we face | -1 or 1 |
| `oppCooldown` | Opponent's action cooldown | 0 to 1 |
| `oppEnergy` | Opponent's energy | 0 to 1 |

### Output Neurons (8 total)

Each output corresponds to a possible action:

| Output Index | Action |
|--------------|--------|
| 0 | IDLE (no action) |
| 1 | MOVE_LEFT |
| 2 | MOVE_RIGHT |
| 3 | JUMP |
| 4 | CROUCH |
| 5 | PUNCH |
| 6 | KICK |
| 7 | BLOCK |

If output > 0.5, that action is triggered. Multiple actions can be active simultaneously!

---

## Forward Propagation

**Forward propagation** is how the network computes outputs from inputs.

### Step 1: Input → Hidden Layer

For each hidden neuron:
```
sum = (input₁ × weight₁) + (input₂ × weight₂) + ... + bias
output = ReLU(sum)
```

### Step 2: Hidden → Output Layer

For each output neuron:
```
sum = (hidden₁ × weight₁) + (hidden₂ × weight₂) + ... + bias
output = sigmoid(sum)
```

### Visual Example

```
Input: [0.5, -0.3, 0.8, 0.2, 0.0, 0.7, 1.0, 0.1, 0.6]
                    │
                    ▼
        ┌───────────────────────┐
        │   Hidden Layer        │
        │   (10 neurons)        │
        │                       │
        │   Apply weights       │
        │   Add biases          │
        │   ReLU activation     │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   Output Layer        │
        │   (8 neurons)         │
        │                       │
        │   Apply weights       │
        │   Add biases          │
        │   Sigmoid activation  │
        └───────────────────────┘
                    │
                    ▼
Output: [0.2, 0.1, 0.8, 0.3, 0.1, 0.9, 0.4, 0.2]
         │         │              │
         │         │              └── Punch! (0.9 > 0.5)
         │         └── Move Right! (0.8 > 0.5)
         └── No idle (0.2 < 0.5)
```

---

## Activation Functions

Activation functions introduce **non-linearity**, allowing networks to learn complex patterns.

### ReLU (Rectified Linear Unit)

Used in the hidden layer.

```
ReLU(x) = max(0, x)
```

```
Output
   │
 3 ┤         ╱
   │        ╱
 2 ┤       ╱
   │      ╱
 1 ┤     ╱
   │    ╱
 0 ┼────┼───────────
   │   0   1   2   3
   Input
```

**Why ReLU?**
- Very fast to compute
- No vanishing gradient problem
- Works well in practice

### Sigmoid

Used in the output layer.

```
sigmoid(x) = 1 / (1 + e^(-x))
```

```
Output
   │
 1 ┤            ────────
   │          ╱
0.5┤        ┄┄
   │      ╱
 0 ┼──────
  -4 -2  0  2  4
   Input
```

**Why Sigmoid?**
- Output always between 0 and 1
- Perfect for probability-like decisions
- Values > 0.5 trigger actions

---

## What is Neuroevolution?

**Neuroevolution** uses evolutionary algorithms to train neural networks instead of traditional gradient-based methods (like backpropagation).

### Traditional Training vs Neuroevolution

| Aspect | Backpropagation | Neuroevolution |
|--------|-----------------|----------------|
| Requires labeled data | Yes | No |
| How it learns | Calculates gradients | Natural selection |
| Best for | Classification, regression | Games, robotics |
| Exploration | Local | Global |
| Can find unexpected solutions | Rarely | Often! |

### Why Neuroevolution for Games?

1. **No training data needed** - Fitness comes from gameplay results
2. **Handles complex environments** - Like fighting games with many variables
3. **Discovers creative strategies** - Not constrained by human labels
4. **Parallelizable** - Each genome can be evaluated independently

---

## The Genetic Algorithm

Our genetic algorithm has four key operations:

### 1. Selection (Survival of the Fittest)

After all matches in a generation:
1. Sort genomes by total fitness (highest first)
2. Top performers are more likely to reproduce

We use **tournament selection**: pick parents from top 25% of population for stronger selection pressure.

### 2. Elitism (Preserve the Best)

The top 2 genomes are copied unchanged to the next generation. This ensures we never lose our best solutions.

```
Generation N:     [Best] [2nd] [3rd] [4th] [5th] ...
                    │      │
                    ▼      ▼
Generation N+1:   [Best] [2nd] [New] [New] [New] ...
                    ↑      ↑      ↑      ↑      ↑
                 Copied  Copied  Children from crossover
```

### 3. Crossover (Sexual Reproduction)

Two parent networks combine to create a child:

```
Parent A weights: [0.5, -0.3, 0.8, 0.2, -0.1]
Parent B weights: [0.1,  0.7, 0.2, 0.9,  0.4]
                    │     │    │    │     │
                    A     B    A    B     A   (random choice)
                    │     │    │    │     │
Child weights:    [0.5,  0.7, 0.8, 0.9, -0.1]
```

This allows beneficial traits from both parents to combine!

### 4. Mutation (Random Changes)

After crossover, each weight has a chance to be slightly modified:

```
Original:  [0.5, 0.7, 0.8, 0.9, -0.1]
                 ↓              ↓
Mutated:   [0.5, 0.82, 0.8, 0.9, -0.18]
               (+0.12)        (-0.08)
```

**Adaptive Mutation Rate:**
- Starts at 30% (lots of exploration)
- Decays to 5% over ~30 generations (more refinement)
- 10% of mutations are "big mutations" (±2.0) for escaping local optima

---

## Fitness Function

Fitness measures how "good" a genome is. Higher = better.

### Match Outcomes

| Event | Fitness Change |
|-------|----------------|
| Win the match | +500 |
| Land a hit | +50 |
| Get hit | -20 |
| Remaining health | +health × 2 |
| Stalemate (timeout, low damage) | -100 |

### Side Swapping Mechanism

To prevent directional bias in AI training, the system now implements **round-based side swapping**:

- **Alternating sides**: Each round alternates which fighter starts on the left (blue) vs right (red) side
- **Deterministic assignment**: Uses `jobId % 2` to determine side assignment (even = normal, odd = swapped)
- **Fair training**: Ensures AI learns to fight effectively from both sides of the arena
- **Prevents bias**: Eliminates the tendency for AI to favor one direction over another

This change replaces the previous random 50% side assignment with a systematic approach that guarantees equal exposure to both sides across training rounds.

### Per-Frame Shaping (Training Guidance)

We add small rewards/penalties each frame to guide learning:

| Behavior | Fitness/Frame | Purpose |
|----------|---------------|---------|
| Close to opponent (<80px) | +0.05 | Encourage engagement |
| Medium distance (<200px) | +0.02 | Approach opponent |
| Facing opponent | +0.02 | Proper stance |
| Attacking in range | +0.1 | Encourage offense |
| Near arena edge | -0.04 | Avoid corners |
| Center of arena | +0.015 | Control space |
| Moving | +0.008 | Prevent standing still |
| Every frame | -0.005 | Prevent stalling |

> **Note:** These shaping rewards speed up learning but may bias strategies. See [Pure vs Guided Evolution](./GAME_ENGINE.md#fitness-philosophy) for discussion.

---

## Code Deep Dive

### Creating a Random Network

```typescript
// File: services/NeuralNetwork.ts

export const createRandomNetwork = (): NeuralNetwork => {
  // 9 inputs × 16 hidden = 144 weights
  const inputWeights = Array(9).fill(0).map(() => 
    Array(16).fill(0).map(() => Math.random() * 2 - 1)  // Range: -1 to 1
  );
  
  // 16 hidden × 8 outputs = 128 weights
  const outputWeights = Array(16).fill(0).map(() => 
    Array(8).fill(0).map(() => Math.random() * 2 - 1)
  );

  // 16 hidden biases + 8 output biases = 24 total
  const biases = Array(24).fill(0).map(() => Math.random() * 2 - 1);

  return { inputWeights, outputWeights, biases };
};
```

### Forward Propagation

```typescript
// File: services/NeuralNetwork.ts

export const predict = (network: NeuralNetwork, inputs: number[]): number[] => {
  // Hidden layer: Input → Hidden
  const hidden = [];
  for (let h = 0; h < 16; h++) {
    let sum = network.biases[h];
    for (let i = 0; i < 9; i++) {
      sum += inputs[i] * network.inputWeights[i][h];
    }
    hidden.push(Math.max(0, sum));  // ReLU
  }

  // Output layer: Hidden → Output
  const outputs = [];
  for (let o = 0; o < 8; o++) {
    let sum = network.biases[16 + o];
    for (let h = 0; h < 16; h++) {
      sum += hidden[h] * network.outputWeights[h][o];
    }
    outputs.push(1 / (1 + Math.exp(-sum)));  // Sigmoid
  }

  return outputs;
};
```

### Evolution Step

```typescript
// File: App.tsx (evolve function)

const evolve = () => {
  // Sort by fitness (best first)
  population.sort((a, b) => b.fitness - a.fitness);
  
  // Elitism: Keep best 2
  const newPop = [
    { ...population[0], fitness: 0 },  // Clone best
    { ...population[1], fitness: 0 },  // Clone 2nd best
  ];
  
  // Fill rest with offspring
  while (newPop.length < POPULATION_SIZE) {
    // Tournament selection from top 25% (stronger pressure)
    const selectionPoolSize = Math.floor(population.length / 4);
    const parentA = population[randomInt(selectionPoolSize)];
    const parentB = population[randomInt(selectionPoolSize)];
    
    // Crossover
    let child = crossoverNetworks(parentA.network, parentB.network);
    
    // Mutation
    child = mutateNetwork(child, mutationRate);
    
    newPop.push({ network: child, fitness: 0 });
  }
  
  population = newPop;
  generation++;
};
```

---

## Further Reading

- [Neural Networks - 3Blue1Brown (Video)](https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi)
- [Neuroevolution Wikipedia](https://en.wikipedia.org/wiki/Neuroevolution)
- [NEAT Algorithm](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies)
- [Genetic Algorithm Visualization](https://rednuht.org/genetic_cars_2/)

---

← Back to [README](../README.md) | Next: [Game Engine](./GAME_ENGINE.md) →
