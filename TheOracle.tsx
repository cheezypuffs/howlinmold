// components/TheOracle.tsx
// FIX: Added React import to solve JSX errors.
import React, { useState, useMemo, useCallback } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { motion, AnimatePresence } from './motion';

import type { AppState, DeckId, SpotifyTrackData, Action } from '../types';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { cn } from '../utils/cn';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { formatTime } from '../utils/helpers';

interface TheOracleProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loadTrack: (track: SpotifyTrackData, deckId: DeckId) => void;
}

type OracleStatus = 'idle' | 'thinking' | 'answered' | 'error';
interface Suggestion {
    track: SpotifyTrackData;
    reason: string;
}

const TheOracle: React.FC<TheOracleProps> = ({ state, dispatch, loadTrack }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);
    const { toast } = useToast();

    const [status, setStatus] = useState<OracleStatus>('idle');
    const [query, setQuery] = useState('What should I play next?');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [error, setError] = useState('');
    
    const handleQuery = async () => {
        const masterDeckState = state[state.masterDeck];
        if (!masterDeckState || !masterDeckState.loaded || !masterDeckState.bpm || !masterDeckState.key) {
            toast({ title: "Master Deck Not Ready", description: "Load and analyze a track on the master deck first.", type: 'error' });
            return;
        }

        setStatus('thinking');
        setSuggestions([]);
        setError('');

        try {
            const displayTrackSuggestions: FunctionDeclaration = {
                name: 'displayTrackSuggestions',
                parameters: {
                    type: Type.OBJECT,
                    description: 'Displays a list of suggested tracks to the user, with reasons.',
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            description: 'A list of suggestions, each with a track ID and the reasoning.',
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    trackId: { type: Type.STRING, description: 'The ID of the suggested track from the user library.' },
                                    reason: { type: Type.STRING, description: 'A brief explanation for why this track is a good suggestion.' }
                                },
                                required: ['trackId', 'reason']
                            }
                        }
                    },
                    required: ['suggestions']
                },
            };

            const libraryExcerpt = state.library.slice(0, 100).map(t => ({ id: t.id, name: t.name, artist: t.artists[0].name, bpm: t.tempo, key: t.analysisCache?.key, genre: t.genre }));
            const masterTrackInfo = `Title: "${masterDeckState.title}", Artist: "${masterDeckState.artist}", BPM: ${masterDeckState.bpm.toFixed(1)}, Key: ${masterDeckState.key}.`;

            const systemInstruction = `You are a world-class DJ assistant called The Oracle. Your goal is to help the user find the perfect next track to mix from their library. You must suggest tracks that are harmonically compatible (same or related key), have a similar tempo (BPM), and fit the genre/mood. For each suggestion, provide a concise reason explaining the choice. Use the 'displayTrackSuggestions' function to return your choices.`;
            const fullPrompt = `The user's request is: "${query}". The track currently playing on the master deck is: ${masterTrackInfo}. The user's library contains the following tracks (use their IDs for suggestions): ${JSON.stringify(libraryExcerpt)}`;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    tools: [{ functionDeclarations: [displayTrackSuggestions] }],
                    systemInstruction: systemInstruction,
                },
            });
            
            if (result.functionCalls && result.functionCalls.length > 0) {
                const call = result.functionCalls[0];
                // FIX: Add Array.isArray check to ensure suggestions is an array before mapping.
                if (call.name === 'displayTrackSuggestions' && call.args.suggestions && Array.isArray(call.args.suggestions)) {
                    const foundSuggestions = call.args.suggestions.map((s: { trackId: string; reason: string }) => {
                        const track = state.library.find(t => t.id === s.trackId);
                        return track ? { track, reason: s.reason } : null;
                    }).filter((s): s is Suggestion => s !== null);

                    if (foundSuggestions.length > 0) {
                        setSuggestions(foundSuggestions);
                        setStatus('answered');
                    } else {
                        throw new Error("The Oracle found suggestions, but they don't match your library.");
                    }
                } else {
                    throw new Error("The Oracle responded in an unexpected format.");
                }
            } else {
                // If no function call, but text exists, show it.
                if(result.text) {
                    setError(result.text);
                } else {
                    throw new Error("The Oracle returned an empty response.");
                }
                setStatus('error');
            }
        } catch (err) {
            console.error("Oracle query failed:", err);
            setError((err as Error).message || "The Oracle could not find an answer in the aether.");
            setStatus('error');
        }
    };
    
    const handleLoadSuggestion = (track: SpotifyTrackData) => {
        const targetDeck = state.masterDeck === 'A' ? 'B' : 'A';
        loadTrack(track, targetDeck);
        toast({ title: "Track Loading", description: `"${track.name}" sent to Deck ${targetDeck}.` });
        setIsOpen(false);
    };
    
    const resetOracle = () => {
        setStatus('idle');
        setSuggestions([]);
        setError('');
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(prev => !prev)} className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${isOpen ? 'bg-purple-500/50' : 'bg-white/10'}`} title="Ask the Oracle">
                <Icons.BrainCircuit className={`w-5 h-5 transition-colors ${isOpen ? 'text-white' : 'text-purple-300'}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }} className="absolute top-14 right-0 w-96 z-20">
                         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg flex flex-col">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3"><Icons.BrainCircuit className="w-6 h-6 text-purple-300" />
                                    <div>
                                        <h3 className="font-bold text-white">The Oracle</h3>
                                        <p className="text-xs text-slate-400">Your AI DJ Assistant</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white -mr-2"><Icons.X className="w-4 h-4" /></Button>
                            </div>

                            <div className="p-4">
                                {status === 'idle' && (
                                     <div className="flex flex-col items-center gap-4">
                                        <Textarea value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g., 'Find me something energetic'" className="bg-black/20" />
                                        <Button onClick={handleQuery} disabled={!query} className="w-full">
                                            <Icons.Sparkles className="mr-2 h-4 w-4" /> Ask for Suggestions
                                        </Button>
                                    </div>
                                )}
                                {status === 'thinking' && (
                                    <div className="min-h-[200px] flex flex-col items-center justify-center text-slate-400">
                                        <Icons.Loader2 className="w-8 h-8 animate-spin text-purple-300 mb-4"/>
                                        <p>Consulting the aether...</p>
                                    </div>
                                )}
                                {status === 'error' && (
                                    <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-4">
                                        <Icons.AlertCircle className="w-8 h-8 text-red-400 mb-4"/>
                                        <p className="text-red-300">{error}</p>
                                        <Button onClick={resetOracle} variant="outline" className="mt-4">Try Again</Button>
                                    </div>
                                )}
                                {status === 'answered' && (
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {suggestions.map(({ track, reason }) => (
                                            <div key={track.id} className="bg-black/20 p-3 rounded-lg border border-white/10">
                                                <div className="flex gap-3">
                                                    <img src={track.album.images[0]?.url} className="w-16 h-16 rounded-md object-cover flex-shrink-0" alt={track.album.name} />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm truncate text-white">{track.name}</p>
                                                        <p className="text-xs truncate text-slate-400">{track.artists[0].name}</p>
                                                        <div className="flex gap-2 text-xs mt-1">
                                                            <span className="font-mono text-purple-300">{track.tempo?.toFixed(0)}bpm</span>
                                                            <span className="font-mono text-cyan-300">{track.analysisCache?.key || ''}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs italic text-slate-300 mt-2 p-2 bg-black/20 rounded">"{reason}"</p>
                                                <Button size="sm" onClick={() => handleLoadSuggestion(track)} className="w-full mt-2">
                                                    Load to Deck {state.masterDeck === 'A' ? 'B' : 'A'}
                                                </Button>
                                            </div>
                                        ))}
                                         <Button onClick={resetOracle} variant="ghost" className="w-full">Ask Again</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TheOracle;