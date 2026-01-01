<template>
  <ClientOnly>
    <template #default>
      <div>
        <GoodbyeScreen v-if="disclaimerStatus === 'DECLINED'" :on-return="handleReturnToDisclaimer" />

        <DisclaimerModal
          v-if="disclaimerStatus === 'PENDING'"
          :on-accept="handleAcceptDisclaimer"
          :on-decline="handleDeclineDisclaimer"
        />

        <div
          :class="[
            'min-h-screen bg-slate-950 text-white font-sans flex flex-col items-center py-8 transition-all duration-700',
            disclaimerStatus === 'PENDING' ? 'blur-md pointer-events-none' : ''
          ]"
        >
        <div class="w-full max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Game View -->
        <div class="lg:col-span-2 space-y-4">
          <GameArena
            :active-match="activeMatchRef ?? null"
            :game-state="gameState"
            :settings="settings"
            :current-match-index="currentMatchIndex"
          />

          <ControlsHelper />

          <!-- Mobile Touch Controls - only in Arcade mode -->
          <TouchControls v-if="settings.gameMode === 'ARCADE'" :input-manager="{ value: inputManager }" />

          <!-- Neural Network Visualization (Desktop Only) -->
          <NeuralNetworkVisualizer
            class="hidden md:block w-full"
            :width="800"
            :height="250"
            :fighter="activeMatchRef ? activeMatchRef.p2 : null"
          />

          <!-- Chuck Training Visualization (Desktop Only, Arcade Chuck Mode) -->
          <ChuckTrainingCanvas
            class="hidden md:block w-full"
            :settings="settings"
          />
        </div>

        <!-- Right Column: Dashboards & Stats -->
        <div class="space-y-6">
          <Dashboard
            :settings="settings"
            :set-settings="setSettings"
            :fitness-history="fitnessHistory"
            :current-gen="gameState.generation"
            :best-fitness="gameState.bestFitness"
            :game-state="gameState"
            :on-reset-match="resetMatch"
            :on-reset-genome="resetGenomeAndStorage"
            :on-mode-change="handleModeChange"
            :on-export-weights="handleExportWeights"
            :on-import-weights="handleImportWeights"
            :on-script-recompile="recompileCustomScript"
          />

          <ImportModal
            :pending-import="pendingImport"
            :on-confirm="handleImportChoice"
            :on-cancel="() => setPendingImport(null)"
          />
        </div>
      </div>
      </div>
    </div>
    </template>
    <template #fallback>
      <div class="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center">
        <div class="text-center">
          <div class="text-2xl font-bold mb-2">Loading...</div>
          <div class="text-slate-400 text-sm">Initializing game engine</div>
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
import { useBackgroundTraining } from '~/composables/useBackgroundTraining';
import { useGameLoop } from '~/composables/useGameLoop';
import { useGenomeImportExport } from '~/composables/useGenomeImportExport';
import { useDisclaimer } from '~/composables/useDisclaimer';
import { useEvolution, calculateEvolutionInterval } from '~/composables/useEvolution';
import { useModeSwitch } from '~/composables/useModeSwitch';
import { InputManager } from '~/services/InputManager';
import type { Fighter } from '~/services/GameEngine';
import type { TrainingSettings } from '~/types';

// Disable SSR for this page since it requires browser APIs
definePageMeta({
  ssr: false
});

const pkgName = 'neuroevolution-stickman-fighters';
const pkgVersion = '1.3.1';

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

// Evolution composable - handles population reset, evolution logic
const {
  resetPopulation,
  resetMatch: evolutionResetMatch,
  resetGenomeAndStorage,
  evolve
} = useEvolution({
  settingsRef,
  gameStateRef,
  setGameState,
  populationRef,
  bestTrainedGenomeRef,
  setFitnessHistory,
  currentMatchIndex,
  addToast
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

// Local resetMatch that also handles settings
const resetMatch = () => {
  setSettings(prev => ({ ...prev, isRunning: false }));
  activeMatchRef.value = null;
  resetMatchTimer();
  evolutionResetMatch();
};

const { update, startMatch, requestRef, clearWaitingTimeout, clearMatchRestartTimeout } = useGameLoop({
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

useBackgroundTraining({
  settings,
  setGameState,
  setFitnessHistory,
  populationRef,
  bestTrainedGenomeRef,
  currentMatchIndex
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
  });

  watch(() => settings.value.populationSize, (newSize) => {
    if (populationRef.value.length !== newSize) {
      resetPopulation(false);
    }
  });
}

const handleModeChange = (mode: 'TRAINING' | 'ARCADE') => {
  // Clear any pending timeouts
  clearWaitingTimeout();
  clearMatchRestartTimeout();

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
    ...(mode === 'ARCADE' && { arcadeStats: { matchesPlayed: 0, wins: 0, losses: 0 } })
  }));
  activeMatchRef.value = null;

  // Reset match index for both modes
  currentMatchIndex.value = 0;
};

onMounted(() => {
  inputManager.value = markRaw(new InputManager());
  resetPopulation();
  if (requestRef.value === null) {
    requestRef.value = requestAnimationFrame(update);
  }
});

onUnmounted(() => {
  inputManager.value?.destroy();
});
</script>
