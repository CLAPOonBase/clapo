// API Types based on the Snaps API Documentation

// Authentication Types
export interface SignupRequest {
  username: string
  email: string
  password: string
  bio: string
  avatarUrl: string
}

export interface SignupResponse {
  message: string
  user: {
    id: string
    username: string
    email: string
    bio: string
    avatarUrl: string
    createdAt: string
  }
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  message: string
  user: {
    id: string
    username: string
    email: string
  }
  token: string
}

// Reputation Types (matching backend implementation)
export type ReputationTier ='Bronze' |'Silver' | 'Gold' |'Diamond' |'Platinum' | 'newcomer' | 'contributor' | 'veteran' | 'expert' | 'legend'

export interface ReputationScore {
  user_id: string
  score: number
  tier: ReputationTier
  daily_stats: {
    claps_given: number
    claps_received: number
    replies_given: number
    replies_received: number
    remixes_given: number
    remixes_received: number
    givereps_given: number
  }
  lifetime_stats: {
    claps_given: number
    claps_received: number
    replies_given: number
    replies_received: number
    remixes_given: number
    remixes_received: number
    givereps_given: number
  }
  last_decay_at: string
  created_at: string
  updated_at: string
}

export interface ReputationEvent {
  id: string
  user_id: string
  event_type: 'clap_given' | 'clap_received' | 'reply_given' | 'reply_received' | 'remix_given' | 'remix_received' | 'giverep_given' | 'giverep_received' | 'decay' | 'manual_adjustment' | 'penalty'
  points_change: number
  score_before: number
  score_after: number
  tier_before: ReputationTier
  tier_after: ReputationTier
  from_user_id?: string
  from_user?: {
    id: string
    username: string
    avatar_url: string
  }
  post_id?: string
  comment_id?: string
  context?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface ReputationHistoryResponse {
  success: boolean
  data: ReputationEvent[]
  pagination: {
    limit: number
    offset: number
  }
}

export interface GiveRepRequest {
  from_user_id: string
  to_user_id: string
  context?: string
}

export interface GiveRepResponse {
  success: boolean
  message: string
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  avatar_url: string
  score: number
  tier: ReputationTier
  lifetime_claps_received: number
  lifetime_replies_received: number
  lifetime_remixes_received: number
  lifetime_givereps_received: number
  rank: number
}

export interface LeaderboardResponse {
  success: boolean
  data: LeaderboardEntry[]
  pagination: {
    limit: number
    offset: number
  }
}

export interface ReputationResponse {
  success: boolean
  data: ReputationScore
}

// User Profile Types
export interface UserProfile {
  id: string
  username: string
  email: string
  bio: string
  avatarUrl: string
  createdAt: string
  followerCount: number
  followingCount: number
  reputation_score?: number
  reputation_tier?: ReputationTier
  total_posts?: number
  total_likes_given?: number
  total_comments_made?: number
  total_retweets_made?: number
  total_bookmarks_made?: number
  posts?: Array<{
    id: string
    content: string
    media_url?: string
    created_at: string
    parent_post_id?: string
    is_retweet: boolean
    retweet_ref_id?: string
    view_count: number
    like_count: number
    comment_count: number
    retweet_count: number
    original_post_content?: string
    original_post_username?: string
  }>
  recent_activity?: Array<{
    activity_type: 'like' | 'comment' | 'retweet' | 'post_created'
    created_at: string
    post_content: string
    post_id: string
  }>
}

export interface ProfileResponse {
  message: string
  profile: UserProfile
}

export interface UpdateProfileRequest {
  username?: string
  bio?: string
  avatarUrl?: string
}

export interface SearchUsersResponse {
  message: string
  users: Array<{
    id: string
    username: string
    email: string
    bio: string
    avatar_url: string | null
    created_at: string
  }>
}

// Post Types
export interface CreatePostRequest {
  userId: string
  content: string
  mediaUrl?: string
  parentPostId?: string
  isRetweet?: boolean
  retweetRefId?: string
  mentions?: string[] // Array of mentioned user IDs
}

export interface Post {
  id: string
  user_id: string
  content: string
  media_url?: string
  created_at: string
  parent_post_id?: string
  is_retweet: boolean
  retweet_ref_id?: string
  view_count: number
  like_count: number
  comment_count: number
  retweet_count: number
  post_popularity_score: number
  username: string
  avatar_url: string
  author_reputation?: number
  author_reputation_tier?: ReputationTier
  mentions?: Array<{
    user_id: string
    username: string
    avatar_url?: string
    name?: string
  }>
  likes?: Array<{
    user_id: string
    username: string
    avatar_url: string
  }>
  retweets?: Array<{
    user_id: string
    username: string
    avatar_url: string
  }>
  bookmarks?: Array<{
    user_id: string
    username: string
    avatar_url: string
  }>
  comments?: Array<{
    id: string
    content: string
    created_at: string
    user_id: string
    username: string
    avatar_url: string
    author_reputation?: number
    author_reputation_tier?: ReputationTier
  }>
}

export interface CreatePostResponse {
  message: string
  post: Post
}

export interface FeedResponse {
  message: string
  posts: Post[]
}

// Engagement Types
export interface ViewPostRequest {
  viewerId: string
}

export interface ViewPostResponse {
  message: string
  viewCount: number
}

export interface LikePostRequest {
  likerId: string
}

export interface LikeResponse {
  message: string
  like: {
    id: string
    likerId: string
    postId: string
    createdAt: string
  }
}

export interface UnlikeResponse {
  message: string
  unlike: {
    id: string
    likerId: string
    postId: string
  }
}

export interface CommentRequest {
  commenterId: string
  content: string
  mediaUrl?: string
}

export interface CommentResponse {
  message: string
  comment: {
    id: string
    commenterId: string
    postId: string
    content: string
    createdAt: string
  }
}

export interface RetweetRequest {
  userId: string
}

export interface RetweetResponse {
  message: string
  retweet: {
    id: string
    userId: string
    postId: string
    createdAt: string
  }
}

export interface BookmarkRequest {
  bookmarkerId: string
}

export interface BookmarkResponse {
  message: string
  bookmark: {
    id: string
    bookmarkerId: string
    postId: string
  }
}

// Social Features Types
export interface FollowRequest {
  followerId: string
}

export interface FollowResponse {
  message: string
  follow: {
    id: string
    followerId: string
    followingId: string
    createdAt: string
  }
}

export interface UnfollowResponse {
  message: string
  unfollow: {
    id: string
    followerId: string
    followingId: string
  }
}

// Messaging Types
export interface CreateMessageThreadRequest {
  creatorId: string
  targetUserId: string
  name?: string // Optional name for the thread
}

export interface CreateThreadRequest {
  creatorId: string
  isGroup: boolean
  name: string
}

export interface Thread {
  id: string
  creatorId: string
  isGroup: boolean
  name: string
  createdAt: string
}

export interface CreateThreadResponse {
  message: string
  thread: Thread
}

export interface SendMessageRequest {
  senderId: string
  content: string
  mediaUrl?: string
}

export interface SendMessageResponse {
  message: string
  messageData: Message
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  mediaUrl?: string
  createdAt: string
}

export interface ThreadMessage {
  id: string
  thread_id: string
  sender_id: string
  content: string
  media_url?: string
  created_at: string
}

export interface MessageThreadsResponse {
  message: string
  threads: Thread[]
}

export interface ThreadMessagesResponse {
  message: string
  messages: ThreadMessage[]
}

export interface AddParticipantRequest {
  threadId: string
  userId: string
}

export interface AddParticipantResponse {
  message: string
  participant: {
    id: string
    thread_id: string
    user_id: string
    joined_at: string
  }
}

// Communities Types
export interface CreateCommunityRequest {
  name: string
  description: string
  creatorId: string
}

export interface Community {
  profile_picture_url: string
  id: string
  name: string
  description: string
  creator_id: string
  created_at: string
  creator_username: string
  creator_avatar: string
  user_joined_at?: string | null
  user_is_admin?: boolean
  member_count: number
}

export interface CreateCommunityResponse {
  message: string
  community: Community
}

export interface JoinCommunityRequest {
  userId: string
}

export interface JoinCommunityResponse {
  message: string
  join: {
    id: string
    communityId: string
    userId: string
    joinedAt: string
    isAdmin: boolean
  }
}

export interface CommunityMember {
  id: string
  community_id: string
  user_id: string
  joined_at: string
  is_admin: boolean
  username: string
  avatar_url: string
  bio: string
}

export interface CommunitiesResponse {
  message: string
  communities: Community[]
}

export interface CommunityMembersResponse {
  message: string
  members: CommunityMember[]
}

export interface CommunityMessagesResponse {
  message: string
  messages: Message[]
}

// Notification Types
export interface Notification {
  id: string
  user_id: string
  type: 'like' | 'retweet' | 'follow' | 'comment' | 'mention'
  content: string
  related_id: string
  is_read: boolean
  created_at: string
  // Enhanced notification data
  actor_id?: string
  actor_username?: string
  actor_avatar_url?: string
  post_id?: string
  post_content_preview?: string
  post_media_url?: string
  comment_content?: string
  mention_context?: string
}

// Enhanced Notification Types (new backend API)
export interface EnhancedNotification {
  id: string
  type: 'like' | 'comment' | 'retweet' | 'bookmark' | 'follow' | 'dm' | 'community_message'
  user_id: string
  from_user_id: string
  ref_id: string
  is_read: boolean
  created_at: string
  from_user: {
    id: string
    username: string
    email: string
    bio: string
    avatar_url: string
    created_at: string
  }
  content: {
    id: string
    content: string
    media_url: string | null
    created_at: string
    view_count: number
    like_count: number
    comment_count: number
    retweet_count: number
    author_username: string
    author_avatar: string
  }
  context: {
    action: string
    preview: string
    engagement: string
  }
}

export interface NotificationsResponse {
  message: string
  notifications: Notification[]
}

export interface EnhancedNotificationsResponse {
  message: string
  notifications: EnhancedNotification[]
}

// Activity Types
export interface Activity {
  id: string
  userId: string
  activityType: 'post_created' | 'like' | 'retweet' | 'follow' | 'comment'
  targetId: string
  timestamp: string
}

export interface ActivityResponse {
  message: string
  activities: Activity[]
}

// API Error Types
export interface ApiError {
  message: string
  status: number
  error?: string
}

export interface MessageThread {
  id: string
  creatorId: string
  isGroup: boolean
  name: string
  createdAt: string
  participants?: Array<{
    avatar_url: string
    id: string
    user_id: string
    username: string
    name?: string
    avatar?: string
    bio?: string
    lastSeen?: string
  }>
}

export interface ThreadMessage {
  id: string
  threadId: string
  senderId: string
  content: string
  mediaUrl?: string
  createdAt: string
}

export interface CommunityMessage {
  id: string
  community_id: string
  sender_id: string
  content: string
  media_url?: string
  created_at: string
  sender_username?: string
  sender_avatar?: string
} 