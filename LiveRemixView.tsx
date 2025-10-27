// components/deck/LiveRemixView.tsx
import React from 'react';
import type { DeckId, DeckState, Action, StemType } from '../../types';
import { Button } from '../ui/button';
import * as Icons from '../Icons';
import { Progress } from '../ui/progress';
import RotaryKnob from '../RotaryKnob';
import WaveformPreview from '../WaveformPreview';
import { cn } from '../../utils/cn';

const Fader: React.FC<{ value: number, onChange: (v: number) => void, disabled?: boolean }> = ({ value, onChange, disabled }) => {
    return (
        <div className={cn("relative w-full h-full flex justify-center items-center", disabled && "opacity-40")}>
            <input
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                disabled={disabled}
                className="fader appearance-none bg-transparent w-full h-full"
                style={{ writingMode: 'bt-lr' } as any}
            />
        </div>
    );
};

const StemChannel: React.FC<{
    stemType: StemType;
    state: DeckState;
    deckId: DeckId;
    dispatch: React.Dispatch<Action>;
    color: string;
}> = ({ stemType, state, deckId, dispatch, color }) => {
    const channelState = state.stemMixer.channels[stemType];
    const buffer = state.stems[stemType];

    const updateParam = (param: keyof typeof channelState, value: any) => {
        dispatch({ type: 'SET_STEM_MIXER_PARAM', deckId, stem: stemType, param, value });
    };
    
    return (
        <div className="flex flex-col items-center gap-2 p-2 bg-black/20 rounded-lg h-full">
            <div className="h-16 w-full rounded-md overflow-hidden bg-black/30">
                <WaveformPreview audioBuffer={buffer} color={color} />
            </div>
            <div className="h-48 w-12 py-2 flex-grow">
                <Fader value={channelState.gain} onChange={v => updateParam('gain', v)} />
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    onClick={() => updateParam('mute', !channelState.mute)} 
                    className={cn("w-10 h-10 font-bold", channelState.mute ? "bg-red-600" : "bg-slate-600")}
                >M</Button>
                <Button 
                    onClick={() => updateParam('solo', !channelState.solo)} 
                    className={cn("w-10 h-10 font-bold", channelState.solo ? "bg-yellow-500 text-black" : "bg-slate-600")}
                >S</Button>
            </div>
            <RotaryKnob 
                label="FILTER" 
                value={channelState.filter} 
                onChange={v => updateParam('filter', v)}
                min={-1} max={1} defaultValue={0} size="small" 
                glowColor={color}
            />
            <span className="text-xs uppercase font-bold text-slate-400">{stemType}</span>
        </div>
    );
};

const LiveRemixView: React.FC<{ deckId: DeckId; state: DeckState; dispatch: React.Dispatch<Action> }> = ({ deckId, state, dispatch }) => {
    const { status, progress, message } = state.stemSeparation;

    if (status !== 'complete') {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
                <h3 className="text-xl font-bold text-center text-purple-300">Live Remix Mode</h3>
                {status === 'processing' ? (
                    <div className="w-full max-w-sm text-center">
                        <Progress value={progress} className="h-3 mb-2" />
                        <p className="text-sm text-purple-300 animate-pulse">{message}</p>
                    </div>
                ) : status === 'error' ? (
                    <div className="text-center">
                        <p className="text-red-400 mb-4">{message}</p>
                        <Button onClick={() => dispatch({ type: 'STEM_SEPARATION_START', deckId })} variant="destructive">
                            Retry Separation
                        </Button>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-slate-400 mb-4">Separate the track into its core components for real-time mixing.</p>
                        <Button onClick={() => dispatch({ type: 'STEM_SEPARATION_START', deckId })} size="lg">
                            <Icons.Zap className="w-5 h-5 mr-2" />
                            Separate Stems
                        </Button>
                    </div>
                )}
            </div>
        );
    }
    
    const stemColors: Record<StemType, string> = {
        vocals: '#ec4899', // pink-500
        bass: '#f97316',   // orange-500
        drums: '#fde047',  // yellow-400
        other: '#3b82f6',  // blue-600
    };

    return (
        <div className="grid grid-cols-4 gap-4 p-2 h-full">
            {(['vocals', 'bass', 'drums', 'other'] as StemType[]).map(stem => (
                <StemChannel 
                    key={stem}
                    stemType={stem}
                    state={state}
                    deckId={deckId}
                    dispatch={dispatch}
                    color={stemColors[stem]}
                />
            ))}
        </div>
    );
};

export default LiveRemixView;
