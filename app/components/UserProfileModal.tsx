'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, User, Users, MapPin, Calendar, Link, Grid, Heart, MessageCircle, Share2, Image as ImageIcon, Eye, Volume2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'

interface UserProfileModalProps {
  userId: string
  username: string
  avatarUrl?: string
  isOpen: boolean
  onClose: () => void
}

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

export function UserProfileModal({ 
  userId, 
  username, 
  avatarUrl, 
  isOpen, 
  onClose 
}: UserProfileModalProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes' | 'activity'>('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isCheckingFollowStatus, setIsCheckingFollowStatus] = useState(false)
  const { data: session } = useSession()
  const { getUserProfile, getUserFollowers, getUserFollowing, followUser, unfollowUser } = useApi()
  
  const currentUserId = session?.dbUser?.id
  const isOwnProfile = currentUserId === userId

  useEffect(() => {
    if (isOpen && userId) {
      loadUserProfile()
      if (!isOwnProfile && currentUserId) {
        checkFollowStatus()
      }
    }
  }, [isOpen, userId, currentUserId, isOwnProfile])

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
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkFollowStatus = async () => {
    if (!currentUserId || isOwnProfile || isCheckingFollowStatus) return
    
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
    if (!currentUserId || isOwnProfile) return
    
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

  if (!isOpen) return null

  return (
    <div style={{zIndex: '999'}} className="fixed flex justify-center rounded-2xl border border-dark-700 bg-black/80">
      <div className="bg-black rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black border-b border-dark-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Profile</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="p-6 border-b border-dark-700">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-dark-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-dark-700 rounded w-32"></div>
                  <div className="h-4 bg-dark-700 rounded w-48"></div>
                </div>
              </div>
            </div>
          ) : userProfile ? (
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Image
                  src={userProfile.avatar_url || avatarUrl || '/4.png'}
                  alt={username}
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
          ) : (
            <div className="text-center text-dark-400">
              Failed to load profile
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-700">
          <div className="flex">
            {[
              { id: 'posts', label: 'Posts', icon: Grid },
              { id: 'activity', label: 'Activity', icon: MessageCircle },
              { id: 'replies', label: 'Replies', icon: MessageCircle },
              { id: 'media', label: 'Media', icon: ImageIcon },
              { id: 'likes', label: 'Likes', icon: Heart }
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
                            {post.media_url.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico)$/i) ? (
                              <Image
                                src={post.media_url}
                                alt="Post media"
                                width={400}
                                height={200}
                                className="rounded-lg max-w-full"
                              />
                            ) : post.media_url.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v|3gp|ts|mts|m2ts)$/i) ? (
                              <video 
                                src={post.media_url} 
                                controls
                                className="w-full max-h-96 bg-black rounded-lg"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : post.media_url.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma|opus|aiff|pcm)$/i) ? (
                              <div className="bg-black p-4 flex items-center space-x-3 rounded-lg">
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <Volume2 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <audio src={post.media_url} controls className="flex-1" />
                              </div>
                            ) : post.media_url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|odt|ods|odp)$/i) ? (
                              <div className="bg-black p-4 flex items-center space-x-3 rounded-lg">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="text-white text-sm font-medium">Document</div>
                                  <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs">
                                    View document
                                  </a>
                                </div>
                              </div>
                            ) : post.media_url.match(/\.(zip|rar|7z|tar|gz|bz2|xz)$/i) ? (
                              <div className="bg-black p-4 flex items-center space-x-3 rounded-lg">
                                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="text-white text-sm font-medium">Archive</div>
                                  <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs">
                                    Download archive
                                  </a>
                                </div>
                              </div>
                            ) : post.media_url.match(/\.(exe|msi|dmg|pkg|deb|rpm|appimage)$/i) ? (
                              <div className="bg-black p-4 flex items-center space-x-3 rounded-lg">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <div className="text-white text-sm font-medium">Executable</div>
                                  <a href={post.media_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs">
                                    Download file
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-black p-4 flex items-center space-x-3 rounded-lg">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
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
          
          {activeTab === 'replies' && (
            <div className="text-center py-8 text-dark-400">
              Replies coming soon
            </div>
          )}
          
          {activeTab === 'media' && (
            <div className="text-center py-8 text-dark-400">
              Media coming soon
            </div>
          )}
          
          {activeTab === 'likes' && (
            <div className="text-center py-8 text-dark-400">
              Likes coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 