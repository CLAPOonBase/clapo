'use client'

import React, { useState } from 'react'
import { Gift, Key, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAccessTokens } from '@/app/hooks/useAccessTokens'
import { useCreatorToken } from '@/app/hooks/useCreatorToken'
import { generateCreatorTokenUUID } from '@/app/lib/uuid'
import { useSession } from 'next-auth/react'

interface AccessTokenClaimProps {
  userId: string
  username: string
  avatarUrl?: string
}

export function AccessTokenClaim({ userId, username, avatarUrl }: AccessTokenClaimProps) {
  const { data: session } = useSession();
  
  const {
    loading: accessTokenLoading,
    error: accessTokenError,
    claimAccessToken,
    validateAccessToken,
    hasUserUsedAccessToken,
  } = useAccessTokens()

  const {
    isConnected,
    connectWallet,
    isConnecting,
    address,
    buyCreatorTokens,
  } = useCreatorToken()

  const [accessToken, setAccessToken] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
    tokenData?: any
  } | null>(null)
  const [hasUsedToken, setHasUsedToken] = useState(false)
  const [showClaimForm, setShowClaimForm] = useState(false)

  const creatorTokenUuid = generateCreatorTokenUUID(userId)

  const handleValidateToken = async () => {
    if (!accessToken.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Please enter an access token'
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)

    try {
      const tokenData = await validateAccessToken(accessToken.trim())
      
      if (tokenData) {
        if (tokenData.is_used) {
          setValidationResult({
            isValid: false,
            message: 'This access token has already been used'
          })
        } else if (tokenData.creator_token_uuid !== creatorTokenUuid) {
          setValidationResult({
            isValid: false,
            message: 'This access token is not valid for this creator'
          })
        } else {
          setValidationResult({
            isValid: true,
            message: 'Access token is valid! You can claim your freebie.',
            tokenData
          })
        }
      } else {
        setValidationResult({
          isValid: false,
          message: 'Invalid access token'
        })
      }
    } catch (err) {
      setValidationResult({
        isValid: false,
        message: err instanceof Error ? err.message : 'Failed to validate token'
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleClaimFreebie = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    if (!validationResult?.isValid || !accessToken.trim()) {
      return
    }

    setIsClaiming(true)

    try {
      // First, use the access token
      await claimAccessToken(accessToken.trim())
      
      // Then, claim the freebie through the smart contract
      await buyCreatorTokens(creatorTokenUuid, 1, session?.dbUser?.id)
      
      // Reset form
      setAccessToken('')
      setValidationResult(null)
      setShowClaimForm(false)
      setHasUsedToken(true)
      
      alert('Successfully claimed your free creator tokens!')
    } catch (err) {
      console.error('Failed to claim freebie:', err)
      alert('Failed to claim free creator tokens: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsClaiming(false)
    }
  }

  const checkIfUserHasUsedToken = async () => {
    if (isConnected && address && creatorTokenUuid) {
      try {
        const hasUsed = await hasUserUsedAccessToken(creatorTokenUuid)
        setHasUsedToken(hasUsed)
      } catch (err) {
        console.error('Failed to check if user has used token:', err)
      }
    }
  }

  React.useEffect(() => {
    checkIfUserHasUsedToken()
  }, [isConnected, address, creatorTokenUuid])

  if (hasUsedToken) {
    return (
      <div className="bg-dark-700 rounded-lg p-4 text-center">
        <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
        <h3 className="text-white font-semibold mb-1">Free Creator Tokens Claimed!</h3>
        <p className="text-gray-400 text-sm">You've already claimed your free creator tokens from {username}</p>
      </div>
    )
  }

  return (
    <div className="bg-dark-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <img
          src={avatarUrl || "https://robohash.org/default.png"}
          alt={username}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://robohash.org/default.png";
          }}
        />
        <div>
          <h3 className="text-white font-semibold">Claim Free Creator Tokens</h3>
          <p className="text-gray-400 text-sm">Use access token from {username}</p>
        </div>
      </div>

      {/* Claim Form */}
      {!showClaimForm ? (
        <div className="text-center">
          <Key className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-white text-sm mb-2 font-medium">
            Get Free Creator Tokens!
          </p>
          <p className="text-gray-400 text-sm mb-4">
            Enter the access token given by {username} to claim your free creator tokens
          </p>
          <button
            onClick={() => setShowClaimForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <Key className="w-4 h-4" />
            <span>Enter Access Token</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Access Token Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Access Token
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter access token..."
                className="flex-1 bg-dark-800 text-white px-3 py-2 rounded-lg border border-dark-600 focus:border-green-500 focus:outline-none text-sm"
                disabled={isValidating || isClaiming}
              />
              <button
                onClick={handleValidateToken}
                disabled={isValidating || !accessToken.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </button>
            </div>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              validationResult.isValid 
                ? 'bg-green-900/30 border border-green-500/30' 
                : 'bg-red-900/30 border border-red-500/30'
            }`}>
              {validationResult.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm ${
                validationResult.isValid ? 'text-green-400' : 'text-red-400'
              }`}>
                {validationResult.message}
              </span>
            </div>
          )}

          {/* Claim Button */}
          {validationResult?.isValid && (
            <div className="space-y-2">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet to Claim'}
                </button>
              ) : (
                <button
                  onClick={handleClaimFreebie}
                  disabled={isClaiming}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>{isClaiming ? 'Claiming...' : 'Claim Freebie'}</span>
                </button>
              )}
            </div>
          )}

          {/* Cancel Button */}
          <button
            onClick={() => {
              setShowClaimForm(false)
              setAccessToken('')
              setValidationResult(null)
            }}
            className="w-full bg-dark-600 hover:bg-dark-500 text-gray-300 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Error Display */}
      {accessTokenError && (
        <div className="bg-red-900/30 border border-red-500/30 p-3 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm">{accessTokenError}</span>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 bg-dark-800 p-2 rounded">
        <p>• Ask {username} for an access token to claim free creator tokens</p>
        <p>• Each access token can only be used once</p>
        <p>• You can only claim one freebie per creator</p>
        <p>• Access tokens are shared by creators with their community</p>
      </div>
    </div>
  )
}
