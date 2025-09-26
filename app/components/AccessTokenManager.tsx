'use client'

import React, { useState, useEffect } from 'react'
import { Copy, Eye, EyeOff, Trash2, Gift, Users, CheckCircle, XCircle } from 'lucide-react'
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
    revokeAccessToken,
    getAvailableAccessTokens,
  } = useAccessTokens()

  const [stats, setStats] = useState<AccessTokenStats | null>(null)
  const [availableTokens, setAvailableTokens] = useState<AccessToken[]>([])
  const [usedTokens, setUsedTokens] = useState<AccessToken[]>([])
  const [showAvailable, setShowAvailable] = useState(true)
  const [showUsed, setShowUsed] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [revokingToken, setRevokingToken] = useState<string | null>(null)

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
      setAvailableTokens(availableData)
      setUsedTokens(usedData)
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

  const handleRevokeToken = async (token: string) => {
    if (!confirm('Are you sure you want to revoke this access token? This action cannot be undone.')) {
      return
    }

    setRevokingToken(token)
    try {
      await revokeAccessToken(token)
      await loadAccessTokenData() // Refresh data
    } catch (err) {
      console.error('Failed to revoke token:', err)
      alert('Failed to revoke token: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setRevokingToken(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateToken = (token: string) => {
    return `${token.substring(0, 8)}...${token.substring(token.length - 8)}`
  }

  if (!isOwnProfile) {
    return null
  }

  if (loading && !stats) {
    return (
      <div className="bg-dark-700 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-dark-600 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-dark-600 rounded"></div>
            <div className="h-3 bg-dark-600 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark-700 rounded-lg p-4">
        <div className="text-red-400 text-sm">
          <XCircle className="w-4 h-4 inline mr-2" />
          Error loading access tokens: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Access Tokens</h3>
        </div>
        <div className="text-sm text-gray-400">
          Manage freebie access tokens
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-800 rounded-lg p-3 text-center">
            <div className="text-white font-semibold">{stats.total}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-dark-800 rounded-lg p-3 text-center">
            <div className="text-green-400 font-semibold">{stats.available}</div>
            <div className="text-xs text-gray-400">Available</div>
          </div>
          <div className="bg-dark-800 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-semibold">{stats.used}</div>
            <div className="text-xs text-gray-400">Used</div>
          </div>
        </div>
      )}

      {/* Toggle Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setShowAvailable(true)
            setShowUsed(false)
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            showAvailable
              ? 'bg-green-600 text-white'
              : 'bg-dark-600 text-gray-400 hover:text-white'
          }`}
        >
          Available ({availableTokens.length})
        </button>
        <button
          onClick={() => {
            setShowAvailable(false)
            setShowUsed(true)
          }}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            showUsed
              ? 'bg-blue-600 text-white'
              : 'bg-dark-600 text-gray-400 hover:text-white'
          }`}
        >
          Used ({usedTokens.length})
        </button>
      </div>

      {/* Available Tokens */}
      {showAvailable && (
        <div className="space-y-2">
          <div className="text-sm text-gray-400 mb-2">Available Access Tokens</div>
          {availableTokens.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No available access tokens</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableTokens.map((token) => (
                <div key={token.id} className="bg-dark-800 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <div className="text-white font-mono text-sm">
                        {truncateToken(token.token)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created {formatDate(token.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyToken(token.token)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Copy token"
                    >
                      {copiedToken === token.token ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleRevokeToken(token.token)}
                      disabled={revokingToken === token.token}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Revoke token"
                    >
                      {revokingToken === token.token ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Used Tokens */}
      {showUsed && (
        <div className="space-y-2">
          <div className="text-sm text-gray-400 mb-2">Used Access Tokens</div>
          {usedTokens.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No used access tokens</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {usedTokens.map((token) => (
                <div key={token.id} className="bg-dark-800 rounded-lg p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <XCircle className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-white font-mono text-sm">
                        {truncateToken(token.token)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Created {formatDate(token.created_at)}
                      </div>
                    </div>
                  </div>
                  {token.used_by_address && (
                    <div className="text-xs text-gray-400">
                      Used by: {token.used_by_address.substring(0, 6)}...{token.used_by_address.substring(token.used_by_address.length - 4)}
                      {token.used_at && (
                        <span className="ml-2">
                          on {formatDate(token.used_at)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 bg-dark-800 p-2 rounded">
        <p>• Access tokens allow users to claim free creator tokens</p>
        <p>• Share available tokens with your community</p>
        <p>• Revoked tokens cannot be used</p>
      </div>
    </div>
  )
}


