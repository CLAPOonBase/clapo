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
    bio: string
    avatarUrl: string
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
  userId: string
  content: string
  mediaUrl?: string
  createdAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  retweetCount: number
  user?: {
    id: string
    username: string
    avatarUrl: string
  }
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
  userId: string
}

export interface LikeResponse {
  message: string
  like: {
    id: string
    userId: string
    postId: string
    createdAt: string
  }
}

export interface UnlikeResponse {
  message: string
  unlike: {
    id: string
    userId: string
    postId: string
  }
}

export interface CommentRequest {
  userId: string
  content: string
  mediaUrl?: string
}

export interface CommentResponse {
  message: string
  comment: {
    id: string
    userId: string
    postId: string
    content: string
    createdAt: string
  }
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

export interface BookmarkResponse {
  message: string
  bookmark: {
    id: string
    userId: string
    postId: string
    createdAt: string
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
  creatorId: string
  createdAt: string
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
  communityId: string
  userId: string
  joinedAt: string
  isAdmin: boolean
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
  userId: string
  type: 'like' | 'retweet' | 'follow' | 'comment' | 'mention'
  refId: string
  fromUserId: string
  isRead: boolean
  createdAt: string
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
  senderUsername?: string
}

export interface CommunityMessage {
  id: string
  communityId: string
  senderId: string
  content: string
  mediaUrl?: string
  createdAt: string
  senderUsername?: string
} 