import React, { useState } from 'react'
import { X, Send } from 'lucide-react'
import { ApiPost } from '@/app/types'
import { useApi } from '../Context/ApiProvider'
import { useSession } from 'next-auth/react'

interface CommentSectionProps {
  post: ApiPost
  onClose: () => void
  onCommentAdded?: (updatedComments: Array<{id: string; content: string; created_at: string; user_id: string; username: string; avatar_url: string}>) => void
}

export default function CommentSection({ post, onClose, onCommentAdded }: CommentSectionProps) {
  const [commentContent, setCommentContent] = useState("")
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
      setCommentContent("")
      
      // Create new comment object
      const newComment = {
        id: `temp-${Date.now()}`,
        content: commentContent.trim(),
        created_at: new Date().toISOString(),
        user_id: session.dbUser.id,
        username: session.dbUser.username || 'You',
        avatar_url: session.dbUser.avatarUrl || 'https://robohash.org/default.png'
      }
      
      // Add new comment to local state
      const updatedComments = [...comments, newComment]
      setComments(updatedComments)
      
      // Call callback with updated comments
      onCommentAdded?.(updatedComments)
    } catch (error) {
      console.error('Failed to comment on post:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Comments</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-4 border-b border-gray-700">
            <div className="flex space-x-3">
              <img
                src={post.avatar_url || 'https://robohash.org/default.png'}
                alt={post.username}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://robohash.org/default.png'
                }}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-white">@{post.username}</span>
                  <span className="text-gray-400 text-sm">{formatDate(post.created_at)}</span>
                </div>
                <p className="text-white mb-3">{post.content}</p>
                {post.media_url && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img
                      src={post.media_url}
                      alt="Post media"
                      className="w-full max-h-64 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4">
            <h4 className="text-white font-semibold mb-4">
              {comments && comments.length > 0 
                ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
                : 'No comments yet'
              }
            </h4>
            
            {comments && comments.length > 0 && (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <img
                      src={comment.avatar_url}
                      alt={comment.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = 'https://robohash.org/default.png'
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-white">@{comment.username}</span>
                        <span className="text-gray-400 text-sm">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <img
              src={session?.dbUser?.avatarUrl || 'https://robohash.org/default.png'}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://robohash.org/default.png'
              }}
            />
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-dark-700 text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleComment()
                  }
                }}
              />
              <button
                onClick={handleComment}
                disabled={!commentContent.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 