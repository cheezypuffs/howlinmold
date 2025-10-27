import React from 'react';

interface SetArcVisualizerProps {
  history: { energy: number }[];
  suggestions: { energy: number; reason: string }[];
  currentEnergy: number;
}

const SetArcVisualizer: React.FC<SetArcVisualizerProps> = ({ history, suggestions, currentEnergy }) => {
  const dataPoints = [...history.slice(0, 4).reverse().map(h => h.energy), currentEnergy, ...suggestions.map(s => s.energy)];
  
  const width = 280;
  const height = 80;
  const padding = 10;
  
  if (dataPoints.length < 2) {
    return (
        <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Play a track to begin analyzing the set arc.
        </div>
    );
  }

  const points = dataPoints.map((val, i) => {
    const x = (i / (dataPoints.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - (val * (height - padding * 2));
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="p-2">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 text-center">Set Energy Arc</h4>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4cc9f0" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#4cc9f0" stopOpacity="0" />
                </linearGradient>
                 <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f72585" />
                    <stop offset="50%" stopColor="#b5179e" />
                    <stop offset="100%" stopColor="#4cc9f0" />
                </linearGradient>
            </defs>
            
            {/* Area fill */}
            <polygon points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`} fill="url(#arcGradient)" />
            
            {/* Line */}
            <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {dataPoints.map((val, i) => {
                 const x = (i / (dataPoints.length - 1)) * (width - padding * 2) + padding;
                 const y = height - padding - (val * (height - padding * 2));
                 const isSuggestion = i > history.length;
                 const isCurrent = i === history.length;
                 return (
                     <g key={i}>
                        <circle cx={x} cy={y} r={isCurrent ? 4 : 3} fill={isSuggestion ? '#4cc9f0' : (isCurrent ? 'white' : '#f72585')} stroke={isCurrent ? "black" : "none"} strokeWidth="1" />
                    </g>
                 );
            })}
        </svg>
    </div>
  );
};

export default SetArcVisualizer;
