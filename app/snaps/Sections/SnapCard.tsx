/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'
import React, { useState, useEffect } from 'react'
import { MessageCircle, Repeat2, Heart, Bookmark, Eye, X, MoreHorizontal, Volume2, Paperclip, Smile, Send } from 'lucide-react'
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
    // Initialize local engagement counts
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

    // Initialize user engagement status
    const userLiked = isUserInLikes || liked || state.engagement?.likedPosts?.has(postId) || false
    const userRetweeted = isUserInRetweets || retweeted || state.engagement?.retweetedPosts?.has(postId) || false
    const userBookmarked = isUserInBookmarks || bookmarked || state.engagement?.bookmarkedPosts?.has(postId) || false

    setUserEngagement({
      liked: userLiked,
      retweeted: userRetweeted,
      bookmarked: userBookmarked
    })

    // Load existing comments if it's an API post
    if (isApiPost && post.comments) {
      setComments(post.comments)
    }

    // Debug logging
    console.log('Post engagement initialized:', {
      postId,
      likes: initialLikes,
      userLiked,
      globalLikedPosts: state.engagement?.likedPosts,
      isUserInLikes,
      liked
    })
  }, [isUserInLikes, isUserInRetweets, isUserInBookmarks, liked, retweeted, bookmarked, postId, state.engagement, post])

  const handleAction = async (
    type: 'like' | 'retweet' | 'bookmark',
    apiCall: () => Promise<any>,
    undoCall: () => Promise<any>,
    counterKey: keyof typeof localEngagement,
    engagementKey: keyof typeof userEngagement,
    toastMsg: { do: string, undo: string },
    onAction?: (id: number | string) => void
  ) => {
    if (!currentUserId || isLoading[type]) return
    
    setIsLoading(prev => ({ ...prev, [type]: true }))
    
    // Store current state for rollback
    const currentEngagementState = userEngagement[engagementKey]
    const currentCount = localEngagement[counterKey]
    
    try {
      let apiResult
      
      if (currentEngagementState) {
        // User is un-doing the action
        console.log(`Attempting to un${type} post ${postId}`)
        
        // Update UI immediately (optimistic update)
        setLocalEngagement(prev => ({ ...prev, [counterKey]: Math.max(0, prev[counterKey] - 1) }))
        setUserEngagement(prev => ({ ...prev, [engagementKey]: false }))
        setToast({ message: toastMsg.undo, type: `un${type}` })
        
        // Make API call
        apiResult = await undoCall()
        console.log(`Un${type} API result:`, apiResult)
        
      } else {
        // User is performing the action
        console.log(`Attempting to ${type} post ${postId}`)
        
        // Update UI immediately (optimistic update)
        setLocalEngagement(prev => ({ ...prev, [counterKey]: prev[counterKey] + 1 }))
        setUserEngagement(prev => ({ ...prev, [engagementKey]: true }))
        setToast({ message: toastMsg.do, type: type })
        
        // Make API call
        apiResult = await apiCall()
        console.log(`${type} API result:`, apiResult)
      }
      
      // Update global state if API was successful
      if (apiResult && state.engagement) {
        if (currentEngagementState) {
          // Remove from global state
          state.engagement[`${type}dPosts`]?.delete(postId)
        } else {
          // Add to global state
          state.engagement[`${type}dPosts`]?.add(postId)
        }
      }
      
      // Call the parent handler if provided
      onAction?.(isApiPost ? postId : parseInt(postId))
      
    } catch (error) {
      // Rollback UI changes on error
      console.error(`Failed to ${type} post:`, error)
      setLocalEngagement(prev => ({ ...prev, [counterKey]: currentCount }))
      setUserEngagement(prev => ({ ...prev, [engagementKey]: currentEngagementState }))
      setToast({ message: `Failed to ${type} post. Please try again.`, type: 'error' })
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleView = () => currentUserId && viewPost(postId, currentUserId).catch(() => {})

  const handleCommentAdded = (newComments: any[]) => {
    setComments(newComments)
    setLocalEngagement(prev => ({ ...prev, comments: newComments.length }))
  }

  const [expanded, setExpanded] = useState(false)

  const words = postContent?.trim().split(/\s+/) || []
  const isLong = words.length > 50
  const displayedText = expanded ? postContent : words.slice(0, 50).join(" ") + (isLong ? "..." : "")

  // Handle inline comment submission
  const handleCommentSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!commentText.trim() || !currentUserId || isLoading.comment) return

    setIsLoading(prev => ({ ...prev, comment: true }))
    
    // Store current comment count for rollback
    const currentCommentCount = localEngagement.comments
    
    try {
      // Create new comment object for optimistic update
      const newComment = {
        id: Date.now().toString(), // Temporary ID
        content: commentText.trim(),
        created_at: new Date().toISOString(),
        user_id: currentUserId,
        username: session?.dbUser?.username || 'Unknown',
        avatar_url: currentUserAvatar
      }

      // Update UI immediately (optimistic update)
      const updatedComments = [...comments, newComment]
      setComments(updatedComments)
      setLocalEngagement(prev => ({ ...prev, comments: prev.comments + 1 }))
      setCommentText('')
      setToast({ message: 'Comment added', type: 'success' })

      // Show inline comments if they weren't visible
      if (!showInlineComments) {
        setShowInlineComments(true)
      }

      // Add comment via API if available
      if (addComment) {
        await addComment(postId, commentText.trim(), currentUserId)
      }

    } catch (error) {
      // Rollback on error
      setComments(comments) // Reset to original comments
      setLocalEngagement(prev => ({ ...prev, comments: currentCommentCount }))
      setCommentText(commentText) // Restore comment text
      setToast({ message: 'Failed to add comment', type: 'error' })
      console.error('Failed to add comment:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, comment: false }))
    }
  }

  // Handle showing/hiding inline comments
  const toggleInlineComments = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!showInlineComments && comments.length === 0 && isApiPost) {
      // Load comments from API if not loaded yet
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

  // Format comment time
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
        style={{
          boxShadow:
            "0px 1px 0.5px 0px rgba(255, 255, 255, 0.5) inset, 0px 1px 2px 0px rgba(26, 26, 26, 0.7), 0px 0px 0px 1px #1a1a1a",
        }}
        className="bg-dark-700/70 rounded-3xl mt-6 p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-200" 
        onClick={handleView}
      >
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className='flex space-x-3'>
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
              {postAvatar ? (
                <img src={postAvatar} alt={postAuthor} className="w-full h-full object-cover bg-gray-200"
                  onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${postAuthor}` }} />
              ) : (
                <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                  {postAuthor?.substring(0, 2)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            <div className="flex flex-1 min-w-0 items-center justify-between">
              <div className="flex flex-col min-w-0">
                <UserProfileHover 
                  userId={isApiPost ? post.user_id.toString() : post.id.toString()} 
                  username={postAuthor}
                  avatarUrl={postAvatar}
                  position="bottom"
                >
                  <span className="font-semibold text-white text-lg truncate cursor-pointer hover:text-blue-500 transition-colors">
                    {postAuthor}
                  </span>
                </UserProfileHover>
                <span className="text-secondary text-sm">{postAuthor}</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-secondary text-sm">{postTime}</span>
                <button className="text-secondary hover:text-gray-600 p-1" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <p className="text-secondary text-base leading-relaxed whitespace-pre-wrap">
              {displayedText}
            </p>
            
            {isLong && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(prev => !prev)
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                {expanded ? "View Less" : "View More"}
              </button>
            )}

            {postImage && (
              <div className="rounded-2xl overflow-hidden">
                {/\.(jpg|jpeg|png|gif|webp)$/i.test(postImage) ? (
                  <img src={postImage} alt="Post content" className="w-full max-h-80 object-cover cursor-pointer hover:opacity-95"
                    onClick={e => { e.stopPropagation(); setShowImageModal(true) }} />
                ) : /\.(mp4|webm|ogg|mov)$/i.test(postImage) ? (
                  <video 
                    src={postImage} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    controls
                    className="w-full max-h-80 bg-black"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : /\.(mp3|wav|ogg|m4a)$/i.test(postImage) ? (
                  <div className="bg-gray-50 p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <audio src={postImage} controls className="flex-1" />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 text-center rounded-2xl">
                    <p className="text-gray-600 text-sm mb-2">Media file</p>
                    <a href={postImage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                      View media
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center justify-between py-4 ">
            <div className="flex items-center space-x-6">
              <button 
                onClick={e => { 
                  e.stopPropagation()
                  console.log('Like button clicked:', { 
                    postId, 
                    currentUserId, 
                    userEngagement,
                    localEngagement,
                    isLoading: isLoading.like 
                  })
                  handleAction(
                    'like', 
                    () => {
                      console.log('Calling likePost API')
                      return likePost(postId, currentUserId!)
                    }, 
                    () => {
                      console.log('Calling unlikePost API')
                      return unlikePost(postId, currentUserId!)
                    }, 
                    'likes', 
                    'liked', 
                    { do: 'Post liked', undo: 'Post unliked' }, 
                    onLike
                  ) 
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
                  e.stopPropagation(); 
                  handleAction('retweet', () => retweetPost(postId, currentUserId!), async () => {}, 'retweets', 'retweeted', { do: 'Post retweeted', undo: '' }, onRetweet) 
                }}
                disabled={isLoading.retweet || userEngagement.retweeted || !currentUserId}
                className={`flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userEngagement.retweeted ? 'text-green-500' : ''}`}
              >
                <Repeat2 className={`w-5 h-5 transition-all duration-200 ${userEngagement.retweeted ? 'fill-green-500 scale-110' : ''}`} />
                <span className="text-sm font-medium">{localEngagement.retweets} Share</span>
              </button>
            </div>

            <button 
              onClick={e => { 
                e.stopPropagation(); 
                handleAction('bookmark', () => bookmarkPost(postId, currentUserId!), () => unbookmarkPost(postId, currentUserId!), 'bookmarks', 'bookmarked', { do: 'Post bookmarked', undo: 'Bookmark removed' }, onBookmark) 
              }}
              disabled={isLoading.bookmark || !currentUserId}
              className={`flex items-center space-x-2 text-gray-500 hover:text-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userEngagement.bookmarked ? 'text-purple-500' : ''}`}
            >
              <Bookmark className={`w-5 h-5 transition-all duration-200 ${userEngagement.bookmarked ? 'fill-purple-500 scale-110' : ''}`} />
              <span className="text-sm hidden md:block font-medium">{localEngagement.bookmarks} Saved</span>
            </button>
          </div>

          {/* Inline Comments Section */}
          <AnimatePresence>
            {showInlineComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pt-4"
              >
                {/* Comments List */}
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
                          <div className="bg-gray-50 rounded-2xl px-3 py-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-semibold text-sm text-gray-900">
                                {comment.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatCommentTime(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Show More Button */}
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

          {/* Comment Input */}
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

      {/* Image Modal */}
      {showImageModal && postImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-5xl max-h-full">
            <button onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2">
              <X className="w-6 h-6" />
            </button>
            <img src={postImage} alt="Post content" className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        </div>
      )}

      {/* Full Comment Section Modal */}
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

      {/* Engagement Details */}
      {showEngagement && isApiPost && (
        <EngagementDetails likes={post.likes} retweets={post.retweets} bookmarks={post.bookmarks} onClose={() => setShowEngagement(false)} />
      )}

      {/* Toast */}
      {toast && <Toast id="snap-toast" title="Notification" message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}