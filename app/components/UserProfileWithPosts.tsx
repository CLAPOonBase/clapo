import React, { useState } from 'react'
import Image from 'next/image'
import EnhancedPostCard from './EnhancedPostCard'

interface UserProfile {
  id: string
  username: string
  email: string
  bio: string
  avatarUrl: string
  createdAt: string
  followerCount: number
  followingCount: number
  total_posts?: number
  total_likes_given?: number
  total_comments_made?: number
  total_retweets_made?: number
  total_bookmarks_made?: number
  posts?: Array<{
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
  recent_activity?: Array<{
    activity_type: 'like' | 'comment' | 'retweet' | 'post_created'
    created_at: string
    post_content: string
    post_id: string
  }>
}

interface UserProfileWithPostsProps {
  profile: UserProfile
  onLike: (postId: string) => void
  onRetweet: (postId: string) => void
  onBookmark: (postId: string) => void
  onComment: (postId: string) => void
}

export default function UserProfileWithPosts({ profile, onLike, onRetweet, onBookmark, onComment }: UserProfileWithPostsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'activity'>('posts')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        )
      case 'comment':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      case 'retweet':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 4v6h-6M1 20v-6h6M20.24 7.76a6 6 0 00-8.49-8.49l-4.24 4.24a6 6 0 008.49 8.49l4.24-4.24z"/>
          </svg>
        )
      case 'post_created':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getActivityText = (type: string) => {
    switch (type) {
      case 'like':
        return 'liked a post'
      case 'comment':
        return 'commented on a post'
      case 'retweet':
        return 'retweeted a post'
      case 'post_created':
        return 'created a post'
      default:
        return 'interacted with a post'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start space-x-6">
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={profile.avatarUrl}
              alt={profile.username}
              fill
              className="rounded-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
            </div>
            
            <p className="text-gray-600 mb-4">{profile.bio}</p>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <span>Joined {formatDate(profile.createdAt)}</span>
              <span>{profile.followerCount} followers</span>
              <span>{profile.followingCount} following</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-900">{profile.total_posts || 0}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-500">{profile.total_likes_given || 0}</div>
                <div className="text-sm text-gray-500">Likes</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-500">{profile.total_comments_made || 0}</div>
                <div className="text-sm text-gray-500">Comments</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-500">{profile.total_retweets_made || 0}</div>
                <div className="text-sm text-gray-500">Retweets</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-500">{profile.total_bookmarks_made || 0}</div>
                <div className="text-sm text-gray-500">Bookmarks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-4 px-6 text-sm font-medium ${
              activeTab === 'posts'
                ? 'text-[#4F47EB] border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Posts ({profile.posts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-4 px-6 text-sm font-medium ${
              activeTab === 'activity'
                ? 'text-[#4F47EB] border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recent Activity ({profile.recent_activity?.length || 0})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {profile.posts && profile.posts.length > 0 ? (
                profile.posts.map((post) => (
                  <div key={post.id} className="bg-gray-50 rounded-lg p-4">
                    {post.is_retweet && (
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                        </svg>
                        <span>Retweeted from @{post.original_post_username}</span>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">@{profile.username}</span>
                          <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
                        </div>
                        
                        <p className="text-gray-800 mb-3">
                          {post.is_retweet && post.original_post_content 
                            ? post.original_post_content 
                            : post.content
                          }
                        </p>
                        
                        {post.media_url && (
                          <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden">
                            <Image
                              src={post.media_url}
                              alt="Post media"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div className="flex items-center space-x-6 text-gray-500 text-sm">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{post.like_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.comment_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span>{post.retweet_count}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.view_count}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No posts yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {profile.recent_activity && profile.recent_activity.length > 0 ? (
                profile.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">@{profile.username}</span>
                        <span className="text-gray-500 text-sm">{getActivityText(activity.activity_type)}</span>
                        <span className="text-gray-400 text-sm">{formatDate(activity.created_at)}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{activity.post_content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 