'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, DollarSign, Gift, ArrowUpRight, ArrowDownRight, Key } from 'lucide-react'
import { useCreatorToken } from '@/app/hooks/useCreatorToken'
import { useAccessTokens } from '@/app/hooks/useAccessTokens'
import { generateCreatorTokenUUID } from '@/app/lib/uuid'
import { AccessTokenClaim } from './AccessTokenClaim'
import { AccessTokenManager } from './AccessTokenManager'

interface CreatorTokenDisplayProps {
  userId: string
  username: string
  avatarUrl?: string
  isOwnProfile?: boolean
  forceShow?: boolean // Add prop to force show the component
}

export function CreatorTokenDisplay({ userId, username, avatarUrl, isOwnProfile = false, forceShow = false }: CreatorTokenDisplayProps) {
  const { 
    checkCreatorExists, 
    getCurrentPrice, 
    getCreatorStats, 
    getRemainingFreebies,
    buyCreatorTokens,
    sellCreatorTokens,
    getUserPortfolio,
    canClaimFreebie,
    isConnected,
    connectWallet,
    isConnecting,
    address
  } = useCreatorToken()

  const { hasUserUsedAccessToken } = useAccessTokens()

  const [tokenExists, setTokenExists] = useState(true) // Start with true since we know it exists
  const [currentPrice, setCurrentPrice] = useState(0)
  const [creatorStats, setCreatorStats] = useState<any>(null)
  const [remainingFreebies, setRemainingFreebies] = useState(1) // Default freebies
  const [userPortfolio, setUserPortfolio] = useState<any>(null)
  const [canClaim, setCanClaim] = useState(true) // Default to true
  const [loading, setLoading] = useState(false) // Start with false since we know token exists
  const [trading, setTrading] = useState(false)
  const [hasUsedAccessToken, setHasUsedAccessToken] = useState(false)
  const [showAccessTokenClaim, setShowAccessTokenClaim] = useState(false)

  const tokenUuid = generateCreatorTokenUUID(userId)
  

  useEffect(() => {
    const loadTokenData = async () => {
      if (!isConnected || !tokenUuid || !address) {
        return
      }
      
      try {
        const exists = await checkCreatorExists(tokenUuid)
        setTokenExists(exists)

        if (exists) {
          const [price, stats, freebies, portfolio, claimStatus, accessTokenUsed] = await Promise.all([
            getCurrentPrice(tokenUuid),
            getCreatorStats(tokenUuid),
            getRemainingFreebies(tokenUuid),
            getUserPortfolio(tokenUuid, address),
            canClaimFreebie(tokenUuid, address),
            hasUserUsedAccessToken(tokenUuid)
          ])

          setCurrentPrice(price)
          setCreatorStats(stats)
          setRemainingFreebies(freebies)
          setUserPortfolio(portfolio)
          setCanClaim(claimStatus)
          setHasUsedAccessToken(accessTokenUsed)
        }
      } catch (error) {
        console.error('Failed to load creator token data:', error)
      }
    }

    // Only load if we have the required data
    if (isConnected && tokenUuid && address) {
      loadTokenData()
    }
  }, [isConnected, tokenUuid, address, getCurrentPrice, getCreatorStats, getRemainingFreebies, getUserPortfolio, canClaimFreebie, checkCreatorExists])

  const refreshData = async () => {
    if (!isConnected || !tokenUuid || !address) return
    
    try {
      const [price, stats, freebies, portfolio, claimStatus, accessTokenUsed] = await Promise.all([
        getCurrentPrice(tokenUuid),
        getCreatorStats(tokenUuid),
        getRemainingFreebies(tokenUuid),
        getUserPortfolio(tokenUuid, address),
        canClaimFreebie(tokenUuid, address),
        hasUserUsedAccessToken(tokenUuid)
      ])

      setCurrentPrice(price)
      setCreatorStats(stats)
      setRemainingFreebies(freebies)
      setUserPortfolio(portfolio)
      setCanClaim(claimStatus)
      setHasUsedAccessToken(accessTokenUsed)
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  const handleBuy = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    setTrading(true)
    try {
      await buyCreatorTokens(tokenUuid)
      // Refresh data after successful purchase
      await refreshData()
    } catch (error) {
      console.error('Failed to buy creator tokens:', error)
      alert('Failed to buy tokens: ' + error.message)
    } finally {
      setTrading(false)
    }
  }

  const handleSell = async () => {
    if (!isConnected || !userPortfolio?.balance) return

    setTrading(true)
    try {
      await sellCreatorTokens(tokenUuid, 1) // Sell 1 token
      // Refresh data after successful sale
      await refreshData()
    } catch (error) {
      console.error('Failed to sell creator tokens:', error)
      alert('Failed to sell tokens: ' + error.message)
    } finally {
      setTrading(false)
    }
  }

  const handleClaimFreebie = async () => {
    if (!isConnected || !canClaim) return

    setTrading(true)
    try {
      await buyCreatorTokens(tokenUuid) // Freebie claim uses same function
      // Refresh data after successful claim
      await refreshData()
    } catch (error) {
      console.error('Failed to claim freebie:', error)
      alert('Failed to claim freebie: ' + error.message)
    } finally {
      setTrading(false)
    }
  }


  if (!tokenExists && !forceShow) {
    return (
      <div className="bg-dark-700 rounded-lg p-4 text-center">
        <div className="text-gray-400 mb-2">
          <TrendingUp className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No creator token available</p>
        </div>
        {isOwnProfile && (
          <p className="text-xs text-gray-500">Create your creator token to enable trading</p>
        )}
      </div>
    )
  }
  
  // If forceShow is true, show the component even if tokenExists is false
  // This allows the component to load data in the background

  return (
   <div className="bg-black/90 backdrop-blur-sm border-2 border-gray-700/70 rounded-2xl p-6 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={avatarUrl || "https://robohash.org/default.png"}
            alt={username}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-700/50"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://robohash.org/default.png";
            }}
          />
          <div>
            <h3 className="text-white font-bold tracking-tight text-lg">{username}'s Token</h3>
            <p className="text-gray-400 text-sm font-medium">Creator Token</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white tracking-tight">${(currentPrice / 1000000).toFixed(2)}</div>
          <div className="text-xs text-gray-400 font-medium">Current Price</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/50 backdrop-blur-sm border-2 border-gray-700/70 rounded-2xl p-4 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <div className="text-white font-bold text-lg tracking-tight">{creatorStats?.totalBuyers || 0}</div>
          <div className="text-xs text-gray-400 font-medium">Total Buyers</div>
        </div>
        <div className="bg-black/50 backdrop-blur-sm border-2 border-gray-700/70 rounded-2xl p-4 text-center">
          <Gift className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <div className="text-white font-bold text-lg tracking-tight">{remainingFreebies}</div>
          <div className="text-xs text-gray-400 font-medium">Free Shares</div>
        </div>
      </div>

      {/* User Portfolio (if connected) */}
      {isConnected && userPortfolio && (
        <div className="bg-black/50 backdrop-blur-sm border-2 border-gray-700/70 rounded-2xl p-4">
          <div className="text-gray-400 text-sm font-bold tracking-wide mb-3">YOUR PORTFOLIO</div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 font-medium">Balance:</span>
              <span className="text-white ml-2 font-bold">{userPortfolio.balance || 0}</span>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Value:</span>
              <span className="text-white ml-2 font-bold">${((userPortfolio.currentValue || 0) / 1000000).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trading Buttons */}
      <div className="space-y-3">
        {!isConnected ? (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-4 rounded-2xl font-bold tracking-tight transition-colors border-2 border-blue-500/30 disabled:border-gray-500/30"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet to Trade'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Buy/Claim Button - Prioritizes Access Token Claim */}
            {!hasUsedAccessToken && !isOwnProfile && remainingFreebies > 0 ? (
              <button
                onClick={() => setShowAccessTokenClaim(!showAccessTokenClaim)}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-3 rounded-2xl font-bold tracking-tight transition-colors border-2 border-green-500/30 flex items-center justify-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>Enter Access Token Given by Creator</span>
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={trading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-3 rounded-2xl font-bold tracking-tight transition-colors border-2 border-green-500/30 disabled:border-gray-500/30 flex items-center justify-center space-x-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{trading ? 'Buying...' : 'Buy Shares'}</span>
              </button>
            )}
            
            {/* Sell Button */}
            {userPortfolio?.balance > 0 && (
              <button
                onClick={handleSell}
                disabled={trading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-3 rounded-2xl font-bold tracking-tight transition-colors border-2 border-red-500/30 disabled:border-gray-500/30 flex items-center justify-center space-x-2"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>{trading ? 'Selling...' : 'Sell Shares'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price Info */}
      <div className="bg-black/50 backdrop-blur-sm border-2 border-gray-700/70 rounded-2xl p-4">
        <p className="text-gray-400 text-xs font-medium mb-1">
          Quadratic pricing: Price increases with each purchase
        </p>
        <p className="text-gray-400 text-xs font-medium">
          Early buyers get better prices
        </p>
      </div>

      {/* Access Token Claim Component */}
      {showAccessTokenClaim && !isOwnProfile && (
        <div className="mt-4">
          <AccessTokenClaim
            userId={userId}
            username={username}
            avatarUrl={avatarUrl}
          />
        </div>
      )}

      {/* Access Token Manager for Own Profile */}
      {isOwnProfile && (
        <div className="mt-4">
          <AccessTokenManager
            userId={userId}
            username={username}
            isOwnProfile={isOwnProfile}
          />
        </div>
      )}
    </div>
  )
}
