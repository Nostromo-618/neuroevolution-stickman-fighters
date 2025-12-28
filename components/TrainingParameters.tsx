/**
 * =============================================================================
 * TRAINING PARAMETERS - Collapsible Training Controls
 * =============================================================================
 * 
 * Collapsible section with training parameter controls (speed, mutation rate, etc.)
 */

import React, { useState } from 'react';
import { TrainingSettings } from '../types';

interface TrainingParametersProps {
  settings: TrainingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TrainingSettings>>;
  bestFitness: number;
  onExportWeights: () => void;
  onImportWeights: () => void;
}

const TrainingParameters: React.FC<TrainingParametersProps> = ({
  settings,
  setSettings,
  bestFitness,
  onExportWeights,
  onImportWeights
}) => {
  const [showTrainingParams, setShowTrainingParams] = useState(true);
  const isTrainingActive = settings.gameMode === 'TRAINING';

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
            <span className="text-xs font-mono text-teal-400">{settings.simulationSpeed}x</span>
          </div>
          <input
            type="range"
            min="1" max="5000"
            value={settings.simulationSpeed}
            onChange={(e) => setSettings({ ...settings, simulationSpeed: parseInt(e.target.value) })}
            className="w-full accent-teal-500 bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Mutation Rate Slider */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-slate-300">Mutation Rate</label>
            <span className="text-xs font-mono text-purple-400">{(settings.mutationRate * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="1" max="100"
            value={settings.mutationRate * 100}
            onChange={(e) => setSettings({ ...settings, mutationRate: parseInt(e.target.value) / 100 })}
            className="w-full accent-purple-500 bg-slate-700 h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Background Training Toggle */}
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Background Training</span>
              {(settings.backgroundTraining && !isTrainingActive) && (
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
      </div>
    </div>
  );
};

export default TrainingParameters;

