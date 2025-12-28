/**
 * =============================================================================
 * DASHBOARD - Unified Control Panel
 * =============================================================================
 * 
 * This component provides the unified UI for controlling training parameters,
 * viewing fitness progress, and managing AI weights.
 * 
 * FEATURES:
 * - Unified "Arcade" interface
 * - Player 1 & 2 Selection (Human, AI, Scripts)
 * - Training Toggle (Visual Training Mode)
 * - Training parameter controls (speed, mutation rate)
 * - Fitness history chart
 * - Export/Import AI weights
 * 
 * =============================================================================
 */

import React, { useState, useCallback } from 'react';
import { TrainingSettings, GameMode } from '../types';
import ScriptEditor from './ScriptEditor';
import InfoModal from './InfoModal';
import MatchConfiguration from './MatchConfiguration';
import TrainingParameters from './TrainingParameters';
import FitnessChart from './FitnessChart';
import { saveScript } from '../services/CustomScriptRunner';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface DashboardProps {
  settings: TrainingSettings;                                    // Current training settings
  setSettings: React.Dispatch<React.SetStateAction<TrainingSettings>>; // Settings updater
  fitnessHistory: { gen: number; fitness: number }[];            // Fitness data for chart
  currentGen: number;                                             // Current generation number
  bestFitness: number;                                            // Best fitness achieved
  onReset: () => void;                                            // Reset population callback
  onModeChange: (mode: GameMode) => void;                         // Keeping prop for compatibility but effectively unused
  onExportWeights: () => void;                                    // Export weights callback
  onImportWeights: () => void;                                    // Import weights callback
  onScriptRecompile?: () => void;                                 // Recompile custom script callback
}

// =============================================================================
// DASHBOARD COMPONENT
// =============================================================================

const Dashboard: React.FC<DashboardProps> = ({
  settings,
  setSettings,
  fitnessHistory,
  currentGen,
  bestFitness,
  onReset,
  onModeChange,
  onExportWeights,
  onImportWeights,
  onScriptRecompile
}) => {
  // State for custom script editor modal
  const [scriptEditorOpen, setScriptEditorOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  // Handle script save from editor
  const handleScriptSave = useCallback((code: string) => {
    saveScript(code);
    // Trigger recompilation after saving
    if (onScriptRecompile) {
      onScriptRecompile();
    }
  }, [onScriptRecompile]);

  const isTrainingActive = settings.gameMode === 'TRAINING';

  return (
    <>
      {/* Script Editor Modal */}
      <ScriptEditor
        isOpen={scriptEditorOpen}
        onClose={() => setScriptEditorOpen(false)}
        onSave={handleScriptSave}
      />

      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl space-y-6">
        <MatchConfiguration
          settings={settings}
          setSettings={setSettings}
          onOpenScriptEditor={() => setScriptEditorOpen(true)}
          onOpenInfo={() => setInfoModalOpen(true)}
        />

        {/* ================================================================= */}
        {/* ACTION BUTTONS (Start/Reset)                                      */}
        {/* ================================================================= */}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setSettings(s => ({ ...s, isRunning: !s.isRunning }));
            }}
            className={`py-3 px-4 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 ${settings.isRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {settings.isRunning ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                PAUSE
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                START
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold text-slate-200 transition-all border border-slate-600"
          >
            RESET
          </button>
        </div>

        <TrainingParameters
          settings={settings}
          setSettings={setSettings}
          bestFitness={bestFitness}
          onExportWeights={onExportWeights}
          onImportWeights={onImportWeights}
        />

        <FitnessChart
          fitnessHistory={fitnessHistory}
          currentGen={currentGen}
          bestFitness={bestFitness}
          isTrainingActive={isTrainingActive}
        />

        {/* Usage Hint */}
        {isTrainingActive && (
          <p className="text-[10px] text-slate-500 text-center italic">
            Visualizing evolution... Uncheck "EVOLVING" to play manually.
          </p>
        )}

      </div>


    </>
  );
};

export default Dashboard;