import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radar, User, MapPin, Search, UserPlus, MessageCircle, Navigation, Users } from 'lucide-react';
import { AppUser } from '../types';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NearbyDiscoveryProps {
  currentUser: AppUser;
  nearbyUsers: (AppUser & { distance: number })[];
  onPairRequest: (user: AppUser) => void;
  onChat: (user: AppUser) => void;
  onViewProfile: (uid: string) => void;
}

const NearbyDiscovery: React.FC<NearbyDiscoveryProps> = ({ 
  currentUser, 
  nearbyUsers, 
  onPairRequest, 
  onChat,
  onViewProfile
}) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => setIsScanning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Visual Radar */}
      <div className="relative aspect-square max-w-[300px] mx-auto w-full flex items-center justify-center bg-[#1A1A1B] rounded-full border border-white/5 overflow-hidden shadow-[inset_0_0_50px_rgba(0,209,255,0.05)]">
        {/* Pulsing rings */}
        <AnimatePresence>
          {isScanning && [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.6,
                ease: "easeOut" 
              }}
              className="absolute inset-0 border border-[#00D1FF]/30 rounded-full"
            />
          ))}
        </AnimatePresence>

        {/* Radar Sweep */}
        {isScanning && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00D1FF]/10 to-transparent origin-center rounded-full"
            style={{ width: '100%', height: '100%' }}
          />
        )}

        {/* Center User */}
        <div className="relative z-10 w-16 h-16 rounded-full border-2 border-[#00D1FF] p-1 bg-[#0A0A0B]">
          <div className="w-full h-full rounded-full overflow-hidden">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-full h-full p-2 text-white/40" />
            )}
          </div>
        </div>

        {/* Random scattered dots representing users */}
        {nearbyUsers.map((u, i) => (
          <motion.div
            key={u.uid}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute w-4 h-4 rounded-full border border-[#00D1FF]/50 bg-[#00D1FF]/20"
            style={{
              top: `${50 + Math.sin(i * 1.5) * 35}%`,
              left: `${50 + Math.cos(i * 1.5) * 35}%`,
            }}
          />
        ))}

        {!isScanning && (
          <button 
            onClick={() => setIsScanning(true)}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity hover:opacity-90"
          >
            <Radar className="w-10 h-10 text-[#00D1FF] mb-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Start Scan</span>
          </button>
        )}
      </div>

      {/* Stats/Status */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-dim">Nearby Users</span>
        </div>
        <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent text-[8px] tracking-[0.2em] uppercase font-black px-2 py-1">
          {nearbyUsers.length} Found
        </Badge>
      </div>

      {/* Nearby Users List */}
      <div className="space-y-3">
        {nearbyUsers.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-4 text-text-dim">
            <Radar className="w-12 h-12 opacity-10" />
            <p className="text-[10px] uppercase font-bold tracking-widest leading-loose">
              {isScanning ? 'Scanning your spot...' : 'No one nearby yet.\nShare your location to find friends!'}
            </p>
          </div>
        ) : (
          nearbyUsers.map((u) => (
            <motion.div
              key={u.uid}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-surface border border-white/5 p-3 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => onViewProfile(u.uid)}>
                <div className="w-12 h-12 rounded-full border border-accent/20 overflow-hidden relative">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-2 text-text-dim" />
                  )}
                  {u.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-sm uppercase tracking-tight text-white group-hover:text-accent transition-colors">{u.displayName}</div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3 h-3 text-accent rotate-45" />
                    <span className="text-[10px] font-black text-accent">{u.distance}m Away</span>
                    <span className="text-[10px] mx-1 text-text-dim">•</span>
                    <span className="text-[10px] text-text-dim lowercase">{u.discoveryStatus || 'Active now'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onPairRequest(u)}
                  className="rounded-full bg-white/5 hover:bg-accent/20 hover:text-accent transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => onChat(u)}
                  className="rounded-full bg-white/5 hover:bg-accent/20 hover:text-accent transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Friend Suggestions section */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-dim">People You May Know</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              className="min-w-[140px] flex-shrink-0 bg-surface border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 border border-white/5 overflow-hidden flex items-center justify-center">
                <User className="w-8 h-8 text-text-dim" />
              </div>
              <div className="text-center">
                <div className="font-bold text-xs">Porshi User {i}</div>
                <div className="text-[8px] text-text-dim">Matched via bus trip</div>
              </div>
              <Button size="sm" className="w-full bg-white/5 text-[8px] uppercase font-black hover:bg-accent hover:text-bg-dark rounded-xl h-8">
                Connect
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyDiscovery;
