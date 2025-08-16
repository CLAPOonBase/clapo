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
}

export interface NotificationsResponse {
  message: string
  notifications: Notification[]
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