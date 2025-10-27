
// components/admin/BlogAuthoring.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import * as Icons from '../Icons';
import type { BlogArticle, User } from '../../types';
import { getAllBlogArticles, saveBlogArticle } from '../../utils/db';
import { useToast } from '../../hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const BlogAuthoring: React.FC<{ user: User | null }> = ({ user }) => {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Partial<BlogArticle> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchArticles = useCallback(async () => {
        setIsLoading(true);
        const fetched = await getAllBlogArticles();
        setArticles(fetched);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleNewArticle = () => {
        if (!user) return;
        setSelectedArticle({
            id: uuidv4(),
            title: '',
            authorId: user.id,
            authorName: user.name,
            authorAvatarUrl: user.avatarUrl,
            timestamp: new Date().toISOString(),
            genre: '',
            tags: [],
            summary: '',
            content: '',
            featuredImageUrl: '',
            featuredImagePrompt: '',
            status: 'draft',
        });
    };

    const handleSave = async () => {
        if (!selectedArticle || !selectedArticle.title) {
            toast({ title: 'Error', description: 'Title is required.', type: 'error' });
            return;
        }
        await saveBlogArticle(selectedArticle as BlogArticle);
        toast({ title: 'Article Saved', description: `"${selectedArticle.title}" has been saved.`, type: 'success' });
        await fetchArticles();
    };

    const handlePublish = async () => {
        if (!selectedArticle) return;
        await saveBlogArticle({ ...selectedArticle, status: 'published' } as BlogArticle);
        toast({ title: 'Article Published', description: `"${selectedArticle.title}" is now live.`, type: 'success' });
        await fetchArticles();
        setSelectedArticle(null);
    };

    const handleUpdateField = (field: keyof BlogArticle, value: any) => {
        if (selectedArticle) {
            setSelectedArticle(prev => ({ ...prev, [field]: value }));
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Icons.Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
    }
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Blog Posts</h2>
                    <Button onClick={handleNewArticle} size="sm"><Icons.Plus className="w-4 h-4 mr-2" /> New Post</Button>
                </div>
                <div className="bg-black/20 p-2 rounded-lg border border-white/10 max-h-[70vh] overflow-y-auto">
                    {articles.map(article => (
                        <button key={article.id} onClick={() => setSelectedArticle(article)} className={`w-full text-left p-3 rounded-md ${selectedArticle?.id === article.id ? 'bg-purple-500/20' : 'hover:bg-white/10'}`}>
                            <p className="font-semibold text-white">{article.title}</p>
                            <p className="text-xs text-slate-400">{article.status === 'draft' ? 'Draft' : 'Published'} - {new Date(article.timestamp).toLocaleDateString()}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="md:col-span-2">
                {selectedArticle ? (
                    <div className="space-y-4">
                        <Input placeholder="Post Title" value={selectedArticle.title} onChange={e => handleUpdateField('title', e.target.value)} className="text-2xl h-14 bg-black/30" />
                        <Textarea placeholder="Summary / Teaser" value={selectedArticle.summary} onChange={e => handleUpdateField('summary', e.target.value)} className="bg-black/30" />
                        <Textarea placeholder="Main Content (Markdown)" value={selectedArticle.content} onChange={e => handleUpdateField('content', e.target.value)} className="bg-black/30 min-h-[200px]" />
                        <Input placeholder="Featured Image URL" value={selectedArticle.featuredImageUrl} onChange={e => handleUpdateField('featuredImageUrl', e.target.value)} className="bg-black/30" />
                        <Input placeholder="Genre(s)" value={selectedArticle.genre} onChange={e => handleUpdateField('genre', e.target.value)} className="bg-black/30" />
                        <Input placeholder="Tags (comma-separated)" value={selectedArticle.tags?.join(', ')} onChange={e => handleUpdateField('tags', e.target.value.split(',').map(t => t.trim()))} className="bg-black/30" />
                        <div className="flex justify-end gap-2">
                            <Button onClick={handleSave} variant="outline">Save Draft</Button>
                            <Button onClick={handlePublish}>{selectedArticle.status === 'published' ? 'Update Published Post' : 'Publish'}</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 bg-black/30 rounded-lg border border-white/10">
                        <Icons.FileText className="w-16 h-16 mb-4" />
                        <p>Select a post to edit, or create a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogAuthoring;
