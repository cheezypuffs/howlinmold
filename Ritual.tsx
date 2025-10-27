// components/Ritual.tsx
// FIX: Added React import to solve JSX errors.
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { useMutation } from '@tanstack/react-query';
import type { AppState, Action, RitualPlan, SpotifyTrackData, RitualDeckId, AnyRitualEvent, RitualTrackEvent } from '../types';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import RitualVisualizer from './RitualVisualizer';
import { motion, AnimatePresence } from './motion';
import { Progress } from './ui/progress';
import { cn } from '../utils/cn';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { formatTime } from '../utils/helpers';

interface RitualProps {
    onBack: () => void;
    state: AppState;
    dispatch: React.Dispatch<Action>;
    loadTrack: (track: SpotifyTrackData, deckId: RitualDeckId) => void;
}

type AssetStatus = 'pending' | 'generating' | 'done' | 'error';
interface VideoAsset {
    scene: number;
    prompt: string;
    status: AssetStatus;
    url: string | null;
}
interface AudioAsset {
    scene: number;
    script: string;
    startTime: number;
    status: AssetStatus;
    url: string | null;
}

type RitualStatus = 'idle' | 'planning' | 'plan_ready' | 'generating' | 'ready' | 'playing' | 'error';

interface RitualState {
    status: RitualStatus;
    plan: RitualPlan | null;
    videoAssets: VideoAsset[];
    audioAssets: AudioAsset[];
    error?: string;
}

const base64toBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

const Ritual: React.FC<RitualProps> = ({ onBack, state, dispatch, loadTrack }) => {
    const [prompt, setPrompt] = useState('');
    const [location, setLocation] = useState('');
    const [ritualState, setRitualState] = useState<RitualState>({
        status: 'idle',
        plan: null,
        videoAssets: [],
        audioAssets: [],
        error: undefined
    });

    const { toast } = useToast();
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

    const planMutation = useMutation({
        mutationFn: async (): Promise<RitualPlan> => {
            const availableTracks = state.library.slice(0, 30).map(t => ({ id: t.id, name: t.name, artist: t.artists[0].name, bpm: t.tempo, key: t.analysisCache?.key || 'Cmaj' }));
            const systemInstruction = `You are a master audiovisual storyteller and ritual DJ. Your task is to take a user's intent, an optional location, and a list of available tracks to create a complete, multimodal 'Ritual'. A Ritual consists of a two-track DJ mix plan, a series of corresponding cinematic video prompts for a generative video model (Veo), and evocative narration scripts to be synthesized into speech (TTS). You must analyze the provided track data (BPM, key, artist, name) to inform your creative choices, ensuring the music, visuals, and narration are all thematically and sonically coherent.`;
            const fullPrompt = `User Intent: "${prompt}". Location Context: "${location || 'None provided'}". Available Tracks: ${JSON.stringify(availableTracks)}. Generate a Ritual Plan with a total duration of roughly 45 seconds. Create three visual/narration scenes: one for the first track, one for the transition, and one for the second track. Ensure narration startTime values are staggered appropriately within the mix.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro', contents: fullPrompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT, properties: {
                            mix_plan: { type: Type.OBJECT, properties: { totalDuration: { type: Type.NUMBER }, events: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, startTime: { type: Type.NUMBER }, duration: { type: Type.NUMBER }, trackId: { type: Type.STRING }, deck: { type: Type.STRING }, fromDeck: { type: Type.STRING }, toDeck: { type: Type.STRING }, transitionType: { type: Type.STRING } } } } } },
                            visual_prompts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { scene: { type: Type.NUMBER }, prompt: { type: Type.STRING } } } },
                            narration_scripts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { scene: { type: Type.NUMBER }, script: { type: Type.STRING }, startTime: { type: Type.NUMBER } } } }
                        }
                    },
                    systemInstruction,
                }
            });
            return JSON.parse(response.text.replace(/```json\s*|```\s*$/g, ''));
        },
        onSuccess: (plan) => {
            setRitualState({
                status: 'plan_ready', plan,
                videoAssets: plan.visual_prompts.map(p => ({ ...p, status: 'pending', url: null })),
                audioAssets: plan.narration_scripts.map(s => ({ ...s, status: 'pending', url: null })),
            });
            toast({ title: "Ritual Plan Generated", description: "Review the plan and manifest the assets.", type: 'success' });
        },
        onError: (error) => {
            console.error("Error generating mix plan:", error);
            setRitualState(prev => ({ ...prev, status: 'error', error: "Could not generate the ritual plan. The AI may be busy or the request was malformed." }));
            toast({ title: "Generation Failed", description: "Could not generate mix plan.", type: 'error' });
        },
    });

    const handleGeneratePlan = () => {
        if (!prompt) {
            toast({ title: 'Error', description: 'Please enter a prompt for the ritual.', type: 'error' });
            return;
        }
        setRitualState(prev => ({ ...prev, status: 'planning', error: undefined }));
        planMutation.mutate();
    };

    const generateVideo = async (scene: number, prompt: string) => {
        setRitualState(prev => ({ ...prev, videoAssets: prev.videoAssets.map(v => v.scene === scene ? { ...v, status: 'generating' } : v) }));
        await new Promise(res => setTimeout(res, 2000 + Math.random() * 3000)); // Simulate generation time
        // In a real implementation with Veo, you would poll the operation status.
        const mockUrl = `https://picsum.photos/seed/ritual_${scene}_${Date.now()}/1280/720`; // Mock video URL
        setRitualState(prev => ({ ...prev, videoAssets: prev.videoAssets.map(v => v.scene === scene ? { ...v, status: 'done', url: mockUrl } : v) }));
    };
    
    const generateNarration = async (scene: number, script: string) => {
        setRitualState(prev => ({ ...prev, audioAssets: prev.audioAssets.map(a => a.scene === scene ? { ...a, status: 'generating' } : a) }));
        try {
             const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: script }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (!base64Audio) throw new Error("No audio data received from TTS API.");

            const audioBlob = base64toBlob(base64Audio, 'audio/mpeg');
            const audioUrl = URL.createObjectURL(audioBlob);
            setRitualState(prev => ({ ...prev, audioAssets: prev.audioAssets.map(a => a.scene === scene ? { ...a, status: 'done', url: audioUrl } : a) }));
        } catch (error) {
            console.error(`Narration generation for scene ${scene} failed:`, error);
            setRitualState(prev => ({ ...prev, audioAssets: prev.audioAssets.map(a => a.scene === scene ? { ...a, status: 'error' } : a) }));
        }
    };
    
    const manifestMutation = useMutation({
        mutationFn: async (plan: RitualPlan) => {
            const videoPromises = plan.visual_prompts.map(p => generateVideo(p.scene, p.prompt));
            const audioPromises = plan.narration_scripts.map(s => generateNarration(s.scene, s.script));
            await Promise.allSettled([...videoPromises, ...audioPromises]);
        },
        onSuccess: () => {
            setRitualState(prev => ({ ...prev, status: 'ready' }));
        },
        onMutate: () => {
            toast({ title: "Manifesting...", description: "Generating video and audio assets. This may take a few minutes.", type: 'default' });
        }
    });

    const handleManifestAssets = () => {
        if (!ritualState.plan) return;
        setRitualState(prev => ({ ...prev, status: 'generating' }));
        manifestMutation.mutate(ritualState.plan);
    };

    const handleReset = () => {
        setRitualState({ status: 'idle', plan: null, videoAssets: [], audioAssets: [], error: undefined });
        setPrompt('');
        setLocation('');
    };
    
    const currentStatus = planMutation.isPending ? 'planning' : manifestMutation.isPending ? 'generating' : ritualState.status;

    const renderMainView = () => {
        switch (currentStatus) {
            case 'idle':
            case 'planning':
            case 'error':
                return (
                    <div className="lg:col-span-2 flex flex-col gap-4">
                        <h2 className="font-bold text-lg text-slate-300">1. Define the Ritual's Intent</h2>
                        <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'A journey from a dark, industrial cityscape into a lush, bioluminescent forest...'" className="bg-black/30 min-h-[100px]" disabled={planMutation.isPending} />
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Optional: Add a location context (e.g., 'Tokyo at night')" className="bg-black/30" disabled={planMutation.isPending} />
                        <Button onClick={handleGeneratePlan} disabled={planMutation.isPending || !prompt}>
                            {planMutation.isPending ? <><Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</> : <><Icons.Sparkles className="mr-2 h-4 w-4" /> Generate Plan</>}
                        </Button>
                        {ritualState.error && <Alert variant="destructive"><Icons.AlertCircle className="w-4 h-4" /><AlertDescription>{ritualState.error}</AlertDescription></Alert>}
                    </div>
                );
            case 'plan_ready':
                return <PlanReview state={state} ritualState={ritualState} onManifest={handleManifestAssets} onReset={handleReset} />;
            case 'generating':
            case 'ready':
            case 'playing':
                 // FIX: Corrected a typo where an undefined 'onReset' was passed instead of 'handleReset'.
                 // FIX: Replaced `.toString()` with `String()` and added optional chaining for a safer key generation.
                 return <RitualPlayer key={String(ritualState.plan?.mix_plan.events[0]?.startTime)} state={state} ritualState={ritualState} dispatch={dispatch} loadTrack={loadTrack} setRitualState={setRitualState} onReset={handleReset} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.Zap className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Generative Ritual</h1>
                        <p className="text-slate-400 text-sm">Craft an AI-driven audiovisual journey.</p>
                    </div>
                </div>
                {currentStatus !== 'idle' && (
                    <Button onClick={handleReset} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                        <Icons.X className="w-4 h-4 mr-2"/> Start Over
                    </Button>
                )}
            </header>

            <main className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderMainView()}
            </main>
        </div>
    );
};

const PlanReview: React.FC<{
    state: AppState;
    ritualState: RitualState;
    onManifest: () => void;
    onReset: () => void;
}> = ({ state, ritualState, onManifest }) => {
    const { plan } = ritualState;
    if (!plan) return null;

    const trackEvents = plan.mix_plan.events.filter(e => e.type === 'TRACK') as RitualTrackEvent[];
    const tracks = trackEvents.map(e => state.library.find(t => t.id === e.trackId)).filter(Boolean);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="font-bold text-lg text-slate-300">2. Review the Ritual Plan</h2>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
                <div className="bg-black/30 rounded-lg p-4 flex flex-col">
                    <h3 className="font-bold text-purple-300 mb-2 flex items-center gap-2"><Icons.Music className="w-4 h-4" /> Mix Plan</h3>
                    <ScrollArea className="flex-grow">
                        <div className="space-y-3 pr-2">
                            {tracks.map((track, i) => track ? (
                                <div key={track.id} className="bg-slate-800/50 p-3 rounded">
                                    <p className="font-semibold text-sm text-white">{i + 1}. {track.name}</p>
                                    <p className="text-xs text-slate-400">{track.artists[0].name}</p>
                                </div>
                            ) : null)}
                        </div>
                    </ScrollArea>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex flex-col">
                    <h3 className="font-bold text-cyan-300 mb-2 flex items-center gap-2"><Icons.Image className="w-4 h-4" /> Visual Prompts</h3>
                    <ScrollArea className="flex-grow"><div className="space-y-2 text-sm text-slate-300 pr-2 italic">
                        {plan.visual_prompts.map(p => <p key={p.scene}>"{p.prompt}"</p>)}
                    </div></ScrollArea>
                </div>
                <div className="bg-black/30 rounded-lg p-4 flex flex-col">
                    <h3 className="font-bold text-yellow-300 mb-2 flex items-center gap-2"><Icons.Mic className="w-4 h-4" /> Narration Scripts</h3>
                    <ScrollArea className="flex-grow"><div className="space-y-2 text-sm text-slate-300 pr-2 italic">
                        {plan.narration_scripts.map(s => <p key={s.scene}>"{s.script}"</p>)}
                    </div></ScrollArea>
                </div>
            </div>
            <Button onClick={onManifest} size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Icons.Zap className="w-5 h-5 mr-2" /> Manifest Assets
            </Button>
        </motion.div>
    );
};


const RitualPlayer: React.FC<{
    state: AppState,
    ritualState: RitualState,
    dispatch: React.Dispatch<Action>,
    loadTrack: (track: SpotifyTrackData, deckId: RitualDeckId) => void,
    setRitualState: React.Dispatch<React.SetStateAction<RitualState>>
    onReset: () => void;
}> = ({ state, ritualState, dispatch, loadTrack, setRitualState, onReset }) => {
    const [playbackTime, setPlaybackTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    
    const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
    const eventsTriggeredRef = useRef<Set<string>>(new Set());
    const animFrameRef = useRef<number>();

    const totalDuration = ritualState.plan?.mix_plan.totalDuration || 60;

    // Effect for managing audio assets
    useEffect(() => {
        // Pre-create audio elements from the plan
        ritualState.audioAssets.forEach(asset => {
            if (asset.url) {
                audioElementsRef.current[asset.scene] = new Audio(asset.url);
            }
        });

        // Cleanup function for when the component unmounts or assets change
        return () => {
            Object.values(audioElementsRef.current).forEach((audio: HTMLAudioElement) => {
                audio.pause();
            });
            audioElementsRef.current = {};
        };
    }, [ritualState.audioAssets]);

    // Effect for auto-loading the first track
    useEffect(() => {
        const firstTrackEvent = ritualState.plan?.mix_plan.events.find(e => e.type === 'TRACK' && e.startTime === 0) as RitualTrackEvent | undefined;
        if (firstTrackEvent) {
            const trackData = state.library.find(t => t.id === firstTrackEvent.trackId);
            if (trackData) {
                loadTrack(trackData, firstTrackEvent.deck as RitualDeckId);
            }
        }
    }, [ritualState.plan, state.library, loadTrack]);

    // Effect for managing the playback timer loop
    useEffect(() => {
        let lastTime = performance.now();

        const loop = (time: number) => {
            if (isPlaying) {
                const delta = (time - lastTime) / 1000;
                lastTime = time;

                setPlaybackTime(prevTime => {
                    const newTime = prevTime + delta;
                    if (newTime >= totalDuration) {
                        setIsPlaying(false);
                        return totalDuration;
                    }
                    return newTime;
                });
            } else {
              // keep lastTime fresh when paused to avoid a large jump on resume
              lastTime = time;
            }
            // FIX: Explicitly use window.requestAnimationFrame to avoid potential scope issues or overwrites.
            animFrameRef.current = window.requestAnimationFrame(loop);
        };
        
        // FIX: Explicitly use window.requestAnimationFrame to avoid potential scope issues or overwrites.
        animFrameRef.current = window.requestAnimationFrame(loop);
        return () => {
            // FIX: The call to cancelAnimationFrame was missing its argument. Added the animation frame ID to correctly stop the animation loop.
            if (animFrameRef.current) {
                window.cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [isPlaying, totalDuration]);

    // Effect for triggering events based on playback time
    useEffect(() => {
        ritualState.plan?.mix_plan.events.forEach((event, i) => {
            const eventId = `mix_event_${i}`;
            if (playbackTime >= event.startTime && !eventsTriggeredRef.current.has(eventId)) {
                if (event.type === 'TRACK') {
                    const trackData = state.library.find(t => t.id === event.trackId);
                    if(trackData) {
                         loadTrack(trackData, event.deck as RitualDeckId);
                         // This is a simplification; a real DJ engine would handle play/cue
                         dispatch({ type: 'TOGGLE_PLAY', deckId: event.deck });
                    }
                }
                eventsTriggeredRef.current.add(eventId);
            }
        });
        
        ritualState.videoAssets.forEach((asset) => {
            // A simple logic to determine scene duration
            const sceneStartTime = (asset.scene - 1) * (totalDuration / 3);
            const sceneEndTime = asset.scene * (totalDuration / 3);
            if (playbackTime >= sceneStartTime && playbackTime < sceneEndTime) {
                setCurrentVideoUrl(asset.url);
            }
        });

        ritualState.audioAssets.forEach((asset) => {
            const eventId = `audio_asset_${asset.scene}`;
            if (playbackTime >= asset.startTime && !eventsTriggeredRef.current.has(eventId)) {
                // FIX: Refactored to ensure the element exists before calling play()
                // to satisfy stricter TypeScript checks and avoid potential errors.
                const audioEl = audioElementsRef.current[asset.scene];
                if (audioEl) {
                    audioEl.play().catch(e => console.error(`Audio playback for scene ${asset.scene} failed`, e));
                }
                eventsTriggeredRef.current.add(eventId);
            }
        });

    }, [playbackTime, ritualState, state.library, loadTrack, dispatch, totalDuration]);

    const handlePlayPause = () => {
        if (ritualState.status === 'ready') {
            setRitualState(prev => ({ ...prev, status: 'playing' }));
        }
        setIsPlaying(!isPlaying);
    };

    const progress = (playbackTime / totalDuration) * 100;

    return (
         <div className="lg:col-span-2 flex flex-col gap-4">
             <RitualVisualizer status={ritualState.status === 'generating' ? 'generating' : 'done'} prompt={""} currentVideoUrl={currentVideoUrl} />
             <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>{formatTime(playbackTime)}</span>
                    <span>{formatTime(totalDuration)}</span>
                </div>
                <Progress value={progress} />
             </div>
             <div className="flex justify-center gap-4">
                <Button onClick={handlePlayPause} size="lg" disabled={ritualState.status === 'generating'}>
                    {isPlaying ? <Icons.Pause className="w-6 h-6"/> : <Icons.Play className="w-6 h-6"/>}
                </Button>
             </div>
        </div>
    )
};


const AssetStatusItem: React.FC<{asset: VideoAsset | AudioAsset, type: 'Video' | 'Narration'}> = ({ asset, type }) => {
    const renderIcon = () => {
        switch(asset.status) {
            case 'pending': return <Icons.Clock className="w-4 h-4 text-slate-500" />;
            case 'generating': return <Icons.Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
            case 'done': return <Icons.CheckCircle className="w-4 h-4 text-green-400" />;
            case 'error': return <Icons.AlertCircle className="w-4 h-4 text-red-400" />;
        }
    }
    const promptOrScript = 'prompt' in asset ? asset.prompt : asset.script;
    return (
        <div className="bg-slate-800/50 p-3 rounded-md flex items-start gap-3">
            {renderIcon()}
            <div className="flex-grow">
                <p className="font-semibold text-sm text-white">{type} Scene {asset.scene}</p>
                <p className="text-xs text-slate-400 italic">"{promptOrScript}"</p>
            </div>
        </div>
    );
};

export default Ritual;
