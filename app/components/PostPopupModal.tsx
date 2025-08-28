'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Heart, MessageCircle, Share2, Eye, MoreHorizontal, Send } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useApi } from '../Context/ApiProvider'

interface PostPopupModalProps {
  post: any
  isOpen: boolean
  onClose: () => void
}

export const PostPopupModal = ({ post, isOpen, onClose }: PostPopupModalProps) => {
  const { data: session } = useSession()
  const { likePost, unlikePost, commentPost, retweetPost, bookmarkPost, unbookmarkPost } = useApi()
  
  const [isLiked, setIsLiked] = useState(false)
  const [isRetweeted, setIsRetweeted] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  const currentUserId = session?.dbUser?.id

  useEffect(() => {
    if (post && currentUserId) {
      // Check if user has already liked, retweeted, or bookmarked this post
      // This would typically come from the post data or a separate API call
      setIsLiked(post.is_liked || false)
      setIsRetweeted(post.is_retweeted || false)
      setIsBookmarked(post.is_bookmarked || false)
    }
  }, [post, currentUserId])

  const handleLike = async () => {
    if (!currentUserId || !post) return
    
    try {
      if (isLiked) {
        await unlikePost(post.id, currentUserId)
        setIsLiked(false)
        // Update like count in the post object
        post.like_count = Math.max(0, post.like_count - 1)
      } else {
        await likePost(post.id, currentUserId)
        setIsLiked(true)
        // Update like count in the post object
        post.like_count = post.like_count + 1
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }

  const handleRetweet = async () => {
    if (!currentUserId || !post) return
    
    try {
      if (isRetweeted) {
        // Note: No unretweet API available, just update local state
        setIsRetweeted(false)
        // Update retweet count in the post object
        post.retweet_count = Math.max(0, post.retweet_count - 1)
      } else {
        await retweetPost(post.id, currentUserId)
        setIsRetweeted(true)
        // Update retweet count in the post object
        post.retweet_count = post.retweet_count + 1
      }
    } catch (error) {
      console.error('Failed to toggle retweet:', error)
    }
  }

  const handleBookmark = async () => {
    if (!currentUserId || !post) return
    
    try {
      if (isBookmarked) {
        await unbookmarkPost(post.id, currentUserId)
        setIsBookmarked(false)
      } else {
        await bookmarkPost(post.id, currentUserId)
        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  const handleComment = async () => {
    if (!currentUserId || !post || !commentText.trim()) return
    
    setIsSubmittingComment(true)
    try {
      const response = await commentPost(post.id, {
        commenterId: currentUserId,
        content: commentText.trim()
      })
      
      if (response) {
        // Add the new comment to the comments list
        const newComment = {
          id: response.id || Date.now().toString(),
          content: commentText.trim(),
          user_id: currentUserId,
          username: session?.dbUser?.username,
          avatar_url: session?.dbUser?.avatar_url,
          created_at: new Date().toISOString()
        }
        setComments(prev => [newComment, ...prev])
        
        // Update comment count in the post object
        post.comment_count = post.comment_count + 1
        
        // Clear the comment input
        setCommentText('')
      }
    } catch (error) {
      console.error('Failed to post comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const loadComments = async () => {
    if (!post || isLoadingComments) return
    
    setIsLoadingComments(true)
    try {
      // This would typically call an API to get comments
      // For now, we'll use a mock approach
      const mockComments = [
        {
          id: '1',
          content: 'Great post!',
          user_id: 'user1',
          username: 'user1',
          avatar_url: null,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ]
      setComments(mockComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen || !post) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-dark-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-white">Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Post Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-dark-700">
              {post.user?.avatar_url ? (
                <Image
                  src={post.user.avatar_url}
                  alt={post.user.username || 'User'}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {post.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-white">{post.user?.username || 'User'}</div>
              <div className="text-sm text-gray-400">
                {formatTimeAgo(post.created_at)}
              </div>
            </div>
          </div>

          {/* Post Text */}
          <div className="text-white mb-4 text-lg leading-relaxed">
            {post.content}
          </div>

          {/* Post Media */}
          {post.media_url && (
            <div className="mb-4">
              {post.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <Image
                  src={post.media_url}
                  alt="Post media"
                  width={600}
                  height={400}
                  className="w-full rounded-lg object-cover"
                  unoptimized
                />
              ) : (
                <div className="bg-dark-700 rounded-lg p-8 text-center">
                  <span className="text-gray-400">Media attachment</span>
                </div>
              )}
            </div>
          )}

          {/* Post Stats */}
          <div className="flex items-center space-x-6 text-gray-400 text-sm mb-6">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{post.view_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.like_count || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Share2 className="w-4 h-4" />
              <span>{post.retweet_count || 0}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Comment</span>
            </button>

            <button
              onClick={handleRetweet}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isRetweeted
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              <Share2 className={`w-5 h-5 ${isRetweeted ? 'fill-current' : ''}`} />
              <span>{isRetweeted ? 'Retweeted' : 'Retweet'}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="border-t border-dark-700 pt-6">
              <h4 className="text-lg font-semibold text-white mb-4">Comments</h4>
              
              {/* Comment Input */}
              <div className="flex space-x-3 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                  />
                </div>
                <button
                  onClick={handleComment}
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingComment ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {isLoadingComments ? (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                    <span className="text-gray-400">Loading comments...</span>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-dark-700 flex-shrink-0">
                        {comment.avatar_url ? (
                          <Image
                            src={comment.avatar_url}
                            alt={comment.username || 'User'}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                            {comment.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-dark-700 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-white text-sm">
                              {comment.username}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {formatTimeAgo(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-white text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
