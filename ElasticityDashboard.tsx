import React, { memo } from 'react';
import type { SessionMetrics } from '../types';

interface ElasticityDashboardProps {
  sessionMetrics: SessionMetrics;
  onManualScale: (direction: 'up' | 'down', magnitude: number) => void;
  onEmergencyScale: () => void;
}

const ElasticityDashboard: React.FC<ElasticityDashboardProps> = memo(({ 
  sessionMetrics, 
  onManualScale, 
  onEmergencyScale 
}) => (
  <div className="elasticity-dashboard bg-slate-900/50 rounded-2xl p-6 h-full flex flex-col items-center justify-center">
    <h2 className="text-2xl font-bold mb-6 text-indigo-400">Elasticity Engine</h2>
    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
      <div className="bg-slate-800/50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-2">CPU Usage</h3>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(sessionMetrics?.cpuUsage || 0) * 100}%` }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-1">{Math.round((sessionMetrics?.cpuUsage || 0) * 100)}%</p>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-2">Memory</h3>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(sessionMetrics?.memoryUsage || 0) * 100}%` }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-1">{Math.round((sessionMetrics?.memoryUsage || 0) * 100)}%</p>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-2">Network</h3>
        <p className="text-2xl font-bold text-cyan-400">{sessionMetrics?.networkLatency || 0}ms</p>
      </div>
    </div>
    <div className="flex gap-4 mt-6">
      <button 
        onClick={() => onManualScale('up', 1.5)}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        Scale Up
      </button>
      <button 
        onClick={() => onManualScale('down', 0.7)}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
      >
        Scale Down
      </button>
      <button 
        onClick={onEmergencyScale}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        Emergency Scale
      </button>
    </div>
  </div>
));

export default ElasticityDashboard;