import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, MessageCircle, Share2, X, Globe, Eye, PlayCircle, Heart, Smile, User as UserIcon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Post, Advertisement, AppUser } from '../types';
import { db, auth } from '../firebase';
import { doc, updateDoc, increment, setDoc, deleteDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { useInView } from 'react-intersection-observer';
import { VideoPlayer } from './VideoPlayer';

const REACTION_EMOJIS = [
  { type: 'like', emoji: '👍', label: 'Like', color: 'text-blue-500' },
  { type: 'love', emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { type: 'care', emoji: '🥰', label: 'Care', color: 'text-yellow-500' },
  { type: 'haha', emoji: '😆', label: 'Haha', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😯', label: 'Wow', color: 'text-yellow-500' },
  { type: 'sad', emoji: '😢', label: 'Sad', color: 'text-yellow-500' },
  { type: 'angry', emoji: '😡', label: 'Angry', color: 'text-orange-600' }
];

const ReactionPicker: React.FC<{ onSelect: (type: string) => void, onClose: () => void }> = ({ onSelect, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: 10 }}
      className="absolute bottom-full mb-3 left-0 bg-white dark:bg-[#242526] p-1.5 shadow-2xl rounded-full border border-gray-100 dark:border-[#3E4042] flex items-center gap-1.5 z-50"
    >
      {REACTION_EMOJIS.map(item => (
        <motion.button 
          key={item.type}
          whileHover={{ scale: 1.4, y: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onSelect(item.emoji); onClose(); }}
          className="relative group p-1"
        >
          <span className="text-2xl">{item.emoji}</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {item.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
};

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
  autoplayVideos?: boolean;
  usersRegistry?: Record<string, AppUser>;
  showToast?: (msg: string, type: 'info' | 'error' | 'success') => void;
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
  currentUserId,
  autoplayVideos = true,
  usersRegistry = {},
  showToast
}) => {
  const author = usersRegistry[post.authorUid] || {
    displayName: post.authorName,
    photoURL: post.authorPhoto,
    isMonetized: false
  };
  const totalReactions = post.reactions ? (Object.values(post.reactions) as number[]).reduce((a, b) => a + b, 0) : 0;
  
  const [selectedAd, setSelectedAd] = React.useState<Advertisement | null>(null);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showReactionPicker, setShowReactionPicker] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [userReaction, setUserReaction] = React.useState<string | null>(post.userReaction || null);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const reachTracked = React.useRef(false);

  // Author or Post monetization check
  const isPostOrAuthorMonetized = post.isMonetized || author.isMonetized;

  React.useEffect(() => {
    if (!currentUserId) return;
    const unsub = onSnapshot(doc(db, 'posts', post.id, 'userReactions', currentUserId), (snap) => {
      if (snap.exists()) {
        setUserReaction(snap.data().type);
      } else {
        setUserReaction(null);
      }
    }, (err) => {
      console.error('userReactions onSnapshot error:', err);
    });
    return () => unsub();
  }, [post.id, currentUserId]);

  const handleLikeStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowReactionPicker(true);
    }, 500);
  };

  const handleLikeEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleReactionSelect = (emoji: string) => {
    onReact(post.id, emoji);
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Porshi Post',
          text: post.content,
          url: window.location.href,
        });
        onShare?.(post.id);
      } catch (e) {
        console.log('Share error:', e);
      }
    } else {
      setIsSharing(true);
      setTimeout(() => setIsSharing(false), 2000);
      onShare?.(post.id);
    }
  };

  React.useEffect(() => {
    if (isPostOrAuthorMonetized && ads.length > 0 && !selectedAd) {
      const activeAds = ads.filter(ad => ad.status === 'active');
      if (activeAds.length > 0) {
        const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)];
        setSelectedAd(randomAd);
      }
    }
  }, [isPostOrAuthorMonetized, ads, selectedAd]);

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
            className="w-10 h-10 rounded-full border border-gray-100 dark:border-[#3E4042] overflow-hidden cursor-pointer"
            onClick={() => onUserClick?.(post.authorUid)}
          >
            {author.photoURL ? (
              <img src={author.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100"><UserIcon className="w-5 h-5 text-gray-400" /></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                className="text-sm font-black text-foreground hover:underline cursor-pointer tracking-tight"
                onClick={() => onUserClick?.(post.authorUid)}
              >
                {author.displayName}
              </span>
              {post.isReel && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-tr from-pink-500 to-orange-500 rounded text-[8px] text-white font-black uppercase tracking-tighter self-center">
                   <PlayCircle className="w-2 h-2" /> Reel
                </div>
              )}
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
                        Edit
                      </button>
                      <button 
                        onClick={() => { if (window.confirm('Delete this post?')) onDelete?.(post.id); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors border-t border-gray-100 dark:border-[#3E4042]"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        showToast?.('Thank you for reporting. Our team will review this post.', 'success');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      Report
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
      {post.mediaType === 'video' && (post.videoUrl || post.youtubeUrl) ? (
        <VideoPlayer 
          post={post} 
          ads={ads} 
          currentUserId={currentUserId} 
          theme={theme} 
          autoplayEnabled={autoplayVideos}
          isMonetized={author.isMonetized}
        />
      ) : post.mediaType === 'link' && post.linkUrl ? (
        <a 
          href={post.linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`mx-3 my-2 p-4 rounded-xl border flex items-center gap-4 hover:opacity-80 transition-all ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`}
        >
          <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0 border border-[#1877F2]/20">
            <Globe className="w-6 h-6 text-[#1877F2]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase font-black text-[#1877F2] tracking-widest mb-1">External Link</div>
            <div className="text-sm font-bold truncate text-foreground">{post.linkUrl}</div>
            <div className="text-xs text-sidebar-foreground/50 font-medium">Click to visit website</div>
          </div>
          <Share2 className="w-4 h-4 text-gray-500" />
        </a>
      ) : post.imageUrl && (
        <ImageWithTracking post={post} theme={theme} currentUserId={currentUserId} onLike={onLike} />
      )}

      {/* Ad Section */}
      {post.isMonetized && selectedAd && (
        selectedAd.adCode ? (
          <div className="mx-3 my-2 overflow-hidden flex justify-center bg-transparent border-none">
            <div 
              className="ad-code-container w-full"
              dangerouslySetInnerHTML={{ __html: selectedAd.adCode }}
              onClick={handleAdClick}
            />
          </div>
        ) : (
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
        )
      )}

      {/* Reaction Counts Display */}
      {totalReactions > 0 && (
        <div className="mx-3 py-2 flex items-center justify-between border-b border-gray-200 dark:border-[#3E4042]">
          <div className="flex items-center gap-1.5 cursor-pointer">
            <div className="flex -space-x-1.5">
               {post.reactions && Object.entries(post.reactions)
                 .filter(([_, count]) => (count as number) > 0)
                 .sort((a, b) => (b[1] as number) - (a[1] as number))
                 .slice(0, 3)
                 .map(([emoji]) => (
                   <div key={emoji} className="w-4.5 h-4.5 rounded-full bg-white dark:bg-[#3A3B3C] shadow-sm flex items-center justify-center border border-white dark:border-[#242526] z-10 text-[10px]">
                      {emoji}
                   </div>
                 ))
               }
            </div>
            <span className="text-[13px] text-gray-500 dark:text-gray-400 font-medium hover:underline">
              {userReaction ? 
                (totalReactions === 1 ? 'You' : `You and ${totalReactions - 1} others`) : 
                totalReactions
              }
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-gray-400 font-medium font-sans">
             <button className="hover:underline">{post.commentsCount || 0} comments</button>
             <span>•</span>
             <button className="hover:underline">{Math.floor((totalReactions as number) * 0.4)} shares</button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-1 py-1 flex justify-around relative">
        <div className="flex-1 relative">
          <button 
            onMouseDown={handleLikeStart}
            onMouseUp={handleLikeEnd}
            onTouchStart={handleLikeStart}
            onTouchEnd={handleLikeEnd}
            onContextMenu={(e) => {
              if (longPressTimer.current || showReactionPicker) e.preventDefault();
            }}
            onClick={() => onLike(post.id)}
            className={`w-full flex items-center justify-center gap-2 py-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-md transition-colors select-none ${userReaction ? (REACTION_EMOJIS.find(r => r.emoji === userReaction)?.color || 'text-[#1877F2]') : 'text-gray-500'}`}
          >
            {userReaction ? (
               <span className="text-xl animate-in zoom-in duration-300">{userReaction}</span>
            ) : (
               <ThumbsUp className="w-5 h-5" />
            )}
            <span className="text-sm font-bold">
              {userReaction ? (REACTION_EMOJIS.find(r => r.emoji === userReaction)?.label || 'Liked') : 'Like'}
            </span>
          </button>
          
          <AnimatePresence>
            {showReactionPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowReactionPicker(false)} />
                <ReactionPicker 
                  onSelect={handleReactionSelect} 
                  onClose={() => setShowReactionPicker(false)} 
                />
              </>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={() => onComment?.(post.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-md transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-bold">Comment</span>
        </button>
        
        <button 
          onClick={handleShareClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-md transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-bold">{isSharing ? 'Copied!' : 'Share'}</span>
        </button>
      </div>
    </motion.div>
  );
};
