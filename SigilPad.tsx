import React from 'react';
import type { Sigil } from '../types';
import { cn } from '../utils/cn';

interface SigilPadProps {
    sigil: Sigil | undefined;
    isActive: boolean;
    onClick: () => void;
    bpm: number | null;
}

const typeColors: Record<Sigil['type'], string> = {
    percussion: '#f97316', // orange-500
    bass: '#f43f5e',       // rose-500
    melodic: '#8b5cf6',   // violet-500
    atmos: '#0ea5e9',      // sky-500
};

const SigilPad: React.FC<SigilPadProps> = ({ sigil, isActive, onClick, bpm }) => {
    const animationDuration = bpm ? `${(60 / bpm) * 4}s` : '2s';

    if (!sigil) {
        return (
            <div className="h-16 rounded-lg bg-slate-800/50 border border-slate-700/50 opacity-50" />
        );
    }

    const color = typeColors[sigil.type];

    return (
        <button
            onClick={onClick}
            className={cn(
                'h-16 rounded-lg transition-all duration-150 border relative flex items-center justify-center',
                isActive
                    ? 'bg-opacity-80 shadow-lg border-2 border-opacity-100'
                    : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-700/50'
            )}
            style={isActive ? { backgroundColor: `${color}40`, borderColor: color } : {}}
        >
            <style>{`
                @keyframes sigil-pulse {
                    0% { stroke-dashoffset: 200; }
                    50% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: -200; }
                }
                .animate-sigil-pulse {
                    animation: sigil-pulse linear infinite;
                }
            `}</style>
            <svg viewBox="0 0 100 100" className="w-12 h-12 absolute opacity-70">
                <path
                    d={sigil.svgPath}
                    stroke={color}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    className={isActive ? 'animate-sigil-pulse' : ''}
                    style={{ 
                        strokeDasharray: 100,
                        animationDuration: animationDuration,
                    }}
                />
            </svg>
            <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-black/50 text-white capitalize">{sigil.type}</span>
        </button>
    );
};

export default SigilPad;