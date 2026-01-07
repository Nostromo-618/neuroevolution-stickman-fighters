# 🧠 NeuroEvolution: Stickman Fighters

A real-time neuroevolution fighting game where AI fighters learn combat through genetic algorithms and neural networks. Watch artificial intelligence evolve from random behavior into skilled combatants!

**Supports Xbox Gamepad!** Connect via Bluetooth only (the browser's Gamepad API doesn't support wired connections). Troubleshooting: ensure your gamepad is paired in system settings before launching the game.

> **Educational Project**: This codebase is extensively documented to help you understand and learn. Author learns too! So please kindly forgive any errors or typos.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Nuxt](https://img.shields.io/badge/Nuxt-00DC82?style=flat&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-4FC08D?style=flat&logo=vue.js&logoColor=white)

---

## ⚠️ Project Status

**End of Development**: This project will reach end-of-life on **January 31, 2026**. After this date:
- No new features or major updates will be developed
- Github Pages live demo will be decomissioned

## 🎮 Features

- **Visual NN Editor**: Design your neural network architecture with a drag-and-drop interface. Rete.js powered!
- **Training Mode**: Watch AI fight AI. Each generation produces smarter fighters.
- **Arcade Mode**: Fight against the best trained AI with keyboard or gamepad.
- **Custom Script Editor**: Write your own fighter AI in JavaScript with Monaco Editor.
- **Background Training**: AI continues learning while you play.
- **Export/Import**: Save and share your trained AI weights.
- **Real-time Visualization**: See fitness progress on live charts.
- **Parallel Training**: Uses Web Workers for multi-core CPU utilization.
- **Debug Verbosity**: Toggleable verbose logging for simulation diagnostics.

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
3. Adjust **Simulation Speed** or activate Turbo Mode for faster training
4. Monitor the **Fitness Chart** to see learning progress


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

## 📜 Custom Script API

Write your own fighter AI in JavaScript using the Script Editor! Your script is executed in a sandboxed Web Worker and receives the current game state.

### Game State Properties
```javascript
{
  // Your fighter's position and status
  selfX: number,              // X position (0-800)
  selfY: number,              // Y position (0-450)
  selfHealth: number,         // Health (0-100)
  selfEnergy: number,         // Energy (0-100)

  // Opponent's position and status
  enemyX: number,             // Opponent's X position
  enemyY: number,             // Opponent's Y position
  enemyHealth: number,        // Opponent's health (0-100)
  enemyEnergy: number,        // Opponent's energy (0-100)

  // Arena info
  canvasWidth: number,        // Arena width (800)
  canvasHeight: number,       // Arena height (450)
  gravity: number             // Physics constant (0.8)
}
```

### Available Actions
Return an array of action IDs (multiple actions can be active simultaneously):

| ID | Action |
|----|----|
| 0 | IDLE (recover energy) |
| 1 | MOVE_LEFT |
| 2 | MOVE_RIGHT |
| 3 | JUMP (costs 15 energy) |
| 4 | CROUCH (defensive, counters kicks) |
| 5 | PUNCH (5 damage, 10 energy) |
| 6 | KICK (10 damage, 20 energy) |
| 7 | BLOCK (defensive, counters punches) |

### Example Script

```javascript
function fighter(gameState) {
  const distX = gameState.enemyX - gameState.selfX;
  const distY = gameState.enemyY - gameState.selfY;
  const distance = Math.sqrt(distX * distX + distY * distY);

  // Chase enemy if far away
  if (distance > 150) {
    return distX > 0 ? [2] : [1];  // Move toward opponent
  }

  // Fight when close
  if (gameState.selfEnergy > 50) {
    if (Math.abs(distY) < 50) {
      return [5];  // Punch at same height
    } else {
      return [6];  // Kick if height difference
    }
  }

  // Recover energy
  return [0];
}
```

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
└── assets/css/
    └── main.css               # Global styles and Tailwind imports
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
│             • Winning (+300)                                 │
│             • Landing hits & proximity rewards               │
│             • Health preservation & strategic positioning    │
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
- **ECharts** - Fitness visualization graphs
- **Rete.js** - Visual node-based neural network architecture editor

---

## 🛠️ Debugging

The application includes a built-in debug verbosity system to help diagnose simulation freezes or logic issues.

- **Config Location**: `services/Config.ts` → `DEBUG_FLAGS.VERBOSE_LOGGING`
- **Output**: Console logs with timing and categories like `[LOOP]`, `[MATCH]`, `[BG_TRAIN]`.
- **Throttling**: Frame and loop logs are automatically throttled to prevent performance degradation when enabled.

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
| ✅ No vulnerabilities found | January 6, 2026 |
```
 Sonabot here, beep boop beep boop, here are your Sonatype OSS Index results:
  Total dependencies audited: 14

----------------------------------------------------------------------------------------------------------------------------------------
[1/14] - pkg:npm/@monaco-editor/loader@1.7.0 - No vulnerabilities found!
[2/14] - pkg:npm/@nuxt/ui@4.3.0 - No vulnerabilities found!
[3/14] - pkg:npm/acorn@8.15.0 - No vulnerabilities found!
[4/14] - pkg:npm/echarts@6.0.0 - No vulnerabilities found!
[5/14] - pkg:npm/monaco-editor@0.55.1 - No vulnerabilities found!
[6/14] - pkg:npm/nuxt@4.2.2 - No vulnerabilities found!
[7/14] - pkg:npm/rete-area-plugin@2.1.5 - No vulnerabilities found!
[8/14] - pkg:npm/rete-connection-plugin@2.0.5 - No vulnerabilities found!
[9/14] - pkg:npm/rete-render-utils@2.0.3 - No vulnerabilities found!
[10/14] - pkg:npm/rete-vue-plugin@2.1.2 - No vulnerabilities found!
[11/14] - pkg:npm/rete@2.0.6 - No vulnerabilities found!
[12/14] - pkg:npm/vue-echarts@8.0.1 - No vulnerabilities found!
[13/14] - pkg:npm/vue@3.5.26 - No vulnerabilities found!
[14/14] - pkg:npm/zod@4.3.5 - No vulnerabilities found!
```
