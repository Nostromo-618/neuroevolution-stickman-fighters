/**
 * =============================================================================
 * GAME HUD - Heads-Up Display Component
 * =============================================================================
 * 
 * Displays fighter health bars, energy bars, labels, and match timer.
 * Shows different labels based on fighter type (Human, AI, Custom Script).
 */

import React from 'react';
import { Fighter } from '../services/GameEngine';
import { GameState, TrainingSettings, GameMode } from '../types';

interface GameHUDProps {
  activeMatch: { p1: Fighter; p2: Fighter } | null;
  gameState: GameState;
  settings: TrainingSettings;
  currentMatchIndex: number;
}

/**
 * Helper to determine fighter label and visual style
 */
function getFighterInfo(f: Fighter, gameMode: GameMode, generation: number): { label: string; color: string; bar: string } {
  if (f.isCustom) {
    if (f.color === '#a855f7') return { label: 'SCRIPT A', color: 'text-purple-400', bar: 'bg-purple-400' };
    if (f.color === '#14b8a6') return { label: 'SCRIPT B', color: 'text-teal-400', bar: 'bg-teal-400' };
    return { label: 'CUSTOM', color: 'text-purple-400', bar: 'bg-purple-400' };
  }

  if (f.isAi) {
    if (gameMode === 'TRAINING') {
      return { label: `GEN ${generation}`, color: 'text-blue-400', bar: 'bg-blue-500' };
    }
    return { label: 'AI', color: 'text-blue-500', bar: 'bg-blue-500' };
  }
  
  return { label: 'YOU', color: 'text-red-500', bar: 'bg-red-500' };
}

const GameHUD: React.FC<GameHUDProps> = ({ activeMatch, gameState, settings, currentMatchIndex }) => {
  if (!activeMatch) return null;

  const p1 = activeMatch.p1;
  const p2 = activeMatch.p2;

  let leftInfo = getFighterInfo(p1, settings.gameMode, gameState.generation);
  let rightInfo = getFighterInfo(p2, settings.gameMode, gameState.generation);

  // Override for AI vs AI training to show P1/P2
  if (settings.gameMode === 'TRAINING' && !p1.isCustom && !p2.isCustom) {
    leftInfo = { label: 'P1', color: 'text-red-500', bar: 'bg-red-500' };
    rightInfo = { label: 'P2', color: 'text-blue-500', bar: 'bg-blue-500' };
  }

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between text-xl font-bold font-mono z-10 drop-shadow-md pointer-events-none">
      {/* Left Fighter (P1) */}
      <div className="flex flex-col items-start">
        <span className={`${leftInfo.color} font-bold text-xs tracking-wider animate-pulse`}>{leftInfo.label}</span>
        <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
          <div className={`h-full ${leftInfo.bar} transition-all duration-75`} style={{ width: `${gameState.player1Health}%` }}></div>
        </div>
        <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
          <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player1Energy}%` }}></div>
        </div>
      </div>

      {/* Center Info */}
      <div className="flex flex-col items-center pt-2">
        {settings.gameMode === 'TRAINING' ? (
          <>
            <span className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">ROUND {currentMatchIndex + 1}</span>
            <span className="text-slate-300 font-mono text-sm">{gameState.timeRemaining.toFixed(0)}</span>
          </>
        ) : (
          <>
            <span className="text-white font-bold opacity-60 tracking-widest text-xs">VS</span>
            <span className="text-yellow-400 font-mono text-sm">{gameState.timeRemaining.toFixed(0)}</span>
          </>
        )}
      </div>

      {/* Right Fighter (P2) */}
      <div className="flex flex-col items-end">
        <span className={`${rightInfo.color} font-bold text-xs tracking-wider animate-pulse`}>{rightInfo.label}</span>
        <div className="w-32 h-4 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden">
          <div className={`h-full ${rightInfo.bar} transition-all duration-75`} style={{ width: `${gameState.player2Health}%` }}></div>
        </div>
        <div className="w-32 h-2 bg-slate-800 rounded-sm border border-slate-600 overflow-hidden mt-1">
          <div className="h-full bg-amber-400 transition-all duration-75" style={{ width: `${gameState.player2Energy}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;

