// components/Mixer.tsx
import React, { useState } from 'react';
import type { AppState, Action, DeckId } from '../types';
import RotaryKnob from './RotaryKnob';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { cn } from '../utils/cn';
import { useToast } from '../hooks/use-toast';
import { Input } from './ui/input';
import PresetManager from './PresetManager';

const VuMeter: React.FC<{ value: number, segments?: number }> = ({ value, segments = 12 }) => {
    const activeSegments = Math.round(value * segments);
    return (
        <div className="flex flex-col-reverse gap-1 h-full w-full bg-black/30 rounded-full p-1">
            {Array.from({ length: segments }).map((_, i) => {
                const isActive = i < activeSegments;
                let color = 'bg-green-500';
                if (i >= segments * 0.6) color = 'bg-yellow-500';
                if (i >= segments * 0.9) color = 'bg-red-500';
                return (
                    <div
                        key={i}
                        className={cn("flex-1 rounded-full transition-colors", isActive ? color : 'bg-slate-700/50')}
                    />
                );
            })}
        </div>
    );
};

const ChannelStrip: React.FC<{ 
    channelId: number; 
    deckId?: DeckId; 
    state: AppState; 
    dispatch: React.Dispatch<Action>;
}> = ({ channelId, deckId, state, dispatch }) => {
    const deckState = deckId ? state[deckId] : null;
    const isDeckChannel = !!deckState;

    const deckColor = deckId === 'A' ? 'var(--sw-deck-a-color)' : 'var(--sw-deck-b-color)';

    const handleKill = (band: 'low' | 'mid' | 'high') => {
        if (!deckId || !deckState) return;
        const currentValue = deckState.eq[band];
        const newValue = currentValue > -40 ? -48 : 0;
        dispatch({ type: 'SET_EQ', deckId, band, value: newValue });
    };

    return (
        <div className={cn("flex flex-col items-center gap-2 py-3 px-1 border-r border-slate-800/50", !isDeckChannel && "opacity-40")}>
            <p className="text-xs font-bold mb-1" style={{ color: isDeckChannel ? deckColor : 'var(--slate-500)' }}>CH {channelId}</p>
            <RotaryKnob label="GAIN" value={deckState?.gain || 0} onChange={v => deckId && dispatch({type: 'SET_GAIN', deckId, gain: v})} min={0} max={1.5} defaultValue={1} size="small" disabled={!isDeckChannel} />
            <Button size="sm" className="w-full bg-slate-700/50 text-slate-300 hover:bg-slate-600/50" disabled={!isDeckChannel}>CUE</Button>
            <div className="h-24 w-6 my-1"><VuMeter value={deckState?.vu || 0} /></div>
            
            <div className="w-full text-center text-xs text-slate-500 my-1">ISOLATOR</div>
            <div className="flex-grow w-full flex flex-col items-center justify-around gap-1">
                <RotaryKnob label="HIGH" value={deckState?.eq.high || 0} onChange={v => deckId && dispatch({type: 'SET_EQ', deckId, band: 'high', value: v})} min={-48} max={6} defaultValue={0} size="small" disabled={!isDeckChannel}/>
                <Button onClick={() => handleKill('high')} size="sm" className={cn("w-full h-6 text-[10px]", deckState?.eq.high ?? 0 <= -40 ? 'bg-red-600' : 'bg-slate-700/50 hover:bg-red-500/50')} disabled={!isDeckChannel}>KILL</Button>
                
                <RotaryKnob label="MID" value={deckState?.eq.mid || 0} onChange={v => deckId && dispatch({type: 'SET_EQ', deckId, band: 'mid', value: v})} min={-48} max={6} defaultValue={0} size="small" disabled={!isDeckChannel}/>
                <Button onClick={() => handleKill('mid')} size="sm" className={cn("w-full h-6 text-[10px]", deckState?.eq.mid ?? 0 <= -40 ? 'bg-red-600' : 'bg-slate-700/50 hover:bg-red-500/50')} disabled={!isDeckChannel}>KILL</Button>

                <RotaryKnob label="LOW" value={deckState?.eq.low || 0} onChange={v => deckId && dispatch({type: 'SET_EQ', deckId, band: 'low', value: v})} min={-48} max={6} defaultValue={0} size="small" disabled={!isDeckChannel}/>
                <Button onClick={() => handleKill('low')} size="sm" className={cn("w-full h-6 text-[10px]", deckState?.eq.low ?? 0 <= -40 ? 'bg-red-600' : 'bg-slate-700/50 hover:bg-red-500/50')} disabled={!isDeckChannel}>KILL</Button>
            </div>
            <RotaryKnob label="FILTER" value={deckState?.filter || 0} onChange={v => deckId && dispatch({type: 'SET_DECK_VALUE', deckId, key: 'filter', value: v})} min={-1} max={1} defaultValue={0} size="small" disabled={!isDeckChannel}/>
            <RotaryKnob label="PAN" value={deckState?.pan || 0} onChange={v => deckId && dispatch({type: 'SET_PAN', deckId, pan: v})} min={-1} max={1} defaultValue={0} size="small" disabled={!isDeckChannel}/>

            <div className="h-24 w-full pt-2">
                <input type="range" min="0" max="1" step="0.01" value={deckState?.gain || 0} className="fader" disabled={!isDeckChannel} />
            </div>
        </div>
    );
};

interface MixerProps {
    state: AppState;
    dispatch: React.Dispatch<Action>;
}

const Mixer: React.FC<MixerProps> = ({ state, dispatch }) => {
    const { crossfader, masterGain, recording } = state;
    const [recordingTitle, setRecordingTitle] = useState(`Ritual-${new Date().toLocaleDateString()}`);
    const { toast } = useToast();

    const handleRecord = () => {
        if(recording.isRecording) {
            dispatch({ type: 'RECORDING_STOP', payload: { url: '', date: '', title: '', tracklist: [] }}); // Payload is a placeholder, real one created in engine
            toast({ title: 'Recording Stopped', description: 'Your mix has been saved to your session history.' });
        } else {
            dispatch({ type: 'RECORDING_START', title: recordingTitle });
            toast({ title: 'Recording Started', description: `Capturing mix as "${recordingTitle}".` });
        }
    };
    
    return (
        <div className="h-full flex flex-col bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl">
            <div className="flex-grow flex min-h-0">
                {/* Channel Strips */}
                <ChannelStrip channelId={1} deckId="A" state={state} dispatch={dispatch} />
                <ChannelStrip channelId={2} deckId="B" state={state} dispatch={dispatch} />
                <ChannelStrip channelId={3} state={state} dispatch={dispatch} />
                <ChannelStrip channelId={4} state={state} dispatch={dispatch} />
                <ChannelStrip channelId={5} state={state} dispatch={dispatch} />
                <ChannelStrip channelId={6} state={state} dispatch={dispatch} />

                {/* Master Section */}
                <div className="flex flex-col items-center gap-4 p-4">
                    <p className="text-xs font-bold text-slate-500 mb-2">MASTER</p>
                    <div className="h-48 w-12 my-4"><VuMeter value={(state.masterVu[0] + state.masterVu[1]) / 2} segments={20} /></div>
                    <RotaryKnob label="MASTER" value={masterGain} onChange={v => dispatch({type: 'SET_MASTER_GAIN', value: v})} min={0} max={1.5} defaultValue={1} />
                    <div className="space-y-2 w-full mt-4">
                        <Button className="w-full bg-cyan-600/50 text-cyan-200">QUANTIZE</Button>
                        <Button className="w-full bg-cyan-600/50 text-cyan-200">KEY LOCK</Button>
                    </div>
                    <div className="mt-auto space-y-2">
                         <PresetManager type="master" currentEffects={[]} dispatch={dispatch}/>
                        <Button variant="outline" className="w-full">Add Master Effect</Button>
                    </div>
                </div>
            </div>
            {/* Bottom Section: Crossfader & Recorder */}
            <div className="flex-shrink-0 border-t border-slate-800/50 p-4 flex items-center gap-6">
                <div className="flex-grow">
                    <input
                        type="range" min="0" max="1" step="0.01"
                        value={crossfader}
                        onChange={(e) => dispatch({ type: 'SET_CROSSFADER', value: parseFloat(e.target.value) })}
                        className="crossfader w-full"
                    />
                </div>
                <div className="w-64 flex-shrink-0 p-3 bg-black/30 rounded-lg">
                     <p className="text-xs font-bold text-slate-500 mb-2">RECORDER</p>
                     <div className="flex items-center gap-2">
                        <Input 
                            value={recordingTitle}
                            onChange={(e) => setRecordingTitle(e.target.value)}
                            placeholder="Recording Title"
                            className="bg-slate-800 h-8 text-xs"
                            disabled={recording.isRecording}
                        />
                        <Button onClick={handleRecord} variant={recording.isRecording ? 'destructive' : 'default'} size="sm" className="h-8 bg-green-700 hover:bg-green-600">
                           {recording.isRecording ? 'Stop' : 'Rec'}
                        </Button>
                        <div className="font-mono text-sm">00:00</div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default Mixer;
