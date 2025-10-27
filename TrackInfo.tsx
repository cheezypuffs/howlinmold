// components/deck/TrackInfo.tsx
import React from 'react';
import type { DeckState } from '../../types';
import { formatTime } from '../../utils/helpers';
import { Badge } from '../ui/badge';

interface TrackInfoProps {
    deckState: DeckState;
    isMaster: boolean;
}

const TrackInfo: React.FC<TrackInfoProps> = ({ deckState, isMaster }) => {
    const { title, artist, bpm, key, duration } = deckState;

    return (
        <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-white truncate" title={title}>{title}</p>
                {isMaster && <Badge className="bg-pink-500/80 border-pink-400 text-white flex-shrink-0">MASTER</Badge>}
            </div>
            
            <div className="flex items-baseline gap-4 text-xs font-mono text-slate-400">
                <span>{bpm ? `${bpm.toFixed(1)} BPM` : '--- BPM'}</span>
                <span>{key || '--'}</span>
                <span>{formatTime(duration)}</span>
            </div>
        </div>
    );
};

export default TrackInfo;