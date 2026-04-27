import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  Music,
  Plus,
  Search,
  X as CloseIcon,
  MoreVertical,
  Eye,
  Activity
} from 'lucide-react';
import { Post, AppUser } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface ReelItemProps {
  post: Post;
  isActive: boolean;
  onNext: () => void;
  usersRegistry: Record<string, AppUser>;
  currentUserId?: string;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onUserClick: (uid: string) => void;
  onFollow: (uid: string) => void;
  isFollowing: boolean;
}

const ReelItem: React.FC<ReelItemProps> = ({ 
  post, 
  isActive, 
  onNext, 
  usersRegistry, 
  currentUserId,
  onLike,
  onComment,
  onShare,
  onUserClick,
  onFollow,
  isFollowing
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const author = usersRegistry[post.authorUid] || {
    displayName: post.authorName,
    photoURL: post.authorPhoto,
  };

  const isLiked = useMemo(() => {
    return post.reactions?.[currentUserId || ''] === '❤️';
  }, [post.reactions, currentUserId]);

  const viewTracked = useRef(false);

  useEffect(() => {
    if (isActive && !viewTracked.current) {
      viewTracked.current = true;
      updateDoc(doc(db, 'posts', post.id), {
        reachCount: increment(1),
        viewsCount: increment(1)
      }).catch(console.error);

      if (post.isMonetized) {
        updateDoc(doc(db, 'monetization', post.authorUid), {
          reach: increment(1),
          totalEarnings: increment(0.005) // Reels pay better!
        }).catch(console.error);
      }
    }
  }, [isActive, post.id, post.isMonetized, post.authorUid]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const onDoubleTap = (e: React.MouseEvent) => {
    if (e.detail === 2) {
      if (!isLiked) {
        onLike(post.id);
      }
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
  };

  return (
    <div className="h-full w-full flex-shrink-0 relative bg-black snap-start overflow-hidden select-none">
      <video
        ref={videoRef}
        src={post.videoUrl}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
        onMouseDown={onDoubleTap}
      />

      {/* Heart animation on double tap */}
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <Heart className="w-24 h-24 text-red-500 fill-current" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-20 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-20">
        <div className="flex items-end justify-between gap-4 pointer-events-auto">
          <div className="flex-1 space-y-3 pb-2 max-w-[80%]">
             <div className="flex items-center gap-3">
                <div className="relative">
                   <div 
                     onClick={(e) => { e.stopPropagation(); onUserClick(post.authorUid); }}
                     className="w-12 h-12 rounded-full border-2 border-white overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-lg"
                   >
                      <img src={author.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} alt="" className="w-full h-full object-cover" />
                   </div>
                   {!isFollowing && currentUserId !== post.authorUid && (
                     <button 
                       onClick={(e) => { e.stopPropagation(); onFollow(post.authorUid); }}
                       className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#FF0050] rounded-full flex items-center justify-center border-2 border-white active:scale-90 transition-transform shadow-lg"
                     >
                        <Plus className="w-3 h-3 text-white fill-current" />
                     </button>
                   )}
                </div>
                <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                      <span 
                        onClick={(e) => { e.stopPropagation(); onUserClick(post.authorUid); }} 
                        className="font-bold text-white text-[16px] cursor-pointer drop-shadow-md hover:underline"
                      >
                        {author.displayName}
                      </span>
                      {!isFollowing && currentUserId !== post.authorUid && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onFollow(post.authorUid); }}
                           className="px-4 py-1 bg-white text-black rounded-lg text-[11px] font-black tracking-widest uppercase hover:bg-gray-200 active:scale-95 transition-all shadow-md ml-1"
                         >
                           Follow
                         </button>
                      )}
                   </div>
                </div>
             </div>
             
             <p className="text-white text-[15px] font-medium leading-snug drop-shadow-lg line-clamp-3">
                {post.content}
             </p>

             <div className="flex items-center gap-2 text-white/90">
                <Music className="w-4 h-4 flex-shrink-0" />
                <div className="text-[13px] font-bold overflow-hidden w-full backdrop-blur-sm bg-black/10 px-2 py-0.5 rounded-full inline-flex">
                   <div className="animate-marquee-slow whitespace-nowrap">
                      Original sound - {author.displayName} • {post.content.slice(0, 40)}...
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest pointer-events-none">
                   <Eye className="w-3 h-3 text-accent" />
                   {post.viewsCount || 0}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest pointer-events-none">
                   <Activity className="w-3 h-3 text-green-400" />
                   {post.reachCount || 0}
                </div>
             </div>
          </div>

          {/* Right Side Utility Bar */}
          <div className="flex flex-col items-center gap-6 pb-2 pr-1">
             <div className="flex flex-col items-center gap-1.5">
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => { e.stopPropagation(); onLike(post.id); }}
                  className="w-14 h-14 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                   <Heart className={`w-9 h-9 ${isLiked ? 'fill-[#FF0050] text-[#FF0050]' : 'fill-none'}`} />
                </motion.button>
                <span className="text-[13px] font-black text-white drop-shadow-md">{post.likesCount || 0}</span>
             </div>

             <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); onComment(post.id); }}
                  className="w-14 h-14 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                   <MessageCircle className="w-9 h-9 fill-none" />
                </button>
                <span className="text-[13px] font-black text-white drop-shadow-md">{post.commentsCount || 0}</span>
             </div>

             <div className="flex flex-col items-center gap-1.5">
                <button 
                  onClick={(e) => { e.stopPropagation(); onShare(post.id); }}
                  className="w-14 h-14 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                   <Share2 className="w-9 h-9" />
                </button>
                <span className="text-[11px] font-black text-white drop-shadow-md uppercase tracking-tight">Share</span>
             </div>

             <div className="mt-2" onClick={(e) => { e.stopPropagation(); onUserClick(post.authorUid); }}>
                <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-gradient-to-tr from-black to-gray-800 p-1 overflow-hidden animate-spin-slow cursor-pointer shadow-lg">
                   <img src={author.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} alt="" className="w-full h-full rounded-full object-cover" />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Play/Pause Indicator Overlay */}
      {!isPlaying && (
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center"
            >
               <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/80 fill-current ml-1"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </motion.div>
         </div>
      )}
    </div>
  );
};

interface ReelsOverlayProps {
  reels: Post[];
  initialIndex: number;
  onClose: () => void;
  usersRegistry: Record<string, AppUser>;
  currentUserId?: string;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onUserClick: (uid: string) => void;
  onFollow: (uid: string) => void;
  followingUids: string[];
}

export const ReelsOverlay: React.FC<ReelsOverlayProps> = ({
  reels,
  initialIndex,
  onClose,
  usersRegistry,
  currentUserId,
  onLike,
  onComment,
  onShare,
  onUserClick,
  onFollow,
  followingUids
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filteredReels = useMemo(() => {
    if (!searchQuery.trim()) return reels;
    return reels.filter(r => 
      r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reels, searchQuery]);

  useEffect(() => {
    if (containerRef.current && initialIndex < filteredReels.length) {
      containerRef.current.scrollTo({
        top: initialIndex * window.innerHeight,
        behavior: 'instant'
      });
    }
  }, [initialIndex]); // Don't depend on filteredReels.length here to avoid jumpy initial load

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (index !== activeIndex && index >= 0 && index < filteredReels.length) {
      setActiveIndex(index);
    }
  };

  const topTabs = ['For You', 'Following', 'Explore'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black overflow-hidden"
    >
      {/* Top Header Fixed */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-10 flex flex-col gap-4 z-[1010] pointer-events-none">
         <div className="flex items-center justify-between">
            <button 
              onClick={onClose}
              className="p-2.5 text-white bg-black/30 backdrop-blur-md rounded-full pointer-events-auto active:scale-90 transition-transform shadow-lg"
            >
              <ArrowLeft className="w-7 h-7" />
            </button>
            
            {!showSearch ? (
              <div className="flex items-center gap-5 text-white/50 font-black tracking-widest text-[14px] uppercase pointer-events-auto drop-shadow-md">
                 {topTabs.map((tab, idx) => (
                   <button 
                    key={tab}
                    className={`${tab === 'For You' ? 'text-white border-b-2 border-white pb-1' : ''} transition-all active:scale-95`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
            ) : (
              <div className="flex-1 mx-4 pointer-events-auto">
                 <div className="relative">
                    <input 
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reels or users..."
                      className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-2.5 px-10 text-white text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-white/40 placeholder:text-white/40"
                    />
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/60" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-3">
                        <CloseIcon className="w-4 h-4 text-white/60" />
                      </button>
                    )}
                 </div>
              </div>
            )}

            <div className="flex items-center gap-3 pointer-events-auto">
               <button 
                 onClick={() => setShowSearch(!showSearch)}
                 className={`p-2.5 text-white ${showSearch ? 'bg-[#FF0050]' : 'bg-black/30'} backdrop-blur-md rounded-full active:scale-90 transition-all shadow-lg`}
               >
                 <Search className="w-6 h-6" />
               </button>
               <button 
                 onClick={() => setIsAllMuted(!isAllMuted)}
                 className="p-2.5 text-white bg-black/30 backdrop-blur-md rounded-full active:scale-90 transition-all shadow-lg"
               >
                 {isAllMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
               </button>
            </div>
         </div>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ height: '100vh' }}
      >
        {filteredReels.map((reel, idx) => (
          <ReelItem
            key={reel.id}
            post={reel}
            isActive={idx === activeIndex}
            onNext={() => {}} 
            usersRegistry={usersRegistry}
            currentUserId={currentUserId}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onUserClick={onUserClick}
            onFollow={onFollow}
            isFollowing={followingUids.includes(reel.authorUid)}
          />
        ))}
        {filteredReels.length === 0 && (
          <div className="h-full w-full flex flex-col items-center justify-center text-white/40 gap-6 bg-[#000]">
             <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-12 h-12 opacity-20" />
             </div>
             <div className="text-center space-y-2">
                <p className="font-black tracking-[0.2em] uppercase text-xs">No reels found</p>
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Try searching for something else</p>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes marquee-slow {
    from { transform: translateX(100%); }
    to { transform: translateX(-150%); }
  }
  .animate-marquee-slow {
    animation: marquee-slow 12s linear infinite;
  }
  .animate-spin-slow {
    animation: spin 5s linear infinite;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);
