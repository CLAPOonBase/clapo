'use client'

import React, { useState, useEffect } from 'react'
import { Copy } from 'lucide-react'
import { useAccessTokens, AccessToken, AccessTokenStats } from '@/app/hooks/useAccessTokens'
import { generateCreatorTokenUUID } from '@/app/lib/uuid'

interface AccessTokenManagerProps {
  userId: string
  username: string
  isOwnProfile?: boolean
}

export function AccessTokenManager({ userId, username, isOwnProfile = false }: AccessTokenManagerProps) {
  const {
    loading,
    error,
    getAccessTokensForCreator,
    getAccessTokenStats,
    getAvailableAccessTokens,
  } = useAccessTokens()

  const [stats, setStats] = useState<AccessTokenStats | null>(null)
  const [allTokens, setAllTokens] = useState<AccessToken[]>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const creatorTokenUuid = generateCreatorTokenUUID(userId)

  useEffect(() => {
    if (isOwnProfile && creatorTokenUuid) {
      loadAccessTokenData()
    }
  }, [isOwnProfile, creatorTokenUuid])

  const loadAccessTokenData = async () => {
    try {
      const [statsData, availableData, usedData] = await Promise.all([
        getAccessTokenStats(creatorTokenUuid),
        getAvailableAccessTokens(creatorTokenUuid),
        getAccessTokensForCreator(creatorTokenUuid, true)
      ])

      setStats(statsData)

      // Combine and sort tokens (available first, then used)
      const combined = [...availableData, ...usedData].sort((a, b) => {
        // Available tokens first
        if (!a.is_used && b.is_used) return -1
        if (a.is_used && !b.is_used) return 1
        return 0
      })

      setAllTokens(combined)
    } catch (err) {
      console.error('Failed to load access token data:', err)
    }
  }

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 2000)
    } catch (err) {
      console.error('Failed to copy token:', err)
    }
  }

  const handleShareToken = (token: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Clapo with my access code',
        text: `Use my access code to join Clapo: ${token}`,
        url: `${window.location.origin}/signup?token=${token}`
      })
    } else {
      // Fallback: copy to clipboard
      handleCopyToken(token)
    }
  }

  const displayToken = (token: string) => {
    // Show start and end characters with "..." in the middle
    const start = token.substring(0, 8)
    const end = token.substring(token.length - 5)
    return `${start}...${end}`.toUpperCase()
  }

  if (!isOwnProfile) {
    return null
  }

  if (loading && !stats) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-black border border-gray-800 rounded-2xl p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-black border border-gray-800 rounded-2xl p-4">
        <div className="text-red-400 text-sm">
          Error loading access tokens: {error}
        </div>
      </div>
    )
  }

  if (allTokens.length === 0) {
    return (
      <div className="bg-black border border-gray-800 rounded-2xl p-8 text-center">
        <p className="text-gray-400">No access tokens available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {allTokens.map((token) => (
        <div
          key={token.id}
          className="bg-black border border-gray-800 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 hover:border-gray-700"
        >
          {/* Token Text */}
          <div className="flex items-center space-x-4 flex-1">
            {token.is_used ? (
              <>
                <span className="text-gray-500 font-mono tracking-widest text-base line-through">
                  {displayToken(token.token)}
                </span>
                <span className="text-xs font-medium text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
                  Used
                </span>
              </>
            ) : (
              <span className="text-white font-mono tracking-widest text-base">
                {displayToken(token.token)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Copy Button */}
            <button
              onClick={() => handleCopyToken(token.token)}
              disabled={token.is_used}
              className={`p-2 rounded-lg transition-colors ${
                token.is_used
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Copy code"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={() => handleShareToken(token.token)}
              disabled={token.is_used}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                token.is_used
                  ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                  : 'bg-[#6E54FF] hover:bg-[#5940cc] text-white'
              }`}
            >
              Share
            </button>
          </div>
        </div>
      ))}

      {/* Copy Success Message */}
      {copiedToken && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#6E54FF] text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg z-50">
          Code copied to clipboard!
        </div>
      )}
    </div>
  )
}
