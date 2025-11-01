'use client'

import React, { createContext, useContext, ReactNode, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { apiService } from '../lib/api'
import type { UpdateProfileRequest, FollowRequest } from '../types/api'

// Context
interface UserContextType {
  getUserProfile: (userId: string) => Promise<any>
  updateUserProfile: (userId: string, data: UpdateProfileRequest) => Promise<any>
  followUser: (targetUserId: string, data: FollowRequest) => Promise<any>
  unfollowUser: (targetUserId: string, data: FollowRequest) => Promise<any>
  getUserFollowers: (userId: string, limit: number, offset: number) => Promise<any>
  getUserFollowing: (userId: string, limit: number, offset: number) => Promise<any>
  getFollowingFeed: (userId: string, limit: number, offset: number) => Promise<any>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

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

  const value: UserContextType = {
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    getUserFollowers,
    getUserFollowing,
    getFollowingFeed,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
