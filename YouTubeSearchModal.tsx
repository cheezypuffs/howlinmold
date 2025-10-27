import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '../hooks/use-toast';
import type { DeckId, YouTubeSearchItem } from '../types';
import { formatTime } from '../utils/helpers';
import { YT } from '../constants';

interface YouTubeSearchModalProps {
  deckId: DeckId | null;
  onClose: () => void;
  onLoad: (item: YouTubeSearchItem) => void;
}

const SearchResult: React.FC<{ item: YouTubeSearchItem; onLoad: () => void; }> = ({ item, onLoad }) => (
  <motion.div
    layout
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/10"
  >
    <img src={item.thumbnail} alt={item.title} className="w-24 h-16 rounded-md object-cover flex-shrink-0" />
    <div className="flex-grow min-w-0">
      <p className="font-semibold text-white truncate text-sm" title={item.title}>{item.title}</p>
      <p className="text-xs text-slate-400 truncate" title={item.channel}>{item.channel}</p>
    </div>
    <div className="flex-shrink-0 flex items-center gap-2">
      {item.durationSec != null && (
        <span className="text-xs font-mono text-slate-400">{formatTime(item.durationSec)}</span>
      )}
      <Button onClick={onLoad} size="sm" variant="outline" className="border-red-500/50 text-red-300 hover:bg-red-500/10">
        Load
      </Button>
    </div>
  </motion.div>
);

const YouTubeSearchModal: React.FC<YouTubeSearchModalProps> = ({ deckId, onClose, onLoad }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<YouTubeSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${YT.SEARCH_ENDPOINT}?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        throw new Error(`Search failed with status: ${res.status}`);
      }
      const data = await res.json();
      setResults(data.items || []);
    } catch (error) {
      console.error("YouTube search failed:", error);
      toast({ title: 'Search Failed', description: (error as Error).message, type: 'error' });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 500); // 500ms debounce
    return () => clearTimeout(debounceTimer);
  }, [query, handleSearch]);

  const handleLoad = (item: YouTubeSearchItem) => {
    if (deckId) {
      onLoad(item);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900/80 border border-red-500/20 rounded-2xl w-full max-w-2xl h-[70vh] flex flex-col p-6 shadow-2xl"
        >
          <div className="flex-shrink-0 flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Icons.Youtube className="w-7 h-7 text-red-500" />
              Search YouTube
            </h2>
            <Button onClick={onClose} size="icon" variant="ghost"><Icons.X className="w-5 h-5" /></Button>
          </div>
          
          <div className="flex-shrink-0 relative mb-4">
            <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a track or video..."
              className="pl-9 h-12 text-base bg-black/30"
              autoFocus
            />
          </div>

          <div className="flex-grow min-h-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center">
                  <Icons.Loader2 className="w-8 h-8 animate-spin text-red-400" />
                </motion.div>
              ) : results.length > 0 ? (
                <ScrollArea key="results" className="h-full pr-2 -mr-2">
                  <div className="space-y-2">
                    {results.map(item => (
                      <SearchResult key={item.videoId} item={item} onLoad={() => handleLoad(item)} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex items-center justify-center text-slate-500">
                  <p>{query.trim().length > 2 ? 'No results found.' : 'Start typing to search.'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default YouTubeSearchModal;