"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Heart, MessageSquare, Share2, TrendingUp, Send, MoreVertical, Bookmark, X, Triangle, Repeat, HandMetal, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from 'next-auth/react'

const tabs = [
  { key: "comments", label: "Comments" },
  { key: "holders", label: "Holders" },
  { key: "activity", label: "Activity" },
  { key: "details", label: "Details" }
]

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  
  const [activeTab, setActiveTab] = useState("comments")
  const [comment, setComment] = useState("")
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [showImageModal, setShowImageModal] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { data: session } = useSession()
  const currentUserId = session?.dbUser?.id || 999
  const currentUserAvatar = session?.dbUser?.avatar_url || "https://ui-avatars.com/api/?name=User&background=8B5CF6&color=fff"
  
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

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      setError(null)

      try {
        if (!postId) {
          throw new Error("Post ID not provided")
        }

        const response = await fetch(`http://localhost:3001/api/snaps/post/${postId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch post: ${response.status}`)
        }

        const result = await response.json()
        const postData = result.data

        if (!postData) {
          throw new Error("No post data returned")
        }

        setPost(postData)
        setComments(postData.comments || [])
        setLocalEngagement({
          likes: postData.like_count || 0,
          comments: postData.comment_count || 0,
          retweets: postData.retweet_count || 0,
          bookmarks: postData.bookmarks?.length || 0,
          views: postData.view_count || 0
        })
      } catch (err: any) {
        console.error("Error fetching post:", err)
        setError(err.message || "Failed to load post")
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  const postTokenPrice = 1.25

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
  
  const formatCommentTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'now'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  const handleLike = () => {
    if (userEngagement.liked) {
      setLocalEngagement(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }))
      setUserEngagement(prev => ({ ...prev, liked: false }))
    } else {
      setLocalEngagement(prev => ({ ...prev, likes: prev.likes + 1 }))
      setUserEngagement(prev => ({ ...prev, liked: true }))
    }
  }

  const handleRetweet = () => {
    if (!userEngagement.retweeted) {
      setLocalEngagement(prev => ({ ...prev, retweets: prev.retweets + 1 }))
      setUserEngagement(prev => ({ ...prev, retweeted: true }))
    }
  }

  const handleBookmark = () => {
    if (userEngagement.bookmarked) {
      setLocalEngagement(prev => ({ ...prev, bookmarks: Math.max(0, prev.bookmarks - 1) }))
      setUserEngagement(prev => ({ ...prev, bookmarked: false }))
    } else {
      setLocalEngagement(prev => ({ ...prev, bookmarks: prev.bookmarks + 1 }))
      setUserEngagement(prev => ({ ...prev, bookmarked: true }))
    }
  }

  const handleCommentSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!comment.trim()) return

    const newComment = {
      id: `c${Date.now()}`,
      content: comment.trim(),
      created_at: new Date().toISOString(),
      user_id: currentUserId,
      username: session?.dbUser?.username || 'current_user',
      avatar_url: currentUserAvatar
    }

    setComments([newComment, ...comments])
    setLocalEngagement(prev => ({ ...prev, comments: prev.comments + 1 }))
    setComment('')
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowImageModal(true)
  }

  const handleModalClose = () => {
    setShowImageModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Error Loading Post</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Post not found</p>
        </div>
      </div>
    )
  }

  const postContent = post.content
  const postImage = post.media_url
  const postAuthor = post.author_username || post.username
  const postHandle = `@${postAuthor}`
  const postAvatar = post.author_avatar || post.avatar_url || `https://ui-avatars.com/api/?name=${postAuthor}&background=6E54FF&color=fff`
  const postTime = getRelativeTime(post.created_at)

  const words = postContent?.trim().split(/\s+/) || []
  const isLong = words.length > 50
  const displayedText = expanded ? postContent : words.slice(0, 50).join(" ") + (isLong ? "..." : "")

  const hasImage = postImage && postImage.trim() !== ""

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-gray-800/50 group-hover:bg-gray-700/50 flex items-center justify-center transition-colors">
              <ArrowLeft size={16} />
            </div>
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          <div className={`grid grid-cols-2 ${hasImage ? 'lg:grid-cols-2' : 'lg:grid-cols-1 max-w-3xl mx-auto'} gap-6 lg:gap-8`}>
            {/* Left Side - Image or Content */}
            {hasImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="relative"
              >
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900 border-2 border-gray-800/50 shadow-2xl">
                  <img
                    src={postImage}
                    alt="Post content"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={handleImageClick}
                  />
                </div>
              </motion.div>
            ) : (
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="relative"
              >
                <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-2 border-gray-800/50 shadow-2xl p-8 min-h-[300px] flex items-center justify-center">
                  <p className="text-gray-300 text-xl leading-relaxed whitespace-pre-wrap text-center">
                    {postContent}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Right Side - Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col"
            >
              {/* Author Info */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="relative cursor-pointer">
                    <img
                      src={postAvatar}
                      alt={postAuthor}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black bg-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">{postAuthor}</h2>
                      <div className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold">
                        Gold
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{postHandle} • {postTime}</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-colors">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Content (only if image exists) */}
              {hasImage && postContent && (
                <div className="mb-6">
                  <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">
                    {displayedText}
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
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <HandMetal size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400 font-medium">Likes</span>
                  </div>
                  <p className="text-lg font-bold">{localEngagement.likes}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-blue-400" />
                    <span className="text-xs text-gray-400 font-medium">Comments</span>
                  </div>
                  <p className="text-lg font-bold">{localEngagement.comments}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Repeat size={14} className="text-green-400 rotate-90" />
                    <span className="text-xs text-gray-400 font-medium">Shares</span>
                  </div>
                  <p className="text-lg font-bold">{localEngagement.retweets}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye size={14} className="text-purple-400" />
                    <span className="text-xs text-gray-400 font-medium">Views</span>
                  </div>
                  <p className="text-lg font-bold">{localEngagement.views}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleLike}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    userEngagement.liked
                      ? "bg-gray-600/20 border-2 border-gray-600/50 text-gray-400"
                      : "bg-gray-800/50 border-2 border-gray-700/30 text-gray-300 hover:border-gray-600/50"
                  }`}
                >
                  <HandMetal size={16} className={userEngagement.liked ? "fill-current" : ""} />
                  {userEngagement.liked ? "Liked" : "Like"}
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    userEngagement.bookmarked
                      ? "bg-blue-600/20 border-2 border-blue-600/50 text-blue-400"
                      : "bg-gray-800/50 border-2 border-gray-700/30 text-gray-300 hover:border-gray-600/50"
                  }`}
                >
                  <Bookmark size={16} className={userEngagement.bookmarked ? "fill-current" : ""} />
                  {userEngagement.bookmarked ? "Saved" : "Save"}
                </button>
                <button
                  onClick={handleRetweet}
                  disabled={userEngagement.retweeted}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                    userEngagement.retweeted
                      ? "bg-green-600/20 border-2 border-green-600/50 text-green-400"
                      : "bg-gray-800/50 border-2 border-gray-700/30 text-gray-300 hover:border-gray-600/50"
                  }`}
                >
                  <Repeat size={16} className="rotate-90" />
                  {userEngagement.retweeted ? "Shared" : "Share"}
                </button>
              </div>

              {/* Buy/Trade Button */}
              <div className="mb-6">
                <button 
                  className="w-full px-6 py-3 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#10B981",
                    boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(16, 185, 129, 0.50), 0px 0px 0px 1px #10B981"
                  }}
                >
                  <Triangle size={16} />
                  Trade Token • ${postTokenPrice.toFixed(2)}
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 p-1 bg-gray-800/30 rounded-xl border border-gray-700/30">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      activeTab === tab.key
                        ? "text-white shadow-lg"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    style={activeTab === tab.key ? {
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50)"
                    } : {}}
                  >
                    {tab.label}
                    {tab.key === "comments" && (
                      <span className={`ml-1.5 text-xs ${activeTab === tab.key ? "text-white/80" : "text-gray-500"}`}>
                        {localEngagement.comments}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === "comments" && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={currentUserAvatar}
                          alt="Your avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex items-center bg-transparent rounded-full px-1 py-0.5 border border-gray-700/50">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="flex-1 px-3 py-2 bg-transparent text-sm text-white rounded-full focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                        />
                        <button
                          type="submit"
                          disabled={!comment.trim()}
                          className="p-2 bg-[#6E54FF] hover:bg-[#5940cc] rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mr-0.5 flex-shrink-0"
                        >
                          <Send className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {comments.length > 0 ? (
                        comments.slice(0, visibleCount).map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl hover:bg-gray-800/50 transition-all duration-200"
                          >
                            <div className="flex gap-3">
                              <img
                                src={comment.avatar_url}
                                alt={comment.username}
                                className="w-10 h-10 rounded-full object-cover border border-gray-700"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{comment.username}</span>
                                  <span className="text-gray-600 text-xs">•</span>
                                  <span className="text-gray-500 text-xs">{formatCommentTime(comment.created_at)}</span>
                                </div>
                                <p className="text-gray-300 text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
                          <p className="text-gray-400 text-sm">No comments yet.</p>
                          <p className="text-gray-500 text-xs mt-1">Be the first to share your thoughts!</p>
                        </div>
                      )}

                      {visibleCount < comments.length && (
                        <button
                          onClick={() => setVisibleCount(prev => prev + 5)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          View more comments ({comments.length - visibleCount} remaining)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "holders" && (
                  <div className="space-y-3">
                    <div className="text-center py-8 mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: "#6E54FF",
                          boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50)"
                        }}
                      >
                        <TrendingUp size={24} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">156</h3>
                      <p className="text-gray-400 text-sm">Total Token Holders</p>
                    </div>
                    
                    <div className="space-y-2">
                      {[
                        { username: "whale_investor", amount: "1,234.56", percentage: "15.2%" },
                        { username: "crypto_enthusiast", amount: "892.34", percentage: "11.8%" },
                        { username: "defi_master", amount: "567.89", percentage: "8.5%" },
                        { username: "token_holder", amount: "345.12", percentage: "5.2%" },
                      ].map((holder, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-3 px-4 bg-gray-800/30 border border-gray-700/30 rounded-xl hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                              {index + 1}
                            </div>
                            <span className="text-white font-medium text-sm">@{holder.username}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold text-sm">{holder.amount}</p>
                            <p className="text-gray-400 text-xs">{holder.percentage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="space-y-3">
                    <div className="text-center py-6 mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700/30">
                        <TrendingUp size={24} className="text-gray-600" />
                      </div>
                      <p className="text-gray-400 text-sm">Recent Trading Activity</p>
                    </div>
                    
                    {[
                      { type: "buy", user: "whale_investor", amount: "$234.56", time: "5m ago" },
                      { type: "sell", user: "trader_pro", amount: "$89.23", time: "12m ago" },
                      { type: "buy", user: "defi_master", amount: "$445.67", time: "25m ago" },
                      { type: "buy", user: "crypto_fan", amount: "$123.45", time: "1h ago" },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 px-4 bg-gray-800/30 border border-gray-700/30 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activity.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <Triangle size={14} className={activity.type === 'buy' ? 'text-green-400' : 'text-red-400 rotate-180'} />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">@{activity.user}</p>
                            <p className="text-gray-400 text-xs">{activity.time}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold text-sm ${
                            activity.type === 'buy' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {activity.type === 'buy' ? '+' : '-'}{activity.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-3">
                    {[
                      { label: "Posted", value: postTime },
                      { label: "Total Engagement", value: localEngagement.likes + localEngagement.comments + localEngagement.retweets },
                      { label: "Likes", value: localEngagement.likes },
                      { label: "Comments", value: localEngagement.comments },
                      { label: "Shares", value: localEngagement.retweets },
                      { label: "Views", value: localEngagement.views },
                      { label: "Bookmarks", value: localEngagement.bookmarks },
                      { label: "Token Price", value: `${postTokenPrice.toFixed(2)}` },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-3 px-4 bg-gray-800/30 border border-gray-700/30 rounded-xl"
                      >
                        <span className="text-gray-400 text-sm font-medium">{item.label}</span>
                        <span className="text-white font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
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
    </>
  )
}