/**
 * =============================================================================
 * APP.TSX - Main Application Component
 * =============================================================================
 * 
 * This is the central hub of the NeuroFight Evolution application.
 * It coordinates all major systems:
 * 
 * 1. POPULATION MANAGEMENT (Genetic Algorithm)
 *    - Creates initial random population of AI genomes
 *    - Pairs genomes for fights each generation
 *    - Evolves population after all matches complete
 *    - Tracks best performer across generations
 * 
 * 2. GAME LOOP (60 FPS Animation Frame)
 *    - Runs physics simulation each frame
 *    - Handles input for human player (Arcade mode)
 *    - Processes AI decisions via neural networks
 *    - Detects match end conditions (KO, timeout)
 * 
 * 3. MODE MANAGEMENT
 *    - TRAINING: AI vs AI, population evolves automatically
 *    - ARCADE: Human vs Best AI, optional background training
 * 
 * 4. BACKGROUND TRAINING (Web Workers)
 *    - Offloads training to separate CPU threads
 *    - Allows AI to improve while human plays
 * 
 * REACT PATTERNS USED:
 * - useState for UI-reactive state (settings, game state)
 * - useRef for mutable state that shouldn't trigger re-renders (population, timers)
 * - useCallback for stable function references
 * - useEffect for side effects (game loop, worker management)
 * 
 * WHY REFS FOR GAME STATE?
 * The game loop runs at 60 FPS via requestAnimationFrame.
 * Using useState would cause 60 re-renders per second.
 * Refs allow mutation without triggering React's reconciliation.
 * We only sync to React state periodically for UI updates.
 * 
 * =============================================================================
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { InputManager } from './services/InputManager';
import { Fighter, CANVAS_WIDTH, CANVAS_HEIGHT } from './services/GameEngine';
import { createRandomNetwork, mutateNetwork, crossoverNetworks, exportGenome, importGenome } from './services/NeuralNetwork';
import { Genome, TrainingSettings, GameState } from './types';
import GameCanvas from './components/GameCanvas';
import Dashboard from './components/Dashboard';
import Toast, { useToast } from './components/Toast';
import { WorkerPool } from './services/WorkerPool';

// =============================================================================
// MAIN APPLICATION COMPONENT
// =============================================================================

const App = () => {
  // --- State ---
  const [settings, setSettings] = useState<TrainingSettings>({
    populationSize: 24,
    mutationRate: 0.1,
    simulationSpeed: 1,
    gameMode: 'TRAINING',
    isRunning: false, // Start paused
    backgroundTraining: false, // Background training off by default
  });

  const [gameState, setGameState] = useState<GameState>({
    player1Health: 100, player2Health: 100,
    player1Energy: 100, player2Energy: 100,
    timeRemaining: 90, generation: 1, bestFitness: 0,
    matchActive: false,
    winner: null
  });

  const [fitnessHistory, setFitnessHistory] = useState<{ gen: number, fitness: number }[]>([]);
  const [pendingImport, setPendingImport] = useState<Genome | null>(null);

  // Toast notifications
  const { toasts, addToast, removeToast } = useToast();

  // --- Refs for Game Loop & State Access ---
  const populationRef = useRef<Genome[]>([]);
  const bestTrainedGenomeRef = useRef<Genome | null>(null);
  const activeMatchRef = useRef<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>(null);
  const currentMatchIndex = useRef(0);
  const inputManager = useRef<InputManager | null>(null);
  const requestRef = useRef<number | null>(null);

  // We use a separate ref for timer logic to ensure accuracy during high-speed simulation steps
  // without waiting for React state updates.
  const matchTimerRef = useRef(90);

  // Background training refs
  const workerPoolRef = useRef<WorkerPool | null>(null);
  const isWorkerTrainingRef = useRef<boolean>(false);

  const settingsRef = useRef(settings);
  const gameStateRef = useRef(gameState);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // --- Initialization ---
  const initPopulation = useCallback((clearBest: boolean = true) => {
    const pop: Genome[] = [];
    for (let i = 0; i < settings.populationSize; i++) {
      pop.push({
        id: `gen1-${i}`,
        network: createRandomNetwork(),
        fitness: 0,
        matchesWon: 0
      });
    }
    populationRef.current = pop;
    if (clearBest) {
      bestTrainedGenomeRef.current = null; // Only clear when explicitly requested
    }
    currentMatchIndex.current = 0;
    activeMatchRef.current = null; // Reset match so loop spawns a new one
  }, [settings.populationSize]);

  const getBestGenome = useCallback((): Genome | null => {
    // Return the best trained genome if available
    if (bestTrainedGenomeRef.current) return bestTrainedGenomeRef.current;
    // Fallback to current population if no best trained yet
    if (populationRef.current.length === 0) return null;
    const sorted = [...populationRef.current].sort((a, b) => b.fitness - a.fitness);
    return sorted[0];
  }, []);

  const startMatch = useCallback(() => {
    matchTimerRef.current = 90; // Reset timer (90 seconds for longer matches)

    // If Training Mode
    if (settingsRef.current.gameMode === 'TRAINING') {
      const popSize = populationRef.current.length;
      const totalMatches = Math.ceil(popSize / 2); // Handle odd population

      if (currentMatchIndex.current >= totalMatches) {
        evolve();
        return;
      }

      const p1Idx = currentMatchIndex.current * 2;
      let p2Idx = p1Idx + 1;

      // Handle odd population: last genome fights a random opponent
      if (p2Idx >= popSize) {
        p2Idx = Math.floor(Math.random() * p1Idx); // Pick random from already-paired genomes
      }

      const g1 = populationRef.current[p1Idx];
      const g2 = populationRef.current[p2Idx];

      // Randomize spawn positions to encourage diverse behaviors
      const spawnOffset1 = Math.random() * 100 - 50; // -50 to +50
      const spawnOffset2 = Math.random() * 100 - 50;

      // CRITICAL: Randomly swap which genome plays which side (50% chance)
      // This ensures AI learns to fight from BOTH sides of the arena
      const swapSides = Math.random() > 0.5;
      const leftGenome = swapSides ? g2 : g1;
      const rightGenome = swapSides ? g1 : g2;

      const f1 = new Fighter(280 + spawnOffset1, '#ef4444', true, leftGenome);
      const f2 = new Fighter(470 + spawnOffset2, '#3b82f6', true, rightGenome);
      f2.direction = -1;

      activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: p1Idx, p2GenomeIdx: p2Idx };
    }
    // If Arcade Mode (Human vs Best AI)
    else {
      const bestGenome = getBestGenome();

      // Randomize spawn positions slightly for variety
      const spawnOffset = Math.random() * 60 - 30; // -30 to +30

      if (!bestGenome) {
        // Fallback if population not ready
        const fallbackGenome: Genome = { id: 'cpu', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
        const f1 = new Fighter(280 + spawnOffset, '#ef4444', false); // Human (Red)
        const f2 = new Fighter(470 - spawnOffset, '#3b82f6', true, fallbackGenome); // AI (Blue)
        f2.direction = -1;
        activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: -1 };
      } else {
        // Use the best genome (sorted by fitness)
        const f1 = new Fighter(280 + spawnOffset, '#ef4444', false); // Human (Red)
        const f2 = new Fighter(470 - spawnOffset, '#3b82f6', true, bestGenome); // AI (Blue)
        f2.direction = -1;
        activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: -1 };
      }
    }

    setGameState(prev => ({ ...prev, matchActive: true, timeRemaining: 90, winner: null }));
  }, [getBestGenome]);

  const evolve = () => {
    const pop = populationRef.current;

    // Sort by fitness
    pop.sort((a, b) => b.fitness - a.fitness);

    const best = pop[0];

    // Store the best genome ever seen (with its fitness intact)
    if (!bestTrainedGenomeRef.current || best.fitness > bestTrainedGenomeRef.current.fitness) {
      bestTrainedGenomeRef.current = JSON.parse(JSON.stringify(best));
    }

    setFitnessHistory(prev => [...prev.slice(-20), { gen: gameStateRef.current.generation, fitness: best.fitness }]);
    setGameState(prev => ({ ...prev, bestFitness: best.fitness, generation: prev.generation + 1 }));

    // Elitism: Keep best 2
    const currentGen = gameStateRef.current.generation;
    const newPop: Genome[] = [
      { ...pop[0], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
      { ...pop[1], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` }
    ];

    // Fill rest with adaptive mutation rate
    // Starts at 25%, decays to 5% minimum over ~50 generations
    const adaptiveRate = Math.max(0.05, 0.25 - (currentGen * 0.004));

    while (newPop.length < settingsRef.current.populationSize) {
      // Tournament Selection
      const parentA = pop[Math.floor(Math.random() * (pop.length / 2))]; // Select from top 50%
      const parentB = pop[Math.floor(Math.random() * (pop.length / 2))];

      let childNet = crossoverNetworks(parentA.network, parentB.network);
      childNet = mutateNetwork(childNet, adaptiveRate);

      newPop.push({
        id: `gen${currentGen + 1}-${newPop.length}`,
        network: childNet,
        fitness: 0,
        matchesWon: 0
      });
    }

    populationRef.current = newPop;
    currentMatchIndex.current = 0;

    // Trigger next match immediately
    startMatch();
  };

  // --- Background Training with Web Workers ---
  // Runs full generations in parallel using multiple CPU cores
  const runWorkerTrainingGeneration = useCallback(async () => {
    // Prevent concurrent runs
    if (isWorkerTrainingRef.current) return;
    isWorkerTrainingRef.current = true;

    const pop = populationRef.current;
    if (pop.length === 0) {
      isWorkerTrainingRef.current = false;
      return;
    }

    // Initialize worker pool if not exists
    if (!workerPoolRef.current) {
      workerPoolRef.current = new WorkerPool();
      // Give workers a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const pool = workerPoolRef.current;

    try {
      // Create jobs for all matches in this generation
      const jobs = WorkerPool.createJobsFromPopulation(pop);

      // Run all matches in parallel across workers
      const results = await pool.runMatches(jobs);

      // Apply results back to population
      WorkerPool.applyResults(pop, jobs, results);

      // Evolve the population
      pop.sort((a, b) => b.fitness - a.fitness);

      const best = pop[0];

      // Update best trained genome if this one is better
      if (!bestTrainedGenomeRef.current || best.fitness > bestTrainedGenomeRef.current.fitness) {
        bestTrainedGenomeRef.current = JSON.parse(JSON.stringify(best));
      }

      const currentGen = gameStateRef.current.generation;

      // Update UI state
      setFitnessHistory(prev => [...prev.slice(-20), { gen: currentGen, fitness: best.fitness }]);
      setGameState(prev => ({ ...prev, bestFitness: best.fitness, generation: prev.generation + 1 }));

      // Create new generation
      const popSize = pop.length;
      const newPop: Genome[] = [
        { ...pop[0], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
        { ...pop[1], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` }
      ];

      const adaptiveRate = Math.max(0.05, 0.25 - (currentGen * 0.004));

      while (newPop.length < popSize) {
        const parentA = pop[Math.floor(Math.random() * (pop.length / 2))];
        const parentB = pop[Math.floor(Math.random() * (pop.length / 2))];
        let childNet = crossoverNetworks(parentA.network, parentB.network);
        childNet = mutateNetwork(childNet, adaptiveRate);
        newPop.push({
          id: `gen${currentGen + 1}-${newPop.length}`,
          network: childNet,
          fitness: 0,
          matchesWon: 0
        });
      }

      populationRef.current = newPop;
      currentMatchIndex.current = 0;

    } catch (error) {
      console.error('Worker training error:', error);
    }

    isWorkerTrainingRef.current = false;
  }, []);

  // Start/stop background training based on settings
  useEffect(() => {
    if (settings.backgroundTraining && settings.gameMode === 'ARCADE') {
      // Start background training with Web Workers
      // Run generations continuously
      const runContinuousTraining = async () => {
        while (settingsRef.current.backgroundTraining && settingsRef.current.gameMode === 'ARCADE') {
          await runWorkerTrainingGeneration();
          // Small delay between generations to prevent UI blocking
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      };

      runContinuousTraining();

    } else {
      // Stop background training - the async loop will check settingsRef and exit
      // Terminate workers when turning off background training
      if (workerPoolRef.current && !settings.backgroundTraining) {
        // Don't terminate, just let loops exit - we may need workers again
      }
    }

    return () => {
      // Cleanup workers on unmount
      if (workerPoolRef.current) {
        workerPoolRef.current.terminate();
        workerPoolRef.current = null;
      }
    };
  }, [settings.backgroundTraining, settings.gameMode, runWorkerTrainingGeneration]);

  // --- Game Loop ---
  const update = () => {
    // 1. Ensure a match exists to render
    if (!activeMatchRef.current && populationRef.current.length > 0) {
      startMatch();
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    const currentSettings = settingsRef.current;
    const currentGameState = gameStateRef.current;

    // 2. If Paused, skip physics but keep loop alive
    if (!currentSettings.isRunning || !activeMatchRef.current) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    // 3. Game Physics Logic
    const match = activeMatchRef.current;
    if (match) {
      const { p1, p2 } = match;
      const loops = currentSettings.gameMode === 'ARCADE' ? 1 : currentSettings.simulationSpeed;

      let matchEnded = false;

      for (let i = 0; i < loops; i++) {
        if (!currentGameState.matchActive || matchEnded) break;

        const dummyInput = { left: false, right: false, up: false, down: false, action1: false, action2: false, action3: false };

        // Player 1 Input: Human if Arcade, Dummy (AI self-drive) if Training
        const p1Input = (currentSettings.gameMode === 'ARCADE' && inputManager.current)
          ? inputManager.current.getState()
          : dummyInput;

        p1.update(p1Input, p2);
        p2.update(dummyInput, p1);

        // Body collision - prevent fighters from overlapping (only when vertically overlapping)
        // This allows fighters to jump over each other
        const verticalOverlap = (p1.y + p1.height > p2.y) && (p2.y + p2.height > p1.y);

        if (verticalOverlap) {
          if (p1.x < p2.x) {
            const overlap = (p1.x + p1.width) - p2.x;
            if (overlap > 0) {
              p1.x -= overlap / 2;
              p2.x += overlap / 2;
            }
          } else {
            const overlap = (p2.x + p2.width) - p1.x;
            if (overlap > 0) {
              p2.x -= overlap / 2;
              p1.x += overlap / 2;
            }
          }
        }

        p1.checkHit(p2);
        p2.checkHit(p1);

        // Update Timer (1/60th of a second per loop iteration)
        matchTimerRef.current -= 1 / 60;

        // End Conditions
        const isTimeout = matchTimerRef.current <= 0;
        const isKO = p1.health <= 0 || p2.health <= 0;

        if (isKO || isTimeout) {
          matchEnded = true;

          // Apply Fitness Results

          if (currentSettings.gameMode === 'TRAINING') {
            // Calculate engagement (damage dealt)
            const damageDealt1 = 100 - p2.health;
            const damageDealt2 = 100 - p1.health;
            const totalEngagement = damageDealt1 + damageDealt2;

            if (p1.genome) p1.genome.fitness += p1.health * 2; // Reward remaining health
            if (p2.genome) p2.genome.fitness += p2.health * 2;

            // STALEMATE PENALTY: If timeout and low engagement, punish both
            if (isTimeout && totalEngagement < 30) {
              if (p1.genome) p1.genome.fitness -= 100;
              if (p2.genome) p2.genome.fitness -= 100;
            }

            if (p1.health > p2.health) {
              if (p1.genome) { p1.genome.fitness += 500; p1.genome.matchesWon++; }
            } else if (p2.health > p1.health) {
              if (p2.genome) { p2.genome.fitness += 500; p2.genome.matchesWon++; }
            }

            currentMatchIndex.current++;
            startMatch();
          } else {
            // Arcade Game Over - show toast and auto-restart
            const playerWon = p1.health > p2.health;
            addToast(playerWon ? 'success' : 'info', playerWon ? 'You Win!' : 'AI Wins!');

            // Auto-restart after 1 second delay
            setTimeout(() => {
              startMatch();
            }, 1000);
          }
          break;
        }
      }

      // Sync State to React
      setGameState(prev => ({
        ...prev,
        player1Health: p1.health,
        player2Health: p2.health,
        player1Energy: p1.energy,
        player2Energy: p2.energy,
        timeRemaining: Math.max(0, matchTimerRef.current)
      }));
    }

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    // Initialize InputManager here to avoid side effects in render
    inputManager.current = new InputManager();

    initPopulation();
    // Start Game Loop
    requestRef.current = requestAnimationFrame(update);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      inputManager.current?.destroy();
    };
  }, []); // Only run once on mount

  // Restart match when population size changes (but keep best genome)
  useEffect(() => {
    if (populationRef.current.length !== settings.populationSize) {
      initPopulation(false); // Don't clear best genome on resize
    }
  }, [settings.populationSize, initPopulation]);

  // Handle Mode Switching reset
  const handleModeChange = (mode: 'TRAINING' | 'ARCADE') => {
    setSettings(prev => ({ ...prev, gameMode: mode, isRunning: false }));
    setGameState(prev => ({ ...prev, winner: null, matchActive: false }));
    activeMatchRef.current = null; // Will trigger startMatch in loop
    if (mode === 'TRAINING') {
      currentMatchIndex.current = 0;
    } else if (mode === 'ARCADE') {
      // Ensure best genome is ready when switching to ARCADE
      // startMatch will be called by the game loop and will use getBestGenome()
    }
  };

  // --- Handlers ---
  const handleExportWeights = () => {
    const bestGenome = getBestGenome();
    if (!bestGenome) {
      addToast('error', 'No trained AI available. Train the AI first!');
      return;
    }

    const json = exportGenome(bestGenome);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurofight-weights-gen${gameState.generation}-fitness${bestGenome.fitness.toFixed(0)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Weights exported successfully!');
  };

  const handleImportWeights = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const importedGenome = importGenome(text);

        if (!importedGenome) {
          addToast('error', 'Invalid file format. Check the JSON structure.');
          return;
        }

        // Show inline UI for user choice
        setPendingImport(importedGenome);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportChoice = (useForTraining: boolean) => {
    if (!pendingImport) return;

    // Always store imported genome as best for ARCADE mode
    const arcadeGenome = { ...pendingImport, id: `imported-${Date.now()}` };
    bestTrainedGenomeRef.current = arcadeGenome;

    if (useForTraining) {
      const pop = populationRef.current;
      if (pop.length > 0) {
        pop.sort((a, b) => b.fitness - a.fitness);
        pop[0] = {
          ...pendingImport,
          fitness: 0,
          matchesWon: 0,
          id: `training-imported-${Date.now()}`
        };
      }
      addToast('success', 'Weights imported for training + arcade!');
    } else {
      addToast('success', 'Weights imported for arcade mode!');
    }

    setPendingImport(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center py-8">
      <div className="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Game View */}
        <div className="lg:col-span-2 space-y-4">
          <header className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                NEURO FIGHT
              </h1>
              <p className="text-slate-400 text-sm">
                {settings.gameMode === 'TRAINING' ? 'Training Neural Networks...' : 'Arcade Mode: You vs AI'}
              </p>
            </div>
          </header>

          <div className="relative group">
            {/* HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between text-xl font-bold font-mono z-10 drop-shadow-md pointer-events-none">
              <div className="flex flex-col items-start">
                <span className="text-red-500 font-bold">P1</span>
                <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
                  <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${gameState.player1Health}%` }}></div>
                </div>
                <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
                  <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player1Energy}%` }}></div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-white mt-2 font-bold opacity-90 tracking-widest">{settings.gameMode === 'TRAINING' ? `GEN ${gameState.generation}` : 'VS'}</span>
                <span className="text-yellow-400 font-mono text-sm">{gameState.timeRemaining.toFixed(0)}</span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-blue-500 font-bold">P2</span>
                <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${gameState.player2Health}%` }}></div>
                </div>
                <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
                  <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player2Energy}%` }}></div>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl border-2 border-slate-700 bg-black">
              {activeMatchRef.current ? (
                <GameCanvas
                  player1={activeMatchRef.current.p1}
                  player2={activeMatchRef.current.p2}
                />
              ) : (
                <div className="w-full h-[450px] flex items-center justify-center text-slate-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Initializing Arena...</span>
                  </div>
                </div>
              )}

              {/* Overlays */}
              {!settings.isRunning && !gameState.winner && activeMatchRef.current && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                  <button
                    onClick={() => setSettings(s => ({ ...s, isRunning: true }))}
                    className="bg-teal-500 hover:bg-teal-400 text-black font-black text-2xl py-4 px-12 rounded-lg shadow-[0_0_30px_rgba(45,212,191,0.5)] transform hover:scale-105 transition-all border-2 border-teal-300"
                  >
                    START {settings.gameMode === 'TRAINING' ? 'TRAINING' : 'FIGHT'}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Column: Dashboard */}
        <div className="lg:col-span-1">
          <Dashboard
            settings={settings}
            setSettings={setSettings}
            fitnessHistory={fitnessHistory}
            currentGen={gameState.generation}
            bestFitness={gameState.bestFitness}
            onReset={initPopulation}
            onModeChange={handleModeChange}
            onExportWeights={handleExportWeights}
            onImportWeights={handleImportWeights}
          />
        </div>

      </div>

      {/* Import Choice Modal */}
      {pendingImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md mx-4 border border-slate-600 shadow-2xl">
            <h3 className="text-xl font-bold text-teal-400 mb-4">Import Successful!</h3>
            <div className="text-slate-300 text-sm space-y-2 mb-6">
              <p>Fitness: <span className="text-white font-mono">{pendingImport.fitness.toFixed(0)}</span></p>
              <p>Matches Won: <span className="text-white font-mono">{pendingImport.matchesWon}</span></p>
            </div>
            <p className="text-slate-400 text-sm mb-4">How would you like to use these weights?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleImportChoice(true)}
                className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-white transition"
              >
                Training + Arcade
              </button>
              <button
                onClick={() => handleImportChoice(false)}
                className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-white transition"
              >
                Arcade Only
              </button>
            </div>
            <button
              onClick={() => setPendingImport(null)}
              className="w-full mt-3 py-2 text-slate-500 hover:text-slate-300 text-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Version Display */}
      <div className="fixed bottom-2 left-2 text-[10px] text-slate-600 font-mono pointer-events-none z-0">
        v1.0.0
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;