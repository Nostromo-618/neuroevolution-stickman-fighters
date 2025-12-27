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
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ScriptEditor from './ScriptEditor';
import InfoModal from './InfoModal';
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

  // Local state for toggling training section visibility
  const [showTrainingParams, setShowTrainingParams] = useState(true);

  // Handle script save from editor
  const handleScriptSave = useCallback((code: string) => {
    saveScript(code);
    // Trigger recompilation after saving
    if (onScriptRecompile) {
      onScriptRecompile();
    }
  }, [onScriptRecompile]);

  const toggleTrainingMode = () => {
    // Toggling "Training Mode" effectively switches between single match (Arcade style)
    // and population evolution loop (Training style)
    // We map this to the gameMode setting for now to keep backend logic working
    const newMode = settings.gameMode === 'ARCADE' ? 'TRAINING' : 'ARCADE';
    // We call setSettings directly instead of onModeChange to ensure we control the specific spread
    setSettings(prev => ({
      ...prev,
      gameMode: newMode,
      isRunning: false // Pause on switch
    }));
  };

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

        {/* ================================================================= */}
        {/* MATCH CONFIGURATION (Unified)                                     */}
        {/* Player 1 vs Player 2 Selection                                    */}
        {/* ================================================================= */}

        <div className="space-y-4">

          {/* Header & Training Toggle */}
          <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">
                Match Setup
              </h2>
              <button
                onClick={() => setInfoModalOpen(true)}
                className="w-4 h-4 rounded-full border border-slate-500 text-[10px] flex items-center justify-center text-slate-400 hover:text-white hover:border-white transition-colors"
                title="Game Info & Help"
              >
                i
              </button>
            </div>

            {/* Visual Training Toggle */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${isTrainingActive ? 'text-blue-400' : 'text-slate-500'}`}>
                {isTrainingActive ? 'EVOLVING' : 'SINGLE MATCH'}
              </span>
              <button
                onClick={toggleTrainingMode}
                className={`relative w-8 h-4 rounded-full transition-colors ${isTrainingActive ? 'bg-blue-600' : 'bg-slate-600'}`}
                title={isTrainingActive ? "Switch to Single Match" : "Switch to Population Evolution"}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${isTrainingActive ? 'left-4.5' : 'left-0.5'}`}
                  style={{ left: isTrainingActive ? '18px' : '2px' }}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            {/* Player 1 Selector */}
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex justify-between">
                <span>Player 1 (Left)</span>
                {settings.player1Type !== 'HUMAN' && <span className="text-[8px] bg-red-900/50 px-1 rounded text-red-200">AUTO</span>}
              </h2>
              <div className="flex flex-col gap-1 bg-slate-900 p-1 rounded-lg">
                {(['HUMAN', 'AI', 'CUSTOM_A', 'CUSTOM_B'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSettings(s => ({ ...s, player1Type: type }))}
                    className={`py-1.5 rounded-md text-[10px] font-bold transition-all ${settings.player1Type === type ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {type === 'CUSTOM_A' ? 'SCRIPT A' : type === 'CUSTOM_B' ? 'SCRIPT B' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Player 2 Selector */}
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex justify-between">
                <span>Player 2 (Right)</span>
                <span className="text-[8px] bg-blue-900/50 px-1 rounded text-blue-200">AUTO</span>
              </h2>
              <div className="flex flex-col gap-1 bg-slate-900 p-1 rounded-lg">
                {(['AI', 'CUSTOM_A', 'CUSTOM_B'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSettings(s => ({ ...s, player2Type: type }))}
                    className={`py-1.5 rounded-md text-[10px] font-bold transition-all ${settings.player2Type === type ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {type === 'CUSTOM_A' ? 'SCRIPT A' : type === 'CUSTOM_B' ? 'SCRIPT B' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Script Button (only if scripts selected) */}
          {(settings.player1Type.includes('CUSTOM') || settings.player2Type.includes('CUSTOM') || settings.opponentType.includes('CUSTOM')) && (
            <button
              onClick={() => setScriptEditorOpen(true)}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 group"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">✏️</span> Open Script Editor
            </button>
          )}

        </div>

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

        {/* ================================================================= */}
        {/* TRAINING PARAMETERS (Collapsible)                                 */}
        {/* ================================================================= */}

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

        {/* ================================================================= */}
        {/* FITNESS CHART                                                     */}
        {/* ================================================================= */}

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Fitness / Generation</h3>
            {/* Indicator when playing Normal Match that we are using Best AI */}
            {!isTrainingActive && (
              <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-300 rounded border border-yellow-500/30">Using Best Model</span>
            )}
          </div>

          <div className="w-full" style={{ minHeight: 100 }}>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={fitnessHistory}>
                <XAxis dataKey="gen" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '10px' }}
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <Line type="monotone" dataKey="fitness" stroke="#2dd4bf" strokeWidth={2} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between mt-2 text-xs font-mono text-slate-500">
            <span>Gen: <span className="text-white">{currentGen}</span></span>
            <span>Best: <span className="text-teal-400">{bestFitness.toFixed(0)}</span></span>
          </div>
        </div>

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