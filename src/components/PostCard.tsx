import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  MoreHorizontal, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  X,
  Globe,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Post, Advertisement } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { useInView } from 'react-intersection-observer';
import { VideoPlayer } from './VideoPlayer';

const ImageWithTracking: React.FC<{ post: Post, theme: string, currentUserId?: string, onLike: (id: string) => void }> = ({ post, theme, currentUserId, onLike }) => {
  const { ref, inView } = useInView({ threshold: 0.5, triggerOnce: true });
  const reachTracked = React.useRef(false);

  React.useEffect(() => {
    if (inView && !reachTracked.current) {
      reachTracked.current = true;
      updateDoc(doc(db, 'posts', post.id), {
        reachCount: increment(1),
        viewsCount: increment(1)
      }).catch(console.error);
    }
  }, [inView, post.id]);

  return (
    <div 
      ref={ref}
      onClick={() => !currentUserId && onLike(post.id)}
      className="relative w-full bg-gray-100 dark:bg-black flex items-center justify-center border-t border-b border-gray-100 dark:border-[#3E4042] cursor-pointer group"
    >
      <img 
        src={post.imageUrl} 
        alt="" 
        className="w-full object-cover max-h-[500px]" 
        referrerPolicy="no-referrer"
        loading="lazy"
      />
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
            <Eye className="w-3 h-3 text-accent" />
            {post.viewsCount || 0}
         </div>
      </div>
    </div>
  );
};

interface PostCardProps {
  post: Post;
  ads?: Advertisement[];
  theme: 'light' | 'dark';
  onLike: (postId: string) => void;
  onReact: (postId: string, reactionType: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onUserClick?: (uid: string) => void;
  isFollowing?: boolean;
  currentUserId?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  ads = [],
  theme, 
  onLike, 
  onReact,
  onComment,
  onShare,
  onFollow,
  onUnfollow,
  onEdit,
  onDelete,
  onUserClick,
  isFollowing,
  currentUserId
}) => {
  const totalReactions = post.reactions ? Object.values(post.reactions).reduce((a, b) => (a as number) + (b as number), 0) as number : 0;
  
  const [selectedAd, setSelectedAd] = React.useState<Advertisement | null>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  const reachTracked = React.useRef(false);

  React.useEffect(() => {
    if (post.isMonetized && ads.length > 0 && !selectedAd) {
      const activeAds = ads.filter(ad => ad.status === 'active');
      if (activeAds.length > 0) {
        const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
        setSelectedAd(randomAd);
      }
    }
  }, [post.isMonetized, ads, selectedAd]);

  React.useEffect(() => {
    if (selectedAd && !reachTracked.current) {
      reachTracked.current = true;
      updateDoc(doc(db, 'ads', selectedAd.id), {
        reach: increment(1)
      }).catch(console.error);
    }
  }, [selectedAd]);

  const handleAdClick = async () => {
    if (!selectedAd) return;
    try {
      await updateDoc(doc(db, 'ads', selectedAd.id), {
        clicks: increment(1)
      });
      if (selectedAd.websiteUrl) {
        window.open(selectedAd.websiteUrl, '_blank');
      }
    } catch (e) {
      console.error('Click tracking error:', e);
    }
  };

  const isOwner = currentUserId === post.authorUid;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`overflow-hidden border-t border-b sm:border sm:rounded-none md:rounded-xl mb-2 ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'}`}
    >
      {/* Post Header */}
      <div className="p-3 flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden cursor-pointer"
            onClick={() => onUserClick?.(post.authorUid)}
          >
            {post.authorPhoto ? (
              <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100"><UserIcon className="w-5 h-5 text-gray-400" /></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                className="text-sm font-bold text-foreground hover:underline cursor-pointer"
                onClick={() => onUserClick?.(post.authorUid)}
              >
                {post.authorName}
              </span>
              {currentUserId && post.authorUid !== currentUserId && (
                <>
                  <span className="text-gray-400 text-xs text-center">•</span>
                  <button 
                    onClick={isFollowing ? onUnfollow : onFollow}
                    className="text-sm font-bold text-[#1877F2] hover:bg-transparent p-0 h-auto"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
              <span>{post.timestamp ? '1d' : 'Just now'}</span>
              {post.isEdited && (
                <>
                  <span>•</span>
                  <span>Edited</span>
                </>
              )}
              <span>•</span>
              <Globe className="w-3 h-3" />
              {post.privacy && (
                <span className="capitalize">({post.privacy})</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className={`absolute right-0 top-full mt-1 w-32 rounded-xl shadow-xl z-20 overflow-hidden border ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-gray-100'}`}
                >
                  {isOwner ? (
                    <>
                      <button 
                        onClick={() => { onEdit?.(post); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        এডিট (Edit)
                      </button>
                      <button 
                        onClick={() => { if (window.confirm('Delete this post?')) onDelete?.(post.id); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors border-t border-gray-100 dark:border-[#3E4042]"
                      >
                        ডিলেট (Delete)
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setShowMenu(false)}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      রিপোর্ট (Report)
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div 
        onClick={() => !currentUserId && onLike(post.id)}
        className="px-3 pb-2 text-[15px] leading-tight text-foreground cursor-pointer"
      >
        {post.content}
        {post.content.length > 200 && <span className="text-gray-500 font-bold ml-1 cursor-pointer">... more</span>}
      </div>

      {/* Post Media */}
      {post.mediaType === 'video' && post.videoUrl ? (
        <VideoPlayer post={post} ads={ads} currentUserId={currentUserId} theme={theme} />
      ) : post.imageUrl && (
        <ImageWithTracking post={post} theme={theme} currentUserId={currentUserId} onLike={onLike} />
      )}

      {/* Ad Section */}
      {post.isMonetized && selectedAd && (
        <div 
          onClick={handleAdClick}
          className={`mx-3 my-2 p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-all ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-[#E4E6EB]'}`}
        >
          <div className="w-10 h-10 rounded bg-[#1877F2] flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
             <div className="text-[10px] font-bold text-[#1877F2] uppercase">Sponsored</div>
             <div className="text-sm font-bold truncate">{selectedAd.title}</div>
             <div className="text-xs text-gray-500 truncate">{selectedAd.description}</div>
          </div>
          <Button size="sm" className="bg-[#1877F2] text-white hover:bg-[#166FE5] font-bold text-xs">
            {selectedAd.objective === 'website_views' ? 'Visit' : 'Learn More'}
          </Button>
        </div>
      )}

      {/* Reaction Counts Display */}
      {totalReactions > 0 && (
        <div className="mx-3 py-3 flex items-center justify-between border-b border-gray-200 dark:border-[#3E4042]">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
               <div className="w-4 h-4 rounded-full bg-[#1877F2] flex items-center justify-center border border-white dark:border-[#242526] z-30">
                  <ThumbsUp className="w-2 h-2 text-white fill-current" />
               </div>
               <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white dark:border-[#242526] z-20 text-[6px]">❤️</div>
               <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center border border-white dark:border-[#242526] z-10 text-[6px]">😆</div>
            </div>
            <span className="text-sm text-gray-500">{totalReactions}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <span>{post.commentsCount} comments</span>
             <span>•</span>
             <span>12 shares</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-1 py-1 flex justify-around">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-md transition-colors ${post.isLiked ? 'text-[#1877F2]' : 'text-gray-500'}`}
        >
          <ThumbsUp className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-semibold">Like</span>
        </button>
        <button 
          onClick={() => onComment?.(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-md transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Comment</span>
        </button>
        <button 
          onClick={() => onShare?.(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-md transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Share</span>
        </button>
      </div>
    </motion.div>
  );
};
