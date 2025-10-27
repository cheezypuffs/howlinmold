import React, { useState, useMemo, useEffect } from 'react';
import type { Post, User } from '../types';
import { Button } from './ui/button';
import * as Icons from './Icons';
import { motion, AnimatePresence } from './motion';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { getUsers, getPosts, addPost } from '../data/socialDatabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const PostCard: React.FC<{ post: Post; onViewProfile: (user: User) => void; allUsers: User[] }> = ({ post, onViewProfile, allUsers }) => {
    const author = allUsers.find(u => u.id === post.authorId);
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
        >
             <header className="flex items-center gap-4 cursor-pointer group" onClick={() => author && onViewProfile(author)}>
                <Avatar><img src={author?.avatarUrl} alt={author?.name} className="w-full h-full object-cover" /></Avatar>
                <div>
                    <p className="font-bold text-white group-hover:text-purple-300 transition-colors">{author?.name}</p>
                    <p className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString()}</p>
                </div>
            </header>
            <p className="text-slate-200">{post.content}</p>
            {post.mediaUrl && <img src={post.mediaUrl} alt="Post media" className="rounded-lg" />}
            <div className="flex justify-between items-center text-slate-400 text-sm mt-2">
                <div className="flex gap-4">
                    <button className="flex items-center gap-2 hover:text-red-400"><Icons.Heart className="w-4 h-4" /> {post.likes}</button>
                    <button className="flex items-center gap-2 hover:text-cyan-400"><Icons.MessageCircle className="w-4 h-4" /> {post.comments}</button>
                </div>
                <div className="flex gap-2">
                    {post.tags.map(tag => <Badge key={tag} className="bg-purple-500/20 border-purple-400/30 text-purple-300">#{tag}</Badge>)}
                </div>
            </div>
        </motion.div>
    );
};

const UserProfile: React.FC<{
    user: User;
    posts: Post[];
    currentUser: User;
    allUsers: User[];
    onClose: () => void;
}> = ({ user, posts, currentUser, allUsers, onClose }) => {
    const isCurrentUser = user.id === currentUser.id;
    const [activeTab, setActiveTab] = useState('posts');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                
                className="bg-slate-900/80 border border-white/10 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-shrink-0">
                    <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${user.headerImageUrl})` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                         <Button onClick={onClose} size="icon" variant="ghost" className="absolute top-4 left-4 bg-black/50 hover:bg-black/80">
                            <Icons.X className="w-5 h-5"/>
                        </Button>
                    </div>
                    <div className="px-8 -mt-16">
                        <div className="flex items-end gap-4">
                            <Avatar className="h-32 w-32 border-4 border-slate-900 shadow-lg">
                                <img src={user.avatarUrl} alt={user.name} />
                            </Avatar>
                            <div className="pb-4">
                                <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                                <p className="text-slate-400">{user.handle}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col flex-grow min-h-0">
                    <div className="flex gap-6 text-sm text-slate-300 mb-6 border-b border-white/10 pb-6">
                        <div className="flex items-center gap-2"><strong className="font-bold text-white">{posts.length}</strong> Posts</div>
                        <div className="flex items-center gap-2"><strong className="font-bold text-white">{user.followersCount || 0}</strong> Followers</div>
                        <div className="flex items-center gap-2"><strong className="font-bold text-white">{user.followingCount || 0}</strong> Following</div>
                    </div>
                    
                    <p className="text-slate-300 italic mb-6">{user.bio || "No bio yet."}</p>
                    
                    <div className="flex-grow flex flex-col min-h-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
                          <TabsList className="bg-black/30 w-full justify-start">
                            <TabsTrigger value="posts" className="data-[state=active]:bg-white/10">Posts</TabsTrigger>
                            <TabsTrigger value="mixes" disabled>Mixes</TabsTrigger>
                          </TabsList>
                          <TabsContent value="posts" className="flex-grow mt-4 overflow-hidden">
                             <div className="h-full overflow-y-auto pr-2 space-y-6">
                                <AnimatePresence>
                                    {posts.length > 0 ? posts.map(post => <PostCard key={post.id} post={post} onViewProfile={() => {}} allUsers={allUsers} />) : <p className="text-slate-500 text-center pt-10">No posts yet.</p>}
                                </AnimatePresence>
                            </div>
                          </TabsContent>
                        </Tabs>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export const ThePackInterface: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [newPostContent, setNewPostContent] = useState('');
    const [viewingProfile, setViewingProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [fetchedUsers, fetchedPosts] = await Promise.all([getUsers(), getPosts()]);
            setAllUsers(fetchedUsers);
            setPosts(fetchedPosts);
            setCurrentUser(fetchedUsers.find(u => u.id === 'user_0') || null);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !currentUser) return;
        const newPostData = {
            authorId: currentUser.id,
            content: newPostContent,
            mediaUrl: null,
            contentType: 'question' as 'question',
            tags: ['new', 'discussion'],
            toneAdherenceScore: 0.9,
            aiSummary: null,
            mediaDescription: null,
        };
        const newPost = await addPost(newPostData);
        setPosts(prev => [newPost, ...prev]);
        setNewPostContent('');
    };
    
    const userPosts = useMemo(() => {
        if (!viewingProfile) return [];
        return posts.filter(post => post.authorId === viewingProfile.id);
    }, [viewingProfile, posts]);

    if (isLoading || !currentUser) {
        return (
            <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl items-center justify-center">
                <Icons.Loader2 className="w-12 h-12 animate-spin text-purple-400"/>
            </div>
        );
    }
    
    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                     {onBack && <Button onClick={onBack} variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10">
                        <Icons.PackIcon className="w-6 h-6" />
                    </Button>}
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">The Pack</h1>
                        <p className="text-slate-400 text-sm">Community feed of shared resonance.</p>
                    </div>
                </div>
            </header>
            <main className="flex-grow min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
                    <form onSubmit={handleCreatePost} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                        <Textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Share your resonance..."
                            className="bg-transparent border-0 focus-visible:ring-0 text-base"
                        />
                        <div className="flex justify-end mt-2">
                            <Button type="submit" disabled={!newPostContent.trim()}>Post</Button>
                        </div>
                    </form>
                    <div className="flex flex-col gap-6">
                        <AnimatePresence>
                            {posts.map(post => <PostCard key={post.id} post={post} onViewProfile={setViewingProfile} allUsers={allUsers} />)}
                        </AnimatePresence>
                    </div>
                </div>
                <div className="hidden lg:block">
                     <div className="sticky top-0 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-slate-300 mb-4">Your Status</h3>
                         <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setViewingProfile(currentUser)}>
                            <Avatar><img src={currentUser.avatarUrl} alt={currentUser.name} /></Avatar>
                            <div>
                                <p className="font-bold text-white group-hover:text-purple-300 transition-colors">{currentUser.name}</p>
                                <p className="text-sm text-slate-400">{currentUser.handle}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center mt-6">
                            <div>
                                <p className="font-bold text-xl">{currentUser.rituals.summons}</p>
                                <p className="text-xs text-slate-400">Summons</p>
                            </div>
                             <div>
                                <p className="font-bold text-xl">{currentUser.rituals.incantations}</p>
                                <p className="text-xs text-slate-400">Incantations</p>
                            </div>
                             <div>
                                <p className="font-bold text-xl">{currentUser.rituals.transmutations}</p>
                                <p className="text-xs text-slate-400">Transmutations</p>
                            </div>
                        </div>
                     </div>
                </div>
            </main>
             <AnimatePresence>
                {viewingProfile && (
                    <UserProfile
                        user={viewingProfile}
                        posts={userPosts}
                        currentUser={currentUser}
                        allUsers={allUsers}
                        onClose={() => setViewingProfile(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}