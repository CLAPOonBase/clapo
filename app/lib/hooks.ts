import { useState, useCallback } from 'react'
import { apiService } from './api'
import type {
  SignupRequest,
  LoginRequest,
  CreatePostRequest,
  ViewPostRequest,
  LikePostRequest,
  CommentRequest,
  FollowRequest,
  UpdateProfileRequest,
  CreateThreadRequest,
  SendMessageRequest,
  CreateCommunityRequest,
  JoinCommunityRequest,
  Post,
  UserProfile,
  Notification,
  Activity
} from '../types/api'

// Generic hook for API operations
function useApiOperation<T, P = void>(
  operation: (params: P) => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (params: P) => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await operation(params)
        setData(result)
        onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [operation, onSuccess, onError]
  )

  return { data, loading, error, execute }
}

// Authentication hooks
export function useSignup() {
  return useApiOperation(
    (data: SignupRequest) => apiService.signup(data),
    undefined,
    (error) => console.error('Signup failed:', error)
  )
}

export function useLogin() {
  return useApiOperation(
    (data: LoginRequest) => apiService.login(data),
    undefined,
    (error) => console.error('Login failed:', error)
  )
}

// User profile hooks
export function useGetUserProfile() {
  return useApiOperation(
    (userId: string) => apiService.getUserProfile(userId),
    undefined,
    (error) => console.error('Get user profile failed:', error)
  )
}

export function useUpdateUserProfile() {
  return useApiOperation(
    ({ userId, data }: { userId: string; data: UpdateProfileRequest }) =>
      apiService.updateUserProfile(userId, data),
    undefined,
    (error) => console.error('Update user profile failed:', error)
  )
}

export function useSearchUsers() {
  return useApiOperation(
    ({ query, limit, offset }: { query: string; limit?: number; offset?: number }) =>
      apiService.searchUsers(query, limit, offset),
    undefined,
    (error) => console.error('Search users failed:', error)
  )
}

// Posts hooks
export function useCreatePost() {
  return useApiOperation(
    (data: CreatePostRequest) => apiService.createPost(data),
    undefined,
    (error) => console.error('Create post failed:', error)
  )
}

export function useGetPersonalizedFeed() {
  return useApiOperation(
    ({ userId, limit, offset }: { userId: string; limit?: number; offset?: number }) =>
      apiService.getPersonalizedFeed(userId, limit, offset),
    undefined,
    (error) => console.error('Get personalized feed failed:', error)
  )
}

// Engagement hooks
export function useViewPost() {
  return useApiOperation(
    ({ postId, data }: { postId: string; data: ViewPostRequest }) =>
      apiService.viewPost(postId, data),
    undefined,
    (error) => console.error('View post failed:', error)
  )
}

export function useLikePost() {
  return useApiOperation(
    ({ postId, data }: { postId: string; data: LikePostRequest }) =>
      apiService.likePost(postId, data),
    undefined,
    (error) => console.error('Like post failed:', error)
  )
}

export function useUnlikePost() {
  return useApiOperation(
    ({ postId, data }: { postId: string; data: LikePostRequest }) =>
      apiService.unlikePost(postId, data),
    undefined,
    (error) => console.error('Unlike post failed:', error)
  )
}

export function useCommentOnPost() {
  return useApiOperation(
    ({ postId, data }: { postId: string; data: CommentRequest }) =>
      apiService.commentOnPost(postId, data),
    undefined,
    (error) => console.error('Comment on post failed:', error)
  )
}

export function useRetweetPost() {
  return useApiOperation(
    ({ postId, data }: { postId: string; data: LikePostRequest }) =>
      apiService.retweetPost(postId, data),
    undefined,
    (error) => console.error('Retweet post failed:', error)
  )
}

export function useBookmarkPost() {
  return useApiOperation(
    ({ postId, data }: { postId: string; data: LikePostRequest }) =>
      apiService.bookmarkPost(postId, data),
    undefined,
    (error) => console.error('Bookmark post failed:', error)
  )
}

// Social features hooks
export function useFollowUser() {
  return useApiOperation(
    ({ userId, data }: { userId: string; data: FollowRequest }) =>
      apiService.followUser(userId, data),
    undefined,
    (error) => console.error('Follow user failed:', error)
  )
}

export function useUnfollowUser() {
  return useApiOperation(
    ({ userId, data }: { userId: string; data: FollowRequest }) =>
      apiService.unfollowUser(userId, data),
    undefined,
    (error) => console.error('Unfollow user failed:', error)
  )
}

// Messaging hooks
export function useCreateMessageThread() {
  return useApiOperation(
    (data: CreateThreadRequest) => apiService.createMessageThread(data),
    undefined,
    (error) => console.error('Create message thread failed:', error)
  )
}

export function useSendMessage() {
  return useApiOperation(
    ({ threadId, data }: { threadId: string; data: SendMessageRequest }) =>
      apiService.sendMessage(threadId, data),
    undefined,
    (error) => console.error('Send message failed:', error)
  )
}

// Community hooks
export function useCreateCommunity() {
  return useApiOperation(
    (data: CreateCommunityRequest) => apiService.createCommunity(data),
    undefined,
    (error) => console.error('Create community failed:', error)
  )
}

export function useJoinCommunity() {
  return useApiOperation(
    ({ communityId, data }: { communityId: string; data: JoinCommunityRequest }) =>
      apiService.joinCommunity(communityId, data),
    undefined,
    (error) => console.error('Join community failed:', error)
  )
}

// Notification and activity hooks
export function useGetNotifications() {
  return useApiOperation(
    ({ userId, limit, offset }: { userId: string; limit?: number; offset?: number }) =>
      apiService.getNotifications(userId, limit, offset),
    undefined,
    (error) => console.error('Get notifications failed:', error)
  )
}

export function useGetRecentActivity() {
  return useApiOperation(
    ({ userId, limit, offset }: { userId: string; limit?: number; offset?: number }) =>
      apiService.getRecentActivity(userId, limit, offset),
    undefined,
    (error) => console.error('Get recent activity failed:', error)
  )
}

// Custom hook for managing posts state
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchPosts = useCallback(async (userId: string, limit = 10, offset = 0) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiService.getPersonalizedFeed(userId, limit, offset)
      setPosts(response.posts)
      return response.posts
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch posts')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const addPost = useCallback((post: Post) => {
    setPosts(prev => [post, ...prev])
  }, [])

  const updatePost = useCallback((postId: string, updates: Partial<Post>) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ))
  }, [])

  const removePost = useCallback((postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId))
  }, [])

  return {
    posts,
    loading,
    error,
    fetchPosts,
    addPost,
    updatePost,
    removePost
  }
}

// Custom hook for managing user state
export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = useCallback(async (userId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiService.getUserProfile(userId)
      setUser(response.profile)
      return response.profile
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  return {
    user,
    loading,
    error,
    fetchUser,
    updateUser
  }
} 