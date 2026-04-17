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
  Bookmark,
  Image as ImageIcon,
  Smile,
  Globe,
  Lock,
  UserCheck,
  BarChart,
  TrendingUp,
  DollarSign,
  Activity,
  Moon,
  Sun,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  onAuthStateChanged, 
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
  writeBatch
} from './firebase';

import { 
  AppUser, 
  Post, 
  Story, 
  ChatMessage, 
  PairRequest, 
  MonetizationData,
  AppConfig 
} from './types';
import { PostCard } from './components/PostCard';

interface ActiveChat {
  id: string;
  partnerId: string;
  partnerName: string;
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [currentApp, setCurrentApp] = useState<'porshi' | 'porsh'>('porshi');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [onlineUsers, setOnlineUsers] = useState<AppUser[]>([]);
  const [incomingRequest, setIncomingRequest] = useState<PairRequest | null>(null);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [postInput, setPostInput] = useState('');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [monetizationData, setMonetizationData] = useState<MonetizationData | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [isAppActive, setIsAppActive] = useState(true);

  const postImageInputRef = useRef<HTMLInputElement>(null);
  const storyImageInputRef = useRef<HTMLInputElement>(null);
  const profileImageInputRef = useRef<HTMLInputElement>(null);

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [followingUids, setFollowingUids] = useState<string[]>([]);
  const [homeFeedTab, setHomeFeedTab] = useState<'all' | 'following'>('all');

  const compressImage = (base64Str: string, maxWidth = 1024, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
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
        if (!ctx) return reject(new Error('Canvas context failed'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Compression failed'));
        }, 'image/jpeg', quality);
      };
      img.onerror = reject;
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
    }
  }, [user]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDisplayName.trim()) return;
    
    setIsUpdatingProfile(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: newDisplayName.trim()
      });
      // Update local state
      setUser({ ...user, displayName: newDisplayName.trim() });
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
        const compressedBlob = await compressImage(base64Data, 400, 0.8);
        const storageRef = ref(storage, `profile_pictures/${user.uid}_${Date.now()}.jpg`);
        await uploadBytes(storageRef, compressedBlob);
        const downloadURL = await getDownloadURL(storageRef);
        
        await updateDoc(doc(db, 'users', user.uid), {
          photoURL: downloadURL
        });
        
        setUser({ ...user, photoURL: downloadURL });
        setErrorMessage('প্রোফাইল ছবি আপডেট হয়েছে!');
        setTimeout(() => setErrorMessage(null), 3000);
      } catch (error: any) {
        console.error('Photo upload error:', error);
        setErrorMessage('ছবি আপলোড করতে সমস্যা হয়েছে।');
        setTimeout(() => setErrorMessage(null), 4000);
      } finally {
        setIsUploadingPhoto(false);
      }
    });
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!postInput.trim() && !postImage)) return;

    setIsCreatingPost(true);
    try {
      let imageUrl = '';
      if (postImage) {
        const compressedBlob = await compressImage(postImage, 1200, 0.7);
        const storageRef = ref(storage, `posts/${user.uid}_${Date.now()}.jpg`);
        await uploadBytes(storageRef, compressedBlob);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'posts'), {
        authorUid: user.uid,
        authorName: user.displayName,
        authorPhoto: user.photoURL || '',
        content: postInput.trim(),
        imageUrl,
        likesCount: 0,
        commentsCount: 0,
        timestamp: serverTimestamp()
      });

      setPostInput('');
      setPostImage(null);
      setErrorMessage('পোস্ট সফল হয়েছে!');
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error: any) {
      console.error('Post creation error:', error);
      setErrorMessage('পোস্ট তৈরি করতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.CREATE, 'posts');
    } finally {
      setIsCreatingPost(false);
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
      const likeDoc = await getDoc(likeRef);
      if (likeDoc.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likesCount: increment(-1) });
      } else {
        await setDoc(likeRef, { userUid: user.uid, timestamp: serverTimestamp() });
        await updateDoc(postRef, { likesCount: increment(1) });
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
    handleFileSelect(e, (base64) => setPostImage(base64));
  };

  const createStory = () => {
    storyImageInputRef.current?.click();
  };

  const handleStoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    
    handleFileSelect(e, async (base64Data) => {
      setIsUploadingPhoto(true);
      try {
        const compressedBlob = await compressImage(base64Data, 1080, 0.7);
        const storageRef = ref(storage, `stories/${user.uid}_${Date.now()}.jpg`);
        await uploadBytes(storageRef, compressedBlob);
        const downloadURL = await getDownloadURL(storageRef);
        
        await addDoc(collection(db, 'stories'), {
          authorUid: user.uid,
          authorName: user.displayName,
          authorPhoto: user.photoURL || '',
          imageUrl: downloadURL,
          timestamp: serverTimestamp(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });
        
        setErrorMessage('স্টোরি আপলোড হয়েছে!');
        setTimeout(() => setErrorMessage(null), 3000);
      } catch (error: any) {
        console.error('Story upload error:', error);
        setErrorMessage('স্টোরি আপলোড করতে সমস্যা হয়েছে।');
        setTimeout(() => setErrorMessage(null), 4000);
      } finally {
        setIsUploadingPhoto(false);
      }
    });
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
      await updateDoc(postRef, {
        [`reactions.${reactionType}`]: increment(1)
      });
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
                        <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                      <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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

    if (currentApp === 'porsh') {
      return renderMessenger();
    }

    switch (activeTab) {
      case 'admin':
        if (user?.role !== 'admin') return null;
        return (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-12 pb-24">
              <div className="space-y-4">
                <h1 className="text-5xl font-black italic tracking-tighter text-accent uppercase">Admin Dashboard</h1>
                <p className="text-text-dim text-xs uppercase tracking-[4px]">পড়শি অ্যাপ কন্ট্রোল সেন্টার</p>
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
                        onClick={() => updateDoc(doc(db, 'appConfig', 'remote-settings'), { maintenanceMode: !appConfig?.maintenanceMode })}
                        className={`w-14 h-8 rounded-full transition-all relative ${appConfig?.maintenanceMode ? 'bg-accent' : 'bg-surface-light border border-border-custom'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${appConfig?.maintenanceMode ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">Welcome Message</label>
                      <Input 
                        value={appConfig?.welcomeMessage} 
                        onChange={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { welcomeMessage: e.target.value })}
                        className="bg-bg-dark/50 border-border-custom text-xs h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] uppercase text-text-dim ml-1">Announcement</label>
                      <textarea 
                        value={appConfig?.announcement} 
                        onChange={(e) => updateDoc(doc(db, 'appConfig', 'remote-settings'), { announcement: e.target.value })}
                        className="w-full bg-bg-dark/50 border border-border-custom rounded-xl p-4 text-xs h-32 focus:border-accent transition-colors outline-none text-white font-sans"
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
                            {u.photoURL && <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase">{u.displayName}</div>
                            <div className={`text-[8px] uppercase ${u.role === 'admin' ? 'text-accent' : 'text-text-dim'}`}>{u.role || 'user'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
      case 'home':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 overflow-y-auto custom-scrollbar"
          >
            {/* Stories */}
            <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar bg-surface/50 backdrop-blur-md border-b border-border-custom sticky top-0 z-30">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={createStory}
                className="flex-shrink-0 w-16 h-16 rounded-2xl border-2 border-dashed border-accent/30 flex items-center justify-center group hover:border-accent transition-colors"
              >
                <PlusSquare className="w-6 h-6 text-accent/50 group-hover:text-accent" />
              </motion.button>
              {stories.map(story => (
                <motion.div 
                  key={story.id} 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveStory(story)}
                  className="flex-shrink-0 w-16 h-16 rounded-2xl border-2 border-accent p-0.5 cursor-pointer"
                >
                  <img 
                    src={story.imageUrl} 
                    alt={story.authorName} 
                    className="w-full h-full rounded-[14px] object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              ))}
            </div>

            {/* Create Post */}
            <div className="p-4">
              <div className={`p-4 rounded-3xl border space-y-4 ${theme === 'dark' ? 'bg-surface/30 border-border-custom' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-full border overflow-hidden ${theme === 'dark' ? 'bg-accent/20 border-accent/30' : 'bg-gray-100 border-gray-200'}`}>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-accent" /></div>
                    )}
                  </div>
                  <textarea 
                    value={postInput}
                    onChange={(e) => setPostInput(e.target.value)}
                    placeholder="আপনার মনে কি আছে?"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm resize-none py-2 min-h-[80px]"
                  />
                </div>
                {postImage && (
                  <div className={`relative rounded-xl overflow-hidden border ${theme === 'dark' ? 'border-border-custom' : 'border-gray-100'}`}>
                    <img src={postImage} alt="Preview" className="w-full max-h-60 object-cover" />
                    <button onClick={() => setPostImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <div className={`flex justify-between items-center pt-2 border-t ${theme === 'dark' ? 'border-border-custom' : 'border-gray-100'}`}>
                  <div className="flex gap-2 relative">
                    <Button variant="ghost" size="sm" onClick={selectPostImage} className="text-text-dim hover:text-accent gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold">ছবি</span>
                    </Button>
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        className={`gap-2 transition-colors ${isEmojiPickerOpen ? 'text-accent' : 'text-text-dim hover:text-accent'}`}
                      >
                        <Smile className="w-4 h-4" />
                        <span className="text-[10px] uppercase font-bold">ইমোজি</span>
                      </Button>
                      
                      <AnimatePresence>
                        {isEmojiPickerOpen && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className={`absolute bottom-full left-0 mb-2 p-2 rounded-2xl border shadow-2xl flex gap-2 z-50 ${theme === 'dark' ? 'bg-surface border-border-custom' : 'bg-white border-gray-200'}`}
                          >
                            {['😊', '😂', '🔥', '❤️', '👍', '🙏', '🙌', '✨', '😎'].map(emoji => (
                              <button 
                                key={emoji} 
                                onClick={() => addEmoji(emoji)}
                                className="text-xl hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <Button 
                    disabled={isCreatingPost || (!postInput.trim() && !postImage)}
                    onClick={createPost}
                    className="bg-accent text-bg-dark font-bold text-[10px] uppercase px-6 h-8 rounded-full shadow-lg shadow-accent/20"
                  >
                    {isCreatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : 'পোস্ট করুন'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Feed Tabs */}
            <div className="px-4 mb-4 flex gap-6 border-b border-border-custom/30">
              <button 
                onClick={() => setHomeFeedTab('all')}
                className={`text-[10px] uppercase font-black tracking-widest pb-3 border-b-2 transition-all ${homeFeedTab === 'all' ? 'text-accent border-accent' : 'text-text-dim border-transparent'}`}
              >
                সব পোস্ট
              </button>
              <button 
                onClick={() => setHomeFeedTab('following')}
                className={`text-[10px] uppercase font-black tracking-widest pb-3 border-b-2 transition-all ${homeFeedTab === 'following' ? 'text-accent border-accent' : 'text-text-dim border-transparent'}`}
              >
                ফলো করছেন যারা
              </button>
            </div>

            {/* Feed */}
            <div className="space-y-6 pb-20">
              {posts.filter(p => homeFeedTab === 'all' || followingUids.includes(p.authorUid) || p.authorUid === user?.uid).map((post) => (
                <PostCard 
                  key={post.id}
                  post={post}
                  theme={theme}
                  onLike={() => likePost(post.id)}
                  onReact={(type) => reactToPost(post.id, type)}
                  onComment={() => setCommentingPostId(post.id)}
                  onFollow={() => followUser(post.authorUid)}
                  onUnfollow={() => unfollowUser(post.authorUid)}
                  isFollowing={followingUids.includes(post.authorUid)}
                  currentUserId={user?.uid}
                />
              ))}
              {posts.filter(p => homeFeedTab === 'all' || followingUids.includes(p.authorUid) || p.authorUid === user?.uid).length === 0 && (
                <div className="p-10 text-center opacity-30">
                  <Globe className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-xs uppercase font-bold tracking-widest">
                    {homeFeedTab === 'following' ? 'আপনার ফলো করা কারো পোস্ট নেই' : 'নিউজ ফিড খালি'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        );
      case 'scan':
        return (
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div className="flex flex-col items-center justify-center relative">
                <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] geometric-ring">
                  <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-accent/30 flex items-center justify-center relative">
                    {isScanning && (
                      <>
                        <motion.div className="absolute inset-0 border border-accent rounded-full" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                        <motion.div className="absolute inset-0 border border-accent rounded-full" animate={{ scale: [1, 1.8], opacity: [0.3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                      </>
                    )}
                    <motion.div 
                      className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] bg-accent rounded-full flex flex-col justify-center items-center shadow-[0_0_50px_rgba(0,209,255,0.4)] z-10"
                      animate={isScanning ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <span className="text-bg-dark font-bold text-xs md:text-sm tracking-widest uppercase">{isScanning ? 'DISCOVERING' : 'READY'}</span>
                      <div className="text-2xl md:text-3xl mt-1">📶</div>
                    </motion.div>
                  </div>
                </div>
                <div className="mt-10 w-full space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest text-text-dim text-center">আশেপাশে থাকা ব্যবহারকারী ({onlineUsers.length})</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {onlineUsers.length > 0 ? (
                      onlineUsers.map((u) => (
                        <motion.div key={u.uid} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="geometric-card flex-row items-center gap-4 py-3 cursor-pointer hover:border-accent group" onClick={() => sendPairRequest(u)}>
                          <div className="w-10 h-10 rounded-full bg-surface border border-border-custom flex items-center justify-center group-hover:border-accent transition-colors overflow-hidden">
                            {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <UserIcon className="w-5 h-5 text-text-dim group-hover:text-accent" />}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold uppercase tracking-tighter">{u.displayName}</div>
                            <div className="text-[10px] text-accent uppercase">পেয়ার করতে ক্লিক করুন</div>
                          </div>
                          <UserPlus className="w-4 h-4 text-text-dim group-hover:text-accent" />
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-10 opacity-30 uppercase tracking-widest text-[10px]">কেউ অনলাইনে নেই</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="geometric-card p-10 items-center justify-center text-center space-y-4">
                  <Scan className="w-12 h-12 text-accent opacity-50" />
                  <h2 className="text-2xl font-light uppercase tracking-widest">Discovery Mode</h2>
                  <p className="text-text-dim text-sm max-w-xs">আশেপাশে থাকা অন্য ফোনে এই অ্যাপটি খোলা থাকলে আপনি তাদের এখানে দেখতে পাবেন।</p>
                  <Button className="geometric-btn geometric-btn-active mt-4" onClick={() => setIsScanning(!isScanning)}>{isScanning ? 'STOP SCAN' : 'START SCAN'}</Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'monetization':
        return (
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
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
      case 'profile':
        return (
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="geometric-card p-8 items-center text-center space-y-6">
                <div className="relative group">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface border-4 border-accent/20 overflow-hidden shadow-[0_0_40px_rgba(0,209,255,0.2)]">
                    {isUploadingPhoto ? (
                      <div className="w-full h-full flex items-center justify-center bg-bg-dark/50"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>
                    ) : user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-16 h-16 text-text-dim" /></div>
                    )}
                  </div>
                  <button onClick={handleProfilePictureClick} className="absolute bottom-2 right-2 p-3 bg-accent text-bg-dark rounded-full shadow-lg hover:scale-110 transition-transform">
                    <CameraIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold uppercase tracking-tighter">{user?.displayName}</h2>
                  <p className="text-accent text-[10px] uppercase font-bold tracking-[4px]">Verified User</p>
                </div>
                <div className="grid grid-cols-3 gap-8 w-full border-t border-border-custom pt-6">
                  <div><div className="text-xl font-bold">{posts.filter(p => p.authorUid === user?.uid).length}</div><div className="text-[8px] text-text-dim uppercase">পোস্ট</div></div>
                  <div><div className="text-xl font-bold">{user?.followersCount || 0}</div><div className="text-[8px] text-text-dim uppercase">ফলোয়ার</div></div>
                  <div><div className="text-xl font-bold">{user?.followingCount || 0}</div><div className="text-[8px] text-text-dim uppercase">ফলোইং</div></div>
                </div>
              </div>
              <div className="geometric-card p-6 space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-text-dim">প্রোফাইল এডিট করুন</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[8px] uppercase text-text-dim ml-1">ডিসপ্লে নাম</label>
                    <input type="text" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder={user?.displayName} className="w-full bg-surface border border-border-custom rounded-xl p-3 text-sm focus:border-accent transition-colors" />
                  </div>
                  <Button onClick={updateProfile} disabled={isUpdatingProfile || !newDisplayName.trim()} className="w-full bg-accent text-bg-dark font-bold uppercase text-[10px] tracking-widest h-12">
                    {isUpdatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : 'তথ্য আপডেট করুন'}
                  </Button>
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
          themeColor: '#00D1FF'
        };
        setAppConfig(defaultConfig);
        // Only an admin could initialize this if we really wanted to, but we'll let it be null for now if not exists
      }
    });

    return () => {
      configUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setAllUsers([]);
      return;
    }
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });
    return () => unsubscribe();
  }, [user]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as AppUser;
          // Bootstrap admin if email matches
          if (currentUser.email === "salman1000790@gmail.com" && userData.role !== 'admin') {
             await updateDoc(doc(db, 'users', currentUser.uid), { role: 'admin' });
             userData.role = 'admin';
          }
          setUser(userData);
        } else {
          const newUser: AppUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Anonymous',
            photoURL: currentUser.photoURL || '',
            isOnline: true,
            lastSeen: serverTimestamp(),
            role: currentUser.email === "salman1000790@gmail.com" ? 'admin' : 'user'
          };
          await setDoc(doc(db, 'users', currentUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

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

  // Play sound when new user comes online
  useEffect(() => {
    if (!isInitialOnlineLoad.current && onlineUsers.length > prevOnlineCount.current) {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }
    if (isInitialOnlineLoad.current && onlineUsers.length > 0) {
      isInitialOnlineLoad.current = false;
    }
    prevOnlineCount.current = onlineUsers.length;
  }, [onlineUsers]);

  // Comments Listener
  useEffect(() => {
    if (!commentingPostId) {
      setPostComments([]);
      return;
    }
    const q = query(
      collection(db, 'posts', commentingPostId, 'comments'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPostComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `posts/${commentingPostId}/comments`));
    return () => unsubscribe();
  }, [commentingPostId]);

  // Real-time Listeners
  useEffect(() => {
    if (!user || !isAuthReady) return;

    // 1. Listen for Online Users
    const usersQuery = query(collection(db, 'users'), where('isOnline', '==', true));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => doc.data() as AppUser)
        .filter(u => u.uid !== user.uid);
      setOnlineUsers(usersList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    // 2. Listen for Posts
    const postsQuery = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postsList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));

    // 3. Listen for Stories
    const storiesQuery = query(collection(db, 'stories'), orderBy('timestamp', 'desc'), limit(20));
    const unsubscribeStories = onSnapshot(storiesQuery, (snapshot) => {
      const storiesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Story));
      setStories(storiesList);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'stories'));

    // 4. Listen for Incoming Pair Requests
    const requestsQuery = query(
      collection(db, 'requests'), 
      where('toUid', '==', user.uid), 
      where('status', '==', 'pending')
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        const reqData: PairRequest = { 
          id: snapshot.docs[0].id, 
          fromUid: data.fromUid,
          fromName: data.fromName,
          toUid: data.toUid,
          toName: data.toName,
          status: data.status,
          timestamp: data.timestamp
        };
        setIncomingRequest(reqData);
        showNotification('নতুন পেয়ার রিকোয়েস্ট!', `${reqData.fromName} আপনার সাথে কানেক্ট হতে চায়।`);
      } else {
        setIncomingRequest(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'requests'));

    // 3. Listen for Accepted Requests (Incoming)
    const incomingAcceptedQuery = query(
      collection(db, 'requests'), 
      where('toUid', '==', user.uid), 
      where('status', '==', 'accepted')
    );
    const unsubscribeIncomingAccepted = onSnapshot(incomingAcceptedQuery, (snapshot) => {
      if (!snapshot.empty) {
        // Sort by timestamp in memory to avoid composite index requirement
        const docs = [...snapshot.docs].sort((a, b) => {
          const tA = a.data().timestamp?.toMillis() || 0;
          const tB = b.data().timestamp?.toMillis() || 0;
          return tB - tA;
        });
        const data = docs[0].data();
        if (!activeChat || activeChat.id !== docs[0].id) {
          setActiveChat({ id: docs[0].id, partnerId: data.fromUid, partnerName: data.fromName });
          setActiveTab('chat');
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'requests'));

    // 4. Listen for Accepted Requests (Outgoing)
    const outgoingAcceptedQuery = query(
      collection(db, 'requests'), 
      where('fromUid', '==', user.uid), 
      where('status', '==', 'accepted')
    );
    const unsubscribeOutgoingAccepted = onSnapshot(outgoingAcceptedQuery, (snapshot) => {
      if (!snapshot.empty) {
        // Sort by timestamp in memory to avoid composite index requirement
        const docs = [...snapshot.docs].sort((a, b) => {
          const tA = a.data().timestamp?.toMillis() || 0;
          const tB = b.data().timestamp?.toMillis() || 0;
          return tB - tA;
        });
        const data = docs[0].data();
        if (!activeChat || activeChat.id !== docs[0].id) {
          setActiveChat({ id: docs[0].id, partnerId: data.toUid, partnerName: data.toName });
          setActiveTab('chat');
        }
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'requests'));

    return () => {
      unsubscribeUsers();
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeRequests();
      unsubscribeIncomingAccepted();
      unsubscribeOutgoingAccepted();
    };
  }, [user, isAuthReady]);

  // Chat Messages Listener
  useEffect(() => {
    if (!activeChat) return;
    const messagesQuery = query(
      collection(db, 'chats', activeChat.id, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    let isInitialLoad = true;
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const newMessagesData: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderUid: data.senderUid,
          text: data.text,
          timestamp: data.timestamp,
          isRead: data.isRead
        };
      });
      
      // Handle notifications using docChanges
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !isInitialLoad) {
          const data = change.doc.data();
          if (data.senderUid !== user?.uid) {
            // Logic to determine if user should be notified
            const isNotVisible = !isAppActive || document.hidden || activeTab !== 'chat';
            if (isNotVisible) {
              showNotification(`${activeChat.partnerName}`, data.text);
            }
          }
        }
      });
      
      isInitialLoad = false;
      
      // Mark incoming messages as read if chat is active and tab is 'chat'
      if (activeTab === 'chat' && user) {
        snapshot.docs.forEach(async (d) => {
          const data = d.data();
          if (data.senderUid !== user.uid && !data.isRead) {
            try {
              await updateDoc(doc(db, 'chats', activeChat.id, 'messages', d.id), { isRead: true });
            } catch (e) {
              // Ignore errors for read receipts
            }
          }
        });
      }
      
      setMessages(newMessagesData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${activeChat.id}/messages`));

    return () => unsubscribeMessages();
  }, [activeChat?.id, user?.uid, isAppActive, activeTab]);

  // Typing Indicator Listener
  useEffect(() => {
    if (!activeChat || !user) return;
    const typingDoc = doc(db, 'chats', activeChat.id, 'typing', activeChat.partnerId);
    const unsubscribeTyping = onSnapshot(typingDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Only show typing if it was updated in the last 4 seconds
        const isRecent = data.timestamp && (Date.now() - data.timestamp.toMillis() < 4000);
        setIsPartnerTyping(data.isTyping && isRecent);
      } else {
        setIsPartnerTyping(false);
      }
    });
    return () => unsubscribeTyping();
  }, [activeChat, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User is handled by onAuthStateChanged
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        setErrorMessage('পপআপ ব্লক করা হয়েছে। দয়া করে পপআপ এলাউ করুন।');
      } else {
        setErrorMessage('লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const logout = async () => {
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { isOnline: false });
      setFollowingUids([]);
      await auth.signOut();
    }
  };

  const followUser = async (targetUid: string) => {
    if (!user || user.uid === targetUid) return;
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();
      batch.set(doc(db, 'users', user.uid, 'following', targetUid), {
        followerUid: user.uid,
        followedUid: targetUid,
        timestamp: now
      });
      batch.set(doc(db, 'users', targetUid, 'followers', user.uid), {
        followerUid: user.uid,
        followedUid: targetUid,
        timestamp: now
      });
      batch.update(doc(db, 'users', user.uid), { followingCount: increment(1) });
      batch.update(doc(db, 'users', targetUid), { followersCount: increment(1) });
      await batch.commit();
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const unfollowUser = async (targetUid: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'users', user.uid, 'following', targetUid));
      batch.delete(doc(db, 'users', targetUid, 'followers', user.uid));
      batch.update(doc(db, 'users', user.uid), { followingCount: increment(-1) });
      batch.update(doc(db, 'users', targetUid), { followersCount: increment(-1) });
      await batch.commit();
    } catch (err) {
      console.error('Unfollow error:', err);
    }
  };

  const sendPairRequest = async (targetUser: any) => {
    if (!user) return;
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
      // UI will wait for outgoing listener to trigger chat
    } catch (error) {
      console.error('Pair request error:', error);
      setErrorMessage('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.CREATE, 'requests');
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await updateDoc(doc(db, 'requests', requestId), { status });
      if (status === 'accepted') {
        const reqDoc = await getDoc(doc(db, 'requests', requestId));
        if (reqDoc.exists()) {
          const data = reqDoc.data();
          setActiveChat({ id: requestId, partnerId: data.fromUid, partnerName: data.fromName });
          setActiveTab('chat');
        }
      }
      setIncomingRequest(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `requests/${requestId}`);
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
      // Reset typing status
      await setDoc(doc(db, 'chats', activeChat.id, 'typing', user.uid), {
        isTyping: false,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Send message error:', error);
      setErrorMessage('মেসেজ পাঠাতে সমস্যা হয়েছে।');
      setTimeout(() => setErrorMessage(null), 4000);
      handleFirestoreError(error, OperationType.CREATE, `chats/${activeChat.id}/messages`);
    }
  };

  const handleTyping = async (text: string) => {
    setMessageInput(text);
    if (!activeChat || !user) return;
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      await setDoc(doc(db, 'chats', activeChat.id, 'typing', user.uid), {
        isTyping: text.length > 0,
        timestamp: serverTimestamp()
      });

      // Set timeout to stop typing indicator after 3 seconds of inactivity
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
    } catch (e) {
      // Silent fail for typing
    }
  };

  if (!isAuthReady) return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-accent uppercase tracking-widest animate-pulse">Initializing...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-dark text-text-main flex items-center justify-center p-4 font-sans">
        <Card className="max-w-md w-full bg-surface border-border-custom text-text-main shadow-2xl rounded-none">
            <CardHeader className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 relative overflow-hidden border-2 border-accent/30 bg-surface">
                <img 
                  src="https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png" 
                  alt="Porshi Logo" 
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://picsum.photos/seed/porshi/200/200';
                  }}
                />
              </div>
              <CardTitle className="text-4xl font-extrabold tracking-tighter uppercase mb-1 text-accent">PORSHI</CardTitle>
              <CardTitle className="text-2xl font-bold tracking-widest mb-4 text-white">পড়শি</CardTitle>
              <CardDescription className="text-text-dim text-sm">
                আশেপাশে থাকা মানুষের সাথে কানেক্ট করুন এবং কথা বলুন।
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-4">
            <div id="google-login-button" className="flex justify-center min-h-[44px]"></div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border-custom/30" />
              </div>
              <div className="relative flex justify-center text-[10px] items-center">
                <span className="bg-[#1A1A1C] px-2 text-text-dim uppercase font-bold tracking-widest">বা</span>
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-surface border border-border-custom hover:border-accent hover:text-accent text-text-dim transition-all rounded-xl font-bold uppercase tracking-widest text-[10px]"
              onClick={login}
            >
              ম্যানুয়াল পপআপ লগইন
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-[10px] text-text-dim uppercase tracking-widest">Secure Real-time Infrastructure</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-bg-dark text-text-main' : 'bg-gray-50 text-gray-900'} font-sans selection:bg-accent/30 flex flex-col items-center transition-colors duration-300`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col p-6 border-r ${theme === 'dark' ? 'border-border-custom bg-surface/30' : 'border-gray-200 bg-white'} backdrop-blur-xl z-50`}>
        {/* Hidden File Inputs */}
        <input type="file" accept="image/*" ref={postImageInputRef} onChange={handlePostImageChange} className="hidden" />
        <input type="file" accept="image/*" ref={storyImageInputRef} onChange={handleStoryImageChange} className="hidden" />
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
        </div>
        
          <nav className="flex-1 space-y-2">
            {[
              { id: 'home', icon: Home, label: 'হোম' },
              { id: 'scan', icon: Search, label: 'ডিসকভারি' },
              { id: 'chat', icon: MessageCircle, label: 'মেসেজ' },
              { id: 'monetization', icon: LayoutDashboard, label: 'মনিটাইজেশন' },
              { id: 'notifications', icon: Bell, label: 'নটিফিকেশন' },
              { id: 'profile', icon: UserIcon, label: 'প্রোফাইল' },
              ...(user?.role === 'admin' ? [{ id: 'admin', icon: Activity, label: 'অ্যাডমিন' }] : []),
            ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-accent text-bg-dark font-bold' : 'text-text-dim hover:bg-surface hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm uppercase tracking-tighter">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border-custom">
          <button onClick={logout} className="w-full flex items-center gap-4 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="text-sm uppercase font-bold">লগআউট</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={`lg:hidden w-full p-4 flex justify-between items-center border-b ${theme === 'dark' ? 'border-border-custom bg-bg-dark/80' : 'border-gray-200 bg-white/80'} backdrop-blur-md sticky top-0 z-40`}>
        <div className="flex flex-col">
          <div className="text-xl font-black tracking-widest text-accent">{currentApp === 'porshi' ? 'PORSHI' : 'PORSH'}</div>
          <button 
            onClick={() => setCurrentApp(currentApp === 'porshi' ? 'porsh' : 'porshi')}
            className="text-[8px] font-bold uppercase text-accent/60 flex items-center gap-1"
          >
            Switch to {currentApp === 'porshi' ? 'Porsh' : 'Porshi'}
            <Minimize2 className="w-2 h-2" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>
          <Button variant="ghost" size="icon" className="text-text-dim"><Search className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="text-text-dim"><Bell className="w-5 h-5" /></Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl lg:ml-64 flex flex-col min-h-screen">
        {renderContent()}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className={`lg:hidden fixed bottom-0 left-0 w-full ${theme === 'dark' ? 'bg-surface/80 border-border-custom' : 'bg-white/80 border-gray-200'} backdrop-blur-2xl border-t flex justify-around items-center p-3 z-50`}>
        {[
          { id: 'home', icon: Home, app: 'porshi' },
          { id: 'scan', icon: Search, app: 'porshi' },
          { id: 'messenger', icon: MessageSquare, app: 'porsh' },
          { id: 'monetization', icon: LayoutDashboard, app: 'porshi' },
          ...(user?.role === 'admin' ? [{ id: 'admin', icon: Activity, app: 'porshi' }] : [{ id: 'profile', icon: UserIcon, app: 'porshi' }]),
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.app === 'porsh') {
                setCurrentApp('porsh');
              } else {
                setCurrentApp('porshi');
                setActiveTab(item.id);
              }
            }}
            className={`p-2 rounded-xl transition-all ${(activeTab === item.id && currentApp === item.app) || (item.app === 'porsh' && currentApp === 'porsh') ? 'text-accent scale-110' : 'text-text-dim'}`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
      </nav>

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
              <img src={activeStory.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-0 left-0 w-full p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-accent overflow-hidden">
                    <img src={activeStory.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                          <img src={c.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
