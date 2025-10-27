// components/deck/MainDisplay.tsx
import React, { useState } from 'react';
import type { DeckProps } from '../Deck';
import Platter from '../Platter';
import DetailedWaveform from '../DetailedWaveform';
import LiveRemixView from './LiveRemixView';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

type DisplayMode = 'platter' | 'waveform' | 'remix';

const MainDisplay: React.FC<DeckProps> = (props) => {
    const { deckId, state, dispatch, engine } = props;
    const [mode, setMode] = useState<DisplayMode>('platter');
    const deckColor = deckId === 'A' ? 'var(--deck-a-color)' : 'var(--deck-b-color)';

    const handleScratchStart = () => dispatch({ type: 'SET_DECK_VALUE', deckId, key: 'slipMode', value: true });
    const handleScratchEnd = () => dispatch({ type: 'SET_DECK_VALUE', deckId, key: 'slipMode', value: false });
    const handleScratch = (angleDelta: number) => {
        const sensitivity = 0.005; // Adjust for desired scratch speed
        const timeDelta = angleDelta * sensitivity;
        const newTime = Math.max(0, state.currentTime - timeDelta);
        engine.current?.seek(deckId, newTime);
    };
    
    const renderContent = () => {
        switch (mode) {
            case 'waveform':
                return <DetailedWaveform deckState={state} deckColor={deckColor} />;
            case 'remix':
                return <LiveRemixView deckId={deckId} state={state} dispatch={dispatch} />;
            case 'platter':
            default:
                return (
                    <div className="w-full aspect-square max-w-[400px] mx-auto p-4">
                        <Platter
                            isPlaying={state.playing}
                            rate={state.rate}
                            albumArtUrl={state.albumArtUrl}
                            deckColor={deckColor}
                            isLoading={state.isLoading}
                            onScratchStart={handleScratchStart}
                            onScratch={handleScratch}
                            onScratchEnd={handleScratchEnd}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col gap-2 h-full">
            <div className="flex-grow relative bg-black/20 rounded-lg overflow-hidden border border-white/10">
                {renderContent()}
            </div>
            <div className="flex justify-center bg-black/30 rounded-lg p-1">
                {(['platter', 'waveform', 'remix'] as DisplayMode[]).map(m => (
                    <Button 
                        key={m} 
                        onClick={() => setMode(m)} 
                        variant="ghost"
                        className={cn("w-full capitalize", mode === m && "bg-white/10 text-white")}
                    >
                        {m}
                    </Button>
                ))}
            </div>
        </div>
    );
};

export default MainDisplay;
