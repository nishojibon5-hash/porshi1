import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  Music,
  Plus
} from 'lucide-react';
import { Post, AppUser } from '../types';

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
  const [isLiked, setIsLiked] = useState(false); 
  const [showHeart, setShowHeart] = useState(false);

  const author = usersRegistry[post.authorUid] || {
    displayName: post.authorName,
    photoURL: post.authorPhoto,
  };

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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
    setIsLiked(!isLiked);
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
        onMouseDown={(e) => {
          if (e.detail === 2) {
            onLike(post.id);
            setIsLiked(true);
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
          }
        }}
      />

      {/* Heart animation on double tap */}
      <AnimatePresence>
        {showHeart && (
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
      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-14 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-20">
        <div className="flex items-end justify-between gap-4 pointer-events-auto">
          <div className="flex-1 space-y-3">
             <div className="flex items-center gap-2">
                <div className="relative group/avatar">
                   <div 
                     onClick={() => onUserClick(post.authorUid)}
                     className="w-11 h-11 rounded-full border-2 border-white overflow-hidden cursor-pointer"
                   >
                      <img src={author.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorUid}`} alt="" className="w-full h-full object-cover" />
                   </div>
                   {!isFollowing && currentUserId !== post.authorUid && (
                     <button 
                       onClick={() => onFollow(post.authorUid)}
                       className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FF0050] rounded-full flex items-center justify-center border border-white active:scale-95 transition-transform"
                     >
                        <Plus className="w-3 h-3 text-white" />
                     </button>
                   )}
                </div>
                <div className="flex flex-col">
                   <div className="flex items-center gap-2">
                      <span onClick={() => onUserClick(post.authorUid)} className="font-bold text-white text-[15px] cursor-pointer drop-shadow-md">{author.displayName}</span>
                      {!isFollowing && currentUserId !== post.authorUid && (
                         <button 
                           onClick={() => onFollow(post.authorUid)}
                           className="px-3 py-0.5 border border-white/60 rounded text-[10px] font-black tracking-widest text-white uppercase hover:bg-white/10 transition-colors"
                         >
                           Follow
                         </button>
                      )}
                   </div>
                </div>
             </div>
             
             <p className="text-white text-[14px] font-medium leading-snug drop-shadow-md line-clamp-3">
                {post.content}
             </p>

             <div className="flex items-center gap-2 text-white/90">
                <Music className="w-3 h-3 flex-shrink-0 animate-pulse" />
                <div className="text-[12px] font-bold overflow-hidden">
                   <div className="animate-marquee-slow whitespace-nowrap">
                      Original sound - {author.displayName} • {post.content.slice(0, 30)}...
                   </div>
                </div>
             </div>
          </div>

          {/* Side Actions List */}
          <div className="flex flex-col items-center gap-5 pb-2">
             <div className="flex flex-col items-center gap-1">
                <motion.button 
                  whileTap={{ scale: 0.8 }}
                  onClick={handleLike}
                  className="w-12 h-12 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                   <Heart className={`w-8 h-8 ${isLiked ? 'fill-red-500 text-red-500' : 'fill-none'}`} />
                </motion.button>
                <span className="text-xs font-bold text-white drop-shadow-md">{post.likesCount || 0}</span>
             </div>

             <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => onComment(post.id)}
                  className="w-12 h-12 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                   <MessageCircle className="w-8 h-8 fill-none" />
                </button>
                <span className="text-xs font-bold text-white drop-shadow-md">{post.commentsCount || 0}</span>
             </div>

             <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={() => onShare(post.id)}
                  className="w-12 h-12 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                   <Share2 className="w-8 h-8" />
                </button>
                <span className="text-xs font-bold text-white drop-shadow-md tracking-tighter uppercase">Share</span>
             </div>

             <div className="mt-2 group">
                <div className="w-11 h-11 rounded-full border-2 border-[#333] bg-gradient-to-tr from-black to-gray-800 p-2 overflow-hidden animate-spin-slow">
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
              className="w-16 h-16 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
            >
               <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current"><polygon points="5 3 19 12 5 21 5 3" /></svg>
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: initialIndex * window.innerHeight,
        behavior: 'instant'
      });
    }
  }, [initialIndex]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (index !== activeIndex && index >= 0 && index < reels.length) {
      setActiveIndex(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black overflow-hidden"
    >
      {/* Top Header Fixed */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-10 flex items-center justify-between z-[1010] pointer-events-none">
         <button 
           onClick={onClose}
           className="p-2 text-white bg-black/10 backdrop-blur-md rounded-full pointer-events-auto active:scale-90 transition-transform"
         >
           <ArrowLeft className="w-6 h-6" />
         </button>
         
         <div className="flex items-center gap-6 text-white/60 font-black tracking-widest text-[13px] uppercase pointer-events-auto">
            <button className="text-white border-b-2 border-white pb-1 transition-all">For You</button>
            <button className="hover:text-white transition-all">Following</button>
         </div>

         <button 
           onClick={() => setIsAllMuted(!isAllMuted)}
           className="p-2 text-white bg-black/10 backdrop-blur-md rounded-full pointer-events-auto active:scale-90 transition-transform"
         >
           {isAllMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
         </button>
      </div>

      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ height: '100vh' }}
      >
        {reels.map((reel, idx) => (
          <ReelItem
            key={reel.id}
            post={reel}
            isActive={idx === activeIndex}
            onNext={() => {}} // Could auto-scroll here in future
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
      </div>
    </motion.div>
  );
};

// CSS is already in the file... wait I overwrite it 
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
