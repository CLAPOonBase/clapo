"use client"
import { useState } from 'react'
import { MessageCircle, Repeat2, Heart, Bookmark, X, Eye } from 'lucide-react'
import { ApiPost } from '@/app/types'
import { useApi } from '../../Context/ApiProvider'
import { useSession } from 'next-auth/react'
import EngagementDetails from '../../components/EngagementDetails'

type Props = {
  post: ApiPost
  liked?: boolean
  bookmarked?: boolean
  retweeted?: boolean
  onLike?: (id: string) => void
  onRetweet?: (id: string) => void
  onBookmark?: (id: string) => void
  onComment?: (id: string) => void
}

export default function EnhancedSnapCard({ post, liked, bookmarked, retweeted, onLike, onRetweet, onBookmark, onComment }: Props) {
  const [showImageModal, setShowImageModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showEngagement, setShowEngagement] = useState(false)
  const [commentContent, setCommentContent] = useState("")
  const { likePost, unlikePost, retweetPost, bookmarkPost, viewPost, commentPost, state } = useApi()
  const { data: session } = useSession()

  const isLiked = liked ?? state.engagement.likedPosts.has(post.id)
  const isRetweeted = retweeted ?? state.engagement.retweetedPosts.has(post.id)
  const isBookmarked = bookmarked ?? state.engagement.bookmarkedPosts.has(post.id)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleLike = async () => {
    if (!session?.dbUser?.id) return
    try {
      if (isLiked) {
        await unlikePost(post.id, session.dbUser.id)
      } else {
        await likePost(post.id, session.dbUser.id)
      }
      onLike?.(post.id)
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
    }
  }

  const handleRetweet = async () => {
    if (!session?.dbUser?.id) return
    try {
      await retweetPost(post.id, session.dbUser.id)
      onRetweet?.(post.id)
    } catch (error) {
      console.error('Failed to retweet post:', error)
    }
  }

  const handleBookmark = async () => {
    if (!session?.dbUser?.id) return
    try {
      await bookmarkPost(post.id, session.dbUser.id)
      onBookmark?.(post.id)
    } catch (error) {
      console.error('Failed to bookmark post:', error)
    }
  }



  const handleComment = async () => {
    if (!session?.dbUser?.id || !commentContent.trim()) return
    try {
      await commentPost(post.id, session.dbUser.id, commentContent)
      setCommentContent("")
      setShowCommentModal(false)
      onComment?.(post.id)
    } catch (error) {
      console.error('Failed to comment on post:', error)
    }
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
            <Repeat2 className="w-4 h-4 mr-1" />
            <span>@{post.username} retweeted</span>
          </div>
        )}

        <div className="flex space-x-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <img
              src={post.avatar_url || '/default-avatar.png'}
              alt={post.username}
              className="w-12 h-12 rounded-full object-cover"
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
                <img
                  src={post.media_url}
                  alt="Post media"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowImageModal(true)}
                />
              </div>
            )}

            <div className="flex items-center justify-between text-gray-500">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 transition-colors ${
                    isLiked ? 'text-red-500' : 'hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{post.like_count}</span>
                </button>

                <button
                  onClick={() => handleEngagementClick('likes')}
                  className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comment_count}</span>
                </button>

                <button
                  onClick={handleRetweet}
                  className={`flex items-center space-x-1 transition-colors ${
                    isRetweeted ? 'text-green-500' : 'hover:text-green-500'
                  }`}
                >
                  <Repeat2 className={`w-5 h-5 ${isRetweeted ? 'fill-current' : ''}`} />
                  <span>{post.retweet_count}</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className={`flex items-center space-x-1 transition-colors ${
                    isBookmarked ? 'text-purple-500' : 'hover:text-purple-500'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
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

      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={post.media_url}
              alt="Post media"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Comment</h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your comment..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleComment}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      )}

      {showEngagement && (
        <EngagementDetails
          likes={post.likes}
          retweets={post.retweets}
          bookmarks={post.bookmarks}
          comments={post.comments}
          onClose={() => setShowEngagement(false)}
        />
      )}
    </>
  )
} 