import React, { useMemo, useContext } from 'react';
import type { AppState, Action, DeckId, User } from '../types';
import TheOracle from './TheOracle';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { cn } from '../utils/cn';
import UserStatusButton from './UserStatusButton';
import { CollaborationContext } from '../contexts/CollaborationContext';
import { motion, AnimatePresence } from './motion';
import { CosmicSearchBar } from './ui/cosmic-search';

interface HeaderProps {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    loadTrack: (fileOrUrl: File | string, deckId: DeckId) => void;
    activeView: string;
    setActiveView: (view: string) => void;
    user: User | null;
    onLogout: () => void;
    isStale: boolean;
    deckDrift: number; // For latency harness
    globalSearchTerm: string;
    onSearchChange: (term: string) => void;
    onViewProfile: () => void;
}

const NavButton: React.FC<{
    id: string;
    label: string | React.ReactNode;
    icon: React.ElementType;
    activeView: string;
    setActiveView: (view: string) => void;
    className?: string;
    activeClassName?: string;
    onClick?: () => void;
}> = ({ id, label, icon: Icon, activeView, setActiveView, className, activeClassName, onClick }) => (
    <button
        onClick={onClick ? onClick : () => setActiveView(id)}
        className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
            activeView === id
                ? (activeClassName || "bg-white/10 text-white")
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
            className
        )}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);

const LatencyHarness: React.FC<{ drift: number }> = ({ drift }) => {
    const absDrift = Math.abs(drift);
    let color = 'text-green-400';
    if (absDrift > 5) color = 'text-red-500';
    else if (absDrift > 2) color = 'text-yellow-400';

    return (
        <div className={cn("text-xs font-mono transition-colors", color)} title="Deck Sync Drift (Latency Harness)">
            &Delta; {drift.toFixed(1)}ms
        </div>
    );
};

const AnimatedRadioIconForNav = (props: { className: string }) => (
    <Icons.AnimatedIcon.Radio>
        <Icons.Radio className={props.className} />
    </Icons.AnimatedIcon.Radio>
);

const Header: React.FC<HeaderProps> = ({
    state,
    dispatch,
    loadTrack,
    activeView,
    setActiveView,
    user,
    onLogout,
    isStale,
    deckDrift,
    globalSearchTerm,
    onSearchChange,
    onViewProfile,
}) => {
    const collab = useContext(CollaborationContext);
    const navItems = useMemo(() => {
        const baseItems = [
            { id: 'deck', label: 'Decks', icon: Icons.HomeIcon },
            { id: 'journal', label: 'The Pack', icon: Icons.PackIcon },
            { id: 'radio', label: 'Radio', icon: AnimatedRadioIconForNav },
            { id: 'crate', label: <div className="flex flex-col items-start -my-1 leading-tight"><span className="text-xs">The</span><span>Crate</span></div>, icon: Icons.Layers },
            { id: 'cloudcasts', label: 'Cloudcasts', icon: Icons.Cloud },
            { id: 'explore', label: 'Explore', icon: Icons.ExploreIcon },
            { id: 'vinyls', label: 'Vinyls', icon: Icons.VinylIcon },
            { id: 'synth', label: 'Synth', icon: Icons.SynthIcon },
            { id: 'ritual', label: 'Ritual', icon: Icons.Zap },
            { id: 'artifacts', label: 'Artifacts', icon: Icons.Database },
            { id: 'blog', label: 'Blog', icon: Icons.BlogIcon },
        ];

        const hasStudio = user?.subscription_tier === 'studio';
        const isAdmin = user?.role === 'admin';

        if (!hasStudio && !isAdmin) {
            return baseItems;
        }
        
        const extraItems: {
            id: string;
            label: string;
            icon: React.ElementType;
            className?: string;
            activeClassName?: string;
        }[] = [];
        if (hasStudio) {
            extraItems.push({ id: 'analytics', label: 'Analytics', icon: Icons.BarChart3 });
        }
        if (isAdmin) {
            extraItems.push({
                id: 'admin',
                label: 'Admin',
                icon: Icons.Shield,
                className: "text-red-300 hover:bg-red-500/10 hover:text-red-200",
                activeClassName: "bg-red-900/50 text-white"
            });
        }
        
        return [...baseItems, { id: 'divider', isDivider: true }, ...extraItems];

    }, [user]);

    return (
        <header className="flex items-center justify-between gap-4 flex-shrink-0 text-white flex-wrap relative z-10">
            {/* Left side: Logo & Status */}
            <div className="flex items-center gap-3">
                <Icons.Gem className="w-8 h-8 text-[var(--color-accent-purple)]" />
                <h1 className="text-xl font-bold font-mono tracking-tighter">HOWLIN' MOLD</h1>
                <div className="hidden sm:flex items-center gap-2 bg-black/30 px-2 py-1 rounded-md">
                    <AnimatePresence>
                        {isStale && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                
                                transition={{ duration: 0.1 }}
                                title="Audio engine syncing with UI state..."
                            >
                                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.7)]" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <AnimatePresence>
                        {state.recording.isRecording && (
                            <motion.div
                                key="recording-indicator"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-2 text-red-400 overflow-hidden"
                                title="Recording in progress..."
                            >
                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                <motion.div
                                    className="w-2.5 h-2.5 bg-red-500 rounded-full"
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                    style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.7)' }}
                                />
                                <span className="text-xs font-mono font-bold">REC</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <LatencyHarness drift={deckDrift} />
                </div>
            </div>
            
            {/* Center: Main Navigation */}
            <div className="flex-grow min-w-0 flex justify-center">
                <div className="overflow-x-auto">
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>
                    <nav className="flex items-center gap-1 bg-black/40 p-1.5 rounded-lg border border-[var(--color-border-light)] shadow-lg flex-nowrap no-scrollbar">
                        {navItems.map(item => {
                            if ((item as any).isDivider) {
                                return <div key={(item as any).id} className="h-5 w-px bg-white/10 mx-1"></div>;
                            }
                            return <NavButton key={item.id} {...item as any} activeView={activeView} setActiveView={setActiveView} />
                        })}
                        <div className="h-5 w-px bg-white/10 mx-1"></div>
                        <button
                            onClick={() => setActiveView('rooms')}
                            className={cn(
                                "relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                                activeView === 'rooms'
                                    ? "bg-purple-500/50 text-white"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                            )}
                        >
                            <Icons.RoomsIcon className="w-4 h-4" />
                            Rooms
                            {collab?.isConnected && (
                                <span className="absolute inset-0 rounded-md ring-2 ring-emerald-400/80 animate-pulse" />
                            )}
                        </button>
                    </nav>
                </div>
            </div>


            {/* Right side: Search, Oracle, Subscription & User */}
            <div className="hidden lg:flex items-center gap-4">
                <div className="w-64">
                    <CosmicSearchBar
                        value={globalSearchTerm}
                        onChange={onSearchChange}
                        placeholder="Search title, artist, genre..."
                    />
                </div>
                <TheOracle state={state} dispatch={dispatch} loadTrack={loadTrack as any} />
                 <UserStatusButton user={user} setActiveView={setActiveView} />
                 
                 {/* Spotify Settings Button */}
                 <Button
                     onClick={() => setActiveView('admin')}
                     variant="ghost"
                     size="icon"
                     className="text-slate-400 hover:text-green-400 w-8 h-8"
                     title="Admin & Settings"
                 >
                     <Icons.Cog className="w-4 h-4" />
                 </Button>

                 <div
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <button onClick={onViewProfile} className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center border-2 border-transparent group-hover:border-purple-400/50 transition-colors">
                        <img src={user?.avatarUrl} alt={user?.name} className="w-full h-full rounded-full object-cover"/>
                    </button>
                    <Button onClick={onLogout} variant="ghost" size="icon" className="text-slate-400 hover:text-white w-8 h-8" title="Logout">
                        <Icons.LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
};
export default Header;