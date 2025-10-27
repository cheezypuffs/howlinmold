import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getSpotifyCredentials, saveSpotifyCredentials } from '../../services/spotify';
import { useToast } from '../../hooks/use-toast';
import { Spotify, KeyRound, CheckCircle, Edit, Users, Music, Info, Copy, Youtube, AlertCircle, Loader2, Save } from '../Icons';
import SpotifyConnectButton from '../SpotifyConnectButton';
import { spotifyPlaybackService } from '../../services/spotifyPlayback';
import type { DeckId, SpotifyAuth, SpotifyPlayerState } from '../../types';
import { FEATURES } from '../../constants';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { AnimatePresence, motion } from '../motion';
import * as Icons from '../Icons';

const CredentialsGuide = () => {
    const redirectUri = window.location.origin + '/spotify-oauth-callback.html';
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(redirectUri);
        toast({ title: 'Copied!', description: 'Redirect URI copied to clipboard.' });
    };

    return (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-blue-300 flex-shrink-0" />
                <h4 className="text-lg font-bold text-white">Configuration Guide</h4>
            </div>
            <ol className="list-decimal list-inside text-sm text-blue-200 space-y-2">
                <li>Go to your <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-white">Spotify Developer Dashboard</a> and log in.</li>
                <li>Create a new App or select an existing one.</li>
                <li>Copy the <strong className="text-white">Client ID</strong> and <strong className="text-white">Client Secret</strong> from your app's main page into the fields above.</li>
                <li>
                    Click <strong className="text-white">"Edit Settings"</strong> in your Spotify app dashboard. In the "Redirect URIs" section, add the following exact URL:
                    <div className="flex items-center gap-2 mt-2 p-2 bg-black/30 rounded-md">
                        <code className="text-xs text-yellow-300 flex-grow">{redirectUri}</code>
                        <Button onClick={copyToClipboard} size="sm" variant="ghost" className="h-7 hover:bg-white/10">
                            <Copy className="w-3 h-3 mr-2"/> Copy
                        </Button>
                    </div>
                </li>
                <li>Scroll down and click <strong className="text-white">"Save"</strong> on the Spotify dashboard page. Then save your credentials here.</li>
            </ol>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    description: string;
}> = ({ isOpen, onConfirm, onCancel, title, description }) => (
    <AnimatePresence>
    {isOpen && (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onCancel}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-900 border border-yellow-500/50 rounded-lg p-6 max-w-md w-full"
            >
                <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-slate-300 mt-2">{description}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button className="bg-yellow-600 hover:bg-yellow-700 text-white" onClick={onConfirm}>I Understand, Proceed</Button>
                </div>
            </motion.div>
        </motion.div>
    )}
    </AnimatePresence>
);

const AdminSettings: React.FC = () => {
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [mode, setMode] = useState<'view' | 'edit'>('edit');
    const [deckAAuth, setDeckAAuth] = useState<SpotifyAuth | null>(null);
    const [deckBAuth, setDeckBAuth] = useState<SpotifyAuth | null>(null);
    const [deckAPlayer, setDeckAPlayer] = useState<SpotifyPlayerState | null>(null);
    const [deckBPlayer, setDeckBPlayer] = useState<SpotifyPlayerState | null>(null);
    const [connectingDecks, setConnectingDecks] = useState<{A: boolean, B: boolean}>({A: false, B: false});
    const [youtubeEnabled, setYoutubeEnabled] = useState(FEATURES.YOUTUBE());
    const [youtubeExternalMode, setYoutubeExternalMode] = useState(FEATURES.YOUTUBE_EXTERNAL_SOURCE_MODE());
    const [showTosWarning, setShowTosWarning] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const creds = getSpotifyCredentials();
        if (creds.clientId && creds.clientSecret) {
            setClientId(creds.clientId);
            setClientSecret(creds.clientSecret);
            setMode('view');
        } else {
            setMode('edit');
        }
        loadDeckAuths();
    }, []);

    const loadDeckAuths = () => {
        // ... (existing auth loading logic) ...
    };

    const handleSave = () => {
        setIsSaving(true);
        try {
            saveSpotifyCredentials(clientId, clientSecret);
            toast({ title: "Credentials Consecrated", description: "Spotify API integration has been updated.", type: 'success' });
            setMode('view');
        } catch (error) {
            toast({ title: "Save Failed", description: "Could not save credentials.", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeckConnect = async (deckId: DeckId) => {
        setConnectingDecks(prev => ({ ...prev, [deckId]: true }));
        try {
            await spotifyPlaybackService.connect(deckId);
            loadDeckAuths();
            toast({ title: `Deck ${deckId} Connected`, description: "Spotify player is ready.", type: 'success'});
        } catch (error: any) {
            toast({ title: `Connection Failed for Deck ${deckId}`, description: error.message, type: 'error'});
        } finally {
            setConnectingDecks(prev => ({ ...prev, [deckId]: false }));
        }
    };

    const handleDeckDisconnect = (deckId: DeckId) => {
        spotifyPlaybackService.disconnect(deckId);
        // ... (existing disconnect logic) ...
    };

    const handleYoutubeToggle = (enabled: boolean) => {
        localStorage.setItem('hm_feat_youtube', String(enabled));
        setYoutubeEnabled(enabled);
        // If disabling YouTube, also disable external mode
        if (!enabled) {
            localStorage.setItem('hm_feat_youtube_external', 'false');
            setYoutubeExternalMode(false);
        }
    };

    const handleExternalModeToggle = (enabled: boolean) => {
        if (enabled) {
            setShowTosWarning(true);
        } else {
            localStorage.setItem('hm_feat_youtube_external', 'false');
            setYoutubeExternalMode(false);
        }
    };

    const confirmExternalMode = () => {
        localStorage.setItem('hm_feat_youtube_external', 'true');
        setYoutubeExternalMode(true);
        setShowTosWarning(false);
    };

    const maskClientId = (id: string) => {
        if (id.length <= 8) return '****';
        return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
    };

    return (
        <div className="space-y-6">
            <Card className="max-w-2xl mx-auto bg-gray-800/30 border-purple-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Spotify className="w-8 h-8 text-green-500" />
                        Spotify Integration
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mode === 'view' ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                <div>
                                    <p className="text-xs text-slate-400">Client ID</p>
                                    <p className="font-mono text-white">{maskClientId(clientId)}</p>
                                </div>
                                <Button onClick={() => setMode('edit')} variant="ghost" size="sm"><Edit className="w-4 h-4 mr-2"/> Edit</Button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                                <div>
                                    <p className="text-xs text-slate-400">Client Secret</p>
                                    <p className="font-mono text-white">****************</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2 text-sm text-green-400">
                                <CheckCircle className="w-5 h-5"/>
                                <span>Credentials are saved and active.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="clientId">Client ID</Label>
                                <Input id="clientId" value={clientId} onChange={e => setClientId(e.target.value)} placeholder="Enter your Spotify Client ID" className="bg-black/30"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clientSecret">Client Secret</Label>
                                <Input id="clientSecret" type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)} placeholder="Enter your Spotify Client Secret" className="bg-black/30"/>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                {getSpotifyCredentials().clientId && <Button variant="ghost" onClick={() => setMode('view')}>Cancel</Button>}
                                <Button onClick={handleSave} disabled={isSaving || !clientId || !clientSecret}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2"/>}
                                    Save Credentials
                                </Button>
                            </div>
                            <CredentialsGuide />
                        </div>
                    )}
                </CardContent>
            </Card>

             <Card className="max-w-2xl mx-auto bg-gray-800/30 border-red-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <Youtube className="w-8 h-8 text-red-400" />
                        YouTube Integration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                        <Label htmlFor="youtube-enable" className="flex flex-col">
                            <span className="font-semibold text-white">Enable YouTube Search</span>
                            <span className="text-xs text-slate-400">Allow loading tracks from YouTube.</span>
                        </Label>
                        <Switch id="youtube-enable" checked={youtubeEnabled} onCheckedChange={handleYoutubeToggle} />
                    </div>
                    <div className={`flex items-center justify-between p-3 bg-black/20 rounded-lg transition-opacity ${!youtubeEnabled && 'opacity-50'}`}>
                        <Label htmlFor="youtube-external" className="flex flex-col">
                            <span className="font-semibold text-white">Enable External Source Mode</span>
                            <span className="text-xs text-yellow-400">Warning: May violate YouTube ToS.</span>
                        </Label>
                        <Switch id="youtube-external" checked={youtubeExternalMode} onCheckedChange={handleExternalModeToggle} disabled={!youtubeEnabled} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                 <Card className="bg-gray-800/30 border-cyan-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Icons.AnimatedIcon.Music>
                                <Music className="w-6 h-6 text-cyan-400"/>
                            </Icons.AnimatedIcon.Music>
                            Deck A Playback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SpotifyConnectButton
                            deckId="A"
                            auth={deckAAuth}
                            playerState={deckAPlayer}
                            onConnect={() => handleDeckConnect('A')}
                            onDisconnect={() => handleDeckDisconnect('A')}
                            isConnecting={connectingDecks.A}
                        />
                    </CardContent>
                </Card>
                <Card className="bg-gray-800/30 border-pink-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Icons.AnimatedIcon.Music>
                                <Music className="w-6 h-6 text-pink-400"/>
                            </Icons.AnimatedIcon.Music>
                            Deck B Playback
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SpotifyConnectButton
                            deckId="B"
                            auth={deckBAuth}
                            playerState={deckBPlayer}
                            onConnect={() => handleDeckConnect('B')}
                            onDisconnect={() => handleDeckDisconnect('B')}
                            isConnecting={connectingDecks.B}
                        />
                    </CardContent>
                </Card>
            </div>

            <ConfirmationModal 
                isOpen={showTosWarning}
                onCancel={() => setShowTosWarning(false)}
                onConfirm={confirmExternalMode}
                title="Enable External Source Mode?"
                description="This feature attempts to fetch a direct audio stream from YouTube, which may violate their Terms of Service. It is intended for development and personal use only. Proceed at your own risk."
            />
        </div>
    );
};

export default AdminSettings;