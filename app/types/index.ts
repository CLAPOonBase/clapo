export interface Leader {
  name: string
  username: string
  avatar: string
}

export interface Row {
  rank: number | string
  name: string
  username: string
  totalMindshare: string
  clapoMindshare: string
  clapoChange: string
  clapoChangeColor: string
  seiMindshare: string
  seiChange: string
  seiChangeColor: string
  bg: string
  avatar: string
}

export interface Opinion {
  id: string
  title: string
  slug: string
  category:
    | 'FED_DECISION'
    | 'POLITICS'
    | 'ECONOMY'
    | 'CRYPTO'
    | 'TECH'
    | 'CELEBRITY'
    | 'SPORTS'
    | 'WORLD'
    | 'TRUMP'
    | 'ELECTIONS'
    | 'MENTIONS'
    | 'NEW'
    | 'TRENDING'
  description: string
  currentRate: number
  cutBasisPoints: number
  expiryDate: string
  totalVotes: number
  createdAt: string
  isActive: boolean
  image: string
}

export interface Vote {
  id: string
  opinionId: string
  userId: string
  prediction: number // basis points
  confidence: number // 1-100
  createdAt: string
}

export interface NavItem {
  label: string
  href: string
  isActive?: boolean
}

export interface OpinionCardProps {
  opinion: Opinion
  onVote?: (opinionId: string) => void
}

export interface VoteModalProps {
  opinion: Opinion
  isOpen: boolean
  onClose: () => void
  onSubmit: (vote: Omit<Vote, 'id' | 'createdAt'>) => void
}

export type OpinionFilter = 'all' | 'active' | 'expired' | 'trending'

export type PageKey =
  | 'home'
  | 'explore'
  | 'notifications'
  | 'likes'
  | 'bookmarks'
  | 'profile'
  | 'search'
  | 'activity'
  | 'messages'
  | 'share'
  | 'mentions'
  |'munch';

  export type OpinionPageKey =
  | 'exploremarket'
  | 'myportfolio'
  | 'wallet'
  | 'settings'
  | 'createmarket'
;

// Legacy Post type for backward compatibility
export type Post = {
  id: number
  author: string
  handle: string
  time: string
  content: string
  image?: string
  likes: number
  comments: number
  retweets: number
}

// New API Post type
export interface ApiPost {
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
  account_type?: 'individual' | 'community'
  author_reputation?: number
  author_reputation_tier?: 'newcomer' | 'contributor' | 'veteran' | 'expert' | 'legend'
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
    author_reputation_tier?: 'newcomer' | 'contributor' | 'veteran' | 'expert' | 'legend'
  }>
}

export type User = {
  id: number
  name: string
  handle: string
  avatar: string
  cover?: string
  bio?: string
  holdings?: number
  status?: 'active' | 'inactive' 
  messages?: { from: string; text: string; time: string }[] | undefined
}

// New API User type
export interface ApiUser {
  id: unknown
  username: string
  email: string
  bio: string
  avatarUrl: string
  createdAt: string
  followerCount: number
  followingCount: number
}

export type ActivityItem = {
  id: number
  type: 'like' | 'retweet' | 'follow'
  user: User
  timestamp: string
}

// New API Activity type
export interface ApiActivity {
  id: string
  userId: string
  activityType: 'post_created' | 'like' | 'retweet' | 'follow' | 'comment'
  targetId: string
  timestamp: string
}

// New API Notification type
export interface ApiNotification {
  id: string
  userId: string
  type: 'like' | 'retweet' | 'follow' | 'comment' | 'mention'
  refId: string
  fromUserId: string
  isRead: boolean
  createdAt: string
}

// Utility type for converting between legacy and API types
export type PostAdapter = {
  legacyToApi: (post: Post) => ApiPost
  apiToLegacy: (post: ApiPost) => Post
}

// User state management
export interface UserState {
  currentUser: ApiUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Post state management
export interface PostState {
  posts: ApiPost[]
  loading: boolean
  error: string | null
  hasMore: boolean
}

// Engagement state
export interface EngagementState {
  likedPosts: Set<string>
  retweetedPosts: Set<string>
  bookmarkedPosts: Set<string>
  viewedPosts: Set<string>
}
