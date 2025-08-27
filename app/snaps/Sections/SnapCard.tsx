/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'
import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Repeat2, Heart, Bookmark, Eye, X, MoreHorizontal, Volume2, Paperclip, Smile, Send, ExternalLink } from 'lucide-react'
import { Post, ApiPost } from '@/app/types'
import { useApi } from '../../Context/ApiProvider'
import { useSession } from 'next-auth/react'
import EngagementDetails from '../../components/EngagementDetails'
import CommentSection from '../../components/CommentSection'
import Toast from '../../components/Toast'
import { AnimatePresence, motion } from "framer-motion"
import CommentInputBar from './CommentInputBar'
import { UserProfileHover } from '../../components/UserProfileHover'

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
  const [visibleCount, setVisibleCount] = useState(2)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showCommentSection, setShowCommentSection] = useState(false)
  const [showEngagement, setShowEngagement] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: any } | null>(null)
  const [isLoading, setIsLoading] = useState({ like: false, retweet: false, bookmark: false, comment: false })
  const [localEngagement, setLocalEngagement] = useState({ likes: 0, comments: 0, retweets: 0, bookmarks: 0 })
  const [userEngagement, setUserEngagement] = useState({ liked: false, retweeted: false, bookmarked: false })
  const [commentText, setCommentText] = useState('')
  const [showInlineComments, setShowInlineComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const hasInitialized = useRef(false)

  const { likePost, unlikePost, retweetPost, bookmarkPost, unbookmarkPost, viewPost, addComment, getPostComments, state } = useApi()
  const { data: session } = useSession()

  const isApiPost = 'user_id' in post
  const postId = post.id.toString()
  const postContent = post.content
  const postImage = isApiPost ? post.media_url : post.image
  const postAuthor = isApiPost ? (post.username || 'Unknown') : (post.author || 'Unknown')
  const postHandle = isApiPost ? `@${post.username || 'unknown'}` : (post.handle || '@unknown')
  const postTime = isApiPost
    ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : (post.time || 'Unknown')
  const postAvatar = isApiPost ? post.avatar_url : undefined
  const currentUserId = session?.dbUser?.id
  const currentUserAvatar = session?.dbUser?.avatar_url

  const isUserInLikes = isApiPost && post.likes?.some(u => u.user_id === currentUserId)
  const isUserInRetweets = isApiPost && post.retweets?.some(u => u.user_id === currentUserId)
  const isUserInBookmarks = isApiPost && post.bookmarks?.some(u => u.user_id === currentUserId)

  useEffect(() => {
    if (!hasInitialized.current && post && post.id) {
      hasInitialized.current = true
      
      const initialLikes = isApiPost ? (post.like_count || 0) : (post.likes || 0)
      const initialComments = isApiPost ? (post.comment_count || 0) : (post.comments || 0)
      const initialRetweets = isApiPost ? (post.retweet_count || 0) : (post.retweets || 0)
      const initialBookmarks = isApiPost ? (post.bookmarks?.length || 0) : 0

      setLocalEngagement({
        likes: initialLikes,
        comments: initialComments,
        retweets: initialRetweets,
        bookmarks: initialBookmarks
      })

      const userLiked = isUserInLikes || liked || state.engagement?.likedPosts?.has(postId) || false
      const userRetweeted = isUserInRetweets || retweeted || state.engagement?.retweetedPosts?.has(postId) || false
      const userBookmarked = isUserInBookmarks || bookmarked || state.engagement?.bookmarkedPosts?.has(postId) || false

      setUserEngagement({
        liked: userLiked,
        retweeted: userRetweeted,
        bookmarked: userBookmarked
      })

      if (isApiPost && post.comments) {
        setComments(post.comments)
      }
    }
  }, [postId, post, isApiPost, liked, retweeted, bookmarked, state.engagement])

  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowImageModal(false)
      }
    }

    if (showImageModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [showImageModal])

const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)

const handleImageClick = (e: React.MouseEvent) => {
  e.preventDefault()
  e.stopPropagation()
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  setClickPosition({
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  })
  setShowImageModal(true)
}


  const handleModalClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    console.log('Closing modal') // Debug log
    setShowImageModal(false)
  }

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the image itself
    if (e.target === e.currentTarget) {
      handleModalClose(e)
    }
  }

  const handleLike = async () => {
    if (!currentUserId || isLoading.like) return
    
    setIsLoading(prev => ({ ...prev, like: true }))
    
    try {
      const currentLiked = userEngagement.liked
      const currentCount = localEngagement.likes
      
      if (currentLiked) {
        const newCount = Math.max(0, currentCount - 1)
        setLocalEngagement(prev => ({ ...prev, likes: newCount }))
        setUserEngagement(prev => ({ ...prev, liked: false }))
        setToast({ message: 'Post unliked', type: 'unlike' })
        
        await unlikePost(postId, currentUserId)
        
        if (state.engagement?.likedPosts) {
          state.engagement.likedPosts.delete(postId)
        }
        
        onLike?.(isApiPost ? postId : parseInt(postId))
      } else {
        const newCount = currentCount + 1
        setLocalEngagement(prev => ({ ...prev, likes: newCount }))
        setUserEngagement(prev => ({ ...prev, liked: true }))
        setToast({ message: 'Post liked', type: 'like' })
        
        await likePost(postId, currentUserId)
        
        if (state.engagement?.likedPosts) {
          state.engagement.likedPosts.add(postId)
        }
        
        onLike?.(isApiPost ? postId : parseInt(postId))
      }
    } catch (error) {
      console.error('Failed to handle like:', error)
      setToast({ message: 'Failed to update like. Please try again.', type: 'error' })
      
      const currentLiked = userEngagement.liked
      const currentCount = localEngagement.likes
      
      if (currentLiked) {
        setLocalEngagement(prev => ({ ...prev, likes: currentCount + 1 }))
        setUserEngagement(prev => ({ ...prev, liked: true }))
      } else {
        setLocalEngagement(prev => ({ ...prev, likes: Math.max(0, currentCount - 1) }))
        setUserEngagement(prev => ({ ...prev, liked: false }))
      }
    } finally {
      setIsLoading(prev => ({ ...prev, like: false }))
    }
  }

  const handleRetweet = async () => {
    if (!currentUserId || isLoading.retweet || userEngagement.retweeted) return
    
    setIsLoading(prev => ({ ...prev, retweet: true }))
    
    try {
      const currentCount = localEngagement.retweets
      
      const newCount = currentCount + 1
      setLocalEngagement(prev => ({ ...prev, retweets: newCount }))
      setUserEngagement(prev => ({ ...prev, retweeted: true }))
      setToast({ message: 'Post retweeted', type: 'retweet' })
      
      await retweetPost(postId, currentUserId)
      
      if (state.engagement?.retweetedPosts) {
        state.engagement.retweetedPosts.add(postId)
      }
      
      onRetweet?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to retweet:', error)
      setToast({ message: 'Failed to retweet. Please try again.', type: 'error' })
      
      const currentCount = localEngagement.retweets
      setLocalEngagement(prev => ({ ...prev, retweets: Math.max(0, currentCount - 1) }))
      setUserEngagement(prev => ({ ...prev, retweeted: false }))
    } finally {
      setIsLoading(prev => ({ ...prev, retweet: false }))
    }
  }

  const handleBookmark = async () => {
    if (!currentUserId || isLoading.bookmark) return
    
    setIsLoading(prev => ({ ...prev, bookmark: true }))
    
    try {
      const currentBookmarked = userEngagement.bookmarked
      const currentCount = localEngagement.bookmarks
      
      if (currentBookmarked) {
        const newCount = Math.max(0, currentCount - 1)
        setLocalEngagement(prev => ({ ...prev, bookmarks: newCount }))
        setUserEngagement(prev => ({ ...prev, bookmarked: false }))
        setToast({ message: 'Bookmark removed', type: 'unbookmark' })
        
        await unbookmarkPost(postId, currentUserId)
        
        if (state.engagement?.bookmarkedPosts) {
          state.engagement.bookmarkedPosts.delete(postId)
        }
        
        onBookmark?.(isApiPost ? postId : parseInt(postId))
      } else {
        const newCount = currentCount + 1
        setLocalEngagement(prev => ({ ...prev, bookmarks: newCount }))
        setUserEngagement(prev => ({ ...prev, bookmarked: true }))
        setToast({ message: 'Post bookmarked', type: 'bookmark' })
        
        await bookmarkPost(postId, currentUserId)
        
        if (state.engagement?.bookmarkedPosts) {
          state.engagement.bookmarkedPosts.add(postId)
        }
        
        onBookmark?.(isApiPost ? postId : parseInt(postId))
      }
    } catch (error) {
      console.error('Failed to handle bookmark:', error)
      setToast({ message: 'Failed to update bookmark. Please try again.', type: 'error' })
      
      const currentBookmarked = userEngagement.bookmarked
      const currentCount = localEngagement.bookmarks
      
      if (currentBookmarked) {
        setLocalEngagement(prev => ({ ...prev, bookmarks: currentCount + 1 }))
        setUserEngagement(prev => ({ ...prev, bookmarked: true }))
      } else {
        setLocalEngagement(prev => ({ ...prev, bookmarks: Math.max(0, currentCount - 1) }))
        setUserEngagement(prev => ({ ...prev, bookmarked: false }))
      }
    } finally {
      setIsLoading(prev => ({ ...prev, bookmark: false }))
    }
  }

  const handleView = () => currentUserId && viewPost(postId, currentUserId).catch(() => {})

  const handleCommentAdded = (newComments: any[]) => {
    const newCommentCount = newComments.length
    setComments(newComments)
    setLocalEngagement(prev => ({ ...prev, comments: newCommentCount }))
  }

  const [expanded, setExpanded] = useState(false)

  const words = postContent?.trim().split(/\s+/) || []
  const isLong = words.length > 50
  const displayedText = expanded ? postContent : words.slice(0, 50).join(" ") + (isLong ? "..." : "")

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!commentText.trim() || !currentUserId || isLoading.comment) return

    setIsLoading(prev => ({ ...prev, comment: true }))
    
    const currentCommentCount = localEngagement.comments
    
    try {
      const newComment = {
        id: Date.now().toString(),
        content: commentText.trim(),
        created_at: new Date().toISOString(),
        user_id: currentUserId,
        username: session?.dbUser?.username || 'Unknown',
        avatar_url: currentUserAvatar
      }

      const updatedComments = [...comments, newComment]
      const newCommentCount = updatedComments.length
      setComments(updatedComments)
      setLocalEngagement(prev => ({ ...prev, comments: newCommentCount }))
      setCommentText('')
      setToast({ message: 'Comment added', type: 'success' })

      if (!showInlineComments) {
        setShowInlineComments(true)
      }

      if (addComment) {
        await addComment(postId, commentText.trim(), currentUserId)
      }

    } catch (error) {
      setComments(comments)
      setLocalEngagement(prev => ({ ...prev, comments: currentCommentCount }))
      setCommentText(commentText)
      setToast({ message: 'Failed to add comment', type: 'error' })
      console.error('Failed to add comment:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, comment: false }))
    }
  }

  const toggleInlineComments = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!showInlineComments && comments.length === 0 && isApiPost) {
      try {
        if (getPostComments) {
          const fetchedComments = await getPostComments(postId)
          setComments(fetchedComments || [])
        }
      } catch (error) {
        console.error('Failed to load comments:', error)
      }
    }
    
    setShowInlineComments(prev => !prev)
  }

  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  return (
    <>
      <div 
        className="shadow-custom bg-dark-700/70 rounded-3xl mt-6 p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-200" 
        onClick={handleView}
      >
        <div className="flex flex-col space-y-4">
          <div className='flex space-x-3'>
            {/* <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
              {postAvatar ? (
                <img src={postAvatar} alt={postAuthor} className="w-full h-full object-cover bg-gray-200"
                  onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${postAuthor}` }} />
              ) : (
                <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                  {postAuthor?.substring(0, 2)?.toUpperCase() || 'U'}
                </div>
              )}
            </div> */}

            <div className="flex flex-1 min-w-0 items-center justify-between">
<div className="flex flex-1 min-w-0 items-center justify-between">
  <div className="flex flex-col min-w-0">
    <UserProfileHover
      userId={isApiPost ? post.user_id.toString() : post.id.toString()}
      username={postAuthor}
      avatarUrl={postAvatar}
      position="bottom"
    >
      <div className="flex items-center space-x-2 group cursor-pointer">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
          {postAvatar ? (
            <img
              src={postAvatar}
              alt={postAuthor}
              className="w-full h-full object-cover bg-gray-200"
              onError={e => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${postAuthor}`
              }}
            />
          ) : (
            <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
              {postAuthor?.substring(0, 2)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Username */}
        <div className="flex items-center space-x-2">
     <div className="flex flex-col min-w-0">
           <span className="font-semibold text-white text-lg truncate hover:text-blue-500 transition-colors group-hover:underline">
            {postAuthor}
          </span>
              {/* Handle */}
    <span className="text-secondary text-sm">{postHandle}</span>
     </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ExternalLink className="w-4 h-4 text-blue-500" />
          </div>
        </div>
      </div>
    </UserProfileHover>


  </div>
</div>

              <div className="flex items-center space-x-3">
                {post._isNewlyCreated && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full animate-pulse">
                    NEW
                  </span>
                )}
                <span className="text-secondary text-sm">{postTime}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-secondary text-base leading-relaxed whitespace-pre-wrap break-words">
              {displayedText}
            </p>
            
            {isLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(prev => !prev)
                }}
                className="text-blue-500 hover:text-blue-400 hover:underline text-sm font-medium transition-colors"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}

            {postImage && (
<div className="overflow-hidden">
  {/\.(jpg|jpeg|png|gif|webp)$/i.test(postImage) ? (
    <div className="relative group inline-block">
      <img 
        src={postImage} 
        alt="Post content" 
        className="rounded-2xl max-h-96 w-auto object-cover cursor-pointer hover:opacity-95 transition-opacity duration-200"
        // onClick={handleImageClick}
      />
      {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-2xl flex items-center justify-center pointer-events-none">
        <div className="bg-black bg-opacity-70 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Eye className="w-6 h-6 text-white" />
        </div>
      </div> */}
    </div>
  ) : /\.(mp4|webm|ogg|mov)$/i.test(postImage) ? (
    <video 
      src={postImage} 
      autoPlay 
      muted 
      loop 
      playsInline
      controls
      className="w-full max-h-96 bg-black rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
  ) : /\.(mp3|wav|ogg|m4a)$/i.test(postImage) ? (
    <div className="bg-dark-800 p-4 flex items-center space-x-3 rounded-lg">
      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
        <Volume2 className="w-5 h-5 text-indigo-600" />
      </div>
      <audio src={postImage} controls className="flex-1" />
    </div>
  ) : (
    <div className="bg-dark-800 p-4 text-center rounded-lg">
      <p className="text-gray-400 text-sm mb-2">Media file</p>
      <a href={postImage} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
        View media
      </a>
    </div>
  )}
</div>

            )}
          </div>

          <div className="flex items-center justify-between py-4 ">
            <div className="flex items-center space-x-6">
              <button 
                onClick={e => { 
                  e.stopPropagation()
                  handleLike()
                }}
                disabled={isLoading.like || !currentUserId}
                className={`flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userEngagement.liked ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-5 h-5 transition-all duration-200 ${userEngagement.liked ? 'fill-red-500 scale-110' : ''}`} />
                <span className="text-sm font-medium">{localEngagement.likes} Likes</span>
              </button>

              <button 
                onClick={toggleInlineComments}
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{localEngagement.comments} Comments</span>
              </button>

              <button 
                onClick={e => { 
                  e.stopPropagation()
                  handleRetweet()
                }}
                disabled={isLoading.retweet || !currentUserId || userEngagement.retweeted}
                className={`flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userEngagement.retweeted ? 'text-green-500' : ''}`}
              >
                <Repeat2 className={`w-5 h-5 transition-all duration-200 ${userEngagement.retweeted ? 'fill-green-500 scale-110' : ''}`} />
                <span className="text-sm font-medium">{localEngagement.retweets} Share</span>
              </button>
            </div>

            <button 
              onClick={e => { 
                e.stopPropagation()
                handleBookmark()
              }}
              disabled={isLoading.bookmark || !currentUserId}
              className={`flex items-center space-x-2 text-gray-500 hover:text-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userEngagement.bookmarked ? 'text-purple-500' : ''}`}
            >
              <Bookmark className={`w-5 h-5 transition-all duration-200 ${userEngagement.bookmarked ? 'fill-purple-500 scale-110' : ''}`} />
              <span className="text-sm hidden md:block font-medium">{localEngagement.bookmarks} Saved</span>
            </button>
          </div>

          <AnimatePresence>
            {showInlineComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-4"
              >
                {comments.length > 0 && (
                  <div className="space-y-3">
                    {comments.slice(0, visibleCount).map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                          {comment.avatar_url ? (
                            <img
                              src={comment.avatar_url}
                              alt={comment.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                              {comment.username?.substring(0, 2)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-dark-700/70 rounded-2xl px-3 py-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-white">
                                {comment.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatCommentTime(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-secondary">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {visibleCount < comments.length && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setVisibleCount((prev) => prev + 8)
                        }}
                        className="text-sm text-blue-500 hover:underline pl-11"
                      >
                        Show more comments
                      </button>
                    )}
                  </div>
                )}

                {comments.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 pt-4 ">
            <div className="relative w-10 h-10 flex-shrink-0">
              {currentUserAvatar ? (
                <img src={currentUserAvatar} alt="Your avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                  {session?.dbUser?.username?.substring(0, 2)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Write your comment.."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isLoading.comment || !currentUserId}
                className="w-full py-3 px-4 bg-dark-800 rounded-full text-secondary placeholder:text-secondary placeholder-dark-800 focus:outline-none focus:ring-2 focus:bg-dark-800 transition-all disabled:opacity-50"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button 
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
                disabled={!currentUserId}
              >
                <Smile className="w-5 h-5" />
              </button>

              <button 
                type="submit"
                disabled={!commentText.trim() || isLoading.comment || !currentUserId}
                className="p-2 bg-primary text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => e.stopPropagation()}
              >
                {isLoading.comment ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Fixed Image Modal */}
      <AnimatePresence>
        {showImageModal && postImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4" 
            onClick={handleModalBackdropClick}
          >
            <div className="relative max-w-5xl max-h-full flex items-center justify-center">
              <button 
                onClick={handleModalClose}
                className="absolute -top-12 right-0 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 z-10 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              <motion.img 
                src={postImage} 
                alt="Post content" 
                className="max-w-full max-h-full object-contain rounded-lg cursor-pointer"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCommentSection && isApiPost && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <CommentSection
              post={post}
              onClose={() => setShowCommentSection(false)}
              onCommentAdded={handleCommentAdded}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showEngagement && isApiPost && (
        <EngagementDetails likes={post.likes} retweets={post.retweets} bookmarks={post.bookmarks} onClose={() => setShowEngagement(false)} />
      )}

      {toast && <Toast id="snap-toast" title="Notification" message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}