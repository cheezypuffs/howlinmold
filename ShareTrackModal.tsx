// components/ShareTrackModal.tsx
import React, { useState } from 'react';
import type { SpotifyTrackData } from '../types';
import { motion, AnimatePresence } from './motion';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import * as Icons from './Icons';

interface ShareTrackModalProps {
    track: SpotifyTrackData;
    onClose: () => void;
    onPost: (details: { content: string; tags: string[] }) => void;
}

const ShareTrackModal: React.FC<ShareTrackModalProps> = ({ track, onClose, onPost }) => {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSubmit = () => {
        if (!content.trim()) return;
        const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
        onPost({ content, tags: tagArray });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900/80 border border-purple-500/20 rounded-2xl w-full max-w-lg flex flex-col p-6 shadow-2xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-white">Share to Journal</h2>
                        <Button onClick={onClose} size="icon" variant="ghost"><Icons.X className="w-5 h-5" /></Button>
                    </div>

                    <div className="flex gap-4 mb-4 p-4 bg-black/20 rounded-lg">
                        <img
                            src={track.album.images[0]?.url}
                            alt={track.album.name}
                            className="w-24 h-24 rounded-md object-cover flex-shrink-0"
                        />
                        <div className="flex flex-col justify-center min-w-0">
                            <p className="text-lg font-bold truncate text-white">{track.name}</p>
                            <p className="text-slate-300 truncate">{track.artists.map(a => a.name).join(', ')}</p>
                            <p className="text-sm text-slate-400 truncate">{track.album.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Why does this track resonate with you?"
                            className="bg-black/30 min-h-[120px]"
                            rows={4}
                        />
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Add tags, comma-separated (e.g., deep-house, nostalgic)"
                            className="bg-black/30"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={!content.trim()} className="bg-purple-600 hover:bg-purple-700">
                            <Icons.Send className="w-4 h-4 mr-2" /> Post to Journal
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ShareTrackModal;