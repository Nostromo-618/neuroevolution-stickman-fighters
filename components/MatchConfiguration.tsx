/**
 * =============================================================================
 * MATCH CONFIGURATION - Player Selection Component
 * =============================================================================
 * 
 * Handles player type selection (Human, AI, Custom Scripts) and training mode toggle.
 */

import React from 'react';
import { TrainingSettings, GameMode } from '../types';

interface MatchConfigurationProps {
  settings: TrainingSettings;
  setSettings: React.Dispatch<React.SetStateAction<TrainingSettings>>;
  onOpenScriptEditor: () => void;
  onOpenInfo: () => void;
}

const MatchConfiguration: React.FC<MatchConfigurationProps> = ({
  settings,
  setSettings,
  onOpenScriptEditor,
  onOpenInfo
}) => {
  const isTrainingActive = settings.gameMode === 'TRAINING';

  const toggleTrainingMode = () => {
    const newMode = settings.gameMode === 'ARCADE' ? 'TRAINING' : 'ARCADE';
    setSettings(prev => ({
      ...prev,
      gameMode: newMode,
      isRunning: false
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header & Training Toggle */}
      <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg border border-slate-700/50">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-2">
            Match Setup
          </h2>
          <button
            onClick={onOpenInfo}
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
          onClick={onOpenScriptEditor}
          className="w-full py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">✏️</span> Open Script Editor
        </button>
      )}
    </div>
  );
};

export default MatchConfiguration;

