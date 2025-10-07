'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { X, User, Users, MapPin, Calendar, Link, Grid, Heart, MessageCircle, Share2, Image as ImageIcon, Eye, ArrowLeft, MessageSquare, Volume2, TrendingUp, Repeat2, Triangle, Bookmark } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'
import { useRouter } from 'next/navigation'
import Sidebar from '../../Sections/Sidebar'
import { CreatorTokenDisplay } from '@/app/components/CreatorTokenDisplay'
import { useCreatorToken } from '@/app/hooks/useCreatorToken'
import { generateCreatorTokenUUID } from '@/app/lib/uuid'
import CreatorTokenTrading from '@/app/components/CreatorTokenTrading'
import ReputationBadge from '@/app/components/ReputationBadge'

interface UserProfile {
  id: string
  username: string
  email: string
  bio: string
  avatar_url?: string
  created_at: string
  total_posts: number
  total_likes_given: number
  total_comments_made: number
  total_retweets_made: number
  total_bookmarks_made: number
  followers_count: number
  following_count: number
  reputation_score?: number
  reputation_tier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
  posts: Array<{
    id: string
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
    original_post_content?: string
    original_post_username?: string
  }>
  recent_activity: Array<{
    activity_type: 'like' | 'comment' | 'retweet' | 'post_created'
    created_at: string
    post_content: string
    post_id: string
  }>
}

interface UserProfileClientProps {
  userId: string
}

export default function UserProfileClient({ userId }: UserProfileClientProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'activity' | 'followers'>('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isCheckingFollowStatus, setIsCheckingFollowStatus] = useState(false)
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "explore"
    | "notifications"
    | "likes"
    |"wallet"
    | "activity"
    | "profile"
    | "messages"
    | "bookmarks"
    | "share"
    | "search"
  >("home");  
  
  // Message state
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dmSection, setDmSection] = useState<'threads' | 'search'>('threads')
  
  // Community state
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [communitySection, setCommunitySection] = useState<'my' | 'join' | 'create'>('my')
  
  // Follower/Following lists state
  const [showFollowersList, setShowFollowersList] = useState(false)
  const [showFollowingList, setShowFollowingList] = useState(false)
  const [followersList, setFollowersList] = useState<any[]>([])
  const [followingList, setFollowingList] = useState<any[]>([])
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false)
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false)
  
  // Mock data for messages and communities (replace with real API calls)
  const [messageThreads, setMessageThreads] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  
  const [creatorTokenExists, setCreatorTokenExists] = useState(true)
  const [checkingTokenExists, setCheckingTokenExists] = useState(false)
  const [creatorTokenUserId, setCreatorTokenUserId] = useState<string | null>(null)
  const [showTradingModal, setShowTradingModal] = useState(false)
  
  const { data: session, status } = useSession()
  const { getUserProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser } = useApi()
  const { checkCreatorExists, isConnected, address } = useCreatorToken()
  const router = useRouter()
  
  const currentUserId = session?.dbUser?.id
  const isOwnProfile = currentUserId === userId
  const isSessionLoading = status === 'loading'

  useEffect(() => {
    if (userId) {
      loadUserProfile()
    }
  }, [userId])

  useEffect(() => {
    if (!isOwnProfile && currentUserId && userProfile && session?.dbUser && !isSessionLoading) {
      checkFollowStatus()
    }
  }, [currentUserId, isOwnProfile, userProfile, session?.dbUser, isSessionLoading])

  useEffect(() => {
    if (userId) {
      setCreatorTokenUserId(userId)
      checkTokenExists()
    }
  }, [userId])

  const checkTokenExists = async () => {
    if (!userId) return
    
    try {
      setCheckingTokenExists(true)
      const tokenUuid = generateCreatorTokenUUID(userId)
      
      setCreatorTokenExists(true)
      setCreatorTokenUserId(userId)
      
      try {
        const exists = await checkCreatorExists(tokenUuid)
        if (!exists) {
          // Keep optimistic state
        }
      } catch (error) {
        // Keep optimistic state
      }
      
    } catch (error) {
      // Keep optimistic state
    } finally {
      setCheckingTokenExists(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'followers') {
      if (followersList.length === 0) {
        loadFollowersList()
      }
      if (followingList.length === 0) {
        loadFollowingList()
      }
    }
  }, [activeTab, followersList.length, followingList.length])

  const loadUserProfile = async () => {
    if (!userId || isLoading) return
    
    setIsLoading(true)
    try {
      const profileResponse = await getUserProfile(userId)
      
      if (profileResponse && profileResponse.profile) {
        setUserProfile(profileResponse.profile)
      } else {
        router.push('/snaps')
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
      router.push('/snaps')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessageThreads = async () => {
    const mockThreads = [
      {
        id: '1',
        participants: [{ user_id: '1', username: 'john_doe' }, { user_id: '2', username: 'jane_smith' }],
        lastMessage: { content: 'Hey, how are you?', timestamp: new Date().toISOString() },
        unreadCount: 2
      },
      {
        id: '2',
        participants: [{ user_id: '1', username: 'john_doe' }, { user_id: '3', username: 'bob_wilson' }],
        lastMessage: { content: 'Thanks for the help!', timestamp: new Date().toISOString() },
        unreadCount: 0
      }
    ]
    setMessageThreads(mockThreads)
  }

  const loadCommunities = async () => {
    const mockCommunities = [
      {
        id: '1',
        name: 'Tech Enthusiasts',
        description: 'A community for technology lovers',
        memberCount: 1250,
        image_url: null
      },
      {
        id: '2',
        name: 'Design Masters',
        description: 'Creative design community',
        memberCount: 890,
        image_url: null
      }
    ]
    setCommunities(mockCommunities)
  }

  const checkFollowStatus = async () => {
    if (!currentUserId || isOwnProfile || isCheckingFollowStatus || !userProfile) {
      return
    }
    
    setIsCheckingFollowStatus(true)
    try {
      const followersResponse = await getUserFollowers(userId, 100, 0)
      
      if (!followersResponse || !followersResponse.followers) {
        setIsFollowing(false)
        return
      }
      
      const isCurrentlyFollowing = followersResponse.followers.some(
        (follower: any) => {
          return follower.follower_id === currentUserId
        }
      )
      
      setIsFollowing(isCurrentlyFollowing || false)
    } catch (error) {
      console.error('Failed to check follow status:', error)
      setIsFollowing(false)
    } finally {
      setIsCheckingFollowStatus(false)
    }
  }

  const loadFollowersList = async () => {
    if (isLoadingFollowers) return
    
    setIsLoadingFollowers(true)
    try {
      const response = await getUserFollowers(userId, 100, 0)
      setFollowersList(response?.followers || [])
    } catch (error) {
      console.error('Failed to load followers:', error)
    } finally {
      setIsLoadingFollowers(false)
    }
  }

  const loadFollowingList = async () => {
    if (isLoadingFollowing) return
    
    setIsLoadingFollowing(true)
    try {
      const response = await getUserFollowing(userId, 100, 0)
      setFollowingList(response?.following || [])
    } catch (error) {
      console.error('Failed to load following:', error)
    } finally {
      setIsLoadingFollowing(false)
    }
  }

  const handleFollowToggle = async () => {
    if (!currentUserId || isOwnProfile || !userProfile) return
    
    try {
      if (isFollowing) {
        await unfollowUser(userId, { followerId: currentUserId })
        setIsFollowing(false)
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            followers_count: Math.max(0, userProfile.followers_count - 1)
          })
        }
      } else {
        await followUser(userId, { followerId: currentUserId })
        setIsFollowing(true)
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            followers_count: userProfile.followers_count + 1
          })
        }
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleStartChat = (user: any) => {
    // Handle starting a new chat
  }

  const handleJoinCommunity = (communityId: string) => {
    // Handle joining a community
  }

  const handleViewUserProfile = (userId: string) => {
    router.push(`/snaps/profile/${userId}`)
  }

  const handleBackNavigation = () => {
    const storedState = sessionStorage.getItem('profileNavigationState')
    
    if (storedState) {
      try {
        const navigationState = JSON.parse(storedState)
        const timeDiff = Date.now() - navigationState.timestamp
        
        if (timeDiff < 5 * 60 * 1000) {
          sessionStorage.removeItem('profileNavigationState')
          
          if (navigationState.pathname === '/snaps') {
            const pageMatch = navigationState.searchParams.match(/page=([^&]+)/)
            if (pageMatch) {
              const page = pageMatch[1]
              
              sessionStorage.setItem('targetPage', page)
              sessionStorage.setItem('targetScrollY', navigationState.scrollY.toString())
              
              router.push('/snaps')
              return
            }
          }
          
          router.push(navigationState.pathname)
          setTimeout(() => {
            if (navigationState.scrollY > 0) {
              window.scrollTo(0, navigationState.scrollY)
            }
          }, 100)
          return
        }
      } catch (error) {
        sessionStorage.removeItem('profileNavigationState')
      }
    }
    
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex-col md:flex-row text-white flex mx-auto">
        {/* <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} /> */}
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky bg-black p-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-dark-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-dark-700 rounded w-32"></div>
                <div className="h-4 bg-dark-700 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex-col md:flex-row text-white flex mx-auto">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky bg-black p-4">
          <div className="text-center py-8 text-dark-400">
            User not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col md:flex-row justify-between border-gray-700/70 text-white flex mx-auto">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 max-w-3xl mx-auto md:m-4 md:mt-1 rounded-2xl sticky bg-black py-4">
        {/* Back Button */}
        {/* <div className="mb-6">
          <button
            onClick={handleBackNavigation}
            className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div> */}

        {/* Main Profile Card */}
        <div className="border border-gray-700/50 rounded-2xl">
          <div className="p-6 border-b border-gray-700/30">
            {/* Top Row: Avatar and Action Buttons */}
            <div className="flex items-start justify-between mb-3">
              {/* Avatar and Bio Section */}
              <div className="flex flex-col items-start space-y-3">
                <div className="flex items-start space-x-4">
                  <Image
                    src={userProfile.avatar_url || '/4.png'}
                    alt={userProfile.username}
                    width={80}
                    height={80}
                    className="w-16 h-16 rounded-full border-2 border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/4.png';
                    }}
                  />

                  {/* Username and Handle */}
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-white text-lg font-bold">
                        {userProfile.username}
                      </h1>
                      {userProfile.reputation_score !== undefined && (
                        <ReputationBadge
                          score={userProfile.reputation_score}
                          tier={userProfile.reputation_tier}
                          size="sm"
                          showScore={true}
                        />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-2">@{userProfile.username}</p>
                  </div>
                </div>

                {/* Bio Section */}
                {userProfile.bio && (
                  <div>
                    <p className="text-white text-base leading-relaxed">
                      {userProfile.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end space-y-6">
                <div className="flex items-center space-x-3">
                  {!isOwnProfile && (
                    <>
                      <button
                        onClick={() => setShowTradingModal(true)}
                        className="text-white text-sm font-medium rounded-full px-6 py-2 transition-all duration-200"
                        style={{
                          backgroundColor: "#6E54FF",
                          boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                        }}
                      >
                        Buy Share
                      </button>
                      <button
                        onClick={handleFollowToggle}
                        disabled={isCheckingFollowStatus}
                        className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-full px-6 py-2 text-sm font-medium transition-all duration-200"
                      >
                        {isCheckingFollowStatus ? 'Checking...' : isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </>
                  )}
                </div>


                {/* Pool Rewards Section */}
                <div className="bg-gray-700/30 border-2 border-[#6e54ff] rounded-2xl px-4 py-3 min-w-[200px] hover:bg-gray-700/50 transition-colors mt-4">
                  <div className="flex flex-col items-center justify-center text-center">
                    <h3 className="text-white text-xs font-medium mb-2">POOL REWARDS</h3>
                    <div className="text-lg font-semibold text-white mb-1">$0</div>
                    <div className="text-xs text-gray-400">Total Pool</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center space-x-8 -mt-8">
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-lg">{userProfile.total_posts || 0}</span>
                <span className="text-gray-400 text-sm">Posts</span>
              </div>
              <div
                className={`flex items-center space-x-2 transition-colors ${
                  isLoadingFollowers ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:text-blue-400'
                }`}
                onClick={!isLoadingFollowers ? loadFollowersList : undefined}
              >
                <span className="text-white font-bold text-lg">
                  {isLoadingFollowers ? '...' : userProfile.followers_count || 0}
                </span>
                <span className="text-gray-400 text-sm">Followers</span>
              </div>
              <div
                className={`flex items-center space-x-2 transition-colors ${
                  isLoadingFollowing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:text-blue-400'
                }`}
                onClick={!isLoadingFollowing ? loadFollowingList : undefined}
              >
                <span className="text-white font-bold text-lg">
                  {isLoadingFollowing ? '...' : userProfile.following_count || 0}
                </span>
                <span className="text-gray-400 text-sm">Following</span>
              </div>
            </div>
          </div>

</div>


        <div className="mb-4 mt-4">
          <div className="bg-gray-700/50 rounded-full p-0.5">
            <div className="bg-black m-0.5 p-1 rounded-full relative flex">
              {[
                { id: 'posts', label: 'Posts', icon: Grid },
                { id: 'activity', label: 'Activity', icon: MessageCircle },
                { id: 'followers', label: 'Network', icon: Users },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center justify-center space-x-1 px-3 py-2 text-xs font-medium transition-all duration-200 rounded-full relative z-10 flex-1 ${
                    activeTab === id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}

              {/* Animated background */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  height: "32px",
                  boxShadow:
                    "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
                  backgroundColor: "#6E54FF",
                  top: "4px",
                  left: "4px",
                }}
                initial={false}
                animate={{
                  x: activeTab === "posts" ? "0%" : activeTab === "activity" ? "100%" : "200%",
                  width: "calc(33.333% - 8px)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>
          </div>
        </div>

        <div className="">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userProfile?.posts?.length > 0 ? (
                userProfile.posts.map((post) => (
                  <div key={post.id} className="shadow-custom border-2 border-gray-700/70 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col">
                      {/* Header Section */}
                      <div className='flex items-center space-x-3'>
                        <div className="flex flex-1 min-w-0 items-center justify-between">
                          <div className="flex flex-1 min-w-0 items-center justify-between">
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center space-x-2 group cursor-pointer">
                                {/* Avatar */}
                                <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                                  <Image
                                    src={userProfile.avatar_url || "/4.png"}
                                    alt={userProfile.username}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover bg-gray-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/4.png";
                                    }}
                                  />
                                </div>

                                {/* Username */}
                                <div className="flex items-center gap-2">
                                  <div className="flex min-w-0 items-center flex-wrap gap-x-1 text-sm">
                                    <span className="font-semibold text-white truncate hover:text-blue-500 transition-colors group-hover:underline">
                                      {userProfile.username}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-400 truncate">@{userProfile.username}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {post.is_retweet && (
                              <div className="flex items-center space-x-1 text-green-400">
                                <Share2 className="w-3 h-3" />
                                <span className="text-xs font-medium">Retweeted</span>
                              </div>
                            )}
                            <span className="text-gray-400 text-sm">{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="ml-12">
                        <div className="">
                          <p className="text-white text-base leading-relaxed whitespace-pre-wrap break-words">
                            {post.content}
                          </p>

                          {/* Media Section */}
                          {post.media_url && (
                            <div className="overflow-hidden mt-1">
                              {post.media_url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico)$/i) ? (
                                <div className="relative group inline-block">
                                  <Image
                                    src={post.media_url}
                                    alt="Post content"
                                    width={400}
                                    height={320}
                                    className="rounded-2xl max-h-80 w-auto object-cover cursor-pointer hover:opacity-95 transition-opacity duration-200"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ) : post.media_url.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|3gp|ts|mts|m2ts)$/i) ? (
                                <video
                                  src={post.media_url}
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                  controls
                                  className="w-auto max-h-80 bg-black rounded-lg"
                                />
                              ) : post.media_url.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma|opus|aiff|pcm)$/i) ? (
                                <div className="bg-black p-3 flex items-center space-x-3 rounded-lg">
                                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <Volume2 className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <audio src={post.media_url} controls className="flex-1" />
                                </div>
                              ) : (
                                <div className="bg-black p-3 flex items-center space-x-3 rounded-lg">
                                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-white text-sm font-medium">File</div>
                                    <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs">
                                      Download file
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Engagement Actions */}
                        <div className="flex items-center justify-between pt-3">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-white transition-colors opacity-60">
                              <Heart className="w-4 h-4" />
                              <span className="text-xs font-medium">{post.like_count}</span>
                            </button>

                            <button className="flex items-center space-x-1 text-gray-500 hover:text-white transition-colors opacity-60">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">{post.comment_count}</span>
                            </button>

                            <button className="flex items-center space-x-1 text-gray-500 hover:text-white transition-colors opacity-60">
                              <Repeat2 className="w-4 h-4 rotate-90" />
                              <span className="text-xs font-medium">{post.retweet_count}</span>
                            </button>
                          </div>

                          <div className='flex items-center space-x-4'>
                            <div className='flex items-center space-x-1 cursor-pointer'>
                              <Triangle className={`w-5 h-5 text-green-500 transition-all duration-200`} />
                              <span className="text-sm hidden text-green-500 sm:block font-medium">$27.01</span>
                            </div>

                            <button className="flex items-center space-x-1 text-gray-500 hover:text-white transition-colors opacity-60">
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-dark-400">
                  No posts yet
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {userProfile?.recent_activity?.length > 0 ? (
                userProfile.recent_activity.map((activity, index) => (
                  <div key={index} className="bg-black shadow-custom border-2 border-gray-700/70 rounded-2xl overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                          backgroundColor: activity.activity_type === 'like' ? '#ef4444' :
                                          activity.activity_type === 'comment' ? '#3b82f6' :
                                          activity.activity_type === 'retweet' ? '#10b981' : '#6E54FF'
                        }}>
                          {activity.activity_type === 'like' && <Heart className="w-5 h-5 text-white" />}
                          {activity.activity_type === 'comment' && <MessageCircle className="w-5 h-5 text-white" />}
                          {activity.activity_type === 'retweet' && <Share2 className="w-5 h-5 text-white" />}
                          {activity.activity_type === 'post_created' && <Grid className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-white font-semibold text-sm capitalize">
                              {activity.activity_type.replace('_', ' ')}
                            </span>
                            <span className="text-gray-500 text-xs">•</span>
                            <span className="text-gray-400 text-xs">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          <p className="text-white text-base leading-relaxed">{activity.post_content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-dark-400">
                  No recent activity
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div className="space-y-6">
              <div className="bg-black rounded-2xl p-6 border-2 border-gray-700/70 shadow-custom">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Followers ({userProfile.followers_count})</h3>
                  <button
                    onClick={loadFollowersList}
                    disabled={isLoadingFollowers}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    {isLoadingFollowers ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                
                {isLoadingFollowers ? (
                  <div className="text-center py-8 text-dark-400">Loading followers...</div>
                ) : followersList.length > 0 ? (
                  <div className="space-y-3">
                    {followersList.slice(0, 5).map((follower: any) => (
                      <div key={follower.follower_id} className="flex items-center space-x-3 p-3 bg-dark-600 rounded-lg">
                        <Image
                          src={follower.avatar_url || '/4.png'}
                          alt={follower.username || 'User'}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">{follower.username || 'Unknown User'}</div>
                          <div className="text-dark-400 text-sm">{follower.email || ''}</div>
                        </div>
                        <button 
                          onClick={() => handleViewUserProfile(follower.follower_id)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                    
                    {followersList.length > 5 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => setShowFollowersList(true)}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          View All {userProfile.followers_count} Followers
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-dark-400">
                    No followers yet
                  </div>
                )}
              </div>

              <div className="bg-black rounded-2xl p-6 border-2 border-gray-700/70 shadow-custom">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Following ({userProfile.following_count})</h3>
                  <button
                    onClick={loadFollowingList}
                    disabled={isLoadingFollowing}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    {isLoadingFollowing ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                
                {isLoadingFollowing ? (
                  <div className="text-center py-8 text-dark-400">Loading following...</div>
                ) : followingList.length > 0 ? (
                  <div className="space-y-3">
                    {followingList.slice(0, 5).map((following: any) => (
                      <div key={following.following_id} className="flex items-center space-x-3 p-3 bg-dark-600 rounded-lg">
                        <Image
                          src={following.avatar_url || '/4.png'}
                          alt={following.username || 'User'}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="text-white font-medium">{following.username || 'Unknown User'}</div>
                          <div className="text-dark-400 text-sm">{following.email || ''}</div>
                        </div>
                        <button 
                          onClick={() => handleViewUserProfile(following.following_id)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                    
                    {followingList.length > 5 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => setShowFollowingList(true)}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          View All {userProfile.following_count} Following
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-dark-400">
                    Not following anyone yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className='border border-gray-700/70 rounded-2xl hidden lg:block w-80 h-screen mr-4 sticky top-4 bg-black p-4'>

      </div>
      
      {/* Followers Modal */}
      {showFollowersList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFollowersList(false)}>
          <div className="bg-black rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Followers</h3>
              <button
                onClick={() => setShowFollowersList(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {isLoadingFollowers ? (
              <div className="text-center py-4 text-dark-400">Loading...</div>
            ) : followersList.length > 0 ? (
              <div className="space-y-3">
                {followersList.map((follower: any) => (
                  <div key={follower.follower_id} className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
                    <Image
                      src={follower.avatar_url || '/4.png'}
                      alt={follower.username || 'User'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{follower.username || 'Unknown User'}</div>
                      <div className="text-dark-400 text-sm">{follower.email || ''}</div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowFollowersList(false)
                        handleViewUserProfile(follower.follower_id)
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-dark-400">No followers yet</div>
            )}
          </div>
        </div>
      )}
      
      {/* Following Modal */}
      {showFollowingList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFollowingList(false)}>
          <div className="bg-black rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Following</h3>
              <button
                onClick={() => setShowFollowingList(false)}
                className="text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {isLoadingFollowing ? (
              <div className="text-center py-4 text-dark-400">Loading...</div>
            ) : followingList.length > 0 ? (
              <div className="space-y-3">
                {followingList.map((following: any) => (
                  <div key={following.following_id} className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
                    <Image
                      src={following.avatar_url || '/4.png'}
                      alt={following.username || 'User'}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="text-white font-medium">{following.username || 'Unknown User'}</div>
                      <div className="text-dark-400 text-sm">{following.email || ''}</div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowFollowingList(false)
                        handleViewUserProfile(following.following_id)
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-dark-400">Not following anyone yet</div>
            )}
          </div>
        </div>
      )}
      
      {/* Creator Token Trading Modal */}
      {showTradingModal && userProfile && (
        <CreatorTokenTrading
          creatorUuid={userId}
          creatorName={userProfile.username}
          creatorImageUrl={userProfile.avatar_url}
          isOpen={showTradingModal}
          onClose={() => setShowTradingModal(false)}
        />
      )}
    </div>
  )
}