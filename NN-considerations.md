# Neural Network Architecture Considerations

Research document exploring alternative NN architectures and training methods for the fighting game AI.

---

## Current Implementation

**Architecture:** Fixed feedforward network
- **Inputs:** 12 neurons (distances, health, energy, opponent action, deltas)
- **Hidden:** 2 layers × 16 nodes each (ReLU activation)
- **Outputs:** 8 neurons (one per action, sigmoid activation)

**Training Method:** Neuroevolution (Genetic Algorithm)
- Population of 48 genomes compete in matches
- Fitness = proximity rewards + damage dealt + survival bonus
- Selection: top 25% reproduce via crossover
- Mutation: adaptive rate (30% → 5% over generations)
- Elitism: top 2 genomes preserved unchanged

**Why Script A is strong against the NN:**
1. Deterministic rock-paper-scissors counters (block vs punch, crouch vs kick)
2. Disciplined energy management
3. Optimal spacing (chases when far, maintains range when close)
4. Instant pattern recognition (hardcoded rules vs learned weights)

The NN must *discover* these strategies through random exploration, requiring many generations.

---

## Alternative Architectures

### 1. Deep Q-Network (DQN)

**Core concept:** Learn a Q-function estimating expected future reward for each action.

```
Q(state, action) → expected cumulative reward
Action selection: argmax over all Q-values
```

**Architecture changes:**
- Same inputs (12) and outputs (8)
- Output represents Q-values, not action probabilities
- Add experience replay buffer (store past transitions)
- Add target network (stabilizes learning)

**Training loop:**
```
1. Agent takes action based on Q-values (ε-greedy exploration)
2. Store (state, action, reward, next_state) in replay buffer
3. Sample random batch from buffer
4. Compute target: r + γ * max(Q(next_state))
5. Update network via gradient descent to minimize (Q - target)²
```

**Key components:**
- **Experience replay:** Breaks correlation between consecutive samples
- **Target network:** Copy of Q-network, updated slowly for stability
- **ε-greedy:** Balance exploration (random) vs exploitation (best Q)

**Pros:**
- Learns from individual experiences (sample efficient)
- No need for population (single network)
- Proven on Atari games and fighting games
- Direct reward signal (no fitness shaping)

**Cons:**
- Requires gradient computation (backpropagation)
- Hyperparameter sensitive (learning rate, buffer size, ε decay)
- Can be unstable without Double DQN / Dueling DQN improvements

**Browser implementation:**
- TensorFlow.js supports backprop and neural networks
- [ReImproveJS](https://github.com/BeTomorrow/ReImproveJS) provides browser-native DQN
- [Pong-RL](https://github.com/cpury/pong-rl) demonstrates DQN in browser

**Effort:** Medium

---

### 2. Policy Gradient / Actor-Critic (PPO)

**Core concept:** Directly learn a policy (probability distribution over actions) with a value function baseline.

```
Actor: π(action | state) → probability distribution
Critic: V(state) → expected value from this state
```

**Architecture:**
```
Shared backbone (optional):
  12 inputs → 64 hidden → 64 hidden

Actor head:
  → 8 outputs (softmax) = action probabilities

Critic head:
  → 1 output = state value estimate
```

**PPO training loop:**
```
1. Collect trajectories using current policy
2. Compute advantages: A = R - V(s) (how much better than expected)
3. Update actor to maximize: min(ratio * A, clip(ratio, 1-ε, 1+ε) * A)
4. Update critic to minimize: (V(s) - R)²
5. Repeat
```

**Key innovations:**
- **Clipping:** Prevents too-large policy updates (stability)
- **GAE (Generalized Advantage Estimation):** Reduces variance in advantage estimates
- **On-policy:** Requires fresh data each update

**Why PPO for fighting games:**
- State-of-the-art for [Blade & Soul pro-level AI](https://arxiv.org/abs/1904.03821) (62% win rate vs pros)
- Handles high-dimensional action spaces
- More stable than vanilla policy gradients
- Works well with self-play

**Pros:**
- Highest quality results for fighting games
- Robust to hyperparameter choices (vs other RL)
- Natural exploration via stochastic policy
- Can learn complex multi-step strategies

**Cons:**
- Complex implementation (GAE, PPO clipping, advantage normalization)
- On-policy = needs fresh data each update (less sample efficient)
- Requires careful reward shaping for sparse rewards

**Browser implementation:**
- TensorFlow.js can implement, but no off-the-shelf library
- Would need custom implementation of PPO algorithm

**Effort:** High

---

### 3. NEAT (NeuroEvolution of Augmenting Topologies)

**Core concept:** Evolve both network *topology* and *weights* simultaneously, starting from minimal structure.

**How it differs from current approach:**
| Aspect | Current GA | NEAT |
|--------|------------|------|
| Topology | Fixed (12→16→16→8) | Evolves (starts minimal) |
| Crossover | Weight-only | Topology + weights (via historical markings) |
| Innovation | Random mutations | Protected via speciation |
| Starting point | Full hidden layers | Direct input→output connections |

**Key innovations:**
1. **Historical markings:** Track gene origin for meaningful crossover between different topologies
2. **Speciation:** Group similar topologies together, prevent novel structures from competing against optimized ones too early
3. **Complexification:** Start simple, add nodes/connections only when beneficial

**NEAT process:**
```
Generation 0: 12 inputs directly connected to 8 outputs (no hidden nodes)

Evolution:
- Mutation can ADD a node (split existing connection)
- Mutation can ADD a connection (new link between nodes)
- Weight mutations (same as current GA)
- Crossover aligns genes by historical marking

Speciation:
- Group genomes by structural similarity
- Each species competes internally first
- Novel topologies get protection time to optimize
```

**Pros:**
- Discovers minimal effective architecture
- No need to guess hidden layer size
- Can find novel topologies suited to problem
- Often faster convergence for simple control tasks

**Cons:**
- More complex implementation (innovation numbers, speciation, crossover alignment)
- Variable network sizes complicate batched inference
- May not scale well to very complex problems

**Browser implementation:**
- [neataptic](https://github.com/wagenaartje/neataptic) - Full NEAT implementation in JavaScript
- Drop-in replacement for current neural network

**Effort:** Medium

---

### 4. Behavioral Cloning (Imitation Learning)

**Core concept:** Learn to imitate expert demonstrations via supervised learning.

```
Training data: [(state₁, action₁), (state₂, action₂), ...]
Loss: CrossEntropy(predicted_action, expert_action)
```

**For this project:**
```
1. Run Script A vs various opponents
2. Record at each frame: (12 inputs, action taken)
3. Create dataset of 100k+ (state, action) pairs
4. Train network: minimize cross-entropy loss
5. Result: Network mimics Script A's behavior
```

**Architecture:** Same as current (12→16→16→8), just different training

**Pros:**
- Very fast training (just supervised learning)
- Guaranteed to match expert if network has capacity
- No reward shaping or fitness function needed
- Simple to implement with existing tools

**Cons:**
- Cannot exceed expert performance
- **Distribution shift:** Mistakes compound (network sees states expert never visited)
- Requires recorded demonstrations
- Copies expert's weaknesses too

**Addressing distribution shift:**
- **DAgger (Dataset Aggregation):** Iteratively add new states where cloned policy visits
- **BC + Fine-tuning:** Use BC to initialize, then improve via RL or evolution

**Browser implementation:**
- Standard supervised learning with TensorFlow.js
- Easiest of all alternatives to implement

**Effort:** Low

---

### 5. Hybrid: Behavioral Cloning + Evolution

**Core concept:** Bootstrap knowledge via imitation, then refine with genetic algorithm.

```
Phase 1 (BC): Train network to mimic Script A
Phase 2 (Evolution): Use cloned network as starting point for population
```

**Implementation:**
```
1. Record Script A playing 1000 matches
2. Train base network via behavioral cloning (supervised)
3. Create population by mutating cloned network
4. Run normal evolution from this starting point
5. Network starts with Script A knowledge, evolves beyond it
```

**Why this works:**
- Skips early random exploration phase
- Population starts in "good" region of weight space
- Evolution can discover improvements Script A doesn't have
- Combines best of both approaches

**Pros:**
- Low effort (uses existing evolution code)
- Fast bootstrap (supervised learning is quick)
- Can exceed expert performance
- No new architecture needed

**Cons:**
- Still limited by evolution's exploration capability
- May get stuck near Script A's local optimum
- Needs demonstration recording infrastructure

**Browser implementation:**
- Add recording mode to capture Script A states/actions
- One-time supervised training phase
- Existing evolution code unchanged

**Effort:** Low-Medium

---

### 6. Self-Play Reinforcement Learning

**Core concept:** Train via RL where opponents are past versions of yourself.

Used by: AlphaGo, AlphaStar, OpenAI Five

**Process:**
```
1. Initialize policy (random, BC, or current best)
2. Play matches against pool of past checkpoints
3. Update policy based on wins/losses (PPO or DQN)
4. Periodically save current policy to opponent pool
5. Curriculum: opponents get harder as you improve
```

**Why self-play:**
- No fixed opponent to overfit against
- Creates natural curriculum (easy → hard)
- Discovers strategies that work against diverse opponents
- Can exceed any fixed baseline

**Challenges:**
- Can develop blind spots (strategies that beat self but not others)
- Needs diverse opponent pool management
- Risk of "strategy collapse" (all policies converge to same weakness)

**Solutions:**
- Maintain diverse historical checkpoints
- Periodically evaluate against fixed baselines (Script A/B)
- Use population-based training for diversity

**Browser implementation:**
- Would need RL infrastructure (DQN or PPO)
- Opponent pool storage and selection
- Most complex but most powerful

**Effort:** High

---

## Comparison Table

| Approach | Effort | Browser Support | Expected Quality | Can Beat Script A? | Sample Efficiency |
|----------|--------|-----------------|------------------|-------------------|-------------------|
| Current GA | Done | ✅ Yes | Medium | Eventually | Low (needs population) |
| DQN | Medium | ✅ TensorFlow.js, ReImproveJS | High | Likely faster | Medium |
| PPO | High | ⚠️ TensorFlow.js (custom) | Highest | Yes (SOTA) | Medium |
| NEAT | Medium | ✅ neataptic | Medium-High | Yes | Low |
| Behavioral Cloning | Low | ✅ TensorFlow.js | Matches expert | No (by design) | High |
| BC + Evolution | Low | ✅ Existing code | High | Yes | Medium |
| Self-Play RL | High | ⚠️ Custom | Highest | Yes | Medium |

---

## Recommended Path Forward

### Quick Win: BC + Evolution
1. Add recording mode to capture Script A's decisions
2. Train network via supervised learning (few minutes)
3. Seed evolution population with cloned network
4. Evolution refines and potentially exceeds Script A

### Medium Investment: DQN
1. Integrate TensorFlow.js or ReImproveJS
2. Replace fitness-based selection with Q-learning
3. Single network training instead of population
4. Faster convergence, more principled learning

### Long-term: PPO with Self-Play
1. Implement actor-critic architecture
2. Add PPO training loop
3. Build opponent pool for self-play
4. State-of-the-art fighting game AI

---

## Key Insight

The fundamental difference between approaches:

| Method | Learning Signal | Optimization |
|--------|-----------------|--------------|
| Neuroevolution (current) | Population fitness comparison | Genetic operators (mutation, crossover) |
| DQN / PPO | Reward signal + gradients | Backpropagation |
| Behavioral Cloning | Expert demonstrations | Supervised learning |
| NEAT | Population fitness | Genetic operators + topology changes |

**Gradient-based methods (DQN, PPO)** learn from individual experiences and can make precise adjustments. **Evolution-based methods** learn from population-level statistics and explore more broadly but less precisely.

For fighting games specifically, [research shows](https://arxiv.org/abs/1904.03821) that PPO with self-play achieves pro-level performance, while NEAT can find efficient minimal solutions faster for simpler problems.

---

## References

- [Creating Pro-Level AI for Fighting Game with Deep RL (Blade & Soul)](https://arxiv.org/abs/1904.03821)
- [NEAT Algorithm: Evolving Neural Network Topologies](https://blog.lunatech.com/posts/2024-02-29-the-neat-algorithm-evolving-neural-network-topologies)
- [Deep Learning with JavaScript - RL Chapters](https://livebook.manning.com/book/deep-learning-with-javascript/chapter-11/v-8/)
- [ReImproveJS - Browser RL Framework](https://github.com/BeTomorrow/ReImproveJS)
- [neataptic - JavaScript NEAT Library](https://github.com/wagenaartje/neataptic)
- [PPO Tutorial (Actor-Critic)](https://medium.com/deepgamingai/proximal-policy-optimization-tutorial-part-1-2-actor-critic-method-45a9ebc70f17)
- [Behavioral Cloning for Fighting Game AI (2024)](https://dl.acm.org/doi/10.1007/978-3-031-76607-7_2)
- [TensorFlow.js](https://www.tensorflow.org/js/)
