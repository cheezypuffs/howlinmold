import React from 'react';
import type { QueuedTrack } from '../../types';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import * as Icons from '../Icons';

interface SharedQueueProps {
    queue: QueuedTrack[];
    onRemove: (id: string) => void;
    onLoad: (track: QueuedTrack['track'], deckId: 'A' | 'B') => void;
}

const SharedQueue: React.FC<SharedQueueProps> = ({ queue, onRemove, onLoad }) => {
    return (
        <div className="flex flex-col h-full bg-black/20 p-2 rounded-lg">
            <h3 className="text-sm font-bold text-slate-400 p-2">Shared Queue ({queue.length})</h3>
            <ScrollArea className="flex-grow">
                {queue.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-xs">
                        Queue is empty
                    </div>
                ) : (
                    <ul className="space-y-2 p-2">
                        {queue.map(item => (
                            <li key={item.id} className="bg-slate-800/50 p-2 rounded-md flex items-center justify-between">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold truncate text-white">{item.track.name}</p>
                                    <p className="text-xs truncate text-slate-400">Added by {item.addedByName}</p>
                                </div>
                                <div className="flex-shrink-0 flex gap-1 ml-2">
                                    <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => onLoad(item.track, 'A')}>A</Button>
                                    <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => onLoad(item.track, 'B')}>B</Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onRemove(item.id)}>
                                        <Icons.X className="w-3 h-3 text-red-400" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </ScrollArea>
        </div>
    );
};

export default SharedQueue;
