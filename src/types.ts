import { Timestamp } from 'firebase/firestore';

export interface AppUser {
  uid: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: any;
  followersCount?: number;
  followingCount?: number;
  role?: 'admin' | 'user';
}

export interface Follow {
  followerUid: string;
  followedUid: string;
  timestamp: any;
}

export interface Post {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  mediaType?: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  likesCount: number;
  commentsCount: number;
  reactions?: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  timestamp: any;
  isLiked?: boolean;
}

export interface Story {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  mediaType?: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  timestamp: any;
  expiresAt: any;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  text: string;
  timestamp: any;
  isRead?: boolean;
}

export interface PairRequest {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: any;
}

export interface MonetizationData {
  totalEarnings: number;
  monthlyEarnings: number;
  reach: number;
  engagement: number;
  followers: number;
  lastUpdated: any;
}

export interface AppConfig {
  maintenanceMode: boolean;
  welcomeMessage: string;
  appVersion: string;
  minVersion: string;
  contactEmail: string;
  announcement: string;
  themeColor: string;
}

declare global {
  interface Window {
    google: any;
  }
}
