/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
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
  ArrowLeft
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
  Timestamp
} from './firebase';

interface AppUser {
  uid: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: any;
}

interface PairRequest {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: any;
}

interface ChatMessage {
  id: string;
  senderUid: string;
  text: string;
  timestamp: any;
  isRead?: boolean;
}

interface ActiveChat {
  id: string;
  partnerId: string;
  partnerName: string;
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
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
  const requestBrowserPermission = () => {
    if (canShowBrowserNotifications) {
      Notification.requestPermission();
    }
  };
  const chatEndRef = useRef<HTMLDivElement>(null);

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
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as AppUser);
        } else {
          const newUser: AppUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Anonymous',
            photoURL: currentUser.photoURL || '',
            isOnline: true,
            lastSeen: serverTimestamp()
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

    // 2. Listen for Incoming Pair Requests
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
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderUid: data.senderUid,
          text: data.text,
          timestamp: data.timestamp,
          isRead: data.isRead
        };
      });
      
      // Mark incoming messages as read if chat is active and tab is 'chat'
      if (activeTab === 'chat' && user) {
        snapshot.docs.forEach(async (d) => {
          const data = d.data();
          if (data.senderUid !== user.uid && !data.isRead) {
            try {
              await updateDoc(doc(db, 'chats', activeChat.id, 'messages', d.id), { isRead: true });
            } catch (e) {
              // Ignore errors for read receipts to avoid spamming
            }
          }
        });
      }
      
      // Show notification for new incoming message if tab is hidden
      if (newMessages.length > messages.length) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.senderUid !== user?.uid && (document.hidden || activeTab !== 'chat')) {
          showNotification(`নতুন মেসেজ: ${activeChat.partnerName}`, lastMsg.text);
        }
      }
      
      setMessages(newMessages);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${activeChat.id}/messages`));

    return () => unsubscribeMessages();
  }, [activeChat?.id, user?.uid, activeTab]);

  // Typing Indicator Listener
  useEffect(() => {
    if (!activeChat || !user) return;
    const typingDoc = doc(db, 'chats', activeChat.id, 'typing', activeChat.partnerId);
    const unsubscribeTyping = onSnapshot(typingDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        // Only show typing if it was updated in the last 10 seconds
        const isRecent = data.timestamp && (Date.now() - data.timestamp.toMillis() < 10000);
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
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const logout = async () => {
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { isOnline: false });
      await auth.signOut();
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
      handleFirestoreError(error, OperationType.CREATE, `chats/${activeChat.id}/messages`);
    }
  };

  const handleTyping = async (text: string) => {
    setMessageInput(text);
    if (!activeChat || !user) return;
    
    try {
      await setDoc(doc(db, 'chats', activeChat.id, 'typing', user.uid), {
        isTyping: text.length > 0,
        timestamp: serverTimestamp()
      });
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
          <CardContent>
            <Button 
              className="w-full h-14 bg-accent text-bg-dark hover:bg-white transition-all rounded-none font-bold uppercase tracking-widest"
              onClick={login}
            >
              Login with Google
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
    <div className="min-h-screen bg-bg-dark text-text-main font-sans selection:bg-accent/30 flex flex-col items-center p-4 md:p-10">
      <header className="w-full max-w-5xl flex justify-between items-center border-b border-border-custom pb-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 relative overflow-hidden border border-accent/30 bg-surface">
            <img 
              src="https://r.jina.ai/i/698785014730/bc2193c0-b3ea-4959-83b1-91ff4a797297/4e650d32-8f9d-473d-815a-938221235948.png" 
              alt="Porshi Logo" 
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://picsum.photos/seed/porshi/100/100';
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="text-2xl font-extrabold tracking-[2px] uppercase text-accent leading-none">PORSHI</div>
            <div className="text-sm font-bold text-text-main tracking-widest mt-1">পড়শি</div>
          </div>
          <Badge variant="outline" className="hidden md:flex border-accent/30 text-accent bg-accent/5 uppercase text-[10px]">Global</Badge>
        </div>
        <div className="flex items-center gap-4">
          {canShowBrowserNotifications && browserNotificationPermission !== 'granted' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={requestBrowserPermission}
              className="hidden md:flex border-accent/50 text-accent hover:bg-accent hover:text-bg-dark text-[10px] uppercase font-bold"
            >
              Enable Notifications
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={logout} className="text-text-dim hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {canShowBrowserNotifications && browserNotificationPermission !== 'granted' && (
        <div className="w-full max-w-5xl mb-6 md:hidden">
          <Alert className="bg-accent/10 border-accent/20 text-accent rounded-none">
            <Info className="w-4 h-4" />
            <AlertDescription className="text-[10px] uppercase font-bold flex justify-between items-center gap-2">
              নটিফিকেশন অন করুন যাতে অ্যাপের বাইরে থাকলেও রিকোয়েস্ট পান।
              <Button size="sm" onClick={requestBrowserPermission} className="bg-accent text-bg-dark text-[8px] h-6 px-2 shrink-0">অন করুন</Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl flex flex-col relative">
        {/* Tab Navigation - Only show if NO active chat */}
        {!activeChat && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <button onClick={() => setActiveTab('scan')} className={`geometric-btn ${activeTab === 'scan' ? 'geometric-btn-active' : ''}`}>স্ক্যান</button>
            <button onClick={() => setActiveTab('chat')} className={`geometric-btn ${activeTab === 'chat' ? 'geometric-btn-active' : ''}`}>চ্যাট</button>
            <button onClick={() => setActiveTab('history')} className={`geometric-btn ${activeTab === 'history' ? 'geometric-btn-active' : ''}`}>ইতিহাস</button>
            <button onClick={() => setActiveTab('tools')} className={`geometric-btn ${activeTab === 'tools' ? 'geometric-btn-active' : ''}`}>টুলস</button>
            <button onClick={() => setActiveTab('profile')} className={`geometric-btn ${activeTab === 'profile' ? 'geometric-btn-active' : ''}`}>প্রোফাইল</button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* SCAN TAB */}
          {activeTab === 'scan' && !activeChat && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* Left Column: Visualizer & Discovery */}
                <div className="flex flex-col items-center justify-center relative">
                  <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] geometric-ring">
                    <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-accent/30 flex items-center justify-center relative">
                      {/* Pulse Rings */}
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
                        <span className="text-bg-dark font-bold text-xs md:text-sm tracking-widest uppercase">
                          {isScanning ? 'DISCOVERING' : 'READY'}
                        </span>
                        <div className="text-2xl md:text-3xl mt-1">📶</div>
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="mt-10 w-full space-y-4">
                    <h3 className="text-[10px] uppercase tracking-widest text-text-dim text-center">আশেপাশে থাকা ব্যবহারকারী ({onlineUsers.length})</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {onlineUsers.length > 0 ? (
                        onlineUsers.map((u) => (
                          <motion.div 
                            key={u.uid}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="geometric-card flex-row items-center gap-4 py-3 cursor-pointer hover:border-accent group"
                            onClick={() => sendPairRequest(u)}
                          >
                            <div className="w-10 h-10 rounded-full bg-surface border border-border-custom flex items-center justify-center group-hover:border-accent transition-colors">
                              <UserIcon className="w-5 h-5 text-text-dim group-hover:text-accent" />
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

                {/* Right Column: Scan Controls */}
                <div className="space-y-6">
                  <div className="geometric-card p-10 items-center justify-center text-center space-y-4">
                    <Scan className="w-12 h-12 text-accent opacity-50" />
                    <h2 className="text-2xl font-light uppercase tracking-widest">Discovery Mode</h2>
                    <p className="text-text-dim text-sm max-w-xs">আশেপাশে থাকা অন্য ফোনে এই অ্যাপটি খোলা থাকলে আপনি তাদের এখানে দেখতে পাবেন।</p>
                    <Button 
                      className="geometric-btn geometric-btn-active mt-4"
                      onClick={() => setIsScanning(!isScanning)}
                    >
                      {isScanning ? 'STOP SCAN' : 'START SCAN'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="geometric-card py-4">
                      <h3 className="text-[10px] uppercase tracking-widest text-text-dim mb-1">আপনার আইডি</h3>
                      <div className="text-xs font-mono truncate">{user.uid.slice(0, 12)}...</div>
                    </div>
                    <div className="geometric-card py-4">
                      <h3 className="text-[10px] uppercase tracking-widest text-text-dim mb-1">স্ট্যাটাস</h3>
                      <div className="text-xs text-green-400 uppercase font-bold">সক্রিয়</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CHAT OVERLAY / TAB */}
          {(activeTab === 'chat' || activeChat) && (
            <motion.div 
              key="chat" 
              initial={{ opacity: 0, x: '100%' }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`flex-1 flex flex-col ${activeChat ? 'fixed inset-0 z-[100] bg-bg-dark' : ''}`}
            >
              {activeChat ? (
                <div className="flex-1 flex flex-col overflow-hidden w-full h-full bg-bg-dark">
                  <div className="p-4 border-b border-border-custom flex justify-between items-center bg-surface/95 backdrop-blur-2xl sticky top-0 z-20 shadow-md">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" onClick={() => setActiveTab('scan')} className="text-text-dim hover:text-accent">
                        <ArrowLeft className="w-6 h-6" />
                      </Button>
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                          <UserIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-bg-dark rounded-full"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold uppercase tracking-tighter text-sm text-white">{activeChat.partnerName}</span>
                        <span className="text-[10px] text-accent uppercase font-bold animate-pulse">অনলাইন</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setActiveChat(null); setActiveTab('scan'); }} className="text-text-dim hover:text-red-400">
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-bg-dark">
                    <div className="flex flex-col items-center justify-center py-10 opacity-20">
                      <div className="w-16 h-16 rounded-full border border-accent flex items-center justify-center mb-4">
                        <UserIcon className="w-8 h-8 text-accent" />
                      </div>
                      <p className="text-[10px] uppercase tracking-[4px] text-center">End-to-end encrypted chat with {activeChat.partnerName}</p>
                    </div>
                    {messages.map((msg, idx) => {
                      const isMe = msg.senderUid === user.uid;
                      const prevMsg = idx > 0 ? messages[idx - 1] : null;
                      const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
                      
                      const isLastInGroup = !nextMsg || nextMsg.senderUid !== msg.senderUid;
                      const isFirstInGroup = !prevMsg || prevMsg.senderUid !== msg.senderUid;
                      const showAvatar = !isMe && isLastInGroup;
                      
                      return (
                        <motion.div 
                          key={msg.id} 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 ${isLastInGroup ? 'mb-4' : 'mb-1'}`}
                        >
                          {!isMe && (
                            <div className="w-8 flex justify-center">
                              {showAvatar ? (
                                <div className="w-8 h-8 rounded-full bg-surface border border-border-custom flex items-center justify-center shadow-sm">
                                  <UserIcon className="w-4 h-4 text-accent" />
                                </div>
                              ) : (
                                <div className="w-8" />
                              )}
                            </div>
                          )}
                          
                          <div className={`max-w-[75%] p-3 px-4 shadow-md transition-all hover:brightness-110 ${
                            isMe 
                              ? `bg-gradient-to-br from-accent to-blue-600 text-bg-dark font-medium rounded-2xl ${isLastInGroup ? 'rounded-br-none' : ''}` 
                              : `bg-surface border border-border-custom text-text-main rounded-2xl ${isLastInGroup ? 'rounded-bl-none' : ''}`
                          }`}>
                            <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                            <div className="flex items-center justify-end gap-1 mt-1">
                              <div className={`text-[8px] uppercase opacity-50 ${isMe ? 'text-bg-dark' : 'text-text-dim'}`}>
                                {msg.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {isMe && isLastInGroup && (
                                <div className={`text-[8px] font-bold uppercase ${msg.isRead ? 'text-bg-dark opacity-80' : 'text-bg-dark opacity-30'}`}>
                                  {msg.isRead ? 'Read' : 'Sent'}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    
                    {isPartnerTyping && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start items-center gap-2 mb-4"
                      >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border-custom flex items-center justify-center shadow-sm">
                          <UserIcon className="w-4 h-4 text-accent" />
                        </div>
                        <div className="bg-surface border border-border-custom p-2 px-4 rounded-2xl rounded-bl-none flex gap-1 items-center">
                          <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1 h-1 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={sendMessage} className="p-4 border-t border-border-custom flex gap-2 bg-surface/80 backdrop-blur-md">
                    <Input 
                      value={messageInput}
                      onChange={(e) => handleTyping(e.target.value)}
                      placeholder="মেসেঞ্জার স্টাইলে চ্যাট করুন..."
                      className="bg-bg-dark border-border-custom rounded-full px-6 h-12 focus:ring-accent/50 text-sm"
                    />
                    <Button type="submit" className="bg-accent text-bg-dark hover:bg-white rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-[0_0_20px_rgba(0,209,255,0.3)]">
                      <Send className="w-5 h-5" />
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="geometric-card items-center justify-center py-20 opacity-30 text-center border-dashed">
                  <MessageSquare className="w-16 h-16 mb-6 mx-auto text-accent animate-pulse" />
                  <h3 className="uppercase tracking-[4px] text-sm font-bold">No Active Session</h3>
                  <p className="text-[10px] mt-2 max-w-[200px] mx-auto leading-relaxed">আশেপাশে থাকা কাউকে পেয়ার রিকোয়েস্ট পাঠান অথবা কারো রিকোয়েস্ট একসেপ্ট করুন।</p>
                </div>
              )}
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && !activeChat && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex-1 w-full max-w-md mx-auto">
              <div className="geometric-card p-8 space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-accent p-1 mb-4 relative">
                    <div className="w-full h-full rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <UserIcon className="w-10 h-10 text-accent" />
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-bg-dark rounded-full"></div>
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tighter text-white">{user.displayName}</h2>
                  <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">আপনার প্রোফাইল এডিট করুন</p>
                </div>

                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[2px] font-bold text-accent ml-1">ডিসপ্লে নাম</label>
                    <Input 
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="আপনার নাম লিখুন"
                      className="bg-bg-dark border-border-custom text-white rounded-none h-12 focus:ring-accent"
                      maxLength={20}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isUpdatingProfile || !newDisplayName.trim() || newDisplayName === user.displayName}
                    className="w-full h-12 bg-accent text-bg-dark hover:bg-white rounded-none font-bold uppercase tracking-widest disabled:opacity-50"
                  >
                    {isUpdatingProfile ? 'আপডেট হচ্ছে...' : 'সেভ করুন'}
                  </Button>
                </form>

                <div className="pt-6 border-t border-border-custom">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-text-dim">
                    <span>ইউজার আইডি</span>
                    <span className="font-mono text-[8px]">{user.uid.substring(0, 12)}...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && !activeChat && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <div className="geometric-card p-10 items-center justify-center text-center opacity-30">
                <div className="text-[10px] uppercase tracking-[4px]">History coming soon</div>
              </div>
            </motion.div>
          )}

          {/* TOOLS TAB */}
          {activeTab === 'tools' && !activeChat && (
            <motion.div key="tools" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <div className="geometric-card p-10 items-center justify-center text-center opacity-30">
                <div className="text-[10px] uppercase tracking-[4px]">Tools coming soon</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Incoming Request Overlay */}
      <AnimatePresence>
        {incomingRequest && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 100 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.9, y: 100 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-md"
          >
            <div className="w-full max-w-sm bg-surface border-2 border-accent p-8 shadow-[0_0_100px_rgba(0,209,255,0.4)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-accent animate-pulse"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 border-2 border-accent/30 animate-bounce">
                  <UserPlus className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">নতুন রিকোয়েস্ট!</h2>
                <p className="text-text-dim text-sm mb-8">
                  <span className="text-accent font-bold">{incomingRequest.fromName}</span> আপনার সাথে কানেক্ট হতে চায়। আপনি কি রাজি?
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
                    className="flex-1 bg-accent text-bg-dark hover:bg-white rounded-none uppercase font-bold text-xs h-12 shadow-[0_0_20px_rgba(0,209,255,0.4)]"
                    onClick={() => respondToRequest(incomingRequest.id, 'accepted')}
                  >
                    হ্যাঁ, অবশ্যই
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Bubble for Minimized Chat */}
      <AnimatePresence>
        {activeChat && activeTab !== 'chat' && (
          <motion.div
            initial={{ scale: 0, opacity: 0, x: 50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0, opacity: 0, x: 50 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab('chat')}
            className="fixed bottom-24 right-6 z-[100] cursor-pointer"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-accent p-1 shadow-[0_0_30px_rgba(0,209,255,0.5)] border-2 border-white/20 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full bg-bg-dark flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-accent" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-bg-dark flex items-center justify-center animate-bounce">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-bg-dark text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-md whitespace-nowrap">
                {activeChat.partnerName}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl mt-10">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400 rounded-none">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="uppercase tracking-widest text-xs font-bold">Error</AlertTitle>
            <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <footer className="w-full max-w-5xl mt-10 pt-6 border-t border-border-custom flex justify-between items-center text-[10px] text-text-dim uppercase tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3" /> REAL-TIME</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> SECURE CHAT</span>
        </div>
        <div>© 2024 PORSHI-পড়শি</div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2C2C2E; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8E8E93; }
      `}} />
    </div>
  );
}
