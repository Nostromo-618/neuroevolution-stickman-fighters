<template>
  <ClientOnly>
    <template #default>
      <div>
        <!-- Hide header when disclaimer is declined (Farewell screen) -->
        <AppHeader v-if="disclaimerStatus !== 'DECLINED'" />
        
        <GoodbyeScreen v-if="disclaimerStatus === 'DECLINED'" :on-return="handleReturnToDisclaimer" />

        <DisclaimerModal
          v-if="disclaimerStatus === 'PENDING'"
          :on-accept="handleAcceptDisclaimer"
          :on-decline="handleDeclineDisclaimer"
        />

        <div
          :class="[
            'min-h-screen font-sans flex flex-col items-center py-8 transition-all duration-700',
            'bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-white',
            disclaimerStatus === 'PENDING' ? 'blur-md pointer-events-none' : ''
          ]"
        >
        <div class="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Game View -->
        <div class="lg:col-span-2 space-y-4">
          <GameArena
            :active-match="(activeMatchRef ?? null) as any"
            :game-state="gameState"
            :settings="settings"
            :current-match-index="currentMatchIndex"
          />

          <!-- Controls Helper - Arcade mode only -->
          <ControlsHelper v-if="settings.gameMode === 'ARCADE'" />

          <!-- Mobile Touch Controls - only in Arcade mode -->
          <TouchControls v-if="settings.gameMode === 'ARCADE'" :input-manager="{ value: inputManager } as any" />

          <!-- Fitness Chart (Training Mode Only - Below Arena, taller for readability) -->
          <FitnessChart
            v-if="settings.gameMode === 'TRAINING'"
            class="hidden md:block w-full"
            :fitness-history="fitnessHistory"
            :current-gen="gameState.generation"
            :best-fitness="gameState.bestFitness"
            :is-training-active="settings.gameMode === 'TRAINING'"
            :tall="true"
          />

          <!-- Neural Network Visualization (Desktop Only) -->
          <NeuralNetworkVisualizer
            class="hidden md:block w-full"
            :width="800"
            :height="250"
            :fighter="(activeMatchRef ? activeMatchRef.p2 : null) as any"
          />

        </div>

        <!-- Right Column: Dashboards & Stats -->
        <div class="space-y-6">
          <Dashboard
            :settings="settings"
            :set-settings="setSettings"
            :best-fitness="gameState.bestFitness"
            :game-state="gameState"
            :on-reset-match="resetMatch"
            :on-reset-genome="resetGenomeAndStorage"
            :on-mode-change="handleModeChange"
            :on-export-weights="handleExportWeights"
            :on-import-weights="handleImportWeights"
            :on-script-recompile="handleScriptRecompile"
            @architecture-change="handleArchitectureChange"
          />

          <!-- Fitness Chart (Arcade Mode Only - Right Column) -->
          <FitnessChart
            v-if="settings.gameMode === 'ARCADE'"
            :fitness-history="fitnessHistory"
            :current-gen="gameState.generation"
            :best-fitness="gameState.bestFitness"
            :is-training-active="false"
          />

          <ImportModal
            :pending-import="pendingImport"
            :on-confirm="handleImportChoice"
            :on-cancel="() => setPendingImport(null)"
          />

          <AutoStopModal 
            v-model="showAutoStopModal"
            :current-gen="gameState.generation"
            :on-continue="handleAutoStopContinue"
            :on-disable="handleAutoStopDisable"
            :on-stop="handleAutoStopStop"
          />
        </div>
      </div>
      </div>
    </div>
    </template>
    <template #fallback>
      <div class="min-h-screen font-sans flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-white">
        <div class="text-center">
          <div class="text-2xl font-bold mb-2">Loading...</div>
          <div class="text-gray-500 dark:text-slate-400 text-sm">Initializing game engine</div>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, markRaw, computed } from 'vue';
import { useGameSettings } from '~/composables/useGameSettings';
import { useGameState } from '~/composables/useGameState';
import { usePopulation } from '~/composables/usePopulation';
import { useCustomScriptWorkers } from '~/composables/useCustomScriptWorkers';
import { useSyncScriptExecutors } from '~/composables/useSyncScriptExecutors';
import { useBackgroundTraining } from '~/composables/useBackgroundTraining';
import { useGameLoop } from '~/composables/useGameLoop';
import { useGenomeImportExport } from '~/composables/useGenomeImportExport';
import { useDisclaimer } from '~/composables/useDisclaimer';
import { useEvolution, calculateEvolutionInterval } from '~/composables/useEvolution';
import { useModeSwitch } from '~/composables/useModeSwitch';
import { InputManager } from '~/services/InputManager';
import type { Fighter } from '~/services/GameEngine';
import type { TrainingSettings, NNArchitecture } from '~/types';
import { saveArchitecture } from '~/services/NNArchitecturePersistence';

// Disable SSR for this page since it requires browser APIs
definePageMeta({
  ssr: false
});

const pkgName = 'neuroevolution-stickman-fighters';
const pkgVersion = '2.0.7';

const toast = useToast();

const addToast = (type: 'success' | 'error' | 'info', message: string, clearFirst = false) => {
  if (process.client) {
    if (clearFirst) {
      toast.clear();
    }
    toast.add({
      title: message,
      color: type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue'
    });
  }
};

const { settings, setSettings, settingsRef } = useGameSettings();

const {
  gameState,
  setGameState,
  gameStateRef,
  matchTimerRef,
  resetMatchTimer
} = useGameState();

const {
  populationRef,
  bestTrainedGenomeRef,
  fitnessHistory,
  setFitnessHistory,
  initPopulation,
  getBestGenome
} = usePopulation();

const {
  disclaimerStatus,
  handleAcceptDisclaimer,
  handleDeclineDisclaimer,
  handleReturnToDisclaimer
} = useDisclaimer();

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

const activeMatchRef = ref<{ p1: Fighter, p2: Fighter, p1GenomeIdx: number, p2GenomeIdx: number } | null>(null);
const currentMatchIndex = ref(0);
const inputManager = ref<InputManager | null>(null);

const { customScriptWorkerARef, customScriptWorkerBRef, recompileCustomScript } = useCustomScriptWorkers(settings, addToast);

// Option A: Sync script executors for timing fairness with AI
const { syncExecutorARef, syncExecutorBRef, recompileSyncExecutors } = useSyncScriptExecutors(settings, addToast);

// Recompile both when user saves script
const handleScriptRecompile = async () => {
  await recompileCustomScript();
  recompileSyncExecutors();
};

// Auto-stop modal state and handlers (defined early for use in composables)
const showAutoStopModal = ref(false);

const handleAutoStopTriggered = () => {
  showAutoStopModal.value = true;
  setSettings(s => ({ ...s, isRunning: false }));
};

const handleAutoStopContinue = () => {
  setSettings(s => ({ 
    ...s, 
    autoStopGeneration: s.autoStopGeneration + 1000, 
    isRunning: true 
  }));
  showAutoStopModal.value = false;
};

const handleAutoStopDisable = () => {
  setSettings(s => ({ 
    ...s, 
    autoStopEnabled: false, 
    isRunning: true 
  }));
  showAutoStopModal.value = false;
};

const handleAutoStopStop = () => {
  setSettings(s => ({ 
    ...s, 
    backgroundTraining: false, 
    // In Training Mode: pause to prevent re-triggering the limit check
    // In Arcade Mode: keep running (only background training stops)
    isRunning: s.gameMode === 'ARCADE'
  }));
  showAutoStopModal.value = false;
};

// Evolution composable - handles population reset, evolution logic
const {
  resetPopulation,
  resetMatch: evolutionResetMatch,
  resetGenomeAndStorage,
  evolve
} = useEvolution({
  settingsRef,
  setSettings,
  gameStateRef,
  setGameState,
  populationRef,
  bestTrainedGenomeRef,
  setFitnessHistory,
  currentMatchIndex,
  addToast,
  onAutoStop: handleAutoStopTriggered
});

// Local resetPopulation wrapper that integrates with initPopulation
const initAndResetPopulation = (clearBest: boolean = true) => {
  initPopulation(settings.value, clearBest);
  currentMatchIndex.value = 0;
  activeMatchRef.value = null;
  if (settings.value.gameMode === 'TRAINING') {
    const evolutionInterval = calculateEvolutionInterval(
      settings.value.player1Type,
      populationRef.value.length
    );
    setGameState(prev => ({ ...prev, matchesUntilEvolution: evolutionInterval }));
  }
};

const resetMatch = () => {
  // Clear any pending timeouts first
  clearMatchRestartTimeout();
  clearCountdownInterval();
  
  setSettings(prev => ({ ...prev, isRunning: false }));
  resetMatchTimer();
  evolutionResetMatch();
  
  // Reset state for both Arcade and Training modes
  // This ensures opponent selection is re-enabled after reset
  setGameState(prev => ({
    ...prev,
    matchActive: false,
    roundStatus: 'WAITING',
    arcadeStats: { matchesPlayed: 0, p1Wins: 0, p2Wins: 0 }
  }));
  
  // Spawn new fighters immediately (don't leave activeMatchRef as null)
  activeMatchRef.value = null;
  startMatch();
  
  // FIX: After startMatch(), Training mode sets roundStatus to 'FIGHTING'.
  // Override it back to 'WAITING' so opponent selection remains enabled.
  // This allows users to change the training opponent after reset.
  setGameState(prev => ({
    ...prev,
    matchActive: false,
    roundStatus: 'WAITING'
  }));
};

const { update, startMatch, requestRef, clearWaitingTimeout, clearMatchRestartTimeout, startCountdown, clearCountdownInterval } = useGameLoop({
  settings,
  settingsRef,
  gameStateRef,
  setGameState,
  activeMatchRef: activeMatchRef as any,
  currentMatchIndex,
  populationRef,
  getBestGenome,
  matchTimerRef,
  inputManager: inputManager as any,
  customScriptWorkerARef,
  customScriptWorkerBRef,
  // Option A: Sync executors for timing fairness
  syncScriptExecutorARef: syncExecutorARef,
  syncScriptExecutorBRef: syncExecutorBRef,
  evolve,
  addToast
});

useBackgroundTraining({
  settings,
  setSettings,
  setGameState,
  setFitnessHistory,
  populationRef,
  bestTrainedGenomeRef,
  currentMatchIndex,
  onAutoStop: handleAutoStopTriggered
});

const prevPlayerTypesRef = ref<{ p1: string; p2: string } | null>(null);

// Setup watches only on client side
if (process.client) {
  watch(() => [settings.value.player1Type, settings.value.player2Type], ([currentP1, currentP2]) => {
    if (!gameStateRef) return;
    
    const prev = prevPlayerTypesRef.value;

    if (prev === null) {
      prevPlayerTypesRef.value = { p1: currentP1 as string, p2: currentP2 as string };
      return;
    }

    const playerTypesChanged = prev.p1 !== currentP1 || prev.p2 !== currentP2;
    if (playerTypesChanged && !settingsRef.value.isRunning && activeMatchRef.value !== null) {
      if (gameStateRef.value) {
        gameStateRef.value.roundStatus = 'WAITING';
      }
      
      startMatch();
      
      if (gameStateRef.value) {
        gameStateRef.value.matchActive = false;
        gameStateRef.value.roundStatus = 'WAITING';
      }
      setGameState(prev => ({
        ...prev,
        matchActive: false,
        player1Health: 100,
        player2Health: 100,
        player1Energy: 100,
        player2Energy: 100,
        timeRemaining: 90,
        winner: null,
        roundStatus: 'WAITING'
      }));
    }

    prevPlayerTypesRef.value = { p1: currentP1 as string, p2: currentP2 as string };
  });

  watch(() => settings.value.isRunning, (isRunning) => {
    if (!gameStateRef) return;

    if (!isRunning) {
      // Clear match restart timeout when pausing to prevent auto-restart
      clearMatchRestartTimeout();
    }

    if (isRunning && activeMatchRef.value && !gameState.value.matchActive) {
      const isTraining = settings.value.gameMode === 'TRAINING';
      if (gameStateRef.value) {
        gameStateRef.value.matchActive = true;
        if (isTraining) {
          gameStateRef.value.roundStatus = 'FIGHTING';
        }
      }
      setGameState(prev => ({
        ...prev,
        matchActive: true,
        ...(isTraining && { roundStatus: 'FIGHTING' })
      }));
    }

    // Arcade: Start countdown when isRunning becomes true and in WAITING status
    // Only for first match - subsequent rounds are handled by startMatch() directly
    const isFirstMatch = gameState.value.arcadeStats.matchesPlayed === 0;
    if (isRunning && settings.value.gameMode === 'ARCADE' && gameState.value.roundStatus === 'WAITING' && isFirstMatch) {
      startCountdown(false);  // First match uses normal speed
    }
  });

  watch(() => settings.value.populationSize, (newSize) => {
    if (populationRef.value.length !== newSize) {
      resetPopulation(false);
    }
  });
}

/**
 * Handles architecture changes from the NN Editor.
 * Saves the architecture and resets the population to use it.
 */
const handleArchitectureChange = (architecture: NNArchitecture) => {
  // Save architecture (already done by NNEditorModal, but ensures consistency)
  saveArchitecture(architecture);

  // Reset population - this will trigger createRandomNetwork() which now
  // reads from getCurrentArchitecture() and uses the new saved architecture
  resetPopulation(true);

  // Reset training state
  setGameState(prev => ({
    ...prev,
    generation: 0,
    bestFitness: 0,
    matchesUntilEvolution: calculateEvolutionInterval(
      settings.value.player1Type,
      populationRef.value.length
    )
  }));

  addToast('success', `Architecture applied: ${architecture.hiddenLayers.join(' → ')} hidden nodes`);
};

const handleModeChange = (mode: 'TRAINING' | 'ARCADE') => {
  // Clear any pending timeouts
  clearWaitingTimeout();
  clearMatchRestartTimeout();
  clearCountdownInterval();

  setSettings(prev => ({
    ...prev,
    gameMode: mode,
    isRunning: false,
    ...(mode === 'TRAINING' && {
      player1Type: prev.player1Type === 'HUMAN' ? 'SIMPLE_AI' : prev.player1Type,
      player2Type: 'SIMPLE_AI'
    })
  }));

  let evolutionInterval = 3;
  if (mode === 'TRAINING') {
    evolutionInterval = calculateEvolutionInterval(settings.value.player1Type, populationRef.value.length);
  }

  setGameState(prev => ({
    ...prev,
    winner: null,
    matchActive: false,
    ...(mode === 'TRAINING' && { matchesUntilEvolution: evolutionInterval }),
    ...(mode === 'ARCADE' && { arcadeStats: { matchesPlayed: 0, p1Wins: 0, p2Wins: 0 } })
  }));
  
  // Reset match index for both modes
  currentMatchIndex.value = 0;
  
  // Spawn new fighters immediately (don't leave activeMatchRef as null)
  activeMatchRef.value = null;
  startMatch();
};

onMounted(() => {
  inputManager.value = markRaw(new InputManager());
  
  // Only reset population if no persisted data was loaded
  // When population is restored from localStorage, populationRef will already have genomes
  if (populationRef.value.length === 0) {
    resetPopulation();
  } else {
    // Population was restored - just spawn the initial match fighters
    currentMatchIndex.value = 0;
    activeMatchRef.value = null;
    startMatch();
  }
  
  if (requestRef.value === null) {
    requestRef.value = requestAnimationFrame(update);
  }
});

onUnmounted(() => {
  inputManager.value?.destroy();
});
</script>
