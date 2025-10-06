/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
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
  EnhancedNotificationsResponse,
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
  CommunityMessage,
  EnhancedNotification
} from '../types/api'
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
  | { type: 'SET_MESSAGE_THREADS'; payload: MessageThread[] }
  | { type: 'ADD_MESSAGE_THREAD'; payload: MessageThread }
  | { type: 'SET_THREAD_MESSAGES'; payload: { threadId: string; messages: ThreadMessage[] } }
  | { type: 'ADD_THREAD_MESSAGE'; payload: { threadId: string; message: ThreadMessage } }
  | { type: 'SET_COMMUNITIES'; payload: Community[] }
  | { type: 'ADD_COMMUNITY'; payload: Community }
  | { type: 'SET_COMMUNITY_MESSAGES'; payload: { communityId: string; messages: CommunityMessage[] } }
  | { type: 'ADD_COMMUNITY_MESSAGE'; payload: { communityId: string; message: CommunityMessage } }
  | { type: 'UPDATE_NOTIFICATION'; payload: { id: string; updates: Partial<ApiNotification> } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'SET_ENHANCED_NOTIFICATIONS'; payload: EnhancedNotification[] }

// State interface
interface ApiState {
  user: UserState
  posts: PostState
  engagement: EngagementState
  notifications: ApiNotification[]
  enhancedNotifications: EnhancedNotification[]
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
  enhancedNotifications: [],
  activities: [],
  messageThreads: [],
  threadMessages: {},
  communities: [],
  communityMessages: {},
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
    
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? { ...notification, ...action.payload.updates } : notification
        )
      }
    
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, is_read: true }))
      }
    
    case 'SET_ENHANCED_NOTIFICATIONS':
      return {
        ...state,
        enhancedNotifications: action.payload
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
  createPost: (postData: unknown) => Promise<CreatePostResponse>
  likePost: (postId: string, userId: string) => Promise<void>
  unlikePost: (postId: string, userId: string) => Promise<void>
  retweetPost: (postId: string, userId: string) => Promise<void>
  bookmarkPost: (postId: string, userId: string) => Promise<void>
  unbookmarkPost: (postId: string, userId: string) => Promise<void>

  viewPost: (postId: string, userId: string) => Promise<void>
  commentPost: (postId: string, data: CommentRequest) => Promise<any>
  addComment: (postId: string, content: string, userId: string) => Promise<any>
  getPostComments: (postId: string) => Promise<CommentResponse[]>
  getUserProfile: (userId: string) => Promise<any>
  updateUserProfile: (userId: string, data: UpdateProfileRequest) => Promise<any>
  fetchNotifications: (userId: string) => Promise<void>
  fetchEnhancedNotifications: (userId: string) => Promise<void>
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
  getCommunityMembers: (communityId: string) => Promise<any>
  sendCommunityMessage: (communityId: string, data: SendMessageRequest) => Promise<void>
  getCommunityMessages: (communityId: string) => Promise<void>
  getUserCommunities: (userId: string) => Promise<void>
  getUserFollowers: (userId: string, limit: number, offset: number) => Promise<any>
  getUserFollowing: (userId: string, limit: number, offset: number) => Promise<any>
  getFollowingFeed: (userId: string, limit: number, offset: number) => Promise<any>
  followUser: (targetUserId: string, data: FollowRequest) => Promise<any>
  unfollowUser: (targetUserId: string, data: FollowRequest) => Promise<any>
  getUnreadNotificationCount: (userId?: string) => Promise<number>
  markNotificationAsRead: (notificationId: string) => Promise<ApiNotification>
  markAllNotificationsAsRead: (userId?: string) => Promise<number>
  refreshPosts: (userId?: string) => Promise<void>
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

// Provider component
export function ApiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(apiReducer, initialState)
  const { data: session, status, update } = useSession()

  const testUserProfile = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://server.blazeswap.io/api/snaps'}/users/${userId}/profile`);
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
      
      const apiUser: ApiUser = {
        id: userData.id,
        username: userData.username,
        email: userData.username,
        bio: userData.bio,
        avatarUrl: userData.avatar_url,
        createdAt: new Date().toISOString(),
        followerCount: 0,
        followingCount: 0
      }
      dispatch({ type: 'SET_USER', payload: apiUser })
      
      if (session.dbUser?.id) {
      }
    } else if (status === 'unauthenticated') {
      dispatch({ type: 'CLEAR_USER' })
    }
  }, [session, status, dispatch])

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

  const logout = () => {
    dispatch({ type: 'CLEAR_USER' })
  }

  const getCurrentUserId = useCallback(() => {
    if (session?.dbUser?.id) {
      return session.dbUser.id
    }
    
    if (session?.dbUserId) {
      return session.dbUserId
    }
    
    if (session?.user?.id) {
      return session.user.id
    }
    
    return state.user.currentUser?.id || null
  }, [session, state.user.currentUser?.id])

  const fetchPosts = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiService.getPosts(targetUserId, 150, 0)
      
      const currentPosts = state.posts.posts
      const newPostsFromAPI = response.posts
      
      const mostRecentNewPost = currentPosts
        .filter(post => post._isNewlyCreated)
        .sort((a, b) => {
          const timeA = new Date(a._createdAt || 0).getTime()
          const timeB = new Date(b._createdAt || 0).getTime()
          return timeB - timeA
        })[0]
      
      const mergedPosts = newPostsFromAPI.map(apiPost => {
        const currentPost = currentPosts.find(cp => cp.id === apiPost.id)
        if (currentPost) {
          return {
            ...apiPost,
            _isNewlyCreated: currentPost._isNewlyCreated,
            _createdAt: currentPost._createdAt
          }
        }
        return apiPost
      })
      
      const combinedPosts = mostRecentNewPost 
        ? [
            mostRecentNewPost,
            ...mergedPosts.filter(mergedPost => mergedPost.id !== mostRecentNewPost.id)
          ]
        : mergedPosts
      
      dispatch({ type: 'SET_POSTS', payload: combinedPosts })
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch posts' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getCurrentUserId, dispatch, state.posts.posts])

  const refreshPosts = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiService.getPosts(targetUserId, 150, 0)
      
      const freshPosts = response.posts.map(post => {
        const { 
          _isNewlyCreated, 
          _createdAt, 
          ...cleanPost 
        } = post
        return cleanPost
      })
      
      dispatch({ type: 'SET_POSTS', payload: freshPosts })
    } catch (error) {
      console.error('Failed to refresh posts:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh posts' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getCurrentUserId, dispatch])

  const createPost = useCallback(async (postData: any) => {
    const userId = postData.userId
    
    if (!userId) {
      throw new Error('User ID is required to create a post')
    }

    try {
      const response = await apiService.createPost(postData)
      
      const postWithFlag = {
        ...response.post,
        _isNewlyCreated: true,
        _createdAt: new Date().toISOString()
      }
      
      dispatch({ type: 'ADD_POST', payload: postWithFlag })
      return response
    } catch (error) {
      throw error
    }
  }, [])

  const likePost = useCallback(async (postId: string, targetUserId: string) => {
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
    try {
      await apiService.bookmarkPost(postId, { userId: targetUserId })
      dispatch({ type: 'BOOKMARK_POST', payload: postId })
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }, [])

  const unbookmarkPost = useCallback(async (postId: string, targetUserId: string) => {
    try {
      await apiService.unbookmarkPost(postId, { userId: targetUserId })
      dispatch({ type: 'UNBOOKMARK_POST', payload: postId })
    } catch (error) {
      console.error('Error unbookmarking post:', error)
    }
  }, [])

  const viewPost = useCallback(async (postId: string, targetUserId: string) => {
    try {
      await apiService.viewPost(postId, { viewerId: targetUserId })
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

  const addComment = useCallback(async (postId: string, content: string, userId: string) => {
    try {
      const response = await apiService.commentOnPost(postId, { content, userId })
      return response
    } catch (error) {
      console.error('Failed to add comment:', error)
      throw error
    }
  }, [])

  const getPostComments = useCallback(async (postId: string) => {
    try {
      const response = await apiService.getPostComments(postId)
      return response
    } catch (error) {
      console.error('Failed to get post comments:', error)
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
  }, [getCurrentUserId, dispatch])

  const fetchEnhancedNotifications = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.getEnhancedNotifications(targetUserId)
      dispatch({ type: 'SET_ENHANCED_NOTIFICATIONS', payload: response.notifications })
    } catch (error) {
      console.error('Failed to fetch enhanced notifications:', error)
    }
  }, [getCurrentUserId, dispatch])

  const getUnreadNotificationCount = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return 0

    try {
      const response = await apiService.getUnreadNotificationCount(targetUserId)
      return response.unreadCount
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error)
      return 0
    }
  }, [getCurrentUserId])

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId)
      dispatch({ 
        type: 'UPDATE_NOTIFICATION', 
        payload: { id: notificationId, updates: { is_read: true } } 
      })
      return response.notification
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }, [])

  const markAllNotificationsAsRead = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.markAllNotificationsAsRead(targetUserId)
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })
      return response.updatedCount
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }, [getCurrentUserId, dispatch])

  const fetchActivities = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      const response = await apiService.getActivities(targetUserId)
      dispatch({ type: 'SET_ACTIVITIES', payload: response.activities })
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }, [getCurrentUserId, dispatch])

  const getMessageThreads = useCallback(async (userId: string) => {
    try {
      const response = await apiService.getMessageThreads(userId)
      dispatch({ type: 'SET_MESSAGE_THREADS', payload: response.threads })
    } catch (error) {
      console.error('Failed to fetch message threads:', error)
    }
  }, [dispatch])

  const getThreadMessages = useCallback(async (threadId: string) => {
    try {
      const response = await apiService.getThreadMessages(threadId)
      dispatch({ type: 'SET_THREAD_MESSAGES', payload: { threadId, messages: response.messages } })
    } catch (error) {
      console.error('Failed to fetch thread messages:', error)
    }
  }, [dispatch])

  const sendMessage = useCallback(async (threadId: string, data: SendMessageRequest) => {
    try {
      const response = await apiService.sendMessage(threadId, data)
      dispatch({ type: 'ADD_THREAD_MESSAGE', payload: { threadId, message: response.messageData } })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [dispatch])

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
  }, [dispatch])

  const getCommunities = useCallback(async (searchQuery?: string) => {
    try {
      const response = await apiService.getCommunities(searchQuery)
      const allCommunities = response.communities
      
      if (session?.dbUser?.id) {
        try {
          const userCommunitiesResponse = await apiService.getUserCommunities(session.dbUser.id)
          const userCommunities = userCommunitiesResponse.communities
          
          const mergedCommunities = allCommunities.map(community => {
            const userCommunity = userCommunities.find(uc => uc.id === community.id)
            return {
              ...community,
              user_joined_at: userCommunity?.user_joined_at || null,
              user_is_admin: userCommunity?.user_is_admin || false
            }
          })
          
          dispatch({ type: 'SET_COMMUNITIES', payload: mergedCommunities })
        } catch (userCommunitiesError) {
          console.error('Failed to fetch user communities for merging:', userCommunitiesError)
          dispatch({ type: 'SET_COMMUNITIES', payload: allCommunities })
        }
      } else {
        dispatch({ type: 'SET_COMMUNITIES', payload: allCommunities })
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error)
    }
  }, [session?.dbUser?.id, dispatch])

  const joinCommunity = useCallback(async (communityId: string, data: JoinCommunityRequest) => {
    try {
      await apiService.joinCommunity(communityId, data)
    } catch (error) {
      console.error('Failed to join community:', error)
    }
  }, [])

  const getCommunityMembers = useCallback(async (communityId: string) => {
    try {
      const response = await apiService.getCommunityMembers(communityId)
      return response
    } catch (error) {
      console.error('Failed to fetch community members:', error)
      throw error
    }
  }, [])

  const sendCommunityMessage = useCallback(async (communityId: string, data: SendMessageRequest) => {
    try {
      const response = await apiService.sendCommunityMessage(communityId, data)
      dispatch({ type: 'ADD_COMMUNITY_MESSAGE', payload: { communityId, message: response.messages[0] } })
    } catch (error) {
      console.error('Failed to send community message:', error)
    }
  }, [dispatch])

  const getCommunityMessages = useCallback(async (communityId: string) => {
    try {
      const response = await apiService.getCommunityMessages(communityId)
      dispatch({ type: 'SET_COMMUNITY_MESSAGES', payload: { communityId, messages: response.messages } })
    } catch (error) {
      console.error('Failed to fetch community messages:', error)
    }
  }, [dispatch])

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

  const updateUserProfile = useCallback(async (userId: string, data: UpdateProfileRequest) => {
    try {
      const response = await apiService.updateUserProfile(userId, data)
      return response
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }, [])

  const followUser = useCallback(async (targetUserId: string, data: FollowRequest) => {
    try {
      const authToken = session?.accessToken || session?.token
      const response = await apiService.followUser(targetUserId, data, authToken)
      return response
    } catch (error) {
      console.error('Failed to follow user:', error)
      throw error
    }
  }, [session])

  const unfollowUser = useCallback(async (targetUserId: string, data: FollowRequest) => {
    try {
      const authToken = session?.accessToken || session?.token
      const response = await apiService.unfollowUser(targetUserId, data, authToken)
      return response
    } catch (error) {
      console.error('Failed to unfollow user:', error)
      throw error
    }
  }, [session])

  const getUserFollowers = useCallback(async (userId: string, limit: number = 50, offset: number = 0) => {
    try {
      const response = await apiService.getUserFollowers(userId, limit, offset)
      return response
    } catch (error) {
      console.error('Failed to fetch user followers:', error)
      throw error
    }
  }, [])

  const getUserFollowing = useCallback(async (userId: string, limit: number = 50, offset: number = 0) => {
    try {
      const response = await apiService.getUserFollowing(userId, limit, offset)
      return response
    } catch (error) {
      console.error('Failed to fetch user following:', error)
      throw error
    }
  }, [])

  const getFollowingFeed = useCallback(async (userId: string, limit: number = 50, offset: number = 0) => {
    try {
      const response = await apiService.getFollowingFeed(userId, limit, offset)
      return response
    } catch (error) {
      console.error('Failed to fetch following feed:', error)
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
    addComment,
    getPostComments,
    followUser,
    unfollowUser,
    getUserProfile,
    updateUserProfile,
    getUserFollowers,
    getUserFollowing,
    getFollowingFeed,
    fetchNotifications,
    fetchEnhancedNotifications,
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
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshPosts,
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