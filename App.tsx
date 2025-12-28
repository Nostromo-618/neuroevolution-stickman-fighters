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
import GameCanvas from './components/GameCanvas';
import GameHUD from './components/GameHUD';
import Dashboard from './components/Dashboard';
import Toast, { useToast } from './components/Toast';
import { WorkerPool } from './services/WorkerPool';
import TouchControls from './components/TouchControls';
import pkg from './package.json';
import DisclaimerModal from './components/DisclaimerModal';
import GoodbyeScreen from './components/GoodbyeScreen';
import NeuralNetworkVisualizer from './components/NeuralNetworkVisualizer';

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
  }, [settings, initPopulation]);

  const evolve = useCallback(() => {
    const pop = populationRef.current;
    pop.sort((a, b) => b.fitness - a.fitness);
    const best = pop[0];

    // Store best
    if (!bestTrainedGenomeRef.current || best.fitness > bestTrainedGenomeRef.current.fitness) {
      bestTrainedGenomeRef.current = JSON.parse(JSON.stringify(best));
    }

    setFitnessHistory(prev => [...prev.slice(-20), { gen: gameStateRef.current.generation, fitness: best.fitness }]);
    setGameState(prev => ({ ...prev, bestFitness: best.fitness, generation: prev.generation + 1 }));

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
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                  NeuroEvolution: Stickman Fighters
                </h1>
                <p className="text-slate-400 text-sm">
                  {settings.gameMode === 'TRAINING' ? 'Evolution in progress...' : 'Single Match Mode'}
                </p>
              </div>
            </header>

            <div className="relative group">
              <GameHUD
                activeMatch={activeMatchRef.current}
                gameState={gameState}
                settings={settings}
                currentMatchIndex={currentMatchIndex.current}
              />

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
                      {gameState.winner === 'Player 1' ? 'VICTORY' : 'DEFEAT'}
                    </h2>
                    <p className="text-slate-400 font-mono">RESTARTING MATCH...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Helper - hidden on mobile (touch controls shown instead) */}
            <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-500">
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
                    ? activeMatchRef.current.p1 // In training, show P1 (left side)
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
              onReset={() => resetPopulation(true)}
              onModeChange={handleModeChange}
              onExportWeights={handleExportWeights}
              onImportWeights={handleImportWeights}
              onScriptRecompile={recompileCustomScript}
            />

            {pendingImport && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-teal-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-teal-500/10">
                  <h3 className="text-2xl font-bold text-teal-400 mb-2">Import Weights</h3>
                  <div className="bg-slate-800/50 rounded-lg p-3 mb-4 text-sm font-mono">
                    <span className="text-slate-400">Generation:</span> <span className="text-teal-300">{pendingImport.generation}</span>
                    <span className="mx-2 text-slate-600">|</span>
                    <span className="text-slate-400">Fitness:</span> <span className="text-teal-300">{pendingImport.genome.fitness.toFixed(0)}</span>
                  </div>
                  <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                    This will inject the weights into training and continue from Generation {pendingImport.generation}.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleImportChoice}
                      className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all active:scale-95"
                    >
                      Continue Training (Gen {pendingImport.generation})
                    </button>
                    <button
                      onClick={() => setPendingImport(null)}
                      className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                      Cancel
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