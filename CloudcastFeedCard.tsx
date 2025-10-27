// components/CloudcastFeedCard.tsx
import React from 'react';
import { motion } from './motion';
import type { Cloudcast } from '../types';
import * as Icons from './Icons';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { formatTime } from '../utils/helpers';

interface CloudcastFeedCardProps {
    cloudcast: Cloudcast;
    onPlay: () => void;
    onViewUploader: () => void;
    isPlaying: boolean;
}

const CloudcastFeedCard: React.FC<CloudcastFeedCardProps> = ({ cloudcast, onPlay, onViewUploader, isPlaying }) => {
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col md:flex-row gap-6 p-6"
        >
            <div className="md:w-1/3 flex-shrink-0 relative group cursor-pointer" onClick={onPlay}>
                <img src={cloudcast.artworkUrl} alt={cloudcast.title} className="w-full aspect-square object-cover rounded-lg shadow-lg" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                        {isPlaying ? <Icons.Pause className="w-8 h-8 text-white"/> : <Icons.Play className="w-8 h-8 text-white" />}
                    </div>
                </div>
            </div>
            <div className="flex-grow flex flex-col">
                <h2 className="text-3xl font-bold text-white">{cloudcast.title}</h2>
                <div className="flex items-center gap-3 mt-2 cursor-pointer" onClick={onViewUploader}>
                    <Avatar className="w-8 h-8"><img src={cloudcast.uploaderAvatarUrl} alt={cloudcast.uploaderName} /></Avatar>
                    <span className="text-sm font-semibold text-slate-300 hover:text-purple-300 transition-colors">{cloudcast.uploaderName}</span>
                </div>
                <p className="text-slate-400 mt-4 text-sm flex-grow">{cloudcast.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                    {cloudcast.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10 text-sm text-slate-500">
                    <span>{new Date(cloudcast.timestamp).toLocaleDateString()}</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Icons.Play className="w-4 h-4" /> {cloudcast.plays.toLocaleString()}</span>
                        <span className="flex items-center gap-1.5"><Icons.Clock className="w-4 h-4" /> {formatTime(cloudcast.duration)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CloudcastFeedCard;
