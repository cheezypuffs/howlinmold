import React, { useState, useMemo } from 'react';
import { motion } from './motion';
import { CosmicTrackCard, Track } from './ui/cosmic-track-card';
import * as Icons from './Icons';

interface CosmicLibraryGridProps {
  tracks: Track[];
  onTrackClick?: (track: Track) => void;
  onTrackPlay?: (track: Track) => void;
  onTrackLoad?: (track: Track) => void;
  selectedTrackId?: string;
  playingTrackId?: string;
  showDetails?: boolean;
  searchQuery: string;
}

export const CosmicLibraryGrid: React.FC<CosmicLibraryGridProps> = ({
  tracks,
  onTrackClick,
  onTrackPlay,
  onTrackLoad,
  selectedTrackId,
  playingTrackId,
  showDetails = false,
  searchQuery,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Extract unique genres
  const genres = useMemo(() => {
    const genreSet = new Set<string>();
    tracks.forEach(track => {
      if (track.genre) {
        track.genre.split(',').forEach(g => genreSet.add(g.trim()));
      }
    });
    return Array.from(genreSet).sort();
  }, [tracks]);

  // Filter tracks
  const filteredTracks = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    return tracks.filter(track => {
      const matchesSearch = !lowercasedQuery ||
        track.title.toLowerCase().includes(lowercasedQuery) ||
        track.artist.toLowerCase().includes(lowercasedQuery) ||
        (track.genre && track.genre.toLowerCase().includes(lowercasedQuery));
      
      const matchesGenre = selectedGenre === null || (track.genre && track.genre.toLowerCase().includes(selectedGenre.toLowerCase()));
      
      return matchesSearch && matchesGenre;
    });
  }, [tracks, searchQuery, selectedGenre]);

  const trackCount = filteredTracks.length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header with search and filters */}
      <div className="space-y-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--hm-cream)' }}>
              Your Library
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--hm-cream)', opacity: 0.6 }}>
              {trackCount} {trackCount === 1 ? 'track' : 'tracks'}
            </p>
          </div>
          
          {/* View toggle */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: 'rgba(214, 181, 93, 0.1)',
                border: '1px solid rgba(214, 181, 93, 0.3)',
                color: 'var(--hm-gold)'
              }}
            >
              <Icons.Grid className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: 'rgba(214, 181, 93, 0.05)',
                border: '1px solid rgba(214, 181, 93, 0.15)',
                color: 'var(--hm-gold)',
                opacity: 0.6
              }}
            >
              <Icons.ListMusic className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Genre filter */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: selectedGenre === null
                  ? 'linear-gradient(135deg, rgba(214, 181, 93, 0.2), rgba(44, 225, 208, 0.1))'
                  : 'rgba(214, 181, 93, 0.05)',
                border: selectedGenre === null
                  ? '1px solid rgba(214, 181, 93, 0.4)'
                  : '1px solid rgba(214, 181, 93, 0.2)',
                color: 'var(--hm-gold)',
                boxShadow: selectedGenre === null
                  ? '0 2px 8px rgba(214, 181, 93, 0.2)'
                  : 'none'
              }}
            >
              All
            </button>
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: selectedGenre === genre
                    ? 'linear-gradient(135deg, rgba(214, 181, 93, 0.2), rgba(44, 225, 208, 0.1))'
                    : 'rgba(214, 181, 93, 0.05)',
                  border: selectedGenre === genre
                    ? '1px solid rgba(214, 181, 93, 0.4)'
                    : '1px solid rgba(214, 181, 93, 0.2)',
                  color: 'var(--hm-gold)',
                  boxShadow: selectedGenre === genre
                    ? '0 2px 8px rgba(214, 181, 93, 0.2)'
                    : 'none'
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-2">
        {filteredTracks.length === 0 ? (
            <div
            className="text-center py-16 rounded-xl h-full flex flex-col items-center justify-center"
            style={{
                background: 'linear-gradient(135deg, rgba(27, 28, 58, 0.3), rgba(10, 10, 20, 0.4))',
                border: '1px dashed rgba(214, 181, 93, 0.2)'
            }}
            >
            <Icons.Music className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--hm-gold)', opacity: 0.3 }} />
            <p style={{ color: 'var(--hm-cream)', opacity: 0.6 }}>
                No tracks found
            </p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredTracks.map(track => (
                <CosmicTrackCard
                key={track.id}
                track={track}
                onClick={() => onTrackClick?.(track)}
                onPlay={() => onTrackPlay?.(track)}
                onLoad={() => onTrackLoad?.(track)}
                isSelected={selectedTrackId === track.id}
                isPlaying={playingTrackId === track.id}
                showDetails={showDetails}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export type { Track };