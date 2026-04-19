import React from 'react';
import { useInView } from 'react-intersection-observer';
import { db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  Eye, 
  Activity,
  Zap
} from 'lucide-react';
import { Post, Advertisement } from '../types';

interface VideoPlayerProps {
  post: Post;
  ads: Advertisement[];
  currentUserId?: string;
  theme: 'light' | 'dark';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ post, ads, currentUserId, theme }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [showAd, setShowAd] = React.useState(false);
  const [adVideo, setAdVideo] = React.useState<Advertisement | null>(null);
  const [skipTime, setSkipTime] = React.useState(5);
  const [adFinished, setAdFinished] = React.useState(false);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const adVideoRef = React.useRef<HTMLVideoElement>(null);
  const viewTracked = React.useRef(false);
  const reachTracked = React.useRef(false);

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  // Reach tracking (enters viewport)
  React.useEffect(() => {
    if (inView && !reachTracked.current) {
      reachTracked.current = true;
      updateDoc(doc(db, 'posts', post.id), {
        reachCount: increment(1)
      }).catch(console.error);
    }
  }, [inView, post.id]);

  // Handle Monetized Ads
  React.useEffect(() => {
    if (post.isMonetized && !adFinished && inView && !adVideo) {
      const videoAds = ads.filter(ad => ad.status === 'active' && ad.adType === 'video_skippable');
      if (videoAds.length > 0) {
        const randomAd = videoAds[Math.floor(Math.random() * videoAds.length)];
        setAdVideo(randomAd);
        setShowAd(true);
      }
    }
  }, [post.isMonetized, ads, inView, adFinished, adVideo]);

  // Skip Timer Logic
  React.useEffect(() => {
    let timer: any;
    if (showAd && skipTime > 0) {
      timer = setInterval(() => {
        setSkipTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showAd, skipTime]);

  const handleSkip = () => {
    setShowAd(false);
    setAdFinished(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
    // Track Ad impression/skip as reach
    if (adVideo) {
      updateDoc(doc(db, 'ads', adVideo.id), {
        reach: increment(1)
      }).catch(console.error);
    }
  };

  const onVideoPlay = () => {
    if (!viewTracked.current) {
      viewTracked.current = true;
      updateDoc(doc(db, 'posts', post.id), {
        viewsCount: increment(1)
      }).catch(console.error);
    }
  };

  return (
    <div ref={ref} className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
      {/* Real-time Stats Overlay */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
            <Eye className="w-3 h-3 text-accent" />
            {post.viewsCount || 0}
         </div>
         <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
            <Activity className="w-3 h-3 text-green-400" />
            {post.reachCount || 0}
         </div>
      </div>

      <AnimatePresence>
        {showAd && adVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black flex items-center justify-center"
          >
            <video 
              ref={adVideoRef}
              src={adVideo.videoAdUrl || adVideo.videoUrl}
              autoPlay
              muted={isMuted}
              className="w-full h-full object-contain"
              onEnded={handleSkip}
            />
            
            <div className="absolute top-16 left-4 p-3 bg-black/80 rounded-xl border border-white/20 backdrop-blur-md max-w-[200px]">
               <div className="flex items-center gap-2 mb-1">
                 <Zap className="w-3 h-3 text-accent fill-current" />
                 <div className="text-[8px] text-accent font-black uppercase tracking-widest">Sponsored</div>
               </div>
               <div className="text-xs font-bold text-white truncate">{adVideo.title}</div>
               <div className="text-[8px] text-gray-400 uppercase font-black tracking-tighter mt-0.5">{adVideo.advertiserName}</div>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-black/60 rounded-full text-white border border-white/20 hover:bg-black transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              {skipTime > 0 ? (
                <div className="px-6 py-2.5 bg-black/80 rounded-xl text-white text-[10px] font-black uppercase border border-white/10 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  Skip in {skipTime}s
                </div>
              ) : (
                <button 
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-6 py-2.5 bg-accent text-bg-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,209,255,0.5)]"
                >
                  <SkipForward className="w-4 h-4" /> Skip Ad
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <video 
        ref={videoRef}
        src={post.videoUrl}
        className="w-full h-full object-contain"
        onPlay={onVideoPlay}
        controls={!showAd && isPlaying}
        muted={isMuted}
        playsInline
      />

      {!isPlaying && !showAd && (
        <button 
          onClick={() => {
            videoRef.current?.play().catch(console.error);
            setIsPlaying(true);
          }}
          className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-all z-20"
        >
          <div className="p-6 bg-accent text-bg-dark rounded-full shadow-[0_0_30px_rgba(0,209,255,0.4)] scale-110 group-hover:scale-125 transition-transform">
            <Play className="w-8 h-8 fill-current" />
          </div>
        </button>
      )}
    </div>
  );
};
