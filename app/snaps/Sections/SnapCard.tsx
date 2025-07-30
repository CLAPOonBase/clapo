"use client"
import { useState } from 'react'
import Image from 'next/image'
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

  const isApiPost = 'userId' in post || 'user_id' in post
  const postId = isApiPost ? post.id : post.id.toString()
  const postContent = isApiPost ? post.content : post.content
  const postImage = isApiPost ? (post.mediaUrl || post.media_url) : post.image
  const postAuthor = isApiPost 
    ? post.user?.username || post.username || 'Unknown' 
    : post.author || 'Unknown'
  const postHandle = isApiPost 
    ? `@${post.user?.username || post.username || 'unknown'}` 
    : post.handle || '@unknown'
  const postTime = isApiPost 
    ? new Date(post.createdAt || post.created_at).toLocaleDateString() 
    : (post.time || 'Unknown')
  const postLikes = isApiPost ? post.likeCount || post.like_count : post.likes
  const postComments = isApiPost ? post.commentCount || post.comment_count : post.comments
  const postRetweets = isApiPost ? post.retweetCount || post.retweet_count : post.retweets
  const postAvatar = isApiPost 
    ? post.user?.avatarUrl || post.avatar_url 
    : post.authorAvatar

  const isLiked = liked ?? state.engagement.likedPosts.has(postId)
  const isRetweeted = retweeted ?? state.engagement.retweetedPosts.has(postId)
  const isBookmarked = bookmarked ?? state.engagement.bookmarkedPosts.has(postId)

  const handleLike = async () => {
    if (!state.user.currentUser) return
    try {
      if (isLiked) {
        await unlikePost(postId, state.user.currentUser.id)
      } else {
        await likePost(postId, state.user.currentUser.id)
      }
      onLike?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to like/unlike post:', error)
    }
  }

  const handleRetweet = async () => {
    if (!state.user.currentUser) return
    try {
      await retweetPost(postId, state.user.currentUser.id)
      onRetweet?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to retweet post:', error)
    }
  }

  const handleBookmark = async () => {
    if (!state.user.currentUser) return
    try {
      await bookmarkPost(postId, state.user.currentUser.id)
      onBookmark?.(isApiPost ? postId : parseInt(postId))
    } catch (error) {
      console.error('Failed to bookmark post:', error)
    }
  }

  const handleView = async () => {
    if (!state.user.currentUser) return
    try {
      await viewPost(postId, state.user.currentUser.id)
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
              <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {postAuthor && postAuthor.length > 0 ? postAuthor.substring(0, 2).toUpperCase() : 'UN'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-bold">{postAuthor}</span>
              <span className="text-gray-500">{postHandle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500">{postTime}</span>
              <div className="ml-auto">
                <MoreHorizontal className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer" />
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-3">{postContent}</p>
            {postImage && (
              <div className="mb-3 cursor-pointer" onClick={(e) => {
                e.stopPropagation()
                setShowImageModal(true)
              }}>
                <Image
                  src={postImage}
                  alt="Post media"
                  width={600}
                  height={300}
                  className="rounded-2xl w-full h-64 object-cover"
                />
              </div>
            )}
            <div className='flex justify-between text-secondary'>
              <div className="flex items-center space-x-4 text-gray-500">
                <button 
                  className="flex items-center space-x-2 hover:text-blue-500" 
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Comment functionality
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{postComments || 0}</span>
                </button>
                <button 
                  className={`flex items-center space-x-2 hover:text-green-500 ${isRetweeted ? 'text-green-500' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRetweet()
                  }}
                >
                  <Repeat2 className="w-5 h-5" />
                  <span className="text-sm">{(postRetweets || 0) + (isRetweeted ? 1 : 0)}</span>
                </button>
                <button 
                  className={`flex items-center space-x-2 hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`} 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLike()
                  }}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{(postLikes || 0) + (isLiked ? 1 : 0)}</span>
                </button>
                <button className="hover:text-blue-500">
                  <Share className="w-5 h-5" />
                </button>
              </div>
              <button 
                className={`hover:text-blue-500 ${isBookmarked ? 'text-blue-500' : ''}`} 
                onClick={(e) => {
                  e.stopPropagation()
                  handleBookmark()
                }}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="relative w-auto h-56 p-4">
            <button
              className="absolute top-2 right-2 text-white hover:text-red-500"
              onClick={() => setShowImageModal(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <Image
              src={postImage || ""}
              alt="Enlarged post image"
              width={1000}
              height={600}
              className="rounded-xl w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
