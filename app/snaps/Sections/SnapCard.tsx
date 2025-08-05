"use client"
import React, { useState } from 'react'
import { MessageCircle, Repeat2, Heart, Bookmark, Eye, X, MoreHorizontal, Volume2 } from 'lucide-react'
import { Post, ApiPost } from '@/app/types'
import { useApi } from '../../Context/ApiProvider'
import { useSession } from 'next-auth/react'
import EngagementDetails from '../../components/EngagementDetails'
import CommentSection from '../../components/CommentSection'
import Toast from '../../components/Toast'
import CommentInputBar from './CommentInputBar'

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
    ? new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
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
  const isCurrentlyLiked = userEngagement.liked
  const isCurrentlyRetweeted = userEngagement.retweeted
  const isCurrentlyBookmarked = userEngagement.bookmarked

  const handleLike = async () => {
    if (!session?.dbUser?.id || isLoading.like) return
    
    setIsLoading(prev => ({ ...prev, like: true }))
    try {
      if (isCurrentlyLiked) {
        await unlikePost(postId, session.dbUser.id)
        setLocalEngagement(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }))
        setUserEngagement(prev => ({ ...prev, liked: false }))
        setToast({ message: 'Post unliked', type: 'unlike' })
      } else {
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
        console.log('🗑️ Removing bookmark...')
        await unbookmarkPost(postId, session.dbUser.id)
        setLocalEngagement(prev => ({ ...prev, bookmarks: Math.max(0, prev.bookmarks - 1) }))
        setUserEngagement(prev => ({ ...prev, bookmarked: false }))
        setToast({ message: 'Bookmark removed', type: 'unbookmark' })
        console.log('✅ Bookmark removed successfully')
      } else {
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
      <div className="bg-dark-800 text-secondary rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 my-4" onClick={handleView}>
        <div className="flex space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full overflow-hidden ">
              {postAvatar ? (
                <img 
                  src={postAvatar} 
                  alt={postAuthor}
                  className="w-full h-full object-cover bg-primary"
                  onError={(e) => {
                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + postAuthor + ''
                  }}
                />
              ) : (
                <div className="w-full h-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-se text-sm font-semibold">
                    {postAuthor?.substring(0, 2)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="font-semibold text-white truncate">{postAuthor}</span>
              <span className="text-secondary truncate">{postHandle}</span>
              <span className="text-secondary">•</span>
              <span className="text-secondary text-sm">{postTime}</span>
            </div>

            

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-secondary leading-relaxed whitespace-pre-wrap">{postContent}</p>
            </div>
            

            {/* Media */}
            {postImage && (
              <div className="mb-4">
                <div className="rounded-xl overflow-hidden border border-secondary">
                  {postImage.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img 
                      src={postImage} 
                      alt="Post content"
                      className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowImageModal(true)
                      }}
                    />
                  ) : postImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <div className="relative">
                      <video
                        src={postImage}
                        controls
                        className="w-full max-h-96 bg-gray-50"
                      />
                    </div>
                  ) : postImage.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                    <div className="bg-gray-50 p-4 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Volume2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <audio
                          src={postImage}
                          controls
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 text-center">
                      <p className="text-gray-600 text-sm mb-2">Media file</p>
                      <a
                        href={postImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View media
                      </a>
                    </div>
                  )}
                </div>
                
              </div>
            )}

            {/* Engagement Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Like Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLike()
                  }}
                  disabled={isLoading.like}
                  className={`flex items-center space-x-2 transition-all duration-200 hover:bg-red-50 hover:text-red-600 px-3 py-2 rounded-lg group ${
                    isLoading.like 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : isCurrentlyLiked 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 transition-all duration-200 ${
                    isCurrentlyLiked ? 'fill-red-600 text-red-600 scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="text-sm font-medium">{localEngagement.likes}</span>
                </button>

                {/* Comment Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCommentSection(true)
                  }}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-all duration-200" />
                  <span className="text-sm font-medium">{localEngagement.comments}</span>
                </button>

                {/* Retweet Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRetweet()
                  }}
                  disabled={isLoading.retweet || isCurrentlyRetweeted}
                  className={`flex items-center space-x-2 transition-all duration-200 hover:bg-green-50 hover:text-green-600 px-3 py-2 rounded-lg group ${
                    isLoading.retweet || isCurrentlyRetweeted
                      ? 'text-gray-400 cursor-not-allowed' 
                      : isCurrentlyRetweeted
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  <Repeat2 className={`w-5 h-5 transition-all duration-200 ${
                    isCurrentlyRetweeted ? 'fill-green-600 text-green-600 scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="text-sm font-medium">{localEngagement.retweets}</span>
                </button>

                {/* Bookmark Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark()
                  }}
                  disabled={isLoading.bookmark}
                  className={`flex items-center space-x-2 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 px-3 py-2 rounded-lg group ${
                    isLoading.bookmark 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : isCurrentlyBookmarked
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-blue-600'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 transition-all duration-200 ${
                    isCurrentlyBookmarked ? 'fill-blue-600 text-blue-600 scale-110' : 'group-hover:scale-110'
                  }`} />
                  <span className="text-sm font-medium">{localEngagement.bookmarks}</span>
                </button>

                {/* More Options */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEngagement(true)
                  }}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200 group"
                >
                  <MoreHorizontal className="w-5 h-5 group-hover:scale-110 transition-all duration-200" />
                </button>
              </div>

              {/* Views */}
              <div className="flex items-center space-x-2 text-gray-400">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isApiPost ? (post.post_popularity_score || 0).toLocaleString() : '0'}
                </span>
              </div>
            </div>
                   {isApiPost && (
  <div className="mt-4">
    <CommentInputBar onClick={() => setShowCommentSection(true)} />
  </div>
)}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && postImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-5xl max-h-full">
            <button 
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={postImage} 
              alt="Post content"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
   
        </div>
      )}

      {/* Comment Section */}
      {showCommentSection && isApiPost && (
        <CommentSection
          post={post}
          onClose={() => setShowCommentSection(false)}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Engagement Details */}
      {showEngagement && isApiPost && (
        <EngagementDetails
          likes={post.likes}
          retweets={post.retweets}
          bookmarks={post.bookmarks}
          onClose={() => setShowEngagement(false)}
        />
      )}
      
      {/* Toast */}
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