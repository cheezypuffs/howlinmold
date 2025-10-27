// components/UserProfile.tsx
import React, { useState, useMemo } from 'react';
import type { Post, User, FrequencySignature } from '../types';
import { motion, AnimatePresence } from './motion';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import PostCard from './social/PostCard';
import UserCard from './social/UserCard';
import { socialService } from '../services/socialService';
import FollowButton from './social/FollowButton';
import { ScrollArea } from './ui/scroll-area';

interface UserProfileProps {
    user: User;
    currentUser: User;
    onClose?: () => void;
    onLoadTrack?: (trackInfo: NonNullable<Post['sharedTrack']>) => void;
    onSetTargetSignature?: (signature: FrequencySignature) => void;
    onViewProfile: (user: User) => void;
    onDataChange: () => void;
    socialDataVersion: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, currentUser, onClose, onLoadTrack, onSetTargetSignature, onViewProfile, onDataChange, socialDataVersion }) => {
    const isCurrentUser = user.id === currentUser.id;
    const [activeTab, setActiveTab] = useState('posts');

    const socialData = useMemo(() => socialService.getSocialData(), [socialDataVersion]);
    
    const posts = useMemo(() => socialService.getPostsByUser(user.id), [user.id, socialDataVersion]);
    const followers = useMemo(() => socialService.getFollowers(user.id), [user.id, socialDataVersion]);
    const following = useMemo(() => socialService.getFollowing(user.id), [user.id, socialDataVersion]);
    const likedPosts = useMemo(() => socialService.getLikedPosts(user.id), [user.id, socialDataVersion]);
    const savedPosts = useMemo(() => socialService.getSavedPosts(user.id), [user.id, socialDataVersion]);

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
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                         {onClose && <Button onClick={onClose} size="icon" variant="ghost" className="absolute top-4 left-4 bg-black/50 hover:bg-black/80">
                            <Icons.X className="w-5 h-5"/>
                        </Button>}
                    </div>
                    <div className="px-8 -mt-16">
                        <div className="flex items-end gap-4">
                            <Avatar className="h-32 w-32 border-4 border-slate-900 shadow-lg">
                                <img src={user.avatarUrl} alt={user.name} />
                            </Avatar>
                            <div className="pb-4 flex-grow flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{user.name}</h2>
                                    <p className="text-slate-400">{user.handle}</p>
                                </div>
                                {!isCurrentUser && (
                                    <FollowButton
                                        targetUserId={user.id}
                                        currentUserId={currentUser.id}
                                        onDataChange={onDataChange}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8 flex flex-col flex-grow min-h-0">
                    <div className="flex gap-6 text-sm text-slate-300">
                        <div className="flex items-center gap-2"><strong className="font-bold text-white">{posts.length}</strong> Posts</div>
                        <div className="flex items-center gap-2"><strong className="font-bold text-white">{followers.length}</strong> Followers</div>
                        <div className="flex items-center gap-2"><strong className="font-bold text-white">{following.length}</strong> Following</div>
                    </div>

                    {/* Biography Section */}
                    <div className="border-t border-white/10 mt-6 pt-6 mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                            <Icons.Info className="w-4 h-4 text-purple-300" />
                            Biography
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {user.bio || "This artist hasn't shared their story yet."}
                        </p>
                    </div>
                    
                    <div className="flex-grow flex flex-col min-h-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
                          <TabsList className="bg-black/30 w-full justify-start">
                            <TabsTrigger value="posts" className="data-[state=active]:bg-white/10">Posts</TabsTrigger>
                            <TabsTrigger value="followers" className="data-[state=active]:bg-white/10">Followers</TabsTrigger>
                            <TabsTrigger value="following" className="data-[state=active]:bg-white/10">Following</TabsTrigger>
                            {isCurrentUser && <TabsTrigger value="likes" className="data-[state=active]:bg-white/10">Likes</TabsTrigger>}
                            {isCurrentUser && <TabsTrigger value="saved" className="data-[state=active]:bg-white/10">Saved</TabsTrigger>}
                          </TabsList>

                          <TabsContent value="posts" className="flex-grow mt-4 overflow-hidden">
                             <ScrollArea className="h-full pr-2">
                                <div className="space-y-6">
                                    <AnimatePresence>
                                        {posts.length > 0 ? posts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} allUsers={socialData.users} onViewProfile={onViewProfile} onLoadTrack={onLoadTrack} onSetTarget={onSetTargetSignature} onDataChange={onDataChange} onViewDetail={() => { /* Not implemented in this view */ }} />) : <p className="text-slate-500 text-center pt-10">No posts yet.</p>}
                                    </AnimatePresence>
                                </div>
                             </ScrollArea>
                          </TabsContent>
                          
                          <TabsContent value="followers" className="flex-grow mt-4 overflow-hidden">
                             <ScrollArea className="h-full pr-2">
                                <div className="space-y-4">
                                    {followers.map(u => <UserCard key={u.id} user={u} currentUser={currentUser} onViewProfile={onViewProfile} onDataChange={onDataChange} />)}
                                </div>
                             </ScrollArea>
                          </TabsContent>
                          
                           <TabsContent value="following" className="flex-grow mt-4 overflow-hidden">
                             <ScrollArea className="h-full pr-2">
                                <div className="space-y-4">
                                    {following.map(u => <UserCard key={u.id} user={u} currentUser={currentUser} onViewProfile={onViewProfile} onDataChange={onDataChange} />)}
                                </div>
                             </ScrollArea>
                          </TabsContent>

                           <TabsContent value="likes" className="flex-grow mt-4 overflow-hidden">
                             <ScrollArea className="h-full pr-2">
                                <div className="space-y-6">
                                    {likedPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} allUsers={socialData.users} onViewProfile={onViewProfile} onLoadTrack={onLoadTrack} onSetTarget={onSetTargetSignature} onDataChange={onDataChange} onViewDetail={() => {}} />)}
                                </div>
                             </ScrollArea>
                          </TabsContent>

                           <TabsContent value="saved" className="flex-grow mt-4 overflow-hidden">
                             <ScrollArea className="h-full pr-2">
                                <div className="space-y-6">
                                    {savedPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} allUsers={socialData.users} onViewProfile={onViewProfile} onLoadTrack={onLoadTrack} onSetTarget={onSetTargetSignature} onDataChange={onDataChange} onViewDetail={() => {}} />)}
                                </div>
                             </ScrollArea>
                          </TabsContent>

                        </Tabs>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    );
};

export default UserProfile;