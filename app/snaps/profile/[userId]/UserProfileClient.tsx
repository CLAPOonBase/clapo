'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, User, Users, MapPin, Calendar, Link, Grid, Heart, MessageCircle, Share2, Image as ImageIcon, Eye, ArrowLeft, MessageSquare } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'
import { useRouter } from 'next/navigation'
import Sidebar from '../../Sections/Sidebar'
import UserActivityFeed from '../../Sections/ActivityFeed'
import { DMSection } from '@/app/components/DMSection'
import { CommunitySection } from '@/app/components/CommunitySection'

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
  const [activeTab, setActiveTab] = useState<'posts' | 'messages' | 'communities' | 'activity'>('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isCheckingFollowStatus, setIsCheckingFollowStatus] = useState(false)
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'notifications' | 'likes' | 'activity' | 'profile' | 'messages' | 'bookmarks' | 'share' | 'search'>('home')
  
  // Message state
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dmSection, setDmSection] = useState<'threads' | 'search'>('threads')
  
  // Community state
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [communitySection, setCommunitySection] = useState<'my' | 'join' | 'create'>('my')
  
  // Mock data for messages and communities (replace with real API calls)
  const [messageThreads, setMessageThreads] = useState<any[]>([])
  const [communities, setCommunities] = useState<any[]>([])
  
  const { data: session } = useSession()
  const { getUserProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser } = useApi()
  const router = useRouter()
  
  const currentUserId = session?.dbUser?.id
  const isOwnProfile = currentUserId === userId

  useEffect(() => {
    if (userId) {
      loadUserProfile()
      if (!isOwnProfile && currentUserId) {
        checkFollowStatus()
      }
    }
  }, [userId, currentUserId, isOwnProfile])

  // Load mock data for messages and communities
  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessageThreads()
    } else if (activeTab === 'communities') {
      loadCommunities()
    }
  }, [activeTab])

  const loadUserProfile = async () => {
    if (!userId || isLoading) return
    
    setIsLoading(true)
    try {
      const profileResponse = await getUserProfile(userId)
      
      // The API returns { message: string, profile: UserProfile }
      if (profileResponse && profileResponse.profile) {
        setUserProfile(profileResponse.profile)
      } else {
        console.error('Invalid profile response structure:', profileResponse)
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
    // Mock data - replace with real API call
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
    // Mock data - replace with real API call
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
    if (!currentUserId || isOwnProfile || isCheckingFollowStatus || !userProfile) return
    
    setIsCheckingFollowStatus(true)
    try {
      // Check if current user is in the followers list of the target user
      const followersResponse = await getUserFollowers(userId, 100, 0)
      
      const isCurrentlyFollowing = followersResponse?.followers?.some(
        (follower: any) => {
          // The API returns follower_id, not id
          return follower.follower_id === currentUserId
        }
      )
      
      setIsFollowing(isCurrentlyFollowing || false)
    } catch (error) {
      console.error('Failed to check follow status:', error)
    } finally {
      setIsCheckingFollowStatus(false)
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
    console.log('Starting chat with:', user)
  }

  const handleJoinCommunity = (communityId: string) => {
    // Handle joining a community
    console.log('Joining community:', communityId)
  }

  const handleBackNavigation = () => {
    // Check if we have stored navigation state
    const storedState = sessionStorage.getItem('profileNavigationState')
    
    if (storedState) {
      try {
        const navigationState = JSON.parse(storedState)
        const timeDiff = Date.now() - navigationState.timestamp
        
        // Only use stored state if it's recent (within 5 minutes)
        if (timeDiff < 5 * 60 * 1000) {
          // Clear the stored state
          sessionStorage.removeItem('profileNavigationState')
          
          // Navigate back to the stored location
          if (navigationState.pathname === '/snaps') {
            // Extract the page from searchParams (e.g., "page=notifications" -> "notifications")
            const pageMatch = navigationState.searchParams.match(/page=([^&]+)/)
            if (pageMatch) {
              const page = pageMatch[1]
              
              // Store the target page in sessionStorage for the snaps page to pick up
              sessionStorage.setItem('targetPage', page)
              sessionStorage.setItem('targetScrollY', navigationState.scrollY.toString())
              
              // Navigate to snaps
              router.push('/snaps')
              return
            }
          }
          
          // Fallback to stored pathname
          router.push(navigationState.pathname)
          setTimeout(() => {
            if (navigationState.scrollY > 0) {
              window.scrollTo(0, navigationState.scrollY)
            }
          }, 100)
          return
        }
      } catch (error) {
        console.error('Failed to parse navigation state:', error)
        sessionStorage.removeItem('profileNavigationState')
      }
    }
    
    // Fallback to browser back navigation
    router.back()
  }

  if (isLoading) {
    return (
      <div className="flex-col md:flex-row text-white flex mx-auto">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky top-20 bg-dark-800 p-4">
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
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky top-20 bg-dark-800 p-4">
          <div className="text-center py-8 text-dark-400">
            User not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col md:flex-row text-white flex mx-auto">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky top-20 bg-dark-800 p-4">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBackNavigation}
            className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="p-6 border-b border-dark-700 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Image
                src={userProfile.avatar_url || '/4.png'}
                alt={userProfile.username}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-white text-xl font-bold">
                  {userProfile.username}
                </h3>
                {!isOwnProfile && (
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isFollowing
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
              </div>
              
              {userProfile.bio && (
                <p className="text-dark-300 text-sm mb-4">
                  {userProfile.bio}
                </p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-dark-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(userProfile.created_at)}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">{userProfile.total_posts}</div>
                  <div className="text-dark-400 text-xs">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">{userProfile.followers_count}</div>
                  <div className="text-dark-400 text-xs">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">{userProfile.following_count}</div>
                  <div className="text-dark-400 text-xs">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-semibold text-lg">{userProfile.total_likes_given}</div>
                  <div className="text-dark-400 text-xs">Likes</div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-3 gap-4 text-xs text-dark-400">
                <div className="text-center">
                  <span>Comments: {userProfile.total_comments_made}</span>
                </div>
                <div className="text-center">
                  <span>Retweets: {userProfile.total_retweets_made}</span>
                </div>
                <div className="text-center">
                  <span>Bookmarks: {userProfile.total_bookmarks_made}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-700 mb-6">
          <div className="flex">
            {[
              { id: 'posts', label: 'Posts', icon: Grid },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'communities', label: 'Communities', icon: Users },
              { id: 'activity', label: 'Activity', icon: MessageCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {userProfile?.posts?.length > 0 ? (
                userProfile.posts.map((post) => (
                  <div key={post.id} className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Image
                        src={userProfile.avatar_url || '/4.png'}
                        alt={userProfile.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-white font-semibold">
                            {userProfile.username}
                          </span>
                          <span className="text-dark-400 text-sm">
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                        <p className="text-white text-sm mb-3">{post.content}</p>
                        
                        {post.media_url && (
                          <div className="mb-3">
                            {post.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <Image
                                src={post.media_url}
                                alt="Post media"
                                width={400}
                                height={200}
                                className="rounded-lg max-w-full"
                              />
                            ) : (
                              <div className="bg-dark-600 rounded-lg p-4 text-center">
                                <span className="text-dark-400">Media attachment</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-6 text-dark-400 text-sm">
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comment_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.like_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Share2 className="w-4 h-4" />
                            <span>{post.retweet_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.view_count}</span>
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
          
          {activeTab === 'messages' && (
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setDmSection('threads')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dmSection === 'threads'
                        ? 'bg-blue-600 text-white'
                        : 'bg-dark-600 text-dark-300 hover:text-white'
                    }`}
                  >
                    Threads
                  </button>
                  <button
                    onClick={() => setDmSection('search')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dmSection === 'search'
                        ? 'bg-blue-600 text-white'
                        : 'bg-dark-600 text-dark-300 hover:text-white'
                    }`}
                  >
                    Search Users
                  </button>
                </div>
                
                <DMSection
                  dmSection={dmSection}
                  state={{ messageThreads, communities: [] }}
                  session={session}
                  selectedThread={selectedThread}
                  onSelectThread={setSelectedThread}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onStartChat={handleStartChat}
                  unreadCounts={{}}
                  lastMessages={{}}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'communities' && (
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="mb-4">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setCommunitySection('my')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      communitySection === 'my'
                        ? 'bg-blue-600 text-white'
                        : 'bg-dark-600 text-dark-300 hover:text-white'
                    }`}
                  >
                    My Communities
                  </button>
                  <button
                    onClick={() => setCommunitySection('join')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      communitySection === 'join'
                        ? 'bg-blue-600 text-white'
                        : 'bg-dark-600 text-dark-300 hover:text-white'
                    }`}
                  >
                    Join Communities
                  </button>
                  <button
                    onClick={() => setCommunitySection('create')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      communitySection === 'create'
                        ? 'bg-blue-600 text-white'
                        : 'bg-dark-600 text-dark-300 hover:text-white'
                    }`}
                  >
                    Create Community
                  </button>
                </div>
                
                <CommunitySection
                  communitySection={communitySection}
                  state={{ communities, messageThreads: [] }}
                  session={session}
                  selectedCommunity={selectedCommunity}
                  onSelectCommunity={setSelectedCommunity}
                  onJoinCommunity={handleJoinCommunity}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {userProfile?.recent_activity?.length > 0 ? (
                userProfile.recent_activity.map((activity, index) => (
                  <div key={index} className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        {activity.activity_type === 'like' && <Heart className="w-5 h-5 text-white" />}
                        {activity.activity_type === 'comment' && <MessageCircle className="w-5 h-5 text-white" />}
                        {activity.activity_type === 'retweet' && <Share2 className="w-5 h-5 text-white" />}
                        {activity.activity_type === 'post_created' && <Grid className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-white font-semibold capitalize">
                            {activity.activity_type}
                          </span>
                          <span className="text-dark-400 text-sm">
                            {formatDate(activity.created_at)}
                          </span>
                        </div>
                        <p className="text-white text-sm">{activity.post_content}</p>
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
        </div>
      </div>
      
      {session?.dbUser && (
        <div className="hidden md:block top-20 w-[300px]">
          <UserActivityFeed username={session.dbUser.username} activity={[]} />
        </div>
      )}
    </div>
  )
}


