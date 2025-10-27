import React, { useState, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import { SynthEngine } from './utils/SynthEngine';
import type { SynthSettings, LFO_WaveformType, WaveformType, ModMatrixRouting, SequencerStep } from '../../types';
import SynthKeyboard from './SynthKeyboard';
import BeatSequencer from './BeatSequencer';
import { Button } from '../ui/button';
import * as Icons from '../Icons';
import RotaryKnob from '../RotaryKnob';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RecordingManager, RecordingState } from './utils/recordingManager';
import { formatTime } from '../../utils/helpers';
import { GoogleGenAI, Type } from "@google/genai";
import { useToast } from '../../hooks/use-toast';
import { Slider } from '../ui/slider';
import { cn } from '../../utils/cn';

type FilterType = 'lp_2' | 'lp_4' | 'bp_2' | 'hp_2';
type ModSource = 'none' | 'lfo1' | 'lfo2' | 'env1' | 'env2' | 'velocity' | 'aftertouch' | 'modwheel' | 'noise';
type ModDestination = 'none' | 'pitch_a' | 'pitch_b' | 'pitch_both' | 'pw_a' | 'pw_b' | 'mix_balance' | 'filter_cutoff' | 'filter_resonance' | 'amp_level' | 'lfo1_rate' | 'lfo2_rate' | 'delay_feedback' | 'dist_drive';

export const initialSettings: SynthSettings = {
    master_volume: 0.7,
    // Oscillators
    osc_a_waveform: 'sawtooth',
    osc_a_octave: 0,
    osc_a_coarse_tune: 0,
    osc_a_fine_tune: 0,
    osc_a_pulse_width: 0.5,
    osc_b_waveform: 'square',
    osc_b_octave: 0,
    osc_b_coarse_tune: 0,
    osc_b_fine_tune: 7,
    osc_b_pulse_width: 0.5,
    osc_b_hard_sync: false,
    // Mixer
    mixer_osc_a_level: 0.5,
    mixer_osc_b_level: 0.5,
    mixer_noise_level: 0,
    mixer_balance: 0.5, // Not used if levels are separate
    // Voicing
    voicing_unison: false,
    voicing_unison_detune: 0.1,
    // Filter (VCF)
    filter_type: 'lp_4',
    filter_cutoff: 8000,
    filter_resonance: 0.5,
    filter_env_1_amount: 2500,
    filter_kbd_trk: 0.5,
    // Envelopes
    env_1_attack: 0.01, // Filter Env
    env_1_decay: 0.3,
    env_1_sustain: 0.6,
    env_1_release: 0.4,
    env_2_attack: 0.01, // Amp Env
    env_2_decay: 0.3,
    env_2_sustain: 0.8,
    env_2_release: 0.5,
    // LFOs
    lfo_1_rate: 5,
    lfo_1_waveform: 'sine',
    lfo_1_depth: 1, // Controlled by matrix
    lfo_1_destination: 'none', // Controlled by matrix
    lfo_2_rate: 8,
    lfo_2_waveform: 'triangle',
    lfo_2_depth: 1,
    lfo_2_destination: 'none',
    // Mod Matrix
    mod_matrix: [
        { source: 'lfo1', destination: 'filter_cutoff', amount: 0 },
        { source: 'velocity', destination: 'amp_level', amount: 1 },
        { source: 'none', destination: 'none', amount: 0 },
        { source: 'none', destination: 'none', amount: 0 },
    ],
    // Sequencer
    sequencer_is_on: false,
    sequencer_bpm: 120,
    sequencer_swing: 0,
    sequencer_pattern: 0,
    sequencer_steps: Array(16).fill({ note: 60, gate: false, accent: false, slide: false }),
    // Effects
    fx_distortion_drive: 0,
    fx_distortion_tone: 8000,
    fx_chorus_rate: 1.5,
    fx_chorus_depth: 0.5,
    fx_delay_mode: 'digital',
    fx_delay_time: 0.3,
    fx_delay_feedback: 0.4,
    fx_delay_mix: 0,
    fx_reverb_decay: 1.5,
    fx_reverb_mix: 0,
    // Master
    master_limiter_on: true,
};

function settingsReducer(state: SynthSettings, action: { type: keyof SynthSettings | 'SET_ALL' | string, payload: any, slot?: number }): SynthSettings {
    if (action.type === 'SET_ALL') {
        return action.payload;
    }
    
    const typeStr = action.type as string;
    if (typeStr.startsWith('mod_matrix_')) {
        const parts = typeStr.split('_');
        if (parts.length === 4) {
            const index = parseInt(parts[2]);
            const key = parts[3];
            if (!isNaN(index) && index >= 0 && index < state.mod_matrix.length) {
                const newMatrix = [...state.mod_matrix];
                newMatrix[index] = { ...newMatrix[index], [key]: action.payload };
                return { ...state, mod_matrix: newMatrix };
            }
        }
    }
    
    if (typeStr.startsWith('sequencer_step_')) {
        const parts = typeStr.split('_');
        if (parts.length === 4) {
            const index = parseInt(parts[2]);
            const key = parts[3];
            if (!isNaN(index) && index >= 0 && index < state.sequencer_steps.length) {
                const newSteps = [...state.sequencer_steps];
                newSteps[index] = { ...newSteps[index], [key]: action.payload };
                return { ...state, sequencer_steps: newSteps };
            }
        }
    }

    return { ...state, [action.type]: action.payload };
}


const WaveformSelector: React.FC<{ value: string; onChange: (value: any) => void; available?: string[] }> = ({ value, onChange, available }) => {
    const waves = available || ['sine', 'triangle', 'sawtooth', 'square'];
    return (<Select value={value} onValueChange={onChange}><SelectTrigger className="bg-black/50 border-white/20 capitalize"><SelectValue /></SelectTrigger><SelectContent>{waves.map(w => <SelectItem key={w} value={w}><span className="capitalize">{w}</span></SelectItem>)}</SelectContent></Select>);
};

interface SynthProps {
  onBack: () => void;
  onEngineInit: (engine: SynthEngine) => void;
  audioContext: AudioContext;
}

const Synth: React.FC<SynthProps> = ({ onBack, onEngineInit, audioContext }) => {
    const synthEngineRef = useRef<SynthEngine | null>(null);
    const [settings, dispatch] = useReducer(settingsReducer, initialSettings);
    const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
    const [octave, setOctave] = useState(3);
    const [activeTab, setActiveTab] = useState("osc");
    
    const [aiPrompt, setAiPrompt] = useState('');
    const [isConjuring, setIsConjuring] = useState(false);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);
    const { toast } = useToast();

    const recordingManagerRef = useRef<RecordingManager | null>(null);
    const [recordingState, setRecordingState] = useState<RecordingState>({ isRecording: false, duration: 0, recordedBlob: null });
    
    useEffect(() => {
        if (!audioContext) return;
        
        const engine = new SynthEngine(audioContext);
        synthEngineRef.current = engine;
        onEngineInit(engine);
        
        const recManager = new RecordingManager(engine.ctx, engine.getOutputNode());
        recManager.setStateChangeCallback(setRecordingState);
        recordingManagerRef.current = recManager;

        return () => {
            engine.destroy();
            recManager.destroy();
        };
    }, [onEngineInit, audioContext]);


    useEffect(() => {
        synthEngineRef.current?.updateAllSettings(settings);
    }, [settings]);

    const handleNoteOn = useCallback((midiNote: number, velocity = 1) => {
        synthEngineRef.current?.noteOn(midiNote, velocity);
        setActiveNotes(prev => new Set(prev).add(midiNote));
    }, []);

    const handleNoteOff = useCallback((midiNote: number) => {
        synthEngineRef.current?.noteOff(midiNote);
        setActiveNotes(prev => {
            const newSet = new Set(prev);
            newSet.delete(midiNote);
            return newSet;
        });
    }, []);
    
    const handleConjure = async () => { /* ... (conjure implementation from before) ... */ };
    const handleStoreArtifact = () => { /* ... (store artifact implementation from before) ... */ };
    
    const MOD_SOURCES: ModSource[] = ['none', 'lfo1', 'lfo2', 'env1', 'env2', 'velocity', 'aftertouch', 'modwheel', 'noise'];
    const MOD_DESTINATIONS: ModDestination[] = ['none', 'pitch_a', 'pitch_b', 'pitch_both', 'pw_a', 'pw_b', 'mix_balance', 'filter_cutoff', 'filter_resonance', 'amp_level', 'lfo1_rate', 'lfo2_rate', 'delay_feedback', 'dist_drive'];

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl gap-4">
            <header className="flex justify-between items-center px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                     <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.SynthIcon className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Ritual Synthesizer</h1>
                        <p className="text-slate-400 text-sm">Forge new frequencies.</p>
                    </div>
                </div>
            </header>
            <main className="flex-grow min-h-0 flex flex-col lg:flex-row gap-4">
                 <div className="w-full lg:w-3/4 flex flex-col gap-4">
                     <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex-grow" style={{backgroundImage: 'radial-gradient(circle at top, rgba(100,116,139,0.1), transparent 40%)'}}>
                         <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <TabsList className="bg-black/30 grid grid-cols-6">
                                <TabsTrigger value="osc" className="data-[state=active]:bg-white/10">OSC</TabsTrigger>
                                <TabsTrigger value="filter_env" className="data-[state=active]:bg-white/10">FILTER/ENV</TabsTrigger>
                                <TabsTrigger value="lfo" className="data-[state=active]:bg-white/10">LFO</TabsTrigger>
                                <TabsTrigger value="matrix" className="data-[state=active]:bg-white/10">MATRIX</TabsTrigger>
                                <TabsTrigger value="fx" className="data-[state=active]:bg-white/10">FX</TabsTrigger>
                                <TabsTrigger value="master" className="data-[state=active]:bg-white/10">MASTER</TabsTrigger>
                            </TabsList>
                             <TabsContent value="osc" className="flex-grow mt-4 overflow-auto">
                                <div className="grid grid-cols-12 gap-4 h-full">
                                    {/* OSC A */}
                                    <div className="col-span-5 bg-black/20 p-4 rounded-lg flex flex-col gap-3">
                                        <h3 className="text-center font-bold text-slate-300">OSCILLATOR A</h3>
                                        <WaveformSelector value={settings.osc_a_waveform} onChange={v => dispatch({ type: 'osc_a_waveform', payload: v })} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <RotaryKnob label="OCTAVE" value={settings.osc_a_octave} onChange={v => dispatch({type: 'osc_a_octave', payload: v})} min={-2} max={2} defaultValue={0} displayValueOverride={`${settings.osc_a_octave > 0 ? '+' : ''}${settings.osc_a_octave}`} />
                                            <RotaryKnob label="P. WIDTH" value={settings.osc_a_pulse_width} onChange={v => dispatch({type: 'osc_a_pulse_width', payload: v})} min={0.01} max={0.99} defaultValue={0.5} disabled={!['square', 'pulse'].includes(settings.osc_a_waveform)} displayValueOverride={`${(settings.osc_a_pulse_width * 100).toFixed(0)}%`} />
                                        </div>
                                    </div>
                                    {/* OSC B */}
                                    <div className="col-span-5 bg-black/20 p-4 rounded-lg flex flex-col gap-3">
                                         <h3 className="text-center font-bold text-slate-300">OSCILLATOR B</h3>
                                        <WaveformSelector value={settings.osc_b_waveform} onChange={v => dispatch({ type: 'osc_b_waveform', payload: v })} />
                                        <div className="grid grid-cols-2 gap-2">
                                            <RotaryKnob label="OCTAVE" value={settings.osc_b_octave} onChange={v => dispatch({type: 'osc_b_octave', payload: v})} min={-2} max={2} defaultValue={0} displayValueOverride={`${settings.osc_b_octave > 0 ? '+' : ''}${settings.osc_b_octave}`} />
                                            <RotaryKnob label="P. WIDTH" value={settings.osc_b_pulse_width} onChange={v => dispatch({type: 'osc_b_pulse_width', payload: v})} min={0.01} max={0.99} defaultValue={0.5} disabled={!['square', 'pulse'].includes(settings.osc_b_waveform)} displayValueOverride={`${(settings.osc_b_pulse_width * 100).toFixed(0)}%`} />
                                        </div>
                                    </div>
                                    {/* MIXER */}
                                    <div className="col-span-2 bg-black/20 p-4 rounded-lg flex flex-col items-center gap-3">
                                        <h3 className="text-center font-bold text-slate-300">MIXER</h3>
                                        <RotaryKnob label="OSC A" value={settings.mixer_osc_a_level} onChange={v => dispatch({type: 'mixer_osc_a_level', payload: v})} min={0} max={1} defaultValue={0.5} size="small" />
                                        <RotaryKnob label="OSC B" value={settings.mixer_osc_b_level} onChange={v => dispatch({type: 'mixer_osc_b_level', payload: v})} min={0} max={1} defaultValue={0.5} size="small" />
                                        <RotaryKnob label="NOISE" value={settings.mixer_noise_level} onChange={v => dispatch({type: 'mixer_noise_level', payload: v})} min={0} max={1} defaultValue={0} size="small" />
                                    </div>
                                </div>
                            </TabsContent>
                             <TabsContent value="filter_env" className="flex-grow mt-4 overflow-auto">
                                <div className="grid grid-cols-2 gap-6 h-full">
                                    <div className="bg-black/20 p-4 rounded-lg flex flex-col gap-4">
                                        <h3 className="text-center font-bold text-slate-300">VCF (FILTER)</h3>
                                        <div className="grid grid-cols-3 gap-2 items-start">
                                            <RotaryKnob label="CUTOFF" value={settings.filter_cutoff} onChange={v => dispatch({type: 'filter_cutoff', payload: v})} min={20} max={20000} />
                                            <RotaryKnob label="RESO" value={settings.filter_resonance} onChange={v => dispatch({type: 'filter_resonance', payload: v})} min={0} max={30} />
                                            <div className="flex flex-col gap-2 items-center">
                                                <RotaryKnob label="ENV MOD" value={settings.filter_env_1_amount} onChange={v => dispatch({type: 'filter_env_1_amount', payload: v})} min={-5000} max={5000} defaultValue={0} size="small" />
                                                <RotaryKnob label="KBD TRK" value={settings.filter_kbd_trk} onChange={v => dispatch({type: 'filter_kbd_trk', payload: v})} min={0} max={1} defaultValue={0.5} size="small" />
                                            </div>
                                        </div>
                                        <Select value={settings.filter_type} onValueChange={v => dispatch({ type: 'filter_type', payload: v })}><SelectTrigger className="bg-black/50 border-white/20"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lp_2">12dB Low-Pass</SelectItem><SelectItem value="lp_4">24dB Low-Pass</SelectItem><SelectItem value="bp_2">Band-Pass</SelectItem><SelectItem value="hp_2">High-Pass</SelectItem></SelectContent></Select>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-lg flex flex-col gap-4">
                                         <h3 className="text-center font-bold text-slate-300">ENVELOPES</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><p className="text-center text-xs font-bold text-slate-400 mb-2">FILTER ENV</p><div className="grid grid-cols-2 gap-2"><RotaryKnob label="A" value={settings.env_1_attack} onChange={v => dispatch({type: 'env_1_attack', payload: v})} min={0.001} max={2} size="small" /><RotaryKnob label="D" value={settings.env_1_decay} onChange={v => dispatch({type: 'env_1_decay', payload: v})} min={0.01} max={2} size="small" /><RotaryKnob label="S" value={settings.env_1_sustain} onChange={v => dispatch({type: 'env_1_sustain', payload: v})} min={0} max={1} size="small" /><RotaryKnob label="R" value={settings.env_1_release} onChange={v => dispatch({type: 'env_1_release', payload: v})} min={0.01} max={4} size="small" /></div></div>
                                            <div><p className="text-center text-xs font-bold text-slate-400 mb-2">AMP ENV</p><div className="grid grid-cols-2 gap-2"><RotaryKnob label="A" value={settings.env_2_attack} onChange={v => dispatch({type: 'env_2_attack', payload: v})} min={0.001} max={2} size="small" /><RotaryKnob label="D" value={settings.env_2_decay} onChange={v => dispatch({type: 'env_2_decay', payload: v})} min={0.01} max={2} size="small" /><RotaryKnob label="S" value={settings.env_2_sustain} onChange={v => dispatch({type: 'env_2_sustain', payload: v})} min={0} max={1} size="small" /><RotaryKnob label="R" value={settings.env_2_release} onChange={v => dispatch({type: 'env_2_release', payload: v})} min={0.01} max={4} size="small" /></div></div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                             <TabsContent value="lfo" className="flex-grow mt-4 overflow-auto">
                                <div className="grid grid-cols-2 gap-6 h-full">
                                    {/* LFO 1 */}
                                    <div className="bg-black/20 p-4 rounded-lg flex flex-col gap-3">
                                        <h3 className="text-center font-bold text-slate-300">LFO 1</h3>
                                        <WaveformSelector value={settings.lfo_1_waveform} onChange={v => dispatch({ type: 'lfo_1_waveform', payload: v })} available={['sine', 'triangle', 'sawtooth', 'square']} />
                                        <RotaryKnob label="RATE" value={settings.lfo_1_rate} onChange={v => dispatch({ type: 'lfo_1_rate', payload: v })} min={0.1} max={30} displayValueOverride={`${settings.lfo_1_rate.toFixed(1)}Hz`} />
                                    </div>
                                    {/* LFO 2 */}
                                    <div className="bg-black/20 p-4 rounded-lg flex flex-col gap-3">
                                        <h3 className="text-center font-bold text-slate-300">LFO 2</h3>
                                        <WaveformSelector value={settings.lfo_2_waveform} onChange={v => dispatch({ type: 'lfo_2_waveform', payload: v })} available={['sine', 'triangle', 'sawtooth', 'square']} />
                                        <RotaryKnob label="RATE" value={settings.lfo_2_rate} onChange={v => dispatch({ type: 'lfo_2_rate', payload: v })} min={0.1} max={30} displayValueOverride={`${settings.lfo_2_rate.toFixed(1)}Hz`} />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="matrix" className="flex-grow mt-4 overflow-auto">
                                <div className="bg-black/20 p-4 rounded-lg space-y-2">
                                    <h3 className="text-center font-bold text-slate-300 mb-2">MODULATION MATRIX</h3>
                                    {/* Header */}
                                    <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400">
                                        <div className="col-span-5">SOURCE</div>
                                        <div className="col-span-5">DESTINATION</div>
                                        <div className="col-span-2 text-right">AMOUNT</div>
                                    </div>
                                    {/* Rows */}
                                    {settings.mod_matrix.map((route, i) => (
                                        <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-5">
                                                <Select value={route.source} onValueChange={v => dispatch({ type: `mod_matrix_${i}_source`, payload: v })}>
                                                    <SelectTrigger className="bg-black/50 border-white/20 text-xs h-8"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{MOD_SOURCES.map(s => <SelectItem key={s} value={s}><span className="capitalize">{s}</span></SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-5">
                                                <Select value={route.destination} onValueChange={v => dispatch({ type: `mod_matrix_${i}_destination`, payload: v })}>
                                                    <SelectTrigger className="bg-black/50 border-white/20 text-xs h-8"><SelectValue /></SelectTrigger>
                                                    <SelectContent>{MOD_DESTINATIONS.map(d => <SelectItem key={d} value={d}><span className="capitalize">{d}</span></SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-2">
                                                <RotaryKnob label="" value={route.amount} onChange={v => dispatch({ type: `mod_matrix_${i}_amount`, payload: v })} min={-1} max={1} defaultValue={0} size="small" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="fx" className="flex-grow mt-4 overflow-auto">
                                <div className="grid grid-cols-3 gap-4 h-full">
                                    {/* DISTORTION & CHORUS */}
                                    <div className="bg-black/20 p-4 rounded-lg space-y-4">
                                        <h3 className="text-center font-bold text-slate-300">DISTORTION</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <RotaryKnob label="DRIVE" value={settings.fx_distortion_drive} onChange={v => dispatch({ type: 'fx_distortion_drive', payload: v })} min={0} max={1} defaultValue={0} size="small" />
                                            <RotaryKnob label="TONE" value={settings.fx_distortion_tone} onChange={v => dispatch({ type: 'fx_distortion_tone', payload: v })} min={200} max={15000} defaultValue={8000} size="small" />
                                        </div>
                                        <h3 className="text-center font-bold text-slate-300 pt-4 border-t border-white/10">CHORUS</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <RotaryKnob label="RATE" value={settings.fx_chorus_rate} onChange={v => dispatch({ type: 'fx_chorus_rate', payload: v })} min={0.1} max={8} defaultValue={1.5} size="small" />
                                            <RotaryKnob label="DEPTH" value={settings.fx_chorus_depth} onChange={v => dispatch({ type: 'fx_chorus_depth', payload: v })} min={0} max={1} defaultValue={0.5} size="small" />
                                        </div>
                                    </div>
                                    {/* DELAY */}
                                    <div className="bg-black/20 p-4 rounded-lg space-y-4">
                                        <h3 className="text-center font-bold text-slate-300">DELAY</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <RotaryKnob label="TIME" value={settings.fx_delay_time} onChange={v => dispatch({ type: 'fx_delay_time', payload: v })} min={0.01} max={1} defaultValue={0.3} size="small" />
                                            <RotaryKnob label="FEEDBACK" value={settings.fx_delay_feedback} onChange={v => dispatch({ type: 'fx_delay_feedback', payload: v })} min={0} max={0.95} defaultValue={0.4} size="small" />
                                            <RotaryKnob label="MIX" value={settings.fx_delay_mix} onChange={v => dispatch({ type: 'fx_delay_mix', payload: v })} min={0} max={1} defaultValue={0} size="small" />
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <label className="text-xs font-semibold tracking-wider text-slate-400">MODE</label>
                                                <Select value={settings.fx_delay_mode} onValueChange={v => dispatch({ type: 'fx_delay_mode', payload: v })}>
                                                    <SelectTrigger className="bg-black/50 border-white/20 text-xs h-8"><SelectValue /></SelectTrigger>
                                                    <SelectContent><SelectItem value="digital">Digital</SelectItem><SelectItem value="tape">Tape</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                    {/* REVERB */}
                                    <div className="bg-black/20 p-4 rounded-lg space-y-4">
                                        <h3 className="text-center font-bold text-slate-300">REVERB</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            <RotaryKnob label="DECAY" value={settings.fx_reverb_decay} onChange={v => dispatch({ type: 'fx_reverb_decay', payload: v })} min={0.1} max={5} defaultValue={1.5} />
                                            <RotaryKnob label="MIX" value={settings.fx_reverb_mix} onChange={v => dispatch({ type: 'fx_reverb_mix', payload: v })} min={0} max={1} defaultValue={0} />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                             <TabsContent value="master" className="flex-grow mt-4 overflow-auto">
                                <div className="bg-black/20 p-4 rounded-lg flex items-center justify-center gap-8 h-full">
                                    <RotaryKnob label="MASTER VOL" value={settings.master_volume} onChange={v => dispatch({ type: 'master_volume', payload: v })} min={0} max={1} defaultValue={0.7} size="large" />
                                </div>
                            </TabsContent>
                         </Tabs>
                    </div>
                     <SynthKeyboard onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} activeNotes={activeNotes} octave={octave} onOctaveChange={(change) => setOctave(o => Math.max(0, Math.min(7, o + change)))} />
                </div>
                 <div className="w-full lg:w-1/4 flex flex-col gap-4">
                    <div className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl p-4 flex-grow">
                        <h3 className="text-center font-bold text-slate-300 mb-2">SEQUENCER</h3>
                        <BeatSequencer initializeEngine={() => synthEngineRef.current?.ctx.resume()}/>
                    </div>
                    {/* ... other side panels ... */}
                </div>
            </main>
        </div>
    );
};

export default Synth;