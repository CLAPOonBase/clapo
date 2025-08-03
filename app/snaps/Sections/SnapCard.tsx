"use client"
import { useState } from 'react'
import { MessageCircle, Repeat2, Heart, Share, Bookmark, MoreHorizontal, X } from 'lucide-react'
import { Post, ApiPost } from '@/app/types'
import { useApi } from '../../Context/ApiProvider'
import { useSession } from 'next-auth/react'

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
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentContent, setCommentContent] = useState("")
  const { likePost, unlikePost, retweetPost, bookmarkPost, viewPost, commentPost, state } = useApi()
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
  const postLikes = isApiPost ? (post.like_count || 0) : (post.likes || 0)
  const postComments = isApiPost ? (post.comment_count || 0) : (post.comments || 0)
  const postRetweets = isApiPost ? (post.retweet_count || 0) : (post.retweets || 0)
  const postAvatar = isApiPost 
    ? post.avatar_url 
    : undefined

  const isLiked = liked ?? state.engagement.likedPosts.has(postId)
  const isRetweeted = retweeted ?? state.engagement.retweetedPosts.has(postId)
  const isBookmarked = bookmarked ?? state.engagement.bookmarkedPosts.has(postId)

  const handleLike = async () => {
    if (!session?.dbUser?.id) return
    try {
      console.log('🔍 Like Debug:', { 
        sessionDbUserId: session.dbUser.id,
        stateUserCurrentUser: state.user.currentUser 
      })
      if (isLiked) {
        await unlikePost(postId, session.dbUser.id)
      } else {
        await likePost(postId, session.dbUser.id)
      }
      onLike?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
    }
  }

  const handleRetweet = async () => {
    if (!session?.dbUser?.id) return
    try {
      console.log('🔍 Retweet Debug:', { 
        sessionDbUserId: session.dbUser.id,
        stateUserCurrentUser: state.user.currentUser 
      })
      await retweetPost(postId, session.dbUser.id)
      onRetweet?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to retweet post:', error)
    }
  }

  const handleBookmark = async () => {
    if (!session?.dbUser?.id) return
    try {
      console.log('🔍 Bookmark Debug:', { 
        sessionDbUserId: session.dbUser.id,
        stateUserCurrentUser: state.user.currentUser 
      })
      await bookmarkPost(postId, session.dbUser.id)
      onBookmark?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to bookmark post:', error)
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

  const handleComment = async () => {
    if (!session?.dbUser?.id || !commentContent.trim()) return
    try {
      await commentPost(postId, {
        userId: session.dbUser.id,
        content: commentContent.trim()
      })
      setCommentContent("")
      setShowCommentModal(false)
    } catch (error) {
      console.error('Failed to comment on post:', error)
    }
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
                <img 
                  src={postImage} 
                  alt="Post content"
                  className="w-full max-h-96 object-cover cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowImageModal(true)
                  }}
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLike()
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{postLikes}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRetweet()
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
                >
                  <Repeat2 className={`w-5 h-5 ${isRetweeted ? 'fill-green-500 text-green-500' : ''}`} />
                  <span>{postRetweets}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowCommentModal(true)
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{postComments}</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <Share className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark()
                  }}
                  className="flex items-center space-x-2 text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </button>
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
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

      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowCommentModal(false)}>
          <div className="relative bg-dark-800 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowCommentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-white text-lg font-semibold mb-4">Comment on this post</h3>
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your comment..."
              className="w-full h-32 bg-dark-700 text-white border border-gray-600 rounded-lg p-3 mb-4 resize-none focus:outline-none focus:border-blue-500"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComment}
                disabled={!commentContent.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
