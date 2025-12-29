# 🧠 NeuroFight Evolution

A real-time neuroevolution fighting game where AI fighters learn combat through genetic algorithms and neural networks. Watch artificial intelligence evolve from random behavior into skilled combatants!

**Supports Xbox Gamepad! But you need to connect it via bluetooth. Cable not supported.**

> **Educational Project**: This codebase is extensively documented to help you understand and learn. Author learns too! So please kindly forgive any errors or typos.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-4FC08D?style=flat&logo=vue.js&logoColor=white)

---

## 🎮 Features

- **Training Mode**: Watch AI fight AI. Each generation produces smarter fighters.
- **Arcade Mode**: Fight against the best trained AI with keyboard or gamepad.
- **Custom Script Editor**: Write your own fighter AI in JavaScript with Monaco Editor.
- **Background Training**: AI continues learning while you play.
- **Export/Import**: Save and share your trained AI weights.
- **Real-time Visualization**: See fitness progress on live charts.
- **Parallel Training**: Uses Web Workers for multi-core CPU utilization.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Nostromo-618/neuroevolution-stickman-fighters.git
cd neuroevolution-stickman-fighters

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open `http://localhost:3000/neuroevolution-stickman-fighters/` in your browser.

---

## 🎯 How to Play

### Training Mode
1. Click **START TRAINING**
2. Watch AI fighters battle each other
3. Adjust **Simulation Speed** (up to 5000x) for faster training
4. Monitor the **Fitness Chart** to see learning progress
5. After ~50+ generations, switch to Arcade Mode to fight your AI!

> **Tip**: Reaching generation >1500 with a 9% mutation rate observed resulted in more "reasonable" fighter behavior during training.


### Arcade Mode (Human vs AI)
| Control | Keyboard | Gamepad |
|---------|----------|---------|
| Move | Arrow Keys / WASD | D-Pad / Left Stick |
| Punch | J | X / A Button |
| Kick | K | Y / B Button |
| Block | L | RB / LB |

**Features:**
- **Custom Player Slots**: Choose who fights - Human, Neural AI, Script A, or Script B.
- **Script vs Script**: Pit two different custom scripts against each other to test strategies.
- **Immediate Feedback**: Canvas updates instantly when you change fighter settings.

---

## 📖 Deep Dive Documentation

For detailed explanations of how everything works:

| Document | Description |
|----------|-------------|
| [Neural Network & Genetic Algorithm](docs/NEURAL_NETWORK.md) | How the AI brain works and evolves |
| [Game Engine & Physics](docs/GAME_ENGINE.md) | Combat mechanics, fitness shaping, rules |
| [Visual Rendering](docs/RENDERING.md) | Canvas graphics and animation system |

---

## 🏗️ Project Structure

```
neuroevolution-stickman-fighters/
├── app.vue                    # Root Nuxt layout with header/footer
├── nuxt.config.ts             # Nuxt configuration
├── app.config.ts              # Nuxt UI theme configuration
│
├── pages/
│   └── index.vue              # Main game page (Training/Arcade modes)
│
├── components/
│   ├── AppHeader.vue          # App header with logo and links
│   ├── AppFooter.vue          # Footer with Nuxt credits
│   ├── GameCanvas.vue         # Canvas rendering of arena/fighters
│   ├── Dashboard.vue          # Training controls and stats
│   ├── MatchConfiguration.vue # Player selection and settings
│   ├── ScriptEditor.vue       # Monaco code editor modal
│   ├── TrainingParameters.vue # Evolution algorithm controls
│   ├── ControlsHelper.vue     # Keyboard/gamepad controls display
│   └── NeuralNetworkVisualization.vue # Live NN diagram
│
├── services/
│   ├── NeuralNetwork.ts       # Neural network implementation
│   ├── GameEngine.ts          # Fighter physics and combat
│   ├── InputManager.ts        # Keyboard/gamepad input handling
│   ├── CustomScriptRunner.ts  # User script compilation & execution
│   ├── TrainingWorker.ts      # Web Worker for parallel training
│   └── WorkerPool.ts          # Manages multiple training workers
│
├── composables/
│   └── useToast.ts            # Toast notification composable
│
├── assets/css/
│   └── main.css               # Global styles and Tailwind imports
│
└── docs/
    ├── NEURAL_NETWORK.md      # AI and evolution deep dive
    ├── GAME_ENGINE.md         # Physics and combat mechanics
    └── RENDERING.md           # Graphics and animation
```

---

## 🧬 How the AI Learns

```
┌─────────────────────────────────────────────────────────────┐
│                    NEUROEVOLUTION LOOP                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. INITIALIZE                                               │
│     └── Create 48 genomes with random neural networks        │
│                                                              │
│  2. EVALUATE                                                 │
│     └── Pair genomes and simulate fights                     │
│         └── Each fight awards fitness based on:              │
│             • Winning (+500)                                 │
│             • Landing hits (+50 each)                        │
│             • Staying close to opponent                      │
│             • Controlling center of arena                    │
│                                                              │
│  3. SELECT                                                   │
│     └── Sort genomes by total fitness                        │
│     └── Keep top 2 unchanged (elitism)                       │
│                                                              │
│  4. REPRODUCE                                                │
│     └── Select parents from top 25%                          │
│     └── Combine their neural networks (crossover)            │
│     └── Apply random changes (mutation)                      │
│                                                              │
│  5. REPEAT                                                   │
│     └── Go back to step 2 with new generation                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

Over generations, networks that produce winning behaviors are preserved and refined, while poor performers are replaced.

---

## 🔧 Technologies Used

- **Nuxt 4** - Vue-based full-stack framework
- **Vue 3** - Composition API with TypeScript
- **Nuxt UI** - Beautiful, accessible UI components
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Canvas 2D API** - Game rendering
- **Web Workers** - Parallel training and secure script execution
- **Monaco Editor** - VS Code-based code editor for custom scripts
- **Recharts** - Fitness visualization graphs

## 📄 License

MIT License - feel free to use this code for learning and projects.

---

## 📚 Learn More

- [Neuroevolution on Wikipedia](https://en.wikipedia.org/wiki/Neuroevolution)
- [NEAT Algorithm](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies)
- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Nuxt Documentation](https://nuxt.com/docs)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

---

| Audit Result | Date |
|--------------|------|
| ✅ No vulnerabilities found | December 2024 |