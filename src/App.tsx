/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { 
  Nfc, 
  Scan, 
  PenLine, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  History,
  Trash2,
  Wifi,
  Link as LinkIcon,
  Type,
  User as UserIcon,
  MessageSquare,
  Send,
  X,
  LogOut,
  UserPlus,
  Minimize2,
  ChevronDown,
  ArrowLeft,
  Camera as CameraIcon,
  Loader2,
  Home,
  Users,
  Bell,
  Search,
  PlusSquare,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Radar,
  Bookmark,
  Image as ImageIcon,
  Video as VideoIcon,
  Smile,
  Globe,
  Lock,
  UserCheck,
  BarChart,
  TrendingUp,
  DollarSign,
  Activity,
  Star,
  Moon,
  Sun,
  LayoutDashboard,
  Megaphone,
  Target,
  Wallet,
  CreditCard,
  Calendar,
  Menu,
  Store,
  PlayCircle,
  UserCircle,
  Plus,
  ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import NearbyDiscovery from './components/NearbyDiscovery';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  updateDoc,
  getDoc,
  orderBy,
  limit,
  OperationType,
  handleFirestoreError,
  User as FirebaseUser,
  Timestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  storage,
  deleteDoc,
  increment,
  writeBatch,
  startAfter,
  getDocs
} from './firebase';

import { 
  AppUser, 
  Post, 
  Story, 
  ChatMessage, 
  PairRequest, 
  MonetizationData,
  AppConfig,
  Advertisement,
  AppNotification
} from './types';
import { PostCard } from './components/PostCard';

interface ActiveChat {
  id: string;
  partnerId: string;
  partnerName: string;
}

export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentApp, setCurrentApp] = useState<'porshi' | 'porsh'>('porshi');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [onlineUsers, setOnlineUsers] = useState<AppUser[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isPostCreationModalOpen, setIsPostCreationModalOpen] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<PairRequest | null>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [marketSearch, setMarketSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppUser[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<(AppUser & { distance: number })[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLimit, setPostsLimit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [postInput, setPostInput] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postVideo, setPostVideo] = useState<File | null>(null);
  const [postVideoPreview, setPostVideoPreview] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPostMonetized, setIsPostMonetized] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [monetizationData, setMonetizationData] = useState<MonetizationData | null>(null);
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    objective: 'views',
    location: '',
    audience: '',
    websiteUrl: '',
    durationDays: 5,
    budget: 100
  });
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [showAdPaymentModal, setShowAdPaymentModal] = useState(false);
  const [pendingAdId, setPendingAdId] = useState<string | null>(null);
  const [myAds, setMyAds] = useState<Advertisement[]>([]);
  const [allAds, setAllAds] = useState<Advertisement[]>([]);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isAppActive, setIsAppActive] = useState(true);
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [viewingProfileUser, setViewingProfileUser] = useState<AppUser | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  
  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isAdminNoticeAll, setIsAdminNoticeAll] = useState(false);
  const [adminNoticeTargetUid, setAdminNoticeTargetUid] = useState<string>('');
  const [adminNoticeType, setAdminNoticeType] = useState<'system' | 'link' | 'event' | 'message'>('system');
  const [adminNoticeTitle, setAdminNoticeTitle] = useState('');
  const [adminNoticeMessage, setAdminNoticeMessage] = useState('');
  const [adminNoticeLink, setAdminNoticeLink] = useState('');
  const [isSendingNotice, setIsSendingNotice] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Helper to enforce auth
  const withAuth = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

  const navigateToProfile = (uid: string) => {
    if (!uid) return;
    setSelectedUserUid(uid);
    setActiveTab('profile');
  };

  const withAuthClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    withAuth(action);
  };
  
  // Auth Form States
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [authProcessingStep, setAuthProcessingStep] = useState<string>('');
  const [authLogs, setAuthLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setAuthLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 9)]);
  };

  const registrationData = useRef<{ name: string; phone: string } | null>(null);

  const postImageInputRef = useRef<HTMLInputElement>(null);
  const storyImageInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [followingUids, setFollowingUids] = useState<string[]>([]);
  const [homeFeedTab, setHomeFeedTab] = useState<'all' | 'following'>('all');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isMobileCreateMenuOpen, setIsMobileCreateMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const loadMorePosts = () => {
    if (hasMorePosts && !isLoadingMore) {
      setIsLoadingMore(true);
      setPostsLimit(prev => prev + 10);
    }
  };

  const uploadToCloudinary = (file: string | File, resourceType: 'image' | 'video'): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Hardcoded fallback to ensure it works even if Firestore is empty
      const cloudName = appConfig?.cloudinaryCloudName || 'dozmbxvo5';
      const preset = appConfig?.cloudinaryUploadPreset || 'porshi_preset';
      
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      const xhr = new XMLHttpRequest();
      const fd = new FormData();

      xhr.open('POST', url, true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = (e.loaded / e.total) * 100;
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || 'Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));

      fd.append('upload_preset', preset);
      fd.append('file', file);
      
      xhr.send(fd);
    });
  };

  const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Image compression timed out')), 15000);
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            clearTimeout(timeout);
            return reject(new Error('Canvas context failed'));
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          clearTimeout(timeout);
          resolve(dataUrl);
        } catch (e) {
          clearTimeout(timeout);
          reject(e);
        }
      };
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load failed'));
      };
    });
  };

  const addEmoji = (emoji: string) => {
    setPostInput(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // One Tap Login Implementation
  useEffect(() => {
    if (user || isAuthReady === false) return; // Wait for auth state to be checked

    const clientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID || '435191884841-2sedo4n3d14i6q45nvolqgf08ompsnrg.apps.googleusercontent.com';

    const handleOneTapResponse = async (response: any) => {
      try {
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(auth, credential);
      } catch (error: any) {
        console.error('One Tap Auth Error:', error);
        setErrorMessage('গুগল লগইন সফল হয়নি। দয়া করে আবার চেষ্টা করুন।');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    };

    const initializeOneTap = () => {
      if (!window.google) return;
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleOneTapResponse,
          auto_select: true,
          cancel_on_tap_outside: false,
          use_fedcm_for_prompt: true, // Modern approach
          allowed_parent_origin: window.location.origin
        });

        // Prompt the one tap UI
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap prompt not displayed:', notification.getNotDisplayedReason());
          }
          if (notification.isSkippedMoment()) {
            console.log('One Tap prompt skipped:', notification.getSkippedReason());
          }
        });

        // Also render a button as fallback in the login screen if it's visible
        const loginButtonDiv = document.getElementById('google-login-button');
        if (loginButtonDiv) {
          window.google.accounts.id.renderButton(loginButtonDiv, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 280
          });
        }
      } catch (err) {
        console.error('GIS Init Error:', err);
      }
    };

    // Check for GSI script every 500ms
    const checkGSI = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkGSI);
        initializeOneTap();
      }
    }, 500);

    return () => clearInterval(checkGSI);
  }, [user, isAuthReady]);

  const requestBrowserPermission = () => {
    if (canShowBrowserNotifications) {
      Notification.requestPermission();
    }
  };
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prevOnlineCount = useRef(0);
  const isInitialOnlineLoad = useRef(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let handler: any;
    CapApp.addListener('appStateChange', ({ isActive }) => {
      setIsAppActive(isActive);
    }).then(h => {
      handler = h;
    });
    
    return () => {
      if (handler) handler.remove();
    };
  }, []);

  const canShowBrowserNotifications = 'Notification' in window;
  const browserNotificationPermission = canShowBrowserNotifications ? Notification.permission : 'denied';

  // Request notification permission
  useEffect(() => {
    const requestPermission = async () => {
      // Native (Capacitor)
      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
      } catch (e) {
        console.warn('LocalNotifications not supported');
      }
      
      // Browser
      if (canShowBrowserNotifications && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    };
    requestPermission();
  }, [canShowBrowserNotifications]);

  // Tab change effects
  useEffect(() => {
    setMessageInput('');
    setSearchResults([]);
    setSearchQuery('');
  }, [activeTab]);

  // Geolocation Tracking (Live Location)
  useEffect(() => {
    if (!user || activeTab !== 'scan') return;

    let watchId: number;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            await updateDoc(doc(db, 'users', user.uid), {
              lastLat: latitude,
              lastLng: longitude,
              lastSeen: serverTimestamp(),
              isDiscoverable: true,
              isOnline: true
            });
          } catch (e) {
            console.error('Geo update failed:', e);
          }
        },
        (err) => console.warn('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user?.uid, activeTab]);

  // Nearby Discovery Real-time Listener
  useEffect(() => {
    if (!user || activeTab !== 'scan' || !user.lastLat || !user.lastLng) return;

    const q = query(
      collection(db, 'users'),
      where('isOnline', '==', true),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: (AppUser & { distance: number })[] = [];
      const currentLat = user.lastLat!;
      const currentLng = user.lastLng!;

      snapshot.docs.forEach(snap => {
        const u = { uid: snap.id, ...snap.data() } as any;
        if (u.uid !== user.uid && u.lastLat && u.lastLng) {
          const R = 6371000;
          const dLat = (u.lastLat - currentLat) * Math.PI / 180;
          const dLng = (u.lastLng - currentLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(currentLat * Math.PI / 180) * Math.cos(u.lastLat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = Math.round(R * c);
          
          if (distance < 5000) users.push({ ...u, distance });
        }
      });
      setNearbyUsers(users.sort((a, b) => a.distance - b.distance));
    });
    return () => unsubscribe();
  }, [user?.uid, activeTab, user?.lastLat, user?.lastLng]);

  const handleGlobalSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', val),
        where('displayName', '<=', val + '\uf8ff'),
        limit(20)
      );
      const snap = await getDocs(q);
      setSearchResults(snap.docs.map(d => ({ uid: d.id, ...d.data() } as AppUser)));
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const showNotification = async (title: string, body: string) => {
    // 1. Native Notification (Capacitor) - Works in background/foreground on Android
    try {
      if (Capacitor.isNativePlatform()) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 100) },
              sound: undefined,
              attachments: undefined,
              actionTypeId: '',
              extra: null
            }
          ]
        });
      }
    } catch (error) {
      console.warn('Native notification failed:', error);
    }

    // 2. Browser Notification (Fallback/Web)
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: 'https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png',
        tag: 'porshi-alert'
      });

      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }

      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play().catch(() => {});
    }
  };

  // Initialize profile form
  useEffect(() => {
    if (user) {
      setNewDisplayName(user.displayName || '');
      setNewBio(user.bio || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: newDisplayName.trim() || user.displayName,
        bio: newBio.trim()
      });
      // Update local state
      setUser({ ...user, displayName: newDisplayName.trim() || user.displayName, bio: newBio.trim() });
      setErrorMessage('প্রোফাইল আপডেট হয়েছে!');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setErrorMessage('প্রোফাইল আপডেট করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use a small preview version if possible, but for simplicity we read the whole thing then compress
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      callback(base64String);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleProfilePictureClick = () => {
    profileImageInputRef.current?.click();
  };

  const uploadProfilePicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    handleFileSelect(e, async (base64Data) => {
      setIsUploadingPhoto(true);
      try {
        addLog('প্রোফাইল ছবি প্রসেস হচ্ছে...');
        let photoURL = '';
        
        if (appConfig?.cloudinaryCloudName) {
          addLog('প্রোফাইল ছবি আলটিমেট মোডে আপলোড হচ্ছে...');
          photoURL = await uploadToCloudinary(base64Data, 'image');
        } else {
          // Compress heavily to stay under 1MB Firestore limit
          photoURL = await compressImage(base64Data, 300, 0.6);
        }
        
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: photoURL
        });
        
        setUser({ ...user, photoURL: photoURL });
        addLog('প্রোফাইল ছবি আপডেট সফল!');
        setErrorMessage('প্রোফাইল ছবি আপডেট হয়েছে!');
        setTimeout(() => setErrorMessage(null), 3000);
      } catch (error: any) {
        console.error('Photo upload error:', error);
        addLog(`ফটো এরর: ${error.message}`);
        setErrorMessage('ছবি আপডেট করতে সমস্যা হয়েছে।');
        setTimeout(() => setErrorMessage(null), 4000);
      } finally {
        setIsUploadingPhoto(false);
      }
    });
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!postInput.trim() && !postImage && !postVideo)) return;

    // Save values for background upload
    const currentInput = postInput.trim();
    const currentImage = postImage;
    const currentVideo = postVideo;

    // Reset inputs immediately to give instant feedback
    setPostInput('');
    setPostImage(null);
    setPostVideo(null);
    setPostVideoPreview(null);
    setIsCreatingPost(true);
    setUploadProgress(0);
    setErrorMessage('পোস্ট আপলোড হচ্ছে...');

    // Progress Simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return prev;
        // Faster at start, slower as it reaches 90%
        const inc = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
        return Math.min(prev + inc, 95);
      });
    }, 200);

    // Start background upload process
    (async () => {
      try {
        let imageUrl = '';
        let videoUrl = '';
        let mediaType: 'image' | 'video' | undefined = undefined;

        if (currentImage) {
          mediaType = 'image';
          addLog('ছবি প্রসেস হচ্ছে... (Firestore)');
          const dataURL = await compressImage(currentImage, 800, 0.4);
          imageUrl = dataURL; 
          addLog('ছবি প্রসেস সফল!');
        } else if (currentVideo) {
          mediaType = 'video';
          addLog('ভিডিও প্রসেস হচ্ছে... (Cloudinary)');
          
          // Check Video Duration
          const videoElement = document.createElement('video');
          videoElement.src = URL.createObjectURL(currentVideo);
          await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
              if (videoElement.duration > 31) { // 31 to be generous
                URL.revokeObjectURL(videoElement.src);
                throw new Error('৩০ সেকেন্ডের বেশি বড় ভিডিও আপলোড করা সম্ভব না।');
              }
              resolve(true);
            };
          });
          URL.revokeObjectURL(videoElement.src);

          videoUrl = await uploadToCloudinary(currentVideo, 'video');
          addLog('ভিডিও প্রসেস সফল!');
        }

        addLog('ডাটাবেজে সেভ হচ্ছে...');
        await addDoc(collection(db, 'posts'), {
          authorUid: user.uid,
          authorName: user.displayName,
          authorPhoto: user.photoURL || '',
          content: currentInput,
          mediaType,
          imageUrl,
          videoUrl,
          likesCount: 0,
          commentsCount: 0,
          timestamp: serverTimestamp(),
          isMonetized: isPostMonetized,
          privacy: postPrivacy
        });

        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsCreatingPost(false);
          setUploadProgress(0);
        }, 500);

        addLog('পোস্ট সফলভাবে পাবলিশ হয়েছে!');
        setErrorMessage('পোস্ট সফলভাবে পাবলিশ হয়েছে!');
        setTimeout(() => setErrorMessage(null), 3000);
      } catch (error: any) {
        clearInterval(progressInterval);
        setIsCreatingPost(false);
        setUploadProgress(0);
        console.error('Background Post error:', error);
        addLog(`পোস্ট এরর: ${error.message}`);
        setErrorMessage(`আপলোড ব্যর্থ: ${error.message}`);
        setTimeout(() => setErrorMessage(null), 5000);
      }
    })();
  };

  const deletePost = async (postId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setErrorMessage('পোস্ট ডিলেট করা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      console.error('Delete post error:', error);
      setErrorMessage('পোস্ট ডিলেট করতে সমস্যা হয়েছে।');
    }
  };

  const updatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingPost || !postInput.trim()) return;

    try {
      const postRef = doc(db, 'posts', editingPost.id);
      await updateDoc(postRef, {
        content: postInput.trim(),
        isEdited: true,
        privacy: postPrivacy
      });
      setEditingPost(null);
      setPostInput('');
      setPostPrivacy('public');
      setErrorMessage('পোস্ট আপডেট করা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      console.error('Update post error:', error);
      setErrorMessage('পোস্ট আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;
    
    // Optimistic Update locally
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isCurrentlyLiked = false; // We don't easily know without tracking, but we can toggle
        return { ...p, likesCount: p.likesCount + 1 }; 
      }
      return p;
    }));

    const likeRef = doc(db, 'posts', postId, 'likes', user.uid);
    const postRef = doc(db, 'posts', postId);

    try {
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data() as Post;
      
      const likeDoc = await getDoc(likeRef);
      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, { userUid: user.uid, timestamp: serverTimestamp() });
        await updateDoc(postRef, { likesCount: increment(1) });
        
        // Reward author if post is monetized
        if (postData.isMonetized && postData.authorUid !== user.uid) {
          const authorMonetizationRef = doc(db, 'monetization', postData.authorUid);
          await updateDoc(authorMonetizationRef, {
            totalEarnings: increment(0.01), // $0.01 per like
            engagement: increment(1)
          });
        }

        // Send Notification
        if (postData.authorUid !== user.uid) {
          await sendNotification({
            toUid: postData.authorUid,
            fromUid: user.uid,
            fromName: user.displayName,
            fromPhoto: user.photoURL,
            type: 'like',
            title: 'নতুন লাইক!',
            message: `${user.displayName} আপনার পোস্টে লাইক দিয়েছেন।`
          });
        }
      }
    } catch (error) {
      console.error('Like post error:', error);
      setErrorMessage('লাইক করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.WRITE, `posts/${postId}/likes`);
    }
  };

  const selectPostImage = () => {
    postImageInputRef.current?.click();
  };

  const handlePostImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      handleFileSelect(e, (base64) => {
        setPostImage(base64);
        setPostVideo(null);
        setPostVideoPreview(null);
      });
    } else if (file.type.startsWith('video/')) {
      setPostVideo(file);
      setPostImage(null);
      const url = URL.createObjectURL(file);
      setPostVideoPreview(url);
    }
  };

  // Admin Handlers
  const handleTogglePaidMode = async () => {
    try {
      const currentStatus = appConfig?.adPaidMode || false;
      await updateDoc(doc(db, 'appConfig', 'remote-settings'), {
        adPaidMode: !currentStatus
      });
      setErrorMessage(`পেইড মোড ${!currentStatus ? 'চালু' : 'বন্ধ'} হয়েছে`);
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      console.error('Paid mode toggle error:', error);
      setErrorMessage(`এরর: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleUpdateAdNumber = async (num: string) => {
    try {
      await updateDoc(doc(db, 'appConfig', 'remote-settings'), {
        adPaymentNumber: num
      });
      setErrorMessage('পেমেন্ট নাম্বার আপডেট হয়েছে');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(`এরর: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleToggleMaintenance = async () => {
    try {
      const currentVal = appConfig?.maintenanceMode || false;
      await updateDoc(doc(db, 'appConfig', 'remote-settings'), {
        maintenanceMode: !currentVal
      });
      setErrorMessage(`মেইনটেন্যান্স মোড ${!currentVal ? 'চালু' : 'বন্ধ'} হয়েছে`);
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(`এরর: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleUpdateUserMonetization = async (u: any) => {
    try {
      await updateDoc(doc(db, 'users', u.uid), { isMonetized: !u.isMonetized });
      setErrorMessage(`${u.displayName} এর মনিটাইজেশন ${!u.isMonetized ? 'চালু' : 'বন্ধ'} হয়েছে`);
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(`এরর: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const sendNotification = async (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        ...notif,
        isRead: false,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleSendAdminNotice = async () => {
    if (!user) return;
    if (!isAdminNoticeAll && !adminNoticeTargetUid) {
      setErrorMessage('দয়া করে একজন ইউজার সিলেক্ট করুন।');
      return;
    }
    if (!adminNoticeTitle.trim() || !adminNoticeMessage.trim()) {
      setErrorMessage('টাইটেল এবং মেসেজ লিখুন।');
      return;
    }

    setIsSendingNotice(true);
    try {
      await sendNotification({
        toUid: isAdminNoticeAll ? 'all' : adminNoticeTargetUid,
        fromUid: user.uid,
        fromName: 'পড়শি টীম (Admin)',
        fromPhoto: user.photoURL,
        type: adminNoticeType,
        title: adminNoticeTitle.trim(),
        message: adminNoticeMessage.trim(),
        link: adminNoticeLink.trim() || undefined
      });
      setErrorMessage('নটিফিকেশন পাঠানো হয়েছে!');
      setAdminNoticeTitle('');
      setAdminNoticeMessage('');
      setAdminNoticeLink('');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(`এরর: ${error.message}`);
    } finally {
      setIsSendingNotice(false);
    }
  };

  const createStory = () => {
    storyImageInputRef.current?.click();
  };

  const handleStoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    addLog('স্টোরি প্রসেস শুরু হচ্ছে...');
    
    try {
      let imageUrl = '';
      let videoUrl = '';
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        throw new Error('শুধুমাত্র ছবি বা ভিডিও আপলোড করা সম্ভব।');
      }

      if (isImage) {
        addLog('স্টোরি (ছবি) প্রসেস হচ্ছে...');
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('ছবি পড়তে সমস্যা হয়েছে।'));
          reader.readAsDataURL(file);
        });
        imageUrl = await compressImage(imageData, 800, 0.3);
      } else if (isVideo) {
        addLog('স্টোরি (ভিডিও) প্রসেস হচ্ছে...');
        
        // Video Duration Check
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        videoElement.src = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          videoElement.onloadedmetadata = () => {
            if (videoElement.duration > 32) { // 32s buffer
              reject(new Error('৩০ সেকেন্ডের বেশি বড় ভিডিও স্টোরিতে দেওয়া যাবে না।'));
            } else {
              resolve(true);
            }
          };
          videoElement.onerror = () => reject(new Error('ভিডিও ফাইলটি বৈধ নয়।'));
          // Safety timeout
          setTimeout(() => reject(new Error('ভিডিও তথ্য পড়তে অনেক সময় লাগছে।')), 10000);
        });
        URL.revokeObjectURL(videoElement.src);

        addLog('ভিডিও ক্লাউডিনারিতে আপলোড হচ্ছে...');
        videoUrl = await uploadToCloudinary(file, 'video');
      }

      addLog('ডাটাবেজে সেভ হচ্ছে...');
      await addDoc(collection(db, 'stories'), {
        authorUid: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL || '',
        mediaType: isImage ? 'image' : 'video',
        imageUrl,
        videoUrl,
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      addLog('স্টোরি পাবলিশ সফল!');
      setErrorMessage('স্টোরি আপলোড হয়েছে!');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (err: any) {
      console.error('Story upload error details:', err);
      setErrorMessage(err.message || 'স্টোরি আপলোড করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Listen for monetization data
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'monetization', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setMonetizationData(docSnap.data() as MonetizationData);
      } else {
        // Initialize mock data if not exists
        const initialData: MonetizationData = {
          totalEarnings: 125.50,
          monthlyEarnings: 45.20,
          reach: 12500,
          engagement: 4500,
          followers: 1200,
          lastUpdated: serverTimestamp()
        };
        setDoc(doc(db, 'monetization', user.uid), initialData);
      }
    });
    return () => unsub();
  }, [user]);

  const reactToPost = async (postId: string, reactionType: string) => {
    if (!user) return;

    // Optimistic
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const reactions = { ...p.reactions };
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        return { ...p, reactions };
      }
      return p;
    }));

    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data() as Post;
      
      await updateDoc(postRef, {
        [`reactions.${reactionType}`]: increment(1)
      });

      // Reward author if post is monetized
      if (postData.isMonetized && postData.authorUid !== user.uid) {
        const authorMonetizationRef = doc(db, 'monetization', postData.authorUid);
        await updateDoc(authorMonetizationRef, {
          totalEarnings: increment(0.02), // Reactions are worth more
          engagement: increment(1)
        });
      }

      // Send Notification
      if (postData.authorUid !== user.uid) {
        await sendNotification({
          toUid: postData.authorUid,
          fromUid: user.uid,
          fromName: user.displayName,
          fromPhoto: user.photoURL,
          type: 'like', // Reusing like type for reactions
          title: 'নতুন রিঅ্যাকশন!',
          message: `${user.displayName} আপনার পোস্টে রিঅ্যাক্ট করেছেন।`
        });
      }
    } catch (error) {
      console.error('Reaction error:', error);
      setErrorMessage('রিঅ্যাক্ট করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentingPostId || !commentInput.trim()) return;

    // Optimistic Update
    const tempId = 'temp-' + Date.now();
    const newComment = {
      id: tempId,
      authorUid: user.uid,
      authorName: user.displayName || 'User',
      authorPhoto: user.photoURL || '',
      text: commentInput.trim(),
      timestamp: { toDate: () => new Date() } as any
    };

    setPostComments(prev => [newComment, ...prev]);
    setPosts(prev => prev.map(p => p.id === commentingPostId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    const savedCommentText = commentInput.trim();
    setCommentInput('');

    try {
      await addDoc(collection(db, 'posts', commentingPostId, 'comments'), {
        authorUid: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL || '',
        text: savedCommentText,
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'posts', commentingPostId), {
        commentsCount: increment(1)
      });

      // Send Notification
      const postDoc = await getDoc(doc(db, 'posts', commentingPostId));
      const postData = postDoc.data() as Post;
      if (postData && postData.authorUid !== user.uid) {
        await sendNotification({
          toUid: postData.authorUid,
          fromUid: user.uid,
          fromName: user.displayName,
          fromPhoto: user.photoURL,
          type: 'comment',
          title: 'নতুন কমেন্ট!',
          message: `${user.displayName} আপনার পোস্টে কমেন্ট করেছেন: "${savedCommentText.substring(0, 30)}..."`
        });
      }
    } catch (error) {
      console.error('Comment error:', error);
      setErrorMessage('কমেন্ট করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.CREATE, `posts/${commentingPostId}/comments`);
    }
  };

  const renderMessenger = () => {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-dark">
        <div className="p-4 border-b border-border-custom flex justify-between items-center bg-surface/95 backdrop-blur-2xl sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 overflow-hidden">
              <MessageSquare className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-black uppercase tracking-widest text-lg text-accent">PORSH</div>
              <div className="text-[8px] text-text-dim uppercase font-bold">মেসেঞ্জার অ্যাপ</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={createStory} className="text-text-dim hover:text-accent"><CameraIcon className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setActiveTab('profile')} className="text-text-dim hover:text-accent"><PenLine className="w-5 h-5" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Active Friends Horizontal */}
          <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar border-b border-border-custom/30">
            {onlineUsers.map(u => (
              <div key={u.uid} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border-2 border-accent p-0.5">
                    <div className="w-full h-full rounded-full overflow-hidden bg-bg-dark">
                      {u.photoURL ? (
                        <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-6 h-6 text-accent" /></div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 bg-accent border-2 border-bg-dark rounded-full" />
                </div>
                <span className="text-[8px] font-bold uppercase text-text-dim truncate w-14 text-center">{u.displayName}</span>
              </div>
            ))}
          </div>

          {/* Chat List */}
          <div className="p-2">
            {onlineUsers.map(u => (
              <button 
                key={u.uid}
                onClick={() => setActiveChat({ id: u.uid, partnerId: u.uid, partnerName: u.displayName })}
                className="w-full p-4 flex items-center gap-4 hover:bg-accent/5 transition-all text-left group rounded-2xl"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-border-custom overflow-hidden bg-bg-dark">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-6 h-6 text-accent" /></div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent border-4 border-bg-dark rounded-full" />
                </div>
                <div className="flex-1 border-b border-border-custom/30 pb-4 group-last:border-none">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold uppercase tracking-tighter text-sm text-white">{u.displayName}</span>
                    <span className="text-[8px] text-text-dim uppercase">১০:৩০ AM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-text-dim uppercase tracking-tighter truncate max-w-[180px]">আপনি: হাই, কেমন আছেন?</p>
                    <div className="w-2 h-2 rounded-full bg-accent" />
                  </div>
                </div>
              </button>
            ))}
            {onlineUsers.length === 0 && (
              <div className="p-20 text-center opacity-20">
                <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xs uppercase font-bold tracking-widest">কোনো মেসেজ নেই</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleCreateAd = async () => {
    if (!user) return;
    if (!adForm.title.trim() || !adForm.description.trim()) {
      setErrorMessage('দয়া করে বিজ্ঞাপনের টাইটেল এবং ডিসক্রিপশন দিন।');
      return;
    }

    setIsCreatingAd(true);
    addLog('বিজ্ঞাপন তৈরি হচ্ছে...');

    try {
      const adData: Omit<Advertisement, 'id'> = {
        advertiserUid: user.uid,
        advertiserName: user.displayName,
        title: adForm.title,
        description: adForm.description,
        objective: adForm.objective as any,
        location: adForm.location || 'All Bangladesh',
        audience: adForm.audience || 'All Audience',
        durationDays: adForm.durationDays,
        budget: adForm.budget,
        status: 'pending',
        paymentStatus: appConfig?.adPaidMode ? 'unpaid' : 'paid',
        timestamp: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + adForm.durationDays * 24 * 60 * 60 * 1000),
        reach: 0,
        clicks: 0,
        websiteUrl: adForm.websiteUrl
      };

      if (!appConfig?.adPaidMode) {
        adData.status = 'active';
      }

      const docRef = await addDoc(collection(db, 'ads'), adData);
      setPendingAdId(docRef.id);
      
      if (appConfig?.adPaidMode) {
        setShowAdPaymentModal(true);
      } else {
        setErrorMessage('বিজ্ঞাপন সফলভাবে লাইভ হয়েছে!');
        setTimeout(() => setErrorMessage(null), 3000);
      }

      setAdForm({
        title: '',
        description: '',
        objective: 'views',
        location: '',
        audience: '',
        websiteUrl: '',
        durationDays: 5,
        budget: 100
      });
      addLog('বিজ্ঞাপন সেভ হয়েছে!');
    } catch (error: any) {
      console.error('Create Ad error:', error);
      setErrorMessage(`বিজ্ঞাপন তৈরিতে সমস্যা হয়েছে: ${error.message}`);
    } finally {
      setIsCreatingAd(false);
    }
  };

  const renderAdPaymentModal = () => {
    if (!showAdPaymentModal) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full geometric-card p-8 space-y-6 relative"
        >
          <button onClick={() => setShowAdPaymentModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-text-dim" /></button>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">পেমেন্ট কমপ্লিট করুন</h2>
            <p className="text-text-dim text-[10px] uppercase tracking-widest leading-relaxed">বিজ্ঞাপনটি লাইভ করতে ১০০ টাকা পেমেন্ট করুন ৫ দিনের জন্য।</p>
          </div>

          <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-dim uppercase font-bold">বিকাশ/নগদ (পার্সোনাল)</span>
              <span className="text-accent font-black tracking-widest">{appConfig?.adPaymentNumber}</span>
            </div>
            <div className="pt-2 border-t border-accent/10 flex justify-between items-center">
              <span className="text-[10px] text-text-dim uppercase">মোট প্রদেয়</span>
              <span className="text-xl font-black">৳১০০.০০</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] text-text-dim uppercase italic text-center">উপরে দেওয়া নম্বরে সেন্ড মানি (Send Money) করার পর নিচের বাটনে ক্লিক করুন। অ্যাডমিন ভেরিফাই করে বিজ্ঞাপন লাইভ করবেন।</p>
            <Button 
              onClick={async () => {
                if (pendingAdId) {
                  await updateDoc(doc(db, 'ads', pendingAdId), { status: 'pending' });
                  setErrorMessage('পেমেন্ট রিকোয়েস্ট পাঠানো হয়েছে। অনুগ্রহ করে অপেক্ষা করুন।');
                  setTimeout(() => setErrorMessage(null), 3000);
                }
                setShowAdPaymentModal(false);
              }}
              className="geometric-btn w-full h-14"
            >
              আমি পেমেন্ট করেছি
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderAdsContent = () => {
    return (
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('home')} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${theme === 'dark' ? 'text-accent' : 'text-[#1877F2]'}`}>
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-5xl font-black italic tracking-tighter text-accent uppercase">Ad Manager</h1>
              </div>
              <p className="text-text-dim text-xs uppercase tracking-[4px] ml-12">বিজ্ঞাপন দিন আর ব্যবসার পরিধি বাড়ান</p>
            </div>
            <div className="flex gap-4">
              <div className="p-6 bg-surface/30 rounded-2xl border border-border-custom text-center min-w-[140px]">
                <div className="text-2xl font-black text-accent">{myAds.length}</div>
                <div className="text-[8px] text-text-dim uppercase tracking-widest mt-1">Total Campaigns</div>
              </div>
              <div className="p-6 bg-surface/30 rounded-2xl border border-border-custom text-center min-w-[140px]">
                <div className="text-2xl font-black text-accent">{myAds.reduce((acc, ad) => acc + (ad.reach || 0), 0)}</div>
                <div className="text-[8px] text-text-dim uppercase tracking-widest mt-1">Total Reach</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Ad Creation Form */}
            <div className="xl:col-span-2 space-y-6">
              <div className="geometric-card p-8 space-y-6 bg-surface/30">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                  <PlusSquare className="w-4 h-4" /> নতুন বিজ্ঞাপন তৈরি করুন
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">বিজ্ঞাপনের টাইটেল</Label>
                    <Input 
                      placeholder="e.g. বিশেষ ছাড় অফার!" 
                      value={adForm.title}
                      onChange={(e) => setAdForm({...adForm, title: e.target.value})}
                      className="bg-bg-dark/50 border-border-custom text-xs h-12"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">কি লিখে বিজ্ঞাপন দিতে চান?</Label>
                    <textarea 
                      placeholder="বিজ্ঞাপনের বিস্তারিত লিখুন এখানে..."
                      value={adForm.description}
                      onChange={(e) => setAdForm({...adForm, description: e.target.value})}
                      className="w-full bg-bg-dark/50 border border-border-custom rounded-xl p-4 text-xs h-32 focus:border-accent transition-colors outline-none text-white font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">লক্ষ্য (Objective)</Label>
                      <select 
                        value={adForm.objective}
                        onChange={(e) => setAdForm({...adForm, objective: e.target.value})}
                        className="w-full bg-bg-dark/50 border border-border-custom rounded-xl p-3 text-xs outline-none focus:border-accent"
                      >
                        <option value="views">ভিডিও ভিউ</option>
                        <option value="likes">লাইক ও এঙ্গেজমেন্ট</option>
                        <option value="followers">ফলোয়ার বৃদ্ধি</option>
                        <option value="website_views">ওয়েবসাইট ভিউ</option>
                        <option value="sales">সেলস / অর্ডার</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">লোকেশন</Label>
                      <Input 
                        placeholder="e.g. Dhaka, Bangladesh" 
                        value={adForm.location}
                        onChange={(e) => setAdForm({...adForm, location: e.target.value})}
                        className="bg-bg-dark/50 border-border-custom text-xs h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">অডিয়েন্স ও ইন্টারেস্ট</Label>
                    <Input 
                      placeholder="e.g. Students, Tech Enthusiasts" 
                      value={adForm.audience}
                      onChange={(e) => setAdForm({...adForm, audience: e.target.value})}
                      className="bg-bg-dark/50 border-border-custom text-xs h-12"
                    />
                  </div>

                  {adForm.objective === 'website_views' && (
                    <div className="space-y-1 animate-in slide-in-from-top-2">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">ওয়েবসাইট লিঙ্ক</Label>
                      <Input 
                        placeholder="https://example.com" 
                        value={adForm.websiteUrl}
                        onChange={(e) => setAdForm({...adForm, websiteUrl: e.target.value})}
                        className="bg-bg-dark/50 border-border-custom text-xs h-12 text-accent"
                      />
                    </div>
                  )}

                  <div className="p-4 bg-bg-dark rounded-2xl border border-border-custom flex items-center justify-between">
                    <div>
                      <div className="text-[8px] uppercase font-bold text-text-dim">বিজ্ঞাপনের রেট</div>
                      <div className="text-sm font-black">৳১০০ / ৫ দিন</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] uppercase font-bold text-text-dim">আনুমানিক রিচ</div>
                      <div className="text-sm font-black text-accent">৫০০০ - ১০০০০</div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateAd}
                    disabled={isCreatingAd}
                    className="geometric-btn w-full h-14"
                  >
                    {isCreatingAd ? <Loader2 className="w-5 h-5 animate-spin" /> : 'বিজ্ঞাপন চালু করুন'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Campaigns List */}
            <div className="xl:col-span-3 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2 mb-4">
                <Target className="w-4 h-4" /> আপনার ক্যাম্পেইনসমূহ
              </h2>
              
              <div className="space-y-4">
                {myAds.map(ad => (
                  <div key={ad.id} className="geometric-card p-6 bg-bg-dark/40 border-border-custom/50 flex flex-col md:flex-row gap-6 hover:border-accent/40 transition-all group">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[8px] uppercase font-bold tracking-widest py-1 px-3 ${ad.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                          {ad.status === 'active' ? 'Running' : 'Pending Verification'}
                        </Badge>
                        <span className="text-[10px] text-text-dim font-bold">{ad.timestamp?.toDate().toLocaleDateString()}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-accent transition-colors">{ad.title}</h3>
                        <p className="text-[10px] text-text-dim line-clamp-2 mt-1 leading-relaxed uppercase">{ad.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Activity className="w-3 h-3 text-accent" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">{ad.objective}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Users className="w-3 h-3 text-accent" />
                          <span className="text-[8px] font-bold uppercase tracking-widest">{ad.audience}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-border-custom/30 pt-4 md:pt-0 md:pl-6 min-w-[120px]">
                      <div className="text-right">
                        <div className="text-[8px] text-text-dim uppercase font-bold mb-1">Total Reach</div>
                        <div className="text-2xl font-black text-accent">{ad.reach || 0}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] text-text-dim uppercase font-bold mb-1">Clicks</div>
                        <div className="text-2xl font-black text-white">{ad.clicks || 0}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {myAds.length === 0 && (
                  <div className="p-20 text-center border-2 border-dashed border-border-custom rounded-3xl opacity-20">
                    <Megaphone className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-xs uppercase font-bold tracking-[8px]">কোনো বিজ্ঞাপন নেই</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPostCreationModal = () => {
    if (!isPostCreationModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-bg-dark/80 backdrop-blur-md animate-in fade-in duration-300">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#242526] w-full max-w-xl sm:rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[100vh] sm:max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-[#3E4042] flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              {editingPost ? 'Edit post' : 'Create post'}
            </h2>
            <button 
              onClick={() => {
                setIsPostCreationModalOpen(false);
                setEditingPost(null);
                setPostInput('');
                setPostImage(null);
                setPostVideo(null);
                setPostVideoPreview(null);
                setPostPrivacy('public');
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
             {/* User Info */}
             <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                 {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserCircle className="w-full h-full p-2 text-text-dim" />}
               </div>
               <div>
                  <div className="text-sm font-bold">{user?.displayName}</div>
                  <div className="flex gap-2 mt-1">
                    <select 
                      value={postPrivacy}
                      onChange={(e) => setPostPrivacy(e.target.value as any)}
                      className="bg-[#E4E6EB] dark:bg-[#3A3B3C] text-[10px] font-bold px-2 py-1 rounded-md outline-none cursor-pointer hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors"
                    >
                      <option value="public">🌍 Public</option>
                      <option value="followers">👥 Followers</option>
                      <option value="private">🔒 Only me</option>
                    </select>

                    {user?.isMonetized && (
                      <button 
                        onClick={() => setIsPostMonetized(!isPostMonetized)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${isPostMonetized ? 'bg-accent text-bg-dark' : 'bg-gray-100 dark:bg-[#3A3B3C] text-text-dim'}`}
                      >
                        {isPostMonetized ? '$ Monetized' : 'Free Post'}
                      </button>
                    )}
                  </div>
               </div>
             </div>

             {/* Text Input */}
             <textarea 
               autoFocus
               placeholder={editingPost ? "Edit your post..." : `What's on your mind, ${user?.displayName.split(' ')[0]}?`}
               value={postInput}
               onChange={(e) => setPostInput(e.target.value)}
               className="w-full bg-transparent text-lg resize-none outline-none min-h-[120px] placeholder:text-gray-400 dark:placeholder:text-gray-500"
             />

             {/* Media Preview */}
             {postVideoPreview ? (
               <div className="relative rounded-xl overflow-hidden mb-4 border border-gray-100 dark:border-[#3E4042]">
                 <video src={postVideoPreview} controls className="w-full max-h-[300px]" />
                 {!editingPost && (
                   <button onClick={() => {setPostVideo(null); setPostVideoPreview(null);}} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"><X className="w-4 h-4"/></button>
                 )}
               </div>
             ) : postImage && (
                <div className="relative rounded-xl overflow-hidden mb-4 border border-gray-100 dark:border-[#3E4042]">
                  <img src={postImage} alt="" className="w-full object-cover max-h-[300px]" />
                  {!editingPost && (
                    <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"><X className="w-4 h-4"/></button>
                  )}
                </div>
             )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 dark:border-[#3E4042]">
            {!editingPost && (
              <div className="flex items-center justify-between p-2 mb-4 border border-gray-200 dark:border-[#3E4042] rounded-xl">
                 <span className="text-sm font-bold ml-2">Add to your post</span>
                 <div className="flex gap-1 pr-1">
                    <button onClick={selectPostImage} className="p-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-full transition-colors"><ImageIcon className="w-6 h-6 text-green-500" /></button>
                    <button onClick={selectPostImage} className="p-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-full transition-colors"><VideoIcon className="w-6 h-6 text-red-500" /></button>
                    <button onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#3A3B3C] rounded-full transition-colors text-yellow-500"><Smile className="w-6 h-6" /></button>
                 </div>
              </div>
            )}

            <Button 
              onClick={editingPost ? updatePost : createPost}
              disabled={isCreatingPost || (!postInput.trim() && !postImage && !postVideo)}
              className="w-full h-10 bg-[#1877F2] text-white hover:bg-[#166FE5] font-bold rounded-lg transition-transform active:scale-[0.98]"
            >
              {isCreatingPost ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingPost ? 'Save' : 'Post')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderNotifications = () => {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-white dark:bg-[#18191A]">
        <div className="max-w-2xl mx-auto space-y-8 pb-24">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-[#1877F2] dark:text-accent" />
                </button>
                <h1 className="text-4xl font-black italic tracking-tighter text-accent uppercase">Notifications</h1>
              </div>
              <p className="text-text-dim text-[8px] uppercase tracking-[4px] ml-12">আপনার সকল নতুন আপডেট</p>
            </div>
            {unreadNotificationsCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => notifications.forEach(n => !n.isRead && markNotificationAsRead(n.id))}
                className="text-accent text-[8px] font-black uppercase tracking-widest"
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {notifications.map(n => (
              <motion.div 
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group ${!n.isRead ? 'bg-accent/5 border-accent/30 shadow-[0_0_20px_rgba(0,209,255,0.05)]' : 'bg-surface/30 border-border-custom hover:border-accent/40'}`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-accent text-bg-dark' : 'bg-surface-light text-text-dim group-hover:text-accent'}`}>
                    {n.type === 'like' && <Heart className="w-6 h-6" />}
                    {n.type === 'comment' && <MessageCircle className="w-6 h-6" />}
                    {n.type === 'follow' && <UserPlus className="w-6 h-6" />}
                    {n.type === 'system' && <Info className="w-6 h-6" />}
                    {n.type === 'link' && <LinkIcon className="w-6 h-6" />}
                    {n.type === 'event' && <Star className="w-6 h-6" />}
                    {n.type === 'message' && <MessageSquare className="w-6 h-6" />}
                    {n.type === 'pair_request' && <Users className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-base font-black uppercase tracking-tighter ${!n.isRead ? 'text-accent' : 'text-white'}`}>{n.title}</h4>
                      <span className="text-[8px] text-text-dim font-bold uppercase">
                        {n.timestamp ? (typeof n.timestamp.toDate === 'function' ? n.timestamp.toDate().toLocaleTimeString() : 'Just now') : '...'}
                      </span>
                    </div>
                    <p className="text-xs text-text-dim leading-relaxed font-medium">{n.message}</p>
                    {n.link && (
                      <a 
                        href={n.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full text-accent text-[8px] font-black uppercase tracking-widest hover:bg-accent hover:text-bg-dark transition-all"
                      >
                        View More <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent animate-ping self-center" />
                  )}
                </div>
              </motion.div>
            ))}

            {notifications.length === 0 && (
              <div className="p-32 text-center border-2 border-dashed border-border-custom rounded-[40px] opacity-20">
                <Bell className="w-20 h-20 mx-auto mb-6" />
                <p className="text-sm uppercase font-black tracking-[10px]">কোনো নটিফিকেশন নেই</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLoginRequiredCard = (title: string, description: string) => (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[70vh]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="max-w-md w-full bg-surface border-border-custom text-text-main shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-accent/30" />
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-accent/10 rounded-full flex items-center justify-center border border-accent/20">
               <UserCircle className="w-10 h-10 text-accent animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-accent uppercase tracking-tighter">{title}</CardTitle>
              <CardDescription className="text-text-dim text-xs mt-2 font-bold uppercase tracking-widest leading-relaxed">
                {description}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <Button onClick={() => setShowAuthModal(true)} className="w-full bg-accent text-bg-dark font-black h-12 uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform">লগইন / একাউন্ট খুলুন</Button>
            <Button variant="ghost" onClick={() => setActiveTab('home')} className="w-full text-text-dim text-[10px] uppercase font-bold hover:text-white transition-colors">হোমে ফিরে যান</Button>
          </CardContent>
          <CardFooter className="justify-center border-t border-border-custom/30 py-4 opacity-30">
            <div className="text-[8px] font-black uppercase tracking-[4px]">PORSHI PROTECTED</div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );

  const renderContent = () => {
    // Maintenance Mode Check
    if (appConfig?.maintenanceMode && user?.role !== 'admin') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 text-center h-[80vh]">
          <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
            <Activity className="w-12 h-12 text-accent" />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-accent uppercase">Under Maintenance</h1>
          <p className="text-text-dim text-sm max-w-sm">
            সিস্টেম আপডেটের কাজ চলছে। পড়শি শীঘ্রই আরও উন্নত ফিচারের সাথে ফিরে আসছে। পাশে থাকার জন্য ধন্যবাদ।
          </p>
          <div className="text-[10px] text-accent font-bold uppercase tracking-[4px]">Porshi Team</div>
        </div>
      );
    }

    const currentTab = activeTab || 'home';

    if (currentApp === 'porsh') {
      if (!user) return renderLoginRequiredCard('MESSENGER', 'মেসেজ আদান প্রদান করতে দয়া করে লগইন করুন।');
      return renderMessenger();
    }

    switch (currentTab) {
      case 'scan':
        return (
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-dark">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radar className="w-6 h-6 text-accent animate-pulse" />
                <h2 className="text-xl font-black italic tracking-tighter text-accent uppercase">Nearby Scan</h2>
              </div>
              <p className="text-[8px] text-text-dim font-bold uppercase tracking-widest">Live Discovery</p>
            </div>
            <NearbyDiscovery 
              currentUser={user!} 
              nearbyUsers={nearbyUsers}
              onPairRequest={sendPairRequest}
              onChat={(u) => {
                setActiveChat({ id: [user!.uid, u.uid].sort().join('_'), partnerId: u.uid, partnerName: u.displayName });
                setActiveTab('chat');
              }}
              onViewProfile={navigateToProfile}
            />
          </div>
        );
      case 'home':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex-1 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-[#18191A]' : 'bg-[#F0F2F5]'}`}
            onScroll={(e) => {
              const target = e.currentTarget;
              if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100) {
                loadMorePosts();
              }
            }}
          >
            {/* Create Post Section (Facebook Style) */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-surface">
                  {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-text-dim" />}
                </div>
                <button 
                  onClick={() => withAuth(() => {
                    setEditingPost(null);
                    setPostInput('');
                    setPostPrivacy('public');
                    setIsPostCreationModalOpen(true);
                  })}
                  className={`flex-1 h-10 rounded-full px-4 text-left text-sm ${theme === 'dark' ? 'bg-[#3A3B3C] text-gray-300' : 'bg-[#F0F2F5] text-gray-600'}`}
                >
                  {user ? `What's on your mind, ${user.displayName.split(' ')[0]}?` : "What's on your mind?"}
                </button>
                <button onClick={() => withAuth(selectPostImage)} className="p-2 transition-transform active:scale-90">
                  <ImageIcon className="w-6 h-6 text-green-500" />
                </button>
              </div>
            </div>

            {/* Stories Section (Facebook Style Cards) */}
            <div className={`py-4 px-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth mb-2 ${theme === 'dark' ? 'bg-[#242526]' : 'bg-white'}`}>
              {/* Create Blocks */}
              <div className="flex flex-col gap-2 flex-shrink-0 w-[100px]">
                 <motion.button 
                   whileTap={{ scale: 0.95 }}
                   onClick={() => withAuth(createStory)}
                   className="relative w-full h-[90px] rounded-xl overflow-hidden group bg-[#1877F2]/10"
                 >
                    <div className="absolute inset-x-0 top-0 h-2/3 overflow-hidden">
                       {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full bg-gray-200" />}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1/3 flex flex-col items-center justify-center p-1 bg-white dark:bg-[#242526]">
                       <div className="absolute -top-3 p-1 bg-[#1877F2] rounded-full border-2 border-white dark:border-[#242526]">
                          <Plus className="w-4 h-4 text-white" />
                       </div>
                       <span className="text-[10px] font-bold mt-2">Create story</span>
                    </div>
                 </motion.button>

                 <motion.button 
                   whileTap={{ scale: 0.95 }}
                   onClick={() => withAuth(() => {})}
                   className="relative w-full h-[90px] rounded-xl overflow-hidden group bg-gradient-to-tr from-pink-500 to-orange-500 flex flex-col items-center justify-center text-white"
                 >
                    <PlayCircle className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Create reel</span>
                 </motion.button>
              </div>

              {/* User Stories */}
              {stories.map(story => (
                <motion.div 
                  key={story.id} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveStory(story)}
                  className="relative flex-shrink-0 w-[100px] h-full rounded-xl overflow-hidden cursor-pointer group"
                >
                  <img 
                    src={story.imageUrl} 
                    alt={story.authorName} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-[#1877F2] overflow-hidden">
                    <img src={story.authorPhoto} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-[10px] font-bold leading-tight truncate">{story.authorName}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feed Section */}
            <div className="space-y-2">
              {posts.filter(p => homeFeedTab === 'all' || (user && followingUids.includes(p.authorUid)) || p.authorUid === user?.uid).map((post) => (
                <PostCard 
                  key={post.id}
                  post={post}
                  ads={ads}
                  theme={theme}
                  onLike={() => withAuth(() => likePost(post.id))}
                  onReact={(type) => withAuth(() => reactToPost(post.id, type))}
                  onComment={() => withAuth(() => setCommentingPostId(post.id))}
                  onFollow={() => withAuth(() => followUser(post.authorUid))}
                  onUnfollow={() => withAuth(() => unfollowUser(post.authorUid))}
                  onShare={() => withAuth(() => setErrorMessage('Sharing feature coming soon!'))}
                  onEdit={(p) => { 
                    setEditingPost(p); 
                    setPostInput(p.content); 
                    setPostPrivacy(p.privacy || 'public');
                    setIsPostCreationModalOpen(true); 
                  }}
                  onDelete={deletePost}
                  onUserClick={navigateToProfile}
                  isFollowing={user ? followingUids.includes(post.authorUid) : false}
                  currentUserId={user?.uid}
                />
              ))}

              {isLoadingMore && (
                <div className="flex justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                </div>
              )}

              {posts.filter(p => homeFeedTab === 'all' || (user && followingUids.includes(p.authorUid)) || p.authorUid === user?.uid).length === 0 && !isLoadingMore && (
                <div className="p-10 text-center opacity-30">
                  <Globe className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs uppercase font-bold tracking-widest">
                    {homeFeedTab === 'following' ? 'আপনার ফলো করা কারো পোস্ট নেই' : 'নিউজ ফিড খালি'}
                  </p>
                </div>
              )}

              {hasMorePosts && !isLoadingMore && posts.length >= postsLimit && (
                <div className="flex justify-center p-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadMorePosts}
                    className="text-[8px] uppercase font-bold tracking-[4px] opacity-40 hover:opacity-100"
                  >
                    আরো দেখুন
                  </Button>
                </div>
              )}

              {!hasMorePosts && posts.filter(p => homeFeedTab === 'all' || (user && followingUids.includes(p.authorUid)) || p.authorUid === user?.uid).length > 0 && (
                <div className="p-10 text-center opacity-20 text-[10px] uppercase font-bold tracking-[8px]">
                  END OF FEED
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'admin':
        if (user?.role !== 'admin') {
           setActiveTab('home');
           return null;
        }
        return (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-12 pb-24">
              <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => setActiveTab('home')} className="rounded-full">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <div className="space-y-4">
                  <h1 className="text-5xl font-black italic tracking-tighter text-accent uppercase">Admin Dashboard</h1>
                  <p className="text-text-dim text-xs uppercase tracking-[4px]">পড়শি অ্যাপ কন্ট্রোল সেন্টার</p>
                </div>
              </div>

              {/* System Overview Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top duration-700">
                <div className="geometric-card p-6 bg-accent/5 border-accent/20 flex flex-col justify-between h-32">
                  <Users className="w-5 h-5 text-accent" />
                  <div>
                    <div className="text-2xl font-black">{allUsers.length}</div>
                    <div className="text-[8px] uppercase font-bold text-text-dim tracking-widest">মোট ইউজার</div>
                  </div>
                </div>
                <div className="geometric-card p-6 bg-green-500/5 border-green-500/20 flex flex-col justify-between h-32">
                  <Activity className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-black">{onlineUsers.length}</div>
                    <div className="text-[8px] uppercase font-bold text-text-dim tracking-widest">অনলাইন ইউজার</div>
                  </div>
                </div>
                <div className="geometric-card p-6 bg-yellow-500/5 border-yellow-500/20 flex flex-col justify-between h-32">
                  <Megaphone className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-black">{allAds.filter(a => a.status === 'pending').length}</div>
                    <div className="text-[8px] uppercase font-bold text-text-dim tracking-widest">পেন্ডিং বিজ্ঞাপন</div>
                  </div>
                </div>
                <div className="geometric-card p-6 bg-purple-500/5 border-purple-500/20 flex flex-col justify-between h-32">
                  <LayoutDashboard className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-2xl font-black">{appConfig?.maintenanceMode ? 'ON' : 'OFF'}</div>
                    <div className="text-[8px] uppercase font-bold text-text-dim tracking-widest">মেইনটেন্যান্স মোড</div>
                  </div>
                </div>
              </div>

              {/* Ads Management & Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="geometric-card p-8 space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <Megaphone className="w-4 h-4" /> গেটওয়ে ও পেমেন্ট সেটিংস
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-bg-dark/50 rounded-xl border border-border-custom">
                      <div>
                        <div className="text-sm font-bold uppercase">Paid Ad Mode</div>
                        <div className="text-[8px] text-text-dim uppercase">বিজ্ঞাপন লাইভ করতে পেমেন্ট বাধ্যতামূলক করা</div>
                      </div>
                      <button 
                        id="paid-mode-toggle"
                        onClick={handleTogglePaidMode}
                        className={`w-14 h-8 rounded-full transition-all relative cursor-pointer z-10 ${appConfig?.adPaidMode ? 'bg-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.5)]' : 'bg-surface-light border border-border-custom'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${appConfig?.adPaidMode ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">Payment Bkash/Nagad Number</label>
                      <Input 
                        id="payment-number-input"
                        defaultValue={appConfig?.adPaymentNumber} 
                        onBlur={(e) => handleUpdateAdNumber(e.target.value)}
                        className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="geometric-card p-8 space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <Target className="w-4 h-4" /> বিজ্ঞাপন ম্যানেজমেন্ট
                  </h2>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-4 bg-bg-dark rounded-xl border border-border-custom">
                      <div className="text-[8px] text-text-dim uppercase font-bold">সচল বিজ্ঞাপন</div>
                      <div className="text-xl font-black text-green-500">{allAds.filter(a => a.status === 'active').length}</div>
                    </div>
                    <div className="p-4 bg-bg-dark rounded-xl border border-border-custom">
                      <div className="text-[8px] text-text-dim uppercase font-bold">মোট বাজেট</div>
                      <div className="text-xl font-black text-accent">৳{allAds.reduce((acc, a) => acc + (a.budget || 0), 0)}</div>
                    </div>
                  </div>
                  <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="bg-bg-dark border border-border-custom w-full">
                      <TabsTrigger value="pending" className="flex-1 uppercase text-[8px] font-black tracking-widest">পেন্ডিং</TabsTrigger>
                      <TabsTrigger value="active" className="flex-1 uppercase text-[8px] font-black tracking-widest">সচল</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {allAds.filter(ad => ad.status === 'pending').map(ad => (
                        <div key={ad.id} className="p-4 bg-bg-dark/50 rounded-xl border border-border-custom space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-xs font-bold uppercase text-white">{ad.title}</div>
                              <div className="text-[8px] text-text-dim uppercase">Advertiser: {ad.advertiserName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-accent">৳{ad.budget}</div>
                              <div className="text-[8px] text-text-dim uppercase">{ad.durationDays} Days</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => updateDoc(doc(db, 'ads', ad.id), { status: 'active', paymentStatus: 'paid' })}
                              className="flex-1 bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20 text-[8px] font-black uppercase tracking-widest"
                            >
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => deleteDoc(doc(db, 'ads', ad.id))}
                              className="flex-1 bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20 text-[8px] font-black uppercase tracking-widest"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                      {allAds.filter(ad => ad.status === 'pending').length === 0 && (
                        <div className="text-center py-10 opacity-20 uppercase tracking-widest text-[8px]">কোনো পেন্ডিং বিজ্ঞাপন নেই</div>
                      )}
                    </TabsContent>
                    <TabsContent value="active" className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {allAds.filter(ad => ad.status === 'active').map(ad => (
                        <div key={ad.id} className="p-4 bg-bg-dark/50 rounded-xl border border-border-custom flex justify-between items-center">
                          <div>
                            <div className="text-xs font-bold uppercase text-white">{ad.title}</div>
                            <div className="text-[8px] text-text-dim uppercase">Clicks: {ad.clicks || 0} | Reach: {ad.reach || 0}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => updateDoc(doc(db, 'ads', ad.id), { status: 'paused' })}
                            className="text-yellow-500 hover:bg-yellow-500/10 text-[8px] font-black uppercase"
                          >
                            Pause
                          </Button>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* App Configuration Settings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="geometric-card p-8 space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> অ্যাপ সেটিংস
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-bg-dark/50 rounded-xl border border-border-custom">
                      <div>
                        <div className="text-sm font-bold uppercase">Maintenance Mode</div>
                        <div className="text-[8px] text-text-dim uppercase">ইউজারদের জন্য অ্যাপ বন্ধ রাখা</div>
                      </div>
                      <button 
                        id="maintenance-mode-toggle"
                        onClick={handleToggleMaintenance}
                        className={`w-14 h-8 rounded-full transition-all relative cursor-pointer z-10 ${appConfig?.maintenanceMode ? 'bg-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.5)]' : 'bg-surface-light border border-border-custom'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${appConfig?.maintenanceMode ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">Welcome Message</label>
                      <Input 
                        defaultValue={appConfig?.welcomeMessage || ''} 
                        onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { welcomeMessage: e.target.value })}
                        className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">Announcement</label>
                      <textarea 
                        defaultValue={appConfig?.announcement || ''} 
                        onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { announcement: e.target.value })}
                        className="w-full bg-bg-dark/50 border border-border-custom rounded-xl p-4 text-xs h-32 focus:border-accent transition-colors outline-none text-white font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase text-text-dim ml-1">App Version</label>
                        <Input 
                          defaultValue={appConfig?.appVersion || '1.0.0'} 
                          onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { appVersion: e.target.value })}
                          className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase text-text-dim ml-1">Contact Email</label>
                        <Input 
                          defaultValue={appConfig?.contactEmail || ''} 
                          onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { contactEmail: e.target.value })}
                          className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase text-text-dim ml-1">Min. Required Version</label>
                        <Input 
                          defaultValue={appConfig?.minVersion || '1.0.0'} 
                          onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { minVersion: e.target.value })}
                          className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase text-text-dim ml-1">Support Phone</label>
                        <Input 
                          defaultValue={appConfig?.themeColor || ''} // Reusing themeColor field for phone as proxy correctly
                          placeholder="e.g. 016500..."
                          onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { themeColor: e.target.value })}
                          className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="geometric-card p-8 space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> মিডিয়া স্টোরেজ (Ultimate Mode)
                  </h2>
                  <div className="space-y-4">
                    <p className="text-[10px] text-text-dim uppercase leading-relaxed">
                      ফায়ারবেস বিলিং ছাড়াই আনলিমিটেড বড় ভিডিও এবং ছবি আপলোড করতে ক্লাউডিনারি (Cloudinary) ব্যবহার করুন।
                    </p>
                    <div className="space-y-2">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim">Cloudinary Cloud Name</Label>
                      <Input 
                        placeholder="e.g. porshi-media" 
                        defaultValue={appConfig?.cloudinaryCloudName || ''}
                        onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { cloudinaryCloudName: e.target.value })}
                        className="bg-bg-dark/50 border-border-custom text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim">Unsigned Upload Preset (Default: ml_default)</Label>
                      <Input 
                        placeholder="e.g. ml_default" 
                        defaultValue={appConfig?.cloudinaryUploadPreset || ''}
                        onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { cloudinaryUploadPreset: e.target.value })}
                        className="bg-bg-dark/50 border-border-custom text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="geometric-card p-8 space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                    <Users className="w-4 h-4" /> ইউজার ম্যানেজমেন্ট
                  </h2>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {allUsers.map((u: any) => (
                      <div key={u.id} className="p-4 bg-bg-dark/50 rounded-xl border border-border-custom flex items-center justify-between hover:border-accent/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-light border border-border-custom overflow-hidden">
                            {u.photoURL && <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase">{u.displayName}</div>
                            <div className={`text-[8px] uppercase ${u.role === 'admin' ? 'text-accent' : 'text-text-dim'}`}>{u.role || 'user'}</div>
                          </div>
                        </div>
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' && (
                              <button 
                                id={`monetization-toggle-${u.uid}`}
                                onClick={() => handleUpdateUserMonetization(u)}
                                className={`p-2 rounded-lg transition-all cursor-pointer ${u.isMonetized ? 'bg-[#00D1FF] text-bg-dark shadow-[0_0_10px_rgba(0,209,255,0.3)]' : 'bg-surface-light text-text-dim hover:text-accent'}`}
                                title="Toggle Monetization"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}
                            {u.role !== 'admin' && (
                            <button 
                              onClick={async () => {
                                if (window.confirm(`${u.displayName} কে অ্যাডমিন করতে চান?`)) {
                                  await updateDoc(doc(db, 'users', u.uid), { role: 'admin' });
                                }
                              }}
                              className="p-2 hover:bg-accent/10 text-accent rounded-lg transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={async () => {
                              if (window.confirm(`${u.displayName} কে ডিলিট করতে চান?`)) {
                                await deleteDoc(doc(db, 'users', u.uid));
                              }
                            }}
                            className="p-2 hover:bg-red-400/10 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="geometric-card p-8 space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                  <Bell className="w-4 h-4" /> সিস্টেম নটিফিকেশন ম্যানেজার
                </h2>
                <div className="space-y-4">
                  <div className="flex bg-bg-dark/50 p-1 rounded-xl border border-border-custom">
                    <button 
                      onClick={() => setIsAdminNoticeAll(false)}
                      className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${!isAdminNoticeAll ? 'bg-accent text-bg-dark' : 'text-text-dim'}`}
                    >
                      সিঙ্গেল ইউজার
                    </button>
                    <button 
                      onClick={() => setIsAdminNoticeAll(true)}
                      className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${isAdminNoticeAll ? 'bg-accent text-bg-dark shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'text-text-dim'}`}
                    >
                      সকল ইউজার
                    </button>
                  </div>

                    {!isAdminNoticeAll && (
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">ইউজার সিলেক্ট করুন</label>
                      <select 
                        value={adminNoticeTargetUid}
                        onChange={(e) => setAdminNoticeTargetUid(e.target.value)}
                        className="w-full h-12 bg-bg-dark/50 border border-border-custom rounded-xl px-4 text-xs text-white focus:border-accent outline-none"
                      >
                        <option value="">সিলেক্ট ইউজার</option>
                        {allUsers.map(u => (
                          <option key={u.uid || u.id} value={u.uid || u.id}>{u.displayName} ({u.role || 'user'})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">নটিফিকেশন টাইপ</label>
                      <select 
                        value={adminNoticeType}
                        onChange={(e) => setAdminNoticeType(e.target.value as any)}
                        className="w-full h-12 bg-bg-dark/50 border border-border-custom rounded-xl px-4 text-xs text-white focus:border-accent outline-none"
                      >
                        <option value="system">সিস্টেম বার্তা</option>
                        <option value="link">লিংক/ইউআরএল</option>
                        <option value="event">ইভেন্ট/অফার</option>
                        <option value="message">ব্যক্তিগত মেসেজ</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">টাইটেল (Title)</label>
                      <Input 
                        value={adminNoticeTitle}
                        onChange={(e) => setAdminNoticeTitle(e.target.value)}
                        placeholder="যেমন: নতুন আপডেট"
                        className="bg-bg-dark/50 border-border-custom text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] uppercase text-text-dim ml-1">মেসেজ (Message)</label>
                    <textarea 
                      value={adminNoticeMessage}
                      onChange={(e) => setAdminNoticeMessage(e.target.value)}
                      placeholder="আপনার বার্তাটি এখানে লিখুন..."
                      className="w-full bg-bg-dark/50 border border-border-custom rounded-xl p-4 text-xs h-24 focus:border-accent transition-colors outline-none text-white font-sans"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] uppercase text-text-dim ml-1">লিংক (ঐচ্ছিক)</label>
                    <Input 
                      value={adminNoticeLink}
                      onChange={(e) => setAdminNoticeLink(e.target.value)}
                      placeholder="https://example.com"
                      className="bg-bg-dark/50 border-border-custom text-white"
                    />
                  </div>

                  <Button 
                    onClick={handleSendAdminNotice}
                    disabled={isSendingNotice}
                    className="w-full bg-accent text-bg-dark font-black uppercase tracking-widest py-6 rounded-2xl shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:shadow-[0_0_30px_rgba(0,209,255,0.5)] transition-all"
                  >
                    {isSendingNotice ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                    নটিফিকেশন পাঠান
                  </Button>
                </div>
              </div>

              <div className="geometric-card p-8 space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                  <Activity className="w-4 h-4" /> অ্যাপ স্ট্যাটিস্টিকস
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 bg-bg-dark/50 rounded-2xl border border-border-custom text-center">
                    <div className="text-3xl font-black text-accent">{allUsers.length}</div>
                    <div className="text-[8px] text-text-dim uppercase tracking-widest mt-1">Total Users</div>
                  </div>
                  <div className="p-6 bg-bg-dark/50 rounded-2xl border border-border-custom text-center">
                    <div className="text-3xl font-black text-accent">{posts.length}</div>
                    <div className="text-[8px] text-text-dim uppercase tracking-widest mt-1">Total Posts</div>
                  </div>
                  <div className="p-6 bg-bg-dark/50 rounded-2xl border border-border-custom text-center">
                    <div className="text-3xl font-black text-accent">{onlineUsers.length}</div>
                    <div className="text-[8px] text-text-dim uppercase tracking-widest mt-1">Live Online</div>
                  </div>
                  <div className="p-6 bg-bg-dark/50 rounded-2xl border border-border-custom text-center">
                    <div className="text-3xl font-black text-accent">{allUsers.filter(u => u.role === 'admin').length}</div>
                    <div className="text-[8px] text-text-dim uppercase tracking-widest mt-1">Admins</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        if (!user) return renderLoginRequiredCard('NOTIFICATIONS', 'নটিফিকেশন দেখতে দয়া করে লগইন করুন।');
        return renderNotifications();
      case 'video':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex-1 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-[#18191A]' : 'bg-[#F0F2F5]'}`}
          >
            <div className="p-4">
               <div className="flex items-center gap-3 mb-4">
                 <button onClick={() => setActiveTab('home')} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                   <ArrowLeft className="w-6 h-6" />
                 </button>
                 <h2 className="text-xl font-bold">Video</h2>
               </div>
               <div className="space-y-4">
                  {posts.filter(p => p.mediaType === 'video').length > 0 ? (
                    posts.filter(p => p.mediaType === 'video').map((post) => (
                      <PostCard 
                        key={post.id}
                        post={post}
                        ads={ads}
                        theme={theme}
                        onLike={() => withAuth(() => likePost(post.id))}
                        onReact={(type) => withAuth(() => reactToPost(post.id, type))}
                        onComment={() => withAuth(() => setCommentingPostId(post.id))}
                        onFollow={() => withAuth(() => followUser(post.authorUid))}
                        onUnfollow={() => withAuth(() => unfollowUser(post.authorUid))}
                        isFollowing={followingUids.includes(post.authorUid)}
                        currentUserId={user?.uid}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                       <PlayCircle className="w-16 h-16 mb-4" />
                       <p className="font-bold uppercase tracking-widest text-sm">No videos found</p>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        );
      case 'scan':
        return (
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${theme === 'dark' ? 'bg-[#18191A]' : 'bg-[#F0F2F5]'}`}>
            {/* Marketplace Search Header */}
            <div className={`p-4 border-b ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E4E4]'}`}>
               <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActiveTab('home')} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                      <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold">Marketplace</h2>
                  </div>
                  <div className="flex gap-2">
                     <button className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-gray-100'}`}><UserIcon className="w-5 h-5" /></button>
                     <button className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-gray-100'}`}><Search className="w-5 h-5" /></button>
                  </div>
               </div>
               <div className={`flex items-center gap-3 h-10 px-4 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}>
                  <Search className="w-4 h-4 text-gray-500" />
                  <input 
                    placeholder="Search Marketplace" 
                    className="bg-transparent border-none outline-none text-sm w-full"
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                  />
               </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <div className="flex flex-col items-center justify-center relative">
                  <div className={`w-[280px] h-[280px] md:w-[400px] md:h-[400px] border-4 border-dashed rounded-full flex items-center justify-center ${theme === 'dark' ? 'border-[#3E4042]' : 'border-gray-300'}`}>
                    <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-accent/20 flex items-center justify-center relative">
                      {isScanning && (
                        <>
                          <motion.div className="absolute inset-0 border border-accent rounded-full" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                          <motion.div className="absolute inset-0 border border-accent rounded-full" animate={{ scale: [1, 1.8], opacity: [0.3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                        </>
                      )}
                      <motion.div 
                        whileTap={{ scale: 0.95 }}
                        className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] bg-[#1877F2] rounded-full flex flex-col justify-center items-center shadow-[0_0_50px_rgba(24,119,242,0.4)] z-10 text-white cursor-pointer"
                        animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        onClick={() => withAuth(() => setIsScanning(!isScanning))}
                      >
                        <span className="font-bold text-xs md:text-sm tracking-widest uppercase">{isScanning ? 'SCANNING' : 'START SCAN'}</span>
                        <div className="text-2xl md:text-3xl mt-1">📶</div>
                      </motion.div>
                    </div>
                  </div>
                  <div className="mt-10 w-full space-y-4">
                    <h3 className={`text-[10px] uppercase tracking-widest font-bold text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Nearby Discoveries ({onlineUsers.filter(u => u.displayName.toLowerCase().includes(marketSearch.toLowerCase())).length})
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {onlineUsers
                        .filter(u => u.displayName.toLowerCase().includes(marketSearch.toLowerCase()))
                        .length > 0 ? (
                        onlineUsers
                          .filter(u => u.displayName.toLowerCase().includes(marketSearch.toLowerCase()))
                          .map((u) => (
                            <motion.div 
                              key={u.uid} 
                              initial={{ opacity: 0, x: -20 }} 
                              animate={{ opacity: 1, x: 0 }} 
                              className={`flex items-center gap-4 p-3 rounded-2xl border transition-all hover:border-[#1877F2] group ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-gray-100 shadow-sm'}`} 
                              onClick={() => withAuth(() => sendPairRequest(u))}
                            >
                              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                                {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" /> : <UserIcon className="w-5 h-5 text-gray-400" />}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-bold">{u.displayName}</div>
                                <div className="text-[10px] text-[#1877F2] font-bold uppercase">Tap to Pair</div>
                              </div>
                              <UserPlus className="w-5 h-5 text-gray-400 group-hover:text-[#1877F2]" />
                            </motion.div>
                          ))
                      ) : (
                        <div className="text-center py-10 opacity-30 uppercase tracking-widest text-[10px] font-bold">No one discovered nearby</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'groups':
        return (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-4 opacity-50 relative">
            <button onClick={() => setActiveTab('home')} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <Users className="w-16 h-16 text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-widest">Groups coming soon</h2>
            <p className="text-xs text-text-dim text-center max-w-xs">We are building a powerful group system for community interactions.</p>
          </div>
        );
      case 'pages':
        return (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-4 opacity-50 relative">
            <button onClick={() => setActiveTab('home')} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <LayoutDashboard className="w-16 h-16 text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-widest">Pages coming soon</h2>
            <p className="text-xs text-text-dim text-center max-w-xs">Create and manage your professional pages on PORSHI.</p>
          </div>
        );
      case 'events':
        return (
          <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center space-y-4 opacity-50 relative">
            <button onClick={() => setActiveTab('home')} className="absolute top-4 left-4 p-2 rounded-full hover:bg-black/5 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <Calendar className="w-16 h-16 text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-widest">Events coming soon</h2>
            <p className="text-xs text-text-dim text-center max-w-xs">Stay tuned for local and global events happening near you.</p>
          </div>
        );
      case 'monetization':
        if (!user) return renderLoginRequiredCard('MONETIZATION', 'মনিটাইজেশন পারফরম্যান্স দেখতে দয়া করে লগইন করুন।');
        if (!user?.isMonetized) {
          return (
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col items-center">
              <div className="w-full max-w-md flex justify-start mb-4">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 font-bold text-sm">
                  <ArrowLeft className="w-5 h-5" /> Home
                </button>
              </div>
              <div className="max-w-md w-full geometric-card p-10 text-center space-y-6">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto border border-accent/20">
                  <DollarSign className="w-10 h-10 text-accent animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tighter uppercase">মনিটাইজেশন এলিজিবিলিটি</h2>
                  <p className="text-text-dim text-xs uppercase tracking-widest leading-relaxed">
                    আপনার প্রোফাইল এখনো মনিটাইজেশনের জন্য উপযুক্ত নয়। মনিটাইজেশন পেতে দয়া করে আরও বেশি কোয়ালিটি কন্টেন্ট শেয়ার করুন এবং ফলোয়ার বাড়ান।
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 py-6 border-y border-border-custom/30 text-left">
                  <div className="space-y-1">
                    <div className="text-[8px] uppercase font-black text-text-dim">ফলোয়ার রিকোয়ারমেন্ট</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold">{user?.followersCount || 0}/১০০০</div>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${Math.min(((user?.followersCount || 0) / 1000) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[8px] uppercase font-black text-text-dim">এনগেজমেন্ট রিকোয়ারমেন্ট</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold">৭৮%</div>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent w-[78%]" />
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-accent font-bold uppercase tracking-[2px]">অ্যাডমিন আপনার প্রোফাইল রিভিউ করার পর মনিটাইজেশন অন করে দিতে পারবেন।</p>
                <Button className="geometric-btn w-full" disabled>আবেদন করুন (Coming Soon)</Button>
              </div>
            </div>
          );
        }
        return (
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-white dark:bg-[#18191A]">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setActiveTab('home')} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 font-bold text-sm text-[#1877F2] dark:text-accent">
                  <ArrowLeft className="w-5 h-5" /> পরশি হোম
                </button>
              </div>
              <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-surface/30 border-border-custom' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase">মনিটাইজেশন ড্যাশবোর্ড</h2>
                    <p className="text-text-dim text-xs uppercase tracking-widest">আপনার কন্টেন্ট পারফরম্যান্স</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-accent/10">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-bg-dark/50 border-border-custom' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-green-500/10"><DollarSign className="w-4 h-4 text-green-500" /></div>
                      <span className="text-[10px] uppercase font-bold text-text-dim">মোট আয়</span>
                    </div>
                    <div className="text-3xl font-black tracking-tighter">${monetizationData?.totalEarnings.toFixed(2)}</div>
                    <div className="text-[10px] text-green-500 mt-1 font-bold">+১২% গত মাস থেকে</div>
                  </div>
                  <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-bg-dark/50 border-border-custom' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10"><Activity className="w-4 h-4 text-blue-500" /></div>
                      <span className="text-[10px] uppercase font-bold text-text-dim">রিচ (Reach)</span>
                    </div>
                    <div className="text-3xl font-black tracking-tighter">{monetizationData?.reach.toLocaleString()}</div>
                    <div className="text-[10px] text-blue-500 mt-1 font-bold">+৫.৪% গত সপ্তাহ</div>
                  </div>
                  <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-bg-dark/50 border-border-custom' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/10"><Users className="w-4 h-4 text-purple-500" /></div>
                      <span className="text-[10px] uppercase font-bold text-text-dim">ফলোয়ার</span>
                    </div>
                    <div className="text-3xl font-black tracking-tighter">{monetizationData?.followers.toLocaleString()}</div>
                    <div className="text-[10px] text-purple-500 mt-1 font-bold">+৮৬ নতুন আজ</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-surface/30 border-border-custom' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-sm font-bold uppercase mb-6 flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-accent" />
                    আয়ের পরিসংখ্যান
                  </h3>
                  <div className="h-48 flex items-end gap-2 px-2">
                    {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        className="flex-1 bg-accent/20 rounded-t-lg relative group"
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-accent text-bg-dark text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          ${(h * 1.5).toFixed(0)}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 px-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i} className="text-[10px] text-text-dim font-bold">{d}</span>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border ${theme === 'dark' ? 'bg-surface/30 border-border-custom' : 'bg-white border-gray-200 shadow-sm'}`}>
                  <h3 className="text-sm font-bold uppercase mb-6">সাম্প্রতিক আপডেট</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'ভিডিও বোনাস', amount: '+$১২.৪০', date: '২ ঘণ্টা আগে' },
                      { label: 'স্টারস (Stars)', amount: '+$৫.০০', date: '৫ ঘণ্টা আগে' },
                      { label: 'অ্যাড রেভিনিউ', amount: '+$২৮.১০', date: 'গতকাল' },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-accent/5">
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[8px] text-text-dim uppercase">{item.date}</div>
                        </div>
                        <div className="text-sm font-black text-accent">{item.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'ads':
        if (!user) return renderLoginRequiredCard('ADS MANAGER', 'বিজ্ঞাপন ম্যানেজ করতে দয়া করে লগইন করুন।');
        return renderAdsContent();
      case 'profile':
        const profileUid = selectedUserUid || user?.uid;
        if (!profileUid) return renderLoginRequiredCard('PROFILE', 'আপনার প্রোফাইল দেখতে দয়া করে লগইন করুন।');
        
        // Find user data for the profile we are viewing
        const profileUser = profileUid === user?.uid ? user : viewingProfileUser;

        return (
          <div className="flex-1 p-0 overflow-y-auto custom-scrollbar bg-[#F0F2F5] dark:bg-[#18191A]">
            <div className="max-w-4xl mx-auto space-y-4 pb-20">
              {/* Back Button for sub-navigation */}
              <div className="px-4 pt-4 flex items-center justify-between lg:hidden">
                <button 
                  onClick={() => selectedUserUid ? setSelectedUserUid(null) : setActiveTab('home')}
                  className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 p-2 rounded-xl bg-white dark:bg-[#242526] shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Home
                </button>
              </div>

              {/* Profile Cover & Basic Info */}
              <div className="bg-white dark:bg-[#242526] rounded-b-xl shadow-sm overflow-hidden">
                <div className="h-48 md:h-64 bg-gradient-to-r from-[#00D1FF] to-[#0070FF] relative">
                   {selectedUserUid && (
                     <button 
                       onClick={() => setSelectedUserUid(null)}
                       className="absolute top-4 left-4 p-2 bg-black/20 rounded-full text-white hover:bg-black/40 transition-colors"
                     >
                       <ArrowLeft className="w-5 h-5" />
                     </button>
                   )}
                </div>
                <div className="px-4 pb-4 -mt-12 md:-mt-16 flex flex-col md:flex-row items-center md:items-end gap-4 relative z-10">
                  <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white dark:bg-[#242526] border-4 border-white dark:border-[#242526] overflow-hidden shadow-lg">
                      {isUploadingPhoto && profileUid === user?.uid ? (
                        <div className="w-full h-full flex items-center justify-center bg-bg-dark/50"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
                      ) : profileUser?.photoURL ? (
                        <img src={profileUser.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#3A3B3C]"><UserIcon className="w-16 h-16 text-text-dim" /></div>
                      )}
                    </div>
                    {profileUid === user?.uid && (
                      <button onClick={handleProfilePictureClick} className="absolute bottom-2 right-2 p-2.5 bg-gray-100 dark:bg-[#3A3B3C] rounded-full shadow-md text-foreground hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors">
                        <CameraIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left pb-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">{profileUser?.displayName}</h2>
                    <p className="text-text-dim text-sm font-medium">{profileUser?.bio || 'No bio yet.'}</p>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                      <div className="text-sm"><span className="font-bold">{profileUser?.followersCount || 0}</span> <span className="text-text-dim">Followers</span></div>
                      <div className="text-sm"><span className="font-bold">{profileUser?.followingCount || 0}</span> <span className="text-text-dim">Following</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2 pb-4">
                    {profileUid === user?.uid ? (
                      <Button onClick={() => {}} className="bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground font-bold text-xs h-9 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-[#4E4F50]">
                         <PenLine className="w-4 h-4 mr-2" /> Edit profile
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={() => withAuth(() => followingUids.includes(profileUid) ? unfollowUser(profileUid) : followUser(profileUid))}
                          className={`${followingUids.includes(profileUid) ? 'bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground' : 'bg-[#1877F2] text-white hover:bg-[#166FE5]'} font-bold text-xs h-9 px-6 rounded-md transition-all`}
                        >
                          {followingUids.includes(profileUid) ? 'Unfollow' : 'Follow'}
                        </Button>
                        <Button 
                          onClick={() => withAuth(() => {
                            setActiveChat({
                              id: profileUser?.uid || '',
                              partnerId: profileUser?.uid || '',
                              partnerName: profileUser?.displayName || ''
                            });
                            setCurrentApp('porsh');
                          })}
                          className="bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground font-bold text-xs h-9 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-[#4E4F50]"
                        >
                           <MessageSquare className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="px-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Left Column (Info) */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow-sm space-y-4">
                      <h3 className="text-lg font-bold">Intro</h3>
                      {profileUser?.bio && <div className="text-center text-sm py-2">{profileUser.bio}</div>}
                      <Button className="w-full bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground font-bold text-xs rounded-md shadow-none hover:bg-gray-200 dark:hover:bg-[#4E4F50]">Edit bio</Button>
                      
                      {profileUid === user?.uid && (
                        <div className="pt-4 border-t border-gray-100 dark:border-[#3E4042] space-y-3">
                           <div className="flex items-center gap-3 text-sm text-text-dim"><Globe className="w-5 h-5" /> Profile · Public</div>
                           {user?.role === 'admin' && (
                             <button onClick={() => setActiveTab('admin')} className="w-full p-2.5 rounded-lg bg-accent/10 text-accent font-bold text-xs flex items-center justify-center gap-2">
                               <Activity className="w-4 h-4" /> Admin Panel
                             </button>
                           )}
                           <button onClick={logout} className="w-full p-2.5 rounded-lg bg-red-400/5 text-red-500 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                             <LogOut className="w-4 h-4" /> Logout
                           </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Posts) */}
                  <div className="md:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow-sm flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-surface">
                        {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-text-dim" />}
                      </div>
                      <button 
                        onClick={() => withAuth(() => setIsPostCreationModalOpen(true))}
                        className="flex-1 h-10 rounded-full px-4 text-left text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors"
                      >
                         What's on your mind?
                      </button>
                    </div>

                    <div className="space-y-4">
                      {posts.filter(p => p.authorUid === profileUid).map(post => (
                        <PostCard 
                          key={post.id}
                          post={post}
                          ads={ads}
                          theme={theme}
                          onLike={() => withAuth(() => likePost(post.id))}
                          onReact={(type) => withAuth(() => reactToPost(post.id, type))}
                          onComment={() => withAuth(() => setCommentingPostId(post.id))}
                          onFollow={() => withAuth(() => followUser(post.authorUid))}
                          onUnfollow={() => withAuth(() => unfollowUser(post.authorUid))}
                          onEdit={(p) => { 
                            setEditingPost(p); 
                            setPostInput(p.content); 
                            setPostPrivacy(p.privacy || 'public');
                            setIsPostCreationModalOpen(true); 
                          }}
                          onDelete={deletePost}
                          onUserClick={navigateToProfile}
                          isFollowing={user ? followingUids.includes(post.authorUid) : false}
                          currentUserId={user?.uid}
                        />
                      ))}
                      {posts.filter(p => p.authorUid === profileUid).length === 0 && (
                        <div className="p-20 text-center opacity-20 uppercase font-black tracking-widest text-xs">No posts yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="flex-1 flex items-center justify-center opacity-20 uppercase tracking-[10px]">Coming Soon</div>;
    }
  };

  // App Config and All Users (for Admin) Listener
  useEffect(() => {
    // 1. App Config Listener
    const configUnsubscribe = onSnapshot(doc(db, 'appConfig', 'remote-settings'), (snapshot) => {
      if (snapshot.exists()) {
        setAppConfig(snapshot.data() as AppConfig);
      } else {
        // Initial Default Config
        const defaultConfig: AppConfig = {
          maintenanceMode: false,
          welcomeMessage: 'Welcome to Porshi!',
          appVersion: '1.0.0',
          minVersion: '1.0.0',
          contactEmail: 'support@porshi.app',
          announcement: '',
          themeColor: '#00D1FF',
          cloudinaryCloudName: 'dozmbxvo5',
          cloudinaryUploadPreset: 'porshi_preset',
          adPaidMode: true,
          adPaymentNumber: '01650074073'
        };
        setAppConfig(defaultConfig);
      }
    });

    // 2. Public Content Listeners (No Auth Required)
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(postsLimit));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
        .filter(p => !p.privacy || p.privacy === 'public' || p.authorUid === user?.uid);
      setPosts(postsList);
      setHasMorePosts(snapshot.docs.length >= postsLimit);
      setIsLoadingMore(false);
    });

    const storiesQuery = query(collection(db, 'stories'), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
      const storiesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(storiesList);
    });

    const adsQuery = query(collection(db, 'ads'), where('status', '==', 'active'));
    const unsubscribeAds = onSnapshot(adsQuery, (snapshot) => {
      setAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advertisement)));
    });

    // 3. Selective User Profile Listener
    let userUnsubscribe: () => void = () => {};
    if (selectedUserUid && selectedUserUid !== user?.uid) {
      userUnsubscribe = onSnapshot(doc(db, 'users', selectedUserUid), (doc) => {
        if (doc.exists()) {
          setViewingProfileUser({ uid: doc.id, ...doc.data() } as AppUser);
        }
      });
    }

    return () => {
      configUnsubscribe();
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeAds();
      userUnsubscribe();
    };
  }, [postsLimit, selectedUserUid, user?.uid]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setAllUsers([]);
      return;
    }
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data,
          uid: doc.id,
          id: doc.id 
        } as any;
      }));
    });
    return () => unsubscribe();
  }, [user]);

  // Auth Listener
  useEffect(() => {
    addLog('পড়শি সিস্টেম প্রস্তুত (PORSHI System Ready)');
    let userUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          addLog(`ইউজার পাওয়া গেছে: ${currentUser.uid.slice(0, 6)}...`);
          
          if (userUnsubscribe) userUnsubscribe();

          // Use onSnapshot for the user document to handle offline states and real-time updates
          userUnsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
            if (docSnap.exists()) {
              addLog('পড়শি প্রোফাইল লোড হচ্ছে...');
              const userData = { ...docSnap.data(), uid: docSnap.id } as any;
              
              // Bootstrap admin if email matches
              if (currentUser.email === "salman1000790@gmail.com" && userData.role !== 'admin') {
                await updateDoc(doc(db, 'users', currentUser.uid), { role: 'admin' });
                userData.role = 'admin';
              }
              
              setUser(userData);
              addLog('পড়শি লগইন সফল! (Login Verified)');
            } else {
              addLog('নতুন প্রোফাইল তৈরি করা হচ্ছে...');
              // New User Registration Handling
              const name = registrationData.current?.name || currentUser.displayName || 'Porshi User';
              const phone = registrationData.current?.phone || '';
              
              const newUser: AppUser = {
                uid: currentUser.uid,
                displayName: name,
                phoneNumber: phone,
                photoURL: currentUser.photoURL || '',
                isOnline: true,
                lastSeen: serverTimestamp(),
                role: currentUser.email === "salman1000790@gmail.com" ? 'admin' : 'user'
              };
              
              await setDoc(doc(db, 'users', currentUser.uid), newUser);
              addLog('প্রোফাইল তৈরি সম্পন্ন (Profile Created)');
              setUser(newUser);
            }
            setIsAuthReady(true);
            setIsAuthLoading(false);
          }, (error) => {
            console.error('User doc snapshot error:', error);
            // If snapshot fails, it might be a permissions issue or truly offline
            if (error.message.includes('offline')) {
              addLog('অফলাইন মোডে আছে (Working Offline)');
            } else {
              addLog(`ডাটা এরর: ${error.message}`);
            }
            setIsAuthReady(true);
            setIsAuthLoading(false);
          });
        } else {
          addLog('ইউজার লগআউট অবস্থায় আছে (Logged Out)');
          if (userUnsubscribe) userUnsubscribe();
          setUser(null);
          setIsAuthReady(true);
          setIsAuthLoading(false);
        }
      } catch (error: any) {
        console.error('Auth Listener Error:', error);
        addLog(`ক্রিটিক্যাল এরর: ${error.message}`);
        setErrorMessage(`সিস্টেম এরর: ${error.message}`);
        setIsAuthReady(true);
        setIsAuthLoading(false);
      } finally {
        registrationData.current = null; // Clear after use
      }
    });

    return () => {
      unsubscribe();
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  // Auth Actions
  const login = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setActiveTab('home');
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const followUser = async (targetUid: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'following', targetUid), {
        timestamp: serverTimestamp()
      });
      await setDoc(doc(db, 'users', targetUid, 'followers', user.uid), {
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Follow error:', error);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'following', targetUid));
      await deleteDoc(doc(db, 'users', targetUid, 'followers', user.uid));
    } catch (error: any) {
      console.error('Unfollow error:', error);
    }
  };

  // Following Listener
  useEffect(() => {
    if (!user) {
      setFollowingUids([]);
      return;
    }
    const q = collection(db, 'users', user.uid, 'following');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFollowingUids(snapshot.docs.map(doc => doc.id));
    });
    return () => unsubscribe();
  }, [user]);

  const sendPairRequest = async (targetUser: any) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      setIsScanning(true);
      await addDoc(collection(db, 'requests'), {
        fromUid: user.uid,
        fromName: user.displayName,
        toUid: targetUser.uid,
        toName: targetUser.displayName,
        status: 'pending',
        timestamp: serverTimestamp()
      });
      await sendNotification({
        toUid: targetUser.uid,
        fromUid: user.uid,
        fromName: user.displayName,
        fromPhoto: user.photoURL,
        type: 'pair_request',
        title: 'নতুন পেয়ার রিকোয়েস্ট!',
        message: `${user.displayName} আপনার সাথে পেয়ার হতে রিকোয়েস্ট পাঠিয়েছেন।`
      });
    } catch (error) {
      console.error('Pair request error:', error);
      setErrorMessage('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'requests', requestId), { status });
      if (status === 'accepted') {
        const reqDoc = await getDoc(doc(db, 'requests', requestId));
        if (reqDoc.exists()) {
          const data = reqDoc.data();
          setActiveChat({ id: requestId, partnerId: data.fromUid, partnerName: data.fromName });
          setActiveTab('chat');

          await sendNotification({
            toUid: data.fromUid,
            fromUid: user.uid,
            fromName: user.displayName,
            fromPhoto: user.photoURL,
            type: 'pair_request',
            title: 'রিকোয়েস্ট গ্রহণ করা হয়েছে!',
            message: `${user.displayName} আপনার পেয়ার রিকোয়েস্ট গ্রহণ করেছেন।`
          });
        }
      }
      setIncomingRequest(null);
    } catch (error) {
      console.error('Respond error:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !user) return;
    try {
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        senderUid: user.uid,
        text: messageInput,
        timestamp: serverTimestamp(),
        pairId: activeChat.id,
        isRead: false
      });
      setMessageInput('');
      
      await setDoc(doc(db, 'chats', activeChat.id, 'typing', user.uid), {
        isTyping: false,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleTyping = async (text: string) => {
    setMessageInput(text);
    if (!activeChat || !user) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      await setDoc(doc(db, 'chats', activeChat.id, 'typing', user.uid), {
        isTyping: text.length > 0,
        timestamp: serverTimestamp()
      });

      if (text.length > 0) {
        typingTimeoutRef.current = setTimeout(async () => {
          try {
            await setDoc(doc(db, 'chats', activeChat.id, 'typing', user.uid), {
              isTyping: false,
              timestamp: serverTimestamp()
            });
          } catch (e) {}
        }, 3000);
      }
    } catch (e) {}
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPhone || !authPassword) {
      setErrorMessage('সবগুলো ঘর পূরণ করুন');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    if (authView === 'register' && !authName) {
      setErrorMessage('আপনার নাম লিখুন');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsAuthLoading(true);
    setErrorMessage(null);
    const input = authPhone.trim();
    const email = input.includes('@') ? input : `${input}@porshi.app`;
    const password = authPassword.trim();
    
    if (password.length < 6) {
      addLog('ভুল: পাসওয়ার্ড ছোট (Password too short)');
      setErrorMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      setIsAuthLoading(false);
      return;
    }

    try {
      if (authView === 'register') {
        const name = authName.trim();
        const phone = authPhone.trim();
        
        if (!name) {
          setErrorMessage('আপনার নাম লিখুন');
          setIsAuthLoading(false);
          return;
        }

        addLog(`রেজিস্ট্রেশন শুরু: ${phone}`);
        registrationData.current = { name, phone };
        setAuthProcessingStep('অ্যাকাউন্ট তৈরি হচ্ছে...');

        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
          addLog('সার্ভার রেসপন্স: সফল (Success)');
          setAuthSuccessMessage('রেজিস্ট্রেশন সফল!');
          setShowAuthModal(false);
        }
      } else {
        addLog(`লগইন চেষ্টা: ${authPhone.trim()}`);
        setAuthProcessingStep('লগইন করা হচ্ছে...');
        await signInWithEmailAndPassword(auth, email, password);
        addLog('সার্ভার রেসপন্স: ভেরিফাইড (Login Success)');
        setAuthSuccessMessage('লগইন সফল!');
        setShowAuthModal(false);
      }
    } catch (error: any) {
      setIsAuthLoading(false);
      registrationData.current = null;
      console.error('Email Auth Error:', error);
      addLog(`এরর (Auth): ${error.code}`);
      
      let msg = 'সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      if (error.code === 'auth/email-already-in-use') msg = 'এই নাম্বার দিয়ে অলরেডি অ্যাকাউন্ট আছে।';
      if (error.code === 'auth/invalid-email') msg = 'সঠিক ফোন নাম্বার দিন।';
      if (error.code === 'auth/wrong-password') msg = 'ভুল পাসওয়ার্ড।';
      if (error.code === 'auth/user-not-found') msg = 'অ্যাকাউন্ট পাওয়া যায়নি।';
      
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderAuthModal = () => (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] bg-bg-dark/80 backdrop-blur-xl flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <Card className="bg-surface border-border-custom text-text-main shadow-2xl rounded-none relative">
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 relative overflow-hidden border-2 border-accent/30 bg-surface">
                  <img src="https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png" alt="Logo" className="w-full h-full object-contain p-2" />
                </div>
                <CardTitle className="text-2xl font-black text-accent tracking-tighter uppercase">PORSHI - SIGN IN</CardTitle>
                <CardDescription className="text-text-dim text-xs">
                  পড়শিতে কোনো কিছু করতে হলে দয়া করে লগইন করুন।
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {authSuccessMessage && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-bold text-center">
                    {authSuccessMessage}
                  </div>
                )}
                
                <div className="flex gap-2 p-1 bg-bg-dark border border-border-custom rounded-xl mb-4">
                  <button 
                    type="button"
                    onClick={() => setAuthView('login')}
                    className={`flex-1 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${authView === 'login' ? 'bg-accent text-bg-dark' : 'text-text-dim hover:text-white'}`}
                  >
                    লগইন
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthView('register')}
                    className={`flex-1 py-2 text-[10px] uppercase font-black tracking-widest rounded-lg transition-all ${authView === 'register' ? 'bg-accent text-bg-dark' : 'text-text-dim hover:text-white'}`}
                  >
                    রেজিস্ট্রেশন
                  </button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-3">
                  {authView === 'register' && (
                    <Input placeholder="আপনার নাম" value={authName} onChange={e => setAuthName(e.target.value)} className="bg-bg-dark border-border-custom h-10 text-sm" />
                  )}
                  <Input placeholder="ফোন নাম্বার" value={authPhone} onChange={e => setAuthPhone(e.target.value)} className="bg-bg-dark border-border-custom h-10 text-sm" />
                  <Input placeholder="পাসওয়ার্ড" type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="bg-bg-dark border-border-custom h-10 text-sm" />
                  <Button type="submit" disabled={isAuthLoading} className="w-full bg-accent text-bg-dark font-black h-12 text-[10px] uppercase tracking-[4px]">
                    {isAuthLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-bg-dark" /> : (authView === 'login' ? 'লগইন (LOGIN)' : 'নিবন্ধন (JOIN)')}
                  </Button>
                </form>

                <div className="text-center">
                  <span className="text-[10px] text-text-dim uppercase font-bold tracking-widest">বা</span>
                </div>
                
                <Button onClick={login} className="w-full bg-accent/10 text-accent border border-accent/30 font-black flex gap-3 h-12 uppercase tracking-widest text-[10px]">
                  <Globe className="w-4 h-4" /> গুগল দিয়ে লগইন
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!isAuthReady) return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center space-y-8">
      {/* branded splash */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-40 h-40 relative overflow-hidden border-4 border-accent shadow-[0_0_50px_rgba(0,209,255,0.3)] bg-surface flex items-center justify-center"
      >
        <img 
          src="https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png" 
          alt="PORSHI" 
          className="w-full h-full object-contain p-4"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase">PORSHI</h1>
        <div className="flex items-center justify-center gap-2">
           <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
           <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em]">System Starting...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-bg-dark text-text-main' : 'bg-gray-50 text-gray-900'} font-sans selection:bg-accent/30 flex flex-col items-center transition-colors duration-300`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col p-6 border-r ${theme === 'dark' ? 'border-border-custom bg-surface/30' : 'border-gray-200 bg-white'} backdrop-blur-xl z-50`}>
        {/* Hidden File Inputs */}
        <input type="file" accept="image/*,video/*" ref={postImageInputRef} onChange={handlePostImageChange} className="hidden" />
        <input type="file" accept="image/*,video/*" ref={storyImageInputRef} onChange={handleStoryImageChange} className="hidden" />
        <input type="file" accept="image/*" ref={profileImageInputRef} onChange={uploadProfilePicture} className="hidden" />
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative overflow-hidden border border-accent/30 bg-surface">
              <img 
                src="https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xl font-black tracking-widest text-accent">PORSHI</div>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
          <LanguageSwitcher />
        </div>
        
          <nav className="flex-1 space-y-2">
        {[
          { id: 'home', icon: Home, label: t('home') },
          { id: 'scan', icon: Store, label: t('discovery') },
          { id: 'chat', icon: MessageCircle, label: t('chat') },
          { id: 'monetization', icon: DollarSign, label: t('monetize') },
          { id: 'ads', icon: Megaphone, label: t('create_ad') },
          { id: 'notifications', icon: Bell, label: t('notifications'), badge: unreadNotificationsCount },
          { id: 'profile', icon: UserIcon, label: t('settings') },
        ].map(item => (
        <button
          key={item.id}
          onClick={() => {
            if (['chat', 'monetization', 'ads', 'notifications', 'profile', 'admin'].includes(item.id)) {
              withAuth(() => setActiveTab(item.id as any));
            } else {
              setActiveTab(item.id as any);
            }
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-accent text-bg-dark font-bold' : 'text-text-dim hover:bg-surface hover:text-white'}`}
        >
          <div className="flex items-center gap-4">
            <item.icon className="w-5 h-5" />
            <span className="text-sm uppercase tracking-tighter">{item.label}</span>
          </div>
          {item.badge && item.badge > 0 && (
            <span className="bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {item.badge}
            </span>
          )}
        </button>
      ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border-custom">
          <button onClick={logout} className="w-full flex items-center gap-4 p-3 text-red-500 hover:bg-red-400/10 rounded-xl transition-all border border-red-500/20">
            <LogOut className="w-5 h-5" />
            <span className="text-sm uppercase font-black">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (Facebook Style) */}
      <header className={`lg:hidden w-full px-4 pt-3 pb-2 flex justify-between items-center ${theme === 'dark' ? 'bg-[#242526] text-white border-b border-[#3E4042]' : 'bg-white text-[#1877F2] border-b border-[#E4E6EB]'} sticky top-0 z-50`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileDrawerOpen(true)} className="p-1">
            <Menu className={`w-6 h-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          <h1 className={`text-xl font-black tracking-widest uppercase flex items-center ${theme === 'dark' ? 'text-accent' : 'text-[#1877F2]'}`}>
            {currentApp === 'porshi' ? 'PORSHI' : 'PORSH'}
          </h1>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
          <button 
            onClick={() => setIsMobileCreateMenuOpen(true)}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}
          >
            <Plus className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </button>
          <button 
            onClick={() => setIsMobileSearchOpen(true)}
            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}
          >
            <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
          </button>
          <button onClick={() => withAuth(() => setCurrentApp('porsh'))} className={`p-2 rounded-full relative ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}>
            <MessageCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-black'}`} />
            <span className="absolute -top-1 -right-1 bg-red-600 text-[9px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">9+</span>
          </button>
        </div>
      </header>

      {/* Facebook Style Mobile Tabs */}
      <nav className={`lg:hidden w-full flex justify-around items-center border-b ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'} overflow-x-auto no-scrollbar`}>
        {[
          { id: 'home', icon: Home },
          { id: 'scan', icon: Store },
          { id: 'video', icon: PlayCircle }, // Rename id to video for clarity
          { id: 'notifications', icon: Bell, badge: unreadNotificationsCount },
          { id: 'profile', icon: UserCircle },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentApp('porshi');
              if (['notifications', 'profile'].includes(item.id)) {
                withAuth(() => setActiveTab(item.id));
              } else {
                setActiveTab(item.id);
              }
            }}
            className={`flex-1 py-3 flex flex-col items-center justify-center relative ${activeTab === item.id && currentApp === 'porshi' ? 'text-[#1877F2]' : 'text-gray-500'}`}
          >
            <item.icon className={`w-6 h-6 ${activeTab === item.id && currentApp === 'porshi' ? 'fill-current' : ''}`} />
            {activeTab === item.id && currentApp === 'porshi' && (
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#1877F2]" />
            )}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-2 right-1/4 bg-red-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center shadow-sm">
                {item.badge}
              </span>
            )}
          </button>
        ))}
        <button 
          onClick={() => {
             setCurrentApp('porshi');
             withAuth(() => setActiveTab('profile'));
          }}
          className="flex-1 py-3 flex items-center justify-center text-gray-500"
        >
           <div className={`w-7 h-7 rounded-full overflow-hidden border ${activeTab === 'profile' ? 'border-[#1877F2] p-[1px]' : 'border-gray-300'}`}>
              {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full p-1" />}
           </div>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl lg:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {renderContent()}
      </main>

      {/* Mobile Bottom Bar (Hidden as we used top tabs now) */}
      {/* <nav className={`lg:hidden fixed bottom-0 left-0 w-full ${theme === 'dark' ? 'bg-surface/80 border-border-custom' : 'bg-white/80 border-gray-200'} backdrop-blur-2xl border-t flex justify-around items-center p-3 z-50`}>
        ...
      </nav> */}

      {/* Story Modal */}
      <AnimatePresence>
        {activeStory && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg h-full md:h-[90vh] md:rounded-3xl overflow-hidden">
              {activeStory.mediaType === 'video' ? (
                <video src={activeStory.videoUrl} autoPlay controls className="w-full h-full object-cover" />
              ) : (
                <img src={activeStory.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              )}
              <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-accent overflow-hidden">
                    <img src={activeStory.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm uppercase">{activeStory.authorName}</div>
                    <div className="text-white/60 text-[8px] uppercase">{activeStory.timestamp?.toDate().toLocaleString()}</div>
                  </div>
                </div>
                <button onClick={() => setActiveStory(null)} className="text-white p-2 hover:bg-white/10 rounded-full"><X className="w-6 h-6" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer (Facebook Style Menu) */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-[100] flex flex-col w-full h-full ${theme === 'dark' ? 'bg-[#18191A]' : 'bg-[#F0F2F5]'}`}
          >
            <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'}`}>
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pt-4 custom-scrollbar">
               {/* Profile Shortcut */}
               <motion.div 
                 whileTap={{ scale: 0.98 }}
                 onClick={() => { 
                   if (!user) {
                     setShowAuthModal(true);
                   } else {
                     setActiveTab('profile'); 
                   }
                   setIsMobileDrawerOpen(false); 
                 }}
                 className={`p-3 rounded-xl flex items-center gap-3 shadow-sm cursor-pointer ${theme === 'dark' ? 'bg-[#242526]' : 'bg-white'}`}
               >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-surface">
                    {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-text-dim" />}
                  </div>
                  <div>
                    <div className="font-bold">{user?.displayName || 'Guest User'}</div>
                    <div className="text-xs text-text-dim uppercase tracking-widest font-bold">See your profile</div>
                  </div>
               </motion.div>

               <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Marketplace', icon: Store, tab: 'scan', color: 'text-orange-500' },
                    { label: 'Video', icon: PlayCircle, tab: 'video', color: 'text-[#1877F2]' },
                    { label: 'Monetization', icon: DollarSign, tab: 'monetization', color: 'text-green-500' },
                    { label: 'Ads Manager', icon: Megaphone, tab: 'ads', color: 'text-[#1877F2]' },
                    { label: 'Groups', icon: Users, tab: 'profile', color: 'text-blue-400' },
                    { label: 'Saved', icon: Bell, tab: 'notifications', color: 'text-purple-500' },
                    { label: 'Pages', icon: LayoutDashboard, tab: 'profile', color: 'text-orange-600' },
                    { label: 'Events', icon: Calendar, tab: 'profile', color: 'text-red-500' },
                  ].map((item, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { 
                        if (['monetization', 'ads', 'notifications', 'profile', 'groups', 'pages', 'events', 'scan'].includes(item.tab)) {
                          withAuth(() => setActiveTab(item.tab as any));
                        } else {
                          setActiveTab(item.tab as any);
                        }
                        setIsMobileDrawerOpen(false); 
                      }}
                      className={`p-4 rounded-xl flex flex-col gap-2 items-start text-left shadow-sm ${theme === 'dark' ? 'bg-[#242526]' : 'bg-white'}`}
                    >
                       <item.icon className={`w-6 h-6 ${item.color}`} />
                       <span className="text-xs font-bold uppercase tracking-tighter">{item.label}</span>
                    </motion.button>
                  ))}
               </div>

               {user ? (
                 <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-red-500 bg-red-400/10 border border-red-400/20 font-bold uppercase text-[10px]"
                 >
                   <LogOut className="w-4 h-4" /> Log out
                 </Button>
               ) : (
                 <Button 
                   onClick={() => { setShowAuthModal(true); setIsMobileDrawerOpen(false); }}
                   className="w-full h-12 rounded-xl flex items-center justify-center gap-2 bg-accent text-bg-dark font-black uppercase text-[10px]"
                 >
                   <UserIcon className="w-4 h-4" /> Login / Signup
                 </Button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderPostCreationModal()}

      {/* Mobile Create Menu Backdrop */}
      <AnimatePresence>
        {isMobileCreateMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileCreateMenuOpen(false)}
            className="fixed inset-0 z-[110] bg-black/60 flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full p-4 rounded-t-3xl pb-10 ${theme === 'dark' ? 'bg-[#242526]' : 'bg-white'}`}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              <h3 className="text-center font-bold text-lg mb-6">Create</h3>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => { setIsMobileCreateMenuOpen(false); withAuth(() => { setPostInput(''); setActiveTab('home'); }); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><PenLine className="w-6 h-6" /></div>
                    <div className="text-left font-bold">Post</div>
                 </button>
                 <button onClick={() => { setIsMobileCreateMenuOpen(false); withAuth(createStory); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#E7F3FF] flex items-center justify-center"><PlayCircle className="w-6 h-6 text-[#1877F2]" /></div>
                    <div className="text-left font-bold">Story</div>
                 </button>
                 <button onClick={() => { setIsMobileCreateMenuOpen(false); withAuth(() => { setActiveTab('video'); }); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[#FCE8F3] flex items-center justify-center"><VideoIcon className="w-6 h-6 text-[#E91E63]" /></div>
                    <div className="text-left font-bold">Reel</div>
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed inset-0 z-[120] p-4 flex flex-col ${theme === 'dark' ? 'bg-[#18191A]' : 'bg-[#F0F2F5]'}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }} 
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className={`flex-1 flex items-center gap-3 h-10 px-4 rounded-full ${theme === 'dark' ? 'bg-[#242526]' : 'bg-gray-200'}`}>
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  autoFocus 
                  placeholder="Search friends..." 
                  value={searchQuery}
                  onChange={(e) => handleGlobalSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full" 
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar">
               <div className="flex justify-between items-center px-2">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-text-dim">Search Results</h3>
                  {searchResults.length > 0 && <button className="text-[#1877F2] text-xs font-bold" onClick={() => setSearchResults([])}>Clear</button>}
               </div>
               
               <div className="space-y-2">
                {searchResults.map(u => (
                  <div key={u.uid} className="p-3 bg-surface border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { navigateToProfile(u.uid); setIsMobileSearchOpen(false); }}>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-border-custom px-1 bg-bg-dark">
                        {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover rounded-full" /> : <UserIcon className="w-full h-full p-2 text-text-dim" />}
                      </div>
                      <div className="font-bold text-sm truncate max-w-[150px]">{u.displayName}</div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => { followUser(u.uid); setIsMobileSearchOpen(false); }}
                      className="bg-accent text-bg-dark text-[8px] font-black h-8 px-4 rounded-xl"
                    >
                      Follow
                    </Button>
                  </div>
                ))}

                {searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-20 opacity-30 uppercase text-[10px] font-bold tracking-widest text-text-dim">
                    No users found matching "{searchQuery}"
                  </div>
                )}
                
                {!searchQuery && (
                  <div className="text-center py-20 opacity-30 uppercase text-[10px] font-bold tracking-widest text-text-dim">
                    Start typing to search friends...
                  </div>
                )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {commentingPostId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-end md:items-center justify-center animate-in fade-in"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full max-w-lg h-[80vh] md:h-[600px] border rounded-t-3xl md:rounded-3xl flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-surface border-border-custom' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-4 border-b flex justify-between items-center ${theme === 'dark' ? 'border-border-custom' : 'border-gray-100'}`}>
                <h3 className="font-bold uppercase tracking-widest text-accent text-sm">কমেন্টস</h3>
                <button onClick={() => setCommentingPostId(null)} className="text-text-dim hover:text-accent p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {postComments.length === 0 ? (
                  <div className="text-center text-text-dim py-10 uppercase text-[10px] font-bold tracking-widest">এখনো কোনো কমেন্ট নেই</div>
                ) : (
                  postComments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-surface border border-border-custom flex-shrink-0">
                        {c.authorPhoto ? (
                          <img src={c.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                        ) : (
                          <UserIcon className="w-full h-full p-1 text-text-dim" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`px-4 py-2 rounded-2xl ${theme === 'dark' ? 'bg-bg-dark/50 text-text-main' : 'bg-gray-100 text-gray-900'}`}>
                          <div className="font-bold text-[10px] uppercase tracking-tighter mb-1 text-accent">{c.authorName}</div>
                          <div className="text-xs leading-relaxed">{c.text}</div>
                        </div>
                        {c.timestamp && (
                          <div className="text-[8px] text-text-dim mt-1 ml-2 uppercase font-bold tracking-tighter">
                            {c.timestamp.toDate().toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={submitComment} className={`p-4 border-t flex gap-2 ${theme === 'dark' ? 'border-border-custom bg-surface' : 'border-gray-100 bg-white'}`}>
                <Input 
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder="আপনার মতামত লিখুন..."
                  className={`rounded-full h-11 border-none px-6 text-sm ${theme === 'dark' ? 'bg-bg-dark text-white placeholder:text-text-dim' : 'bg-gray-100 text-gray-900 placeholder:text-gray-400'}`}
                />
                <Button type="submit" disabled={!commentInput.trim()} className="rounded-full bg-accent text-bg-dark font-bold px-6 h-11 hover:scale-105 transition-transform active:scale-95">
                  পাঠান
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Overlay */}
      <AnimatePresence>
        {activeChat && (
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-bg-dark flex flex-col"
          >
            <div className="p-4 border-b border-border-custom flex justify-between items-center bg-surface/95 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)} className="text-text-dim"><ArrowLeft className="w-6 h-6" /></Button>
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 overflow-hidden">
                  <UserIcon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-bold uppercase tracking-tighter text-sm text-white">{activeChat.partnerName}</div>
                  <div className="text-[8px] text-accent uppercase font-bold animate-pulse">অনলাইন</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)} className="text-text-dim hover:text-red-400"><X className="w-6 h-6" /></Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => {
                const isMe = msg.senderUid === user?.uid;
                return (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] p-3 px-4 rounded-2xl ${isMe ? 'bg-accent text-bg-dark rounded-br-none' : 'bg-surface border border-border-custom text-white rounded-bl-none'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <div className="text-[8px] mt-1 opacity-50 text-right">
                        {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-border-custom flex gap-2 bg-surface/80 backdrop-blur-md">
              <Input 
                value={messageInput}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="মেসেজ লিখুন..."
                className="bg-bg-dark border-border-custom rounded-full px-6 h-12 text-sm"
              />
              <Button type="submit" className="bg-accent text-bg-dark rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Request Overlay */}
      <AnimatePresence>
        {incomingRequest && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 100 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 100 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md"
          >
            <div className="w-full max-w-sm bg-surface border-2 border-accent p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-pulse"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 border-2 border-accent/30 animate-bounce">
                  <UserPlus className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">নতুন রিকোয়েস্ট!</h2>
                <p className="text-text-dim text-sm mb-8">
                  <span className="text-accent font-bold">{incomingRequest.fromName}</span> আপনার সাথে কানেক্ট হতে চায়।
                </p>
                <div className="flex gap-3 w-full">
                  <Button 
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-none uppercase font-bold text-xs h-12"
                    onClick={() => respondToRequest(incomingRequest.id, 'declined')}
                  >
                    না
                  </Button>
                  <Button 
                    className="flex-1 bg-accent text-bg-dark hover:bg-white rounded-none uppercase font-bold text-xs h-12 shadow-lg"
                    onClick={() => respondToRequest(incomingRequest.id, 'accepted')}
                  >
                    হ্যাঁ
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderAdPaymentModal()}
      {renderAuthModal()}

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-accent text-bg-dark px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-2xl"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2C2C2E; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8E8E93; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
