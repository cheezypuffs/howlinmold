import React from 'react';
import { motion, AnimatePresence } from './motion';
import type { BlogPost } from '../types';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface AlbumDetailModalProps {
  post: BlogPost | null;
  onClose: () => void;
}

const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({ post, onClose }) => {
  return (
    <AnimatePresence>
      {post && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          
          className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900/80 border border-white/10 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col md:flex-row overflow-hidden"
          >
            <div className="w-full md:w-1/2 flex-shrink-0 relative">
              <img
                src={post.generatedCoverArtUrl || `https://picsum.photos/seed/${post.id}/800`}
                alt={`Cover for ${post.album}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <Button onClick={onClose} size="icon" variant="ghost" className="absolute top-4 right-4 bg-black/50 hover:bg-black/80">
                  <Icons.X className="w-5 h-5"/>
              </Button>
            </div>
            <ScrollArea className="w-full md:w-1/2 p-8">
              <div className="flex flex-col h-full">
                <h2 className="text-4xl font-bold text-white">{post.album}</h2>
                <p className="text-xl text-purple-300 mt-1">{post.artist}</p>
                <p className="text-sm text-slate-400 mt-1">{post.year} &bull; {post.genre}</p>
                <div className="my-6 border-t border-white/10" />
                <h3 className="text-lg font-semibold text-white">From "{post.post_title}"</h3>
                <p className="text-sm text-slate-300 mt-2 italic">"{post.summary}"</p>
                <p className="text-xs text-slate-500 mt-2 text-right">- {post.author} on {post.blog_name}</p>
                <div className="my-6 border-t border-white/10" />
                <h4 className="font-bold text-slate-300 mb-3">Vibe & Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {[...(post.vibe_tags || []), ...(post.tags || []), ...(post.geography || [])].map(tag => (
                    <Badge key={tag} className="bg-purple-500/20 border-purple-400/30 text-purple-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-auto pt-8">
                    <Button className="w-full" onClick={() => window.open(post.url, '_blank')}>Read Full Post</Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlbumDetailModal;