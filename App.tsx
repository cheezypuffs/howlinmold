import React, { useState, useEffect, useReducer, useCallback, useMemo } from 'react';
import { Toaster } from './components/ui/sonner';
import { useToast } from './hooks/use-toast';
import { reducer, initialState } from './state/reducer';
import type { User, DeckId, SpotifyTrackData, Cloudcast, AnyDeckId, AppState } from './types';
import { useAudioEngine } from './hooks/useAudioEngine';
import { loadStateFromLocalStorage, saveStateToLocalStorage } from './data/database';
import { getInitialLibrary } from './data/initialLibrary';
import { loadSpotifyTrack } from './utils/trackLoader';
import { User as UserService } from './entities/User';
import { socialService } from './services/socialService';

import Header from './components/Header';
import Deck from './components/Deck';
import Mixer from './components/Mixer';
import Library from './components/Library';
import TheJournal from './components/TheJournal';
import LoginPortal from './components/LoginPortal';
import Subscribe from './components/Subscribe';
import UpsellModal from './components/UpsellModal';
import UserProfile from './components/UserProfile';
import AmbientBackground from './components/visual/AmbientBackground';
import HowlinMoldRadio from './components/HowlinMoldRadio';
import VinylCrate from './components/VinylCrate';
import Synth from './components/Synth/Synth';
import Ritual from './components/Ritual';
import Artifacts from './components/Artifacts';
import Explore from './components/Explore';
import AdminView from './components/admin/AdminView';
import CollabDock from './components/CollabDock';
import { CollaborationProvider, useCollaboration } from './contexts/CollaborationContext';
import { PlayerBar } from './components/PlayerBar';
import Cloudcasts from './components/Cloudcasts';
import { ThePackInterface } from './components/SocialFallback';

import { users as defaultUsers, posts as defaultPosts } from './data/socialDatabase';


const App: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, { ...initialState, ...loadStateFromLocalStorage() });
    const { toast } = useToast();
    const { engineRef, isStale } = useAudioEngine(state, dispatch, toast);

    const [activeView, setActiveView] = useState('deck');
    const [user, setUser] = useState<User | null>(null);
    const [isLibraryReady, setIsLibraryReady] = useState(false);
    const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [libraryVersion, setLibraryVersion] = useState(0);
    const [socialDataVersion, setSocialDataVersion] = useState(0);
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    
    // For cloudcast player
    const [nowPlaying, setNowPlaying] = useState<Cloudcast | null>(null);
    const [playerState, setPlayerState] = useState({ isPlaying: false, duration: 0, currentTime: 0 });
    const audioRef = React.useRef<HTMLAudioElement | null>(null);


    useEffect(() => {
        const checkUser = async () => {
            const currentUser = await UserService.me();
            setUser(currentUser);
        };
        checkUser();
        
        socialService.initializeSocialData(defaultUsers, defaultPosts);
        setSocialDataVersion(v => v + 1);
    }, []);

    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
    };
    
    const handleLogout = () => {
        UserService.logout();
        setUser(null);
    }
    
    const handleDataChange = () => {
        setLibraryVersion(v => v + 1);
        setSocialDataVersion(v => v + 1);
    };

    const loadTrack = useCallback(async (fileOrTrack: File | SpotifyTrackData | string, deckId: AnyDeckId) => {
        if (typeof fileOrTrack === 'string') {
            // Handle URL loading if necessary
            return;
        }
        await loadSpotifyTrack(fileOrTrack, deckId, dispatch, toast, engineRef as any);
    }, [toast, engineRef]);
    
    const handleCreatePost = (trackId: string) => {
      // Logic for creating a post related to a track
    };

    const handlePlayCloudcast = (cloudcast: Cloudcast) => {
        setNowPlaying(cloudcast);
        if (audioRef.current) {
            audioRef.current.src = cloudcast.url;
            audioRef.current.play();
        }
    };
    
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        
        const update = () => setPlayerState(s => ({...s, currentTime: audio.currentTime}));
        const setDuration = () => setPlayerState(s => ({...s, duration: audio.duration}));
        const onPlay = () => setPlayerState(s => ({...s, isPlaying: true}));
        const onPause = () => setPlayerState(s => ({...s, isPlaying: false}));

        audio.addEventListener('timeupdate', update);
        audio.addEventListener('durationchange', setDuration);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);

        return () => {
            audio.removeEventListener('timeupdate', update);
            audio.removeEventListener('durationchange', setDuration);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, []);


    useEffect(() => {
        const initLibrary = async () => {
            if (state.library.length === 0) {
                const tracks = await getInitialLibrary();
                dispatch({ type: 'SET_REMOTE_APP_STATE', payload: { library: tracks } });
            }
            setIsLibraryReady(true);
        };
        initLibrary();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        saveStateToLocalStorage(state);
    }, [state]);

    if (!user) {
        return <LoginPortal onLogin={handleLogin} />;
    }

    const renderView = () => {
        if(viewingProfile) {
            return <UserProfile user={viewingProfile} currentUser={user} onClose={() => setViewingProfile(null)} onViewProfile={setViewingProfile} onDataChange={handleDataChange} socialDataVersion={socialDataVersion} />;
        }
        
        switch(activeView) {
            case 'journal': return <TheJournal onViewProfile={setViewingProfile} socialDataVersion={socialDataVersion}/>;
            case 'subscribe': return <Subscribe user={user} setActiveView={setActiveView} />;
            case 'crate': return <Library appState={state} loadTrack={loadTrack as any} user={user} setActiveView={setActiveView} libraryVersion={libraryVersion} globalSearchTerm={globalSearchTerm} />;
            case 'radio': return <HowlinMoldRadio onBack={() => setActiveView('deck')} />;
            case 'vinyls': return <VinylCrate onBack={() => setActiveView('deck')} appState={state} user={user} loadTrack={loadTrack as any}/>;
            case 'synth': return <Synth onBack={() => setActiveView('deck')} onEngineInit={(synthEngine) => engineRef.current?.connectSynth(synthEngine)} audioContext={engineRef.current?.ctx as any} />;
            case 'ritual': return <Ritual onBack={() => setActiveView('deck')} state={state} dispatch={dispatch} loadTrack={loadTrack as any} />;
            case 'artifacts': return <Artifacts />;
            case 'explore': return <Explore onBack={() => setActiveView('deck')} />;
            case 'cloudcasts': return <Cloudcasts user={user} recordings={state.recording.history} onPlay={handlePlayCloudcast} nowPlaying={nowPlaying} isPlayerPlaying={playerState.isPlaying} onViewProfile={setViewingProfile}/>;
            case 'admin': return <AdminView state={state} dispatch={dispatch} onDataChange={handleDataChange} onLogout={handleLogout} user={user} />;
            case 'deck':
            default:
                return (
                    <div className="flex-grow grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
                        <div className="h-full xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Deck deckId="A" state={state.A} appState={state} dispatch={dispatch} engine={engineRef as any} loadTrack={loadTrack as any} onCreatePost={handleCreatePost} />
                            <Deck deckId="B" state={state.B} appState={state} dispatch={dispatch} engine={engineRef as any} loadTrack={loadTrack as any} onCreatePost={handleCreatePost} />
                        </div>
                        <div className="h-full"><Mixer state={state} dispatch={dispatch} /></div>
                    </div>
                );
        }
    };
    
    return (
        <CollaborationProvider appState={state} appDispatch={dispatch}>
            <div className="h-screen w-screen bg-[var(--color-background-base)] relative">
                <AmbientBackground />
                <div className="h-full w-full p-4 flex flex-col gap-4 font-sans text-white relative z-10">
                    <Header 
                        state={state} 
                        dispatch={dispatch} 
                        loadTrack={loadTrack as any} 
                        activeView={activeView} 
                        setActiveView={setActiveView}
                        user={user}
                        onLogout={handleLogout}
                        isStale={isStale}
                        deckDrift={0} // Placeholder for latency harness
                        globalSearchTerm={globalSearchTerm}
                        onSearchChange={setGlobalSearchTerm}
                        onViewProfile={() => setViewingProfile(user)}
                    />
                    
                    {renderView()}

                    <Toaster />
                    <UpsellModal isOpen={isUpsellModalOpen} onClose={() => setIsUpsellModalOpen(false)} onSubscribe={() => { setIsUpsellModalOpen(false); setActiveView('subscribe'); }} />
                    <CollabDockWrapper state={state} />
                    <audio ref={audioRef} />
                    {nowPlaying && (
                        <PlayerBar 
                            cloudcast={nowPlaying} 
                            playerState={playerState}
                            onPlayPause={() => audioRef.current?.paused ? audioRef.current?.play() : audioRef.current?.pause()}
                            onSeek={(time) => audioRef.current && (audioRef.current.currentTime = time)}
                        />
                    )}
                </div>
            </div>
        </CollaborationProvider>
    );
};

// Wrapper component to access context
const CollabDockWrapper: React.FC<{state: AppState}> = ({state}) => {
    const collab = useCollaboration();
    
    if(!collab?.isDockOpen) return null;
    
    return (
        <div className="absolute top-24 right-4 w-96 h-[calc(100vh-12rem)]">
             <CollabDock user={state.social.currentUser} appState={state} />
        </div>
    )
}

export default App;