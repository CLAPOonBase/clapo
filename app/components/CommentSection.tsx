/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client'
import React, { useState, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { ApiPost } from '@/app/types'
import { useApi } from '../Context/ApiProvider'
import { useSession } from 'next-auth/react'
import ReputationBadge from './ReputationBadge'
import MentionAutocomplete from './MentionAutocomplete'
import { getMentionTriggerInfo, replaceMentionText } from '@/app/lib/mentionUtils'

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

  // Mention state
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentionStartPos, setMentionStartPos] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  // Handle content change and mention detection
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newContent = e.target.value
    const newCursorPosition = e.target.selectionStart || 0

    console.log('💬 Comment input changed:', { newContent, newCursorPosition })

    setCommentContent(newContent)
    setCursorPosition(newCursorPosition)

    // Check for mention trigger
    const mentionInfo = getMentionTriggerInfo(newContent, newCursorPosition)

    console.log('🔍 Mention detection result:', mentionInfo)

    if (mentionInfo && mentionInfo.triggered) {
      console.log('✅ Mention triggered! Showing autocomplete')
      setShowMentionAutocomplete(true)
      setMentionSearch(mentionInfo.searchText)
      setMentionStartPos(mentionInfo.startPos)

      // Calculate position for autocomplete dropdown
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        const position = {
          top: rect.top - 250, // Show above input to avoid being hidden
          left: rect.left,
        }
        console.log('📍 Autocomplete position:', position)
        setMentionPosition(position)
      }
    } else {
      console.log('❌ Mention not triggered, hiding autocomplete')
      setShowMentionAutocomplete(false)
    }
  }

  // Handle mention selection
  const handleMentionSelect = (user: { id: string; username: string }) => {
    const { newText, newCursorPosition } = replaceMentionText(
      commentContent,
      mentionStartPos,
      cursorPosition,
      user.username
    )

    setCommentContent(newText)
    setShowMentionAutocomplete(false)

    // Set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.selectionStart = newCursorPosition
        inputRef.current.selectionEnd = newCursorPosition
        inputRef.current.focus()
      }
    }, 0)
  }

  const handleComment = async () => {
    if (!session?.dbUser?.id || !commentContent.trim()) return
    try {
      // Backend automatically detects @username mentions from content
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
      <div className="flex w-full max-w-2xl flex-col rounded-2xl bg-black shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
          <h3 className="text-lg font-semibold text-white">Comments</h3>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-black hover:text-white transition-colors">
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
                {post.author_reputation_tier && (
                  <ReputationBadge
                    tier={post.author_reputation_tier}
                    score={post.author_reputation || 0}
                    size="sm"
                    showScore={true}
                    showLabel={false}
                  />
                )}
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
                    {comment.author_reputation_tier && (
                      <ReputationBadge
                        tier={comment.author_reputation_tier}
                        score={comment.author_reputation || 0}
                        size="sm"
                        showScore={true}
                        showLabel={false}
                      />
                    )}
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
        <div className="border-t border-gray-700 bg-black p-3">
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
              ref={inputRef}
              type="text"
              value={commentContent}
              onChange={handleContentChange}
              placeholder="Write a comment... Type @ to mention"
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

        {/* Mention Autocomplete */}
        {(() => {
          console.log('🎨 Rendering autocomplete?', {
            showMentionAutocomplete,
            mentionSearch,
            mentionPosition
          })
          return showMentionAutocomplete && (
            <MentionAutocomplete
              searchText={mentionSearch}
              onSelect={handleMentionSelect}
              onClose={() => setShowMentionAutocomplete(false)}
              position={mentionPosition}
              zIndex={9999}
            />
          )
        })()}
      </div>
    </div>
  )
}
