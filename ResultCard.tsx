import React from 'react';
import type { BlogPost } from '../types';
import { motion } from './motion';
import { Badge } from './ui/badge';

interface ResultCardProps {
  post: BlogPost;
  onSelect: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ post, onSelect }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onClick={onSelect}
      className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={post.generatedCoverArtUrl || `https://picsum.photos/seed/${post.id}/400/300`}
          alt={`Cover for ${post.album}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-bold text-white leading-tight">{post.album}</h3>
          <p className="text-sm text-slate-300">{post.artist}</p>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-white truncate">{post.post_title}</h4>
        <p className="text-xs text-slate-400 mb-2">from {post.blog_name} ({post.year})</p>
        <p className="text-sm text-slate-300 line-clamp-2 h-10">{post.summary}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(post.vibe_tags || []).slice(0, 4).map(tag => (
            <Badge key={tag} className="bg-purple-500/20 border-purple-400/30 text-purple-300">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultCard;