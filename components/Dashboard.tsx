/**
 * =============================================================================
 * DASHBOARD - Training Control Panel
 * =============================================================================
 * 
 * This component provides the UI for controlling training parameters,
 * viewing fitness progress, and managing AI weights.
 * 
 * FEATURES:
 * - Mode switching (Training vs Arcade)
 * - Training parameter controls (speed, mutation rate)
 * - Fitness history chart
 * - Play/Pause/Reset controls
 * - Export/Import AI weights
 * - Background training toggle
 * - Control reference for arcade mode
 * 
 * RECHARTS INTEGRATION:
 * Uses the Recharts library for rendering the fitness history graph.
 * The chart displays the best fitness per generation over time.
 * 
 * =============================================================================
 */

import React, { useState, useCallback } from 'react';
import { TrainingSettings, GameMode } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ScriptEditor from './ScriptEditor';
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
  onModeChange: (mode: GameMode) => void;                         // Mode switch callback
  onExportWeights: () => void;                                    // Export weights callback
  onImportWeights: () => void;                                    // Import weights callback
}

// =============================================================================
// DASHBOARD COMPONENT
// =============================================================================

/**
 * Dashboard - Training controls and statistics panel
 * 
 * Positioned on the right side of the UI, this panel gives users control
 * over the training process and displays real-time statistics.
 */
const Dashboard: React.FC<DashboardProps> = ({
  settings,
  setSettings,
  fitnessHistory,
  currentGen,
  bestFitness,
  onReset,
  onModeChange,
  onExportWeights,
  onImportWeights
}) => {
  // State for custom script editor modal
  const [scriptEditorOpen, setScriptEditorOpen] = useState(false);

  // Handle script save from editor
  const handleScriptSave = useCallback((code: string) => {
    saveScript(code);
  }, []);

  return (
    <>
      {/* Script Editor Modal */}
      <ScriptEditor
        isOpen={scriptEditorOpen}
        onClose={() => setScriptEditorOpen(false)}
        onSave={handleScriptSave}
      />
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl space-y-6">

        {/* ================================================================= */}
        {/* MODE SWITCHER                                                     */}
        {/* Toggle between Training and Arcade modes                          */}
        {/* ================================================================= */}

        <div className="flex bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => onModeChange('TRAINING')}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${settings.gameMode === 'TRAINING' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            TRAIN AI
          </button>
          <button
            onClick={() => onModeChange('ARCADE')}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${settings.gameMode === 'ARCADE' ? 'bg-teal-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            PLAY VS AI
          </button>
        </div>

        {/* ================================================================= */}
        {/* OPPONENT TYPE SELECTOR                                           */}
        {/* Toggle between fighting Neural Network AI, Scripted, or Custom   */}
        {/* ================================================================= */}

        <div className="space-y-2">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Opponent Type</h2>
          <div className="flex bg-slate-900 p-1 rounded-lg">
            <button
              onClick={() => setSettings(s => ({ ...s, opponentType: 'AI' }))}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${settings.opponentType === 'AI' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Neural AI
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, opponentType: 'SCRIPTED' }))}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${settings.opponentType === 'SCRIPTED' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Scripted
            </button>
            <button
              onClick={() => setSettings(s => ({ ...s, opponentType: 'CUSTOM' }))}
              className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${settings.opponentType === 'CUSTOM' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              ✏️ Custom
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            {settings.opponentType === 'AI'
              ? 'Fight against the trained neural network'
              : settings.opponentType === 'SCRIPTED'
                ? 'Fight against default scripted logic'
                : 'Fight against your custom JavaScript fighter'}
          </p>

          {/* Edit Script Button - only visible when Custom is selected */}
          {settings.opponentType === 'CUSTOM' && (
            <button
              onClick={() => setScriptEditorOpen(true)}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Edit Script
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* TRAINING PARAMETERS                                               */}
        {/* Only visible/enabled in Training mode                             */}
        {/* ================================================================= */}

        <div className={`transition-opacity duration-300 ${settings.gameMode === 'TRAINING' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Training Parameters</h2>
          <div className="grid grid-cols-1 gap-4">

            {/* --- Simulation Speed Slider --- */}
            {/* Controls how many physics steps run per frame */}
            {/* Higher = faster training, but less smooth visuals */}
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

            {/* --- Mutation Rate Slider --- */}
            {/* Controls probability of weight mutations during evolution */}
            {/* Higher = more exploration, Lower = more exploitation */}
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

          </div>
        </div>

        {/* ================================================================= */}
        {/* FITNESS CHART                                                     */}
        {/* Shows best fitness per generation over time                       */}
        {/* Uses Recharts LineChart for visualization                         */}
        {/* ================================================================= */}

        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Fitness / Generation</h3>

            {/* Indicator when in Arcade mode that AI is static */}
            {settings.gameMode === 'ARCADE' && (
              <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded border border-yellow-500/50">Using Best AI Model</span>
            )}
          </div>

          {/* Recharts ResponsiveContainer for auto-sizing */}
          <div className="w-full" style={{ minHeight: 128 }}>
            <ResponsiveContainer width="100%" height={128}>
              <LineChart data={fitnessHistory}>
                {/* Hide axes for cleaner look */}
                <XAxis dataKey="gen" hide />
                <YAxis hide domain={['auto', 'auto']} />

                {/* Tooltip with custom dark styling */}
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#2dd4bf' }}
                />

                {/* Fitness line */}
                <Line type="monotone" dataKey="fitness" stroke="#2dd4bf" strokeWidth={2} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats summary below chart */}
          <div className="flex justify-between mt-2 text-xs font-mono text-slate-500">
            <span>Gen: <span className="text-white">{currentGen}</span></span>
            <span>Best: <span className="text-teal-400">{bestFitness.toFixed(0)}</span></span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* ACTION BUTTONS                                                    */}
        {/* ================================================================= */}

        <div className="space-y-3">

          {/* --- Play/Pause and Reset --- */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSettings(s => ({ ...s, isRunning: !s.isRunning }))}
              className={`py-3 px-4 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 ${settings.isRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {settings.isRunning ? (
                <>
                  {/* Pause icon */}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  PAUSE
                </>
              ) : (
                <>
                  {/* Play icon */}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  RESUME
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

          {/* --- Export/Import Weights --- */}
          {/* Allows saving and loading trained AI */}
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Weights Management</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onExportWeights}
                disabled={bestFitness === 0}
                className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-all border border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                title="Export best AI weights to JSON file"
              >
                {/* Download icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                EXPORT
              </button>
              <button
                onClick={onImportWeights}
                className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-all border border-slate-600 flex items-center justify-center gap-1.5"
                title="Import AI weights from JSON file"
              >
                {/* Upload icon */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                IMPORT
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center">
              Save/load trained AI weights
            </p>
          </div>

          {/* ================================================================= */}
          {/* ARCADE MODE EXTRAS                                               */}
          {/* Only visible when in Arcade mode                                 */}
          {/* ================================================================= */}

          {settings.gameMode === 'ARCADE' && (
            <>
              {/* --- Background Training Toggle --- */}
              {/* Allows AI to keep learning while human plays */}
              <div className="border-t border-slate-700 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-300">Background Training</span>
                    {settings.backgroundTraining && (
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Training active" />
                    )}
                  </div>
                  {/* Toggle switch */}
                  <button
                    onClick={() => setSettings(s => ({ ...s, backgroundTraining: !s.backgroundTraining }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${settings.backgroundTraining ? 'bg-green-600' : 'bg-slate-600'}`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.backgroundTraining ? 'left-7' : 'left-1'}`}
                    />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  AI keeps learning while you play
                </p>
              </div>

              {/* --- Controls Reference --- */}
              {/* Quick reference for game controls */}
              <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
                <p className="font-bold text-teal-500 mb-1">🎮 CONTROLS</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <span>MOVE: Arrows / D-Pad</span>
                  <span>JUMP: Space / A</span>
                  <span>PUNCH: J / X</span>
                  <span>KICK: K / B</span>
                  <span>BLOCK: L / RB</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;