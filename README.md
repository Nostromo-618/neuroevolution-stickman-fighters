# 🧠 NeuroFight Evolution

A real-time neuroevolution fighting game where AI fighters learn to combat through genetic algorithms and neural networks. Watch artificial intelligence evolve from random behavior into skilled combatants!

> **Educational Project**: This codebase is extensively documented to help you understand neuroevolution, game development, and React patterns.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

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
git clone https://github.com/yourusername/neuroevolution-stickman-fighters.git
cd neuroevolution-stickman-fighters

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:3003` in your browser.

---

## 🎯 How to Play

### Training Mode
1. Click **START TRAINING**
2. Watch AI fighters battle each other
3. Adjust **Simulation Speed** (up to 5000x) for faster training
4. Monitor the **Fitness Chart** to see learning progress
5. After ~50+ generations, switch to Arcade Mode to fight your AI!

### Arcade Mode (Human vs AI)
| Control | Keyboard | Gamepad |
|---------|----------|---------|
| Move | Arrow Keys / WASD | D-Pad / Left Stick |
| Jump | W / Space | A Button |
| Punch | J / Space | X Button |
| Kick | K | B Button |
| Block | L / Shift | RB / RT |

---

## 📖 Deep Dive Documentation

For detailed explanations of how everything works:

| Document | Description |
|----------|-------------|
| [Neural Network & Genetic Algorithm](docs/NEURAL_NETWORK.md) | How the AI brain works and evolves |
| [Game Engine & Physics](docs/GAME_ENGINE.md) | Combat mechanics, fitness shaping, rules |
| [Visual Rendering](docs/RENDERING.md) | Canvas graphics and animation system |
| [Scripted Fighter](SCRIPTED.md) | Default scripted opponent implementation |

---

## 🏗️ Project Structure

```
neuroevolution-stickman-fighters/
├── App.tsx                 # Main React component, game loop, evolution
├── types.ts                # TypeScript interfaces and enums
├── index.tsx               # React entry point
├── index.html              # HTML template
│
├── services/
│   ├── NeuralNetwork.ts    # Neural network implementation
│   ├── GameEngine.ts       # Fighter physics and combat
│   ├── InputManager.ts     # Keyboard/gamepad input handling
│   ├── ScriptedFighter.ts  # Default scripted opponent logic
│   ├── CustomScriptRunner.ts # User script compilation & execution
│   ├── CustomScriptWorker.js # Web Worker for secure script isolation
│   ├── TrainingWorker.ts   # Web Worker for parallel training
│   └── WorkerPool.ts       # Manages multiple training workers
│
├── components/
│   ├── GameCanvas.tsx      # Canvas rendering of arena/fighters
│   ├── Dashboard.tsx       # Training controls and stats
│   ├── ScriptEditor.tsx    # Monaco code editor modal
│   └── Toast.tsx           # Notification system
│
└── docs/
    ├── NEURAL_NETWORK.md   # AI and evolution deep dive
    ├── GAME_ENGINE.md      # Physics and combat mechanics
    └── RENDERING.md        # Graphics and animation
```

---

## 🧬 How the AI Learns

```
┌─────────────────────────────────────────────────────────────┐
│                    NEUROEVOLUTION LOOP                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. INITIALIZE                                               │
│     └── Create 24 genomes with random neural networks        │
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
│     └── Select parents from top 50%                          │
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

- **React 19** - UI components and state management
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast development server and bundler
- **Canvas 2D API** - Game rendering
- **Web Workers** - Parallel training and secure script execution
- **Monaco Editor** - VS Code-based code editor for custom scripts
- **Recharts** - Fitness visualization graphs
- **Tailwind CSS** - Styling

---

## 📊 Training Tips

1. **Start with default settings** - They're tuned for good results
2. **Let it train for 50+ generations** - Early generations are chaotic
3. **Watch the fitness chart** - If it plateaus, try resetting
4. **Use background training** - Play arcade while AI improves
5. **Export good AIs** - Save your best fighters to share!

---

## 🤝 Contributing

Contributions are welcome! Some ideas:

- Add new attack types (uppercut, sweep, etc.)
- Implement a tournament bracket system
- Add sound effects and music
- Create a multiplayer mode
- Improve the stickman animations
- Share custom fighter scripts

---

## 📄 License

MIT License - feel free to use this code for learning and projects.

---

## 📚 Learn More

- [Neuroevolution on Wikipedia](https://en.wikipedia.org/wiki/Neuroevolution)
- [NEAT Algorithm](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies)
- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Canvas API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

| Audit Result | Date |
|--------------|------|
| ✅ No vulnerabilities found | December 2024 |

```
Total dependencies audited: 50
All packages: No vulnerabilities found!
```

Run security audit: `npx -y auditjs ossi`

---