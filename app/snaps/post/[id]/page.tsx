"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, MessageSquare, Share2, TrendingUp, Send, MoreVertical, Bookmark, X, Triangle, Repeat, HandMetal, Eye, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useApi } from '@/app/Context/ApiProvider'
// import { useApi } from "@/app/Context/ApiProvider"
import { useSession } from 'next-auth/react'
import { Post, ApiPost } from '@/app/types'
import ReputationBadge from '@/app/components/ReputationBadge'
import { usePostTokenPrice } from '@/app/hooks/useGlobalPrice'
import { renderTextWithMentions } from '@/app/lib/mentionUtils'
import Toast from '@/app/components/Toast'
import PostTokenTrading from '@/app/components/PostTokenTrading'
import { UserProfileHover } from '@/app/components/UserProfileHover'

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [activeTab, setActiveTab] = useState("comments")
  const [comment, setComment] = useState("")
  const [post, setPost] = useState<ApiPost | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [isLoading, setIsLoading] = useState({ like: false, retweet: false, bookmark: false, comment: false })
  const [toast, setToast] = useState<{ message: string; type: any } | null>(null)
  const [showTokenTrading, setShowTokenTrading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const [profile, setProfile] = useState<any | null>(null)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  const {
    likePost,
    unlikePost,
    retweetPost,
    bookmarkPost,
    unbookmarkPost,
    addComment,
    getPostComments,
    getPostDetails,
    getUserProfile,
    state
  } = useApi()

  const { data: session } = useSession()
  const currentUserId = session?.dbUser?.id
  const currentUserAvatar = session?.dbUser?.avatar_url

  // Add custom scrollbar styles once
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('custom-scrollbar-styles')) {
      const style = document.createElement('style')
      style.id = 'custom-scrollbar-styles'
      style.textContent = `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #6E54FF;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5940cc;
        }
      `
      document.head.appendChild(style)
    }
  }, [])
  
  const [userEngagement, setUserEngagement] = useState({
    liked: false,
    retweeted: false,
    bookmarked: false
  })
  
  const [localEngagement, setLocalEngagement] = useState({
    likes: 0,
    comments: 0,
    retweets: 0,
    bookmarks: 0,
    views: 0
  })

  const tabs = [
    { key: "comments", label: "Comments", count: localEngagement.comments },
    { key: "holders", label: "Holders", count: 0 },
    { key: "activity", label: "Activity", count: 0 },
    { key: "details", label: "Details", count: 0 }
  ]

  const { price: postTokenPrice, loading: priceLoading } = usePostTokenPrice(postId)

  // Fetch post data
  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const fetchPost = async () => {
      console.log('🔍 Starting to fetch post:', postId)

      if (!postId) {
        console.log('❌ Missing postId')
        return
      }

      // First, try to get the post from the existing state
      const existingPost = state.posts.posts.find(p => p.id === postId)
      if (existingPost) {
        console.log('✅ Found post in state:', existingPost)
        setPost(existingPost)

        // Initialize engagement counts
        setLocalEngagement({
          likes: existingPost.like_count || 0,
          comments: existingPost.comment_count || 0,
          retweets: existingPost.retweet_count || 0,
          bookmarks: existingPost.bookmarks?.length || 0,
          views: existingPost.view_count || 0
        })

        // Initialize user engagement state
        const isUserInLikes = existingPost.likes?.some(u => u.user_id === currentUserId)
        const isUserInRetweets = existingPost.retweets?.some(u => u.user_id === currentUserId)
        const isUserInBookmarks = existingPost.bookmarks?.some(u => u.user_id === currentUserId)

        setUserEngagement({
          liked: isUserInLikes || false,
          retweeted: isUserInRetweets || false,
          bookmarked: isUserInBookmarks || false
        })

        // Set comments
        if (existingPost.comments) {
          setComments(existingPost.comments)
        }
        return
      }

      // If not in state, fetch from API
      if (!getPostDetails) {
        console.log('❌ Missing getPostDetails')
        setLoadingError('Unable to load post details')
        return
      }

      try {
        console.log('📡 Calling getPostDetails API...')
        const postData = await getPostDetails(postId)
        console.log('✅ Post data received:', postData)

        if (!isMounted) return

        setPost(postData)

        // Initialize engagement counts
        setLocalEngagement({
          likes: postData.like_count || 0,
          comments: postData.comment_count || 0,
          retweets: postData.retweet_count || 0,
          bookmarks: postData.bookmarks?.length || 0,
          views: postData.view_count || 0
        })

        // Initialize user engagement state
        const isUserInLikes = postData.likes?.some(u => u.user_id === currentUserId)
        const isUserInRetweets = postData.retweets?.some(u => u.user_id === currentUserId)
        const isUserInBookmarks = postData.bookmarks?.some(u => u.user_id === currentUserId)

        setUserEngagement({
          liked: isUserInLikes || false,
          retweeted: isUserInRetweets || false,
          bookmarked: isUserInBookmarks || false
        })

        // Set comments
        if (postData.comments) {
          setComments(postData.comments)
        }
      } catch (error) {
        console.error('❌ Failed to fetch post:', error)
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load post'
          setLoadingError(errorMessage)
          setToast({ message: errorMessage, type: 'error' })
        }
      }
    }

    fetchPost()

    return () => {
      isMounted = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.dbUser?.id && getUserProfile) {
        try {
          const profileData = await getUserProfile(session.dbUser.id)
          setProfile(profileData.profile)
        } catch (error) {
          console.error('Failed to fetch profile:', error)
        }
      }
    }

    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.dbUser?.id])

  // Fetch comments for active tab (only once when needed)
  useEffect(() => {
    const fetchComments = async () => {
      if (activeTab === "comments" && comments.length === 0 && getPostComments && postId) {
        try {
          const fetchedComments = await getPostComments(postId)
          setComments(fetchedComments || [])
        } catch (error) {
          console.error('Failed to load comments:', error)
        }
      }
    }

    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  if (loadingError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 max-w-md text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
            <X size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Failed to Load Post</h2>
          <p className="text-gray-400 text-sm">{loadingError}</p>
          <div className="flex gap-3 mt-4">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setLoadingError(null)
                setPost(null)
                window.location.reload()
              }}
              className="px-6 py-3 bg-white text-black rounded-xl font-bold border-2 border-white hover:bg-transparent hover:text-white transition-all shadow-lg"
            >
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.back()}
              className="px-6 py-3 bg-transparent border-2 border-gray-700 text-gray-300 rounded-xl font-bold hover:border-white hover:text-white transition-all"
            >
              Go Back
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-[#6E54FF] border-t-transparent rounded-full"
          />
          <p className="text-gray-400 text-sm font-medium">Loading post...</p>
        </div>
      </div>
    )
  }

  const postContent = post.content
  const postImage = post.media_url
  const postAuthor = post.username || 'Unknown'
  const postHandle = `@${post.username || 'unknown'}`
  const authorReputation = post.author_reputation
  const authorReputationTier = post.author_reputation_tier
  
  const postAvatar = post.avatar_url

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'now'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}d ago`
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths}mo ago`
    const diffInYears = Math.floor(diffInMonths / 12)
    return `${diffInYears}y ago`
  }

  const postTime = getRelativeTime(post.created_at)
  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
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
      } else {
        const newCount = currentCount + 1
        setLocalEngagement(prev => ({ ...prev, likes: newCount }))
        setUserEngagement(prev => ({ ...prev, liked: true }))
        await likePost(postId, currentUserId)
      }
    } catch (error) {
      console.error('Failed to handle like:', error)
      setToast({ message: 'Failed to update like', type: 'error' })
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
      await retweetPost(postId, currentUserId)
    } catch (error) {
      console.error('Failed to retweet:', error)
      setToast({ message: 'Failed to retweet', type: 'error' })
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
        await unbookmarkPost(postId, currentUserId)
      } else {
        const newCount = currentCount + 1
        setLocalEngagement(prev => ({ ...prev, bookmarks: newCount }))
        setUserEngagement(prev => ({ ...prev, bookmarked: true }))
        await bookmarkPost(postId, currentUserId)
      }
    } catch (error) {
      console.error('Failed to handle bookmark:', error)
      setToast({ message: 'Failed to update bookmark', type: 'error' })
    } finally {
      setIsLoading(prev => ({ ...prev, bookmark: false }))
    }
  }

  const handleCommentSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!comment.trim() || !currentUserId || isLoading.comment) return

    setIsLoading(prev => ({ ...prev, comment: true }))
    
    try {
      const newComment = {
        id: Date.now().toString(),
        content: comment.trim(),
        created_at: new Date().toISOString(),
        user_id: currentUserId,
        username: session?.dbUser?.username || 'Unknown',
        avatar_url: currentUserAvatar
      }

      const updatedComments = [newComment, ...comments]
      setComments(updatedComments)
      setLocalEngagement(prev => ({ ...prev, comments: prev.comments + 1 }))
      setComment('')
      setToast({ message: 'Comment added', type: 'success' })

      if (addComment) {
        await addComment(postId, comment.trim(), currentUserId)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
      setToast({ message: 'Failed to add comment', type: 'error' })
    } finally {
      setIsLoading(prev => ({ ...prev, comment: false }))
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowImageModal(true)
  }

  const handleModalClose = () => {
    setShowImageModal(false)
  }

  const words = postContent?.trim().split(/\s+/) || []
  const isLong = words.length > 50
  const displayedText = expanded ? postContent : words.slice(0, 50).join(" ") + (isLong ? "..." : "")

  return (
    <>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 relative z-10">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ x: -4 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-transparent border-2 border-gray-700 group-hover:border-white flex items-center justify-center transition-all">
              <ArrowLeft size={18} strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold">Back</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Side - Image or Text-only Post */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative"
            >
              {postImage ? (
                <div className="aspect-square rounded-2xl overflow-hidden bg-black border-2 border-gray-700/70 shadow-2xl hover:border-gray-600/70 transition-all duration-300">
                  {/\.(jpg|jpeg|png|gif|webp)$/i.test(postImage) ? (
                    <img
                      src={postImage}
                      alt="Post content"
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={handleImageClick}
                    />
                  ) : /\.(mp4|webm|ogg|mov)$/i.test(postImage) ? (
                    <video
                      src={postImage}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : /\.(mp3|wav|ogg|m4a)$/i.test(postImage) ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center p-8">
                      <audio src={postImage} controls className="w-full" />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 shadow-2xl flex items-center justify-center p-8 text-center">
                  <p className="text-white text-xl leading-relaxed whitespace-pre-wrap">
                    {renderTextWithMentions(
                      displayedText,
                      undefined,
                      (userId, username) => {
                        router.push(`/snaps/profile/${userId}`)
                      }
                    )}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Right Side - Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col"
            >
              {/* Author Info */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700/70">
                <div className="flex items-center gap-3">
                  <UserProfileHover
                    userId={post.user_id.toString()}
                    username={postAuthor}
                    avatarUrl={postAvatar}
                    position="bottom"
                  >
                    <div className="relative cursor-pointer group">
                      {postAvatar ? (
                        <img
                          src={postAvatar}
                          alt={postAuthor}
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-700/70 group-hover:border-[#6E54FF]/50 transition-all duration-300"
                          onError={e => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${postAuthor}`
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold text-white border-2 border-gray-700/70 group-hover:border-[#6E54FF]/50 transition-all duration-300">
                          {postAuthor?.substring(0, 2)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-black"
                        style={{ backgroundColor: "#10B981" }}
                      />
                    </div>
                  </UserProfileHover>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg hover:text-[#6E54FF] transition-colors cursor-pointer">{postAuthor}</h2>
                      {authorReputation !== undefined && (
                        <ReputationBadge
                          score={authorReputation}
                          tier={authorReputationTier}
                          size="sm"
                          showScore={false}
                        />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{postHandle} • {postTime}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-transparent border-2 border-gray-700 hover:border-white flex items-center justify-center transition-all group"
                >
                  <MoreVertical size={18} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={2.5} />
                </motion.button>
              </div>

              {/* Content - Only show here if there's media (otherwise it's on the left) */}
              {postContent && postImage && (
                <div className="mb-6">
                  <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {renderTextWithMentions(
                      displayedText,
                      undefined, // No mentions available from getPostDetails
                      (userId, username) => {
                        router.push(`/snaps/profile/${userId}`)
                      }
                    )}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setExpanded(prev => !prev)}
                      className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                    >
                      {expanded ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-black rounded-xl p-4 border-2 border-gray-700/70 hover:border-gray-600/70 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HandMetal size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">Likes</span>
                  </div>
                  <p className="text-lg font-bold text-white">{localEngagement.likes}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-black rounded-xl p-4 border-2 border-gray-700/70 hover:border-gray-600/70 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">Comments</span>
                  </div>
                  <p className="text-lg font-bold text-white">{localEngagement.comments}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-black rounded-xl p-4 border-2 border-gray-700/70 hover:border-gray-600/70 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Repeat size={16} className="text-gray-400 rotate-90" />
                    <span className="text-xs text-gray-500 font-medium">Shares</span>
                  </div>
                  <p className="text-lg font-bold text-white">{localEngagement.retweets}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-black rounded-xl p-4 border-2 border-gray-700/70 hover:border-gray-600/70 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={16} className="text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">Views</span>
                  </div>
                  <p className="text-lg font-bold text-white">{localEngagement.views}</p>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mb-6">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLike}
                  disabled={isLoading.like || !currentUserId}
                  className={`flex-1 py-2 rounded-xl font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    userEngagement.liked
                      ? "bg-white text-black border-2 border-white shadow-lg"
                      : "bg-transparent border-2 border-gray-700 text-gray-300 hover:border-white hover:bg-white hover:text-black"
                  }`}
                >
                  <HandMetal size={16} className={userEngagement.liked ? "fill-current" : ""} strokeWidth={2.5} />
                  <span className="font-semibold">{userEngagement.liked ? "Liked" : "Like"}</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBookmark}
                  disabled={isLoading.bookmark || !currentUserId}
                  className={`flex-1 py-2 rounded-xl font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    userEngagement.bookmarked
                      ? "bg-white text-black border-2 border-white shadow-lg"
                      : "bg-transparent border-2 border-gray-700 text-gray-300 hover:border-white hover:bg-white hover:text-black"
                  }`}
                >
                  <Bookmark size={16} className={userEngagement.bookmarked ? "fill-current" : ""} strokeWidth={2.5} />
                  <span className="font-semibold">{userEngagement.bookmarked ? "Saved" : "Save"}</span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetweet}
                  disabled={isLoading.retweet || !currentUserId || userEngagement.retweeted}
                  className={`flex-1 py-2 rounded-xl font-medium text-xs transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    userEngagement.retweeted
                      ? "bg-white text-black border-2 border-white shadow-lg"
                      : "bg-transparent border-2 border-gray-700 text-gray-300 hover:border-white hover:bg-white hover:text-black"
                  }`}
                >
                  <Repeat size={16} className="rotate-90" strokeWidth={2.5} />
                  <span className="font-semibold">{userEngagement.retweeted ? "Shared" : "Share"}</span>
                </motion.button>
              </div>

              {/* Buy/Trade Button */}
              <div className="mb-6">
                <motion.button
                  whileHover={{ y: -2, boxShadow: "0 10px 30px -10px rgba(110, 84, 255, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTokenTrading(true)}
                  className="w-full px-4 py-2.5 bg-[#6E54FF] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group border-2 border-[#6E54FF] shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  <Triangle size={16} className="relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10 text-sm">Trade Token • ${priceLoading ? '...' : postTokenPrice.toFixed(2)}</span>
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="bg-gray-700/50 rounded-full mb-6 p-0.5">
                <div className="flex justify-around bg-black m-0.5 p-1 items-center rounded-full relative">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`p-2 my-1 font-semibold w-full relative z-10 text-xs sm:text-sm ${
                        activeTab === tab.key ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="ml-1 text-xs">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}

                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      height: "40px",
                      boxShadow:
                        "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
                      backgroundColor: "#6E54FF",
                      margin: "6px",
                    }}
                    initial={false}
                    animate={{
                      left:
                        activeTab === "comments"
                          ? "0%"
                          : activeTab === "holders"
                          ? "calc(25% + 0px)"
                          : activeTab === "activity"
                          ? "calc(50% + 0px)"
                          : "calc(75% + 0px)",
                      width: "calc(25% - 6px)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "comments" && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 border-gray-700/70">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Your avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs font-semibold text-white">
                            {session?.dbUser?.username?.substring(0, 2)?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex items-center bg-black rounded-full px-1 py-0.5 border-2 border-gray-700/70 focus-within:border-gray-600/70 transition-all">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          disabled={isLoading.comment || !currentUserId}
                          className="flex-1 px-4 py-2 bg-transparent text-sm text-white rounded-full focus:outline-none transition-all duration-200 placeholder:text-gray-500 disabled:opacity-50"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: -10 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          disabled={!comment.trim() || isLoading.comment || !currentUserId}
                          className="p-2 bg-[#6E54FF] hover:bg-[#5940cc] rounded-full transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed mr-1 flex-shrink-0 shadow-lg"
                        >
                          {isLoading.comment ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 text-white" strokeWidth={2.5} />
                          )}
                        </motion.button>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {comments.length > 0 ? (
                        comments.slice(0, visibleCount).map((comment, index) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-black border-2 border-gray-700/70 rounded-xl hover:border-gray-600/70 transition-all duration-300 group"
                          >
                            <div className="flex gap-3">
                              <img
                                src={comment.avatar_url || `https://ui-avatars.com/api/?name=${comment.username}`}
                                alt={comment.username}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-700/70 transition-all"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-white">{comment.username}</span>
                                  <span className="text-gray-600 text-xs">•</span>
                                  <span className="text-gray-500 text-xs">{formatCommentTime(comment.created_at)}</span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{comment.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-12 bg-black border-2 border-gray-700/70 rounded-xl"
                        >
                          <MessageSquare size={48} className="mx-auto mb-4 text-gray-600" />
                          <p className="text-gray-400 text-sm font-medium">No comments yet.</p>
                          <p className="text-gray-500 text-xs mt-1">Be the first to share your thoughts!</p>
                        </motion.div>
                      )}

                      {visibleCount < comments.length && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setVisibleCount(prev => prev + 5)}
                          className="w-full text-sm text-gray-300 hover:text-white transition-colors font-medium py-2 px-4 bg-black border-2 border-gray-700/70 hover:border-gray-600/70 rounded-xl"
                        >
                          View more comments ({comments.length - visibleCount} remaining)
                        </motion.button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "holders" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="text-center py-8 mb-4 bg-black border-2 border-gray-700/70 rounded-xl">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-800 border-2 border-gray-700"
                      >
                        <TrendingUp size={28} className="text-gray-400" />
                      </motion.div>
                      <h3 className="text-3xl font-bold mb-2 text-white">156</h3>
                      <p className="text-gray-400 text-sm font-medium">Total Token Holders</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { username: "whale_investor", amount: "1,234.56", percentage: "15.2%" },
                        { username: "crypto_enthusiast", amount: "892.34", percentage: "11.8%" },
                        { username: "defi_master", amount: "567.89", percentage: "8.5%" },
                        { username: "token_holder", amount: "345.12", percentage: "5.2%" },
                      ].map((holder, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex justify-between items-center py-3 px-4 bg-black border-2 border-gray-700/70 rounded-xl hover:border-gray-600/70 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-400 font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="text-white font-medium text-sm group-hover:text-gray-300 transition-colors">@{holder.username}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold text-sm">{holder.amount}</p>
                            <p className="text-gray-500 text-xs">{holder.percentage}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "activity" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="text-center py-6 mb-4 bg-black border-2 border-gray-700/70 rounded-xl">
                      <motion.div
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700"
                      >
                        <TrendingUp size={24} className="text-gray-400" />
                      </motion.div>
                      <p className="text-gray-400 text-sm font-medium">Recent Trading Activity</p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { type: "buy", user: "whale_investor", amount: "$234.56", time: "5m ago" },
                        { type: "sell", user: "trader_pro", amount: "$89.23", time: "12m ago" },
                        { type: "buy", user: "defi_master", amount: "$445.67", time: "25m ago" },
                        { type: "buy", user: "crypto_fan", amount: "$123.45", time: "1h ago" },
                      ].map((activity, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="flex justify-between items-center py-3 px-4 bg-black border-2 border-gray-700/70 rounded-xl hover:border-gray-600/70 transition-all duration-300 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ rotate: activity.type === 'buy' ? 0 : 180 }}
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                activity.type === 'buy' ? 'bg-gray-800 border-2 border-gray-700' : 'bg-gray-800 border-2 border-gray-700'
                              }`}
                            >
                              <Triangle size={16} className={activity.type === 'buy' ? 'text-gray-400' : 'text-gray-400 rotate-180'} />
                            </motion.div>
                            <div>
                              <p className="text-white font-medium text-sm group-hover:text-gray-300 transition-colors">@{activity.user}</p>
                              <p className="text-gray-500 text-xs">{activity.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-white">
                              {activity.type === 'buy' ? '+' : '-'}{activity.amount}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "details" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    {[
                      { label: "Posted", value: postTime },
                      { label: "Total Engagement", value: localEngagement.likes + localEngagement.comments + localEngagement.retweets },
                      { label: "Likes", value: localEngagement.likes },
                      { label: "Comments", value: localEngagement.comments },
                      { label: "Shares", value: localEngagement.retweets },
                      { label: "Views", value: localEngagement.views },
                      { label: "Bookmarks", value: localEngagement.bookmarks },
                      { label: "Token Price", value: `$${postTokenPrice.toFixed(2)}` },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                        className="flex justify-between items-center py-4 px-4 bg-black border-2 border-gray-700/70 rounded-xl hover:border-gray-600/70 transition-all duration-300 group"
                      >
                        <span className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors">{item.label}</span>
                        <span className="text-white font-bold text-base">{item.value}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && postImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[9999] p-4" 
            onClick={handleModalClose}
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
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Token Trading Modal */}
      {showTokenTrading && (
        <PostTokenTrading
          postId={postId}
          postContent={postContent}
          isOpen={showTokenTrading}
          onClose={() => setShowTokenTrading(false)}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast 
          id="post-detail-toast" 
          title="Notification" 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  )
}