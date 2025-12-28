/**
 * =============================================================================
 * IMPORT MODAL - Genome Import Confirmation Dialog
 * =============================================================================
 * 
 * Modal dialog that appears when user imports genome weights.
 * Shows generation and fitness info, allows user to confirm or cancel.
 */

import React from 'react';
import { Genome } from '../types';

interface ImportModalProps {
  pendingImport: { genome: Genome; generation: number } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ pendingImport, onConfirm, onCancel }) => {
  if (!pendingImport) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-teal-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-teal-500/10">
        <h3 className="text-2xl font-bold text-teal-400 mb-2">Import Weights</h3>
        <div className="bg-slate-800/50 rounded-lg p-3 mb-4 text-sm font-mono">
          <span className="text-slate-400">Generation:</span> <span className="text-teal-300">{pendingImport.generation}</span>
          <span className="mx-2 text-slate-600">|</span>
          <span className="text-slate-400">Fitness:</span> <span className="text-teal-300">{pendingImport.genome.fitness.toFixed(0)}</span>
        </div>
        <p className="text-slate-400 mb-6 leading-relaxed text-sm">
          This will inject the weights into training and continue from Generation {pendingImport.generation}.
        </p>
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all active:scale-95"
          >
            Continue Training (Gen {pendingImport.generation})
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;

