/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import React, { useState } from 'react'
import Image from 'next/image'
import EngagementDetails from './EngagementDetails'

interface Post {
  id: string
  user_id: string
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
  post_popularity_score: number
  username: string
  avatar_url: string
  likes?: Array<{
    user_id: string
    username: string
    avatar_url: string
  }>
  retweets?: Array<{
    user_id: string
    username: string
    avatar_url: string
  }>
  bookmarks?: Array<{
    user_id: string
    username: string
    avatar_url: string
  }>
  comments?: Array<{
    id: string
    content: string
    created_at: string
    user_id: string
    username: string
    avatar_url: string
  }>
}

interface EnhancedPostCardProps {
  post: Post
  onLike: (postId: string) => void
  onRetweet: (postId: string) => void
  onBookmark: (postId: string) => void
  onComment: (postId: string) => void
}

export default function EnhancedPostCard({ post, onLike, onRetweet, onBookmark, onComment }: EnhancedPostCardProps) {
  const [showEngagement, setShowEngagement] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleEngagementClick = (type: 'likes' | 'retweets' | 'bookmarks' | 'comments') => {
    const hasEngagement = 
      (type === 'likes' && post.likes && post.likes.length > 0) ||
      (type === 'retweets' && post.retweets && post.retweets.length > 0) ||
      (type === 'bookmarks' && post.bookmarks && post.bookmarks.length > 0) ||
      (type === 'comments' && post.comments && post.comments.length > 0)

    if (hasEngagement) {
      setShowEngagement(true)
    }
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
        {post.is_retweet && (
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
            <span>@{post.username} retweeted</span>
          </div>
        )}

        <div className="flex space-x-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={post.avatar_url}
              alt={post.username}
              fill
              className="rounded-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">@{post.username}</span>
              <span className="text-gray-500 text-sm">{formatDate(post.created_at)}</span>
            </div>
            
            <p className="text-gray-800 mb-3">{post.content}</p>
            
            {post.media_url && (
              <div className="relative w-full h-64 mb-3 rounded-lg overflow-hidden">
                <Image
                  src={post.media_url}
                  alt="Post media"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-gray-500">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => onLike(post.id)}
                  className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{post.like_count}</span>
                </button>

                <button
                  onClick={() => handleEngagementClick('likes')}
                  className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <span>{post.comment_count}</span>
                </button>

                <button
                  onClick={() => onRetweet(post.id)}
                  className="flex items-center space-x-1 hover:text-green-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{post.retweet_count}</span>
                </button>

                <button
                  onClick={() => onBookmark(post.id)}
                  className="flex items-center space-x-1 hover:text-purple-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.view_count}</span>
                </span>
              </div>
            </div>

            {(post.likes && post.likes.length > 0) || 
             (post.retweets && post.retweets.length > 0) || 
             (post.bookmarks && post.bookmarks.length > 0) || 
             (post.comments && post.comments.length > 0) ? (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {post.likes && post.likes.length > 0 && (
                    <button
                      onClick={() => handleEngagementClick('likes')}
                      className="hover:text-red-500 transition-colors"
                    >
                      {post.likes.length} like{post.likes.length !== 1 ? 's' : ''}
                    </button>
                  )}
                  {post.retweets && post.retweets.length > 0 && (
                    <button
                      onClick={() => handleEngagementClick('retweets')}
                      className="hover:text-green-500 transition-colors"
                    >
                      {post.retweets.length} retweet{post.retweets.length !== 1 ? 's' : ''}
                    </button>
                  )}
                  {post.bookmarks && post.bookmarks.length > 0 && (
                    <button
                      onClick={() => handleEngagementClick('bookmarks')}
                      className="hover:text-purple-500 transition-colors"
                    >
                      {post.bookmarks.length} bookmark{post.bookmarks.length !== 1 ? 's' : ''}
                    </button>
                  )}
                  {post.comments && post.comments.length > 0 && (
                    <button
                      onClick={() => handleEngagementClick('comments')}
                      className="hover:text-blue-500 transition-colors"
                    >
                      {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showEngagement && (
        <EngagementDetails
          likes={post.likes}
          retweets={post.retweets}
          bookmarks={post.bookmarks}
          onClose={() => setShowEngagement(false)}
        />
      )}
    </>
  )
} 