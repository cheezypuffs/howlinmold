// components/admin/Cratebuilder.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from '../motion';
import * as Icons from '../Icons';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import {
  getGenreIndex,
  getAllGenreClusters,
  saveGenreCluster,
  deleteGenreCluster,
} from '../../services/genreService';
import type { GenreIndex, GenreCluster, BlogPost } from '../../types';
import { cn } from '../../utils/cn';
import { Label } from '../ui/label';

const InputWithLabel: React.FC<{ label: string } & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, ...props }) => (
    <div>
        <Label className="text-sm font-semibold text-slate-300">{label}</Label>
        <Input {...props} className="mt-1 bg-black/30" />
    </div>
);

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
                className="bg-slate-900 border border-red-500/50 rounded-lg p-6 max-w-md w-full"
            >
                <div className="flex items-start gap-4">
                    <Icons.AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <p className="text-slate-300 mt-2">{description}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Confirm Delete</Button>
                </div>
            </motion.div>
        </motion.div>
    )}
    </AnimatePresence>
);

const TokenInput: React.FC<{ label: string, tokens: string[], setTokens: (tokens: string[]) => void }> = ({ label, tokens, setTokens }) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTokens = inputValue.split(',').map(t => t.trim()).filter(Boolean);
      const uniqueNewTokens = newTokens.filter(nt => !tokens.includes(nt));
      if (uniqueNewTokens.length > 0) {
        setTokens([...tokens, ...uniqueNewTokens]);
      }
      setInputValue('');
    }
  };

  const removeToken = (tokenToRemove: string) => {
    setTokens(tokens.filter(t => t !== tokenToRemove));
  };

  return (
    <div>
      <Label className="text-sm font-semibold text-slate-300">{label}</Label>
      <div className="flex flex-wrap gap-2 p-2 mt-1 bg-black/30 border border-slate-600 rounded-md min-h-[40px]">
        {tokens.map(token => (
          <Badge key={token} className="flex items-center gap-1">
            {token}
            <button onClick={() => removeToken(token)} className="ml-1 text-red-400 hover:text-red-200">
              <Icons.X className="w-3 h-3"/>
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add tags..."
          className="bg-transparent outline-none flex-grow text-sm"
        />
      </div>
    </div>
  );
};

const BlogPostEditorModal: React.FC<{ post: Partial<GenreCluster['blog_posts'][number]> | null, onSave: (post: Partial<GenreCluster['blog_posts'][number]>) => void, onClose: () => void }> = ({ post, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<GenreCluster['blog_posts'][number]>>(post || {});

    if (!post) return null;

    const handleSave = () => {
        if (!formData?.title || !formData?.summary) {
            alert('Title and Summary are required.');
            return;
        }
        onSave(formData);
    };
    
    const setAlbumField = (field: string, value: string | number) => {
        setFormData(prev => ({...prev, featured_album: {...prev?.featured_album, [field]: value} as any}));
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} className="bg-slate-900 border border-purple-500/30 w-full max-w-2xl rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-bold">{post.id ? 'Edit' : 'Add'} Blog Post</h3>
                <Input placeholder="Post Title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-black/30" />
                <Textarea placeholder="Summary" value={formData.summary || ''} onChange={e => setFormData({...formData, summary: e.target.value})} className="bg-black/30"/>
                <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Artist" value={formData.featured_album?.artist || ''} onChange={e => setAlbumField('artist', e.target.value)} className="bg-black/30"/>
                    <Input placeholder="Album" value={formData.featured_album?.album || ''} onChange={e => setAlbumField('album', e.target.value)} className="bg-black/30"/>
                    <Input type="number" placeholder="Year" value={formData.featured_album?.year || ''} onChange={e => setAlbumField('year', Number(e.target.value))} className="bg-black/30"/>
                </div>
                 <Input placeholder="Vibe Tags (comma-separated)" value={formData.vibe_tags?.join(', ') || ''} onChange={e => setFormData({...formData, vibe_tags: e.target.value.split(',').map(t=>t.trim())})} className="bg-black/30"/>
                 <Input placeholder="Geography (comma-separated)" value={formData.geography?.join(', ') || ''} onChange={e => setFormData({...formData, geography: e.target.value.split(',').map(t=>t.trim())})} className="bg-black/30"/>
                <div className="flex justify-end gap-2 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}><Icons.Save className="w-4 h-4 mr-2"/> Save Post</Button>
                </div>
            </motion.div>
        </motion.div>
    );
};


const Cratebuilder = () => {
    const [genreIndex, setGenreIndex] = useState<GenreIndex | null>(null);
    const [allClusters, setAllClusters] = useState<Record<string, GenreCluster>>({});
    const [selectedGenreSlug, setSelectedGenreSlug] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<GenreCluster['blog_posts'][number]> | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { toast } = useToast();
    
    const [formData, setFormData] = useState<GenreCluster | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [index, clusters] = await Promise.all([getGenreIndex(), getAllGenreClusters()]);
            setGenreIndex(index);
            setAllClusters(Object.fromEntries(clusters.map(c => [c.genre, c])));
            if (!selectedGenreSlug && index.genres.length > 0) {
              setSelectedGenreSlug(index.genres[0].path.split('/').pop()!.replace('.json', ''));
            }
        } catch (error) {
            toast({ title: "Error Loading Data", description: (error as Error).message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, selectedGenreSlug]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedGenreSlug && allClusters[selectedGenreSlug]) {
            setFormData(JSON.parse(JSON.stringify(allClusters[selectedGenreSlug])));
        } else {
            setFormData(null);
        }
    }, [selectedGenreSlug, allClusters]);
    
     useEffect(() => {
        if (selectedGenreSlug === '__new__' && formData) {
            const newSlug = formData.display_name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // remove special chars
                .replace(/\s+/g, '-') // replace spaces with hyphens
                .slice(0, 50); // limit length
            if (formData.genre !== newSlug) {
                setFormData(prev => prev ? { ...prev, genre: newSlug } : null);
            }
        }
    }, [formData?.display_name, selectedGenreSlug]);

    const handleNew = () => {
        setSelectedGenreSlug('__new__');
        setFormData({
            genre: '', display_name: '', description: '', tags: [],
            related_genres: [], featured_artists: [], blog_posts: []
        });
    };

    const handleSave = async () => {
        if (!formData || !formData.display_name || !formData.genre) {
            toast({ title: "Validation Error", description: "Display Name and Genre Slug are required.", type: 'error' });
            return;
        }
        setIsSaving(true);
        try {
            await saveGenreCluster(formData);
            toast({ title: "Success", description: `Genre "${formData.display_name}" saved.`, type: 'success' });
            await fetchData();
            setSelectedGenreSlug(formData.genre);
        } catch (error) {
            toast({ title: "Save Error", description: (error as Error).message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!formData || !formData.genre) return;
        setIsDeleteModalOpen(false);
        setIsSaving(true);
        try {
            await deleteGenreCluster(formData.genre);
            toast({ title: "Deleted", description: `Genre "${formData.display_name}" has been removed.`, type: 'success' });
            setSelectedGenreSlug(null);
            await fetchData();
        } catch (error) {
             toast({ title: "Delete Error", description: (error as Error).message, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleBlogPostSave = (post: Partial<GenreCluster['blog_posts'][number]>) => {
        if (!formData) return;
        let updatedPosts;
        if (post.id) { // Existing post
            updatedPosts = formData.blog_posts.map(p => p.id === post.id ? (post as BlogPost) : p);
        } else { // New post
            updatedPosts = [...formData.blog_posts, { ...post, id: `post_${Date.now()}` } as BlogPost];
        }
        setFormData({ ...formData, blog_posts: updatedPosts as any });
        setEditingPost(null);
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Icons.Loader2 className="w-12 h-12 animate-spin text-purple-400" /></div>;
    }
    
    return (
        <div className="grid grid-cols-12 gap-6 h-full">
            <AnimatePresence>
                {editingPost && <BlogPostEditorModal post={editingPost} onSave={handleBlogPostSave} onClose={() => setEditingPost(null)}/>}
            </AnimatePresence>
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
                title="Confirm Deletion"
                description={`Are you sure you want to delete the "${formData?.display_name}" genre cluster? This action cannot be undone.`}
            />
            {/* Left Pane: Genre List */}
            <div className="col-span-3">
                <Card className="h-full flex flex-col bg-black/30">
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><Icons.GitBranch className="w-5 h-5"/> Genre Index</CardTitle>
                        <Button size="sm" onClick={handleNew}><Icons.Plus className="w-4 h-4 mr-2"/>New</Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-hidden">
                        <ScrollArea className="h-full pr-2">
                             {genreIndex?.genres.map(g => {
                                const slug = g.path.split('/').pop()!.replace('.json', '');
                                return (
                                <button key={g.path} onClick={() => setSelectedGenreSlug(slug)} className={cn("w-full text-left p-3 rounded-md", selectedGenreSlug === slug && 'bg-purple-500/20')}>
                                    {g.name}
                                </button>
                                )
                            })}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
            {/* Right Pane: Editor */}
            <div className="col-span-9">
                 <AnimatePresence mode="wait">
                    <motion.div key={selectedGenreSlug || 'empty'} initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y:-10}} className="h-full">
                        {!formData ? (
                            <Card className="h-full flex items-center justify-center bg-black/30"><p className="text-slate-500">Select a genre to edit or create a new one.</p></Card>
                        ) : (
                             <Card className="h-full flex flex-col bg-black/30">
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle>Editing: {formData.display_name || 'New Genre'}</CardTitle>
                                    <div className="flex gap-2">
                                        {selectedGenreSlug !== '__new__' && <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)} disabled={isSaving}><Icons.Trash2 className="w-4 h-4 mr-2"/>Delete</Button>}
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            {isSaving ? <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Icons.Save className="w-4 h-4 mr-2"/>}
                                            Save
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow overflow-hidden">
                                     <ScrollArea className="h-full pr-4">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputWithLabel label="Display Name" placeholder="e.g., Spiritual Jazz" value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})}/>
                                                <InputWithLabel label="Genre Slug (auto-generated)" placeholder="e.g., spiritual-jazz" value={formData.genre} readOnly className="opacity-50"/>
                                            </div>
                                        </div>
                                     </ScrollArea>
                                </CardContent>
                             </Card>
                        )}
                    </motion.div>
                 </AnimatePresence>
            </div>
        </div>
    );
};

export default Cratebuilder;