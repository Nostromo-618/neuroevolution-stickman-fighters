/**
 * =============================================================================
 * CONTROLS HELPER - Keyboard Controls Display
 * =============================================================================
 * 
 * Displays keyboard control mappings for desktop users.
 * Hidden on mobile (touch controls shown instead).
 */

import React from 'react';

const ControlsHelper: React.FC = () => {
  return (
    <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-500">
      <div className="flex flex-col gap-1">
        <span className="text-slate-300 font-bold">MOVE</span>
        <span>WASD / ARROWS</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-slate-300 font-bold">PUNCH</span>
        <span>J / SPACE / Z</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-slate-300 font-bold">KICK</span>
        <span>K / X</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-slate-300 font-bold">BLOCK</span>
        <span>L / C / SHIFT</span>
      </div>
    </div>
  );
};

export default ControlsHelper;

