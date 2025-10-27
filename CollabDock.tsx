import React, { useState, useRef, useContext, useEffect } from "react";
import type { User, DeckState, AppState, DeckId } from '../types';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CollaborationContext } from "../contexts/CollaborationContext";
import { useToast } from "../hooks/use-toast";
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from './motion';

const ChatInput: React.FC<{ onSend: (text: string) => void }> = ({ onSend }) => {
  const [value, setValue] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value.trim());
      setValue("");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Say something..."
        className="bg-slate-800 text-sm h-9"
      />
    </form>
  );
};

const LobbyView: React.FC<{ onJoin: (roomId: string) => void; onCreate: () => void; }> = ({ onJoin, onCreate }) => {
    const [roomIdInput, setRoomIdInput] = useState("");
    const { toast } = useToast();

    const handleJoin = () => {
        let idToJoin = roomIdInput.trim().toUpperCase();
        // Handle pasting a full URL
        if (idToJoin.includes('?room=')) {
            try {
                const url = new URL(idToJoin);
                idToJoin = url.searchParams.get('room')?.toUpperCase() || '';
            } catch {
                toast({ title: "Invalid URL", description: "Could not parse Room ID from the link.", type: 'error' });
                return;
            }
        }
        if (idToJoin) {
            onJoin(idToJoin);
        } else {
            toast({ title: "Missing ID", description: "Please enter a Room ID to join.", type: 'error' });
        }
    };
    
    return (
        <div className="p-6 flex flex-col items-center justify-center">
            <h2 className="text-2xl font-bold text-white mb-4">Collaboration Rooms</h2>
            <div className="w-full space-y-3">
                <Button onClick={onCreate} className="w-full bg-emerald-600 hover:bg-emerald-500 font-medium text-lg py-6">
                    <Icons.Plus className="w-5 h-5 mr-2" /> Create New Room
                </Button>
                <div className="text-center text-xs text-slate-400 py-1">or join an existing room</div>
                <div className="flex gap-2">
                    <Input 
                        value={roomIdInput}
                        onChange={e => setRoomIdInput(e.target.value)}
                        placeholder="Enter Room ID or paste link"
                        className="flex-1 bg-slate-800 text-sm text-center font-mono h-12"
                    />
                    <Button onClick={handleJoin} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-medium h-12">
                        Join
                    </Button>
                </div>
            </div>
        </div>
    );
};

const DeckStatus: React.FC<{ deckId: DeckId; deckState: DeckState }> = ({ deckId, deckState }) => {
    if (!deckState.loaded) {
        return (
            <div className="flex items-center gap-3 p-2 rounded-md bg-slate-800/50">
                <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-slate-500 font-bold flex-shrink-0">{deckId}</div>
                <div className="flex-grow">
                    <p className="text-sm text-slate-500">Empty</p>
                </div>
            </div>
        )
    }

    const progress = deckState.duration > 0 ? (deckState.currentTime / deckState.duration) * 100 : 0;

    return (
        <div className="flex items-center gap-3 p-2 rounded-md bg-slate-800/50">
            <div className="w-10 h-10 rounded bg-slate-700 flex-shrink-0 relative">
                {deckState.albumArtUrl && <img src={deckState.albumArtUrl} alt={deckState.title} className="w-full h-full object-cover rounded" />}
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold truncate text-white" title={deckState.title}>{deckState.title}</p>
                <p className="text-xs truncate text-slate-400" title={deckState.artist}>{deckState.artist}</p>
                <div className="flex items-center gap-2 mt-1">
                    {deckState.playing ? 
                        <Icons.Play className="w-3 h-3 text-green-400 flex-shrink-0" /> : 
                        <Icons.Pause className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    }
                    <div className="w-full bg-slate-600 rounded-full h-1">
                        <div 
                            className="bg-purple-400 h-1 rounded-full" 
                            style={{ width: `${progress}%`}}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};


const ActiveRoomView: React.FC<{ appState: AppState }> = ({ appState }) => {
    const collab = useContext(CollaborationContext);
    const { toast } = useToast();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('chat');

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [collab?.chat]);

    const handleCopyInvite = () => {
        const url = `${window.location.origin}${window.location.pathname}?room=${collab?.roomId}`;
        navigator.clipboard.writeText(url);
        toast({ title: "Invite Link Copied!", description: `Room ID: ${collab?.roomId}` });
    };

    return (
        <div className="flex flex-col">
            <header className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-white">Live Room</h3>
                    <p className="text-xs text-emerald-400 font-mono">{collab?.roomId}</p>
                </div>
                <Button onClick={() => collab?.disconnect()} variant="destructive" size="sm">
                    Leave
                </Button>
            </header>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-3 bg-black/30 m-2">
                    <TabsTrigger value="session">Session</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="queue">Queue</TabsTrigger>
                </TabsList>
                <div className="flex-grow overflow-hidden p-2">
                    <TabsContent value="session" className="h-full mt-0">
                         <div className="space-y-3 h-full flex flex-col">
                            <div className="p-3 bg-black/20 rounded-lg flex-shrink-0">
                                <p className="text-xs font-bold text-slate-400 mb-2">Members ({collab?.members.length})</p>
                                <ul className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                    {collab?.members.map(m => (
                                        <li key={m.peerId} className="text-slate-200 text-sm truncate flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"/>
                                            {m.nick} {m.peerId === collab.peerId ? <span className="text-xs text-slate-500">(You)</span> : ''}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg flex-grow flex flex-col gap-2">
                                <p className="text-xs font-bold text-slate-400 mb-1 flex-shrink-0">Now Playing</p>
                                <div className="flex-grow space-y-2 flex flex-col justify-center">
                                    <DeckStatus deckId="A" deckState={appState.A} />
                                    <div className="w-full h-4 flex items-center px-1">
                                        <div className="w-full bg-slate-700 h-1 rounded-full relative">
                                            <div 
                                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-slate-900 shadow-md"
                                                style={{ left: `calc(${(appState.crossfader * 100)}% - 6px)` }}
                                            />
                                        </div>
                                    </div>
                                    <DeckStatus deckId="B" deckState={appState.B} />
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <Button onClick={handleCopyInvite} className="w-full">
                                    <Icons.Copy className="w-4 h-4 mr-2" /> Copy Invite Link
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="chat" className="h-full flex flex-col gap-2 mt-0">
                        <div ref={chatContainerRef} className="flex-grow h-32 overflow-y-auto space-y-3 text-sm p-2 bg-black/20 rounded-lg">
                             {collab?.chat.map((c)=> (
                                 <div key={c.id} className={cn("flex flex-col w-full", c.userId === collab.peerId ? "items-end" : "items-start")}>
                                    <div className="text-[10px] text-slate-400 px-1">{c.userName}</div>
                                    <div className={cn("px-3 py-2 rounded-xl max-w-[85%]", c.userId === collab.peerId ? "bg-purple-600 text-white rounded-br-none" : "bg-slate-700 text-slate-200 rounded-bl-none")}>
                                        <p className="break-words">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <ChatInput onSend={(text) => collab?.client?.chat(text)} />
                    </TabsContent>
                    <TabsContent value="queue" className="h-full mt-0">
                         <div className="p-2 bg-black/20 rounded-lg h-full flex flex-col">
                            <p className="text-xs font-bold text-slate-400 mb-2 flex-shrink-0">Shared Queue ({collab?.queue.length})</p>
                            <ul className="space-y-1 flex-grow overflow-y-auto">
                                {collab?.queue.map(item=>(
                                <li key={item.id} className="flex items-center justify-between text-sm text-slate-200 p-1 rounded hover:bg-white/5">
                                    <div className="flex flex-col truncate flex-grow">
                                        <span className="truncate font-semibold">{item.track.name}</span>
                                        <span className="truncate text-xs text-slate-400">{item.track.artists[0]?.name}</span>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0 ml-2">
                                        <Button size="sm" variant="outline" className="h-7 w-8 border-slate-600" onClick={()=>{ collab?.client?.load('A', item.track); }}>A</Button>
                                        <Button size="sm" variant="outline" className="h-7 w-8 border-slate-600" onClick={()=>{ collab?.client?.load('B', item.track); }}>B</Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:bg-red-900/50" onClick={()=> collab?.client?.removeFromQueue(item.id)}>✕</Button>
                                    </div>
                                </li>
                                ))}
                            </ul>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};


export default function CollabDock({ user, appState }: { user: User | null; appState: AppState }) {
    const collab = useContext(CollaborationContext);
    const { toast } = useToast();

    if (!collab) {
        return null;
    }

    const handleCreate = () => {
        const id = "HM-RITUAL-" + Math.random().toString(36).slice(2,8).toUpperCase();
        collab.connect(id, user?.name || 'guest');

        const url = `${window.location.origin}${window.location.pathname}?room=${id}`;
        navigator.clipboard.writeText(url);
        toast({ title: "Room Created & Invite Link Copied!", description: `Room ID: ${id}` });
    };

    const handleJoin = (roomId: string) => {
        collab.connect(roomId, user?.name || 'guest');
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 shadow-xl flex flex-col text-slate-100 z-50 rounded-2xl">
           <AnimatePresence mode="wait">
                <motion.div
                    key={collab.isConnected ? 'active' : 'lobby'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    {collab.isConnected ? (
                        <ActiveRoomView appState={appState} />
                    ) : (
                        <LobbyView onCreate={handleCreate} onJoin={handleJoin} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}