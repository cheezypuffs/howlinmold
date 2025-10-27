// components/Cloudcasts.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { getCloudcasts, addCloudcast } from '../data/cloudcastDatabase';
import type { Cloudcast, User, Recording } from '../types';
import { motion, AnimatePresence } from './motion';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import * as Icons from './Icons';
import CloudcastFeedCard from './CloudcastFeedCard';
import UploadMixModal from './UploadMixModal';
import { useToast } from '../hooks/use-toast';
import { socialService } from '../services/socialService';

interface CloudcastsProps {
    user: User;
    recordings: Recording[]; // From app state's recording history
    onPlay: (cloudcast: Cloudcast) => void;
    nowPlaying: Cloudcast | null;
    isPlayerPlaying: boolean;
    onViewProfile: (user: User) => void;
}

const Cloudcasts: React.FC<CloudcastsProps> = ({ user, recordings, onPlay, nowPlaying, isPlayerPlaying, onViewProfile }) => {
    const [cloudcasts, setCloudcasts] = useState<Cloudcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    
    // In a real app this would be a proper user lookup service
    const allUsers = useMemo(() => socialService.getSocialData().users, []);
    const { toast } = useToast();

    const fetchCloudcasts = async () => {
        setIsLoading(true);
        const data = await getCloudcasts();
        setCloudcasts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCloudcasts();
    }, []);

    const handleUpload = async (cloudcastData: Omit<Cloudcast, 'id' | 'timestamp' | 'plays'>) => {
        try {
            await addCloudcast(cloudcastData);
            toast({ title: "Upload Successful", description: `"${cloudcastData.title}" is now live.`, type: 'success' });
            setIsUploadModalOpen(false);
            fetchCloudcasts(); // Refresh the feed
        } catch (error) {
            toast({ title: "Upload Failed", description: (error as Error).message, type: 'error' });
        }
    };
    
    const handleViewUploader = (uploaderId: string) => {
        const userToView = allUsers.find(u => u.id === uploaderId);
        if (userToView) {
            onViewProfile(userToView);
        } else {
            toast({ title: "User not found", description: "Could not find the profile for this uploader.", type: 'error' });
        }
    };

    return (
        <>
            <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
                <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <Icons.Cloud className="w-8 h-8 text-purple-400" />
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Cloudcasts</h1>
                            <p className="text-slate-400 text-sm">Browse and share mixes from the community.</p>
                        </div>
                    </div>
                     <Button onClick={() => setIsUploadModalOpen(true)}>
                        <Icons.Upload className="w-4 h-4 mr-2"/> Upload Your Mix
                    </Button>
                </header>
                
                <main className="flex-grow min-h-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Icons.Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                        </div>
                    ) : (
                        <ScrollArea className="h-full pr-4 -mr-4">
                            <div className="space-y-8 max-w-4xl mx-auto">
                                {cloudcasts.map(cc => (
                                    <CloudcastFeedCard
                                        key={cc.id}
                                        cloudcast={cc}
                                        onPlay={() => onPlay(cc)}
                                        onViewUploader={() => handleViewUploader(cc.uploaderId)}
                                        isPlaying={nowPlaying?.id === cc.id && isPlayerPlaying}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </main>
            </div>
            
            <AnimatePresence>
                {isUploadModalOpen && (
                    <UploadMixModal
                        recordings={recordings}
                        currentUser={user}
                        onClose={() => setIsUploadModalOpen(false)}
                        onUpload={handleUpload}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default Cloudcasts;