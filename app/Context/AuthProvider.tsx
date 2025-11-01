'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { apiService } from '../lib/api'
import type { ApiUser } from '../types'

// Action types
type AuthAction =
  | { type: 'SET_USER'; payload: ApiUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// State interface
interface AuthState {
  currentUser: ApiUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Initial state
const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null
}

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: true,
        error: null
      }
    case 'CLEAR_USER':
      return {
        currentUser: null,
        isAuthenticated: false,
        loading: false,
        error: null
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
    default:
      return state
  }
}

// Context
interface AuthContextType {
  state: AuthState
  login: (username: string, password: string) => Promise<void>
  signup: (userData: unknown) => Promise<void>
  signupWithPrivy: (privyData: unknown) => Promise<any>
  logout: () => void
  refreshUserData: (userId: string) => Promise<void>
  getCurrentUserId: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { data: session, status, update } = useSession()

  const getCurrentUserId = useCallback(() => {
    const extendedSession = session as any

    if (extendedSession?.dbUser?.id) {
      return extendedSession.dbUser.id
    }

    if (extendedSession?.dbUserId) {
      return extendedSession.dbUserId
    }

    if (extendedSession?.user?.id) {
      return extendedSession.user.id
    }

    return state.currentUser?.id || null
  }, [session, state.currentUser?.id])

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
    const extendedSession = session as any

    if (status === 'loading') {
      dispatch({ type: 'SET_LOADING', payload: true })
    } else if (status === 'authenticated' && extendedSession?.dbUser) {
      const userData = { ...extendedSession.dbUser };

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
    } else if (status === 'unauthenticated') {
      dispatch({ type: 'CLEAR_USER' })
    }
  }, [session, status])

  const login = async (username: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await apiService.login({ username, password })
      dispatch({ type: 'SET_USER', payload: response.user as any })
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
      dispatch({ type: 'SET_USER', payload: response.user as any })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Signup failed' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const signupWithPrivy = async (privyData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await fetch(
        '/api/auth/signup-privy',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(privyData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.message?.message || data.message || 'Failed to create account'
        throw new Error(errorMessage)
      }

      if (data.user) {
        const apiUser: ApiUser = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          bio: data.user.bio || '',
          avatarUrl: data.user.avatar_url || data.user.avatarUrl,
          createdAt: data.user.created_at || data.user.createdAt,
          followerCount: data.user.follower_count || 0,
          followingCount: data.user.following_count || 0,
        }
        dispatch({ type: 'SET_USER', payload: apiUser })
      }

      return data
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Signup failed' })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = () => {
    dispatch({ type: 'CLEAR_USER' })
  }

  const value: AuthContextType = {
    state,
    login,
    signup,
    signupWithPrivy,
    logout,
    refreshUserData,
    getCurrentUserId,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
