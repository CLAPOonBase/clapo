'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { apiService } from '../lib/api'
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
  SearchUsersResponse,
  CreatePostRequest,
  CreatePostResponse,
  FeedResponse,
  ViewPostRequest,
  ViewPostResponse,
  LikePostRequest,
  LikeResponse,
  UnlikeResponse,
  CommentRequest,
  CommentResponse,
  RetweetResponse,
  BookmarkResponse,
  FollowRequest,
  FollowResponse,
  UnfollowResponse,
  CreateThreadRequest,
  CreateThreadResponse,
  SendMessageRequest,
  SendMessageResponse,
  CreateCommunityRequest,
  CreateCommunityResponse,
  JoinCommunityRequest,
  JoinCommunityResponse,
  NotificationsResponse,
  ActivityResponse,
  ApiError,
  CreateMessageThreadRequest,
  MessageThreadsResponse,
  ThreadMessagesResponse,
  AddParticipantRequest,
  AddParticipantResponse,
  CommunitiesResponse,
  CommunityMembersResponse,
  CommunityMessagesResponse,
  MessageThread,
  ThreadMessage,
  Community,
  CommunityMessage
} from '../types/api'
import type { 
  UserState, 
  PostState, 
  EngagementState,
  ApiUser,
  ApiPost,
  ApiNotification,
  ApiActivity,
  MessageThread,
  ThreadMessage,
  Community,
  CommunityMessage
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
  | { type: 'SET_MESSAGE_THREADS'; payload: MessageThread[] }
  | { type: 'ADD_MESSAGE_THREAD'; payload: MessageThread }
  | { type: 'SET_THREAD_MESSAGES'; payload: { threadId: string; messages: ThreadMessage[] } }
  | { type: 'ADD_THREAD_MESSAGE'; payload: { threadId: string; message: ThreadMessage } }
  | { type: 'SET_COMMUNITIES'; payload: Community[] }
  | { type: 'ADD_COMMUNITY'; payload: Community }
  | { type: 'SET_COMMUNITY_MESSAGES'; payload: { communityId: string; messages: CommunityMessage[] } }
  | { type: 'ADD_COMMUNITY_MESSAGE'; payload: { communityId: string; message: CommunityMessage } }

// State interface
interface ApiState {
  user: UserState
  posts: PostState
  engagement: EngagementState
  notifications: ApiNotification[]
  activities: ApiActivity[]
  messageThreads: MessageThread[]
  threadMessages: Record<string, ThreadMessage[]>
  communities: Community[]
  communityMessages: Record<string, CommunityMessage[]>
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
  activities: [],
  messageThreads: [],
  threadMessages: {},
  communities: [],
  communityMessages: {}
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
    
    case 'SET_MESSAGE_THREADS':
      return {
        ...state,
        messageThreads: action.payload
      }
    
    case 'ADD_MESSAGE_THREAD':
      return {
        ...state,
        messageThreads: [...state.messageThreads, action.payload]
      }
    
    case 'SET_THREAD_MESSAGES':
      return {
        ...state,
        threadMessages: {
          ...state.threadMessages,
          [action.payload.threadId]: action.payload.messages
        }
      }
    
    case 'ADD_THREAD_MESSAGE':
      return {
        ...state,
        threadMessages: {
          ...state.threadMessages,
          [action.payload.threadId]: [
            ...(state.threadMessages[action.payload.threadId] || []),
            action.payload.message
          ]
        }
      }
    
    case 'SET_COMMUNITIES':
      return {
        ...state,
        communities: action.payload
      }
    
    case 'ADD_COMMUNITY':
      return {
        ...state,
        communities: [...state.communities, action.payload]
      }
    
    case 'SET_COMMUNITY_MESSAGES':
      return {
        ...state,
        communityMessages: {
          ...state.communityMessages,
          [action.payload.communityId]: action.payload.messages
        }
      }
    
    case 'ADD_COMMUNITY_MESSAGE':
      return {
        ...state,
        communityMessages: {
          ...state.communityMessages,
          [action.payload.communityId]: [
            ...(state.communityMessages[action.payload.communityId] || []),
            action.payload.message
          ]
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
  login: (username: string, password: string) => Promise<void>
  signup: (userData: unknown) => Promise<void>
  logout: () => void
  fetchPosts: (userId: string) => Promise<void>
  createPost: (postData: unknown) => Promise<void>
  likePost: (postId: string, userId: string) => Promise<void>
  unlikePost: (postId: string, userId: string) => Promise<void>
  retweetPost: (postId: string, userId: string) => Promise<void>
  bookmarkPost: (postId: string, userId: string) => Promise<void>
  unbookmarkPost: (postId: string, userId: string) => Promise<void>

  viewPost: (postId: string, userId: string) => Promise<void>
  commentPost: (postId: string, data: CommentRequest) => Promise<any>
  getUserProfile: (userId: string) => Promise<any>
  fetchNotifications: (userId: string) => Promise<void>
  fetchActivities: (userId: string) => Promise<void>
  refreshUserData: (userId: string) => Promise<void>
  getMessageThreads: (userId: string) => Promise<void>
  getThreadMessages: (threadId: string) => Promise<void>
  sendMessage: (threadId: string, data: SendMessageRequest) => Promise<void>
  addParticipantToThread: (threadId: string, data: AddParticipantRequest) => Promise<any>
  markMessageAsRead: (messageId: string) => Promise<void>
  createCommunity: (data: CreateCommunityRequest) => Promise<void>
  getCommunities: (searchQuery?: string) => Promise<void>
  joinCommunity: (communityId: string, data: JoinCommunityRequest) => Promise<void>
  getCommunityMembers: (communityId: string) => Promise<void>
  sendCommunityMessage: (communityId: string, data: SendMessageRequest) => Promise<void>
  getCommunityMessages: (communityId: string) => Promise<void>
  getUserCommunities: (userId: string) => Promise<void>
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
      
      if (session.dbUser?.id) {
        fetchPosts(session.dbUser.id)
        fetchNotifications(session.dbUser.id)
        fetchActivities(session.dbUser.id)
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
    console.log('🔍 Session Debug:', { 
      sessionDbUser: session?.dbUser,
      sessionDbUserId: session?.dbUser?.id,
      sessionDbUserType: typeof session?.dbUser,
      sessionDbUserIdType: typeof session?.dbUser?.id,
      sessionTwitterData: session?.twitterData,
      stateUser: state.user.currentUser,
      sessionKeys: session ? Object.keys(session) : []
    })
    
    // The session.dbUser object has an id field
    if (session?.dbUser?.id) {
      console.log('✅ Found user ID:', session.dbUser.id)
      return session.dbUser.id
    }
    
    // Check if there's a separate userId field in session
    if (session?.userId) {
      return session.userId
    }
    
    // Check for dbUserId field
    if (session?.dbUserId) {
      return session.dbUserId
    }
    
    // Check for user field
    if (session?.user?.id) {
      return session.user.id
    }
    
    if (session?.twitterData?.username) return session.twitterData.username
    return state.user.currentUser?.id || null
  }

  const fetchPosts = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiService.getPosts(targetUserId)
      dispatch({ type: 'SET_POSTS', payload: response.posts })
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch posts' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const createPost = useCallback(async (postData: any) => {
    try {
      console.log('🚀 Calling apiService.createPost with data:', postData)
      const response = await apiService.createPost(postData)
      console.log('✅ API response:', response)
      dispatch({ type: 'ADD_POST', payload: response.post })
      return response
    } catch (error) {
      console.error('❌ Failed to create post:', error)
      throw error
    }
  }, [])

  const likePost = useCallback(async (postId: string, targetUserId: string) => {
    console.log('🔍 Like Post Call:', { postId, targetUserId, type: typeof targetUserId })
    try {
      await apiService.likePost(postId, { userId: targetUserId })
      dispatch({ type: 'LIKE_POST', payload: postId })
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }, [])

  const unlikePost = useCallback(async (postId: string, targetUserId: string) => {
    try {
      await apiService.unlikePost(postId, { userId: targetUserId })
      dispatch({ type: 'UNLIKE_POST', payload: postId })
    } catch (error) {
      console.error('Error unliking post:', error)
    }
  }, [])

  const retweetPost = useCallback(async (postId: string, targetUserId: string) => {
    try {
      await apiService.retweetPost(postId, { userId: targetUserId })
      dispatch({ type: 'RETWEET_POST', payload: postId })
    } catch (error) {
      console.error('Error retweeting post:', error)
    }
  }, [])

  const bookmarkPost = useCallback(async (postId: string, targetUserId: string) => {
    console.log('🔍 Bookmark Post Call:', { postId, targetUserId, type: typeof targetUserId })
    try {
      await apiService.bookmarkPost(postId, { userId: targetUserId })
      dispatch({ type: 'BOOKMARK_POST', payload: postId })
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }, [])

  const unbookmarkPost = useCallback(async (postId: string, targetUserId: string) => {
    console.log('🔍 Unbookmark Post Call:', { postId, targetUserId, type: typeof targetUserId })
    try {
      await apiService.unbookmarkPost(postId, { userId: targetUserId })
      dispatch({ type: 'UNBOOKMARK_POST', payload: postId })
    } catch (error) {
      console.error('Error unbookmarking post:', error)
    }
  }, [])



  const viewPost = useCallback(async (postId: string, targetUserId: string) => {
    try {
      await apiService.viewPost(postId, { userId: targetUserId })
    } catch (error) {
      console.error('Error viewing post:', error)
    }
  }, [])

  const commentPost = useCallback(async (postId: string, data: CommentRequest) => {
    try {
      const response = await apiService.commentOnPost(postId, data)
      return response
    } catch (error) {
      console.error('Failed to comment on post:', error)
      throw error
    }
  }, [])

  const fetchNotifications = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.getNotifications(targetUserId)
      dispatch({ type: 'SET_NOTIFICATIONS', payload: response.notifications })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [])

  const fetchActivities = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.getActivities(targetUserId)
      dispatch({ type: 'SET_ACTIVITIES', payload: response.activities })
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }, [])

  const getMessageThreads = useCallback(async (userId: string) => {
    try {
      const response = await apiService.getMessageThreads(userId)
      dispatch({ type: 'SET_MESSAGE_THREADS', payload: response.threads })
    } catch (error) {
      console.error('Failed to fetch message threads:', error)
    }
  }, [])

  const getThreadMessages = useCallback(async (threadId: string) => {
    try {
      const response = await apiService.getThreadMessages(threadId)
      dispatch({ type: 'SET_THREAD_MESSAGES', payload: { threadId, messages: response.messages } })
    } catch (error) {
      console.error('Failed to fetch thread messages:', error)
    }
  }, [])

  const sendMessage = useCallback(async (threadId: string, data: SendMessageRequest) => {
    try {
      const response = await apiService.sendMessage(threadId, data)
      dispatch({ type: 'ADD_THREAD_MESSAGE', payload: { threadId, message: response.messageData } })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [])

  const addParticipantToThread = useCallback(async (threadId: string, data: AddParticipantRequest) => {
    try {
      const response = await apiService.addParticipantToThread(threadId, data)
      return response
    } catch (error) {
      console.error('Failed to add participant to thread:', error)
      throw error
    }
  }, [])

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      await apiService.markMessageAsRead(messageId)
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }, [])

  const createCommunity = useCallback(async (data: CreateCommunityRequest) => {
    try {
      const response = await apiService.createCommunity(data)
      dispatch({ type: 'ADD_COMMUNITY', payload: response.community })
    } catch (error) {
      console.error('Failed to create community:', error)
    }
  }, [])

  const getCommunities = useCallback(async (searchQuery?: string) => {
    try {
      const response = await apiService.getCommunities(searchQuery)
      dispatch({ type: 'SET_COMMUNITIES', payload: response.communities })
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    }
  }, [])

  const joinCommunity = useCallback(async (communityId: string, data: JoinCommunityRequest) => {
    try {
      await apiService.joinCommunity(communityId, data)
    } catch (error) {
      console.error('Failed to join community:', error)
    }
  }, [])

  const getCommunityMembers = useCallback(async (communityId: string) => {
    try {
      await apiService.getCommunityMembers(communityId)
    } catch (error) {
      console.error('Failed to fetch community members:', error)
    }
  }, [])

  const sendCommunityMessage = useCallback(async (communityId: string, data: SendMessageRequest) => {
    try {
      const response = await apiService.sendCommunityMessage(communityId, data)
      dispatch({ type: 'ADD_COMMUNITY_MESSAGE', payload: { communityId, message: response.messageData } })
    } catch (error) {
      console.error('Failed to send community message:', error)
    }
  }, [])

  const getCommunityMessages = useCallback(async (communityId: string) => {
    try {
      const response = await apiService.getCommunityMessages(communityId)
      dispatch({ type: 'SET_COMMUNITY_MESSAGES', payload: { communityId, messages: response.messages } })
    } catch (error) {
      console.error('Failed to fetch community messages:', error)
    }
  }, [])

  const getUserCommunities = useCallback(async (userId: string) => {
    try {
      const response = await apiService.getUserCommunities(userId)
      dispatch({ type: 'SET_COMMUNITIES', payload: response.communities })
    } catch (error) {
      console.error('Failed to fetch user communities:', error)
    }
  }, [])

  const getUserProfile = useCallback(async (userId: string) => {
    try {
      const response = await apiService.getUserProfile(userId)
      return response
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }, [])

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
    unbookmarkPost,

    viewPost,
    commentPost,
    getUserProfile,
    fetchNotifications,
    fetchActivities,
    refreshUserData,
    getMessageThreads,
    getThreadMessages,
    sendMessage,
    addParticipantToThread,
    markMessageAsRead,
    createCommunity,
    getCommunities,
    joinCommunity,
    getCommunityMembers,
    sendCommunityMessage,
    getCommunityMessages,
    getUserCommunities,
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