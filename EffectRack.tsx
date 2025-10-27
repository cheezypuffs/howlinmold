import React from 'react';
import type { DeckId, Effect, Action } from '../types';
import RotaryKnob from './RotaryKnob';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import PresetManager from './PresetManager';

const availableEffectTypes: Effect['type'][] = ['reverb', 'delay', 'filter', 'distortion', 'bitcrusher', 'chorus', 'flanger', 'phaser'];

const EffectControls: React.FC<{ effect: Effect, deckId: DeckId, dispatch: React.Dispatch<Action> }> = ({ effect, deckId, dispatch }) => {
    const updateParam = (param: string, value: any) => {
        dispatch({ type: 'UPDATE_FX_SLOT_1_PARAM', deckId, param, value });
    };

    switch (effect.type) {
        case 'reverb':
            return <div className="grid grid-cols-3 gap-2"><RotaryKnob label="DRY/WET" size="medium" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="DECAY" size="medium" value={effect.decay} onChange={v => updateParam('decay', v)} min={0.1} max={5} displayValueOverride={`${effect.decay.toFixed(1)}s`} /><RotaryKnob label="ROOM" size="medium" value={effect.roomSize} onChange={v => updateParam('roomSize', v)} min={0} max={1} displayValueOverride={`${(effect.roomSize*100).toFixed(0)}%`} /></div>;
        case 'delay':
            return <div className="grid grid-cols-4 gap-1"><RotaryKnob label="DRY/WET" size="small" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="TIME" size="small" value={effect.time} onChange={v => updateParam('time', v)} min={0.01} max={1} displayValueOverride={`${effect.time.toFixed(2)}s`} /><RotaryKnob label="FEEDBACK" size="small" value={effect.feedback} onChange={v => updateParam('feedback', v)} min={0} max={0.95} displayValueOverride={`${(effect.feedback * 100).toFixed(0)}%`} /><RotaryKnob label="TONE" size="small" value={effect.tone} onChange={v => updateParam('tone', v)} min={200} max={10000} displayValueOverride={`${effect.tone > 1000 ? (effect.tone/1000).toFixed(1)+'k' : effect.tone.toFixed(0)}Hz`} /></div>;
        case 'filter':
            return <div className="grid grid-cols-3 gap-2"><RotaryKnob label="DRY/WET" size="medium" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="FREQ" size="medium" value={effect.frequency} onChange={v => updateParam('frequency', v)} min={20} max={20000} displayValueOverride={`${effect.frequency > 1000 ? (effect.frequency/1000).toFixed(1)+'k' : effect.frequency.toFixed(0)}Hz`} /><RotaryKnob label="Q" size="medium" value={effect.q} onChange={v => updateParam('q', v)} min={0.1} max={20} displayValueOverride={`${effect.q.toFixed(1)}`} /></div>;
        case 'distortion':
            return <div className="grid grid-cols-3 gap-2"><RotaryKnob label="DRY/WET" size="medium" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="DRIVE" size="medium" value={effect.drive} onChange={v => updateParam('drive', v)} min={0} max={1} displayValueOverride={`${(effect.drive * 100).toFixed(0)}%`} /><RotaryKnob label="TONE" size="medium" value={effect.tone} onChange={v => updateParam('tone', v)} min={200} max={12000} displayValueOverride={`${effect.tone > 1000 ? (effect.tone/1000).toFixed(1)+'k' : effect.tone.toFixed(0)}Hz`} /></div>;
        case 'bitcrusher':
            return <div className="grid grid-cols-3 gap-2"><RotaryKnob label="DRY/WET" size="medium" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="DEPTH" size="medium" value={effect.bitDepth} onChange={v => updateParam('bitDepth', v)} min={1} max={16} defaultValue={8} displayValueOverride={`${effect.bitDepth.toFixed(0)} bits`} /><RotaryKnob label="FREQ RED" size="medium" value={effect.frequency} onChange={v => updateParam('frequency', v)} min={0.01} max={1} defaultValue={0.5} displayValueOverride={`${(effect.frequency * 100).toFixed(0)}%`} /></div>;
        case 'chorus':
            return <div className="grid grid-cols-3 gap-2"><RotaryKnob label="DRY/WET" size="medium" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="RATE" size="medium" value={effect.rate} onChange={v => updateParam('rate', v)} min={0.1} max={10} displayValueOverride={`${effect.rate.toFixed(1)}Hz`} /><RotaryKnob label="DEPTH" size="medium" value={effect.depth} onChange={v => updateParam('depth', v)} min={0} max={1} displayValueOverride={`${(effect.depth * 100).toFixed(0)}%`} /></div>;
        case 'flanger':
             return <div className="grid grid-cols-4 gap-1"><RotaryKnob label="DRY/WET" size="small" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="RATE" size="small" value={effect.rate} onChange={v => updateParam('rate', v)} min={0.05} max={5} displayValueOverride={`${effect.rate.toFixed(2)}Hz`} /><RotaryKnob label="DEPTH" size="small" value={effect.depth} onChange={v => updateParam('depth', v)} min={0.001} max={0.02} displayValueOverride={`${(effect.depth*1000).toFixed(1)}ms`} /><RotaryKnob label="FEEDBACK" size="small" value={effect.feedback} onChange={v => updateParam('feedback', v)} min={0} max={0.95} displayValueOverride={`${(effect.feedback * 100).toFixed(0)}%`} /></div>;
        case 'phaser':
            return <div className="grid grid-cols-4 gap-1"><RotaryKnob label="DRY/WET" size="small" value={effect.dryWet} onChange={v => updateParam('dryWet', v)} min={0} max={1} defaultValue={0} displayValueOverride={`${(effect.dryWet * 100).toFixed(0)}%`} /><RotaryKnob label="RATE" size="small" value={effect.rate} onChange={v => updateParam('rate', v)} min={0.1} max={8} displayValueOverride={`${effect.rate.toFixed(1)}Hz`} /><RotaryKnob label="DEPTH" size="small" value={effect.depth} onChange={v => updateParam('depth', v)} min={0} max={1} displayValueOverride={`${(effect.depth*100).toFixed(0)}%`} /><RotaryKnob label="FEEDBACK" size="small" value={effect.feedback} onChange={v => updateParam('feedback', v)} min={0} max={0.95} displayValueOverride={`${(effect.feedback * 100).toFixed(0)}%`} /></div>;
        default:
            return <p className="text-xs text-slate-500">No controls for this effect type.</p>;
    }
};

interface EffectRackProps {
    deckId: DeckId;
    effect: (Effect & { enabled: boolean }) | null;
    dispatch: React.Dispatch<Action>;
    deckColor: string;
}

const EffectRack: React.FC<EffectRackProps> = ({ deckId, effect, dispatch, deckColor }) => {
    const currentEffects = effect ? [effect] : [];

    const handleTypeChange = (value: string) => {
        const effectType = value === 'none' ? null : value as Effect['type'];
        dispatch({ type: 'SET_FX_SLOT_1_TYPE', deckId, effectType });
    };

    return (
        <div className="flex flex-col gap-3 text-center text-xs bg-black/20 p-3 rounded-md min-h-[150px]">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-400 tracking-wider">FX SLOT 1</h4>
                <PresetManager type="deck" deckId={deckId} currentEffects={currentEffects} dispatch={dispatch} />
            </div>

            <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700 min-h-[160px]">
                 <div className="flex justify-between items-center mb-3">
                    <Select onValueChange={handleTypeChange} value={effect?.type || 'none'}>
                        <SelectTrigger className="w-40 bg-slate-800 border-slate-600">
                            <SelectValue placeholder="Select Effect" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={'none'}>- None -</SelectItem>
                            {availableEffectTypes.map(type => (
                                <SelectItem key={type} value={type}><span className="capitalize">{type}</span></SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {effect && (
                        <div className="flex items-center gap-2">
                             <button onClick={() => dispatch({ type: 'TOGGLE_FX_SLOT_1', deckId })} className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border-2 transition-all duration-200 w-16 ${effect.enabled ? 'text-black border-transparent shadow-md' : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'}`} style={effect.enabled ? { backgroundColor: deckColor } : {}}>{effect.enabled ? 'ON' : 'OFF'}</button>
                        </div>
                    )}
                </div>

                {effect && (
                    <div className={!effect.enabled ? 'opacity-40 pointer-events-none' : ''}>
                        <EffectControls effect={effect} deckId={deckId} dispatch={dispatch} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EffectRack;
