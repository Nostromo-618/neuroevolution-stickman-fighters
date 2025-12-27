# 🧠 NeuroFight Evolution

A real-time neuroevolution fighting game where AI fighters learn to combat through genetic algorithms and neural networks. Watch artificial intelligence evolve from random behavior into skilled combatants!

**Supports Xbox Gamepad! But you need to connect it via bluetooth. Cable not supported.**

> **Educational Project**: This codebase is extensively documented to help you understand and learn. Author learns too! So please kindly forgive any errors or typos.

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

> **Tip**: Reaching generation >1500 with a 9% mutation rate observed resulted in more "reasonable" fighter behavior during training.


### Arcade Mode (Human vs AI)
| Control | Keyboard | Gamepad |
|---------|----------|---------|
| Move | Arrow Keys / WASD | D-Pad / Left Stick |
| Jump | W / Space | A Button |
| Punch | J / Space | X Button |
| Kick | K | B Button |
| Block | L / Shift | RB / RT |

**New Features in v1.2.0:**
- **Custom Player Slots**: You can now choose who fights!
  - **Player 1**: Human, Custom Script A, or Custom Script B.
  - **Player 2**: Neural AI, Scripted Bot, Custom Script A, or Custom Script B.
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
├── App.tsx                 # Main React component, game loop, evolution
├── types.ts                # TypeScript interfaces and enums
├── index.tsx               # React entry point
├── index.html              # HTML template
│
├── services/
│   ├── NeuralNetwork.ts    # Neural network implementation
│   ├── GameEngine.ts       # Fighter physics and combat
│   ├── InputManager.ts     # Keyboard/gamepad input handling
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

- **React 19** - UI components and state management
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast development server and bundler
- **Canvas 2D API** - Game rendering
- **Web Workers** - Parallel training and secure script execution
- **Monaco Editor** - VS Code-based code editor for custom scripts
- **Recharts** - Fitness visualization graphs
- **Tailwind CSS** - Styling

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
 ________   ___  ___   ________   ___   _________       ___   ________      
|\   __  \ |\  \|\  \ |\   ___ \ |\  \ |\___   ___\    |\  \ |\   ____\     
\ \  \|\  \\ \  \\\  \\ \  \_|\ \\ \  \\|___ \  \_|    \ \  \\ \  \___|_    
 \ \   __  \\ \  \\\  \\ \  \ \\ \\ \  \    \ \  \   __ \ \  \\ \_____  \   
  \ \  \ \  \\ \  \\\  \\ \  \_\\ \\ \  \    \ \  \ |\  \\_\  \\|____|\  \  
   \ \__\ \__\\ \_______\\ \_______\\ \__\    \ \__\\ \________\ ____\_\  \ 
    \|__|\|__| \|_______| \|_______| \|__|     \|__| \|________||\_________\
                                                                \|_________|
                                                                            
                                                                            
  _      _                       _   _              
 /_)    /_`_  _  _ _/_   _  _   (/  /_`_._  _   _/ _
/_)/_/ ._//_// //_|/ /_//_//_' (_X /  ///_'/ //_/_\ 
   _/                _//                            

  AuditJS version: 4.0.47

✔ Starting application
✔ Getting coordinates for Sonatype OSS Index
✔ Auditing your application with Sonatype OSS Index
✔ Submitting coordinates to Sonatype OSS Index
✔ Reticulating splines
✔ Removing whitelisted vulnerabilities

  Sonabot here, beep boop beep boop, here are your Sonatype OSS Index results:
  Total dependencies audited: 50

--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
[1/50] - pkg:npm/@monaco-editor/loader@1.7.0 - No vulnerabilities found!
[2/50] - pkg:npm/@monaco-editor/react@4.7.0 - No vulnerabilities found!
[3/50] - pkg:npm/@reduxjs/toolkit@2.11.2 - No vulnerabilities found!
[4/50] - pkg:npm/@standard-schema/spec@1.1.0 - No vulnerabilities found!
[5/50] - pkg:npm/@standard-schema/utils@0.3.0 - No vulnerabilities found!
[6/50] - pkg:npm/@types/d3-array@3.2.2 - No vulnerabilities found!
[7/50] - pkg:npm/@types/d3-color@3.1.3 - No vulnerabilities found!
[8/50] - pkg:npm/@types/d3-ease@3.0.2 - No vulnerabilities found!
[9/50] - pkg:npm/@types/d3-interpolate@3.0.4 - No vulnerabilities found!
[10/50] - pkg:npm/@types/d3-path@3.1.1 - No vulnerabilities found!
[11/50] - pkg:npm/@types/d3-scale@4.0.9 - No vulnerabilities found!
[12/50] - pkg:npm/@types/d3-shape@3.1.7 - No vulnerabilities found!
[13/50] - pkg:npm/@types/d3-time@3.0.4 - No vulnerabilities found!
[14/50] - pkg:npm/@types/d3-timer@3.0.2 - No vulnerabilities found!
[15/50] - pkg:npm/@types/trusted-types@2.0.7 - No vulnerabilities found!
[16/50] - pkg:npm/@types/use-sync-external-store@0.0.6 - No vulnerabilities found!
[17/50] - pkg:npm/clsx@2.1.1 - No vulnerabilities found!
[18/50] - pkg:npm/d3-array@3.2.4 - No vulnerabilities found!
[19/50] - pkg:npm/d3-color@3.1.0 - No vulnerabilities found!
[20/50] - pkg:npm/d3-ease@3.0.1 - No vulnerabilities found!
[21/50] - pkg:npm/d3-format@3.1.0 - No vulnerabilities found!
[22/50] - pkg:npm/d3-interpolate@3.0.1 - No vulnerabilities found!
[23/50] - pkg:npm/d3-path@3.1.0 - No vulnerabilities found!
[24/50] - pkg:npm/d3-scale@4.0.2 - No vulnerabilities found!
[25/50] - pkg:npm/d3-shape@3.2.0 - No vulnerabilities found!
[26/50] - pkg:npm/d3-time-format@4.1.0 - No vulnerabilities found!
[27/50] - pkg:npm/d3-time@3.1.0 - No vulnerabilities found!
[28/50] - pkg:npm/d3-timer@3.0.1 - No vulnerabilities found!
[29/50] - pkg:npm/decimal.js-light@2.5.1 - No vulnerabilities found!
[30/50] - pkg:npm/dompurify@3.2.7 - No vulnerabilities found!
[31/50] - pkg:npm/es-toolkit@1.43.0 - No vulnerabilities found!
[32/50] - pkg:npm/eventemitter3@5.0.1 - No vulnerabilities found!
[33/50] - pkg:npm/immer@10.2.0 - No vulnerabilities found!
[34/50] - pkg:npm/immer@11.0.1 - No vulnerabilities found!
[35/50] - pkg:npm/internmap@2.0.3 - No vulnerabilities found!
[36/50] - pkg:npm/marked@14.0.0 - No vulnerabilities found!
[37/50] - pkg:npm/monaco-editor@0.55.1 - No vulnerabilities found!
[38/50] - pkg:npm/react-dom@19.2.3 - No vulnerabilities found!
[39/50] - pkg:npm/react-is@19.2.3 - No vulnerabilities found!
[40/50] - pkg:npm/react-redux@9.2.0 - No vulnerabilities found!
[41/50] - pkg:npm/react@19.2.3 - No vulnerabilities found!
[42/50] - pkg:npm/recharts@3.6.0 - No vulnerabilities found!
[43/50] - pkg:npm/redux-thunk@3.1.0 - No vulnerabilities found!
[44/50] - pkg:npm/redux@5.0.1 - No vulnerabilities found!
[45/50] - pkg:npm/reselect@5.1.1 - No vulnerabilities found!
[46/50] - pkg:npm/scheduler@0.27.0 - No vulnerabilities found!
[47/50] - pkg:npm/state-local@1.0.7 - No vulnerabilities found!
[48/50] - pkg:npm/tiny-invariant@1.3.3 - No vulnerabilities found!
[49/50] - pkg:npm/use-sync-external-store@1.6.0 - No vulnerabilities found!
[50/50] - pkg:npm/victory-vendor@37.3.6 - No vulnerabilities found!
```
---