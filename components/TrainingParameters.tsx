/**
 * =============================================================================
 * TRAINING PARAMETERS - Collapsible Training Controls
 * =============================================================================
 * 
 * Collapsible section with training parameter controls (speed, mutation rate, etc.)
 */

import React, { useState, useEffect } from 'react';
import { TrainingSettings, GameState } from '../types';

interface TrainingParametersProps {
  settings: TrainingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TrainingSettings>>;
  bestFitness: number;
  gameState: GameState;
  onExportWeights: () => void;
  onImportWeights: () => void;
  onResetGenome: () => void;
}

const TrainingParameters: React.FC<TrainingParametersProps> = ({
  settings,
  setSettings,
  bestFitness,
  gameState,
  onExportWeights,
  onImportWeights,
  onResetGenome
}) => {
  const [showTrainingParams, setShowTrainingParams] = useState(true);
  const isTrainingActive = settings.gameMode === 'TRAINING';
  const isHumanOpponent = settings.player1Type === 'HUMAN';
  // In training mode with non-human opponents, allow changes even when running
  // Only disable when human opponent is present (for simulation speed)
  const shouldDisableSpeed = isHumanOpponent;
  const shouldDisableMutation = false; // Always allow mutation rate changes in training mode

  // When player1Type changes to HUMAN, set simulation speed to 1x
  useEffect(() => {
    if (isHumanOpponent && settings.simulationSpeed !== 1) {
      setSettings(prev => ({ ...prev, simulationSpeed: 1 }));
    }
  }, [isHumanOpponent, settings.simulationSpeed, setSettings]);

  return (
    <div className="border-t border-slate-700 pt-4">
      <button
        onClick={() => setShowTrainingParams(!showTrainingParams)}
        className="flex items-center justify-between w-full text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 hover:text-slate-300 transition-colors"
      >
        <span>Training Parameters</span>
        <svg className={`w-4 h-4 transition-transform ${showTrainingParams ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`space-y-4 transition-all duration-300 overflow-hidden ${showTrainingParams ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {/* Speed Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-slate-300">Simulation Speed</label>
            <span className="text-xs font-mono text-teal-400">{isHumanOpponent ? '1x' : `${settings.simulationSpeed}x`}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5000"
            value={isHumanOpponent ? 1 : settings.simulationSpeed}
            onChange={(e) => {
              if (!isHumanOpponent) {
                setSettings({ ...settings, simulationSpeed: parseInt(e.target.value) });
              }
            }}
            disabled={shouldDisableSpeed}
            className={`w-full accent-teal-500 bg-slate-700 h-2 rounded-lg appearance-none ${shouldDisableSpeed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            title={isHumanOpponent ? 'Speed locked to 1x for Human opponent' : 'Adjust simulation speed'}
          />
          {isHumanOpponent && (
            <p className="text-[10px] text-slate-500 italic">
              Speed locked to 1x for Human opponent
            </p>
          )}
        </div>

        {/* Mutation Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-slate-300">Mutation Rate</label>
            <span className="text-xs font-mono text-purple-400">{(settings.mutationRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.mutationRate * 100}
            onChange={(e) => {
              setSettings({ ...settings, mutationRate: parseInt(e.target.value) / 100 });
            }}
            disabled={shouldDisableMutation}
            className={`w-full accent-purple-500 bg-slate-700 h-2 rounded-lg appearance-none ${shouldDisableMutation ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            title="Adjust mutation rate"
          />
        </div>

        {/* Background Training Toggle - Only shown in ARCADE mode */}
        {!isTrainingActive && (
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Background Training</span>
                {settings.backgroundTraining && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Training active in background" />
                )}
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, backgroundTraining: !s.backgroundTraining }))}
                className={`relative w-8 h-4 rounded-full transition-colors ${settings.backgroundTraining ? 'bg-green-600' : 'bg-slate-600'}`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${settings.backgroundTraining ? 'left-4.5' : 'left-0.5'}`}
                  style={{ left: settings.backgroundTraining ? '18px' : '2px' }}
                />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              AI keeps learning while you play Single Matches
            </p>
          </div>
        )}

        {/* Weights Management */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={onExportWeights}
            disabled={bestFitness === 0}
            className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-all border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            title="Export best AI weights"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            EXPORT
          </button>
          <button
            onClick={onImportWeights}
            className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-all border border-slate-600 flex items-center justify-center gap-1.5"
            title="Import AI weights"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            IMPORT
          </button>
        </div>

        {/* Reset Genome Button */}
        <div className="pt-2">
          <button
            onClick={onResetGenome}
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-semibold text-white transition-all border border-red-700 flex items-center justify-center gap-1.5"
            title="Reset population and clear all genome-related storage"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            RESET GENOME
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingParameters;

