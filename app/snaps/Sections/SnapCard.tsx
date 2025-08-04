"use client"
import React, { useState } from 'react'
import { MessageCircle, Repeat2, Heart, Bookmark, Eye, X, MoreHorizontal } from 'lucide-react'
import { Post, ApiPost } from '@/app/types'
import { useApi } from '../../Context/ApiProvider'
import { useSession } from 'next-auth/react'
import EngagementDetails from '../../components/EngagementDetails'
import CommentSection from '../../components/CommentSection'
import Toast from '../../components/Toast'

type Props = {
  post: Post | ApiPost
  liked?: boolean
  bookmarked?: boolean
  retweeted?: boolean
  onLike?: (id: number | string) => void
  onRetweet?: (id: number | string) => void
  onBookmark?: (id: number | string) => void
}

export default function SnapCard({ post, liked, bookmarked, retweeted, onLike, onRetweet, onBookmark }: Props) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showCommentSection, setShowCommentSection] = useState(false)
  const [showEngagement, setShowEngagement] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'like' | 'unlike' | 'retweet' | 'unretweet' | 'bookmark' | 'unbookmark' | 'comment' } | null>(null)
  const [isLoading, setIsLoading] = useState({ like: false, retweet: false, bookmark: false })
  const { likePost, unlikePost, retweetPost, bookmarkPost, unbookmarkPost, viewPost, state } = useApi()
  const { data: session } = useSession()

  const isApiPost = 'user_id' in post
  const postId = isApiPost ? post.id : post.id.toString()
  const postContent = isApiPost ? post.content : post.content
  const postImage = isApiPost ? post.media_url : post.image
  const postAuthor = isApiPost 
    ? post.username || 'Unknown' 
    : post.author || 'Unknown'
  const postHandle = isApiPost 
    ? `@${post.username || 'unknown'}` 
    : post.handle || '@unknown'
  const postTime = isApiPost 
    ? new Date(post.created_at).toLocaleDateString() 
    : (post.time || 'Unknown')

  const postAvatar = isApiPost 
    ? post.avatar_url 
    : undefined

  // Initialize local engagement state from API data
  const [localEngagement, setLocalEngagement] = useState({
    likes: isApiPost ? (post.like_count || 0) : (post.likes || 0),
    comments: isApiPost ? (post.comment_count || 0) : (post.comments || 0),
    retweets: isApiPost ? (post.retweet_count || 0) : (post.retweets || 0),
    bookmarks: isApiPost ? (post.bookmarks?.length || 0) : 0
  })

  // Track user's engagement state
  const [userEngagement, setUserEngagement] = useState({
    liked: false,
    retweeted: false,
    bookmarked: false
  })

  // Check if current user is in engagement lists from API data
  const currentUserId = session?.dbUser?.id
  const isUserInLikes = isApiPost && post.likes && post.likes.some(user => user.user_id === currentUserId)
  const isUserInRetweets = isApiPost && post.retweets && post.retweets.some(user => user.user_id === currentUserId)
  const isUserInBookmarks = isApiPost && post.bookmarks && post.bookmarks.some(user => user.user_id === currentUserId)

  // Initialize user engagement state from API data
  React.useEffect(() => {
    const newUserEngagement = {
      liked: isUserInLikes || liked || state.engagement.likedPosts.has(postId),
      retweeted: isUserInRetweets || retweeted || state.engagement.retweetedPosts.has(postId),
      bookmarked: isUserInBookmarks || bookmarked || state.engagement.bookmarkedPosts.has(postId)
    }
    setUserEngagement(newUserEngagement)
    
    console.log('🎯 Engagement State:', {
      postId,
      isUserInLikes,
      isUserInBookmarks,
      newUserEngagement,
      stateEngagement: {
        likedPosts: Array.from(state.engagement.likedPosts),
        bookmarkedPosts: Array.from(state.engagement.bookmarkedPosts)
      }
    })
  }, [isUserInLikes, isUserInRetweets, isUserInBookmarks, liked, retweeted, bookmarked, postId, state.engagement])

  // Determine if user is currently engaged (for icon coloring)
  // Use only the userEngagement state for consistency
  const isCurrentlyLiked = userEngagement.liked
  const isCurrentlyRetweeted = userEngagement.retweeted
  const isCurrentlyBookmarked = userEngagement.bookmarked

  const handleLike = async () => {
    if (!session?.dbUser?.id || isLoading.like) return
    
    setIsLoading(prev => ({ ...prev, like: true }))
    try {
      if (isCurrentlyLiked) {
        // Unlike the post
        await unlikePost(postId, session.dbUser.id)
        setLocalEngagement(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }))
        setUserEngagement(prev => ({ ...prev, liked: false }))
        setToast({ message: 'Post unliked', type: 'unlike' })
      } else {
        // Like the post
        await likePost(postId, session.dbUser.id)
        setLocalEngagement(prev => ({ ...prev, likes: prev.likes + 1 }))
        setUserEngagement(prev => ({ ...prev, liked: true }))
        setToast({ message: 'Post liked', type: 'like' })
      }
      onLike?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
      setToast({ message: 'Failed to like/unlike post', type: 'error' })
    } finally {
      setIsLoading(prev => ({ ...prev, like: false }))
    }
  }

  const handleRetweet = async () => {
    if (!session?.dbUser?.id || isLoading.retweet || isCurrentlyRetweeted) return
    
    setIsLoading(prev => ({ ...prev, retweet: true }))
    try {
      await retweetPost(postId, session.dbUser.id)
      setLocalEngagement(prev => ({ ...prev, retweets: prev.retweets + 1 }))
      setUserEngagement(prev => ({ ...prev, retweeted: true }))
      setToast({ message: 'Post retweeted', type: 'retweet' })
      onRetweet?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to retweet post:', error)
      setToast({ message: 'Failed to retweet post', type: 'error' })
    } finally {
      setIsLoading(prev => ({ ...prev, retweet: false }))
    }
  }

  const handleBookmark = async () => {
    if (!session?.dbUser?.id || isLoading.bookmark) return
    
    console.log('🔍 Bookmark action:', { 
      postId, 
      isCurrentlyBookmarked, 
      currentBookmarks: localEngagement.bookmarks 
    })
    
    setIsLoading(prev => ({ ...prev, bookmark: true }))
    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark using DELETE API
        console.log('🗑️ Removing bookmark...')
        await unbookmarkPost(postId, session.dbUser.id)
        setLocalEngagement(prev => ({ ...prev, bookmarks: Math.max(0, prev.bookmarks - 1) }))
        setUserEngagement(prev => ({ ...prev, bookmarked: false }))
        setToast({ message: 'Bookmark removed', type: 'unbookmark' })
        console.log('✅ Bookmark removed successfully')
      } else {
        // Add bookmark using POST API
        console.log('🔖 Adding bookmark...')
        await bookmarkPost(postId, session.dbUser.id)
        setLocalEngagement(prev => ({ ...prev, bookmarks: prev.bookmarks + 1 }))
        setUserEngagement(prev => ({ ...prev, bookmarked: true }))
        setToast({ message: 'Post bookmarked', type: 'bookmark' })
        console.log('✅ Bookmark added successfully')
      }
      onBookmark?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('❌ Failed to bookmark post:', error)
      setToast({ message: 'Failed to bookmark post', type: 'error' })
    } finally {
      setIsLoading(prev => ({ ...prev, bookmark: false }))
    }
  }

  const handleView = async () => {
    if (!session?.dbUser?.id) return
    try {
      await viewPost(postId, session.dbUser.id)
    } catch (error) {
      console.error('Failed to view post:', error)
    }
  }

  const handleCommentAdded = (updatedComments: Array<{id: string; content: string; created_at: string; user_id: string; username: string; avatar_url: string}>) => {
    setLocalEngagement(prev => ({ ...prev, comments: updatedComments.length }))
  }



  return (
    <>
      <div className="bg-dark-800 my-4 rounded-md p-4" onClick={handleView}>
        <div className="flex space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
            {postAvatar ? (
              <img 
                src={postAvatar} 
                alt={postAuthor}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://robohash.org/default.png'
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">{postAuthor?.substring(0, 2)?.toUpperCase() || 'U'}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-white">{postAuthor}</span>
              <span className="text-gray-400">{postHandle}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">{postTime}</span>
            </div>
            <p className="text-white mb-3">{postContent}</p>
            {postImage && (
              <div className="mb-3 rounded-lg overflow-hidden">
                {postImage.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img 
                    src={postImage} 
                    alt="Post content"
                    className="w-full max-h-96 object-cover cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowImageModal(true)
                    }}
                  />
                ) : postImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                  <video
                    src={postImage}
                    controls
                    className="w-full max-h-96 rounded-lg"
                  />
                ) : postImage.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <audio
                      src={postImage}
                      controls
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-sm">Media file</p>
                    <a
                      href={postImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View media
                    </a>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLike()
                  }}
                  disabled={isLoading.like}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLoading.like 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isCurrentlyLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{localEngagement.likes}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCommentSection(true)
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{localEngagement.comments}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRetweet()
                  }}
                  disabled={isLoading.retweet || isCurrentlyRetweeted}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLoading.retweet || isCurrentlyRetweeted
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-green-500'
                  }`}
                >
                  <Repeat2 className={`w-5 h-5 ${isCurrentlyRetweeted ? 'fill-green-500 text-green-500' : ''}`} />
                  <span>{localEngagement.retweets}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark()
                  }}
                  disabled={isLoading.bookmark}
                  className={`flex items-center space-x-2 transition-colors ${
                    isLoading.bookmark 
                      ? 'text-gray-500 cursor-not-allowed' 
                      : 'text-gray-400 hover:text-purple-500'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isCurrentlyBookmarked ? 'fill-purple-500 text-purple-500' : ''}`} />
                  <span>{localEngagement.bookmarks}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEngagement(true)
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{isApiPost ? post.post_popularity_score : 0}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && postImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={postImage} 
              alt="Post content"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {showCommentSection && isApiPost && (
        <CommentSection
          post={post}
          onClose={() => setShowCommentSection(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {showEngagement && isApiPost && (
        <EngagementDetails
          likes={post.likes}
          retweets={post.retweets}
          bookmarks={post.bookmarks}
          onClose={() => setShowEngagement(false)}
        />
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
