'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, Users, DollarSign, Gift, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useCreatorToken } from '@/app/hooks/useCreatorToken'
import { generateCreatorTokenUUID } from '@/app/lib/uuid'

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

  const [tokenExists, setTokenExists] = useState(true) // Start with true since we know it exists
  const [currentPrice, setCurrentPrice] = useState(0)
  const [creatorStats, setCreatorStats] = useState<any>(null)
  const [remainingFreebies, setRemainingFreebies] = useState(100) // Default freebies
  const [userPortfolio, setUserPortfolio] = useState<any>(null)
  const [canClaim, setCanClaim] = useState(true) // Default to true
  const [loading, setLoading] = useState(false) // Start with false since we know token exists
  const [trading, setTrading] = useState(false)

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
          const [price, stats, freebies, portfolio, claimStatus] = await Promise.all([
            getCurrentPrice(tokenUuid),
            getCreatorStats(tokenUuid),
            getRemainingFreebies(tokenUuid),
            getUserPortfolio(tokenUuid, address),
            canClaimFreebie(tokenUuid, address)
          ])

          setCurrentPrice(price)
          setCreatorStats(stats)
          setRemainingFreebies(freebies)
          setUserPortfolio(portfolio)
          setCanClaim(claimStatus)
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
      const [price, stats, freebies, portfolio, claimStatus] = await Promise.all([
        getCurrentPrice(tokenUuid),
        getCreatorStats(tokenUuid),
        getRemainingFreebies(tokenUuid),
        getUserPortfolio(tokenUuid, address),
        canClaimFreebie(tokenUuid, address)
      ])

      setCurrentPrice(price)
      setCreatorStats(stats)
      setRemainingFreebies(freebies)
      setUserPortfolio(portfolio)
      setCanClaim(claimStatus)
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
    <div className="bg-dark-700 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h3 className="text-white font-semibold">{username}'s Token</h3>
            <p className="text-gray-400 text-sm">Creator Token</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">${(currentPrice / 1000000).toFixed(2)}</div>
          <div className="text-xs text-gray-400">Current Price</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-white font-semibold">{creatorStats?.totalBuyers || 0}</div>
          <div className="text-xs text-gray-400">Total Buyers</div>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <Gift className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-white font-semibold">{remainingFreebies}</div>
          <div className="text-xs text-gray-400">Free Shares</div>
        </div>
      </div>

      {/* User Portfolio (if connected) */}
      {isConnected && userPortfolio && (
        <div className="bg-dark-800 rounded-lg p-3">
          <div className="text-sm text-gray-400 mb-2">Your Portfolio</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Balance:</span>
              <span className="text-white ml-2">{userPortfolio.balance || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">Value:</span>
              <span className="text-white ml-2">${((userPortfolio.currentValue || 0) / 1000000).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Trading Buttons */}
      <div className="space-y-2">
        {!isConnected ? (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet to Trade'}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {canClaim && remainingFreebies > 0 ? (
              <button
                onClick={handleClaimFreebie}
                disabled={trading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <Gift className="w-4 h-4" />
                <span>{trading ? 'Claiming...' : 'Claim Free'}</span>
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={trading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{trading ? 'Buying...' : 'Buy'}</span>
              </button>
            )}
            
            {userPortfolio?.balance > 0 && (
              <button
                onClick={handleSell}
                disabled={trading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>{trading ? 'Selling...' : 'Sell'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Price Info */}
      <div className="text-xs text-gray-500 bg-dark-800 p-2 rounded">
        <p>Quadratic pricing: Price increases with each purchase</p>
        <p>Early buyers get better prices</p>
      </div>
    </div>
  )
}
