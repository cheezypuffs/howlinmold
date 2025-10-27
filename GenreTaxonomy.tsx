import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import type { GenreCluster, GenreIndex } from '../types';

// Mock data - in a real app, this would be fetched from a database
const MOCK_GENRE_INDEX: GenreIndex = {
    genres: [
        { name: 'Techno', path: 'techno' },
        { name: 'House', path: 'house' },
        { name: 'Drum & Bass', path: 'dnb' },
        { name: 'Ambient', path: 'ambient' },
        { name: 'Jazz', path: 'jazz' },
        { name: 'Rock', path: 'rock' },
    ]
};

const MOCK_GENRE_CLUSTERS: Record<string, GenreCluster> = {
    'techno': { genre: 'techno', display_name: 'Techno', description: 'A genre of electronic dance music characterized by a repetitive four on the floor beat.', tags: ['electronic', 'dance', '4/4'], related_genres: ['house', 'trance', 'industrial'], featured_artists: ['Jeff Mills', 'Richie Hawtin', 'Charlotte de Witte'], blog_posts: [{ id: 'techno_001', title: 'The Unrelenting Pulse of Berlin Techno', summary: 'A deep dive into the hypnotic and industrial sounds that define the Berghain experience.', featured_album: { artist: 'Various Artists', album: 'Berghain 09', year: 2022 }, vibe_tags: ['dark', 'driving', 'hypnotic'], geography: ['Germany'] }] },
    'house': { genre: 'house', display_name: 'House', description: 'Originating in Chicago, known for its soulful vocals and disco samples.', tags: ['electronic', 'dance', 'disco'], related_genres: ['techno', 'garage', 'nu-disco'], featured_artists: ['Frankie Knuckles', 'Larry Levan', 'Kerri Chandler'], blog_posts: [{ id: 'house_001', title: 'Revisiting the Soul of Chicago House', summary: 'Exploring the roots of house music with Frankie Knuckles and the Warehouse.', featured_album: { artist: 'Frankie Knuckles', album: 'The Whistle Song', year: 1991 }, vibe_tags: ['soulful', 'uplifting', 'groovy'], geography: ['USA'] }] },
    'dnb': { genre: 'dnb', display_name: 'Drum & Bass', description: 'Defined by fast breakbeats (typically 160–180 bpm) and heavy basslines.', tags: ['electronic', 'breakbeat', 'jungle'], related_genres: ['dubstep', 'garage'], featured_artists: ['Goldie', 'Andy C', 'Calibre'], blog_posts: [{ id: 'dnb_002', title: 'The Art of the Roller: Liquid D&B Essentials', summary: 'Smooth, soulful, and relentlessly groovy. A look at the key tracks defining modern liquid drum & bass.', featured_album: { artist: 'Calibre', album: 'Even If', year: 2010 }, vibe_tags: ['smooth', 'melodic', 'deep'], geography: ['UK'] }] },
    'ambient': { genre: 'ambient', display_name: 'Ambient', description: 'A style of music emphasizing tone and atmosphere over traditional musical structure.', tags: ['electronic', 'textural', 'atmospheric'], related_genres: ['drone', 'new-age'], featured_artists: ['Brian Eno', 'Aphex Twin', 'Stars of the Lid'], blog_posts: [{ id: 'ambient_003', title: 'Brian Eno and the Invention of Ambient Music', summary: 'How "Music for Airports" changed the way we think about sound and space forever.', featured_album: { artist: 'Brian Eno', album: 'Ambient 1: Music for Airports', year: 1978 }, vibe_tags: ['ethereal', 'minimalist', 'calm'], geography: ['UK'] }] },
    'jazz': { genre: 'jazz', display_name: 'Jazz', description: 'An American music genre characterized by swing and blue notes, complex chords, and improvisation.', tags: ['improvisation', 'swing', 'blues'], related_genres: ['soul', 'funk', 'fusion'], featured_artists: ['Miles Davis', 'John Coltrane', 'Herbie Hancock'], blog_posts: [] },
    'rock': { genre: 'rock', display_name: 'Rock', description: 'A broad genre of popular music that originated as "rock and roll" in the United States in the 1950s.', tags: ['guitar', 'drums', 'vocals'], related_genres: ['punk', 'metal', 'indie'], featured_artists: ['Led Zeppelin', 'The Beatles', 'Pink Floyd'], blog_posts: [] },
};


const GenreTaxonomy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeGenrePath = MOCK_GENRE_INDEX.genres[activeIndex]?.path;
    const activeCluster = MOCK_GENRE_CLUSTERS[activeGenrePath];

    const handleSelectGenre = (path: string) => {
        const index = MOCK_GENRE_INDEX.genres.findIndex(g => g.path === path);
        if (index > -1) {
            setActiveIndex(index);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex min-h-0"
        >
            <div className="w-1/4 flex-shrink-0 flex flex-col border-r border-white/10 pr-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button onClick={onBack} variant="outline" size="icon" className="border-white/20"><Icons.GitBranch className="w-5 h-5" /></Button>
                    <h2 className="text-xl font-bold">Genre Index</h2>
                </div>
                <ScrollArea>
                    <nav className="flex flex-col gap-1 pr-2">
                        {MOCK_GENRE_INDEX.genres.map((genre, index) => (
                            <button
                                key={genre.path}
                                onClick={() => setActiveIndex(index)}
                                className={`w-full text-left p-3 rounded-md text-sm font-medium transition-colors ${activeIndex === index ? 'bg-purple-500/20 text-purple-200' : 'text-slate-300 hover:bg-white/10'}`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </nav>
                </ScrollArea>
            </div>
            <div className="flex-grow pl-6">
                <AnimatePresence mode="wait">
                    {activeCluster && (
                        <motion.div
                            key={activeCluster.genre}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <ScrollArea className="h-full pr-4">
                                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{activeCluster.display_name}</h1>
                                <p className="text-lg text-slate-300 mt-2 italic">{activeCluster.description}</p>
                                
                                <div className="my-6 border-t border-white/10" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-bold text-slate-300 mb-2">Featured Artists</h3>
                                            <ul className="list-disc list-inside text-slate-400">
                                                {activeCluster.featured_artists.map(artist => <li key={artist}>{artist}</li>)}
                                            </ul>
                                        </div>
                                         <div>
                                            <h3 className="font-bold text-slate-300 mb-2">Related Genres</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {activeCluster.related_genres.map(genrePath => (
                                                    <Button key={genrePath} onClick={() => handleSelectGenre(genrePath)} variant="outline" size="sm" className="border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10">
                                                        {MOCK_GENRE_CLUSTERS[genrePath]?.display_name || genrePath}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-300 mb-2">Key Blog Posts</h3>
                                        <div className="space-y-4">
                                            {activeCluster.blog_posts.length > 0 ? activeCluster.blog_posts.map(post => (
                                                <div key={post.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                                                    <p className="font-semibold text-white">{post.title}</p>
                                                    <p className="text-sm text-slate-400">{post.featured_album.artist} - "{post.featured_album.album}" ({post.featured_album.year})</p>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {post.vibe_tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-slate-500">No archived posts for this genre yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default GenreTaxonomy;