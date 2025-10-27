// components/Isolator.tsx
import React from 'react';
import type { DeckId, DeckState, Action } from '../types';
import { cn } from '../utils/cn';

interface IsolatorProps {
    deckId: DeckId;
    state: DeckState;
    dispatch: React.Dispatch<Action>;
    deckColor: string;
}

const Isolator: React.FC<IsolatorProps> = ({ deckId, state, dispatch, deckColor }) => {
    const { eq } = state;

    const handleGainChange = (band: 'low' | 'mid' | 'high', value: number) => {
        dispatch({ type: 'SET_EQ', deckId, band, value });
    };

    const handleKill = (band: 'low' | 'mid' | 'high') => {
        const currentValue = eq[band];
        // Toggle kill: if it's at a normal level, kill it. If it's killed, restore it to 0dB.
        const newValue = currentValue > -40 ? -48 : 0;
        dispatch({ type: 'SET_EQ', deckId, band, value: newValue });
    };

    const bands: ('low' | 'mid' | 'high')[] = ['low', 'mid', 'high'];

    return (
        <div className="isolator-eq flex justify-around gap-4 p-4 bg-black/20 rounded-lg">
            {bands.map(band => {
                const isKilled = eq[band] <= -40;
                return (
                    <div key={band} className="flex flex-col items-center gap-2">
                        <div className="h-32 w-10">
                            <input
                                type="range"
                                min={-48} max={6} step="0.1"
                                value={eq[band]}
                                onChange={(e) => handleGainChange(band, parseFloat(e.target.value))}
                                className="isolator-fader"
                            />
                        </div>
                        <button
                            onClick={() => handleKill(band)}
                            className={cn(
                                "w-12 h-10 rounded-md text-xs font-bold transition-all border",
                                isKilled
                                    ? 'bg-red-500 border-red-400 text-white shadow-md'
                                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50'
                            )}
                        >
                            {band.toUpperCase()}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default Isolator;
