'use client'

import React, { useState, useEffect } from 'react'
import { apiService } from '../lib/api'
import { useSession } from 'next-auth/react'
import { usePrivy } from '@privy-io/react-auth'
import { renderTextWithMentions } from '../lib/mentionUtils'
import { MessageCircle, Image as ImageIcon, Calendar, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Fallback date formatting function
const formatDateFallback = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  } catch {
    return 'recently'
  }
}

interface Mention {
  id: string
  content_type: 'post' | 'comment' | 'story'
  content_id: string
  content_text: string
  mentioned_at: string
  created_at: string
  mentioner_username: string
  mentioner_avatar: string
  mentioner_id: string
  original_content: string
  content_author: string
  content_created_at: string
}

interface MyMentionsProps {
  userId?: string
}

export default function MyMentions({ userId }: MyMentionsProps) {
  const { data: session } = useSession()
  const { authenticated: privyAuthenticated, user: privyUser } = usePrivy()
  const [mentions, setMentions] = useState<Mention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Priority: passed userId > session dbUser > nothing (will be handled separately for Privy)
  const currentUserId = userId || session?.dbUser?.id

  // Debug session data
  useEffect(() => {
    console.log('🔍 MyMentions session debug:', {
      session: !!session,
      dbUser: !!session?.dbUser,
      dbUserId: session?.dbUser?.id,
      privyAuthenticated,
      privyUserId: privyUser?.id,
      passedUserId: userId,
      currentUserId: currentUserId
    })
  }, [session, userId, currentUserId, privyAuthenticated, privyUser])

  const fetchMentions = async (reset = false) => {
    if (!currentUserId) {
      console.log('❌ No user ID available:', { userId, sessionDbUser: session?.dbUser?.id })
      setError('User ID not available')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const currentOffset = reset ? 0 : offset
      
      console.log('🔍 Fetching mentions for user:', currentUserId)
      console.log('🔍 API base URL should be: https://server.blazeswap.io/api/snaps')
      
      const response = await apiService.getAllUserMentions(
        currentUserId,
        limit,
        currentOffset
      )

      if (reset) {
        setMentions(response.mentions)
        setOffset(limit)
      } else {
        setMentions(prev => [...prev, ...response.mentions])
        setOffset(prev => prev + limit)
      }

      setHasMore(response.mentions.length === limit)
    } catch (err) {
      console.error('Error fetching mentions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch mentions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId) {
      fetchMentions(true)
    }
  }, [currentUserId])

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <MessageCircle className="w-4 h-4" />
      case 'comment':
        return <MessageCircle className="w-4 h-4" />
      case 'story':
        return <ImageIcon className="w-4 h-4" />
      default:
        return <MessageCircle className="w-4 h-4" />
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'mentioned you in a post'
      case 'comment':
        return 'mentioned you in a comment'
      case 'story':
        return 'mentioned you in a story'
      default:
        return 'mentioned you'
    }
  }

  const handleMentionClick = async (userId: string, username: string) => {
    console.log('Mention clicked:', { userId, username })
    if (userId) {
      // We have the user ID, navigate directly
      window.location.href = `/snaps/profile/${userId}`
    } else {
      // We don't have the user ID, search for the user by username
      try {
        console.log('Searching for user:', username)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps'}/users/search?q=${username}&limit=1`)
        const data = await response.json()
        
        if (data.users && data.users.length > 0) {
          const user = data.users.find((u: any) => u.username === username)
          if (user) {
            window.location.href = `/snaps/profile/${user.id}`
            return
          }
        }
        
        // User not found
        console.log(`User ${username} not found`)
      } catch (error) {
        console.error('Error finding user:', error)
      }
    }
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchMentions()
    }
  }

  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Please log in to view your mentions</p>
          <p className="text-gray-500 text-sm mt-2">
            Debug: NextAuth: {session ? 'Yes' : 'No'},
            Privy: {privyAuthenticated ? 'Yes' : 'No'},
            User ID: {currentUserId || 'None'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchMentions(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Posts, comments, and stories where you were mentioned
        </p>
      </div>

      {mentions.length === 0 && !loading ? (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            No mentions yet
          </h3>
          <p className="text-gray-400">
            When someone mentions you with @username, it will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mentions.map((mention) => (
            <div
              key={mention.id}
              className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                {/* Mentioner Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={mention.mentioner_avatar || '/default-avatar.png'}
                    alt={mention.mentioner_username}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/default-avatar.png'
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-white">
                      {mention.mentioner_username}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {getContentTypeLabel(mention.content_type)}
                    </span>
                    <div className="flex items-center text-gray-400">
                      {getContentTypeIcon(mention.content_type)}
                    </div>
                  </div>

                  {/* Mention Text */}
                  <div className="text-gray-300 mb-3">
                    {renderTextWithMentions(
                      mention.content_text,
                      undefined,
                      handleMentionClick
                    )}
                  </div>

                  {/* Original Content Preview */}
                  {mention.original_content && (
                    <div className="bg-gray-900/50 rounded-lg p-3 mb-3 border border-gray-700/30">
                      <div className="text-sm text-gray-400 mb-1">
                        Original {mention.content_type}:
                      </div>
                      <div className="text-gray-300 text-sm">
                        {mention.original_content.length > 150
                          ? `${mention.original_content.substring(0, 150)}...`
                          : mention.original_content}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(mention.mentioned_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs">
                      ID: {mention.content_id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && mentions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-400">Loading mentions...</span>
        </div>
      )}
    </div>
  )
}
