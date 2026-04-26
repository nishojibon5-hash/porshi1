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
  autoplayEnabled?: boolean;
  isMonetized?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  post, 
  ads, 
  currentUserId, 
  theme, 
  autoplayEnabled = true,
  isMonetized = false
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [showAd, setShowAd] = React.useState(false);
  const [adVideo, setAdVideo] = React.useState<Advertisement | null>(null);
  const [skipTime, setSkipTime] = React.useState(15);
  const [adFinished, setAdFinished] = React.useState(false);
  const [isVastLoading, setIsVastLoading] = React.useState(false);
  const [midRollTriggered, setMidRollTriggered] = React.useState(false);
  
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const adVideoRef = React.useRef<HTMLVideoElement>(null);
  const ytPlayerRef = React.useRef<any>(null);
  const ytIframeRef = React.useRef<HTMLDivElement>(null);
  const viewTracked = React.useRef(false);
  const reachTracked = React.useRef(false);

  // Effective monetization status
  const effectiveIsMonetized = post.isMonetized || isMonetized;

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = post.youtubeUrl ? getYoutubeId(post.youtubeUrl) : null;

  // Initialize YouTube API
  React.useEffect(() => {
    if (!youtubeId || ytPlayerRef.current) return;

    const loadYT = () => {
      if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        (window as any).onYouTubeIframeAPIReady = () => {
          createPlayer();
        };
      } else {
        createPlayer();
      }
    };

    const createPlayer = () => {
      ytPlayerRef.current = new (window as any).YT.Player('yt-player-' + post.id, {
        height: '100%',
        width: '100%',
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          modestbranding: 1,
          rel: 0,
          controls: 1,
          showinfo: 0,
          mute: isMuted ? 1 : 0
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              onVideoPlay();
            }
          }
        }
      });
    };

    loadYT();
  }, [youtubeId, post.id]);

  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  // Autoplay Logic
  React.useEffect(() => {
    if (autoplayEnabled && inView && !showAd && !adVideo) {
      if (youtubeId && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (e) {}
      } else if (videoRef.current) {
        videoRef.current.play().catch(() => {
          // May fail due to browser policies if not muted
          setIsMuted(true);
          videoRef.current?.play().catch(console.error);
        });
        setIsPlaying(true);
      }
    } else if (!inView && isPlaying) {
      if (youtubeId && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } catch (e) {}
      } else if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [inView, autoplayEnabled, youtubeId, showAd, adVideo]);

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
    const fetchAd = async () => {
      // Trigger ad only when user clicks play and we haven't shown pre-roll yet
      if (effectiveIsMonetized && !adFinished && isPlaying && !adVideo && !showAd) {
        // Step 1: Optional API call to get active ad settings (requirement 3)
        try {
           await fetch(`/api/vast?videoId=${post.id}`);
        } catch (e) {
           console.log("API log only");
        }

        const videoAds = ads.filter(ad => ad.status === 'active' && (ad.adType === 'video_skippable' || ad.vastUrl));
        if (videoAds.length > 0) {
          const adminAds = videoAds.filter(ad => ad.isAdminAd);
          const finalAds = adminAds.length > 0 ? adminAds : videoAds;
          const randomAd = finalAds[Math.floor(Math.random() * finalAds.length)];
          
          if (randomAd.vastUrl) {
            setIsVastLoading(true);
            try {
              const response = await fetch(randomAd.vastUrl);
              const xmlText = await response.text();
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlText, "text/xml");
              const mediaFiles = xmlDoc.getElementsByTagName("MediaFile");
              
              if (mediaFiles.length > 0) {
                let mediaUrl = mediaFiles[0].textContent?.trim();
                // Prefer MP4
                for (let i = 0; i < mediaFiles.length; i++) {
                  if (mediaFiles[i].getAttribute("type") === "video/mp4") {
                    mediaUrl = mediaFiles[i].textContent?.trim();
                    break;
                  }
                }
                
                if (mediaUrl) {
                  setAdVideo({ ...randomAd, videoAdUrl: mediaUrl });
                  setShowAd(true);
                  // Pause main players
                  if (videoRef.current) videoRef.current.pause();
                  if (youtubeId && ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
                }
              }
            } catch (error) {
              console.error("VAST load failed", error);
            } finally {
              setIsVastLoading(false);
            }
          } else {
            setAdVideo(randomAd);
            setShowAd(true);
            // Pause main players
            if (videoRef.current) videoRef.current.pause();
            if (youtubeId && ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
          }
        }
      }
    };

    fetchAd();
  }, [effectiveIsMonetized, ads, inView, adFinished, adVideo, post.id, isPlaying, showAd]);

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
    if (!midRollTriggered) {
      setAdFinished(true);
    }
    
    if (youtubeId && ytPlayerRef.current) {
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
    // Track Ad impression/skip as reach
    if (adVideo) {
      updateDoc(doc(db, 'ads', adVideo.id), {
        reach: increment(1)
      }).catch(console.error);
    }
    setAdVideo(null); // Clear ad state
  };

  const toggleMute = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    if (youtubeId && ytPlayerRef.current) {
      if (newMute) ytPlayerRef.current.mute();
      else ytPlayerRef.current.unMute();
    }
  };

  const onTimeUpdate = () => {
    if (!videoRef.current || !effectiveIsMonetized || midRollTriggered) return;
    
    // Simple mid-roll at 50%
    const progress = videoRef.current.currentTime / videoRef.current.duration;
    if (progress >= 0.5) {
      const midRollAds = ads.filter(ad => ad.status === 'active' && ad.vastType === 'mid-roll');
      if (midRollAds.length > 0) {
        setMidRollTriggered(true);
        if (videoRef.current) videoRef.current.pause();
        if (youtubeId && ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
        const randomAd = midRollAds[Math.floor(Math.random() * midRollAds.length)];
        setAdVideo(randomAd);
        setShowAd(true);
        setSkipTime(15);
      }
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
    <div ref={ref} className={`relative w-full ${post.isReel ? 'aspect-reel' : 'aspect-video'} bg-black flex items-center justify-center overflow-hidden group`}>
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
                onClick={toggleMute}
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

      {youtubeId ? (
        <div className={`w-full h-full ${!isPlaying ? 'hidden' : ''}`}>
          <div id={`yt-player-${post.id}`} className="w-full h-full"></div>
        </div>
      ) : (
        <video 
          ref={videoRef}
          src={post.videoUrl}
          className={`w-full h-full ${post.isReel ? 'object-cover' : 'object-contain'}`}
          onPlay={onVideoPlay}
          onTimeUpdate={onTimeUpdate}
          controls={!showAd && isPlaying}
          muted={isMuted}
          playsInline
        />
      )}

      {!isPlaying && !showAd && (
        <button 
          onClick={() => {
            if (youtubeId && ytPlayerRef.current) {
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
            } else {
              videoRef.current?.play().catch(console.error);
              setIsPlaying(true);
            }
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
