// components/admin/AdminRadio.tsx
// FIX: Added React import to solve JSX errors.
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { motion } from '../motion';
import { User } from '../../entities/User';
import { PlaylistRadioSource } from '../../entities/PlaylistRadioSource';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Loader2, Save, Shield, Radio, AlertCircle, Info } from '../Icons';
import { useRadio } from '../../contexts/RadioState';
import { useToast } from '../../hooks/use-toast';

const PLAYLIST_SLOTS = [1, 2, 3, 4, 5];

const InfoBox = () => (
    <div className="mb-8 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">How to Manage the Playlist Radio</h2>
        </div>
        <p className="text-gray-300">
            Use this portal to configure the five channels in the Howlin' Mold Radio player. Changes saved here will be reflected live for all users.
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li><strong className="text-gray-200">Label:</strong> A short, user-friendly name for the channel (e.g., "Ambient Echoes").</li>
            <li><strong className="text-gray-200">Spotify Playlist URL:</strong> Paste the full URL of a public Spotify playlist.</li>
            <li><strong className="text-gray-200">Active Toggle:</strong> Use the switch to enable or disable a slot. Disabled slots won't appear in the player.</li>
        </ul>
        <div className="pt-2 text-xs text-gray-500">
            <p className='font-bold'>Technical Note:</p>
            <p>This feature uses the standard Spotify `iframe` embed to guarantee stability and prevent it from interfering with other audio features on the site.</p>
        </div>
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 mt-4">
            <p className="text-green-400 text-sm font-semibold">✨ Live Updates</p>
            <p className="text-green-300 text-xs">Changes made here will automatically refresh the radio dock for all users without requiring a page reload.</p>
        </div>
    </div>
);

export default function AdminRadio() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [playlists, setPlaylists] = useState(PLAYLIST_SLOTS.map(slot => ({
        id: '',
        slot,
        label: '',
        spotify_url: '',
        spotify_id: '',
        is_active: true
    })));
    const radio = useRadio();
    const { toast } = useToast();

    const checkAdminAccess = useCallback(async () => {
        try {
            const currentUser = await User.me();
            if (currentUser?.role !== 'admin') {
                throw new Error('Unauthorized access');
            }
            setUser(new User(currentUser));
            const sources = await PlaylistRadioSource.list();
            
            const newPlaylists = PLAYLIST_SLOTS.map(slot => {
                const existing = sources.find(s => s.slot === slot);
                return existing || { id: '', slot, label: '', spotify_url: '', spotify_id: '', is_active: true };
            });
            setPlaylists(newPlaylists);

        } catch (error: any) {
            console.error('Admin access denied or entity not ready:', error);
            if (!error.message.toLowerCase().includes('not found')) {
               setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAdminAccess();
    }, [checkAdminAccess]);
    
    const handleInputChange = (slot: number, field: string, value: string | boolean) => {
        setPlaylists(prev => prev.map(p => p.slot === slot ? { ...p, [field]: value } : p));
    };

    const parseSpotifyId = (url: string) => {
        if (!url) return null;
        const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        setError('');
        
        try {
            for (const playlist of playlists) {
                const spotify_id = parseSpotifyId(playlist.spotify_url);

                // If fields are empty but it was previously saved, just deactivate it.
                if ((!playlist.label || !playlist.spotify_url || !spotify_id) && playlist.id) {
                     await PlaylistRadioSource.update(playlist.id, { is_active: false });
                     continue;
                }

                if (playlist.label && playlist.spotify_url && spotify_id) {
                    const dataToSave = {
                        slot: playlist.slot,
                        label: playlist.label,
                        spotify_url: playlist.spotify_url,
                        spotify_id: spotify_id,
                        is_active: playlist.is_active,
                    };
        
                    const existing = await PlaylistRadioSource.filter({ slot: playlist.slot });

                    if (existing.length > 0) {
                        await PlaylistRadioSource.update(existing[0].id, dataToSave);
                    } else {
                        await PlaylistRadioSource.create(dataToSave);
                    }
                } else if (!playlist.label && !playlist.spotify_url) {
                    // It's an empty slot that wasn't previously saved, do nothing.
                    continue;
                } else {
                    setError(`Invalid data for Slot ${playlist.slot}. Both label and a valid Spotify URL are required.`);
                    setIsSaving(false);
                    return;
                }
            }
            
            // Trigger live update via the context
            radio.refetchSources();
            
            toast({ title: "Radio Updated", description: "Radio playlists have been saved and are now live.", type: 'success' });
        } catch (err: any) {
             setError(`Failed to save playlists: ${err.message}`);
        } finally {
            setIsSaving(false);
            checkAdminAccess();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-center">
                <div>
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl text-white mb-2">Access Denied</h1>
                    <p className="text-gray-400">Administrator privileges required.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-4 sm:p-8">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="flex items-center gap-4 mb-8">
                    <Radio className="w-10 h-10 text-purple-400" />
                    <div>
                        <h1 className="text-3xl font-bold">Radio Playlist Management</h1>
                        <p className="text-gray-400">Configure the 5 playlist slots for the Howlin Mold Radio dock.</p>
                    </div>
                </div>

                <InfoBox />

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-gray-700 space-y-6">
                    {playlists.map(p => (
                        <div key={p.slot} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <Label className="md:col-span-1 text-center text-lg font-bold text-purple-400">#{p.slot}</Label>
                            <div className="md:col-span-4">
                                <Label htmlFor={`label-${p.slot}`} className="text-xs text-gray-400">Label</Label>
                                <Input 
                                    id={`label-${p.slot}`}
                                    placeholder="e.g., 'Ambient Echoes'"
                                    value={p.label}
                                    onChange={(e) => handleInputChange(p.slot, 'label', e.target.value)}
                                    className="bg-gray-900 border-gray-700 mt-1"
                                />
                            </div>
                            <div className="md:col-span-6">
                                <Label htmlFor={`url-${p.slot}`} className="text-xs text-gray-400">Spotify Playlist URL</Label>
                                <Input 
                                    id={`url-${p.slot}`}
                                    placeholder="https://open.spotify.com/playlist/..."
                                    value={p.spotify_url}
                                    onChange={(e) => handleInputChange(p.slot, 'spotify_url', e.target.value)}
                                    className="bg-gray-900 border-gray-700 mt-1"
                                />
                            </div>
                            <div className="md:col-span-1 flex flex-col items-center justify-center pt-4">
                                <Switch 
                                    id={`active-${p.slot}`}
                                    checked={p.is_active}
                                    onCheckedChange={(checked) => handleInputChange(p.slot, 'is_active', checked)}
                                />
                                <Label htmlFor={`active-${p.slot}`} className="text-xs mt-1">Active</Label>
                            </div>
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-purple-600 hover:bg-purple-700">
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}