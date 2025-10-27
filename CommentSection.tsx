

import React, { useState, useMemo } from 'react';
import type { Comment, User } from '../../types';
import { socialService } from '../../services/socialService';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import * as Icons from '../Icons';
import { Avatar } from '../ui/avatar';

interface CommentSectionProps {
    postId: string;
    comments: Comment[];
    currentUser: User;
    allUsers: User[];
    onDataChange: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments, currentUser, allUsers, onDataChange }) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const usersMap = useMemo(() => new Map(allUsers.map(u => [u.id, u])), [allUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        await socialService.addComment(postId, currentUser.id, newComment);
        onDataChange();
        setNewComment('');
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="bg-slate-800"
                />
                <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                    {isSubmitting ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                </Button>
            </form>
            <div className="space-y-4">
                {comments && comments.map(comment => {
                    const author = usersMap.get(comment.authorId);
                    return (
                        <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <img src={author?.avatarUrl} alt={author?.name} />
                            </Avatar>
                            <div className="bg-slate-700/50 rounded-lg p-3 text-sm flex-grow">
                                <p className="font-bold text-white">{author?.name}</p>
                                <p className="text-slate-300">{comment.content}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CommentSection;