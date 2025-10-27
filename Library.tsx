// components/Library.tsx
import React, { useMemo, useState } from 'react';
import type { AppState, SpotifyTrackData, DeckId, User } from '../types';
import { Button } from './ui/button';
import { formatTime } from '../utils/helpers';
import { ScrollArea } from './ui/scroll-area';
import { CosmicSearchBar } from './ui/cosmic-search';
import { CosmicTrackCard, Track } from './ui/cosmic-track-card';
import * as Icons from './Icons';
import { cn } from '../utils/cn';
import ShareTrackModal from './ShareTrackModal';
import { socialService } from '../services/socialService';

interface LibraryProps {
  appState: AppState;
  loadTrack: (track: SpotifyTrackData, deckId: DeckId) => void;
  user: User | null;
  setActiveView: (view: string) => void;
  libraryVersion: number;
  globalSearchTerm: string;
}

// FIX: Define a placeholder for the missing 'CosmicLibraryGrid' component to resolve the reference error.
// This placeholder uses existing components like 'ScrollArea' and 'CosmicTrackCard' to provide basic functionality.
interface CosmicLibraryGridProps {
  tracks: Track[];
  searchQuery: string;
  onTrackLoad: (track: Track) => void;
}

const CosmicLibraryGrid: React.FC<CosmicLibraryGridProps> = ({ tracks, onTrackLoad }) => {
  return (
    <ScrollArea>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tracks.map(track => (
          <CosmicTrackCard key={track.id} track={track} onLoad={() => onTrackLoad(track)} />
        ))}
      </div>
    </ScrollArea>
  );
};

const Library: React.FC<LibraryProps> = ({ appState, loadTrack, user, setActiveView, libraryVersion, globalSearchTerm }) => {
    const { library, focusedDeck } = appState;
    const [trackToShare, setTrackToShare] = useState<SpotifyTrackData | null>(null);

    const filteredTracks = useMemo(() => {
        const lowercasedSearch = globalSearchTerm.toLowerCase();
        if (!lowercasedSearch) return library;
        return library.filter(track =>
            track.name.toLowerCase().includes(lowercasedSearch) ||
            track.artists.some(artist => artist.name.toLowerCase().includes(lowercasedSearch)) ||
            track.album.name.toLowerCase().includes(lowercasedSearch)
        );
    }, [library, globalSearchTerm, libraryVersion]);
    
    const handleLoadTrack = (track: SpotifyTrackData) => {
        const targetDeck = (focusedDeck === 'A' || focusedDeck === 'B') ? focusedDeck : 'A';
        loadTrack(track, targetDeck);
    };
    
     const handlePost = (details: { content: string; tags: string[] }) => {
        if (!trackToShare) return;
        socialService.addPost({
            authorId: user!.id,
            content: details.content,
            tags: details.tags,
            sharedTrack: {
                trackId: trackToShare.id,
                trackName: trackToShare.name,
                artist: trackToShare.artists[0]?.name || 'Unknown Artist',
                spotifyUri: `spotify:track:${trackToShare.id}`
            },
            contentType: 'track_discovery',
        });
        setTrackToShare(null);
    };

    const trackToCosmicTrack = (track: SpotifyTrackData): Track => ({
      id: track.id,
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown',
      albumArtUrl: track.album.images[0]?.url,
      duration: track.duration_ms / 1000,
      bpm: track.tempo,
      key: track.analysisCache?.key || 'N/A',
      genre: track.genre,
    });

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                     <Icons.Layers className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">The Crate</h1>
                        <p className="text-slate-400 text-sm">Your personal collection of sonic artifacts.</p>
                    </div>
                </div>
                 <Button onClick={() => setActiveView('admin')}><Icons.Plus className="w-4 h-4 mr-2"/> Add Tracks</Button>
            </header>
            
            <main className="flex-grow min-h-0">
                <CosmicLibraryGrid
                    tracks={filteredTracks.map(trackToCosmicTrack)}
                    searchQuery={globalSearchTerm}
                    onTrackLoad={(cosmicTrack) => {
                        const originalTrack = filteredTracks.find(t => t.id === cosmicTrack.id);
                        if(originalTrack) handleLoadTrack(originalTrack);
                    }}
                />
            </main>
            {trackToShare && (
                <ShareTrackModal
                    track={trackToShare}
                    onClose={() => setTrackToShare(null)}
                    onPost={handlePost}
                />
            )}
        </div>
    );
};

export default Library;