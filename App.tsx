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
import { useGameSettings } from './hooks/useGameSettings';
import { useGameState } from './hooks/useGameState';
import { usePopulation } from './hooks/usePopulation';
import { useCustomScriptWorkers } from './hooks/useCustomScriptWorkers';
import { useBackgroundTraining } from './hooks/useBackgroundTraining';
import { useGameLoop } from './hooks/useGameLoop';
import { useGenomeImportExport } from './hooks/useGenomeImportExport';
import { useDisclaimer } from './hooks/useDisclaimer';
import { InputManager } from './services/InputManager';
import { Fighter, CANVAS_WIDTH, CANVAS_HEIGHT } from './services/GameEngine';
import { createRandomNetwork, mutateNetwork, crossoverNetworks } from './services/NeuralNetwork';
import { loadScript } from './services/CustomScriptRunner';
import { Genome, TrainingSettings, GameState, OpponentType } from './types';
import GameArena from './components/GameArena';
import ControlsHelper from './components/ControlsHelper';
import ImportModal from './components/ImportModal';
import Dashboard from './components/Dashboard';
import Toast, { useToast } from './components/Toast';
import { WorkerPool } from './services/WorkerPool';
import TouchControls from './components/TouchControls';
import pkg from './package.json';
import DisclaimerModal from './components/DisclaimerModal';
import GoodbyeScreen from './components/GoodbyeScreen';
import NeuralNetworkVisualizer from './components/NeuralNetworkVisualizer';
import { clearGenomeStorage } from './services/PersistenceManager';

// =============================================================================
// MAIN APPLICATION COMPONENT
// =============================================================================

const App = () => {
  // --- State ---
  const { settings, setSettings, settingsRef } = useGameSettings();

  /* Game State managed by hook */
  const {
    gameState,
    setGameState,
    gameStateRef,
    matchTimerRef,
    resetMatchTimer
  } = useGameState();

  // Toast notifications (must be before hooks that use addToast)
  const { toasts, addToast, removeToast } = useToast();

  /* Disclaimer managed by hook */
  const {
    disclaimerStatus,
    handleAcceptDisclaimer,
    handleDeclineDisclaimer,
    handleReturnToDisclaimer
  } = useDisclaimer();

  /* Population managed by hook */
  const {
    populationRef,
    bestTrainedGenomeRef,
    fitnessHistory,
    setFitnessHistory,
    initPopulation,
    getBestGenome
  } = usePopulation();

  /* Genome import/export managed by hook */
  const {
    pendingImport,
    handleExportWeights,
    handleImportWeights,
    handleImportChoice,
    setPendingImport
  } = useGenomeImportExport({
    getBestGenome,
    gameState,
    bestTrainedGenomeRef,
    populationRef,
    setGameState,
    gameStateRef,
    addToast
  });

  // --- Refs for Game Loop & State Access ---
  // populationRef & bestTrainedGenomeRef managed by usePopulation
  const activeMatchRef = useRef<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>(null);
  const currentMatchIndex = useRef(0);
  const inputManager = useRef<InputManager | null>(null);
  // requestRef is now managed by useGameLoop

  // We use a separate ref for timer logic to ensure accuracy during high-speed simulation steps
  // without waiting for React state updates.
  // matchTimerRef managed by useGameState

  // Background training refs
  // workerPoolRef and isWorkerTrainingRef are now managed by useBackgroundTraining

  // Custom script worker for secure isolated execution
  // We now have two workers to support Custom vs Custom matches
  const { customScriptWorkerARef, customScriptWorkerBRef, recompileCustomScript } = useCustomScriptWorkers(settings, addToast);

  // const settingsRef = useRef(settings); // MOVED to useGameSettings
  // gameStateRef managed by useGameState
  // useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // Store addToast in a ref to avoid dependency issues
  const addToastRef = useRef(addToast);
  useEffect(() => { addToastRef.current = addToast; }, [addToast]);

  // initPopulation & getBestGenome managed by usePopulation

  // Wrapper to init population with current settings
  const resetPopulation = useCallback((clearBest: boolean = true) => {
    initPopulation(settings, clearBest);
    currentMatchIndex.current = 0;
    activeMatchRef.current = null;
    if (settings.gameMode === 'TRAINING') {
      // Calculate evolution interval based on opponent type
      const isHumanOpponent = settings.player1Type === 'HUMAN';
      const isAIOpponent = settings.player1Type === 'AI';
      const popSize = populationRef.current.length;
      const evolutionInterval = isHumanOpponent 
        ? 3 
        : (isAIOpponent ? Math.floor(popSize / 2) : popSize);
      setGameState(prev => ({ ...prev, matchesUntilEvolution: evolutionInterval }));
    }
  }, [settings, initPopulation, setGameState]);

  // Reset current match only (does not reset population or best genome)
  const resetMatch = useCallback(() => {
    setSettings(prev => ({ ...prev, isRunning: false })); // Completely stop the match
    activeMatchRef.current = null;
    resetMatchTimer();
    // Calculate matches remaining based on current match index and opponent type
    let matchesRemaining = 3;
    if (settings.gameMode === 'TRAINING') {
      const isHumanOpponent = settings.player1Type === 'HUMAN';
      const isAIOpponent = settings.player1Type === 'AI';
      const popSize = populationRef.current.length;
      const EVOLUTION_INTERVAL = isHumanOpponent 
        ? 3 
        : (isAIOpponent ? Math.floor(popSize / 2) : popSize);
      matchesRemaining = EVOLUTION_INTERVAL - (currentMatchIndex.current % EVOLUTION_INTERVAL);
    }
    setGameState(prev => ({
      ...prev,
      player1Health: 100,
      player2Health: 100,
      player1Energy: 100,
      player2Energy: 100,
      timeRemaining: 90,
      matchActive: false,
      winner: null,
      roundStatus: 'WAITING',
      matchesUntilEvolution: matchesRemaining
    }));
  }, [setSettings, resetMatchTimer, setGameState, settings.gameMode, currentMatchIndex]);

  // Reset genome and clear localStorage
  const resetGenomeAndStorage = useCallback(() => {
    resetPopulation(true);
    clearGenomeStorage();
    addToast('info', 'Genome reset: Population and storage cleared');
  }, [resetPopulation, addToast]);

  const evolve = useCallback(() => {
    const pop = populationRef.current;
    pop.sort((a, b) => b.fitness - a.fitness);
    const best = pop[0];

    // Store best
    if (!bestTrainedGenomeRef.current || best.fitness > bestTrainedGenomeRef.current.fitness) {
      bestTrainedGenomeRef.current = JSON.parse(JSON.stringify(best));
    }

    setFitnessHistory(prev => [...prev.slice(-20), { gen: gameStateRef.current.generation, fitness: best.fitness }]);
    
    // Calculate next evolution interval based on opponent type
    const isHumanOpponent = settingsRef.current.player1Type === 'HUMAN';
    const isAIOpponent = settingsRef.current.player1Type === 'AI';
    const popSize = populationRef.current.length;
    const nextEvolutionInterval = isHumanOpponent 
      ? 3 
      : (isAIOpponent ? Math.floor(popSize / 2) : popSize);
    
    setGameState(prev => ({ ...prev, bestFitness: best.fitness, generation: prev.generation + 1, matchesUntilEvolution: nextEvolutionInterval }));

    const currentGen = gameStateRef.current.generation;
    const newPop: Genome[] = [
      { ...pop[0], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-0` },
      { ...pop[1], fitness: 0, matchesWon: 0, id: `gen${currentGen + 1}-1` }
    ];

    const adaptiveRate = Math.max(0.05, 0.30 - (currentGen * 0.008));
    const selectionPoolSize = Math.max(2, Math.floor(pop.length / 4));

    while (newPop.length < settingsRef.current.populationSize) {
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

    // startMatch is called by the loop automatically when activeMatchRef is null
  }, [populationRef, bestTrainedGenomeRef, setFitnessHistory, gameStateRef, setGameState, settingsRef]);

  /* Game Loop managed by hook */
  const { update, startMatch, requestRef } = useGameLoop({
    settings,
    settingsRef,
    gameStateRef,
    setGameState,
    activeMatchRef,
    currentMatchIndex,
    populationRef,
    getBestGenome,
    matchTimerRef,
    inputManager,
    customScriptWorkerARef,
    customScriptWorkerBRef,
    evolve,
    addToast
  });





  // useGameLoop handles update cycle, requestRef, and cleanup

  useEffect(() => {
    // Initialize InputManager here to avoid side effects in render
    inputManager.current = new InputManager();

    resetPopulation();
    // Start Game Loop logic
    requestRef.current = requestAnimationFrame(update);

    return () => {
      // requestRef cleanup handled by useGameLoop
      inputManager.current?.destroy();
    };
  }, []); // Only run once on mount

  // Restart match when population size changes (but keep best genome)
  useEffect(() => {
    if (populationRef.current.length !== settings.populationSize) {
      resetPopulation(false); // Don't clear best genome on resize
    }
  }, [settings.populationSize, resetPopulation]);

  // Track previous player types to detect actual changes (not just initial mount)
  const prevPlayerTypesRef = useRef<{ p1: string; p2: string } | null>(null);

  // Immediately update fighters when player types change (if match hasn't started)
  useEffect(() => {
    const currentP1 = settings.player1Type;
    const currentP2 = settings.player2Type;
    const prev = prevPlayerTypesRef.current;

    // Skip on initial mount (no previous values)
    if (prev === null) {
      prevPlayerTypesRef.current = { p1: currentP1, p2: currentP2 };
      return;
    }

    // Only update if player types actually changed AND match isn't running
    const playerTypesChanged = prev.p1 !== currentP1 || prev.p2 !== currentP2;
    if (playerTypesChanged && !settingsRef.current.isRunning && activeMatchRef.current !== null) {
      // Pre-set the ref state to prevent DEFEAT overlay (matchActive=false AND roundStatus='FIGHTING')
      // This must happen BEFORE startMatch() to avoid race conditions
      if (gameStateRef.current) {
        gameStateRef.current.roundStatus = 'WAITING';
      }
      
      // Directly call startMatch to recreate fighters with new types/colors
      startMatch();
      
      // Immediately override matchActive to false since match isn't running (preview mode)
      // Update both ref and state synchronously to ensure consistency
      if (gameStateRef.current) {
        gameStateRef.current.matchActive = false;
        gameStateRef.current.roundStatus = 'WAITING';
      }
      setGameState(prev => ({
        ...prev,
        matchActive: false, // Keep as false since match isn't running
        player1Health: 100,
        player2Health: 100,
        player1Energy: 100,
        player2Energy: 100,
        timeRemaining: 90,
        winner: null,
        roundStatus: 'WAITING' // Must be WAITING, not FIGHTING, to avoid DEFEAT overlay
      }));
    }

    // Update ref for next comparison
    prevPlayerTypesRef.current = { p1: currentP1, p2: currentP2 };
  }, [settings.player1Type, settings.player2Type, settingsRef, gameStateRef, startMatch, setGameState, activeMatchRef]);

  // Ensure matchActive and roundStatus are correct when match starts (isRunning becomes true)
  useEffect(() => {
    if (settings.isRunning && activeMatchRef.current && !gameState.matchActive) {
      // Match was started, ensure matchActive and roundStatus reflect this
      const isTraining = settings.gameMode === 'TRAINING';
      if (gameStateRef.current) {
        gameStateRef.current.matchActive = true;
        // In training mode, round should be FIGHTING immediately (no countdown)
        if (isTraining) {
          gameStateRef.current.roundStatus = 'FIGHTING';
        }
      }
      setGameState(prev => ({
        ...prev,
        matchActive: true,
        // In training mode, round should be FIGHTING immediately (no countdown)
        ...(isTraining && { roundStatus: 'FIGHTING' })
      }));
    }
  }, [settings.isRunning, settings.gameMode, gameState.matchActive, gameStateRef, setGameState, activeMatchRef]);

  // Handle Mode Switching reset
  const handleModeChange = (mode: 'TRAINING' | 'ARCADE') => {
    setSettings(prev => ({
      ...prev,
      gameMode: mode,
      isRunning: false,
      // Set defaults when switching to Training mode
      ...(mode === 'TRAINING' && {
        player1Type: prev.player1Type || 'AI',
        player2Type: 'AI' // Player 2 is always AI in Training mode
      })
    }));
    // Calculate evolution interval for training mode
    let evolutionInterval = 3;
    if (mode === 'TRAINING') {
      const isHumanOpponent = settings.player1Type === 'HUMAN';
      const isAIOpponent = settings.player1Type === 'AI';
      const popSize = populationRef.current.length;
      evolutionInterval = isHumanOpponent 
        ? 3 
        : (isAIOpponent ? Math.floor(popSize / 2) : popSize);
    }
    
    setGameState(prev => ({ 
      ...prev, 
      winner: null, 
      matchActive: false,
      ...(mode === 'TRAINING' && { matchesUntilEvolution: evolutionInterval })
    }));
    activeMatchRef.current = null; // Will trigger startMatch in loop
    if (mode === 'TRAINING') {
      currentMatchIndex.current = 0;
    } else if (mode === 'ARCADE') {
      // Ensure best genome is ready when switching to ARCADE
      // startMatch will be called by the game loop and will use getBestGenome()
    }
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
                <h3 className="text-lg sm:text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  NeuroEvolution: Stickman Fighters
                </h3>
                <p className="text-slate-400 text-sm">
                  {settings.gameMode === 'TRAINING' ? 'Training Mode' : 'Single Match Mode'}
                </p>
              </div>
            </header>

            <GameArena
              activeMatch={activeMatchRef.current}
              gameState={gameState}
              settings={settings}
              currentMatchIndex={currentMatchIndex.current}
            />

            <ControlsHelper />

            {/* Mobile Touch Controls - only in Arcade mode */}
            {settings.gameMode === 'ARCADE' && <TouchControls inputManager={inputManager} />}

            {/* Neural Network Visualization (Desktop Only) - Moved here per user request */}
            {gameState.matchActive && activeMatchRef.current && (
              <NeuralNetworkVisualizer
                className="hidden md:block w-full"
                width={800} // Higher res canvas for the larger space
                height={250}
                fighter={
                  settings.gameMode === 'TRAINING'
                    ? activeMatchRef.current.p2 // In training, show P2 (the AI being trained)
                    : activeMatchRef.current.p2 // In Arcade, show P2 (the AI)
                }
              />
            )}
          </div>

          {/* Right Column: Dashboards & Stats */}
          <div className="space-y-6">
            <Dashboard
              settings={settings}
              setSettings={setSettings}
              fitnessHistory={fitnessHistory}
              currentGen={gameState.generation}
              bestFitness={gameState.bestFitness}
              gameState={gameState}
              onResetMatch={resetMatch}
              onResetGenome={resetGenomeAndStorage}
              onModeChange={handleModeChange}
              onExportWeights={handleExportWeights}
              onImportWeights={handleImportWeights}
              onScriptRecompile={recompileCustomScript}
            />

            <ImportModal
              pendingImport={pendingImport}
              onConfirm={handleImportChoice}
              onCancel={() => setPendingImport(null)}
            />

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