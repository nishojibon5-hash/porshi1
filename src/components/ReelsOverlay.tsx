import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Heart, 
  MessageCircle, 
  Share2, 
  Volume2, 
  VolumeX, 
  ArrowLeft,
  MoreHorizontal,
  Music,
  Plus
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
  onClose: () => void;
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
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // Local UI state for instant feedback
  const [showHeart, setShowHeart] = useState(false);

  const author = usersRegistry[post.authorUid] || {
    displayName: post.authorName,
    photoURL: post.authorPhoto,
  };

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Autoplay blocked:', err);
        setIsPlaying(false);
        setIsMuted(true); // Attempt mute for autoplay
        if (videoRef.current) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      });
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

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'click' && (e as React.MouseEvent).detail === 2) {
      onLike(post.id);
      setIsLiked(true);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
  };

  return (
    <div className="h-full w-full flex-shrink-0 relative bg-black snap-start overflow-hidden select-none">
      <video
        ref={videoRef}
        src={post.videoUrl}
        className="h-full w-full object-cover"
        loop={false}
        onEnded={onNext}
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
        onMouseDown={handleDoubleTap}
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

      {/* Overlay - Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
        <div className="flex items-end justify-between gap-4">
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="relative cursor-pointer"
                onClick={() => onUserClick(post.authorUid)}
              >
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                  {author.photoURL ? (
                    <img src={author.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-500 flex items-center justify-center">
                      <X className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <span 
                className="font-bold text-white text-sm hover:underline cursor-pointer"
                onClick={() => onUserClick(post.authorUid)}
              >
                {author.displayName}
              </span>
              <button 
                onClick={() => onUserClick(post.authorUid)}
                className="px-3 py-1 bg-transparent border border-white/40 rounded-lg text-[10px] font-black tracking-widest text-white uppercase"
              >
                Follow
              </button>
            </div>
            
            <p className="text-white text-sm line-clamp-2 pr-12 mb-3 font-medium leading-tight">
              {post.content}
            </p>

            <div className="flex items-center gap-2 text-white/80">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Music className="w-3 h-3 text-white flex-shrink-0" />
                <div className="text-[10px] whitespace-nowrap animate-marquee font-bold">
                  Original audio - {author.displayName} • {post.content.slice(0, 20)}...
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex flex-col items-center gap-6 pb-4">
            <div className="flex flex-col items-center gap-1">
              <motion.button 
                whileTap={{ scale: 0.8 }}
                onClick={() => { onLike(post.id); setIsLiked(!isLiked); }}
                className="p-2.5 bg-black/20 backdrop-blur-sm rounded-full text-white"
              >
                <Heart className={`w-8 h-8 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </motion.button>
              <span className="text-[11px] font-black text-white">{post.likesCount || 0}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => onComment(post.id)}
                className="p-2.5 bg-black/20 backdrop-blur-sm rounded-full text-white"
              >
                <MessageCircle className="w-8 h-8" />
              </button>
              <span className="text-[11px] font-black text-white">{post.commentsCount || 0}</span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={() => onShare(post.id)}
                className="p-2.5 bg-black/20 backdrop-blur-sm rounded-full text-white"
              >
                <Share2 className="w-8 h-8" />
              </button>
              <span className="text-[11px] font-black text-white">Share</span>
            </div>

            <div className="mt-2">
              <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-black/40 overflow-hidden animate-spin-slow">
                {author.photoURL && <img src={author.photoURL} alt="" className="w-full h-full object-cover p-1" />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Header Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex items-center justify-between z-30">
        <button 
          onClick={onClose}
          className="p-2 text-white bg-black/20 backdrop-blur-sm rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-4 text-white/50 text-[11px] font-black tracking-widest uppercase">
          <button className="text-white border-b-2 border-white pb-1">For You</button>
          <button>Following</button>
        </div>

        <button className="p-2 text-white bg-black/20 backdrop-blur-sm rounded-full">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Play/Pause visible indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-black/40 backdrop-blur-sm rounded-full"
          >
            <Play className="w-12 h-12 text-white fill-current" />
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
  onUserClick
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial scroll to the clicked reel
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: initialIndex * containerRef.current.clientHeight,
        behavior: 'instant'
      });
    }
  }, [initialIndex]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const nextReel = () => {
    if (!containerRef.current || activeIndex >= reels.length - 1) return;
    containerRef.current.scrollTo({
      top: (activeIndex + 1) * containerRef.current.clientHeight,
      behavior: 'smooth'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] bg-black"
    >
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollBehavior: 'smooth' }}
      >
        {reels.map((reel, idx) => (
          <ReelItem
            key={reel.id}
            post={reel}
            isActive={idx === activeIndex}
            onNext={nextReel}
            usersRegistry={usersRegistry}
            currentUserId={currentUserId}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onUserClick={onUserClick}
            onClose={onClose}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Add CSS for marquee animation
const style = document.createElement('style');
style.textContent = `
  @keyframes marquee {
    from { transform: translateX(100%); }
    to { transform: translateX(-100%); }
  }
  .animate-marquee {
    animation: marquee 10s linear infinite;
  }
  .animate-spin-slow {
    animation: spin 6s linear infinite;
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

function Play({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
  );
}
