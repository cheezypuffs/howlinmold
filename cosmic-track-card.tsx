import React, { useState } from 'react';
import { motion, AnimatePresence } from '../motion';
import * as Icons from '../Icons';
import { Music } from 'lucide-react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArtUrl?: string;
  duration: number;
  bpm?: number;
  key?: string;
  genre?: string;
}

interface CosmicTrackCardProps {
  track: Track;
  onClick?: () => void;
  onPlay?: () => void;
  onLoad?: () => void;
  isSelected?: boolean;
  isPlaying?: boolean;
  showDetails?: boolean;
}

export const CosmicTrackCard: React.FC<CosmicTrackCardProps> = ({
  track,
  onClick,
  onPlay,
  onLoad,
  isSelected = false,
  isPlaying = false,
  showDetails = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      onHoverStart={() => {
        setIsHovered(true);
        setShowPlayButton(true);
      }}
      onHoverEnd={() => {
        setIsHovered(false);
        if (!isPlaying) setShowPlayButton(false);
      }}
      onClick={onClick}
      className="cursor-pointer group relative"
      layout
      animate={{
        y: isHovered ? -4 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Card container */}
      <div
        className="rounded-xl overflow-hidden relative transition-all duration-300"
        style={{
          background: isSelected
            ? 'linear-gradient(135deg, rgba(214, 181, 93, 0.15), rgba(44, 225, 208, 0.1))'
            : 'linear-gradient(135deg, rgba(27, 28, 58, 0.4) 0%, rgba(10, 10, 20, 0.5) 100%)',
          backdropFilter: 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: 'blur(12px) saturate(150%)',
          border: isSelected
            ? '1.5px solid rgba(214, 181, 93, 0.5)'
            : '1px solid rgba(214, 181, 93, 0.15)',
          boxShadow: isSelected
            ? `
                0 8px 32px rgba(0, 0, 0, 0.5),
                0 0 30px rgba(214, 181, 93, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `
            : `
                0 4px 16px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `
        }}
      >
        {/* Hover glow overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(214, 181, 93, 0.1), rgba(44, 225, 208, 0.1))',
                filter: 'blur(20px)'
              }}
            />
          )}
        </AnimatePresence>

        {/* Album art container */}
        <div className="relative aspect-square overflow-hidden">
          {track.albumArtUrl ? (
            <motion.img
              src={track.albumArtUrl}
              alt={track.title}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.3 }}
              style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)' }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--hm-gold), var(--hm-cyan))',
                boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              <Music className="w-16 h-16" style={{ color: 'var(--hm-black)', opacity: 0.7 }} />
            </div>
          )}

          {/* Play/Pause overlay */}
          <AnimatePresence>
            {(showPlayButton || isPlaying) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.();
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: 'linear-gradient(135deg, var(--hm-gold), var(--hm-cyan))',
                    boxShadow: '0 8px 24px rgba(214, 181, 93, 0.6), 0 0 40px rgba(214, 181, 93, 0.4)'
                  }}
                >
                  {isPlaying ? (
                    <Icons.Pause className="w-8 h-8" style={{ color: 'var(--hm-black)' }} />
                  ) : (
                    <Icons.Play className="w-8 h-8" style={{ color: 'var(--hm-black)' }} />
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Duration badge */}
          <div
            className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              color: 'var(--hm-cream)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            {formatDuration(track.duration)}
          </div>
        </div>

        {/* Track info */}
        <div className="p-4 space-y-2">
          <div>
            <h3 
              className="font-medium truncate text-sm"
              style={{ 
                color: 'var(--hm-cream)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
              }}
            >
              {track.title}
            </h3>
            <p 
              className="text-xs truncate"
              style={{ 
                color: 'var(--hm-cream)',
                opacity: 0.7,
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.6)'
              }}
            >
              {track.artist}
            </p>
          </div>

          {/* Extra details */}
          {showDetails && (track.bpm || track.key || track.genre) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {track.bpm && (
                <div
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(214, 181, 93, 0.15)',
                    border: '1px solid rgba(214, 181, 93, 0.3)',
                    color: 'var(--hm-gold)'
                  }}
                >
                  {track.bpm.toFixed(1)} BPM
                </div>
              )}
              {track.key && (
                <div
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(44, 225, 208, 0.15)',
                    border: '1px solid rgba(44, 225, 208, 0.3)',
                    color: 'var(--hm-cyan)'
                  }}
                >
                  {track.key}
                </div>
              )}
              {track.genre && (
                <div
                  className="px-2 py-1 rounded text-xs"
                  style={{
                    background: 'rgba(255, 107, 157, 0.15)',
                    border: '1px solid rgba(255, 107, 157, 0.3)',
                    color: 'var(--cosmic-accent-pink)'
                  }}
                >
                  {track.genre}
                </div>
              )}
            </div>
          )}

          {/* Load button */}
          {onLoad && (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onLoad();
              }}
              className="w-full py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: 'rgba(214, 181, 93, 0.1)',
                border: '1px solid rgba(214, 181, 93, 0.3)',
                color: 'var(--hm-gold)'
              }}
              whileHover={{
                background: 'rgba(214, 181, 93, 0.2)',
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
            >
              Load to Deck
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
