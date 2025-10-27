import React, { useState } from 'react';
import type { Post, User, FrequencySignature } from '../../types';
import { motion, AnimatePresence } from '../motion';
import * as Icons from '../Icons';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { socialService } from '../../services/socialService';
import CommentSection from './CommentSection';

interface PostDetailModalProps {
  post: Post;
  currentUser: User | null;
  allUsers: User[];
  onClose: () => void;
  onViewProfile: (user: User) => void;
  onSetTarget?: (signature: FrequencySignature) => void;
  onLoadTrack?: (trackData: NonNullable<Post['sharedTrack']>) => void;
  onDataChange: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  currentUser,
  allUsers,
  onClose,
  onViewProfile,
  onSetTarget,
  onLoadTrack,
  onDataChange
}) => {
  const [isLiked, setIsLiked] = useState(currentUser ? post.likedBy.includes(currentUser.id) : false);
  const [isSaved, setIsSaved] = useState(currentUser ? post.savedBy.includes(currentUser.id) : false);
  const [internalPost, setInternalPost] = useState(post);
  const [newComment, setNewComment] = useState('');

  const author = allUsers.find(u => u.id === post.authorId);

  const handleLike = () => {
    if (!currentUser) return;
    
    if (isLiked) {
      socialService.unlikePost(post.id, currentUser.id);
    } else {
      socialService.likePost(post.id, currentUser.id);
    }
    onDataChange();
    setInternalPost(prev => {
        const likedBy = isLiked ? prev.likedBy.filter(id => id !== currentUser.id) : [...prev.likedBy, currentUser.id];
        return { ...prev, likedBy, likes: likedBy.length };
    });
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    if (!currentUser) return;
    
    if (isSaved) {
      socialService.unsavePost(post.id, currentUser.id);
    } else {
      socialService.savePost(post.id, currentUser.id);
    }
    onDataChange();
    setIsSaved(!isSaved);
  };

  const handleComment = () => {
    if (!currentUser || !newComment.trim()) return;
    
    const addedComment = socialService.addComment(post.id, currentUser.id, newComment.trim());
    setInternalPost(p => ({...p, comments: p.comments + 1, commentsList: [...p.commentsList, addedComment]}));
    setNewComment('');
    onDataChange();
  };

  const handleLoadTrack = () => {
    if (post.sharedTrack && onLoadTrack) {
      onLoadTrack(post.sharedTrack);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          
          className="relative w-full max-w-2xl max-h-[90vh] mx-4 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 cursor-pointer" onClick={() => author && onViewProfile(author)}>
                <img src={author?.avatarUrl} alt={author?.name} className="w-full h-full object-cover" />
              </Avatar>
              <div>
                <p className="font-bold text-white cursor-pointer hover:text-purple-300 transition-colors" onClick={() => author && onViewProfile(author)}>
                  {author?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-slate-400">{new Date(post.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Icons.X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh - 200px)]">
            {/* Post Content */}
            <div className="mb-6">
              <p className="text-white text-lg mb-4">{post.content}</p>
              
              {/* Media */}
              {post.mediaUrl && (
                <img src={post.mediaUrl} alt="Post media" className="rounded-lg border border-white/10 mb-4 w-full" />
              )}

              {/* Shared Track */}
              {post.sharedTrack && (
                <div className="bg-gray-800/30 rounded-lg p-4 border border-purple-500/20 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icons.Music className="w-8 h-8 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{post.sharedTrack.trackName}</p>
                        <p className="text-sm text-gray-400 truncate">{post.sharedTrack.artist}</p>
                      </div>
                    </div>
                    {onLoadTrack && (
                      <Button
                        onClick={handleLoadTrack}
                        size="sm"
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 ml-2"
                      >
                        <Icons.Play className="w-4 h-4 mr-2" />
                        Load Track
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {post.tags.map(tag => (
                  <Badge key={tag} className="bg-purple-500/20 border-purple-400/30 text-purple-300">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interaction Stats */}
            <div className="flex items-center gap-6 text-slate-400 text-sm mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Icons.Heart className="w-4 h-4" />
                <span>{internalPost.likes} likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Icons.MessageCircle className="w-4 h-4" />
                <span>{internalPost.comments} comments</span>
              </div>
              {post.savedBy.length > 0 && (
                <div className="flex items-center gap-2">
                  <Icons.Bookmark className="w-4 h-4" />
                  <span>{post.savedBy.length} saves</span>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Comments</h3>
              <CommentSection postId={post.id} comments={internalPost.commentsList} currentUser={currentUser!} allUsers={allUsers} onDataChange={onDataChange} />
            </div>

            {/* Frequency Signature (if available) */}
            {onSetTarget && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <Icons.Waves className="w-6 h-6 text-cyan-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 font-mono">
                      Frequency: <span className="font-bold text-white">{post.frequencySignature.frequency.toFixed(1)}Hz</span>
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      Pattern: <span className="font-bold text-white capitalize">{post.frequencySignature.resonancePattern}</span>
                    </p>
                  </div>
                  <Button 
                    onClick={() => onSetTarget(post.frequencySignature)} 
                    size="sm" 
                    variant="outline" 
                    className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                  >
                    <Icons.Target className="w-4 h-4 mr-2" />
                    Set Target
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-white/10 p-6 bg-slate-900/50">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors px-4 py-2 rounded-lg ${
                  isLiked ? 'text-red-400 bg-red-500/10' : 'text-slate-300 hover:text-red-400 hover:bg-red-500/10'
                }`}
              >
                <Icons.Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="font-medium">{internalPost.likes}</span>
              </button>
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 transition-colors px-4 py-2 rounded-lg ${
                  isSaved ? 'text-yellow-400 bg-yellow-500/10' : 'text-slate-300 hover:text-yellow-400 hover:bg-yellow-500/10'
                }`}
              >
                <Icons.Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {currentUser && (
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-black/20 border-gray-600 resize-none"
                  rows={2}
                />
                <Button 
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Icons.Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PostDetailModal;