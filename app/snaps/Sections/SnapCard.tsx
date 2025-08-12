"use client"
import React, { useState, useEffect } from 'react'
import { MessageCircle, Repeat2, Heart, Bookmark, Eye, X, MoreHorizontal, Volume2 } from 'lucide-react'
import { Post, ApiPost } from '@/app/types'
import { useApi } from '../../Context/ApiProvider'
import { useSession } from 'next-auth/react'
import EngagementDetails from '../../components/EngagementDetails'
import CommentSection from '../../components/CommentSection'
import Toast from '../../components/Toast'
import { AnimatePresence, motion } from "framer-motion"
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
  const [toast, setToast] = useState<{ message: string; type: any } | null>(null)
  const [isLoading, setIsLoading] = useState({ like: false, retweet: false, bookmark: false })
  const [localEngagement, setLocalEngagement] = useState({ likes: 0, comments: 0, retweets: 0, bookmarks: 0 })
  const [userEngagement, setUserEngagement] = useState({ liked: false, retweeted: false, bookmarked: false })

  const { likePost, unlikePost, retweetPost, bookmarkPost, unbookmarkPost, viewPost, state } = useApi()
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

  const isUserInLikes = isApiPost && post.likes?.some(u => u.user_id === currentUserId)
  const isUserInRetweets = isApiPost && post.retweets?.some(u => u.user_id === currentUserId)
  const isUserInBookmarks = isApiPost && post.bookmarks?.some(u => u.user_id === currentUserId)

  useEffect(() => {
    setLocalEngagement({
      likes: isApiPost ? (post.like_count || 0) : (post.likes || 0),
      comments: isApiPost ? (post.comment_count || 0) : (post.comments || 0),
      retweets: isApiPost ? (post.retweet_count || 0) : (post.retweets || 0),
      bookmarks: isApiPost ? (post.bookmarks?.length || 0) : 0
    })

    setUserEngagement({
      liked: isUserInLikes || liked || state.engagement.likedPosts.has(postId),
      retweeted: isUserInRetweets || retweeted || state.engagement.retweetedPosts.has(postId),
      bookmarked: isUserInBookmarks || bookmarked || state.engagement.bookmarkedPosts.has(postId)
    })
  }, [isUserInLikes, isUserInRetweets, isUserInBookmarks, liked, retweeted, bookmarked, postId, state.engagement])

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
    try {
      if (userEngagement[engagementKey]) {
        await undoCall()
        setLocalEngagement(prev => ({ ...prev, [counterKey]: Math.max(0, prev[counterKey] - 1) }))
        setUserEngagement(prev => ({ ...prev, [engagementKey]: false }))
        setToast({ message: toastMsg.undo, type: `un${type}` })
      } else {
        await apiCall()
        setLocalEngagement(prev => ({ ...prev, [counterKey]: prev[counterKey] + 1 }))
        setUserEngagement(prev => ({ ...prev, [engagementKey]: true }))
        setToast({ message: toastMsg.do, type: type })
      }
      onAction?.(isApiPost ? postId : parseInt(postId))
    } catch {
      setToast({ message: `Failed to ${type} post`, type: 'error' })
    } finally {
      setIsLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleView = () => currentUserId && viewPost(postId, currentUserId).catch(() => {})

  const handleCommentAdded = (comments: any[]) =>
    setLocalEngagement(prev => ({ ...prev, comments: comments.length }))

const [expanded, setExpanded] = useState(false)

const words = postContent?.trim().split(/\s+/) || []
const isLong = words.length > 50
const displayedText = expanded ? postContent : words.slice(0, 50).join(" ") + (isLong ? "..." : "")


  return (
    <>
      <div className="bg-dark-800 text-secondary rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 my-4" onClick={handleView}>
        <div className="flex flex-col space-y-4">
          <div className='flex space-x-2'>
            <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
            {postAvatar ? (
              <img src={postAvatar} alt={postAuthor} className="w-full h-full object-cover bg-primary"
                onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${postAuthor}` }} />
            ) : (
              <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-sm font-semibold">
                {postAuthor?.substring(0, 2)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
             <div className="flex flex-1 min-w-0 items-center space-x-2 mb-3">
            <span className='flex flex-col'>  <span className="font-semibold text-white truncate">{postAuthor}</span>
              <span className="text-secondary truncate">{postHandle}</span></span>
             
              <span className="text-secondary text-sm w-full text-end">{postTime}</span>
            </div>
          </div>

          <div className="">
         

         <p className=" text-secondary leading-relaxed whitespace-pre-wrap">
  {displayedText}
</p>
{isLong && (
  <button
    onClick={(e) => {
      e.stopPropagation()
      setExpanded(prev => !prev)
    }}
    className="text-blue-500 hover:underline text-sm w-full text-end"
  >
    {expanded ? "View Less" : "View More"}
  </button>
)}


            {postImage && (
              <div className="mt-4 rounded-xl overflow-hidden">
                {/\.(jpg|jpeg|png|gif|webp)$/i.test(postImage) ? (
                  <img src={postImage} alt="Post content" className="w-full max-h-96 object-cover cursor-pointer hover:opacity-95"
                    onClick={e => { e.stopPropagation(); setShowImageModal(true) }} />
                ) : /\.(mp4|webm|ogg|mov)$/i.test(postImage) ? (
                  <video src={postImage} controls className="w-full max-h-96 bg-gray-50" />
                ) : /\.(mp3|wav|ogg|m4a)$/i.test(postImage) ? (
                  <div className="bg-gray-50 p-4 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <audio src={postImage} controls className="flex-1" />
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 text-center">
                    <p className="text-gray-600 text-sm mb-2">Media file</p>
                    <a href={postImage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                      View media
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button onClick={e => { e.stopPropagation(); handleAction('like', () => likePost(postId, currentUserId!), () => unlikePost(postId, currentUserId!), 'likes', 'liked', { do: 'Post liked', undo: 'Post unliked' }, onLike) }}
                  disabled={isLoading.like}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all group ${isLoading.like ? 'text-gray-400' : userEngagement.liked ? 'text-red-600' : ' hover:text-red-600 hover:bg-red-50'}`}>
                  <Heart className={`w-5 h-5 ${userEngagement.liked ? 'fill-red-600' : ''}`} />
                  <span className="text-sm">{localEngagement.likes}</span>
                </button>

                <button onClick={e => { e.stopPropagation(); setShowCommentSection(true) }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{localEngagement.comments}</span>
                </button>

                <button onClick={e => { e.stopPropagation(); handleAction('retweet', () => retweetPost(postId, currentUserId!), async () => {}, 'retweets', 'retweeted', { do: 'Post retweeted', undo: '' }, onRetweet) }}
                  disabled={isLoading.retweet || userEngagement.retweeted}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all group ${userEngagement.retweeted ? 'text-green-600' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'}`}>
                  <Repeat2 className={`w-5 h-5 ${userEngagement.retweeted ? 'fill-green-600' : ''}`} />
                  <span className="text-sm">{localEngagement.retweets}</span>
                </button>

                <button onClick={e => { e.stopPropagation(); handleAction('bookmark', () => bookmarkPost(postId, currentUserId!), () => unbookmarkPost(postId, currentUserId!), 'bookmarks', 'bookmarked', { do: 'Post bookmarked', undo: 'Bookmark removed' }, onBookmark) }}
                  disabled={isLoading.bookmark}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all group ${userEngagement.bookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}>
                  <Bookmark className={`w-5 h-5 ${userEngagement.bookmarked ? 'fill-blue-600' : ''}`} />
                  <span className="text-sm">{localEngagement.bookmarks}</span>
                </button>

                <button onClick={e => { e.stopPropagation(); setShowEngagement(true) }}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-2 text-gray-400">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{isApiPost ? (post.post_popularity_score || 0).toLocaleString() : '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

  

<AnimatePresence>
  {showCommentSection && isApiPost && (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex justify-center items-end sm:items-center sm:p-4"
    >
      <div className="bg-dark-800 w-full sm:w-[600px] rounded-t-2xl sm:rounded-2xl shadow-lg max-h-[90%] overflow-y-auto">
        <CommentSection
          post={post}
          onClose={() => setShowCommentSection(false)}
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>


      {showEngagement && isApiPost && (
        <EngagementDetails likes={post.likes} retweets={post.retweets} bookmarks={post.bookmarks} onClose={() => setShowEngagement(false)} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}
