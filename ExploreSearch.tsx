// components/ExploreSearch.tsx
// FIX: Added React import to solve JSX errors.
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RangeSlider } from './ui/RangeSlider';
import { Tooltip } from './ui/Tooltip';
// FIX: The `SearchState` interface is not what's being used for the `searchState` variable. The variable holds a string status.
import type { BlogPost } from '../types';
import ResultCard from './ResultCard';
import AlbumDetailModal from './AlbumDetailModal';

// Mock data - in a real app, this would come from an API
const MOCK_BLOG_POSTS: BlogPost[] = [
    { id: 'techno_001', post_title: 'The Unrelenting Pulse of Berlin Techno', summary: 'A deep dive into the hypnotic and industrial sounds that define the Berghain experience.', url: '#', blog_name: 'Resident Advisor', year: 2022, artist: 'Various Artists', album: 'Berghain 09', author: 'Jane Doe', tags: ['berlin', 'berghain', 'industrial'], genre: 'techno', vibe_tags: ['dark', 'driving', 'hypnotic'], geography: ['Germany'], generatedCoverArtUrl: 'https://picsum.photos/seed/techno_001/400/300' },
    { id: 'house_001', post_title: 'Revisiting the Soul of Chicago House', summary: 'Exploring the roots of house music with Frankie Knuckles and the Warehouse.', url: '#', blog_name: 'DJ Mag', year: 2021, artist: 'Frankie Knuckles', album: 'The Whistle Song', author: 'John Smith', tags: ['chicago', 'frankie-knuckles', 'classic'], genre: 'house', vibe_tags: ['soulful', 'uplifting', 'groovy'], geography: ['USA'], generatedCoverArtUrl: 'https://picsum.photos/seed/house_001/400/300' },
    { id: 'dnb_002', post_title: 'The Art of the Roller: Liquid D&B Essentials', summary: 'Smooth, soulful, and relentlessly groovy. A look at the key tracks defining modern liquid drum & bass.', url: '#', blog_name: 'UKF', year: 2023, artist: 'Calibre', album: 'Even If', author: 'Emily White', tags: ['liquid', 'soulful', 'calibre'], genre: 'dnb', vibe_tags: ['smooth', 'melodic', 'deep'], geography: ['UK'], generatedCoverArtUrl: 'https://picsum.photos/seed/dnb_002/400/300' },
    { id: 'ambient_003', post_title: 'Brian Eno and the Invention of Ambient Music', summary: 'How "Music for Airports" changed the way we think about sound and space forever.', url: '#', blog_name: 'Pitchfork', year: 2020, artist: 'Brian Eno', album: 'Ambient 1: Music for Airports', author: 'Sam Blue', tags: ['eno', 'pioneer', 'generative'], genre: 'ambient', vibe_tags: ['ethereal', 'minimalist', 'calm'], geography: ['UK'], generatedCoverArtUrl: 'https://picsum.photos/seed/ambient_003/400/300' },
];

// FIX: Define a type for the search status string literals.
type SearchStatus = 'loading' | 'no_results' | 'has_results';

const ExploreSearch: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [yearRange, setYearRange] = useState<[number, number]>([1970, 2024]);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    
    // Debounced search term for smoother filtering and loading states
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300); // 300ms debounce delay
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredPosts = useMemo(() => {
        const lowerSearch = debouncedSearchTerm.toLowerCase().trim();

        return MOCK_BLOG_POSTS.filter(post => {
            const matchesYear = post.year >= yearRange[0] && post.year <= yearRange[1];
            if (!matchesYear) return false;
            
            if (lowerSearch === '') return true;

            return (
                post.post_title.toLowerCase().includes(lowerSearch) ||
                post.artist.toLowerCase().includes(lowerSearch) ||
                post.album.toLowerCase().includes(lowerSearch) ||
                post.summary.toLowerCase().includes(lowerSearch) ||
                (post.tags && post.tags.some(t => t.toLowerCase().includes(lowerSearch))) ||
                (post.vibe_tags && post.vibe_tags.some(t => t.toLowerCase().includes(lowerSearch)))
            );
        });
    }, [debouncedSearchTerm, yearRange]);

    // Refined state derivation logic to correctly handle all states, including "cleared".
    // FIX: Changed the type annotation to match the return values of the useMemo hook.
    // FIX: This logic was flawed. It would incorrectly show "no_results" when clearing the search.
    // The new logic correctly handles the debouncing state and shows results when the input is empty.
    const searchState: SearchStatus = useMemo(() => {
        const isDebouncing = searchTerm.trim().toLowerCase() !== debouncedSearchTerm.trim().toLowerCase();

        if (isDebouncing) {
            return 'loading';
        }
        if (filteredPosts.length === 0 && debouncedSearchTerm.trim() !== '') {
            return 'no_results';
        }
        return 'has_results';
    }, [searchTerm, debouncedSearchTerm, filteredPosts.length]);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex flex-col min-h-0"
        >
            <div className="flex-shrink-0 flex items-center gap-4 mb-6">
                <Tooltip text="Back to Explore Portal">
                    <Button onClick={onBack} variant="outline" size="icon" className="border-white/20"><Icons.ExploreIcon className="w-5 h-5" /></Button>
                </Tooltip>
                <div className="relative flex-grow">
                    <Icons.SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by artist, album, genre, or vibe..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 h-14 text-lg bg-black/30"
                    />
                </div>
                <div className="w-64 bg-black/30 rounded-lg p-3">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                        <span>{yearRange[0]}</span>
                        <span>Year Range</span>
                        <span>{yearRange[1]}</span>
                    </div>
                    <RangeSlider
                        min={1970}
                        max={2024}
                        step={1}
                        value={yearRange}
                        onValueChange={setYearRange}
                    />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto">
                <AnimatePresence mode="wait">
                    {/* FIX: Comparison is now valid because searchState is a string literal type. */}
                    {searchState === 'loading' && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
                            <Icons.Loader className="w-12 h-12 animate-spin mb-4" />
                            <p>Searching the archives...</p>
                        </motion.div>
                    )}
                    {/* FIX: Comparison is now valid. */}
                    {searchState === 'no_results' && (
                        <motion.div key="no_results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
                            <Icons.XCircle className="w-16 h-16 mb-4" />
                            <p>No results found for "{debouncedSearchTerm}".</p>
                        </motion.div>
                    )}
                    {/* FIX: Comparison is now valid. */}
                    {searchState === 'has_results' && (
                         <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
                            {filteredPosts.map(post => (
                                <ResultCard key={post.id} post={post} onSelect={() => setSelectedPost(post)} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <AlbumDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        </motion.div>
    );
};

export default ExploreSearch;