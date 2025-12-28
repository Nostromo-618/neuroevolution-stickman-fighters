/**
 * =============================================================================
 * GAME ARENA - Canvas and HUD Wrapper Component
 * =============================================================================
 * 
 * Wraps the game canvas, HUD overlay, and game over overlay.
 */

import React from 'react';
import { Fighter } from '../services/GameEngine';
import { GameState, TrainingSettings } from '../types';
import GameCanvas from './GameCanvas';
import GameHUD from './GameHUD';

interface GameArenaProps {
  activeMatch: { p1: Fighter; p2: Fighter; p1GenomeIdx: number; p2GenomeIdx: number } | null;
  gameState: GameState;
  settings: TrainingSettings;
  currentMatchIndex: number;
}

const GameArena: React.FC<GameArenaProps> = ({
  activeMatch,
  gameState,
  settings,
  currentMatchIndex
}) => {
  return (
    <div className="relative group">
      <GameHUD
        activeMatch={activeMatch}
        gameState={gameState}
        settings={settings}
        currentMatchIndex={currentMatchIndex}
      />

      {activeMatch ? (
        <GameCanvas
          player1={activeMatch.p1}
          player2={activeMatch.p2}
          isTraining={settings.gameMode === 'TRAINING'}
          roundNumber={currentMatchIndex}
        />
      ) : (
        <div className="w-full h-[450px] flex items-center justify-center bg-slate-900 rounded-xl border border-slate-700">
          <span className="text-slate-400 font-mono">Initializing Arena...</span>
        </div>
      )}

      {/* Game Over Overlays */}
      {!gameState.matchActive && gameState.roundStatus === 'FIGHTING' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="text-center">
            <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2">
              {gameState.winner === 'Player 1' ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <p className="text-slate-400 font-mono">RESTARTING MATCH...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameArena;

