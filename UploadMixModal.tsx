// components/UploadMixModal.tsx
import React, { useState, useMemo } from 'react';
import { motion } from './motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import * as Icons from './Icons';
import { useToast } from '../hooks/use-toast';
import { formatTime, formatFileSize } from '../utils/helpers';
import { generateArtworkForMix } from '../utils/aiCoverGenerator';
import { getAiSuggestionsForMix } from '../utils/aiMixAnalyzer';
import type { Cloudcast, User, Recording } from '../types';

interface UploadMixModalProps {
    recordings: Recording[];
    currentUser: User;
    onClose: () => void;
    onUpload: (cloudcastData: Omit<Cloudcast, 'id' | 'timestamp' | 'plays'>) => Promise<void>;
}

type UploadStep = 'select' | 'details';

const UploadMixModal: React.FC<UploadMixModalProps> = ({ recordings, currentUser, onClose, onUpload }) => {
    const [step, setStep] = useState<UploadStep>('select');
    const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Form state for step 2
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [artworkUrl, setArtworkUrl] = useState('');
    const [isGeneratingArt, setIsGeneratingArt] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleSelectRecording = (rec: Recording) => {
        setSelectedRecording(rec);
        setTitle(rec.title || `My Mix - ${new Date(rec.date).toLocaleDateString()}`);
        setStep('details');
    };
    
    const handleGenerateArt = async () => {
        if (!title) {
            toast({ title: "Artwork Generation", description: "Please enter a title for your mix first.", type: 'error' });
            return;
        }
        setIsGeneratingArt(true);
        try {
            const url = await generateArtworkForMix(title, tags.split(',').map(t => t.trim()));
            setArtworkUrl(url);
        } catch (error) {
            toast({ title: "Artwork Failed", description: "Could not generate artwork.", type: 'error' });
        } finally {
            setIsGeneratingArt(false);
        }
    };

    const handleGetSuggestions = async () => {
        if (!selectedRecording || !selectedRecording.tracklist || selectedRecording.tracklist.length === 0) {
            toast({ title: "AI Assistant", description: "No tracklist data found for this recording to generate suggestions.", type: 'error' });
            return;
        }
        setIsSuggesting(true);
        try {
            const suggestions = await getAiSuggestionsForMix(selectedRecording.tracklist);
            setTitle(suggestions.title);
            setDescription(suggestions.description);
            setTags(suggestions.tags.join(', '));
            toast({ title: "AI Suggestions Applied", description: "The assistant has filled in the details for you.", type: 'success' });
        } catch (error) {
            toast({ title: "AI Assistant Failed", description: (error as Error).message, type: 'error' });
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !selectedRecording) return;
        
        setIsSubmitting(true);
        
        let finalArtwork = artworkUrl;
        if (!finalArtwork) {
            try {
                finalArtwork = await generateArtworkForMix(title, tags.split(',').map(t => t.trim()));
                setArtworkUrl(finalArtwork);
            } catch (error) {
                 toast({ title: "Artwork Failed", description: "Could not generate artwork, using a placeholder.", type: 'error' });
                 finalArtwork = `https://picsum.photos/seed/${Date.now()}/500`;
            }
        }

        const newCloudcast: Omit<Cloudcast, 'id' | 'timestamp' | 'plays'> = {
            title,
            description,
            uploaderId: currentUser.id,
            uploaderName: currentUser.name,
            uploaderAvatarUrl: currentUser.avatarUrl,
            duration: selectedRecording.tracklist.reduce((acc, t) => acc + t.track.durationSec, 0) || 1800,
            url: selectedRecording.url,
            artworkUrl: finalArtwork,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            tracklist: selectedRecording.tracklist,
        };

        await onUpload(newCloudcast);
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/80 border border-white/10 rounded-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col p-6 shadow-lg"
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-white">Upload Your Mix</h2>
                    <Button onClick={onClose} size="icon" variant="ghost"><Icons.X className="w-5 h-5" /></Button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {step === 'select' && (
                        <div>
                            <h3 className="font-semibold text-purple-300 mb-2">1. Select a Recording from this Session</h3>
                            {recordings.length > 0 ? (
                                <div className="space-y-2">
                                    {[...recordings].reverse().map((rec, index) => (
                                        <button key={index} onClick={() => handleSelectRecording(rec)} className="w-full text-left p-3 rounded-md bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-white">{rec.title || `Recording ${index + 1}`}</p>
                                                <p className="text-xs text-slate-400">{new Date(rec.date).toLocaleString()}</p>
                                            </div>
                                            <div className="text-right text-xs text-slate-500">
                                                <p>~{formatTime(rec.tracklist.reduce((acc, t) => acc + t.track.durationSec, 0) || 1800)}</p>
                                                <p>{formatFileSize(50 * 1024 * 1024)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-black/20 rounded-lg text-slate-400">
                                    <Icons.Mic className="w-8 h-8 mx-auto mb-2" />
                                    <p>No recordings found from this session.</p>
                                    <p className="text-xs mt-1">Use the recorder in the center mixer panel to create a mix.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'details' && (
                        <div className="space-y-4">
                             <div className="flex flex-col md:flex-row gap-4">
                                <div className="md:w-1/3 flex flex-col items-center gap-2">
                                    <div className="w-full aspect-square bg-black/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                                        {isGeneratingArt ? (
                                            <Icons.Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                                        ) : artworkUrl ? (
                                            <img src={artworkUrl} alt="Generated artwork" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icons.Image className="w-16 h-16 text-slate-600" />
                                        )}
                                    </div>
                                    <Button onClick={handleGenerateArt} disabled={isGeneratingArt || !title} variant="outline" className="w-full">
                                        <Icons.Sparkles className="w-4 h-4 mr-2" />
                                        {isGeneratingArt ? 'Generating...' : (artworkUrl ? 'Regenerate Artwork' : 'Generate AI Artwork')}
                                    </Button>
                                </div>
                                <div className="md:w-2/3 space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-semibold text-slate-400">MIX TITLE</label>
                                            <Button onClick={handleGetSuggestions} disabled={isSuggesting} variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-purple-300 hover:bg-purple-500/10">
                                                {isSuggesting ? <Icons.Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Icons.Sparkles className="w-3 h-3 mr-1"/>}
                                                AI Assistant
                                            </Button>
                                        </div>
                                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Mix Title" className="bg-black/30 h-12 text-lg" />
                                    </div>
                                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." className="bg-black/30 min-h-[120px]" />
                                    <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (e.g., techno, deep, journey)" className="bg-black/30" />
                                </div>
                            </div>
                            <Button onClick={() => setStep('select')} variant="ghost" className="text-slate-400">Back</Button>
                        </div>
                    )}
                </div>

                {step === 'details' && (
                    <div className="flex justify-end pt-4 mt-4 border-t border-white/10 flex-shrink-0">
                        <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()} size="lg" className="bg-purple-600 hover:bg-purple-700">
                            {isSubmitting ? <Icons.Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Icons.Upload className="w-5 h-5 mr-2" />}
                            {isSubmitting ? 'Uploading...' : 'Upload Mix'}
                        </Button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default UploadMixModal;