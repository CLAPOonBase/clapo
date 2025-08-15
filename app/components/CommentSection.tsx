import React, { useState } from 'react'
import { X, Send } from 'lucide-react'
import { ApiPost } from '@/app/types'
import { useApi } from '../Context/ApiProvider'
import { useSession } from 'next-auth/react'

interface CommentSectionProps {
  post: ApiPost
  onClose: () => void
  onCommentAdded?: (
    updatedComments: Array<{
      id: string
      content: string
      created_at: string
      user_id: string
      username: string
      avatar_url: string
    }>
  ) => void
}

export default function CommentSection({ post, onClose, onCommentAdded }: CommentSectionProps) {
  const [commentContent, setCommentContent] = useState('')
  const [comments, setComments] = useState(post.comments || [])
  const { commentPost } = useApi()
  const { data: session } = useSession()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const handleComment = async () => {
    if (!session?.dbUser?.id || !commentContent.trim()) return
    try {
      await commentPost(post.id, {
        userId: session.dbUser.id,
        content: commentContent.trim()
      })
      const newComment = {
        id: `temp-${Date.now()}`,
        content: commentContent.trim(),
        created_at: new Date().toISOString(),
        user_id: session.dbUser.id,
        username: session.dbUser.username || 'You',
        avatar_url: session.dbUser.avatar_url || 'https://robohash.org/default.png'
      }
      const updatedComments = [...comments, newComment]
      setComments(updatedComments)
      setCommentContent('')
      onCommentAdded?.(updatedComments)
    } catch (error) {
      console.error('Failed to comment on post:', error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 mx-auto">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-dark-800 shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h3 className="text-lg font-semibold text-white">Comments</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Post preview */}
        <div className="border-b border-gray-700 p-4">
          <div className="flex gap-3">
            <img
              src={post.avatar_url || 'https://robohash.org/default.png'}
              alt={post.username}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://robohash.org/default.png'
              }}
            />
            <div className="flex flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">@{post.username}</span>
                <span className="text-sm text-gray-400">{formatDate(post.created_at)}</span>
              </div>
              <p className="mt-1 text-gray-200">{post.content}</p>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.avatar_url}
                  alt={comment.username}
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://robohash.org/default.png'
                  }}
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">@{comment.username}</span>
                    <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-300">{comment.content}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-gray-500">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-700 bg-dark-800 p-3">
          <div className="flex items-center gap-3">
            <img
              src={session?.dbUser?.avatar_url || 'https://robohash.org/default.png'}
              alt="Your avatar"
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://robohash.org/default.png'
              }}
            />
            <input
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full bg-dark-700 px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleComment()
                }
              }}
            />
            <button
              onClick={handleComment}
              disabled={!commentContent.trim()}
              className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
