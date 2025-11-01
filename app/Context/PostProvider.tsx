'use client'

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import { apiService } from '../lib/api'
import type { ApiPost } from '../types'
import type { CreatePostResponse, CommentRequest, CommentResponse } from '../types/api'
import { useAuth } from './AuthProvider'

// Action types
type PostAction =
  | { type: 'SET_POSTS'; payload: ApiPost[] }
  | { type: 'ADD_POST'; payload: ApiPost }
  | { type: 'UPDATE_POST'; payload: { id: string; updates: Partial<ApiPost> } }
  | { type: 'REMOVE_POST'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LIKE_POST'; payload: string }
  | { type: 'UNLIKE_POST'; payload: string }
  | { type: 'RETWEET_POST'; payload: string }
  | { type: 'UNRETWEET_POST'; payload: string }
  | { type: 'BOOKMARK_POST'; payload: string }
  | { type: 'UNBOOKMARK_POST'; payload: string }
  | { type: 'VIEW_POST'; payload: string }

// State interface
interface PostState {
  posts: ApiPost[]
  loading: boolean
  error: string | null
  hasMore: boolean
  engagement: {
    likedPosts: Set<string>
    retweetedPosts: Set<string>
    bookmarkedPosts: Set<string>
    viewedPosts: Set<string>
  }
}

// Initial state
const initialState: PostState = {
  posts: [],
  loading: false,
  error: null,
  hasMore: true,
  engagement: {
    likedPosts: new Set(),
    retweetedPosts: new Set(),
    bookmarkedPosts: new Set(),
    viewedPosts: new Set()
  }
}

// Reducer
function postReducer(state: PostState, action: PostAction): PostState {
  switch (action.type) {
    case 'SET_POSTS':
      return {
        ...state,
        posts: action.payload,
        loading: false,
        error: null
      }
    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts]
      }
    case 'UPDATE_POST':
      return {
        ...state,
        posts: state.posts.map(post =>
          post.id === action.payload.id
            ? { ...post, ...action.payload.updates }
            : post
        )
      }
    case 'REMOVE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.id !== action.payload)
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
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
interface PostContextType {
  state: PostState
  fetchPosts: (userId?: string) => Promise<void>
  refreshPosts: (userId?: string) => Promise<void>
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
  getPostDetails: (postId: string) => Promise<any>
}

const PostContext = createContext<PostContextType | undefined>(undefined)

// Provider component
export function PostProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(postReducer, initialState)
  const { getCurrentUserId } = useAuth()

  const fetchPosts = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiService.getPosts(targetUserId, 150, 0)

      const currentPosts = state.posts
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
  }, [getCurrentUserId, state.posts])

  const refreshPosts = useCallback(async (userId?: string) => {
    const targetUserId = userId || getCurrentUserId()
    if (!targetUserId) return

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await apiService.getPosts(targetUserId, 150, 0)

      const freshPosts = response.posts.map(post => {
        const { _isNewlyCreated, _createdAt, ...cleanPost } = post
        return cleanPost
      })

      dispatch({ type: 'SET_POSTS', payload: freshPosts })
    } catch (error) {
      console.error('Failed to refresh posts:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh posts' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [getCurrentUserId])

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

  const getPostDetails = useCallback(async (postId: string) => {
    try {
      const response = await apiService.getPostDetails(postId)
      return response.post
    } catch (error) {
      console.error('Failed to get post details:', error)
      throw error
    }
  }, [])

  const value: PostContextType = {
    state,
    fetchPosts,
    refreshPosts,
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
    getPostDetails,
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
}

export function usePost() {
  const context = useContext(PostContext)
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider')
  }
  return context
}
