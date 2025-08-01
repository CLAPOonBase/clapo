'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { apiService } from '../lib/api'
import type { 
  UserState, 
  PostState, 
  EngagementState,
  ApiUser,
  ApiPost,
  ApiNotification,
  ApiActivity
} from '../types'

// Action types
type Action =
  | { type: 'SET_USER'; payload: ApiUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POSTS'; payload: ApiPost[] }
  | { type: 'ADD_POST'; payload: ApiPost }
  | { type: 'UPDATE_POST'; payload: { id: string; updates: Partial<ApiPost> } }
  | { type: 'REMOVE_POST'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: ApiNotification[] }
  | { type: 'SET_ACTIVITIES'; payload: ApiActivity[] }
  | { type: 'LIKE_POST'; payload: string }
  | { type: 'UNLIKE_POST'; payload: string }
  | { type: 'RETWEET_POST'; payload: string }
  | { type: 'UNRETWEET_POST'; payload: string }
  | { type: 'BOOKMARK_POST'; payload: string }
  | { type: 'UNBOOKMARK_POST'; payload: string }
  | { type: 'VIEW_POST'; payload: string }

// State interface
interface ApiState {
  user: UserState
  posts: PostState
  engagement: EngagementState
  notifications: ApiNotification[]
  activities: ApiActivity[]
}

// Initial state
const initialState: ApiState = {
  user: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  posts: {
    posts: [],
    loading: false,
    error: null,
    hasMore: true
  },
  engagement: {
    likedPosts: new Set(),
    retweetedPosts: new Set(),
    bookmarkedPosts: new Set(),
    viewedPosts: new Set()
  },
  notifications: [],
  activities: []
}

// Reducer
function apiReducer(state: ApiState, action: Action): ApiState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          ...state.user,
          currentUser: action.payload,
          isAuthenticated: true,
          error: null
        }
      }
    
    case 'CLEAR_USER':
      return {
        ...state,
        user: {
          currentUser: null,
          isAuthenticated: false,
          loading: false,
          error: null
        }
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        user: {
          ...state.user,
          loading: action.payload
        }
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        user: {
          ...state.user,
          error: action.payload
        }
      }
    
    case 'SET_POSTS':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: action.payload,
          loading: false,
          error: null
        }
      }
    
    case 'ADD_POST':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: [action.payload, ...state.posts.posts]
        }
      }
    
    case 'UPDATE_POST':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: state.posts.posts.map(post =>
            post.id === action.payload.id
              ? { ...post, ...action.payload.updates }
              : post
          )
        }
      }
    
    case 'REMOVE_POST':
      return {
        ...state,
        posts: {
          ...state.posts,
          posts: state.posts.posts.filter(post => post.id !== action.payload)
        }
      }
    
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      }
    
    case 'SET_ACTIVITIES':
      return {
        ...state,
        activities: action.payload
      }
    
    case 'LIKE_POST':
      return {
        ...state,
        engagement: {
          ...state.engagement,
          likedPosts: new Set([...state.engagement.likedPosts, action.payload])
        }
      }
    
    case 'UNLIKE_POST':
      const newLikedPosts = new Set(state.engagement.likedPosts)
      newLikedPosts.delete(action.payload)
      return {
        ...state,
        engagement: {
          ...state.engagement,
          likedPosts: newLikedPosts
        }
      }
    
    case 'RETWEET_POST':
      return {
        ...state,
        engagement: {
          ...state.engagement,
          retweetedPosts: new Set([...state.engagement.retweetedPosts, action.payload])
        }
      }
    
    case 'UNRETWEET_POST':
      const newRetweetedPosts = new Set(state.engagement.retweetedPosts)
      newRetweetedPosts.delete(action.payload)
      return {
        ...state,
        engagement: {
          ...state.engagement,
          retweetedPosts: newRetweetedPosts
        }
      }
    
    case 'BOOKMARK_POST':
      return {
        ...state,
        engagement: {
          ...state.engagement,
          bookmarkedPosts: new Set([...state.engagement.bookmarkedPosts, action.payload])
        }
      }
    
    case 'UNBOOKMARK_POST':
      const newBookmarkedPosts = new Set(state.engagement.bookmarkedPosts)
      newBookmarkedPosts.delete(action.payload)
      return {
        ...state,
        engagement: {
          ...state.engagement,
          bookmarkedPosts: newBookmarkedPosts
        }
      }
    
    case 'VIEW_POST':
      return {
        ...state,
        engagement: {
          ...state.engagement,
          viewedPosts: new Set([...state.engagement.viewedPosts, action.payload])
        }
      }
    
    default:
      return state
  }
}

// Context
interface ApiContextType {
  state: ApiState
  dispatch: React.Dispatch<Action>
  // API actions
  login: (username: string, password: string) => Promise<void>
  signup: (userData: unknown) => Promise<void>
  logout: () => void
  fetchPosts: (userId: string) => Promise<void>
  createPost: (postData: unknown) => Promise<void>
  likePost: (postId: string, userId: string) => Promise<void>
  unlikePost: (postId: string, userId: string) => Promise<void>
  retweetPost: (postId: string, userId: string) => Promise<void>
  bookmarkPost: (postId: string, userId: string) => Promise<void>
  viewPost: (postId: string, userId: string) => Promise<void>
  fetchNotifications: (userId: string) => Promise<void>
  fetchActivities: (userId: string) => Promise<void>
  refreshUserData: (userId: string) => Promise<void>
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

// Provider component
export function ApiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(apiReducer, initialState)
  const { data: session, status, update } = useSession()

  const fixAvatarUrl = useCallback(async () => {
    if (session?.dbUser && session?.user?.image && !session.dbUser.avatarUrl) {
      const updatedUserData = {
        ...session.dbUser,
        avatarUrl: session.user.image
      };
      
      await update({
        dbUserId: session.dbUser,
        dbUser: updatedUserData,
        needsPasswordSetup: false,
        twitterData: session.dbUser || null
      });
    }
  }, [session, update]);

  const testUserProfile = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps'}/users/${userId}/profile`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = await response.json();
    } catch (error) {
      console.error('API test failed:', error);
    }
  }, []);

  const refreshUserData = useCallback(async (userId: string) => {
    try {
      const profileResponse = await apiService.getUserProfile(userId);
      
      if (profileResponse.profile) {
        await update({
          dbUserId: profileResponse.profile.id,
          dbUser: profileResponse.profile,
          needsPasswordSetup: false,
          twitterData: null
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, [update]);

  useEffect(() => {
    if (status === 'loading') {
      dispatch({ type: 'SET_LOADING', payload: true })
    } else if (status === 'authenticated' && session?.dbUser) {
      const userData = { ...session.dbUser };
      if (!userData.avatarUrl && session.user?.image) {
        userData.avatarUrl = session.user.image;
      }
      
      const apiUser: ApiUser = {
        id: session.user ,
        username: userData.username,
        email: userData.username,
        bio: userData.bio,
        avatarUrl: userData.avatarUrl,
        createdAt: userData.holdings ? new Date().toISOString() : new Date().toISOString(),
        followerCount: 0,
        followingCount: 0
      }
      dispatch({ type: 'SET_USER', payload: apiUser })
      
      if (session.dbUserId) {
        fetchPosts(session.dbUserId)
        fetchNotifications(session.dbUserId)
        fetchActivities(session.dbUserId)
      }
    } else if (status === 'authenticated' && session?.twitterData) {
      dispatch({ type: 'SET_LOADING', payload: false })
    } else if (status === 'unauthenticated') {
      dispatch({ type: 'CLEAR_USER' })
    }
  }, [session, status])

  // Login function (for manual login, not used with Twitter auth)
  const login = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await apiService.login({ username, password })
      dispatch({ type: 'SET_USER', payload: response.user as ApiUser })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Login failed' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Signup function (for manual signup, not used with Twitter auth)
  const signup = async (userData: never) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await apiService.signup(userData)
      dispatch({ type: 'SET_USER', payload: response.user as ApiUser })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Signup failed' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  // Logout function
  const logout = () => {
    dispatch({ type: 'CLEAR_USER' })
  }

  // Get current user ID from session
  const getCurrentUserId = (): string | null => {
    if (session?.dbUserId) return session.dbUserId
    if (session?.dbUser?.id) return session.dbUser.id
    return state.user.currentUser?.id || null
  }

  // Fetch posts
  const fetchPosts = async (userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) {
      return
    }

    try {
      const response = await apiService.getPersonalizedFeed(currentUserId)
      dispatch({ type: 'SET_POSTS', payload: response.posts })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to fetch posts' 
      })
    }
  }

  // Create post
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createPost = async (postData: any) => {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      return
    }

    try {
      const response = await apiService.createPost({
        ...postData,
        userId: currentUserId
      })
      dispatch({ type: 'ADD_POST', payload: response.post })
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to create post' 
      })
    }
  }

  // Like post
  const likePost = async (postId: string, userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) return

    try {
      await apiService.likePost(postId, { userId: currentUserId })
      dispatch({ type: 'LIKE_POST', payload: postId })
      // Update post like count
      dispatch({
        type: 'UPDATE_POST',
        payload: {
          id: postId,
          updates: { likeCount: (state.posts.posts.find(p => p.id === postId)?.likeCount || 0) + 1 }
        }
      })
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  // Unlike post
  const unlikePost = async (postId: string, userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) return

    try {
      await apiService.unlikePost(postId, { userId: currentUserId })
      dispatch({ type: 'UNLIKE_POST', payload: postId })
      // Update post like count
      dispatch({
        type: 'UPDATE_POST',
        payload: {
          id: postId,
          updates: { likeCount: Math.max(0, (state.posts.posts.find(p => p.id === postId)?.likeCount || 0) - 1) }
        }
      })
    } catch (error) {
      console.error('Failed to unlike post:', error)
    }
  }

  // Retweet post
  const retweetPost = async (postId: string, userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) return

    try {
      await apiService.retweetPost(postId, { userId: currentUserId })
      dispatch({ type: 'RETWEET_POST', payload: postId })
      // Update post retweet count
      dispatch({
        type: 'UPDATE_POST',
        payload: {
          id: postId,
          updates: { retweetCount: (state.posts.posts.find(p => p.id === postId)?.retweetCount || 0) + 1 }
        }
      })
    } catch (error) {
      console.error('Failed to retweet post:', error)
    }
  }

  // Bookmark post
  const bookmarkPost = async (postId: string, userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) return

    try {
      await apiService.bookmarkPost(postId, { userId: currentUserId })
      dispatch({ type: 'BOOKMARK_POST', payload: postId })
    } catch (error) {
      console.error('Failed to bookmark post:', error)
    }
  }

  // View post
  const viewPost = async (postId: string, userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) return

    try {
      await apiService.viewPost(postId, { viewerId: currentUserId })
      dispatch({ type: 'VIEW_POST', payload: postId })
      // Update post view count
      dispatch({
        type: 'UPDATE_POST',
        payload: {
          id: postId,
          updates: { viewCount: (state.posts.posts.find(p => p.id === postId)?.viewCount || 0) + 1 }
        }
      })
    } catch (error) {
      console.error('Failed to view post:', error)
    }
  }

  // Fetch notifications
  const fetchNotifications = async (userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) return

    try {
      const response = await apiService.getNotifications(currentUserId)
      dispatch({ type: 'SET_NOTIFICATIONS', payload: response.notifications })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  // Fetch activities
  const fetchActivities = async (userId?: string) => {
    const currentUserId = userId || getCurrentUserId()
    if (!currentUserId) return

    try {
      const response = await apiService.getRecentActivity(currentUserId)
      dispatch({ type: 'SET_ACTIVITIES', payload: response.activities })
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }

  const value: ApiContextType = {
    state,
    dispatch,
    login,
    signup,
    logout,
    fetchPosts,
    createPost,
    likePost,
    unlikePost,
    retweetPost,
    bookmarkPost,
    viewPost,
    fetchNotifications,
    fetchActivities,
    refreshUserData,
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}

// Hook to use the API context
export function useApi() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
} 