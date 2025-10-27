// components/SpotifyConnectButton.tsx
import React, { useState, useEffect } from 'react';
import type { DeckId, SpotifyAuth, SpotifyPlayerState } from '../types';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { cn } from '../utils/cn';

interface SpotifyConnectButtonProps {
    deckId: DeckId;
    auth: SpotifyAuth | null;
    playerState: SpotifyPlayerState | null;
    onConnect: () => void;
    onDisconnect: () => void;
    isConnecting?: boolean;
}

const SpotifyConnectButton: React.FC<SpotifyConnectButtonProps> = ({ deckId, auth, playerState, onConnect, onDisconnect, isConnecting }) => {
    const isConnected = auth && playerState?.isReady;
    const deckColorClass = deckId === 'A' ? 'text-cyan-400' : 'text-pink-400';
    const deckBgClass = deckId === 'A' ? 'bg-cyan-500/10 hover:bg-cyan-500/20' : 'bg-pink-500/10 hover:bg-pink-500/20';
    const deckBorderClass = deckId === 'A' ? 'border-cyan-500/30' : 'border-pink-500/30';
    
    if (isConnecting) {
        return (
             <div className="p-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 flex items-center justify-center text-xs text-yellow-300 h-10">
                <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
            </div>
        )
    }

    if (isConnected) {
        return (
            <div className={`p-2 h-10 rounded-md border ${deckBorderClass} ${deckBgClass} flex items-center justify-between text-xs`}>
                <div className="flex items-center gap-2 min-w-0">
                    <Icons.Spotify className={`w-4 h-4 ${deckColorClass} flex-shrink-0`} />
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white">Connected</span>
                        <span className={`${deckColorClass} truncate`} title={playerState?.displayName || ''}>{playerState?.displayName || '...'}</span>
                    </div>
                </div>
                <Button onClick={onDisconnect} size="sm" variant="ghost" className="h-7 text-slate-400 hover:bg-red-900/50 hover:text-red-300">
                    Disconnect
                </Button>
            </div>
        );
    }

    if (auth && !isConnected) {
        return (
            <div className="p-2 h-10 rounded-md border border-orange-500/30 bg-orange-500/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <Icons.Spotify className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-white">Session Expired</span>
                        <span className="text-orange-300">Reconnect required</span>
                    </div>
                </div>
                <Button onClick={onConnect} size="sm" variant="outline" className="h-7 border-orange-500/50 text-orange-300 hover:bg-orange-500/20">
                    Reconnect
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={onConnect} variant="outline" className="w-full h-10 border-slate-600 hover:border-green-500/50 hover:text-green-300">
            <Icons.Spotify className="w-5 h-5 mr-2 text-green-500" />
            Connect Spotify
        </Button>
    );
};

export default SpotifyConnectButton;