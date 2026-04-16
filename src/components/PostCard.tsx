import React from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  theme: 'light' | 'dark';
  onLike: (postId: string) => void;
  onReact: (postId: string, reactionType: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  theme, 
  onLike, 
  onReact,
  onComment,
  onShare
}) => {
  const totalReactions = post.reactions ? Object.values(post.reactions).reduce((a, b) => (a as number) + (b as number), 0) as number : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border overflow-hidden ${theme === 'dark' ? 'bg-surface/30 border-border-custom' : 'bg-white border-gray-200 shadow-sm'}`}
    >
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full border overflow-hidden ${theme === 'dark' ? 'bg-surface border-border-custom' : 'bg-gray-100 border-gray-200'}`}>
            {post.authorPhoto ? (
              <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-accent" /></div>
            )}
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-tighter">{post.authorName}</div>
            <div className="text-[8px] text-text-dim uppercase">{post.timestamp?.toDate().toLocaleString()}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-text-dim"><MoreHorizontal className="w-5 h-5" /></Button>
      </div>
      <div className="px-4 pb-4 text-sm leading-relaxed">{post.content}</div>
      {post.imageUrl && (
        <div className={`w-full border-y ${theme === 'dark' ? 'border-border-custom' : 'border-gray-100'}`}>
          <img src={post.imageUrl} alt="" className="w-full object-cover max-h-[500px]" referrerPolicy="no-referrer" />
        </div>
      )}
      
      {/* Reactions Display */}
      {post.reactions && totalReactions > 0 && (
        <div className="px-4 py-2 flex items-center gap-2 border-b border-border-custom/50">
          <div className="flex -space-x-1">
            {post.reactions.like > 0 && <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">👍</div>}
            {post.reactions.love > 0 && <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">❤️</div>}
            {post.reactions.haha > 0 && <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[8px]">😆</div>}
          </div>
          <span className="text-[10px] text-text-dim font-bold">
            {totalReactions}
          </span>
        </div>
      )}

      <div className={`p-2 px-4 flex justify-between items-center border-t ${theme === 'dark' ? 'border-border-custom' : 'border-gray-100'}`}>
        <div className="flex gap-4">
          <div className="relative group">
            <button 
              onClick={() => onLike(post.id)}
              className="flex items-center gap-1.5 group py-2"
            >
              <Heart className={`w-5 h-5 transition-colors ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-text-dim group-hover:text-red-500'}`} />
              <span className="text-[10px] font-bold text-text-dim">{post.likesCount}</span>
            </button>
            
            {/* Reaction Picker on Hover */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:flex items-center gap-2 p-2 bg-surface border border-border-custom rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
              {[
                { type: 'like', emoji: '👍', color: 'bg-blue-500' },
                { type: 'love', emoji: '❤️', color: 'bg-red-500' },
                { type: 'haha', emoji: '😆', color: 'bg-yellow-500' },
                { type: 'wow', emoji: '😮', color: 'bg-yellow-500' },
                { type: 'sad', emoji: '😢', color: 'bg-yellow-500' },
                { type: 'angry', emoji: '😡', color: 'bg-orange-500' },
              ].map(r => (
                <motion.button
                  key={r.type}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact(post.id, r.type)}
                  className={`w-8 h-8 rounded-full ${r.color} flex items-center justify-center text-sm shadow-lg`}
                >
                  {r.emoji}
                </motion.button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => onComment?.(post.id)}
            className="flex items-center gap-1.5 group"
          >
            <MessageCircle className="w-5 h-5 text-text-dim group-hover:text-accent transition-colors" />
            <span className="text-[10px] font-bold text-text-dim">{post.commentsCount}</span>
          </button>
          <button 
            onClick={() => onShare?.(post.id)}
            className="flex items-center gap-1.5 group"
          >
            <Share2 className="w-5 h-5 text-text-dim group-hover:text-accent transition-colors" />
          </button>
        </div>
        <Bookmark className="w-5 h-5 text-text-dim hover:text-accent transition-colors cursor-pointer" />
      </div>
    </motion.div>
  );
};
