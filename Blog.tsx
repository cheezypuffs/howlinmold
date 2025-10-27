import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { motion, AnimatePresence } from './motion';
import { getAllBlogArticles } from '../utils/db';
import type { BlogArticle } from '../types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../utils/cn';

// Simple markdown to HTML renderer
const renderMarkdown = (markdown: string) => {
    const html = markdown
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b border-white/10 pb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-10 mb-6">$1</h1>')
        .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-black/50 text-purple-300 font-mono px-1.5 py-0.5 rounded-md text-sm">$1</code>')
        .replace(/\n/g, '<br />');
    return { __html: html };
};


const Blog: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            setIsLoading(true);
            const fetchedArticles = await getAllBlogArticles();
            setArticles(fetchedArticles);
            if (fetchedArticles.length > 0) {
                setSelectedArticle(fetchedArticles[0]);
            }
            setIsLoading(false);
        };
        fetchArticles();
    }, []);

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.BlogIcon className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Howlin' Mold Blog</h1>
                        <p className="text-slate-400 text-sm">Deep dives, artist features, and sonic theory.</p>
                    </div>
                </div>
            </header>

            <main className="flex-grow min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-slate-300 px-2">Recent Posts</h2>
                    <ScrollArea className="bg-black/30 p-2 rounded-lg border border-white/10 h-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full"><Icons.Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
                        ) : articles.length > 0 ? (
                            articles.map(article => (
                                <button
                                    key={article.id}
                                    onClick={() => setSelectedArticle(article)}
                                    className={cn('w-full text-left p-3 rounded-md transition-colors', selectedArticle?.id === article.id ? 'bg-purple-500/20' : 'hover:bg-white/10')}
                                >
                                    <h3 className="font-semibold text-white">{article.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1">by {article.authorName} &bull; {new Date(article.timestamp).toLocaleDateString()}</p>
                                </button>
                            ))
                        ) : (
                            <p className="text-slate-500 text-center p-4">No articles published yet.</p>
                        )}
                    </ScrollArea>
                </div>
                <div className="md:col-span-2 bg-black/30 p-2 rounded-lg border border-white/10 h-full">
                    <ScrollArea className="h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedArticle ? selectedArticle.id : 'empty'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="p-6"
                            >
                                {selectedArticle ? (
                                    <article className="prose prose-invert prose-lg max-w-none">
                                        <img src={selectedArticle.featuredImageUrl} alt={selectedArticle.title} className="w-full aspect-video object-cover rounded-lg mb-6" />
                                        <h1 className="text-4xl font-bold mb-4">{selectedArticle.title}</h1>
                                        <div className="flex items-center gap-3 mb-6 text-sm text-slate-400">
                                            <img src={selectedArticle.authorAvatarUrl} alt={selectedArticle.authorName} className="w-8 h-8 rounded-full"/>
                                            <span>{selectedArticle.authorName}</span>
                                            <span>&bull;</span>
                                            <span>{new Date(selectedArticle.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-slate-300" dangerouslySetInnerHTML={renderMarkdown(selectedArticle.content)} />
                                    </article>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                        <Icons.BlogIcon className="w-16 h-16 mb-4" />
                                        <p>Select an article to read.</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </ScrollArea>
                </div>
            </main>
        </div>
    );
};

export default Blog;