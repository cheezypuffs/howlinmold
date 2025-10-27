import React from 'react';
import type { CollabMember } from '../../types';
import * as Icons from '../Icons';
import { ScrollArea } from '../ui/scroll-area';

interface SessionPanelProps {
    members: CollabMember[];
    roomId: string | null;
}

const SessionPanel: React.FC<SessionPanelProps> = ({ members, roomId }) => {
    return (
        <div className="flex flex-col h-full bg-black/20 p-2 rounded-lg">
            <h3 className="text-sm font-bold text-slate-400 p-2">Session Info</h3>
            <div className="p-2">
                <p className="text-xs text-slate-500">ROOM ID</p>
                <p className="font-mono text-emerald-400">{roomId}</p>
            </div>
            <div className="p-2">
                <p className="text-xs text-slate-500 mb-2">MEMBERS ({members.length})</p>
                <ScrollArea className="h-24">
                    <ul className="space-y-1">
                        {members.map(m => (
                            <li key={m.peerId} className="flex items-center gap-2 text-sm text-slate-200">
                                <Icons.UserCheck className="w-4 h-4 text-emerald-400" />
                                <span>{m.nick}</span>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            </div>
        </div>
    );
};

export default SessionPanel;
