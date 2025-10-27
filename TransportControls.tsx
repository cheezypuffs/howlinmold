// components/deck/TransportControls.tsx
import React from 'react';
import type { DeckId, DeckState, Action } from '../../types';
import * as Icons from '../Icons';
import { cn } from '../../utils/cn';

interface TransportControlsProps {
  deckId: DeckId;
  deckState: DeckState;
  dispatch: React.Dispatch<Action>;
}

const NeonButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    isActive?: boolean;
    children: React.ReactNode;
    className?: string;
    ariaLabel: string;
}> = ({ onClick, disabled, isActive, children, className, ariaLabel }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={ariaLabel}
            className={cn(
                "w-full aspect-square rounded-lg flex items-center justify-center font-bold text-lg transition-all duration-150 border active:scale-95 disabled:opacity-30",
                "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600",
                isActive && "bg-purple-600/50 border-purple-500 text-white shadow-[0_0_15px_rgba(157,124,255,0.5)]",
                className
            )}
        >
            {children}
        </button>
    )
};


const TransportControls: React.FC<TransportControlsProps> = ({ deckId, deckState, dispatch }) => {
  const { playing, loaded } = deckState;

  const handlePlayPause = () => loaded && dispatch({ type: 'TOGGLE_PLAY', deckId });
  const handleCue = () => {};
  const handleSync = () => {};
  const handleRev = () => {};

  return (
    <div className="grid grid-cols-2 gap-2 h-full">
        <NeonButton onClick={handlePlayPause} disabled={!loaded} isActive={playing} ariaLabel={playing ? "Pause" : "Play"}>
            {playing ? <Icons.Pause className="w-8 h-8"/> : <Icons.Play className="w-8 h-8"/>}
        </NeonButton>
        <NeonButton onClick={handleCue} disabled={!loaded} ariaLabel="Cue">CUE</NeonButton>
        <NeonButton onClick={handleSync} disabled={!loaded} ariaLabel="Sync">SYNC</NeonButton>
        <NeonButton onClick={handleRev} disabled={!loaded} ariaLabel="Reverse">REV</NeonButton>
    </div>
  );
};

export default TransportControls;