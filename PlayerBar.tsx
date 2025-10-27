// FIX: Import `useMemo` from React to resolve "Cannot find name 'useMemo'" errors.
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Cloudcast } from '../types';
import { formatTime } from '../utils/helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../utils/cn';

interface PlayerBarProps {
  cloudcast: Cloudcast | null;
  playerState: {
    isPlaying: boolean;
    duration: number;
    currentTime: number;
  };
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (time: number) => void;
}

const CollapsedView: React.FC<PlayerBarProps> = ({ cloudcast, playerState, onPlayPause, onSeek }) => {
    const { isPlaying, duration, currentTime } = playerState;
    return (
        <div className="h-full flex items-center gap-6 px-6 relative z-10">
            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-[300px] p-3 rounded-lg">
                {cloudcast?.artworkUrl ? (
                    <div><img src={cloudcast.artworkUrl} alt={cloudcast.title} className="w-16 h-16 rounded-lg object-cover" /></div>
                ) : (
                    <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 to-cyan-500">
                        <Icons.Music className="w-8 h-8 text-black" />
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[var(--hm-cream)] truncate">{cloudcast?.title || 'No track loaded'}</div>
                    <div className="text-xs text-[var(--hm-cream)]/60 truncate">{cloudcast?.uploaderName || 'Select a track'}</div>
                </div>
            </div>
            {/* Transport & Progress */}
            <div className="flex-1 flex flex-col items-center gap-2">
                <Button onClick={onPlayPause} size="icon" className="w-10 h-10 rounded-full bg-white text-black">
                    {isPlaying ? <Icons.Pause className="w-5 h-5" /> : <Icons.Play className="w-5 h-5" />}
                </Button>
                {cloudcast && (
                    <div className="w-full max-w-md flex items-center gap-2">
                        <span className="text-xs text-[var(--hm-cream)]/40 tabular-nums">{formatTime(currentTime)}</span>
                        <div
                            className="flex-1 h-1.5 rounded-full cursor-pointer relative group bg-white/10"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const percent = (e.clientX - rect.left) / rect.width;
                                onSeek?.(percent * duration);
                            }}
                        >
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
                                animate={{ width: `${(duration > 0 ? currentTime / duration : 0) * 100}%` }}
                                transition={{ duration: 0.1, ease: 'linear' }}
                            />
                        </div>
                        <span className="text-xs text-[var(--hm-cream)]/40 tabular-nums">{formatTime(duration)}</span>
                    </div>
                )}
            </div>
            <div className="min-w-[300px]"></div>
        </div>
    );
};

const ExpandedView: React.FC<PlayerBarProps> = ({ cloudcast, playerState, onSeek }) => {
    if (!cloudcast) return null;
    const { currentTime } = playerState;
    
    const [activeTab, setActiveTab] = useState('tracklist');

    const currentTrackIndex = useMemo(() => {
        if (!cloudcast.tracklist) return -1;
        // Find the last track whose start time is before the current time
        return cloudcast.tracklist.slice().reverse().findIndex(t => t.startTime <= currentTime);
    }, [currentTime, cloudcast.tracklist]);

    const currentChapterIndex = useMemo(() => {
         if (!cloudcast.chapters) return -1;
        return cloudcast.chapters.slice().reverse().findIndex(c => c.startTime <= currentTime);
    }, [currentTime, cloudcast.chapters]);


    return (
        <div className="h-full p-6 flex flex-col gap-6 text-white">
            <div className="flex-shrink-0 flex gap-6">
                <img src={cloudcast.artworkUrl} alt={cloudcast.title} className="w-48 h-48 rounded-lg shadow-lg" />
                <div className="flex flex-col">
                    <h2 className="text-4xl font-bold">{cloudcast.title}</h2>
                    <p className="text-lg text-slate-300 mt-2">by {cloudcast.uploaderName}</p>
                    <p className="text-sm text-slate-400 mt-4 max-w-lg">{cloudcast.description}</p>
                </div>
            </div>
            <div className="flex-grow min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-black/30">
                        <TabsTrigger value="tracklist" disabled={!cloudcast.tracklist || cloudcast.tracklist.length === 0}>Tracklist</TabsTrigger>
                        <TabsTrigger value="chapters" disabled={!cloudcast.chapters || cloudcast.chapters.length === 0}>Chapters</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tracklist" className="mt-4 h-[calc(50vh-250px)]">
                        <ScrollArea className="h-full pr-4">
                            <div className="space-y-2">
                                {cloudcast.tracklist?.map((trackEvent, index) => (
                                    <button key={index} onClick={() => onSeek?.(trackEvent.startTime)} className={cn(
                                        'w-full p-3 rounded-lg flex items-center gap-4 text-left transition-colors',
                                        currentTrackIndex !== -1 && index === (cloudcast.tracklist!.length - 1 - currentTrackIndex) ? 'bg-purple-500/20' : 'hover:bg-white/10'
                                    )}>
                                        <span className="font-mono text-xs text-slate-400">{formatTime(trackEvent.startTime)}</span>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-white">{trackEvent.track.title}</p>
                                            <p className="text-sm text-slate-300">{trackEvent.track.artist}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="chapters" className="mt-4 h-[calc(50vh-250px)]">
                         <ScrollArea className="h-full pr-4">
                            <div className="space-y-2">
                                {cloudcast.chapters?.map((chapter, index) => (
                                    <button key={index} onClick={() => onSeek?.(chapter.startTime)} className={cn(
                                        'w-full p-3 rounded-lg flex items-center gap-4 text-left transition-colors',
                                         currentChapterIndex !== -1 && index === (cloudcast.chapters!.length - 1 - currentChapterIndex) ? 'bg-purple-500/20' : 'hover:bg-white/10'
                                    )}>
                                        <span className="font-mono text-xs text-slate-400">{formatTime(chapter.startTime)}</span>
                                        <p className="font-semibold text-white">{chapter.title}</p>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};


export function PlayerBar(props: PlayerBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 backdrop-blur-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(27, 28, 58, 0.85) 0%, rgba(10, 10, 20, 0.9) 100%)',
        borderTop: '1px solid rgba(214, 181, 93, 0.4)',
      }}
      animate={{ height: isExpanded ? '50vh' : '8rem' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
        <Button onClick={() => setIsExpanded(!isExpanded)} size="icon" variant="ghost" className="absolute top-4 right-4 z-20 text-slate-400 hover:bg-white/10 hover:text-white">
            <Icons.ChevronDown className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")} />
        </Button>
      <AnimatePresence mode="wait">
        <motion.div
            key={isExpanded ? 'expanded' : 'collapsed'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
        >
            {isExpanded ? <ExpandedView {...props} /> : <CollapsedView {...props} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}