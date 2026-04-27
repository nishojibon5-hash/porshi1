import { Timestamp } from 'firebase/firestore';

export interface AppUser {
  uid: string;
  displayName: string;
  phoneNumber?: string;
  photoURL: string;
  coverPhotoURL?: string;
  bio?: string;
  hometown?: string;
  currentCity?: string;
  education?: string;
  work?: string;
  relationshipStatus?: string;
  website?: string;
  isOnline: boolean;
  lastSeen: any;
  followersCount?: number;
  followingCount?: number;
  role?: 'admin' | 'user';
  isMonetized?: boolean;
  autoplayVideos?: boolean;
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
  mediaType?: 'image' | 'video' | 'text' | 'link';
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  linkUrl?: string;
  isReel?: boolean;
  likesCount: number;
  commentsCount: number;
  reactions?: Record<string, number>;
  timestamp: any;
  isLiked?: boolean;
  userReaction?: string;
  isMonetized?: boolean;
  viewsCount?: number;
  reachCount?: number;
  privacy?: 'public' | 'followers' | 'private';
  isEdited?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto: string;
  text: string;
  imageUrl?: string;
  stickerUrl?: string;
  reactions?: Record<string, number>;
  userReaction?: string;
  timestamp: any;
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
  reactions?: Record<string, string>;
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

export interface MonetizationUpdate {
  id: string;
  type: 'Video Bonus' | 'Stars' | 'Ad Revenue' | 'Referral';
  amount: number;
  timestamp: any;
}

export interface MonetizationData {
  totalEarnings: number;
  monthlyEarnings: number;
  reach: number;
  engagement: number;
  followers: number;
  lastUpdated: any;
  dailyStats?: { day: string; amount: number }[];
  recentUpdates?: MonetizationUpdate[];
}

export interface AppConfig {
  maintenanceMode: boolean;
  welcomeMessage: string;
  appVersion: string;
  minVersion: string;
  contactEmail: string;
  announcement: string;
  themeColor: string;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
  adPaidMode: boolean;
  adPaymentNumber: string;
  appIcon?: string;
  appName?: string;
  pwaThemeColor?: string;
  pwaBackgroundColor?: string;
  enableChat?: boolean;
  enableFeed?: boolean;
  enableStories?: boolean;
  enableAds?: boolean;
  loginLogoUrl?: string;
  headerLogoUrl?: string;
  appLogoUrl?: string;
}

export interface Advertisement {
  id: string;
  advertiserUid: string;
  advertiserName: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  objective: 'views' | 'likes' | 'comments' | 'followers' | 'sales' | 'website_views';
  location: string;
  audience: string;
  adType?: 'banner' | 'video_skippable';
  videoAdUrl?: string;
  websiteUrl?: string;
  durationDays: number;
  budget: number;
  status: 'pending' | 'active' | 'completed' | 'paused';
  paymentStatus: 'unpaid' | 'paid';
  timestamp: any;
  expiresAt: any;
  reach: number;
  clicks: number;
  isAdminAd?: boolean;
  vastUrl?: string;
  vastType?: 'pre-roll' | 'mid-roll' | 'post-roll';
  adCode?: string;
}

export interface AppNotification {
  id: string;
  toUid: string | 'all';
  fromUid?: string;
  fromName?: string;
  fromPhoto?: string;
  type: 'like' | 'comment' | 'follow' | 'system' | 'link' | 'event' | 'message' | 'pair_request';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  timestamp: any;
}

declare global {
  interface Window {
    google: any;
  }
}
