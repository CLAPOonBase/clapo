'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { User, Users, MapPin, Calendar, Link, Image as ImageIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface UserProfileHoverProps {
  userId: string
  username: string
  avatarUrl?: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface UserStats {
  followers: number
  following: number
  posts: number
  isFollowing: boolean
}

export function UserProfileHover({ 
  userId, 
  username, 
  avatarUrl, 
  children, 
  position = 'bottom' 
}: UserProfileHoverProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { data: session } = useSession()
  const { getUserProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser } = useApi()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const currentUserId = session?.dbUser?.id
  const isOwnProfile = currentUserId === userId

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(async () => {
      setShowProfile(true)
      await loadUserStats()
    }, 500)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setShowProfile(false)
      // Clear stats when hiding to allow fresh data next time
      setUserStats(null)
      setIsFollowing(false)
    }, 200)
  }

  const loadUserStats = async () => {
    if (!currentUserId || isLoading) return
    
    // If we already have stats, don't reload
    if (userStats) return
    
    setIsLoading(true)
    try {
      const profileResponse = await getUserProfile(userId)
      
      if (profileResponse && profileResponse.profile) {
        const profile = profileResponse.profile
        setUserStats({
          posts: profile.total_posts || 0,
          followers: profile.followers_count || 0,
          following: profile.following_count || 0,
          isFollowing: false
        })
        
        // Check follow status
        if (!isOwnProfile) {
          const followersResponse = await getUserFollowers(userId, 100, 0)
          const isCurrentlyFollowing = followersResponse?.followers?.some(
            (follower: any) => follower.follower_id === currentUserId
          )
          setIsFollowing(isCurrentlyFollowing || false)
          if (userStats) {
            setUserStats(prev => prev ? { ...prev, isFollowing: isCurrentlyFollowing || false } : null)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!currentUserId || isOwnProfile) return
    
    try {
      if (isFollowing) {
        await unfollowUser(userId, { followerId: currentUserId })
        setIsFollowing(false)
        if (userStats) {
          setUserStats({ ...userStats, followers: Math.max(0, userStats.followers - 1) })
        }
      } else {
        await followUser(userId, { followerId: currentUserId })
        setIsFollowing(true)
        if (userStats) {
          setUserStats({ ...userStats, followers: userStats.followers + 1 })
        }
      }
    } catch (error) {
      console.error('❌ Failed to toggle follow:', error)
    }
  }

  const handleViewProfile = () => {
    // Store current page state and scroll position
    const currentState = {
      pathname,
      searchParams: searchParams.toString(),
      scrollY: window.scrollY,
      timestamp: Date.now()
    }
    
    // Store in sessionStorage for persistence across navigation
    sessionStorage.setItem('profileNavigationState', JSON.stringify(currentState))
    
    // Navigate to profile
    router.push(`/snaps/profile/${userId}`)
    setShowProfile(false)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    }
  }

  return (
    <>
      <div 
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
        
        {showProfile && (
          <div className={`absolute ${getPositionClasses()} z-50`}>
            <div className="bg-dark-800 border border-dark-700 rounded-lg shadow-xl p-4 w-80 max-w-sm">
              {/* Arrow */}
              <div className={`absolute w-3 h-3 bg-dark-800 border-l border-t border-dark-700 transform rotate-45 ${
                position === 'top' ? 'top-full -mt-1.5' :
                position === 'bottom' ? 'bottom-full -mb-1.5' :
                position === 'left' ? 'left-full -ml-1.5' :
                'right-full -mr-1.5'
              }`} />
              
              {/* Header */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <Image
                    src={avatarUrl || '/4.png'}
                    alt={username}
                    width={48}
                    height={48}
                    className="w-12 h-12 h-12 rounded-full"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {username}
                    </h3>
                    {!isOwnProfile && (
                      <button
                        onClick={handleFollowToggle}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          isFollowing
                            ? 'bg-dark-700 text-white hover:bg-dark-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              {userStats && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">{userStats.posts}</div>
                    <div className="text-dark-400 text-xs">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">{userStats.followers}</div>
                    <div className="text-dark-400 text-xs">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold text-lg">{userStats.following}</div>
                    <div className="text-dark-400 text-xs">Following</div>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}

              {/* View Profile Link */}
              <div className="border-t border-dark-700 pt-3">
                <button 
                  onClick={handleViewProfile}
                  className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


    </>
  )
} 