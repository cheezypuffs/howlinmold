// components/Deck.tsx
import React from 'react';
import type { AppState, Action, DeckId, User, SpotifyTrackData } from '../types';
import type { Engine } from '../hooks/useAudioEngine';

import TrackInfo from './deck/TrackInfo';
import TransportControls from './deck/TransportControls';
import MixerControls from './deck/MixerControls';
import MainDisplay from './deck/MainDisplay';
import PerformanceControls from './PerformanceControls';
import { cn } from '../utils/cn';
import { Button } from './ui/button';
import * as Icons from './Icons';
import YouTubeSearchModal from './YouTubeSearchModal';
import { toTrackMetadataFromYouTube } from '../services/youtube';
import { loadSpotifyTrack } from '../utils/trackLoader';

export interface DeckProps {
  deckId: DeckId;
  state: AppState[DeckId];
  appState: AppState;
  dispatch: React.Dispatch<Action>;
  engine: React.MutableRefObject<Engine | null>;
  loadTrack: (fileOrTrack: File | SpotifyTrackData | string, deckId: DeckId) => void;
  onCreatePost: (trackId: string) => void;
}

const Deck: React.FC<DeckProps> = (props) => {
  const { deckId, state, appState, dispatch } = props;
  const isFocused = appState.focusedDeck === deckId;
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isYouTubeSearchOpen, setIsYouTubeSearchOpen] = React.useState(false);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      props.loadTrack(event.target.files[0], deckId);
    }
  };
  
  const handleYouTubeLoad = async (item: any) => {
      setIsYouTubeSearchOpen(false);
      const trackMeta = toTrackMetadataFromYouTube(item);
      // We are passing a partial SpotifyTrackData object here. The loader will handle it.
      await loadSpotifyTrack(trackMeta as any, deckId, dispatch, () => {}, props.engine as any);
  };

  
  const deckContainerClass = cn(
    "relative h-full flex flex-col gap-2 p-3 rounded-xl border transition-all duration-300",
    "bg-slate-900/50 backdrop-blur-sm",
    isFocused
      ? 'border-[var(--color-accent-purple)]/80 shadow-lg shadow-purple-900/50'
      : 'border-slate-800/50'
  );

  return (
    <div className={deckContainerClass} onClick={() => dispatch({ type: 'SET_FOCUS', deckId })}>
        <input type="file" accept="audio/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        {isYouTubeSearchOpen && <YouTubeSearchModal deckId={deckId} onClose={() => setIsYouTubeSearchOpen(false)} onLoad={handleYouTubeLoad} />}

        <div className="flex-shrink-0 flex items-start justify-between gap-2">
            <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()} size="sm" className="bg-slate-700/50 hover:bg-slate-600/50">
                    <Icons.Upload className="w-4 h-4 mr-2"/> Load Track
                </Button>
            </div>
            {state.loaded && <TrackInfo deckState={state} isMaster={appState.masterDeck === deckId} />}
            <Button size="icon" variant="ghost"><Icons.Share2 className="w-4 h-4"/></Button>
        </div>
      
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-5 gap-2 min-h-0">
        <div className="lg:col-span-3 h-full min-h-[200px] lg:min-h-0">
          <MainDisplay {...props} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-2">
          <TransportControls deckId={deckId} deckState={state} dispatch={dispatch} />
          <MixerControls deckId={deckId} deckState={state} dispatch={dispatch} deckColor={deckId === 'A' ? 'var(--sw-deck-a-color)' : 'var(--sw-deck-b-color)'} />
        </div>
      </div>
      
      <div className="flex-shrink-0">
          <PerformanceControls id={deckId} state={state} appState={appState} dispatch={props.dispatch} engine={props.engine} />
      </div>
    </div>
  );
};

export default Deck;
