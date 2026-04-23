import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import { Story, AppUser } from '../types';

interface StoryViewerProps {
  stories: Story[];
  initialStoryIndex: number;
  onClose: () => void;
  usersRegistry: Record<string, AppUser>;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  stories, 
  initialStoryIndex, 
  onClose,
  usersRegistry 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const STORY_DURATION = 5000; // 5 seconds per story

  const story = stories[currentIndex];
  const user = usersRegistry[story.authorUid] || {
    displayName: story.authorName,
    photoURL: story.authorPhoto
  };

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[500px] h-full sm:h-[90vh] bg-[#242526] sm:rounded-xl overflow-hidden flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 p-2 flex gap-1 z-20">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ 
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 p-4 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden bg-gray-600">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <UserIcon className="w-full h-full p-2 text-gray-300" />
              )}
            </div>
            <div className="text-white">
              <div className="text-sm font-bold">{user.displayName}</div>
              <div className="text-[10px] opacity-70">
                {story.timestamp ? 'Recently' : 'Just now'}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img 
              key={story.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={story.imageUrl}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Navigation Overlay */}
          <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-1/3 h-full cursor-pointer" />
            <div className="w-1/3 h-full cursor-pointer" onClick={handleNext} />
          </div>

          <button 
            onClick={handlePrev}
            className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom Bar (Optional Action) */}
        <div className="p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Reply to story..." 
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:bg-white/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
