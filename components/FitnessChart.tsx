/**
 * =============================================================================
 * FITNESS CHART - Fitness History Visualization
 * =============================================================================
 * 
 * Displays fitness progression over generations using a line chart.
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GameMode } from '../types';

interface FitnessChartProps {
  fitnessHistory: { gen: number; fitness: number }[];
  currentGen: number;
  bestFitness: number;
  isTrainingActive: boolean;
}

const FitnessChart: React.FC<FitnessChartProps> = ({
  fitnessHistory,
  currentGen,
  bestFitness,
  isTrainingActive
}) => {
  return (
    <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 relative overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase">Fitness / Generation</h3>
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
  );
};

export default FitnessChart;

