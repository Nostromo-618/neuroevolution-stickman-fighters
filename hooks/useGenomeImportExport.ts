/**
 * =============================================================================
 * USE GENOME IMPORT EXPORT - Hook for Genome Weight Management
 * =============================================================================
 * 
 * Handles exporting and importing AI genome weights (neural network parameters).
 * Manages the import confirmation modal state.
 */

import { useState, useCallback } from 'react';
import { Genome, GameState } from '../types';
import { exportGenome, importGenome } from '../services/NeuralNetwork';

interface PendingImport {
  genome: Genome;
  generation: number;
}

interface UseGenomeImportExportReturn {
  pendingImport: PendingImport | null;
  handleExportWeights: () => void;
  handleImportWeights: () => void;
  handleImportChoice: () => void;
  setPendingImport: (value: PendingImport | null) => void;
}

interface UseGenomeImportExportParams {
  getBestGenome: () => Genome | null;
  gameState: GameState;
  bestTrainedGenomeRef: React.MutableRefObject<Genome | null>;
  populationRef: React.MutableRefObject<Genome[]>;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  gameStateRef: React.MutableRefObject<GameState>;
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
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  const handleExportWeights = useCallback(() => {
    const bestGenome = getBestGenome();
    if (!bestGenome) {
      addToast('error', 'No trained AI available. Train the AI first!');
      return;
    }

    const json = exportGenome(bestGenome, gameState.generation);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurofight-weights-gen${gameState.generation}-fitness${bestGenome.fitness.toFixed(0)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', `Weights exported (Gen ${gameState.generation})!`);
  }, [getBestGenome, gameState.generation, addToast]);

  const handleImportWeights = useCallback(() => {
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

        setPendingImport({ genome: result.genome, generation: result.generation });
        addToast('info', `Loaded: Gen ${result.generation}, Fitness ${result.genome.fitness.toFixed(0)}`);
      };
      reader.readAsText(file);
    };
    input.click();
  }, [addToast]);

  const handleImportChoice = useCallback(() => {
    if (!pendingImport) return;

    const { genome, generation } = pendingImport;

    const arcadeGenome = { ...genome, id: `imported-${Date.now()}` };
    bestTrainedGenomeRef.current = arcadeGenome;

    const pop = populationRef.current;
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
    gameStateRef.current.generation = generation;

    addToast('success', `Imported! Continuing from Gen ${generation}`);
    setPendingImport(null);
  }, [pendingImport, bestTrainedGenomeRef, populationRef, setGameState, gameStateRef, addToast]);

  return {
    pendingImport,
    handleExportWeights,
    handleImportWeights,
    handleImportChoice,
    setPendingImport
  };
};

