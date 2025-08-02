"use client"
import { useState } from 'react'
import { MessageCircle, Repeat2, Heart, Share, Bookmark, MoreHorizontal, X } from 'lucide-react'
import { Post, ApiPost } from '@/app/types'
import { useApi } from '../../Context/ApiProvider'

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
  const { likePost, unlikePost, retweetPost, bookmarkPost, viewPost, state } = useApi()

  const isApiPost = 'userId' in post
  const postId = isApiPost ? post.id : post.id.toString()
  const postContent = isApiPost ? post.content : post.content
  const postImage = isApiPost ? post.mediaUrl : post.image
  const postAuthor = isApiPost 
    ? post.user?.username || 'Unknown' 
    : post.author || 'Unknown'
  const postHandle = isApiPost 
    ? `@${post.user?.username || 'unknown'}` 
    : post.handle || '@unknown'
  const postTime = isApiPost 
    ? new Date(post.createdAt).toLocaleDateString() 
    : (post.time || 'Unknown')
  const postLikes = isApiPost ? (post.likeCount || 0) : (post.likes || 0)
  const postComments = isApiPost ? (post.commentCount || 0) : (post.comments || 0)
  const postRetweets = isApiPost ? (post.retweetCount || 0) : (post.retweets || 0)
  const postAvatar = isApiPost 
    ? post.user?.avatarUrl 
    : undefined

  const isLiked = liked ?? state.engagement.likedPosts.has(postId)
  const isRetweeted = retweeted ?? state.engagement.retweetedPosts.has(postId)
  const isBookmarked = bookmarked ?? state.engagement.bookmarkedPosts.has(postId)

  const handleLike = async () => {
    if (!state.user.currentUser) return
    try {
      if (isLiked) {
        await unlikePost(postId, state.user.currentUser.id as string)
      } else {
        await likePost(postId, state.user.currentUser.id as string)
      }
      onLike?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
    }
  }

  const handleRetweet = async () => {
    if (!state.user.currentUser) return
    try {
      await retweetPost(postId, state.user.currentUser.id as string)
      onRetweet?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to retweet post:', error)
    }
  }

  const handleBookmark = async () => {
    if (!state.user.currentUser) return
    try {
      await bookmarkPost(postId, state.user.currentUser.id as string)
      onBookmark?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to bookmark post:', error)
    }
  }

  const handleView = async () => {
    if (!state.user.currentUser) return
    try {
      await viewPost(postId, state.user.currentUser.id as string)
    } catch (error) {
      console.error('Failed to view post:', error)
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
                <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors">
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
    </>
  )
}
