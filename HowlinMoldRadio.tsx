// components/HowlinMoldRadio.tsx
import React from 'react';
import { useRadio } from '../contexts/RadioState';
import { Button } from './ui/button';
import * as Icons from './Icons';
import RadioPlayer from './RadioPlayer';
import { cn } from '../utils/cn';

const RadioContent: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { sources, activeSlot, setActiveSlot, isLoading } = useRadio();

    const activePlaylistId = sources.find(s => s.slot === activeSlot)?.spotify_id || null;

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.AnimatedIcon.Radio>
                            <Icons.Radio className="w-6 h-6" />
                        </Icons.AnimatedIcon.Radio>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Howlin' Mold Radio</h1>
                        <p className="text-slate-400 text-sm">Curated streams for deep listening.</p>
                    </div>
                </div>
            </header>
            
            <main className="flex-grow min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col gap-3">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Icons.Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                        </div>
                    ) : sources.length > 0 ? (
                        sources.map(source => (
                            <button
                                key={source.slot}
                                onClick={() => setActiveSlot(source.slot)}
                                className={cn(
                                    "p-4 rounded-lg border-2 text-left transition-all",
                                    activeSlot === source.slot
                                        ? "bg-purple-900/50 border-purple-500 shadow-lg"
                                        : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                                )}
                            >
                                <p className="font-bold text-lg text-white">Slot {source.slot}</p>
                                <p className="text-slate-300">{source.label}</p>
                            </button>
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-center p-4 bg-slate-800/50 border-slate-700 rounded-lg text-slate-500">
                            No active radio channels configured.
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <RadioPlayer playlistId={activePlaylistId || ''} />
                </div>
            </main>
        </div>
    );
};

const HowlinMoldRadio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <RadioContent onBack={onBack} />
    );
};

export default HowlinMoldRadio;