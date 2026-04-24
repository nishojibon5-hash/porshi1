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
  Download,
  MonitorSmartphone,
  ChevronRight,
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
  Check,
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
  MapPin,
  Briefcase,
  GraduationCap,
  Globe,
  Lock,
  UserCheck,
  BarChart,
  TrendingUp,
  DollarSign,
  Activity,
  Eye,
  Zap,
  Play,
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
  ThumbsUp,
  Pencil,
  Settings2,
  Phone,
  PlusCircle,
  Mic,
  SendHorizontal
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
import { StoryViewer } from './components/StoryViewer';

interface ActiveChat {
  id: string;
  partnerId: string;
  partnerName: string;
}

export default function App() {
  const { t } = useTranslation();
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentApp, setCurrentApp] = useState<'porshi' | 'porsh'>('porshi');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [adminActiveTab, setAdminActiveTab] = useState('overview');
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
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
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
  const [postYoutubeUrl, setPostYoutubeUrl] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isPostMonetized, setIsPostMonetized] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [activeReel, setActiveReel] = useState<Post | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (commentingPostId) {
      const q = query(
        collection(db, 'posts', commentingPostId, 'comments'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPostComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    } else {
      setPostComments([]);
    }
  }, [commentingPostId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('app') === 'porsh') {
      setCurrentApp('porsh');
    }
  }, []);

  // Sync theme with system/CSS and handle status bar color
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // Update Chrome/Android theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = appConfig?.pwaThemeColor || (theme === 'dark' ? '#18191A' : '#ffffff');
      metaThemeColor.setAttribute('content', color);
      document.body.style.backgroundColor = color;
    }
  }, [theme, appConfig?.pwaThemeColor]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);
  const [isIframe, setIsIframe] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [activeMessengerTab, setActiveMessengerTab] = useState<'chats' | 'stories' | 'alerts'>('chats');
  const [messengerSearch, setMessengerSearch] = useState('');

  useEffect(() => {
    setIsInStandaloneMode(window.matchMedia('(display-mode: standalone)').matches);
    setIsIframe(window.self !== window.top);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      addLog('PWA Installation ready for ' + window.location.hostname);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      addLog('পড়শি অ্যাপ সফলভাবে ইনস্টল করা হয়েছে!');
      setIsInStandaloneMode(true);
      setShowInstallModal(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (isIframe) {
      const targetUrl = `${window.location.origin}${window.location.pathname}?app=porsh`;
      window.open(targetUrl, '_blank');
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInStandaloneMode(true);
          setShowInstallModal(false);
          addLog('Porsh successfully installed!');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else {
       // Refresh state quietly
       window.dispatchEvent(new Event('resize'));
    }
  };

  useEffect(() => {
    // We no longer auto-show the install modal per user request
    if (currentApp === 'porsh' && !isInStandaloneMode) {
      // Logic for background readiness if needed in future
    }
  }, [currentApp, isInStandaloneMode]);

  const [monetizationData, setMonetizationData] = useState<MonetizationData | null>(null);
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    objective: 'views',
    location: '',
    audience: '',
    websiteUrl: '',
    durationDays: 5,
    budget: 100,
    adType: 'banner',
    videoAdUrl: '',
    vastUrl: '',
    vastType: 'pre-roll' as 'pre-roll' | 'mid-roll' | 'post-roll',
    adCode: ''
  });
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [showAdPaymentModal, setShowAdPaymentModal] = useState(false);
  const [pendingAdId, setPendingAdId] = useState<string | null>(null);
  const [myAds, setMyAds] = useState<Advertisement[]>([]);
  const [allAds, setAllAds] = useState<Advertisement[]>([]);
  const [usersRegistry, setUsersRegistry] = useState<Record<string, AppUser>>({});
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [isUploadingCommentMedia, setIsUploadingCommentMedia] = useState(false);
  const commentMediaInputRef = useRef<HTMLInputElement>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
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
  const [googleOneTapLoaded, setGoogleOneTapLoaded] = useState(false);

  // Initialize Google One Tap
  useEffect(() => {
    const initializeGoogleOneTap = () => {
      if (typeof window.google === 'undefined' || !import.meta.env.VITE_GOOGLE_CLIENT_ID) return;
      
      // Use a global or window property to prevent multiple initializations
      if ((window as any)._gsiInitialized) {
        if (!user && window.self === window.top) {
          window.google.accounts.id.prompt();
        }
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            setIsAuthLoading(true);
            try {
              const credential = GoogleAuthProvider.credential(response.credential);
              await signInWithCredential(auth, credential);
              setShowAuthModal(false);
              setAuthSuccessMessage('গুগল দিয়ে লগইন সফল!');
            } catch (error: any) {
              console.error('One Tap Error:', error);
              setErrorMessage('গুগল লগইন এরর');
            } finally {
              setIsAuthLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        (window as any)._gsiInitialized = true;

        if (!user && window.self === window.top) {
          window.google.accounts.id.prompt();
        }
        setGoogleOneTapLoaded(true);
      } catch (err) {
        console.error('GIS Init Error:', err);
      }
    };

    if (!googleOneTapLoaded && !document.getElementById('gsi-client-script')) {
      const script = document.createElement('script');
      script.id = 'gsi-client-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleOneTap;
      document.body.appendChild(script);
    } else {
      initializeGoogleOneTap();
    }
  }, [user]); // Only re-reun prompt logic if user changes, initialization is guarded by window flag

  // Helper to enforce auth
  const withAuth = (action: () => void) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

  // Re-render Google button when modal opens
  useEffect(() => {
    if (showAuthModal && typeof window.google !== 'undefined' && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      setTimeout(() => {
        const btn = document.getElementById("google-login-btn");
        if (btn) {
          window.google.accounts.id.renderButton(
            btn,
            { theme: "outline", size: "large", width: btn.offsetWidth, shape: "rectangular" }
          );
        }
      }, 100);
    }
  }, [showAuthModal]);

  const navigateToProfile = (uid: string) => {
    if (!uid) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }
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
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isEditProfileLoading, setIsEditProfileLoading] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    displayName: '',
    bio: '',
    hometown: '',
    currentCity: '',
    education: '',
    work: '',
    relationshipStatus: '',
    website: ''
  });
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

  const uploadCoverPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    handleFileSelect(e, async (base64Data) => {
      setIsUploadingCover(true);
      try {
        addLog('কভার ফটো প্রসেস হচ্ছে...');
        let coverPhotoURL = '';
        
        if (appConfig?.cloudinaryCloudName) {
          addLog('কভার ফটো আলটিমেট মোডে আপলোড হচ্ছে...');
          coverPhotoURL = await uploadToCloudinary(base64Data, 'image');
        } else {
          coverPhotoURL = await compressImage(base64Data, 1280, 0.6);
        }
        
        await updateDoc(doc(db, 'users', user.uid), {
          coverPhotoURL: coverPhotoURL
        });
        
        setUser({ ...user, coverPhotoURL: coverPhotoURL });
        addLog('কভার ফটো আপডেট সফল!');
        setErrorMessage('কভার ফটো আপডেট হয়েছে!');
        setTimeout(() => setErrorMessage(null), 3000);
      } catch (error: any) {
        console.error('Cover photo error:', error);
        addLog(`কভার ফটো এরর: ${error.message}`);
        setErrorMessage('কভার ফটো আপডেট করতে সমস্যা হয়েছে।');
        setTimeout(() => setErrorMessage(null), 4000);
      } finally {
        setIsUploadingCover(false);
      }
    });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsEditProfileLoading(true);
    try {
      addLog('প্রোফাইল আপডেট হচ্ছে...');
      await updateDoc(doc(db, 'users', user.uid), {
        ...editProfileData,
        lastSeen: serverTimestamp()
      });
      setUser({ ...user, ...editProfileData });
      setIsEditProfileModalOpen(false);
      addLog('প্রোফাইল আপডেট সফল!');
      setErrorMessage('প্রোফাইল আপডেট সফল হয়েছে!');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      console.error('Update profile error:', error);
      addLog(`প্রোফাইল এরর: ${error.message}`);
      setErrorMessage('প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsEditProfileLoading(false);
    }
  };

  const openEditProfile = () => {
    if (!user) return;
    setEditProfileData({
      displayName: user.displayName || '',
      bio: user.bio || '',
      hometown: user.hometown || '',
      currentCity: user.currentCity || '',
      education: user.education || '',
      work: user.work || '',
      relationshipStatus: user.relationshipStatus || '',
      website: user.website || '',
      autoplayVideos: user.autoplayVideos ?? true
    });
    setIsEditProfileModalOpen(true);
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!postInput.trim() && !postImage && !postVideo)) return;

    // Save values for background upload
    const currentInput = postInput.trim();
    const currentImage = postImage;
    const currentVideo = postVideo;
    const currentYoutubeUrl = postYoutubeUrl;

    // Reset inputs immediately to give instant feedback
    setPostInput('');
    setPostImage(null);
    setPostVideo(null);
    setPostVideoPreview(null);
    setPostYoutubeUrl('');
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
        let linkUrl = '';
        let isReel = false;
        let mediaType: 'image' | 'video' | 'text' | 'link' = 'text';

        // Extract first link if any
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const foundLinks = currentInput.match(urlRegex);
        if (foundLinks && foundLinks.length > 0) {
          linkUrl = foundLinks[0];
          // Don't auto-set mediaType to 'link' yet, let image/video take priority
        }

        if (currentImage) {
          mediaType = 'image';
          addLog('ছবি প্রসেস হচ্ছে... (Firestore)');
          const dataURL = await compressImage(currentImage, 800, 0.4);
          imageUrl = dataURL; 
          addLog('ছবি প্রসেস সফল!');
        } else if (currentVideo) {
          mediaType = 'video';
          addLog('ভিডিও প্রসেস হচ্ছে... (Cloudinary)');
          
          // Check Video Duration & Aspect Ratio
          const videoElement = document.createElement('video');
          videoElement.src = URL.createObjectURL(currentVideo);
          await new Promise((resolve, reject) => {
            videoElement.onloadedmetadata = () => {
              if (videoElement.duration > 31) { // 31 to be generous
                URL.revokeObjectURL(videoElement.src);
                reject(new Error('৩০ সেকেন্ডের বেশি বড় ভিডিও আপলোড করা সম্ভব না।'));
              }
              // Detect Aspect Ratio
              if (videoElement.videoHeight > videoElement.videoWidth) {
                isReel = true;
              }
              resolve(true);
            };
            videoElement.onerror = () => reject(new Error('ভিডিও ফাইলটি পড়তে সমস্যা হয়েছে।'));
          });
          URL.revokeObjectURL(videoElement.src);

          videoUrl = await uploadToCloudinary(currentVideo, 'video');
          addLog('ভিডিও প্রসেস সফল!');
        } else if (currentYoutubeUrl) {
          mediaType = currentYoutubeUrl.includes('youtube.com') || currentYoutubeUrl.includes('youtu.be') ? 'video' : 'link';
        } else if (foundLinks && foundLinks.length > 0) {
          linkUrl = foundLinks[0];
          mediaType = 'link';
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
          youtubeUrl: currentYoutubeUrl,
          linkUrl,
          isReel,
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
        youtubeUrl: postYoutubeUrl,
        isEdited: true,
        privacy: postPrivacy
      });
      setEditingPost(null);
      setPostInput('');
      setPostYoutubeUrl('');
      setPostPrivacy('public');
      setErrorMessage('পোস্ট আপডেট করা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      console.error('Update post error:', error);
      setErrorMessage('পোস্ট আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const likePost = async (postId: string) => {
    return reactToPost(postId, '👍');
  };

  const reactToPost = async (postId: string, reactionType: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const userReactionRef = doc(db, 'posts', postId, 'userReactions', user.uid);
      
      const userReactionDoc = await getDoc(userReactionRef);
      const existingReaction = userReactionDoc.exists() ? userReactionDoc.data().type : null;

      const batch = writeBatch(db);

      if (existingReaction === reactionType) {
        // Toggle off
        batch.delete(userReactionRef);
        batch.update(postRef, {
          [`reactions.${reactionType}`]: increment(-1),
          // We only decrement likesCount if it was a '👍'? 
          // Actually let's just make likesCount represent TOTAL reactions for simplicity or just '👍'
          // User asked for "লাইক করা যাচ্চে না", usually means the main Like button.
          likesCount: existingReaction === '👍' ? increment(-1) : increment(0)
        });
      } else {
        // Change or add new
        if (existingReaction) {
          batch.update(postRef, {
            [`reactions.${existingReaction}`]: increment(-1),
            likesCount: existingReaction === '👍' ? increment(-1) : increment(0)
          });
        }
        
        batch.set(userReactionRef, { type: reactionType, timestamp: serverTimestamp() });
        batch.update(postRef, {
          [`reactions.${reactionType}`]: increment(1),
          likesCount: reactionType === '👍' ? increment(1) : increment(0)
        });
      }

      await batch.commit();

      // Reward author logic
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data() as Post;
      if (postData.isMonetized && postData.authorUid !== user.uid) {
        const authorMonetizationRef = doc(db, 'monetization', postData.authorUid);
        await updateDoc(authorMonetizationRef, {
          totalEarnings: increment(0.01),
          engagement: increment(1)
        });
      }

      // Send Notification
      if (postData.authorUid !== user.uid && existingReaction !== reactionType) {
        await sendNotification({
          toUid: postData.authorUid,
          fromUid: user.uid,
          fromName: user.displayName,
          fromPhoto: user.photoURL,
          type: 'like',
          title: reactionType === '👍' ? 'নতুন লাইক!' : 'নতুন রিঅ্যাকশন!',
          message: `${user.displayName} আপনার পোস্টে ${reactionType === '👍' ? 'লাইক দিয়েছেন' : 'রিঅ্যাক্ট করেছেন'}।`
        });
      }
    } catch (error) {
      console.error('Reaction error:', error);
      setErrorMessage('রিঅ্যাক্ট করতে সমস্যা হয়েছে।');
      handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}`);
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

  const selectVideoAd = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploadingPhoto(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', appConfig?.cloudinaryUploadPreset || 'porshi_preset');
        const res = await fetch(`https://api.cloudinary.com/v1_1/${appConfig?.cloudinaryCloudName || 'dxpux998n'}/video/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        setAdForm(prev => ({ ...prev, videoAdUrl: data.secure_url, adType: 'video_skippable' }));
        setErrorMessage('ভিডিও এড আপলোড হয়েছে!');
      } catch (err) {
        setErrorMessage('ভিডিও আপলোড ব্যর্থ হয়েছে।');
      } finally {
        setIsUploadingPhoto(false);
      }
    };
    input.click();
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

  const handleCreateAdminAd = async () => {
    if (!user || user.role !== 'admin') return;
    const isVast = !!adForm.vastUrl.trim();
    const isAdSense = !!adForm.adCode.trim();
    
    if (!adForm.title.trim() && !isAdSense) {
      setErrorMessage('টাইটেল অথবা এডসেন্স কোড দিন।');
      return;
    }
    
    if (!isVast && !isAdSense && !adForm.videoAdUrl) {
      setErrorMessage('ভিডিও, VAST URL অথবা এডসেন্স কোড দিন।');
      return;
    }

    setIsCreatingAd(true);
    try {
      const adData: Omit<Advertisement, 'id'> = {
        advertiserUid: 'admin',
        advertiserName: 'পড়শি টীম (Official)',
        title: adForm.title.trim() || 'Google AdSense Banner',
        description: adForm.description.trim() || 'Third party display advertisement',
        objective: 'website_views',
        location: 'All Bangladesh',
        audience: 'All Audience',
        durationDays: 365,
        budget: 0,
        adType: isAdSense ? 'banner' : 'video_skippable', 
        videoAdUrl: adForm.videoAdUrl,
        vastUrl: adForm.vastUrl.trim(),
        vastType: adForm.vastType as any,
        adCode: adForm.adCode.trim(),
        status: 'active',
        paymentStatus: 'paid',
        timestamp: serverTimestamp(),
        expiresAt: Timestamp.fromMillis(Date.now() + 365 * 24 * 60 * 60 * 1000),
        reach: 0,
        clicks: 0,
        websiteUrl: adForm.websiteUrl.trim(),
        isAdminAd: true
      };

      await addDoc(collection(db, 'ads'), adData);
      setErrorMessage('সিস্টেম এড সফলভাবে চালু হয়েছে!');
      
      setAdForm({
        title: '',
        description: '',
        objective: 'views',
        location: '',
        audience: '',
        websiteUrl: '',
        durationDays: 5,
        budget: 100,
        adType: 'banner',
        videoAdUrl: '',
        vastUrl: '',
        vastType: 'pre-roll',
        adCode: ''
      });
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      setErrorMessage(`এরর: ${error.message}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsCreatingAd(false);
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


  const reactToComment = async (commentId: string, type: string) => {
    if (!user || !commentingPostId) return;

    try {
      const commentRef = doc(db, 'posts', commentingPostId, 'comments', commentId);
      const userReactionRef = doc(db, 'posts', commentingPostId, 'comments', commentId, 'userReactions', user.uid);
      
      const userReactionDoc = await getDoc(userReactionRef);
      const existingReaction = userReactionDoc.exists() ? userReactionDoc.data().type : null;

      const batch = writeBatch(db);

      if (existingReaction === type) {
        // Toggle off
        batch.delete(userReactionRef);
        batch.update(commentRef, {
          [`reactions.${type}`]: increment(-1)
        });
      } else {
        // Change or add new
        if (existingReaction) {
          batch.update(commentRef, {
            [`reactions.${existingReaction}`]: increment(-1)
          });
        }
        batch.set(userReactionRef, { type, timestamp: serverTimestamp() });
        batch.update(commentRef, {
          [`reactions.${type}`]: increment(1)
        });
      }

      await batch.commit();
    } catch (error) {
      console.error('Comment reaction error:', error);
      handleFirestoreError(error, OperationType.UPDATE, `posts/${commentingPostId}/comments/${commentId}`);
    }
  };

  const handleCommentMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingCommentMedia(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', appConfig?.cloudinaryUploadPreset || 'porshi_preset');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${appConfig?.cloudinaryCloudName || 'dozmbxvo5'}/auto/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setCommentImage(data.secure_url);
        addLog('কমেন্ট মিডিয়া আপলোড সফল!');
      }
    } catch (error) {
      console.error('Comment media upload error:', error);
      setErrorMessage('মিডিয়া আপলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsUploadingCommentMedia(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !commentingPostId || (!commentInput.trim() && !commentImage)) return;

    // Optimistic Update
    const tempId = 'temp-' + Date.now();
    const newComment = {
      id: tempId,
      authorUid: user.uid,
      authorName: user.displayName || 'User',
      authorPhoto: user.photoURL || '',
      text: commentInput.trim(),
      imageUrl: commentImage || undefined,
      timestamp: { toDate: () => new Date() } as any,
      reactions: {}
    };

    setPostComments(prev => [newComment, ...prev]);
    setPosts(prev => prev.map(p => p.id === commentingPostId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    const savedCommentText = commentInput.trim();
    const savedCommentImage = commentImage;
    
    setCommentInput('');
    setCommentImage(null);

    try {
      await addDoc(collection(db, 'posts', commentingPostId, 'comments'), {
        authorUid: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL || '',
        text: savedCommentText,
        imageUrl: savedCommentImage || null,
        timestamp: serverTimestamp(),
        reactions: {}
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
          message: `${user.displayName} আপনার পোস্টে কমেন্ট করেছেন${savedCommentText ? `: "${savedCommentText.substring(0, 30)}..."` : ' একটি ছবি পোস্ট করেছেন।'}`
        });
      }
    } catch (error) {
      console.error('Comment error:', error);
      setErrorMessage('কমেন্ট করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.CREATE, `posts/${commentingPostId}/comments`);
    }
  };

  useEffect(() => {
    if (!activeChat || !user) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)));
    }, (error) => {
      console.error('Chat messages error:', error);
    });

    return () => unsubscribe();
  }, [activeChat, user]);

  const handleSendMessage = async () => {
    if (!activeChat || !user || !messageInput.trim()) return;

    const text = messageInput;
    setMessageInput('');

    try {
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        senderUid: user.uid,
        text: text,
        timestamp: serverTimestamp(),
        isRead: false
      });
    } catch (error) {
      console.error('Send message error:', error);
      setErrorMessage('মেসেজ পাঠানো যায়নি।');
    }
  };

  const renderMessenger = () => {
    const chatActiveTab = activeMessengerTab || 'chats';
    
    // Filter users based on search
    const filteredUsers = onlineUsers.filter(u => 
      u.displayName.toLowerCase().includes(messengerSearch.toLowerCase())
    );

    return (
      <div className={`flex-1 flex flex-col h-screen fixed inset-0 z-50 lg:relative lg:h-full overflow-hidden ${theme === 'dark' ? 'bg-[#18191A] text-white' : 'bg-white text-black'}`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Messenger Header */}
        <div className="px-4 pt-2 pb-2 flex justify-between items-center bg-inherit">
          <div className="flex items-center gap-3">
             <button onClick={() => withAuth(() => navigateToProfile(user?.uid || ''))} className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-[#3E4042]">
                  {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2" />}
                </div>
                <div className="absolute -top-1 -right-1 bg-red-600 text-[10px] text-white font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#18191A]">
                   {unreadNotificationsCount > 0 ? unreadNotificationsCount : 0}
                </div>
             </button>
             <h1 className="text-2xl font-bold tracking-tight lowercase">porsh</h1>
          </div>
          <div className="flex gap-2">
             {!isInStandaloneMode && (
               <button 
                 onClick={installApp}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-tighter animate-pulse shadow-lg"
               >
                 <Download className="w-3 h-3" />
                 Install
               </button>
             )}
             <button className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C] text-white' : 'bg-gray-100 text-black'}`}>
                <CameraIcon className="w-5 h-5" />
             </button>
             <button className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C] text-white' : 'bg-gray-100 text-black'}`}>
                <Pencil className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Dynamic Install Promo */}
        {!isInStandaloneMode && (
          <div 
             onClick={installApp}
             className={`mx-4 mt-2 mb-4 p-4 rounded-3xl cursor-pointer border-2 border-dashed ${theme === 'dark' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'} flex items-center justify-between group transition-all hover:bg-blue-500/10`}
          >
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                   <MonitorSmartphone className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[13px] font-black tracking-tight leading-none mb-1">পরশ অ্যাপ ডাউনলোড করুন</p>
                   <p className="text-[11px] font-medium opacity-70">দ্রুত চ্যাট এবং নোটিফিকেশন পেতে অ্যাপটি ডাউনলোড করে নিন।</p>
                </div>
             </div>
             <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {/* Search Bar */}
        <div className="px-4 py-2">
           <div className={`flex items-center gap-3 h-11 px-4 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}>
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                placeholder="Search or find friends..." 
                className="bg-transparent border-none outline-none text-[15px] w-full placeholder:text-gray-500"
                value={messengerSearch}
                onChange={(e) => setMessengerSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
           {chatActiveTab === 'chats' && (
             <>
               {/* Stories Section (Messenger Circles) */}
               <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                     <div className="relative">
                        <button onClick={createStory} className={`w-16 h-16 rounded-full flex items-center justify-center border border-dashed ${theme === 'dark' ? 'border-[#3E4042] bg-[#242526]' : 'border-gray-300 bg-gray-50'}`}>
                           <Plus className="w-6 h-6 text-gray-400" />
                        </button>
                        <div className="absolute -top-1 -left-1 bg-white dark:bg-[#242526] p-1 rounded-full shadow-md text-[10px] border border-gray-100 dark:border-[#3E4042]">
                           💭
                        </div>
                     </div>
                     <span className="text-[11px] text-gray-500 font-medium mt-1">Create story</span>
                  </div>

                  {stories.slice(0, 10).map(s => (
                     <div key={s.id} onClick={() => setActiveStory(s)} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group">
                        <div className="relative p-[3px] rounded-full ring-2 ring-blue-500 bg-inherit transition-transform active:scale-95">
                           <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-[#18191A]">
                              <img src={s.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                           </div>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium truncate w-16 text-center mt-1">{s.authorName.split(' ')[0]}</span>
                     </div>
                  ))}
                  
                  {onlineUsers.filter(u => u.uid !== user?.uid).map(u => (
                     <div key={u.uid} onClick={() => setActiveChat({ id: [user!.uid, u.uid].sort().join('_'), partnerId: u.uid, partnerName: u.displayName })} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
                        <div className="relative">
                           <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 dark:border-[#3E4042]">
                              {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-3 bg-gray-100 opacity-50" />}
                           </div>
                           <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#18191A] rounded-full" />
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium truncate w-16 text-center mt-1">{u.displayName.split(' ')[0]}</span>
                     </div>
                  ))}
               </div>

               {/* Chat List */}
               <div className="space-y-0.5">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <button 
                        key={u.uid}
                        onClick={() => setActiveChat({ id: [user!.uid, u.uid].sort().join('_'), partnerId: u.uid, partnerName: u.displayName })}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F0F2F5] dark:hover:bg-[#242526] transition-colors group text-left"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-[#3A3B3C]">
                            {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-3 text-gray-400" />}
                          </div>
                          {u.isOnline && (
                             <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#18191A] rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-[#242526] pb-3 group-last:border-none">
                           <div className="flex justify-between items-center mb-0.5">
                              <span className="font-semibold text-[17px] truncate pr-2">{u.displayName}</span>
                              <span className="text-[12px] text-gray-400 font-medium">Wed</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1 min-w-0">
                                 <p className="text-[14px] text-gray-500 truncate">You: হাই, কেমন আছেন পড়শি বন্ধু?</p>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                 <div className="w-3 h-3 rounded-full bg-blue-500" />
                              </div>
                           </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-20 text-center opacity-30">
                       <MessageSquare className="w-16 h-16 mx-auto mb-4" />
                       <p className="font-bold text-sm tracking-widest uppercase">No chats found</p>
                    </div>
                  )}
               </div>
             </>
           )}

           {chatActiveTab === 'stories' && (
              <div className="p-4 grid grid-cols-2 gap-4">
                 {stories.map(s => (
                    <div key={s.id} onClick={() => setActiveStory(s)} className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group shadow-lg">
                       <img src={s.imageUrl || s.authorPhoto} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                       <div className="absolute top-2 left-2 p-0.5 rounded-full ring-2 ring-blue-500 bg-white">
                          <img src={s.authorPhoto} className="w-8 h-8 rounded-full border border-white" />
                       </div>
                       <div className="absolute bottom-2 left-2 text-white text-xs font-bold truncate pr-2">{s.authorName}</div>
                    </div>
                 ))}
                 <button onClick={createStory} className={`aspect-[9/16] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 ${theme === 'dark' ? 'border-[#3E4042] bg-[#3A3B3C]' : 'border-gray-200 bg-gray-50'}`}>
                    <Plus className="w-8 h-8 text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-gray-500">Add Story</span>
                 </button>
              </div>
           )}

           {chatActiveTab === 'alerts' && (
              <div className="p-4 space-y-4">
                 <h2 className="text-sm font-bold uppercase tracking-widest text-[#0084FF] px-2 mb-2">Notifications</h2>
                 {notifications.map(n => (
                    <div key={n.id} className={`p-4 rounded-2xl border flex gap-3 ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-gray-50 border-gray-100'}`}>
                        {n.fromPhoto ? (
                          <img src={n.fromPhoto} className="w-10 h-10 rounded-full flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                             <Bell className="w-5 h-5 text-blue-500" />
                          </div>
                        )}
                        <div>
                           <p className="text-sm font-bold">{n.title}</p>
                           <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                           <p className="text-[10px] text-gray-400 mt-2 font-medium">Just now</p>
                        </div>
                    </div>
                 ))}
                 {notifications.length === 0 && (
                   <div className="py-20 text-center opacity-30">
                      <Bell className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-bold text-sm tracking-widest uppercase">No alerts</p>
                   </div>
                 )}
              </div>
           )}
        </div>

        {/* Messenger Bottom Navigation */}
        <div 
          className={`fixed bottom-0 left-0 right-0 px-6 flex items-center justify-between z-50 border-t ${theme === 'dark' ? 'bg-[#18191A] border-[#3E4042]' : 'bg-white border-gray-100'}`}
          style={{ 
            height: 'calc(80px + env(safe-area-inset-bottom))', 
            paddingBottom: 'env(safe-area-inset-bottom)' 
          }}
        >
           <button onClick={() => setActiveMessengerTab('chats')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${chatActiveTab === 'chats' ? 'text-[#0084FF]' : 'text-gray-400 hover:text-gray-600'}`}>
              <div className="relative">
                 <MessageCircle className={`w-7 h-7 ${chatActiveTab === 'chats' ? 'fill-current' : ''}`} />
                 <span className="absolute -top-1 -right-1 bg-red-600 text-[9px] text-white font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">2</span>
              </div>
              <span className="text-[11px] font-bold">Chats</span>
           </button>
           
           <button onClick={() => setActiveMessengerTab('stories')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${chatActiveTab === 'stories' ? 'text-[#0084FF]' : 'text-gray-400 hover:text-gray-600'}`}>
              <Users className={`w-7 h-7 ${chatActiveTab === 'stories' ? 'fill-current' : ''}`} />
              <span className="text-[11px] font-bold">Stories</span>
           </button>

           <button onClick={() => setActiveMessengerTab('alerts')} className={`flex flex-col items-center gap-1 flex-1 transition-all ${chatActiveTab === 'alerts' ? 'text-[#0084FF]' : 'text-gray-400 hover:text-gray-600'}`}>
              <div className="relative">
                <Bell className={`w-7 h-7 ${chatActiveTab === 'alerts' ? 'fill-current' : ''}`} />
                 <span className="absolute -top-1 -right-1 bg-red-600 text-[9px] text-white font-bold px-1 rounded-full min-w-[16px] h-4 flex items-center justify-center">1</span>
              </div>
              <span className="text-[11px] font-bold">Alerts</span>
           </button>

           <button onClick={() => setCurrentApp('porshi')} className="flex flex-col items-center gap-1 flex-1 text-gray-400 hover:text-gray-600">
              <LogOut className="w-7 h-7" />
              <span className="text-[11px] font-bold">Leave</span>
           </button>
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
        adType: adForm.adType as any,
        videoAdUrl: adForm.videoAdUrl,
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
                      className="w-full bg-bg-dark/5 border border-border-custom rounded-xl p-4 text-xs h-32 focus:border-accent transition-colors outline-none text-foreground font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">বিজ্ঞাপনের ধরণ (Ad Type)</Label>
                      <select 
                        value={adForm.adType}
                        onChange={(e) => setAdForm({...adForm, adType: e.target.value as any})}
                        className="w-full bg-bg-dark/50 border border-border-custom rounded-xl p-3 text-xs outline-none focus:border-accent"
                      >
                        <option value="banner">ব্যানার অ্যাড (Standard)</option>
                        <option value="video_skippable">ভিডিও অ্যাড (Skippable)</option>
                      </select>
                    </div>
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
                  </div>

                  {adForm.adType === 'video_skippable' && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                       <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">ভিডিও বিজ্ঞাপন ফাইল</Label>
                       <div 
                         onClick={selectVideoAd}
                         className={`w-full h-24 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${adForm.videoAdUrl ? 'border-accent bg-accent/5' : 'border-border-custom hover:border-accent/40'}`}
                       >
                          {isUploadingPhoto ? (
                             <Loader2 className="w-6 h-6 animate-spin text-accent" />
                          ) : adForm.videoAdUrl ? (
                             <>
                               <div className="text-accent text-[10px] font-black uppercase">Video Uploaded!</div>
                               <div className="text-[8px] text-text-dim mt-1 truncate max-w-[200px]">{adForm.videoAdUrl}</div>
                             </>
                          ) : (
                             <>
                               <VideoIcon className="w-6 h-6 text-text-dim mb-1" />
                               <span className="text-[8px] uppercase font-bold text-text-dim">ভিডিও আপলোড করুন</span>
                             </>
                          )}
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">লোকেশন (Location)</Label>
                      <Input 
                        placeholder="e.g. Dhaka, Bangladesh" 
                        value={adForm.location}
                        onChange={(e) => setAdForm({...adForm, location: e.target.value})}
                        className="bg-bg-dark/50 border-border-custom text-xs h-12"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[8px] uppercase tracking-widest text-text-dim ml-1">অডিয়েন্স (Audience)</Label>
                      <Input 
                        placeholder="e.g. Students, Tech Lovers" 
                        value={adForm.audience}
                        onChange={(e) => setAdForm({...adForm, audience: e.target.value})}
                        className="bg-bg-dark/50 border-border-custom text-xs h-12"
                      />
                    </div>
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
                        <div className="text-2xl font-black text-foreground">{ad.clicks || 0}</div>
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

  const renderCommentsModal = () => {
    if (!commentingPostId) return null;
    const post = posts.find(p => p.id === commentingPostId);
    
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setCommentingPostId(null)}
        >
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full sm:max-w-lg h-[90vh] sm:h-[80vh] flex flex-col rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-[#242526] text-white' : 'bg-white text-black'}`}
          >
            {/* Header */}
            <div className={`px-4 py-3 flex justify-between items-center border-b ${theme === 'dark' ? 'border-[#3E4042]' : 'border-[#E4E6EB]'}`}>
              <h3 className="font-bold">Comments</h3>
              <button 
                onClick={() => setCommentingPostId(null)}
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {postComments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {comment.authorPhoto ? (
                      <img src={comment.authorPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-full h-full p-1.5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className={`p-3 rounded-2xl inline-block max-w-[90%] ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}>
                      <div className="font-bold text-xs mb-0.5">{comment.authorName}</div>
                      <div className="text-sm whitespace-pre-wrap">{comment.text}</div>
                      {comment.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden max-w-full">
                          <img src={comment.imageUrl} alt="Attached" className="w-full h-auto max-h-60 object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 px-2">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {comment.timestamp?.toDate ? new Date(comment.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                      </span>
                      
                      {/* Comment Reaction System */}
                      <div className="flex items-center gap-1">
                        {['❤️', '😆', '😡', '👍'].map(emoji => (
                          <button 
                            key={emoji}
                            onClick={() => withAuth(() => reactToComment(comment.id, emoji))}
                            className={`text-xs p-1 rounded-full transition-transform hover:scale-125 ${comment.reactions?.[emoji] ? 'bg-accent/20' : ''}`}
                          >
                            {emoji} <span className="text-[9px] font-bold">{comment.reactions?.[emoji] || ''}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {postComments.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 opacity-30">
                  <MessageCircle className="w-10 h-10 mb-2" />
                  <p className="text-sm font-bold uppercase tracking-widest">No comments yet</p>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className={`p-4 border-t ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'}`}>
              {commentImage && (
                <div className="relative inline-block mb-2 group">
                  <img src={commentImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border border-border-custom" />
                  <button 
                    onClick={() => setCommentImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <form onSubmit={submitComment} className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={commentMediaInputRef} 
                  className="hidden" 
                  onChange={handleCommentMediaChange}
                />
                <button 
                  type="button"
                  onClick={() => commentMediaInputRef.current?.click()}
                  className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5 text-[#45BD62]'}`}
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
                <div className={`flex-1 flex items-center rounded-full px-4 h-10 ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}>
                  <input 
                    placeholder="Write a comment..." 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-full"
                  />
                  <button type="button" className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5 text-[#F7B928]'}`}>
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={isUploadingCommentMedia || (!commentInput.trim() && !commentImage)}
                  className={`p-2 rounded-full transition-all ${commentInput.trim() || commentImage ? 'text-[#1877F2] hover:bg-blue-500/10' : 'text-gray-400 opacity-50'}`}
                >
                  {isUploadingCommentMedia ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
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
                setPostYoutubeUrl('');
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

             <div className="mt-2 space-y-3">
               <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest bg-accent/5 p-2 rounded-lg border border-accent/10">
                 <LinkIcon className="w-3 h-3" />
                 <span>লিংক বা ভিডিও যোগ করুন (ঐচ্ছিক)</span>
               </div>
               <Input 
                 placeholder="লিংক বা ইউটিউব লিংক এখানে দিন..."
                 value={postYoutubeUrl}
                 onChange={(e) => setPostYoutubeUrl(e.target.value)}
                 className="bg-gray-50 dark:bg-[#3A3B3C] border-none text-xs h-10 rounded-xl focus:ring-1 focus:ring-accent transition-all"
               />
             </div>

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
                      <h4 className={`text-base font-black uppercase tracking-tighter ${!n.isRead ? 'text-accent' : 'text-foreground'}`}>{n.title}</h4>
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
            <Button variant="ghost" onClick={() => setActiveTab('home')} className="w-full text-text-dim text-[10px] uppercase font-bold hover:text-accent transition-colors">হোমে ফিরে যান</Button>
          </CardContent>
          <CardFooter className="justify-center border-t border-border-custom/30 py-4 opacity-30">
            <div className="text-[8px] font-black uppercase tracking-[4px]">PORSH PROTECTED</div>
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
          <div className="text-[10px] text-accent font-bold uppercase tracking-[4px]">Porsh Team</div>
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
                <div 
                  onClick={() => withAuth(() => navigateToProfile(user?.uid || ''))}
                  className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-surface cursor-pointer"
                >
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
                   onClick={() => withAuth(() => {
                     setEditingPost(null);
                     setPostInput('');
                     setPostPrivacy('public');
                     setIsPostCreationModalOpen(true);
                     setTimeout(() => selectPostImage(), 300);
                   })}
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
                  onClick={() => withAuth(() => setActiveStory(story))}
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
                    <p className="text-foreground text-[10px] font-bold leading-tight truncate">{story.authorName}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Reels Section (Facebook Style) */}
            {posts.filter(p => p.isReel).length > 0 && (
              <div className={`py-4 px-3 mb-2 ${theme === 'dark' ? 'bg-[#242526]' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-5 h-5 text-[#1877F2]" />
                    <h3 className="text-sm font-bold uppercase tracking-tight">Reels and short videos</h3>
                  </div>
                  <button className="text-[#1877F2] text-xs font-bold hover:underline">See all</button>
                </div>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {posts.filter(p => p.isReel).slice(0, 10).map((reel) => (
                    <motion.div 
                      key={reel.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => withAuth(() => setActiveReel(reel))}
                      className="relative flex-shrink-0 w-[120px] aspect-reel rounded-xl overflow-hidden cursor-pointer group shadow-lg"
                    >
                      <video 
                        src={reel.videoUrl} 
                        className="w-full h-full object-cover" 
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                        muted
                        loop
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                           <Eye className="w-3 h-3 text-white" />
                           <span className="text-white text-[10px] font-bold">{reel.viewsCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                           <div className="w-4 h-4 rounded-full overflow-hidden border border-white/50 flex-shrink-0">
                              <img src={reel.authorPhoto} alt="" className="w-full h-full object-cover" />
                           </div>
                           <span className="text-white text-[8px] font-bold truncate">{reel.authorName}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Feed Section */}
            <div className="space-y-2">
              {posts.filter(p => homeFeedTab === 'all' || (user && followingUids.includes(p.authorUid)) || p.authorUid === user?.uid).map((post) => (
                <PostCard 
                  key={post.id}
                  post={post}
                  ads={ads}
                  theme={theme}
                  usersRegistry={usersRegistry}
                  onLike={() => withAuth(() => likePost(post.id))}
                  onReact={(type) => withAuth(() => reactToPost(post.id, type))}
                  onComment={() => withAuth(() => setCommentingPostId(post.id))}
                  onFollow={() => withAuth(() => followUser(post.authorUid))}
                  onUnfollow={() => withAuth(() => unfollowUser(post.authorUid))}
                  onShare={(p) => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Porshi Post',
                        text: p.content,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      setErrorMessage('Sharing to timeline...');
                      // Internal sharing logic: create new post with same content
                      withAuth(async () => {
                        try {
                          await addDoc(collection(db, 'posts'), {
                            authorUid: user!.uid,
                            authorName: user!.displayName,
                            authorPhoto: user!.photoURL,
                            content: `[Shared Post]: ${p.content}`,
                            mediaType: p.imageUrl ? 'image' : 'text',
                            imageUrl: p.imageUrl || null,
                            timestamp: serverTimestamp(),
                            likesCount: 0,
                            commentsCount: 0,
                            reactions: {}
                          });
                          setErrorMessage('Shared to your timeline!');
                        } catch (err) {
                          setErrorMessage('Failed to share.');
                        }
                      });
                    }
                  }}
                  onEdit={(p) => { 
                    setEditingPost(p); 
                    setPostInput(p.content); 
                    setPostYoutubeUrl(p.youtubeUrl || '');
                    setPostPrivacy(p.privacy || 'public');
                    setIsPostCreationModalOpen(true); 
                  }}
                  onDelete={deletePost}
                  onUserClick={navigateToProfile}
                  isFollowing={user ? followingUids.includes(post.authorUid) : false}
                  currentUserId={user?.uid}
                  autoplayVideos={user ? (user.autoplayVideos ?? true) : true}
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
          <div className="flex-1 h-full flex flex-col lg:flex-row overflow-hidden bg-bg-dark">
            {/* Navigation Drawer / Sidebar */}
            <div className="lg:w-72 bg-surface/50 backdrop-blur-xl border-r border-border-custom flex flex-col p-6 space-y-10 overflow-y-auto no-scrollbar flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black italic tracking-tighter text-accent uppercase">ADMIN</h1>
                  <p className="text-[8px] text-text-dim uppercase tracking-[3px]">পড়শি অ্যাপ কন্ট্রোল সিস্টেম</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setActiveTab('home')} className="lg:hidden text-accent h-10 w-10">
                   <ArrowLeft className="w-6 h-6" />
                </Button>
              </div>

              <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                {[
                  { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
                  { id: 'ads', name: 'অ্যাড ম্যানেজার', icon: Megaphone },
                  { id: 'users', name: 'ইউজার লিস্ট', icon: Users },
                  { id: 'monetization', name: 'রোজগার', icon: DollarSign },
                  { id: 'notifs', name: 'নটিফিকেশন', icon: Bell },
                  { id: 'settings', name: 'অ্যাপ সেটিংস', icon: Settings2 },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setAdminActiveTab(item.id)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all whitespace-nowrap lg:min-w-0 ${adminActiveTab === item.id ? 'bg-accent text-white font-black shadow-[0_4px_20px_rgba(0,209,255,0.4)] scale-[1.02]' : 'text-text-dim hover:text-accent hover:bg-accent/5'}`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-border-custom/20 hidden lg:block">
                <Button variant="ghost" onClick={() => setActiveTab('home')} className="w-full flex justify-start items-center gap-4 text-text-dim hover:text-accent font-black uppercase text-[10px] tracking-widest">
                  <ArrowLeft className="w-5 h-5" /> Exit Dashboard
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 relative bg-bg-dark">
              <div className="max-w-5xl mx-auto pb-24">
                <AnimatePresence mode="wait">
                  {adminActiveTab === 'overview' && (
                    <motion.div 
                      key="overview"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="geometric-card p-8 space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                           <Activity className="w-4 h-4" /> অ্যাপ স্ট্যাটিস্টিকস
                        </h2>
                        
                        {/* Quick Navigation Buttons */}
                        <div className="grid grid-cols-3 gap-3">
                          <button 
                            onClick={() => setAdminActiveTab('ads')}
                            className="flex flex-col items-center justify-center p-4 bg-accent/10 border border-accent/30 rounded-2xl group hover:bg-accent hover:text-bg-dark transition-all cursor-pointer"
                          >
                             <Target className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                             <span className="text-[10px] font-black uppercase">Ads</span>
                          </button>
                          <button 
                            onClick={() => setAdminActiveTab('users')}
                            className="flex flex-col items-center justify-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl group hover:bg-yellow-500 hover:text-bg-dark transition-all cursor-pointer"
                          >
                             <Users className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                             <span className="text-[10px] font-black uppercase">Users</span>
                          </button>
                          <button 
                            onClick={() => setAdminActiveTab('monetization')}
                            className="flex flex-col items-center justify-center p-4 bg-green-500/10 border border-green-500/30 rounded-2xl group hover:bg-green-500 hover:text-bg-dark transition-all cursor-pointer"
                          >
                             <DollarSign className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                             <span className="text-[10px] font-black uppercase">Pay</span>
                          </button>
                        </div>

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
                            id="maintenance-mode-toggle-admin"
                            onClick={handleToggleMaintenance}
                            className={`w-14 h-8 rounded-full transition-all relative cursor-pointer z-10 ${appConfig?.maintenanceMode ? 'bg-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.5)]' : 'bg-surface-light border border-border-custom'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${appConfig?.maintenanceMode ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[8px] uppercase text-text-dim ml-1">Welcome Message</label>
                            <Input 
                              defaultValue={appConfig?.welcomeMessage || ''} 
                              onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { welcomeMessage: e.target.value })}
                              className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] uppercase text-text-dim ml-1">App Version</label>
                            <Input 
                              defaultValue={appConfig?.appVersion || '1.0.0'} 
                              onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { appVersion: e.target.value })}
                              className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                            />
                          </div>
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
                             <label className="text-[8px] uppercase text-text-dim ml-1">Contact Email</label>
                             <Input 
                               defaultValue={appConfig?.contactEmail || ''} 
                               onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { contactEmail: e.target.value })}
                               className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                             />
                           </div>
                           <div className="space-y-2">
                             <label className="text-[8px] uppercase text-text-dim ml-1">Support Phone</label>
                             <Input 
                               defaultValue={appConfig?.themeColor || ''} 
                               placeholder="e.g. 017..."
                               onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { themeColor: e.target.value })}
                               className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                             />
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="geometric-card p-8 space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                          <Megaphone className="w-4 h-4" /> গেটওয়ে ও পেমেন্ট সেটিংস
                        </h2>
                        <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-bg-dark/50 rounded-xl border border-border-custom">
                            <div>
                              <div className="text-sm font-bold uppercase">Paid Ad Mode</div>
                              <div className="text-[8px] text-text-dim uppercase">পেমেন্ট বাধ্যতামূলক করা</div>
                            </div>
                            <button 
                              id="paid-mode-toggle-admin-2"
                              onClick={handleTogglePaidMode}
                              className={`w-14 h-8 rounded-full transition-all relative cursor-pointer z-10 ${appConfig?.adPaidMode ? 'bg-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.5)]' : 'bg-surface-light border border-border-custom'}`}
                            >
                              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${appConfig?.adPaidMode ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[8px] uppercase text-text-dim ml-1">Bkash/Nagad Number</label>
                            <Input 
                              defaultValue={appConfig?.adPaymentNumber} 
                              onBlur={(e) => handleUpdateAdNumber(e.target.value)}
                              className="bg-bg-dark/50 border-border-custom text-xs h-12 text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="geometric-card p-8 space-y-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" /> মিডিয়া স্টোরেজ (Ultimate Mode)
                        </h2>
                        <div className="space-y-4">
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
                            <Label className="text-[8px] uppercase tracking-widest text-text-dim">Upload Preset</Label>
                            <Input 
                              placeholder="e.g. ml_default" 
                              defaultValue={appConfig?.cloudinaryUploadPreset || ''}
                              onBlur={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { cloudinaryUploadPreset: e.target.value })}
                              className="bg-bg-dark/50 border-border-custom text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

                  {adminActiveTab === 'ads' && (
                    <motion.div 
                      key="ads"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="geometric-card p-8 space-y-6">
                      <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                        <Target className="w-4 h-4" /> পেন্ডিং ও সচল বিজ্ঞাপন
                      </h2>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-4 bg-bg-dark rounded-xl border border-border-custom">
                          <div className="text-[8px] text-text-dim uppercase font-bold">সচল ভিডিও অ্যাডস</div>
                          <div className="text-xl font-black text-green-500">{allAds.filter(a => a.status === 'active' && a.adType === 'video_skippable').length}</div>
                        </div>
                        <div className="p-4 bg-bg-dark rounded-xl border border-border-custom">
                          <div className="text-[8px] text-text-dim uppercase font-bold">মোট ব্যানার</div>
                          <div className="text-xl font-black text-accent">{allAds.filter(a => a.status === 'active' && a.adType !== 'video_skippable').length}</div>
                        </div>
                      </div>
                      <Tabs defaultValue="pending_ads_list" className="w-full">
                        <TabsList className="bg-bg-dark border border-border-custom w-full">
                          <TabsTrigger value="pending_ads_list" className="flex-1 uppercase text-[8px] font-black tracking-widest">পেন্ডিং</TabsTrigger>
                          <TabsTrigger value="active_ads_list" className="flex-1 uppercase text-[8px] font-black tracking-widest">সচল</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pending_ads_list" className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {allAds.filter(ad => ad.status === 'pending').map(ad => (
                            <div key={ad.id} className="p-4 bg-bg-dark/50 rounded-xl border border-border-custom space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-xs font-bold uppercase text-white flex items-center gap-2">
                                    {ad.title}
                                    {ad.adType === 'video_skippable' && <VideoIcon className="w-3 h-3 text-accent" />}
                                  </div>
                                  <div className="text-[8px] text-text-dim uppercase">Advertiser: {ad.advertiserName}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-black text-accent">৳{ad.budget}</div>
                                  <div className="text-[8px] text-text-dim uppercase">{ad.durationDays} Days</div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => updateDoc(doc(db, 'ads', ad.id), { status: 'active', paymentStatus: 'paid' })}
                                  className="flex-1 bg-green-500 text-bg-dark font-black uppercase text-[8px]"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => deleteDoc(doc(db, 'ads', ad.id))}
                                  className="flex-1 bg-red-500/10 text-red-500 font-black uppercase text-[8px]"
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                        <TabsContent value="active_ads_list" className="mt-4 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                           {allAds.filter(ad => ad.status === 'active').map(ad => (
                             <div key={ad.id} className="p-4 bg-bg-dark/50 rounded-xl border border-border-custom flex justify-between items-center group">
                               <div>
                                 <div className="text-xs font-bold uppercase text-white flex items-center gap-2">
                                   {ad.title}
                                   {ad.adType === 'video_skippable' && <VideoIcon className="w-3 h-3 text-accent animate-pulse" />}
                                 </div>
                                 <div className="text-[8px] text-text-dim uppercase">Clicks: {ad.clicks || 0} | Reach: {ad.reach || 0}</div>
                               </div>
                               <Button variant="ghost" size="sm" onClick={() => updateDoc(doc(db, 'ads', ad.id), { status: 'paused' })} className="text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity">Pause</Button>
                             </div>
                           ))}
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="geometric-card p-8 space-y-6">
                       <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                         <Zap className="w-4 h-4" /> সিস্টেম ইন-স্ট্রিম অ্যাডস (Admin System Ads)
                       </h2>
                       <div className="p-4 bg-bg-dark/50 rounded-2xl border border-border-custom space-y-4">
                          <div className="space-y-3">
                             <Input 
                               placeholder="অ্যাড টাইটেল (Title)" 
                               value={adForm.title}
                               onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                               className="bg-bg-dark border-border-custom text-white text-xs h-10"
                             />
                             <textarea 
                               placeholder="অ্যাড ডিসক্রিপশন (Short Description)"
                               value={adForm.description}
                               onChange={(e) => setAdForm(prev => ({ ...prev, description: e.target.value }))}
                               className="w-full bg-bg-dark border border-border-custom rounded-xl p-3 text-xs h-20 outline-none text-white font-sans"
                             />
                             <Input 
                               placeholder="লিংক/ইউআরএল (Action URL)" 
                               value={adForm.websiteUrl}
                               onChange={(e) => setAdForm(prev => ({ ...prev, websiteUrl: e.target.value }))}
                               className="bg-bg-dark border-border-custom text-white text-xs h-10"
                             />

                             <div className="space-y-2 pt-2">
                               <Label className="text-[8px] uppercase font-black text-yellow-500 ml-1">Banners: AdSense / Script Code</Label>
                               <textarea 
                                 placeholder="<ins class='adsbygoogle' ...></ins>"
                                 value={adForm.adCode}
                                 onChange={(e) => setAdForm(prev => ({ ...prev, adCode: e.target.value }))}
                                 className="w-full bg-bg-dark border border-border-custom rounded-xl p-3 text-[10px] font-mono h-24 outline-none text-white focus:border-yellow-500 transition-colors"
                               />
                             </div>
                             
                             <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <Label className="text-[8px] uppercase font-black text-accent ml-1">Advanced: VAST Configuration</Label>
                                  <Input 
                                    placeholder="VAST XML URL (e.g. Google IMA)" 
                                    value={adForm.vastUrl}
                                    onChange={(e) => setAdForm(prev => ({ ...prev, vastUrl: e.target.value }))}
                                    className="bg-bg-dark border-border-custom text-white text-xs h-10"
                                  />
                                  <select 
                                    value={adForm.vastType}
                                    onChange={(e) => setAdForm(prev => ({ ...prev, vastType: e.target.value as any }))}
                                    className="w-full bg-bg-dark border border-border-custom rounded-xl px-4 text-xs h-10 text-white outline-none"
                                  >
                                    <option value="pre-roll">Pre-roll (ভিডিও শুরুর আগে)</option>
                                    <option value="mid-roll">Mid-roll (ভিডিওর মাঝে)</option>
                                    <option value="post-roll">Post-roll (ভিডিও শেষে)</option>
                                  </select>
                                </div>

                                <div className="space-y-2">
                                   <Label className="text-[8px] uppercase font-black text-text-dim ml-1">অথবা লোকাল ভিডিও আপলোড (Direct File)</Label>
                                   <div 
                                     onClick={selectVideoAd}
                                     className="w-full aspect-video rounded-xl border-2 border-dashed border-border-custom bg-bg-dark flex flex-col items-center justify-center cursor-pointer hover:border-accent group"
                                   >
                                     {adForm.videoAdUrl ? (
                                       <video src={adForm.videoAdUrl} className="w-full h-full object-contain rounded-lg" />
                                     ) : (
                                       <>
                                         {isUploadingPhoto ? <Loader2 className="w-6 h-6 animate-spin text-accent" /> : <VideoIcon className="w-8 h-8 text-text-dim group-hover:text-accent" />}
                                         <span className="text-[8px] uppercase font-black text-text-dim mt-2 tracking-widest">ভিডিও আপলোড করুন (এমপি৪)</span>
                                       </>
                                     )}
                                   </div>
                                </div>
                             </div>

                             <Button 
                               onClick={handleCreateAdminAd}
                               disabled={isCreatingAd}
                               className="w-full h-11 bg-accent text-bg-dark font-black uppercase tracking-widest text-[10px] shadow-[0_4px_15px_rgba(0,209,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                             >
                               {isCreatingAd ? <Loader2 className="w-4 h-4 animate-spin" /> : 'সিস্টেম ভিডিও অ্যাড লাইভ করুন'}
                             </Button>
                          </div>
                       </div>
                       
                       <div className="space-y-3 mt-6">
                          <h3 className="text-[8px] uppercase font-black text-accent tracking-widest">সক্রিয় সিস্টেম অ্যাডস</h3>
                          {allAds.filter(a => a.isAdminAd && a.status === 'active').map(ad => (
                             <div key={ad.id} className="p-3 bg-bg-dark/80 rounded-xl border border-border-custom flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center overflow-hidden">
                                      {ad.vastUrl ? (
                                        <Zap className="w-5 h-5 text-accent" />
                                      ) : ad.adCode ? (
                                        <Globe className="w-5 h-5 text-yellow-500" />
                                      ) : (
                                        <video src={ad.videoAdUrl || ad.videoUrl} className="w-full h-full object-cover" />
                                      )}
                                   </div>
                                   <div>
                                      <div className="text-[10px] font-black uppercase flex items-center gap-2">
                                        {ad.title}
                                        {ad.adCode && <span className="bg-yellow-500/20 text-yellow-500 px-1 rounded text-[6px]">ADSENSE</span>}
                                        {ad.vastUrl && <span className="bg-accent/20 text-accent px-1 rounded text-[6px] uppercase">{ad.vastType}</span>}
                                      </div>
                                      <div className="text-[8px] text-text-dim uppercase">Reach: {ad.reach || 0} | Clicks: {ad.clicks || 0}</div>
                                   </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => deleteDoc(doc(db, 'ads', ad.id))}
                                  className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity uppercase text-[8px] font-black"
                                >
                                  Remove
                                </Button>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}

                  {adminActiveTab === 'monetization' && (
                    <motion.div 
                      key="monetization"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="geometric-card p-6 bg-accent/5 border-accent/20">
                           <Eye className="w-5 h-5 text-accent mb-2" />
                           <div className="text-3xl font-black">{posts.reduce((acc, p) => acc + (p.viewsCount || 0), 0)}</div>
                           <div className="text-[8px] uppercase font-bold text-text-dim tracking-widest">মোট কন্টেন্ট ভিউ</div>
                        </div>
                        <div className="geometric-card p-6 bg-green-500/5 border-green-500/20">
                           <Activity className="w-5 h-5 text-green-500 mb-2" />
                           <div className="text-3xl font-black">{posts.reduce((acc, p) => acc + (p.reachCount || 0), 0)}</div>
                           <div className="text-[8px] uppercase font-bold text-text-dim tracking-widest">মোট কন্টেন্ট রিচ</div>
                        </div>
                        <div className="geometric-card p-6 bg-yellow-500/5 border-yellow-500/20">
                           <Zap className="w-5 h-5 text-yellow-500 mb-2" />
                           <div className="text-3xl font-black">{allUsers.filter(u => u.isMonetized).length}</div>
                           <div className="text-[8px] uppercase font-bold text-text-dim tracking-widest">মনিটাইজড ক্রিয়েটর</div>
                        </div>
                     </div>

                     <div className="geometric-card p-8">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-accent mb-6 flex items-center gap-2">
                           <Play className="w-4 h-4" /> মনিটাইজড কন্টেন্ট পারফরম্যান্স (Real-time)
                        </h2>
                        <div className="space-y-4">
                           {posts.filter(p => p.isMonetized).map(p => (
                              <div key={p.id} className="p-4 bg-bg-dark/40 rounded-2xl border border-border-custom/50 flex flex-col md:flex-row gap-6 hover:border-accent/40 transition-all">
                                 <div className="w-full md:w-32 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface">
                                    {p.mediaType === 'video' ? (
                                       <div className="w-full h-full relative">
                                          <video src={p.videoUrl} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Play className="w-6 h-6 text-white" /></div>
                                       </div>
                                    ) : (
                                       <img src={p.imageUrl} className="w-full h-full object-cover" />
                                    )}
                                 </div>
                                 <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-bold text-accent uppercase">Creator: {p.authorName}</span>
                                       <span className="text-[8px] text-text-dim uppercase">• {p.timestamp?.toDate().toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white line-clamp-1">{p.content}</h4>
                                    <div className="flex gap-4">
                                       <div className="flex items-center gap-1">
                                          <Eye className="w-3 h-3 text-accent" />
                                          <span className="text-sm font-black">{p.viewsCount || 0}</span>
                                          <span className="text-[8px] text-text-dim uppercase font-bold ml-1">Views</span>
                                       </div>
                                       <div className="flex items-center gap-1">
                                          <Activity className="w-3 h-3 text-green-400" />
                                          <span className="text-sm font-black">{p.reachCount || 0}</span>
                                          <span className="text-[8px] text-text-dim uppercase font-bold ml-1">Reach</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 md:border-l border-border-custom/30 md:pl-6">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => handleUpdateUserMonetization(allUsers.find(u => u.uid === p.authorUid))}
                                      className="border-red-500/20 text-red-500 text-[8px] font-black uppercase hover:bg-red-500/10"
                                    >
                                      Disable Monetization
                                    </Button>
                                 </div>
                              </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                  {adminActiveTab === 'users' && (
                    <motion.div 
                      key="users"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="geometric-card p-8 space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                      <Users className="w-4 h-4" /> ইউজার ম্যানেজমেন্ট
                    </h2>
                    <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
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
                            <button 
                              onClick={() => handleUpdateUserMonetization(u)}
                              className={`p-2 rounded-lg transition-all cursor-pointer ${u.isMonetized ? 'bg-[#00D1FF] text-bg-dark' : 'bg-surface-light text-text-dim hover:text-accent'}`}
                              title="Toggle Monetization"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                      </div>
                    </motion.div>
                  )}

                  {adminActiveTab === 'notifs' && (
                    <motion.div 
                      key="notifs"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-8"
                    >
                      <div className="max-w-2xl mx-auto geometric-card p-8 space-y-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                      <Bell className="w-4 h-4" /> সিস্টেম নটিফিকেশন ম্যানেজার
                    </h2>
                    <div className="space-y-4">
                      <div className="flex bg-bg-dark/50 p-1 rounded-xl border border-border-custom">
                        <button 
                          onClick={() => setIsAdminNoticeAll(false)}
                          className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${!isAdminNoticeAll ? 'bg-accent text-bg-dark font-black' : 'text-text-dim hover:text-white'}`}
                        >
                          সিঙ্গেল ইউজার
                        </button>
                        <button 
                          onClick={() => setIsAdminNoticeAll(true)}
                          className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-lg transition-all ${isAdminNoticeAll ? 'bg-accent text-bg-dark font-black shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'text-text-dim hover:text-white'}`}
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
                            className="w-full h-12 bg-bg-dark/50 border border-border-custom rounded-xl px-4 text-xs text-white focus:border-accent outline-none font-black"
                          >
                            <option value="" className="bg-bg-dark">সিলেক্ট ইউজার</option>
                            {allUsers.map(u => (
                              <option key={u.uid || u.id} value={u.uid || u.id} className="bg-bg-dark">{u.displayName} ({u.role || 'user'})</option>
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
                            className="w-full h-12 bg-bg-dark/50 border border-border-custom rounded-xl px-4 text-xs text-white focus:border-accent outline-none font-black"
                          >
                            <option value="system" className="bg-bg-dark">সিস্টেম বার্তা</option>
                            <option value="link" className="bg-bg-dark">লিংক/ইউআরএল</option>
                            <option value="event" className="bg-bg-dark">ইভেন্ট/অফার</option>
                            <option value="message" className="bg-bg-dark">ব্যক্তিগত মেসেজ</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] uppercase text-text-dim ml-1">টাইটেল (Title)</label>
                          <Input 
                            value={adminNoticeTitle}
                            onChange={(e) => setAdminNoticeTitle(e.target.value)}
                            placeholder="যেমন: নতুন আপডেট"
                            className="bg-bg-dark/50 border-border-custom text-white font-black"
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
                          className="bg-bg-dark/50 border-border-custom text-white font-black"
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
                    </motion.div>
                  )}

                  {adminActiveTab === 'settings' && (
                    <motion.div 
                      key="settings"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="space-y-8"
                    >
                      <div className="geometric-card p-4 lg:p-8 space-y-8">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                             <Settings2 className="w-5 h-5" /> PWA & SYSTEM SETTINGS
                          </h2>
                          <Button 
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'appConfig', 'remote-settings'), appConfig || {});
                                setAuthSuccessMessage('Settings updated successfully!');
                              } catch (e: any) {
                                setErrorMessage('Update failed: ' + e.message);
                              }
                            }}
                            className="bg-accent text-bg-dark font-black px-8 rounded-xl shadow-lg shadow-accent/20"
                          >
                             SAVE CHANGES
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {/* PWA & Visuals */}
                           <div className="space-y-6">
                              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-white/5 pb-2">PWA & Visuals</h3>
                              
                              <div className="space-y-3">
                                 <label className="text-[9px] uppercase font-bold text-accent ml-1">App Icon URL</label>
                                 <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 rounded-2xl bg-bg-dark border border-border-custom flex items-center justify-center overflow-hidden flex-shrink-0">
                                       <img src={appConfig?.appIcon || '/porsh-pwa-icon.png'} className="w-10 h-10 object-contain" alt="" />
                                    </div>
                                    <Input 
                                       value={appConfig?.appIcon || ''}
                                       onChange={(e) => setAppConfig(prev => prev ? { ...prev, appIcon: e.target.value } : null)}
                                       placeholder="Paste image URL (e.g., Cloudinary)"
                                       className="bg-bg-dark/50 border-border-custom font-bold text-xs"
                                    />
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[9px] uppercase font-bold text-accent ml-1">App Name</label>
                                    <Input 
                                       value={appConfig?.appName || 'Porsh'}
                                       onChange={(e) => setAppConfig(prev => prev ? { ...prev, appName: e.target.value } : null)}
                                       className="bg-bg-dark/50 border-border-custom font-bold text-xs"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[9px] uppercase font-bold text-accent ml-1">Theme Color (Hex)</label>
                                    <div className="flex gap-2">
                                       <div className="w-10 h-10 rounded-xl border border-border-custom flex-shrink-0" style={{ backgroundColor: appConfig?.pwaThemeColor || '#0084FF' }} />
                                       <Input 
                                          value={appConfig?.pwaThemeColor || '#0084FF'}
                                          onChange={(e) => setAppConfig(prev => prev ? { ...prev, pwaThemeColor: e.target.value } : null)}
                                          className="bg-bg-dark/50 border-border-custom font-bold text-xs"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Feature Management */}
                           <div className="space-y-6">
                              <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-white/5 pb-2">Feature Management</h3>
                              
                              <div className="grid grid-cols-1 gap-3">
                                 {[
                                    { id: 'enableChat', label: 'Real-time Messaging', icon: MessageCircle },
                                    { id: 'enableFeed', label: 'Discovery Feed', icon: Search },
                                    { id: 'enableStories', label: '24h Stories', icon: PlayCircle },
                                    { id: 'enableAds', label: 'Ad Monetization System', icon: Megaphone },
                                    { id: 'maintenanceMode', label: 'Maintenance Mode', icon: AlertCircle },
                                 ].map(feat => (
                                    <div key={feat.id} className="p-4 bg-bg-dark/50 rounded-2xl border border-white/5 flex items-center justify-between group">
                                       <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                             <feat.icon className="w-5 h-5 text-accent" />
                                          </div>
                                          <div>
                                             <div className="text-[10px] font-black uppercase tracking-widest">{feat.label}</div>
                                             <div className="text-[8px] text-text-dim uppercase font-bold">{((appConfig as any)?.[feat.id] ?? true) ? 'Active' : 'Disabled'}</div>
                                          </div>
                                       </div>
                                       <button 
                                          onClick={() => setAppConfig(prev => prev ? { ...prev, [feat.id]: !(prev as any)[feat.id] } : null)}
                                          className={`w-12 h-6 rounded-full transition-all relative ${((appConfig as any)?.[feat.id] ?? true) ? 'bg-accent shadow-[0_0_15px_rgba(0,209,255,0.4)]' : 'bg-white/10'}`}
                                       >
                                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${((appConfig as any)?.[feat.id] ?? true) ? 'right-1' : 'left-1'}`} />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Additional Config */}
                        <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] uppercase font-bold text-accent ml-1">Cloudinary Cloud Name</label>
                              <Input 
                                 value={appConfig?.cloudinaryCloudName || ''}
                                 onChange={(e) => setAppConfig(prev => prev ? { ...prev, cloudinaryCloudName: e.target.value } : null)}
                                 className="bg-bg-dark/50 border-border-custom font-bold text-xs"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] uppercase font-bold text-accent ml-1">Cloudinary Preset</label>
                              <Input 
                                 value={appConfig?.cloudinaryUploadPreset || ''}
                                 onChange={(e) => setAppConfig(prev => prev ? { ...prev, cloudinaryUploadPreset: e.target.value } : null)}
                                 className="bg-bg-dark/50 border-border-custom font-bold text-xs"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] uppercase font-bold text-accent ml-1">Contact Email</label>
                              <Input 
                                 value={appConfig?.contactEmail || ''}
                                 onChange={(e) => setAppConfig(prev => prev ? { ...prev, contactEmail: e.target.value } : null)}
                                 className="bg-bg-dark/50 border-border-custom font-bold text-xs"
                              />
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                 <h2 className="text-2xl font-black tracking-tighter uppercase">Reels Explorer</h2>
               </div>
               <div className="mb-6">
                 <button 
                   onClick={() => withAuth(() => setIsPostCreationModalOpen(true))}
                   className="w-full py-4 rounded-2xl bg-[#1877F2] text-white font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#166FE5] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   <Plus className="w-5 h-5" /> রিল ভিডিও আপলোড করুন
                 </button>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4 pb-20">
                  {posts.filter(p => p.isReel).length > 0 ? (
                    posts.filter(p => p.isReel).map((post) => (
                       <motion.div 
                         key={post.id}
                         whileHover={{ scale: 1.02 }}
                         whileTap={{ scale: 0.98 }}
                         onClick={() => withAuth(() => setActiveReel(post))}
                         className="relative aspect-reel rounded-2xl overflow-hidden cursor-pointer bg-black group shadow-xl border border-white/5"
                       >
                          <video 
                             src={post.videoUrl} 
                             className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" 
                             muted
                             onMouseOver={e => e.currentTarget.play()}
                             onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent flex flex-col justify-end p-4">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 shadow-sm">
                                   {usersRegistry[post.authorUid]?.photoURL || post.authorPhoto ? (
                                      <img src={usersRegistry[post.authorUid]?.photoURL || post.authorPhoto} className="w-full h-full object-cover" />
                                   ) : (
                                      <UserIcon className="w-full h-full p-1 text-white bg-gray-600" />
                                   )}
                                </div>
                                <span className="text-[11px] font-bold text-white truncate shadow-sm">
                                   {usersRegistry[post.authorUid]?.displayName || post.authorName}
                                </span>
                             </div>
                             <div className="flex items-center gap-4 text-white/90 text-[11px] font-bold">
                                <div className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 fill-accent text-accent" /> {post.likesCount || 0}</div>
                                <div className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount || 0}</div>
                             </div>
                          </div>
                       </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-30 text-center">
                       <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-8 border border-accent/20">
                         <PlayCircle className="w-12 h-12 text-accent" />
                       </div>
                       <p className="font-black uppercase tracking-[0.4em] text-sm mb-3">No Reels available</p>
                       <p className="text-[10px] opacity-70 font-bold max-w-xs mx-auto">Upload vertical videos to showcase them here as Reels automatically.</p>
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        );
      case 'market':
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
            <p className="text-xs text-text-dim text-center max-w-xs">Create and manage your professional pages on PORSH.</p>
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
              {/* Profile Cover & Header Section (Facebook Style) */}
              <div className="bg-white dark:bg-[#242526] shadow-sm overflow-hidden">
                {/* Cover Photo */}
                <div className="relative aspect-[16/6] md:aspect-[16/5] bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 group">
                  {isUploadingCover && profileUid === user?.uid ? (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
                      <Loader2 className="w-8 h-8 text-[#1877F2] animate-spin" />
                    </div>
                  ) : profileUser?.coverPhotoURL ? (
                    <img src={profileUser?.coverPhotoURL} alt="Cover" className="w-full h-full object-cover" />
                  ) : null}
                  
                  {profileUid === user?.uid && (
                    <button 
                      onClick={() => coverImageInputRef.current?.click()}
                      className="absolute bottom-4 right-4 z-20 px-3 py-2 bg-white dark:bg-[#3A3B3C] rounded-md shadow-md flex items-center gap-2 text-xs font-bold hover:bg-gray-100 dark:hover:bg-[#4E4F50] transition-colors"
                    >
                      <CameraIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit Cover Photo</span>
                    </button>
                  )}
                  {selectedUserUid && (
                    <button 
                      onClick={() => setSelectedUserUid(null)}
                      className="absolute top-4 left-4 z-20 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition-colors sm:hidden"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Profile Info Overlay Panel */}
                <div className="px-4 pb-4">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-16 md:-mt-20 relative z-10">
                    <div className="relative group">
                      <div className="w-40 h-40 md:w-44 md:h-44 rounded-full bg-[#F0F2F5] dark:bg-[#18191A] border-4 border-white dark:border-[#242526] overflow-hidden shadow-lg">
                        {isUploadingPhoto && profileUid === user?.uid ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/5">
                            <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
                          </div>
                        ) : profileUser?.photoURL ? (
                          <img src={profileUser?.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#3A3B3C] text-gray-400">
                             <UserIcon className="w-20 h-20" />
                          </div>
                        )}
                      </div>
                      {profileUid === user?.uid && (
                        <button 
                          onClick={handleProfilePictureClick} 
                          className="absolute bottom-3 right-3 p-2 bg-gray-100 dark:bg-[#3A3B3C] rounded-full shadow-md text-foreground hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-all border border-white dark:border-[#242526]"
                        >
                          <CameraIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="flex-1 text-center md:text-left pb-4 md:mb-2">
                       <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{profileUser?.displayName}</h1>
                       <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">{profileUser?.followersCount || 0} followers • {profileUser?.followingCount || 0} following</p>
                    </div>

                    <div className="flex gap-2 pb-4 md:mb-2">
                      {profileUid === user?.uid ? (
                        <>
                          <Button 
                            onClick={() => setIsPostCreationModalOpen(true)}
                            className="bg-[#1877F2] text-white font-bold text-xs h-9 px-4 rounded-md shadow-sm hover:bg-[#166FE5]"
                          >
                             <Plus className="w-4 h-4 mr-2" /> Add to Story
                          </Button>
                          <Button 
                            onClick={openEditProfile}
                            className="bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground font-bold text-xs h-9 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-[#4E4F50]"
                          >
                             <PenLine className="w-4 h-4 mr-2" /> Edit profile
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            onClick={() => withAuth(() => followingUids.includes(profileUid) ? unfollowUser(profileUid) : followUser(profileUid))}
                            className={`${followingUids.includes(profileUid) ? 'bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground' : 'bg-[#1877F2] text-white hover:bg-[#166FE5]'} font-bold text-xs h-9 px-6 rounded-md transition-all`}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
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

                  {/* Facebook Style Tabs bar */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-[#3E4042] mt-4 pt-4">
                     {['Posts', 'About', 'Followers', 'Photos', 'Videos'].map((tab, idx) => (
                       <button 
                         key={tab} 
                         className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${idx === 0 ? 'text-[#1877F2] bg-[#E7F3FF] dark:bg-[#1877F2]/10' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                       >
                         {tab}
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              {/* Activity Section */}
              <div className="px-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Left Column (Info / Intro) */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow-sm space-y-4">
                      <h3 className="text-xl font-black uppercase tracking-tighter">Intro</h3>
                      
                      {/* Bio */}
                      <div className="text-center text-sm font-medium py-2 break-words">
                        {profileUser?.bio || (profileUid === user?.uid ? 'Add a short bio to tell people more about yourself.' : 'No bio yet.')}
                      </div>
                      
                      {profileUid === user?.uid && (
                        <Button 
                          onClick={openEditProfile}
                          variant="ghost" 
                          className="w-full bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground font-bold text-xs rounded-md shadow-none hover:bg-gray-200 dark:hover:bg-[#4E4F50] h-9"
                        >
                          Edit bio
                        </Button>
                      )}

                      {/* Details */}
                      <div className="space-y-4 pt-2">
                         {profileUser?.work && (
                           <div className="flex items-center gap-3 text-sm font-medium">
                              <Briefcase className="w-5 h-5 text-gray-500" /> 
                              <span>Works as <span className="font-bold">{profileUser.work}</span></span>
                           </div>
                         )}
                         {profileUser?.education && (
                           <div className="flex items-center gap-3 text-sm font-medium">
                              <GraduationCap className="w-5 h-5 text-gray-500" /> 
                              <span>Studied at <span className="font-bold">{profileUser.education}</span></span>
                           </div>
                         )}
                         {profileUser?.currentCity && (
                            <div className="flex items-center gap-3 text-sm font-medium">
                               <MapPin className="w-5 h-5 text-gray-500" /> 
                               <span>Lives in <span className="font-bold">{profileUser.currentCity}</span></span>
                            </div>
                         )}
                         {profileUser?.hometown && (
                            <div className="flex items-center gap-3 text-sm font-medium">
                               <MapPin className="w-5 h-5 text-gray-500" /> 
                               <span>From <span className="font-bold">{profileUser.hometown}</span></span>
                            </div>
                         )}
                         {profileUser?.relationshipStatus && (
                            <div className="flex items-center gap-3 text-sm font-medium">
                               <Heart className="w-5 h-5 text-gray-500" /> 
                               <span>{profileUser.relationshipStatus}</span>
                            </div>
                         )}
                         {profileUser?.website && (
                            <div className="flex items-center gap-3 text-sm font-medium">
                               <LinkIcon className="w-5 h-5 text-gray-500" /> 
                               <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:underline font-bold truncate">
                                 {profileUser.website.replace('https://', '').replace('http://', '')}
                               </a>
                            </div>
                         )}
                      </div>

                      {profileUid === user?.uid && (
                        <div className="pt-4 border-t border-gray-100 dark:border-[#3E4042] space-y-3">
                           <Button onClick={openEditProfile} variant="ghost" className="w-full bg-[#E4E6EB] dark:bg-[#3A3B3C] text-foreground font-bold text-xs rounded-md shadow-none hover:bg-gray-200 dark:hover:bg-[#4E4F50] h-9">Edit details</Button>
                           <div className="flex items-center gap-3 text-xs font-bold text-gray-500 pt-2"><Globe className="w-4 h-4" /> Profile · Public</div>
                        </div>
                      )}

                      {profileUid === user?.uid && (
                        <div className="pt-4 border-t border-gray-100 dark:border-[#3E4042] space-y-4">
                           {user?.role === 'admin' && (
                             <button 
                               onClick={() => setActiveTab('admin')} 
                               className="w-full p-4 rounded-xl bg-accent text-bg-dark font-black text-sm flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,209,255,0.3)] hover:scale-[1.02] transition-all uppercase tracking-widest"
                             >
                               <LayoutDashboard className="w-5 h-5" /> Admin Dashboard
                             </button>
                           )}
                           <button onClick={logout} className="w-full p-3 rounded-lg bg-red-500/5 text-red-500 font-bold text-xs flex items-center justify-center gap-2 border border-red-500/10 hover:bg-red-500/20 transition-colors uppercase tracking-widest">
                             <LogOut className="w-4 h-4" /> Logout from Porsh
                           </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Posts Flow) */}
                  <div className="md:col-span-3 space-y-4">
                    {profileUid === user?.uid && (
                      <div className="bg-white dark:bg-[#242526] p-4 rounded-xl shadow-sm flex items-center gap-3">
                        <div 
                           onClick={() => setSelectedUserUid(user?.uid || null)}
                           className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-surface cursor-pointer"
                        >
                          {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-2 text-text-dim" />}
                        </div>
                        <button 
                          onClick={() => withAuth(() => setIsPostCreationModalOpen(true))}
                          className="flex-1 h-10 rounded-full px-4 text-left text-sm bg-[#F0F2F5] dark:bg-[#3A3B3C] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#4E4F50] transition-colors"
                        >
                           What's on your mind, {user?.displayName?.split(' ')[0] || 'User'}?
                        </button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {posts.filter(p => p.authorUid === profileUid).map(post => (
                        <PostCard 
                          key={post.id}
                          post={post}
                          ads={ads}
                          theme={theme}
                          usersRegistry={usersRegistry}
                          onLike={() => withAuth(() => likePost(post.id))}
                          onReact={(type) => withAuth(() => reactToPost(post.id, type))}
                          onComment={() => withAuth(() => setCommentingPostId(post.id))}
                          onFollow={() => withAuth(() => followUser(post.authorUid))}
                          onUnfollow={() => withAuth(() => unfollowUser(post.authorUid))}
                          onEdit={(p) => { 
                            setEditingPost(p); 
                            setPostInput(p.content); 
                            setPostYoutubeUrl(p.youtubeUrl || '');
                            setPostPrivacy(p.privacy || 'public');
                            setIsPostCreationModalOpen(true); 
                          }}
                          onDelete={deletePost}
                          onUserClick={navigateToProfile}
                          isFollowing={user ? followingUids.includes(post.authorUid) : false}
                          currentUserId={user?.uid}
                          autoplayVideos={user ? (user.autoplayVideos ?? true) : true}
                        />
                      ))}
                      {posts.filter(p => p.authorUid === profileUid).length === 0 && (
                        <div className="p-20 text-center bg-white dark:bg-[#242526] rounded-xl shadow-sm">
                           <div className="opacity-20 uppercase font-black tracking-widest text-xs">No posts yet to show</div>
                        </div>
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
          welcomeMessage: 'Welcome to Porsh!',
          appVersion: '1.0.0',
          minVersion: '1.0.0',
          contactEmail: 'support@porsh.app',
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

    const storiesQuery = query(collection(db, 'stories'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
      const now = new Date();
      const storiesList: Story[] = [];
      const expiredDocs: string[] = [];
      
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
        
        if (expiresAt < now) {
          // If the current user is the author or an admin, they can perform physical cleanup
          if (user && (data.authorUid === user.uid || user.role === 'admin')) {
            expiredDocs.push(docSnap.id);
          }
        } else {
          storiesList.push({ id: docSnap.id, ...data } as Story);
        }
      });
      
      setStories(storiesList);

      // Background cleanup for expired stories (only for own stories or if admin)
      if (expiredDocs.length > 0) {
        expiredDocs.forEach(id => {
          deleteDoc(doc(db, 'stories', id)).catch(() => {
            // Silently fail if permissions didn't allow it yet
          });
        });
      }
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
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const registry: Record<string, AppUser> = {};
      const usersList: any[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data() as AppUser;
        const u = { ...data, uid: doc.id, id: doc.id };
        registry[doc.id] = u;
        usersList.push(u);
      });

      setUsersRegistry(registry);
      if (user?.role === 'admin') {
        setAllUsers(usersList);
      }
    });
    return () => unsubscribe();
  }, []); // Run once on mount to maintain global real-time registry

  // Auth Listener
  useEffect(() => {
    addLog('পরশ সিস্টেম প্রস্তুত (PORSH System Ready)');
    let userUnsubscribe: (() => void) | null = null;
    let followingUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          addLog(`ইউজার পাওয়া গেছে: ${currentUser.uid.slice(0, 6)}...`);
          
          if (userUnsubscribe) userUnsubscribe();
          if (followingUnsubscribe) followingUnsubscribe();

          // Listen for following relationships
          followingUnsubscribe = onSnapshot(collection(db, 'users', currentUser.uid, 'following'), (snap) => {
            setFollowingUids(snap.docs.map(d => d.id));
          });

          // Use onSnapshot for the user document to handle offline states and real-time updates
          userUnsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), async (docSnap) => {
            if (docSnap.exists()) {
              addLog('পড়শি প্রোফাইল লোড হচ্ছে...');
              const userData = { ...docSnap.data(), uid: docSnap.id } as any;
              
              // Bootstrap admin if email matches
              if (currentUser.email?.toLowerCase() === "salman1000790@gmail.com" && userData.role !== 'admin') {
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
                autoplayVideos: true,
                role: currentUser.email?.toLowerCase() === "salman1000790@gmail.com" ? 'admin' : 'user'
              };
              
              await setDoc(doc(db, 'users', currentUser.uid), newUser);
              addLog('প্রোফাইল তৈরি সম্পন্ন (Profile Created)');
              setUser(newUser);
            }
            setShowSplash(false);
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
          addLog('লগইন প্রয়োজন (No Active User)');
          setUser(null);
          setIsAuthReady(true);
          setIsAuthLoading(false);
        }
      } catch (error) {
        console.error('Auth Listener Error:', error);
        setIsAuthReady(true);
      }
    });

    // Artificial delay for splash screen as requested (2-4 seconds)
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(splashTimeout);
      if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setErrorMessage(null);
    const email = `${authPhone.trim()}@porshi.com`;
    const password = authPassword;

    try {
      if (authView === 'register') {
        addLog(`রেজিস্ট্রেশন চেষ্টা: ${authPhone.trim()}`);
        setAuthProcessingStep('নতুন অ্যাকাউন্ট তৈরি হচ্ছে...');
        registrationData.current = { name: authName, phone: authPhone.trim() };
        await createUserWithEmailAndPassword(auth, email, password);
        addLog('সার্ভার রেসপন্স: সাকসেস (Registered)');
        setAuthSuccessMessage('নিবন্ধন সফল!');
        setShowAuthModal(false);
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

  const login = async () => {
    setIsAuthLoading(true);
    try {
      addLog('গুগল লগইন চেষ্টা করা হচ্ছে...');
      await signInWithPopup(auth, googleProvider);
      addLog('সার্ভার রেসপন্স: সফল (Verified)');
      setShowAuthModal(false);
    } catch (error: any) {
      console.error('Login Error:', error);
      addLog(`এরর (Auth): ${error.code}`);
      setErrorMessage('গুগল লগইন করতে সমস্যা হয়েছে।');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      addLog('লগআউট করা হচ্ছে...');
      await signOut(auth);
      setUser(null);
      addLog('সেশন শেষ (Logged Out)');
    } catch (error: any) {
      console.error('Logout Error:', error);
    }
  };

  const followUser = async (targetUid: string) => {
    if (!user) return withAuth(() => {});
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid), { followingCount: increment(1) });
      batch.update(doc(db, 'users', targetUid), { followersCount: increment(1) });
      batch.set(doc(db, 'users', user.uid, 'following', targetUid), { 
        followerUid: user.uid, 
        followedUid: targetUid, 
        timestamp: serverTimestamp() 
      });
      batch.set(doc(db, 'users', targetUid, 'followers', user.uid), { 
        followerUid: user.uid, 
        followedUid: targetUid, 
        timestamp: serverTimestamp() 
      });
      await batch.commit();
      addLog(`ফলো করা হয়েছে: ${targetUid.slice(0, 6)}...`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid), { followingCount: increment(-1) });
      batch.update(doc(db, 'users', targetUid), { followersCount: increment(-1) });
      batch.delete(doc(db, 'users', user.uid, 'following', targetUid));
      batch.delete(doc(db, 'users', targetUid, 'followers', user.uid));
      await batch.commit();
      addLog(`আনফলো করা হয়েছে: ${targetUid.slice(0, 6)}...`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const sendPairRequest = async (targetUid: string) => {
    if (!user) return withAuth(() => {});
    try {
      const pairId = [user.uid, targetUid].sort().join('_');
      await setDoc(doc(db, 'pairs', pairId), {
        requestedBy: user.uid,
        users: [user.uid, targetUid],
        status: 'pending',
        timestamp: serverTimestamp()
      }, { merge: true });
      addLog(`পেয়ার রিকোয়েস্ট পাঠানো হয়েছে: ${targetUid.slice(0, 6)}...`);
      setErrorMessage('রিকোয়েস্ট পাঠানো হয়েছে!');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `pairs`);
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
                  <img src="/porsh-pwa-icon.png" alt="Logo" className="w-full h-full object-contain p-2" />
                </div>
                <CardTitle className="text-2xl font-black text-accent tracking-tighter uppercase">PORSH - SIGN IN</CardTitle>
                <CardDescription className="text-text-dim text-xs">
                  পরশ এ কোনো কিছু করতে হলে দয়া করে লগইন করুন।
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
                
                <Button 
                  id="google-login-btn"
                  onClick={login} 
                  className="w-full bg-accent/10 text-accent border border-accent/30 font-black flex gap-3 h-12 uppercase tracking-widest text-[10px]"
                >
                  <Globe className="w-4 h-4" /> গুগল দিয়ে লগইন
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderChatWindow = () => {
    if (!activeChat) return null;
    
    return (
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className={`fixed inset-0 z-[160] flex flex-col ${theme === 'dark' ? 'bg-[#18191A] text-white' : 'bg-white text-black'}`}
      >
         {/* Chat Header */}
         <div className={`px-4 h-16 flex items-center justify-between border-b ${theme === 'dark' ? 'border-[#3E4042]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-1">
               <button onClick={() => setActiveChat(null)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <ArrowLeft className="w-6 h-6 text-[#0084FF]" />
               </button>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-[#3A3B3C]">
                     {usersRegistry[activeChat.partnerId]?.photoURL ? 
                       <img src={usersRegistry[activeChat.partnerId].photoURL} className="w-full h-full object-cover" /> : 
                       <UserIcon className="w-full h-full p-2 text-gray-400" />
                     }
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="font-bold text-[15px] leading-tight truncate max-w-[120px]">{activeChat.partnerName}</span>
                     <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[11px] text-gray-500 font-medium lowercase">Active now</span>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex items-center gap-0.5">
               <button className="p-2 text-[#0084FF] transition-transform active:scale-90"><Phone className="w-5 h-5 fill-current" /></button>
               <button className="p-2 text-[#0084FF] transition-transform active:scale-90"><VideoIcon className="w-6 h-6 fill-current" /></button>
               <button className="p-2 text-[#0084FF] transition-transform active:scale-90"><Info className="w-6 h-6 fill-current" /></button>
            </div>
         </div>

         {/* Messages Area */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-inherit">
            <div className="flex flex-col items-center justify-center py-12">
               <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-blue-500/10">
                  {usersRegistry[activeChat.partnerId]?.photoURL ? 
                    <img src={usersRegistry[activeChat.partnerId].photoURL} className="w-full h-full object-cover" /> : 
                    <UserIcon className="w-full h-full p-6 bg-gray-100 dark:bg-[#3A3B3C]" />
                  }
               </div>
               <h2 className="text-xl font-bold text-center">{activeChat.partnerName}</h2>
               <p className="text-[13px] text-gray-500 font-medium text-center mt-1">Facebook · You're friends on Porsh</p>
               <p className="text-[12px] text-gray-400 text-center">Lives in {usersRegistry[activeChat.partnerId]?.currentCity || 'Bangladesh'}</p>
               <Button variant="ghost" size="sm" className="mt-4 bg-gray-100 dark:bg-[#3A3B3C] font-bold text-xs px-4" onClick={() => navigateToProfile(activeChat.partnerId)}>View Profile</Button>
            </div>

            {messages.map((m, i) => {
               const isMe = m.senderUid === user?.uid;
               return (
                 <div key={m.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[75%] px-4 py-2 text-[15px] ${
                      isMe 
                      ? 'bg-[#0084FF] text-white rounded-[20px] rounded-tr-[4px]' 
                      : 'bg-[#F0F2F5] dark:bg-[#3A3B3C] text-inherit rounded-[20px] rounded-tl-[4px]'
                    }`}>
                       {m.text}
                    </div>
                 </div>
               );
            })}
            <div ref={chatEndRef} className="h-4" />
         </div>

         {/* Chat Input */}
         <div className={`p-3 bg-inherit border-t safe-bottom ${theme === 'dark' ? 'border-[#3E4042]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-1">
               <div className="flex items-center">
                 <button className="p-2 text-[#0084FF] transition-transform active:scale-90"><PlusCircle className="w-6 h-6" /></button>
                 {!messageInput.trim() && (
                   <>
                     <button className="p-2 text-[#0084FF] transition-transform active:scale-90"><CameraIcon className="w-6 h-6" /></button>
                     <button className="p-2 text-[#0084FF] transition-transform active:scale-90"><ImageIcon className="w-6 h-6" /></button>
                     <button className="p-2 text-[#0084FF] transition-transform active:scale-90"><Mic className="w-6 h-6" /></button>
                   </>
                 )}
               </div>
               
               <div className={`flex-1 flex items-center h-10 px-3 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}>
                  <input 
                    placeholder="Aa" 
                    className="bg-transparent border-none outline-none text-[15px] w-full placeholder:text-gray-500"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button className="p-1 transition-transform active:scale-125"><Smile className="w-5 h-5 text-[#0084FF]" /></button>
               </div>
               
               {messageInput.trim() ? (
                 <button onClick={handleSendMessage} className="p-2 text-[#0084FF] transition-transform active:scale-90">
                    <SendHorizontal className="w-6 h-6 fill-current" />
                 </button>
               ) : (
                 <button className="p-2 text-[#0084FF] transition-transform active:scale-110">
                    <ThumbsUp className="w-6 h-6 fill-current" />
                 </button>
               )}
            </div>
         </div>
      </motion.div>
    );
  };

  const renderInstallModal = () => {
    if (!showInstallModal || isInStandaloneMode) return null;
    
    return (
      <div className="fixed inset-0 z-[2001] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/40 backdrop-blur-[2px]">
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          className={`w-full sm:max-w-sm rounded-t-[32px] sm:rounded-[32px] p-8 flex flex-col items-center text-center shadow-2xl ${theme === 'dark' ? 'bg-[#1C1C1E] border-white/5' : 'bg-white border-gray-100'} border-t sm:border`}
        >
          <div className="w-12 h-1 bg-gray-200 rounded-full mb-8 sm:hidden" />
          
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-[22px] overflow-hidden shadow-lg p-0 bg-white ring-4 ring-blue-500/5">
               <img 
                 src="/porsh-pwa-icon.png" 
                 className="w-full h-full object-cover" 
                 alt="Porsh Logo" 
                 onError={(e) => {
                    e.currentTarget.src = "https://img.icons8.com/fluency/512/chat.png";
                 }}
               />
            </div>
          </div>
          
          <h2 className="text-xl font-black mb-1">Install Porsh</h2>
          <p className="text-sm text-gray-500 mb-8 font-medium px-4">Experience Porsh as a native Android app without the browser bar.</p>
          
          <div className="w-full space-y-3">
            <button 
              onClick={() => { installApp(); if (isIframe) setShowInstallModal(false); }} 
              className="w-full h-14 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              {deferredPrompt ? "Install App" : (isIOS ? "Add to Home Screen" : (isIframe ? "Install App" : "Install App"))}
            </button>
            
            <button 
              onClick={() => setShowInstallModal(false)} 
              className="w-full h-12 rounded-2xl font-bold text-gray-400 hover:text-gray-500 transition-colors"
            >
              Not Now
            </button>
          </div>
          
          <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
             <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
               <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
             </div>
             Verified Standalone App
          </div>
        </motion.div>
      </div>
    );
  };

  const renderEditProfileModal = () => (
    <AnimatePresence>
      {isEditProfileModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-none shadow-2xl ${theme === 'dark' ? 'bg-[#242526] text-white' : 'bg-white text-black'}`}
          >
            <div className={`p-4 border-b flex justify-between items-center sticky top-0 z-10 ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'}`}>
              <h2 className="text-xl font-bold uppercase tracking-tighter">Edit Profile</h2>
              <button 
                onClick={() => setIsEditProfileModalOpen(false)} 
                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
               {/* Photos Section */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="font-bold text-lg uppercase tracking-tight">Profile Picture</h3>
                     <Button 
                       variant="ghost" 
                       onClick={handleProfilePictureClick} 
                       className="text-[#1877F2] font-black uppercase text-xs"
                     >
                       Edit
                     </Button>
                  </div>
                  <div className="flex justify-center">
                     <div className="w-44 h-44 rounded-full border-4 border-[#1877F2]/20 overflow-hidden bg-gray-200 shadow-xl">
                        {isUploadingPhoto ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/5">
                            <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
                          </div>
                        ) : (
                          <img src={user?.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                     <h3 className="font-bold text-lg uppercase tracking-tight">Cover Photo</h3>
                     <Button 
                       variant="ghost" 
                       onClick={() => coverImageInputRef.current?.click()} 
                       className="text-[#1877F2] font-black uppercase text-xs"
                     >
                       Edit
                     </Button>
                  </div>
                  <div className="w-full aspect-[16/6] rounded-xl border-2 border-dashed border-[#1877F2]/20 overflow-hidden bg-surface relative group">
                     {isUploadingCover ? (
                        <div className="w-full h-full flex items-center justify-center">
                           <Loader2 className="w-8 h-8 animate-spin text-[#1877F2]" />
                        </div>
                     ) : (
                        user?.coverPhotoURL ? (
                          <img src={user?.coverPhotoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-[#1877F2]/10 to-[#00D1FF]/10 flex flex-col items-center justify-center text-[#1877F2] opacity-50">
                             <ImageIcon className="w-10 h-10 mb-2" />
                             <span className="text-[10px] font-bold uppercase tracking-widest">No Cover Photo</span>
                          </div>
                        )
                     )}
                  </div>
               </div>

               {/* Bio Section */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <h3 className="font-bold uppercase text-xs tracking-widest text-[#1877F2]">Bio / স্লোগান</h3>
                     <span className="text-[10px] font-bold text-text-dim">{editProfileData.bio.length}/101</span>
                  </div>
                  <textarea 
                    value={editProfileData.bio}
                    onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})}
                    placeholder="পড়শিতে আপনার সম্পর্কে কিছু বলুন..."
                    maxLength={101}
                    className={`w-full p-4 rounded-xl border-2 resize-none h-24 text-sm font-medium focus:border-[#1877F2] transition-colors outline-none ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`}
                  />
               </div>

               {/* Settings Section */}
               <div className="space-y-6">
                  <h3 className="font-bold uppercase text-xs tracking-widest text-[#1877F2]">Settings / সেটিংস</h3>
                  <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`}>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-tight">Video Autoplay</div>
                      <div className="text-[10px] text-text-dim font-medium uppercase">অটোমেটিক ভিডিও প্লে হবে</div>
                    </div>
                    <button 
                      onClick={() => setEditProfileData(prev => ({ ...prev, autoplayVideos: !prev.autoplayVideos }))}
                      className={`w-14 h-8 rounded-full transition-all relative cursor-pointer ${editProfileData.autoplayVideos ? 'bg-[#1877F2]' : 'bg-gray-400'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${editProfileData.autoplayVideos ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
               </div>

               {/* Info Section */}
               <div className="space-y-6">
                  <h3 className="font-bold uppercase text-xs tracking-widest text-[#1877F2]">Customize your intro</h3>
                  <div className="grid gap-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Display Name / আপনার নাম</Label>
                        <Input 
                          value={editProfileData.displayName} 
                          onChange={e => setEditProfileData({...editProfileData, displayName: e.target.value})} 
                          className={`h-12 border-2 ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`} 
                        />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">বর্তমান শহর</Label>
                           <Input 
                             value={editProfileData.currentCity} 
                             onChange={e => setEditProfileData({...editProfileData, currentCity: e.target.value})} 
                             className={`h-12 border-2 ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`} 
                             placeholder="যেমন: ঢাকা, বাংলাদেশ"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">স্থায়ী ঠিকানা</Label>
                           <Input 
                             value={editProfileData.hometown} 
                             onChange={e => setEditProfileData({...editProfileData, hometown: e.target.value})} 
                             className={`h-12 border-2 ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`} 
                             placeholder="যেমন: চট্টগ্রাম"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">কর্মসংস্থান (Work)</Label>
                        <Input 
                          value={editProfileData.work} 
                          onChange={e => setEditProfileData({...editProfileData, work: e.target.value})} 
                          className={`h-12 border-2 ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`} 
                          placeholder="যেমন: গ্রাফিক ডিজাইনার"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">শিক্ষা প্রতিষ্ঠান</Label>
                        <Input 
                          value={editProfileData.education} 
                          onChange={e => setEditProfileData({...editProfileData, education: e.target.value})} 
                          className={`h-12 border-2 ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`} 
                          placeholder="স্কুল বা কলেজ"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">সম্পর্কের অবস্থা</Label>
                        <select 
                          value={editProfileData.relationshipStatus} 
                          onChange={e => setEditProfileData({...editProfileData, relationshipStatus: e.target.value})}
                          className={`w-full h-12 p-2.5 rounded-md border-2 font-medium ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`}
                        >
                           <option value="">Select Status</option>
                           <option value="Single">Single</option>
                           <option value="In a relationship">In a relationship</option>
                           <option value="Married">Married</option>
                           <option value="Engaged">Engaged</option>
                           <option value="It's complicated">It's complicated</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">ওয়েবসাইট / প্রোফাইল লিংক</Label>
                        <Input 
                          value={editProfileData.website} 
                          onChange={e => setEditProfileData({...editProfileData, website: e.target.value})} 
                          className={`h-12 border-2 ${theme === 'dark' ? 'bg-[#3A3B3C] border-[#3E4042]' : 'bg-[#F0F2F5] border-gray-200'}`} 
                          placeholder="https://..."
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className={`p-4 border-t flex gap-3 sticky bottom-0 z-10 ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'}`}>
               <Button variant="ghost" onClick={() => setIsEditProfileModalOpen(false)} className="flex-1 h-12 font-bold uppercase text-[10px] tracking-widest">Cancel</Button>
               <Button onClick={handleUpdateProfile} disabled={isEditProfileLoading} className="flex-1 bg-[#1877F2] text-white hover:bg-[#166FE5] h-12 font-black uppercase text-[10px] tracking-widest shadow-[0_4px_14px_rgba(24,119,242,0.4)]">
                  {isEditProfileLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'সব ঠিক আছে (Save)'}
               </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (showSplash || !isAuthReady) return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-colors duration-500 ${theme === 'dark' ? 'bg-[#18191A]' : 'bg-white'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center space-y-8"
      >
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`text-6xl md:text-8xl font-black tracking-widest drop-shadow-sm select-none ${theme === 'dark' ? 'text-white' : 'text-[#000080]'}`}
        >
          {currentApp === 'porsh' ? (appConfig?.appName || 'PORSH') : 'PORSHI'}
        </motion.h1>
        
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className={`w-2.5 h-2.5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-[#000080]'}`}
              />
            ))}
          </div>
          <motion.span 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`text-[10px] font-bold tracking-[0.4em] uppercase ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-[#000080]/60'}`}
          >
            {currentApp === 'porsh' ? 'Secure Messaging' : 'Initializing Experience'}
          </motion.span>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 flex flex-col items-center transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <aside className={`hidden lg:flex fixed left-0 top-0 h-full w-72 flex-col p-8 border-r ${theme === 'dark' ? 'border-border-custom bg-surface' : 'border-gray-200 bg-white'} z-50`}>
        {/* Hidden File Inputs */}
        <input type="file" accept="image/*,video/*" ref={postImageInputRef} onChange={handlePostImageChange} className="hidden" />
        <input type="file" accept="image/*,video/*" ref={storyImageInputRef} onChange={handleStoryImageChange} className="hidden" />
        <input type="file" accept="image/*" ref={profileImageInputRef} onChange={uploadProfilePicture} className="hidden" />
        <input type="file" accept="image/*" ref={coverImageInputRef} onChange={uploadCoverPicture} className="hidden" />
        
        <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 relative rounded-2xl overflow-hidden bg-accent flex items-center justify-center">
              <img 
                src={appConfig?.appIcon || "https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png"} 
                alt="Logo" 
                className={`w-full h-full object-contain p-2 ${theme === 'dark' ? 'brightness-200 invert' : ''}`}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-xl font-black tracking-tighter">{appConfig?.appName || "PORSH"}</div>
        </div>
        
        <nav className="flex-1 space-y-1">
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
                if (item.id !== 'home') {
                  withAuth(() => setActiveTab(item.id as any));
                } else {
                  setActiveTab(item.id as any);
                }
              }}
              className={`sidebar-link w-full ${activeTab === item.id ? 'sidebar-link-active' : ''}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-accent text-white text-[10px] font-black h-5 px-1.5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="space-y-4 pt-8 border-t border-border-custom">
          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-400/5 rounded-xl transition-all font-semibold">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:max-w-2xl lg:ml-72 flex flex-col min-h-screen bg-background">
        {/* Mobile Header (Facebook Style) */}
        <header className={`lg:hidden w-full px-4 pt-3 pb-2 flex justify-between items-center ${theme === 'dark' ? 'bg-[#242526] text-white border-b border-[#3E4042]' : 'bg-white text-[#1877F2] border-b border-[#E4E6EB]'} sticky top-0 z-50`}>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}
            >
              <Menu className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`} />
            </button>
            <span className="text-xl font-black tracking-tighter text-accent">{appConfig?.appName || "PORSH"}</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => withAuth(() => setIsMobileCreateMenuOpen(true))}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}
            >
              <Plus className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`} />
            </button>
            <button 
              onClick={() => withAuth(() => setIsMobileSearchOpen(true))}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}
            >
              <Search className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`} />
            </button>
            <button onClick={() => withAuth(() => setCurrentApp('porsh'))} className={`p-2 rounded-full relative ${theme === 'dark' ? 'bg-[#3A3B3C]' : 'bg-[#F0F2F5]'}`}>
              <MessageCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-foreground'}`} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-[9px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">9+</span>
            </button>
          </div>
        </header>

        {/* Facebook Style Mobile Tabs */}
        <nav className={`lg:hidden w-full flex justify-around items-center border-b ${theme === 'dark' ? 'bg-[#242526] border-[#3E4042]' : 'bg-white border-[#E4E6EB]'} overflow-x-auto no-scrollbar`}>
          {[
            { id: 'home', icon: Home },
            { id: 'scan', icon: Store },
            { id: 'video', icon: PlayCircle }, 
            { id: 'notifications', icon: Bell, badge: unreadNotificationsCount },
            { id: 'profile', icon: UserCircle },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentApp('porshi');
                if (item.id !== 'home') {
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
        </nav>
        <div className="px-0 py-2 lg:p-8">
           {renderContent()}
        </div>
      </main>

      {/* Global Modals / Overlays */}
      {renderAuthModal()}
      {renderEditProfileModal()}
      {renderPostCreationModal()}
      {renderAdPaymentModal && renderAdPaymentModal()}
      {renderCommentsModal()}
      {renderInstallModal()}
      <AnimatePresence>
         {activeChat && renderChatWindow()}
      </AnimatePresence>

      <AnimatePresence>
        {activeStory && (
          <StoryViewer 
            stories={stories}
            initialStoryIndex={stories.findIndex(s => s.id === activeStory.id)}
            onClose={() => setActiveStory(null)}
            usersRegistry={usersRegistry}
          />
        )}
      </AnimatePresence>

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
              <h3 className="text-center font-bold text-lg mb-6 text-accent">Create Content</h3>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={() => { setIsMobileCreateMenuOpen(false); withAuth(() => { setPostInput(''); setIsPostCreationModalOpen(true); }); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center"><PenLine className="w-6 h-6 text-accent" /></div>
                    <div className="text-left">
                       <div className="font-bold">Post</div>
                       <div className="text-[10px] opacity-50 uppercase tracking-widest font-bold">নিউজ ফিডে পোস্ট করুন</div>
                    </div>
                 </button>
                 <button onClick={() => { setIsMobileCreateMenuOpen(false); withAuth(createStory); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center"><PlayCircle className="w-6 h-6 text-accent" /></div>
                    <div className="text-left font-bold">Story</div>
                 </button>
                 <button onClick={() => { setIsMobileCreateMenuOpen(false); withAuth(() => { setActiveTab('video'); }); }} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center"><VideoIcon className="w-6 h-6 text-accent" /></div>
                    <div className="text-left font-bold">Reel</div>
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
          >
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              onClick={(e) => e.stopPropagation()}
              className={`w-4/5 max-w-sm h-full p-6 shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-bg-dark text-white' : 'bg-white text-foreground'}`}
            >
               <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center p-2">
                       <img src={appConfig?.appIcon || "/porsh-pwa-icon.png"} className="w-full h-full object-contain brightness-200 invert" alt="" />
                    </div>
                    <span className="text-xl font-black tracking-tighter italic">{appConfig?.appName || "PORSH"}</span>
                  </div>
                  <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
                  {[
                    { id: 'home', icon: Home, label: t('home') },
                    { id: 'scan', icon: Store, label: t('discovery') },
                    { id: 'chat', icon: MessageCircle, label: t('chat') },
                    { id: 'monetization', icon: DollarSign, label: t('monetize') },
                    { id: 'ads', icon: Megaphone, label: 'Promote Ads' },
                    { id: 'notifications', icon: Bell, label: t('notifications'), badge: unreadNotificationsCount },
                    { id: 'profile', icon: UserCircle, label: 'Account Settings' },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (item.id !== 'home') {
                          withAuth(() => setActiveTab(item.id as any));
                        } else {
                          setActiveTab(item.id as any);
                        }
                      }}
                      className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-accent/10 text-accent font-black' : 'hover:bg-black/5 font-semibold opacity-70'}`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-sm">{item.label}</span>
                      {item.badge && item.badge > 0 && <span className="ml-auto bg-accent text-bg-dark h-5 px-2 rounded-lg text-[8px] font-black">{item.badge}</span>}
                    </button>
                  ))}
               </div>

               <div className="pt-6 border-t border-black/5 space-y-4">
                  {user && (
                    <button onClick={logout} className="w-full h-14 rounded-2xl flex items-center gap-4 px-6 text-red-500 font-bold hover:bg-red-500/5 transition-all">
                      <LogOut className="w-5 h-5" />
                      <span>Log Out</span>
                    </button>
                  )}
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
                      className="bg-accent text-bg-dark text-[10px] font-black h-8 px-4 rounded-xl"
                    >
                      Follow
                    </Button>
                  </div>
                ))}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border-radius: 1rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: inherit;
          opacity: 0.6;
          border: 1px solid transparent;
        }
        .sidebar-link:hover {
          opacity: 1;
          color: var(--accent);
          background: rgba(var(--accent-rgb), 0.05);
        }
        .sidebar-link-active {
          opacity: 1;
          background: var(--accent);
          color: black !important;
          font-weight: 900;
          box-shadow: 0 10px 20px -5px rgba(var(--accent-rgb), 0.3);
        }
      `}} />
    </div>
  );
}