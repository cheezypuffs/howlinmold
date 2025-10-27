// components/VinylCrate.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getVinylDB, saveVinylRecord, deleteVinylRecord } from '../data/vinylDatabase';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { motion, AnimatePresence } from './motion';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import type { AppState, VinylRecord, SpotifyTrackData, User as UserType, DeckId, AnyDeckId } from '../types';
import { cn } from '../utils/cn';
import { useToast } from '../hooks/use-toast';

// Props for the main component
interface VinylCrateProps {
  onBack: () => void;
  appState: AppState;
  user: UserType | null;
  loadTrack: (track: SpotifyTrackData, deckId: DeckId) => void;
}

const conditionOptions: VinylRecord['condition'][] = [
    'Mint (M)', 'Near Mint (NM)', 'Very Good Plus (VG+)', 'Very Good (VG)', 'Good (G)', 'Poor (P)'
];


// --- ADMIN: Form for Adding/Editing Vinyl ---
const VinylForm: React.FC<{
    vinyl: Partial<VinylRecord>;
    onSave: (data: Partial<VinylRecord>) => Promise<void>;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ vinyl, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState(vinyl);
    const { toast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData({ ...formData, [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value });
    };
    
    const handleSelectChange = (name: string, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.artist) {
            toast({
                title: "Validation Error",
                description: "Title and Artist are required fields.",
                type: 'error',
            });
            return;
        }
        onSave(formData);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">{formData.id ? 'Edit Vinyl Details' : 'Add New Vinyl to Crate'}</h2>
            <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto pr-2 space-y-4">
                <Input name="title" placeholder="Title" value={formData.title || ''} onChange={handleChange} required className="bg-black/30"/>
                <Input name="artist" placeholder="Artist" value={formData.artist || ''} onChange={handleChange} required className="bg-black/30"/>
                <Input name="coverArt" placeholder="Cover Art URL" value={formData.coverArt || ''} onChange={handleChange} className="bg-black/30"/>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="year" type="number" placeholder="Year" value={formData.year || ''} onChange={handleChange} className="bg-black/30"/>
                    <Input name="genre" placeholder="Genre" value={formData.genre || ''} onChange={handleChange} className="bg-black/30"/>
                </div>
                <Input name="catalogNumber" placeholder="Catalog Number" value={formData.catalogNumber || ''} onChange={handleChange} className="bg-black/30"/>
                <Textarea name="pressingDetails" placeholder="Pressing Details (e.g., 180g, Remastered)" value={formData.pressingDetails || ''} onChange={handleChange} className="bg-black/30"/>
                <div className="grid grid-cols-2 gap-4">
                    <Select value={formData.condition || ''} onValueChange={(v) => handleSelectChange('condition', v)}>
                        <SelectTrigger className="bg-black/30"><SelectValue placeholder="Condition" /></SelectTrigger>
                        <SelectContent>{conditionOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input name="purchaseDate" type="date" placeholder="Purchase Date" value={formData.purchaseDate || ''} onChange={handleChange} className="bg-black/30"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="price" type="number" placeholder="Price (e.g., 29.99)" value={formData.price ?? ''} onChange={handleChange} step="0.01" className="bg-black/30"/>
                    <Input name="stock" type="number" placeholder="Stock" value={formData.stock ?? ''} onChange={handleChange} className="bg-black/30"/>
                </div>
            </form>
            <div className="flex-shrink-0 flex justify-end gap-2 pt-4 mt-4 border-t border-white/10">
                <Button variant="ghost" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                    {isSaving ? <Icons.Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Icons.Save className="w-4 h-4 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Record'}
                </Button>
            </div>
        </motion.div>
    );
};

// --- NEW MODAL COMPONENT ---
const LinkTrackModal: React.FC<{
    availableTracks: SpotifyTrackData[];
    onLink: (trackId: string) => void;
    onClose: () => void;
}> = ({ availableTracks, onLink, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

    const filteredTracks = useMemo(() =>
        availableTracks.filter(track =>
            track.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            track.artists.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
        ), [availableTracks, searchTerm]);

    const handleConfirm = () => {
        if (selectedTrackId) {
            onLink(selectedTrackId);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900/80 border border-white/10 rounded-2xl w-full max-w-2xl h-[70vh] flex flex-col p-6"
            >
                <h2 className="text-2xl font-bold text-white mb-4">Link Track from Library</h2>
                <div className="relative mb-4">
                    <Icons.SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search for a track..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-black/30"
                    />
                </div>
                <ScrollArea className="flex-grow pr-2 -mr-2">
                    <div className="space-y-2">
                        {filteredTracks.map(track => (
                            <button
                                key={track.id}
                                onClick={() => setSelectedTrackId(track.id)}
                                className={cn(
                                    'w-full p-2 rounded-md flex items-center gap-4 text-left transition-colors',
                                    selectedTrackId === track.id ? 'bg-purple-500/30' : 'hover:bg-white/10'
                                )}
                            >
                                <img
                                    src={track.album.images[0]?.url || 'https://picsum.photos/seed/placeholder/200'}
                                    alt={track.album.name}
                                    className="w-12 h-12 rounded-sm flex-shrink-0 object-cover"
                                />
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold truncate text-sm text-white">{track.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{track.artists[0]?.name}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-white/10">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={!selectedTrackId}>
                        Confirm Link
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- ADMIN: Detailed View of a Vinyl ---
const VinylDetailsAdmin: React.FC<{
    vinyl: VinylRecord;
    appState: AppState;
    onEdit: (vinyl: VinylRecord) => void;
    onDelete: (vinylId: string) => Promise<void>;
    onLinkTrack: (vinylId: string, trackId: string) => Promise<void>;
    onUnlinkTrack: (vinylId: string, trackId: string) => Promise<void>;
    loadTrack: (track: SpotifyTrackData, deckId: DeckId) => void;
}> = ({ vinyl, appState, onEdit, onDelete, onLinkTrack, onUnlinkTrack, loadTrack }) => {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const { toast } = useToast();
    
    const linkedTracks = useMemo(() => {
        return (vinyl.trackIds || [])
            .map(tid => appState.library.find(t => t.id === tid))
            .filter((t): t is SpotifyTrackData => !!t);
    }, [vinyl.trackIds, appState.library]);

    const availableTracks = useMemo(() => {
        const linkedIds = new Set(vinyl.trackIds || []);
        return appState.library.filter(t => !linkedIds.has(t.id));
    }, [vinyl.trackIds, appState.library]);
    
    const handleLinkTrackConfirm = async (trackId: string) => {
        await onLinkTrack(vinyl.id, trackId);
        setIsLinkModalOpen(false);
    };

    const handleLoadTrack = (track: SpotifyTrackData) => {
        const targetDeck = (appState.focusedDeck === 'A' || appState.focusedDeck === 'B') ? appState.focusedDeck : 'A';
        loadTrack(track, targetDeck);
        toast({ title: "Track Loading", description: `"${track.name}" sent to Deck ${targetDeck}.` });
    };
    
    const DetailItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => value || value === 0 ? (
        <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-slate-200">{value}</p>
        </div>
    ) : null;
    
    const handleDelete = async () => {
        if(window.confirm(`Are you sure you want to delete "${vinyl.title}"? This cannot be undone.`)) {
            await onDelete(vinyl.id);
        }
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                <div className="flex-grow overflow-y-auto pr-2">
                    <div className="relative aspect-square w-full mb-4">
                        <img src={vinyl.coverArt} alt={vinyl.title} className="w-full h-full object-cover rounded-lg shadow-lg"/>
                    </div>
                    <h2 className="text-2xl font-bold">{vinyl.title}</h2>
                    <p className="text-lg text-purple-300">{vinyl.artist}</p>
                    <p className="text-sm text-slate-400">{vinyl.year} &bull; {vinyl.genre}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button onClick={() => onEdit(vinyl)} size="sm" variant="outline" className="w-full"><Icons.SlidersHorizontal className="w-4 h-4 mr-2" /> Edit Details</Button>
                        <Button onClick={handleDelete} size="sm" variant="destructive" className="w-full"><Icons.Trash2 className="w-4 h-4 mr-2" /> Delete Record</Button>
                    </div>
                    
                    <div className="my-4 border-t border-white/10" />
                    
                    <div className="space-y-3">
                        <DetailItem label="Catalog #" value={vinyl.catalogNumber} />
                        <DetailItem label="Pressing" value={vinyl.pressingDetails} />
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Condition" value={vinyl.condition} />
                            <DetailItem label="Acquired" value={vinyl.purchaseDate} />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Price" value={vinyl.price ? `$${vinyl.price.toFixed(2)}` : 'Not set'} />
                            <DetailItem label="Stock" value={vinyl.stock} />
                        </div>
                    </div>

                    <div className="my-4 border-t border-white/10" />
                    
                    <div>
                        <h3 className="font-bold text-slate-300 mb-2">Associated Tracks</h3>
                        <div className="space-y-2 mb-4">
                            {linkedTracks.length > 0 ? linkedTracks.map(track => (
                                 <div key={track.id} className="bg-white/5 p-2 rounded-md flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-grow min-w-0">
                                        <img src={track.album.images[0]?.url} alt={track.album.name} className="w-10 h-10 rounded-sm flex-shrink-0 object-cover" />
                                        <div className="flex-grow min-w-0">
                                            <p className="font-semibold text-sm truncate">{track.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{track.artists[0]?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 flex items-center gap-1 ml-2">
                                        <Button size="sm" variant="outline" onClick={() => handleLoadTrack(track)} className="h-8">Load</Button>
                                        <Button size="icon" variant="ghost" onClick={() => onUnlinkTrack(vinyl.id, track.id)} className="w-8 h-8 text-red-400 hover:bg-red-500/20"><Icons.Trash2 className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            )) : <p className="text-xs text-slate-500">No tracks linked yet.</p>}
                        </div>
                        {availableTracks.length > 0 && (
                           <Button onClick={() => setIsLinkModalOpen(true)} className="w-full">
                                <Icons.Plus className="w-4 h-4 mr-2" /> Link New Track
                            </Button>
                        )}
                    </div>
                </div>
            </motion.div>
            <AnimatePresence>
                {isLinkModalOpen && (
                    <LinkTrackModal
                        availableTracks={availableTracks}
                        onLink={handleLinkTrackConfirm}
                        onClose={() => setIsLinkModalOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

// --- USER: Card for Vinyl Shop ---
const VinylShopCard: React.FC<{ vinyl: VinylRecord }> = ({ vinyl }) => {
    const { toast } = useToast();
    const handlePurchase = () => {
        toast({
            title: "Purchase Initiated",
            description: `Sending "${vinyl.title}" to your designated location.`,
            type: 'success',
        });
    };
    
    const stock = vinyl.stock ?? 0;
    const isOutOfStock = stock <= 0;
    
    const getStockBadge = () => {
        if (isOutOfStock) return <span className="text-xs font-bold text-red-400">OUT OF STOCK</span>;
        if (stock < 10) return <span className="text-xs font-bold text-yellow-400">LOW STOCK ({stock} left)</span>;
        return <span className="text-xs font-bold text-green-400">IN STOCK</span>;
    }

    return (
        <motion.div whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-lg flex flex-col overflow-hidden">
            <div className="aspect-square w-full relative">
                <img src={vinyl.coverArt} alt={vinyl.title} className="w-full h-full object-cover"/>
                 <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-bold text-white">${vinyl.price?.toFixed(2)}</div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-white truncate">{vinyl.title}</h3>
                <p className="text-sm text-slate-400 truncate">{vinyl.artist}</p>
                <div className="mt-2 text-xs text-slate-500">{vinyl.year} &bull; {vinyl.genre}</div>
                <div className="mt-auto pt-4">
                    <div className="text-center mb-2">{getStockBadge()}</div>
                    <Button onClick={handlePurchase} disabled={isOutOfStock} className="w-full">
                        <Icons.ShoppingBag className="w-4 h-4 mr-2"/> {isOutOfStock ? 'Unavailable' : 'Purchase'}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

const VinylCrate: React.FC<VinylCrateProps> = ({ onBack, appState, user, loadTrack }) => {
    const [vinyls, setVinyls] = useState<VinylRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVinyl, setSelectedVinyl] = useState<VinylRecord | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const isAdmin = user?.role === 'admin';

    const fetchVinyls = useCallback(async () => {
        setIsLoading(true);
        const data = await getVinylDB();
        setVinyls(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchVinyls();
    }, [fetchVinyls]);

    const handleSave = async (data: Partial<VinylRecord>) => {
        setIsSaving(true);
        try {
            const saved = await saveVinylRecord(data as any);
            toast({ title: 'Vinyl Saved', description: `"${saved.title}" has been saved.`, type: 'success' });
            setIsEditing(false);
            setSelectedVinyl(saved);
            await fetchVinyls();
        } catch (error) {
            toast({ title: 'Save Failed', description: (error as Error).message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (vinylId: string) => {
        setIsSaving(true);
        try {
            await deleteVinylRecord(vinylId);
            toast({ title: 'Vinyl Deleted', description: 'The record has been removed from the crate.', type: 'success' });
            setSelectedVinyl(null);
            await fetchVinyls();
        } catch (error) {
            toast({ title: 'Delete Failed', description: (error as Error).message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleLinkTrack = async (vinylId: string, trackId: string) => {
        const vinyl = vinyls.find(v => v.id === vinylId);
        if (!vinyl) return;
        const updatedVinyl = { ...vinyl, trackIds: [...(vinyl.trackIds || []), trackId] };
        await handleSave(updatedVinyl);
    };

    const handleUnlinkTrack = async (vinylId: string, trackId: string) => {
        const vinyl = vinyls.find(v => v.id === vinylId);
        if (!vinyl) return;
        const updatedVinyl = { ...vinyl, trackIds: (vinyl.trackIds || []).filter(id => id !== trackId) };
        await handleSave(updatedVinyl);
    };


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Icons.Loader2 className="w-12 h-12 animate-spin text-purple-400" />
                </div>
            );
        }

        if (isAdmin && (selectedVinyl || isEditing)) {
            return (
                <div className="p-4 bg-black/20 rounded-lg">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedVinyl(null); setIsEditing(false); }} className="mb-4">
                        <Icons.ChevronDown className="w-4 h-4 mr-2 -rotate-90" /> Back to List
                    </Button>
                    {isEditing ? (
                        <VinylForm 
                            vinyl={selectedVinyl || {}}
                            onSave={handleSave}
                            onCancel={() => { setIsEditing(false); if (!selectedVinyl?.id) setSelectedVinyl(null); }}
                            isSaving={isSaving}
                        />
                    ) : selectedVinyl ? (
                        <VinylDetailsAdmin
                            vinyl={selectedVinyl}
                            appState={appState}
                            onEdit={(v) => { setSelectedVinyl(v); setIsEditing(true); }}
                            onDelete={handleDelete}
                            onLinkTrack={handleLinkTrack}
                            onUnlinkTrack={handleUnlinkTrack}
                            loadTrack={loadTrack as any}
                        />
                    ) : null}
                </div>
            );
        }

        return (
            <ScrollArea className="h-full pr-4 -mr-4">
                <div className={cn(
                    "grid gap-6",
                    isAdmin ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                )}>
                    {vinyls.map(vinyl => isAdmin ? (
                        <button key={vinyl.id} onClick={() => setSelectedVinyl(vinyl)} className="w-full text-left p-3 rounded-md flex items-center gap-4 bg-white/5 hover:bg-white/10 transition-colors">
                            <img src={vinyl.coverArt} alt={vinyl.title} className="w-12 h-12 rounded-sm flex-shrink-0 object-cover"/>
                            <div>
                                <p className="font-semibold text-white">{vinyl.title}</p>
                                <p className="text-sm text-slate-400">{vinyl.artist}</p>
                            </div>
                        </button>
                    ) : (
                        <VinylShopCard key={vinyl.id} vinyl={vinyl} />
                    ))}
                </div>
            </ScrollArea>
        );
    };

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.VinylIcon className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Vinyl Crate</h1>
                        <p className="text-slate-400 text-sm">{isAdmin ? 'Manage your physical media archive.' : 'Browse rare and curated vinyl.'}</p>
                    </div>
                </div>
                {isAdmin && !isEditing && !selectedVinyl && (
                    <Button onClick={() => { setIsEditing(true); setSelectedVinyl(null); }}><Icons.Plus className="w-4 h-4 mr-2" /> Add Record</Button>
                )}
            </header>
            <main className="flex-grow min-h-0">
                {renderContent()}
            </main>
        </div>
    );
};

export default VinylCrate;