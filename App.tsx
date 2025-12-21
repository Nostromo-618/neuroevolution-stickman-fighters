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
import { loadScript, compileScript, ScriptWorkerManager } from './services/CustomScriptRunner';
import { Genome, TrainingSettings, GameState, OpponentType } from './types';
import GameCanvas from './components/GameCanvas';
import Dashboard from './components/Dashboard';
import Toast, { useToast } from './components/Toast';
import { WorkerPool } from './services/WorkerPool';
import TouchControls from './components/TouchControls';
import pkg from './package.json';
import DisclaimerModal from './components/DisclaimerModal';
import GoodbyeScreen from './components/GoodbyeScreen';

// =============================================================================
// MAIN APPLICATION COMPONENT
// =============================================================================

const App = () => {
  // --- State ---
  const [settings, setSettings] = useState<TrainingSettings>({
    populationSize: 48,  // Increased from 24 for better genetic diversity
    mutationRate: 0.1,
    simulationSpeed: 1,
    gameMode: 'TRAINING',
    isRunning: false, // Start paused
    backgroundTraining: false, // Background training off by default
    opponentType: 'AI', // Default to AI opponent
    player1Type: 'HUMAN',
    player2Type: 'AI'
  });

  const [gameState, setGameState] = useState<GameState>({
    player1Health: 100, player2Health: 100,
    player1Energy: 100, player2Energy: 100,
    timeRemaining: 90, generation: 1, bestFitness: 0,
    matchActive: false,
    winner: null,
    roundStatus: 'WAITING'
  });

  const [disclaimerStatus, setDisclaimerStatus] = useState<'PENDING' | 'ACCEPTED' | 'DECLINED'>('PENDING');

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

  // Custom script worker for secure isolated execution
  // We now have two workers to support Custom vs Custom matches
  const customScriptWorkerARef = useRef<ScriptWorkerManager | null>(null);
  const customScriptWorkerBRef = useRef<ScriptWorkerManager | null>(null);

  const settingsRef = useRef(settings);
  const gameStateRef = useRef(gameState);

  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Store addToast in a ref to avoid dependency issues
  const addToastRef = useRef(addToast);
  useEffect(() => { addToastRef.current = addToast; }, [addToast]);

  // Pre-compile custom script workers based on selection
  useEffect(() => {
    const compileWorker = async (slot: 'slot1' | 'slot2', workerRef: React.MutableRefObject<ScriptWorkerManager | null>) => {
      const scriptCode = loadScript(slot);
      if (scriptCode) {
        if (!workerRef.current) {
          workerRef.current = new ScriptWorkerManager();
        }

        if (!workerRef.current.isReady()) {
          const result = await workerRef.current.compile(scriptCode);
          const name = slot === 'slot1' ? 'Script A' : 'Script B';
          if (result.success) {
            addToastRef.current('success', `✏️ ${name} compiled successfully!`);
          } else {
            addToastRef.current('error', `${name} error: ${result.error}. Using default behavior.`);
          }
        }
      } else {
        // Only warn if explicitly selected
        const name = slot === 'slot1' ? 'Script A' : 'Script B';
        const isSelected =
          (settings.gameMode === 'TRAINING' && settings.opponentType === 'CUSTOM' && slot === 'slot1') ||
          (settings.gameMode === 'ARCADE' && (
            (slot === 'slot1' && (settings.player1Type === 'CUSTOM_A' || settings.player2Type === 'CUSTOM_A')) ||
            (slot === 'slot2' && (settings.player1Type === 'CUSTOM_B' || settings.player2Type === 'CUSTOM_B'))
          ));

        if (isSelected) {
          addToastRef.current('info', `No ${name} found. Open Editor to create one.`);
        }
      }
    };

    // Check if we need Worker A (Slot 1)
    const needsA =
      (settings.gameMode === 'TRAINING' && settings.opponentType === 'CUSTOM') ||
      (settings.gameMode === 'ARCADE' && (settings.player1Type === 'CUSTOM_A' || settings.player2Type === 'CUSTOM_A'));

    // Check if we need Worker B (Slot 2)
    const needsB =
      (settings.gameMode === 'ARCADE' && (settings.player1Type === 'CUSTOM_B' || settings.player2Type === 'CUSTOM_B'));

    if (needsA) compileWorker('slot1', customScriptWorkerARef);
    if (needsB) compileWorker('slot2', customScriptWorkerBRef);

  }, [settings.gameMode, settings.opponentType, settings.player1Type, settings.player2Type]);

  // Function to recompile custom script (called after saving from editor)
  const recompileCustomScript = useCallback(async () => {
    // Force recompile logic by clearing ready state or just calling compile again
    // We'll just define a helper here similar to above but forced

    // We don't know exactly which slot was saved, so we recheck both if they are active
    const recompileSlot = async (slot: 'slot1' | 'slot2', workerRef: React.MutableRefObject<ScriptWorkerManager | null>) => {
      const scriptCode = loadScript(slot);
      if (!scriptCode) return;

      if (!workerRef.current) {
        workerRef.current = new ScriptWorkerManager();
      }

      const result = await workerRef.current.compile(scriptCode);
      const name = slot === 'slot1' ? 'Script A' : 'Script B';

      if (result.success) {
        addToastRef.current('success', `✏️ ${name} recompiled!`);
      } else {
        addToastRef.current('error', `${name} error: ${result.error}.`);
      }
    };

    // Always try to recompile active workers when saved
    if (customScriptWorkerARef.current) recompileSlot('slot1', customScriptWorkerARef);
    if (customScriptWorkerBRef.current) recompileSlot('slot2', customScriptWorkerBRef);

  }, []);

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

    // Helper to create a fighter based on type
    const createFighter = (
      type: 'HUMAN' | 'AI' | 'SCRIPTED' | 'CUSTOM_A' | 'CUSTOM_B',
      x: number,
      defaultColor: string,
      isP2: boolean
    ): Fighter => {
      // 1. HUMAN
      if (type === 'HUMAN') {
        const f = new Fighter(x, defaultColor, false);
        return f;
      }

      // 2. AI (Neural Network)
      if (type === 'AI') {
        const bestGenome = getBestGenome();
        const genomeToUse = bestGenome || { id: 'cpu', network: createRandomNetwork(), fitness: 0, matchesWon: 0 };
        const f = new Fighter(x, '#3b82f6', true, genomeToUse);
        return f;
      }

      // 3. SCRIPTED BOT
      if (type === 'SCRIPTED') {
        const f = new Fighter(x, '#f97316', false);
        f.isScripted = true;
        return f;
      }

      // 4. CUSTOM SCRIPT A
      if (type === 'CUSTOM_A') {
        const f = new Fighter(x, '#a855f7', false);
        const worker = customScriptWorkerARef.current;
        if (worker && worker.isReady()) {
          f.isCustom = true;
          f.scriptWorker = worker;
        } else {
          f.isScripted = true; // Fallback
          // Only show toast for P1 to avoid spam, or if it's the only custom one
          addToastRef.current('info', 'Script A not ready - using default scripted bot.');
        }
        return f;
      }

      // 5. CUSTOM SCRIPT B
      if (type === 'CUSTOM_B') {
        const f = new Fighter(x, '#d946ef', false); // Slightly different purple/pink
        const worker = customScriptWorkerBRef.current;
        if (worker && worker.isReady()) {
          f.isCustom = true;
          f.scriptWorker = worker;
        } else {
          f.isScripted = true; // Fallback
          addToastRef.current('info', 'Script B not ready - using default scripted bot.');
        }
        return f;
      }

      // Fallback
      return new Fighter(x, defaultColor, false);
    };

    // If Training Mode
    if (settingsRef.current.gameMode === 'TRAINING') {
      const popSize = populationRef.current.length;
      const useScripted = settingsRef.current.opponentType === 'SCRIPTED';
      const useCustom = settingsRef.current.opponentType === 'CUSTOM';

      // When training vs SCRIPTED or CUSTOM:
      // - Each genome fights one match against the scripted/custom opponent
      // - This helps the NN learn to beat a specific strategy
      const totalMatches = (useScripted || useCustom) ? popSize : Math.ceil(popSize / 2);

      if (currentMatchIndex.current >= totalMatches) {
        evolve();
        return;
      }

      // Randomize spawn positions to encourage diverse behaviors
      const spawnOffset1 = Math.random() * 100 - 50; // -50 to +50
      const spawnOffset2 = Math.random() * 100 - 50;

      if (useScripted || useCustom) {
        // TRAINING VS SCRIPTED/CUSTOM: Single NN genome vs Scripted/Custom opponent
        const genomeIdx = currentMatchIndex.current;
        const genome = populationRef.current[genomeIdx];

        // 50% chance to swap sides for variety
        const swapSides = Math.random() > 0.5;

        // Color: orange for scripted, purple for custom
        const opponentColor = useCustom ? '#a855f7' : '#f97316';

        // Get pre-compiled script worker for custom opponent
        const scriptWorker = useCustom ? customScriptWorkerARef.current : null;

        if (swapSides) {
          // NN on right, Scripted/Custom on left
          const f1 = new Fighter(280 + spawnOffset1, opponentColor, false);
          if (useCustom && scriptWorker && scriptWorker.isReady()) {
            f1.isCustom = true;
            f1.scriptWorker = scriptWorker;
          } else {
            f1.isScripted = true;
            if (useCustom) {
              console.warn('Custom script worker not ready, falling back to scripted opponent');
            }
          }
          const f2 = new Fighter(470 + spawnOffset2, '#3b82f6', true, genome); // NN (Blue)
          f2.direction = -1;
          activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: genomeIdx };
        } else {
          // NN on left, Scripted/Custom on right
          const f1 = new Fighter(280 + spawnOffset1, '#3b82f6', true, genome); // NN (Blue)
          const f2 = new Fighter(470 + spawnOffset2, opponentColor, false);
          if (useCustom && scriptWorker && scriptWorker.isReady()) {
            f2.isCustom = true;
            f2.scriptWorker = scriptWorker;
          } else {
            f2.isScripted = true;
            if (useCustom) {
              console.warn('Custom script worker not ready, falling back to scripted opponent');
            }
          }
          f2.direction = -1;
          activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: genomeIdx, p2GenomeIdx: -1 };
        }
      } else {
        // TRAINING VS AI: NN vs NN (original behavior)
        const p1Idx = currentMatchIndex.current * 2;
        let p2Idx = p1Idx + 1;

        // Handle odd population: last genome fights a random opponent
        if (p2Idx >= popSize) {
          p2Idx = Math.floor(Math.random() * p1Idx); // Pick random from already-paired genomes
        }

        const g1 = populationRef.current[p1Idx];
        const g2 = populationRef.current[p2Idx];

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
    }
    // If Arcade Mode (Human vs Best AI, Scripted, or Custom)
    else {
      const p1Type = settingsRef.current.player1Type;
      const p2Type = settingsRef.current.player2Type;

      // Randomize spawn positions slightly for variety
      const spawnOffset = Math.random() * 60 - 30; // -30 to +30

      // Create Fighters
      const f1 = createFighter(p1Type, 280 + spawnOffset, '#ef4444', false);
      const f2 = createFighter(p2Type, 470 - spawnOffset, '#3b82f6', true);
      f2.direction = -1;

      activeMatchRef.current = { p1: f1, p2: f2, p1GenomeIdx: -1, p2GenomeIdx: -1 };
    }

    const isArcade = settingsRef.current.gameMode === 'ARCADE';

    setGameState(prev => ({
      ...prev,
      matchActive: true,
      timeRemaining: 90,
      winner: null,
      roundStatus: isArcade ? 'WAITING' : 'FIGHTING'
    }));

    // Sync ref immediately to prevent "twitch" on first frame
    gameStateRef.current.roundStatus = isArcade ? 'WAITING' : 'FIGHTING';

    // Schedule fight start ONLY for Arcade mode
    if (isArcade) {
      setTimeout(() => {
        if (activeMatchRef.current) {
          // Sync ref immediately
          if (gameStateRef.current) gameStateRef.current.roundStatus = 'FIGHTING';
          setGameState(prev => ({ ...prev, roundStatus: 'FIGHTING' }));
        }
      }, 1500);
    }
  }, [getBestGenome]); // Removed addToast, should be stable now or use addToastRef

  // Immediate update when switching fighters in Arcade Mode
  useEffect(() => {
    // Only update if in Arcade mode and not currently mid-fight (waiting or paused)
    // or if we just want to swap the visual sprites immediately
    if (settings.gameMode === 'ARCADE' && gameState.roundStatus === 'WAITING') {
      startMatch();
    }
  }, [
    settings.gameMode,
    settings.player1Type,
    settings.player2Type,
    settings.opponentType, // For Training mode if we want immediate feedback there too
    startMatch,
    // gameState.roundStatus // REMOVE THIS to avoid loop if startMatch resets it to WAITING
  ]);

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
    // Starts higher (30%) and decays faster to 5% minimum over ~30 generations
    // This encourages more exploration early, then refinement later
    const adaptiveRate = Math.max(0.05, 0.30 - (currentGen * 0.008));

    // Selection pool: top 25% of population (stronger selection pressure)
    const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

    while (newPop.length < settingsRef.current.populationSize) {
      // Tournament Selection from top 25% (stronger pressure than 50%)
      const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
      const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];

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

      const adaptiveRate = Math.max(0.05, 0.30 - (currentGen * 0.008));
      const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

      while (newPop.length < popSize) {
        const parentA = pop[Math.floor(Math.random() * selectionPoolSize)];
        const parentB = pop[Math.floor(Math.random() * selectionPoolSize)];
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

        // Player 1 Input
        let p1Input = (currentSettings.gameMode === 'ARCADE' && inputManager.current)
          ? inputManager.current.getState()
          : dummyInput;

        // If WAITING (Round start), neutralize all inputs to let physics settle
        if (currentGameState.roundStatus === 'WAITING') {
          p1Input = dummyInput;
          // Force AI to be idle too (handled below by not processing p2 updates or overriding it)
        }

        p1.update(p1Input, p2);

        // Player 2 Update (AI)
        // If WAITING, pass dummy input to force idle
        if (currentGameState.roundStatus === 'WAITING') {
          p2.update(dummyInput, p1);
        } else {
          p2.update(dummyInput, p1); // Normal AI update (it ignores input arg and uses internal brain)
        }

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
        // Only count down if actively fighting
        if (currentGameState.roundStatus === 'FIGHTING') {
          matchTimerRef.current -= 1 / 60;
        }

        // End Conditions
        const isTimeout = matchTimerRef.current <= 0;
        const isKO = p1.health <= 0 || p2.health <= 0;

        if (isKO || isTimeout) {
          matchEnded = true;

          // Apply Fitness Results

          if (currentSettings.gameMode === 'TRAINING') {
            // IMPROVED FITNESS SYSTEM: Rich rewards for learning
            // Matches the TrainingWorker.ts fitness shaping for consistency

            // Calculate damage dealt by each fighter
            const p1DamageDealt = 100 - p2.health;
            const p2DamageDealt = 100 - p1.health;
            const totalEngagement = p1DamageDealt + p2DamageDealt;

            // Base fitness: damage dealt + remaining health bonus
            if (p1.genome) {
              p1.genome.fitness += p1DamageDealt * 3;  // Reward damage dealt
              p1.genome.fitness += p1.health * 2;       // Reward staying alive
            }
            if (p2.genome) {
              p2.genome.fitness += p2DamageDealt * 3;
              p2.genome.fitness += p2.health * 2;
            }

            // KO bonus (significant reward for decisive wins)
            if (p1.health > 0 && p2.health <= 0) {
              if (p1.genome) { p1.genome.fitness += 500; p1.genome.matchesWon++; }
            } else if (p2.health > 0 && p1.health <= 0) {
              if (p2.genome) { p2.genome.fitness += 500; p2.genome.matchesWon++; }
            } else if (isTimeout) {
              // Timeout: reward whoever has more health
              if (p1.health > p2.health && p1.genome) {
                p1.genome.fitness += 200;
                p1.genome.matchesWon++;
              } else if (p2.health > p1.health && p2.genome) {
                p2.genome.fitness += 200;
                p2.genome.matchesWon++;
              }
            }

            // Stalemate penalty: punish passive play
            if (isTimeout && totalEngagement < 30) {
              if (p1.genome) p1.genome.fitness -= 100;
              if (p2.genome) p2.genome.fitness -= 100;
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
    // Check disclaimer acceptance
    const accepted = localStorage.getItem('neurofight_disclaimer_accepted');
    if (accepted === 'true') {
      setDisclaimerStatus('ACCEPTED');
    }

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

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('neurofight_disclaimer_accepted', 'true');
    setDisclaimerStatus('ACCEPTED');
  };

  const handleDeclineDisclaimer = () => {
    setDisclaimerStatus('DECLINED');
  };

  const handleReturnToDisclaimer = () => {
    setDisclaimerStatus('PENDING');
  };

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

  if (disclaimerStatus === 'DECLINED') {
    return <GoodbyeScreen onReturn={handleReturnToDisclaimer} />;
  }

  return (
    <>
      {disclaimerStatus === 'PENDING' && (
        <DisclaimerModal onAccept={handleAcceptDisclaimer} onDecline={handleDeclineDisclaimer} />
      )}

      <div className={`min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center py-8 transition-all duration-700 ${disclaimerStatus === 'PENDING' ? 'blur-md pointer-events-none' : ''}`}>
        <div className="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Game View */}
          <div className="lg:col-span-2 space-y-4">
            <header className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  NeuroEvolution: Stickman Fighters
                </h1>
                <p className="text-slate-400 text-sm">
                  {settings.gameMode === 'TRAINING' ? 'Training Neural Networks...' : 'Arcade Mode: You vs AI'}
                </p>
              </div>
            </header>

            <div className="relative group">
              {/* HUD */}
              <div className="absolute top-4 left-4 right-4 flex justify-between text-xl font-bold font-mono z-10 drop-shadow-md pointer-events-none">
                {/* Determine side swapping for training mode */}
                {settings.gameMode === 'TRAINING' && activeMatchRef.current ? (
                  <>
                    {/* Swapped sides in training mode */}
                    {currentMatchIndex.current % 2 === 1 ? (
                      <>
                        {/* Odd rounds: P2 on left, P1 on right */}
                        <div className="flex flex-col items-start">
                          <span className="text-blue-500 font-bold">P2</span>
                          <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${gameState.player2Health}%` }}></div>
                          </div>
                          <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
                            <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player2Energy}%` }}></div>
                          </div>
                        </div>

                        <div className="flex flex-col items-center">
                          <span className="text-white mt-2 font-bold opacity-90 tracking-widest">{settings.gameMode === 'TRAINING' ? `GEN ${gameState.generation}` : 'VS'}</span>
                          <span className="text-yellow-400 font-mono text-sm">{gameState.timeRemaining.toFixed(0)}</span>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-red-500 font-bold">P1</span>
                          <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${gameState.player1Health}%` }}></div>
                          </div>
                          <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
                            <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player1Energy}%` }}></div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Even rounds: P1 on left, P2 on right (normal) */}
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
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Normal ARCADE HUD */}
                    <div className="flex flex-col items-start">
                      <span className="text-red-500 font-bold">PLAYER</span>
                      <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${gameState.player1Health}%` }}></div>
                      </div>
                      <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
                        <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player1Energy}%` }}></div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-white mt-2 font-bold opacity-90 tracking-widest">VS</span>
                      <span className="text-yellow-400 font-mono text-sm">{gameState.timeRemaining.toFixed(0)}</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-blue-500 font-bold">AI</span>
                      <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${gameState.player2Health}%` }}></div>
                      </div>
                      <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
                        <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player2Energy}%` }}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {activeMatchRef.current ? (
                <GameCanvas
                  player1={activeMatchRef.current.p1}
                  player2={activeMatchRef.current.p2}
                  isTraining={settings.gameMode === 'TRAINING'}
                  roundNumber={currentMatchIndex.current}
                />
              ) : (
                <div className="w-full h-[450px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700">
                  <span className="text-slate-400 font-mono">Initializing Arena...</span>
                </div>
              )}

              {/* Game Over Overlays */}
              {!gameState.matchActive && gameState.roundStatus === 'FIGHTING' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                  <div className="text-center">
                    <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2">
                      {gameState.winner === 'PLAYER' ? 'VICTORY' : 'DEFEAT'}
                    </h2>
                    <p className="text-slate-400 font-mono">RESTARTING MATCH...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Helper */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-500">
              <div className="flex flex-col gap-1">
                <span className="text-slate-300 font-bold">MOVE</span>
                <span>WASD / ARROWS</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-300 font-bold">PUNCH</span>
                <span>J / SPACE / Z</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-300 font-bold">KICK</span>
                <span>K / X</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-slate-300 font-bold">BLOCK</span>
                <span>L / C / SHIFT</span>
              </div>
            </div>

            {/* Mobile Touch Controls */}
            <TouchControls inputManager={inputManager} />
          </div>

          {/* Right Column: Dashboards & Stats */}
          <div className="space-y-6">
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
              onScriptRecompile={recompileCustomScript}
            />

            {pendingImport && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-teal-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-teal-500/10">
                  <h3 className="text-2xl font-bold text-teal-400 mb-4">Weights Imported</h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    How would you like to use these weights? You can use them just for the current Arcade session, or inject them into the training population.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleImportChoice(true)}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all active:scale-95"
                    >
                      Use for Training + Arcade
                    </button>
                    <button
                      onClick={() => handleImportChoice(false)}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all active:scale-95"
                    >
                      Use for Arcade Only
                    </button>
                  </div>
                </div>
              </div>
            )}

            <footer className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest font-bold">
              <span>{pkg.name} v{pkg.version}</span>
              <a href="https://github.com/Nostromo-618/neuroevolution-stickman-fighters" target="_blank" rel="noreferrer" className="hover:text-teal-500 transition-colors">
                GitHub Repo
              </a>
            </footer>
          </div>
        </div>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default App;