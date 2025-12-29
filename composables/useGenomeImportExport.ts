/**
 * =============================================================================
 * USE GENOME IMPORT EXPORT - Composable for Genome Weight Management
 * =============================================================================
 * 
 * Handles exporting and importing AI genome weights (neural network parameters).
 * Manages the import confirmation modal state.
 */

import { ref, type Ref } from 'vue';
import type { Genome, GameState } from '~/types';
import { exportGenome, importGenome } from '~/services/NeuralNetwork';

interface PendingImport {
  genome: Genome;
  generation: number;
}

interface UseGenomeImportExportReturn {
  pendingImport: Ref<PendingImport | null>;
  handleExportWeights: () => void;
  handleImportWeights: () => void;
  handleImportChoice: () => void;
  setPendingImport: (value: PendingImport | null) => void;
}

interface UseGenomeImportExportParams {
  getBestGenome: () => Genome | null;
  gameState: Ref<GameState>;
  bestTrainedGenomeRef: Ref<Genome | null>;
  populationRef: Ref<Genome[]>;
  setGameState: (updater: GameState | ((prev: GameState) => GameState)) => void;
  gameStateRef: Ref<GameState>;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const useGenomeImportExport = ({
  getBestGenome,
  gameState,
  bestTrainedGenomeRef,
  populationRef,
  setGameState,
  gameStateRef,
  addToast
}: UseGenomeImportExportParams): UseGenomeImportExportReturn => {
  const pendingImport = ref<PendingImport | null>(null);

  const handleExportWeights = () => {
    const bestGenome = getBestGenome();
    if (!bestGenome) {
      addToast('error', 'No trained AI available. Train the AI first!');
      return;
    }

    const json = exportGenome(bestGenome, gameState.value.generation);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurofight-weights-gen${gameState.value.generation}-fitness${bestGenome.fitness.toFixed(0)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', `Weights exported (Gen ${gameState.value.generation})!`);
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
        const result = importGenome(text);

        if (result.success === false) {
          addToast('error', result.error);
          return;
        }

        pendingImport.value = { genome: result.genome, generation: result.generation };
        addToast('info', `Loaded: Gen ${result.generation}, Fitness ${result.genome.fitness.toFixed(0)}`);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleImportChoice = () => {
    if (!pendingImport.value) return;

    const { genome, generation } = pendingImport.value;

    const arcadeGenome = { ...genome, id: `imported-${Date.now()}` };
    bestTrainedGenomeRef.value = arcadeGenome;

    const pop = populationRef.value;
    if (pop.length > 0) {
      const seedCount = Math.max(2, Math.floor(pop.length / 4));
      for (let i = 0; i < seedCount && i < pop.length; i++) {
        pop[i] = {
          ...genome,
          fitness: 0,
          matchesWon: 0,
          id: `imported-${Date.now()}-${i}`
        };
      }
    }

    setGameState(prev => ({ ...prev, generation: generation }));
    gameStateRef.value.generation = generation;

    addToast('success', `Imported! Continuing from Gen ${generation}`);
    pendingImport.value = null;
  };

  return {
    pendingImport,
    handleExportWeights,
    handleImportWeights,
    handleImportChoice,
    setPendingImport: (value: PendingImport | null) => { pendingImport.value = value; }
  };
};
