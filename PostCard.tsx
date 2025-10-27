

import React from 'react';
import type { Post, User, FrequencySignature } from '../../types';
import { Button } from '../ui/button';
import * as Icons from '../Icons';
import { motion } from '../motion';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { socialService } from '../../services/socialService';
import FollowButton from './FollowButton';
import { useToast } from '../../hooks/use-toast';

interface PostCardProps {
    post: Post;
    currentUser: User;
    allUsers: User[];
    onViewProfile: (user: User) => void;
    onLoadTrack?: (trackInfo: NonNullable<Post['sharedTrack']>) => void;
    onSetTarget?: (signature: FrequencySignature) => void;
    onDataChange: () => void;
    onViewDetail: () => void;
}

const PostCard: React.FC<PostCardProps> = ({
    post, currentUser, allUsers, onViewProfile, onLoadTrack, onSetTarget, onDataChange, onViewDetail
}) => {
    const { toast } = useToast();
    const author = allUsers.find(u => u.id === post.authorId);

    const isLiked = post.likedBy && post.likedBy.includes(currentUser.id);
    const isSaved = post.savedBy && post.savedBy.includes(currentUser.id);

    const handleLike = () => {
        if (isLiked) {
            socialService.unlikePost(post.id, currentUser.id);
        } else {
            socialService.likePost(post.id, currentUser.id);
        }
        onDataChange();
    };

    const handleSave = () => {
        if (isSaved) {
            socialService.unsavePost(post.id, currentUser.id);
        } else {
            socialService.savePost(post.id, currentUser.id);
        }
        onDataChange();
    };

    const handleLoadTrack = () => {
        if (post.sharedTrack && onLoadTrack) {
            onLoadTrack(post.sharedTrack);
        }
    };

    const handleSetTarget = () => {
        if (onSetTarget && post.frequencySignature) {
            onSetTarget(post.frequencySignature);
            toast({ title: 'Resonance Target Set', description: `Tuning analyzer to the frequency of "${post.content.substring(0, 20)}...".` });
        }
    };

    if (!author) return null;

    return (
        <motion.div layout className="post-card">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewProfile(author)}>
                    <Avatar className="h-12 w-12"><img src={author.avatarUrl} alt={author.name} /></Avatar>
                    <div>
                        <p className="font-bold text-white">{author.name}</p>
                        <p className="text-sm text-slate-400">{author.handle} &bull; {new Date(post.timestamp).toLocaleDateString()}</p>
                    </div>
                </div>
                {currentUser.id !== author.id && (
                    <div className="w-24">
                        <FollowButton targetUserId={author.id} currentUserId={currentUser.id} onDataChange={onDataChange} />
                    </div>
                )}
            </div>
            <p className="my-4 text-slate-200">{post.content}</p>
            {post.mediaUrl && <img src={post.mediaUrl} alt="Post media" className="rounded-lg mb-4" />}
            {post.sharedTrack && (
                <div className="flex gap-4 p-3 bg-black/20 rounded-lg border border-white/10 mb-4">
                    <div className="flex-grow min-w-0">
                        <p className="font-bold text-white truncate">{post.sharedTrack.trackName}</p>
                        <p className="text-sm text-slate-400 truncate">{post.sharedTrack.artist}</p>
                    </div>
                    <Button onClick={handleLoadTrack} size="sm" variant="outline">Load</Button>
                </div>
            )}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-slate-400">
                    <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? 'text-red-400' : ''}>
                        <Icons.Heart className="w-4 h-4 mr-2" /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onViewDetail}>
                        <Icons.MessageCircle className="w-4 h-4 mr-2" /> {post.comments}
                    </Button>
                    {onSetTarget && post.frequencySignature && (
                        <Button variant="ghost" size="sm" onClick={handleSetTarget}>
                            <Icons.Target className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={handleSave}>
                    <Icons.Bookmark className={isSaved ? 'fill-current text-purple-400' : 'w-5 h-5'} />
                </Button>
            </div>
        </motion.div>
    );
};

export default PostCard;