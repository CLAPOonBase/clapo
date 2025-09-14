"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, DollarSign, Users, Gift, User } from 'lucide-react';
import { useCreatorToken, CreatorTokenStats, CreatorPortfolio } from '../hooks/useCreatorToken';
import { useSession } from 'next-auth/react';
import WalletConnectButton from './WalletConnectButton';

interface CreatorTokenTradingProps {
  creatorUuid: string;
  creatorName: string;
  creatorImageUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorTokenTrading({ 
  creatorUuid, 
  creatorName, 
  creatorImageUrl, 
  isOpen, 
  onClose 
}: CreatorTokenTradingProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState(1);
  const [stats, setStats] = useState<CreatorTokenStats | null>(null);
  const [portfolio, setPortfolio] = useState<CreatorPortfolio | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [remainingFreebies, setRemainingFreebies] = useState(0);
  const [userCanClaimFreebie, setUserCanClaimFreebie] = useState(false);
  const [actualPrice, setActualPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { 
    buyCreatorTokens, 
    sellCreatorTokens, 
    getCurrentPrice, 
    getActualPrice,
    getCreatorStats, 
    getUserPortfolio, 
    getRemainingFreebies,
    canClaimFreebie,
    isConnected,
    loading,
    connectWallet,
    isConnecting,
    address,
    disconnectWallet
  } = useCreatorToken();

  const { data: session } = useSession();
  const userAddress = address; // Use wallet address instead of session address

  // Load creator token data
  useEffect(() => {
    if (isOpen && creatorUuid) {
      loadCreatorTokenData();
    }
  }, [isOpen, creatorUuid]);

  const loadCreatorTokenData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [price, actualPriceValue, creatorStats, freebies, canClaim] = await Promise.all([
        getCurrentPrice(creatorUuid),
        getActualPrice(creatorUuid),
        getCreatorStats(creatorUuid),
        getRemainingFreebies(creatorUuid),
        canClaimFreebie(creatorUuid, userAddress || '')
      ]);

      setCurrentPrice(price);
      setActualPrice(actualPriceValue);
      setStats(creatorStats);
      setRemainingFreebies(freebies);
      setUserCanClaimFreebie(canClaim);
      
      // Debug logging
      console.log('CreatorTokenTrading Debug:', {
        creatorUuid,
        price,
        actualPriceValue,
        freebies,
        canClaim,
        userAddress,
        stats: creatorStats
      });

      // Load user portfolio if connected
      if (userAddress) {
        const userPortfolio = await getUserPortfolio(creatorUuid, userAddress);
        setPortfolio(userPortfolio);
      }
    } catch (err) {
      setError('Failed to load creator token data');
      console.error('Error loading creator token data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to buy creator tokens');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await buyCreatorTokens(creatorUuid);
      setSuccess('Successfully bought creator tokens!');
      await loadCreatorTokenData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to buy creator tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to sell creator tokens');
      return;
    }

    if (!portfolio || portfolio.balance < amount) {
      setError('Insufficient tokens to sell');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sellCreatorTokens(creatorUuid, amount);
      setSuccess('Successfully sold creator tokens!');
      await loadCreatorTokenData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to sell creator tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(4)}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ 
          position: 'relative', 
          zIndex: 1000000,
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <User className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Creator Token Trading</h2>
              <p className="text-sm text-gray-400 truncate max-w-[200px]">{creatorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wallet Connection */}
          {!isConnected && (
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Connect Wallet</h3>
                  <p className="text-sm text-gray-400">Connect your wallet to trade creator tokens</p>
                </div>
                <WalletConnectButton
                  onConnect={connectWallet}
                  isConnecting={isConnecting}
                  isConnected={false}
                  size="md"
                />
              </div>
            </div>
          )}

          {/* Connected Wallet Info */}
          {isConnected && address && (
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-1">Wallet Connected</h3>
                  <p className="text-sm text-gray-400">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Current Price</span>
                </div>
                <p className="text-xl font-semibold text-white">{formatPrice(currentPrice)}</p>
                {remainingFreebies > 0 && actualPrice > 0 && (
                  <p className="text-xs text-gray-500">Actual: {formatPrice(actualPrice)}</p>
                )}
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Total Buyers</span>
                </div>
                <p className="text-xl font-semibold text-white">{formatNumber(stats.totalBuyers)}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Freebies Left</span>
                </div>
                <p className="text-xl font-semibold text-white">{formatNumber(remainingFreebies)}</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-400">Highest Price</span>
                </div>
                <p className="text-xl font-semibold text-white">{formatPrice(stats.highestPrice)}</p>
              </div>
            </div>
          )}

          {/* User Portfolio */}
          {portfolio && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Your Portfolio</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Tokens Owned</p>
                  <p className="text-lg font-semibold text-white">{portfolio.balance}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Value</p>
                  <p className="text-lg font-semibold text-white">{formatPrice(portfolio.currentValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Bought</p>
                  <p className="text-sm text-gray-300">{portfolio.totalBought}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Sold</p>
                  <p className="text-sm text-gray-300">{portfolio.totalSold}</p>
                </div>
              </div>
            </div>
          )}

          {/* Trading Tabs */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'buy'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy Tokens
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell Tokens
            </button>
          </div>

          {/* Trading Form */}
          <div className="space-y-4">
            {activeTab === 'buy' ? (
              <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">
                     Amount to Buy
                   </label>
                   <input
                     type="number"
                     min="1"
                     value={userCanClaimFreebie && remainingFreebies > 0 ? 1 : amount}
                     onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                     disabled={userCanClaimFreebie && remainingFreebies > 0}
                     className={`w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                       userCanClaimFreebie && remainingFreebies > 0 ? 'opacity-50 cursor-not-allowed' : ''
                     }`}
                   />
                   {userCanClaimFreebie && remainingFreebies > 0 && (
                     <p className="text-xs text-green-400 mt-1">
                       You can only claim 1 free token
                     </p>
                   )}
                 </div>
                
                 <div className="bg-gray-800/50 rounded-lg p-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-gray-400">Price per token</span>
                     <span className="text-sm font-medium text-white">
                       {userCanClaimFreebie && remainingFreebies > 0 ? 'FREE' : formatPrice(currentPrice)}
                     </span>
                   </div>
                   {userCanClaimFreebie && remainingFreebies > 0 && actualPrice > 0 && (
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-gray-500">Actual price</span>
                       <span className="text-xs text-gray-500">{formatPrice(actualPrice)}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-400">Total cost</span>
                     <span className="text-lg font-semibold text-white">
                       {userCanClaimFreebie && remainingFreebies > 0 ? 'FREE' : formatPrice(currentPrice * amount)}
                     </span>
                   </div>
                 </div>

                <button
                  onClick={handleBuy}
                  disabled={loading || !isConnected || (!userCanClaimFreebie && remainingFreebies > 0)}
                  className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                    userCanClaimFreebie && remainingFreebies > 0
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : !userCanClaimFreebie && remainingFreebies > 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  } ${loading || !isConnected ? 'disabled:bg-black disabled:cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 
                   userCanClaimFreebie && remainingFreebies > 0 ? 'Claim Free Token' :
                   !userCanClaimFreebie && remainingFreebies > 0 ? 'Already Claimed Freebie' :
                   'Buy Tokens'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Amount to Sell
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={portfolio?.balance || 0}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  {portfolio && (
                    <p className="text-xs text-gray-500 mt-1">
                      Max: {portfolio.balance} tokens
                    </p>
                  )}
                </div>
                
                 <div className="bg-gray-800/50 rounded-lg p-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-gray-400">Price per token</span>
                     <span className="text-sm font-medium text-white">{formatPrice(actualPrice)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-400">You'll receive</span>
                     <span className="text-lg font-semibold text-white">
                       {formatPrice(actualPrice * amount * 0.75)} {/* Assuming 25% fees */}
                     </span>
                   </div>
                 </div>

                <button
                  onClick={handleSell}
                  disabled={loading || !isConnected || !portfolio || portfolio.balance < amount || remainingFreebies > 0}
                  className={`w-full py-3 font-semibold rounded-lg transition-colors ${
                    remainingFreebies > 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } ${loading || !isConnected || !portfolio || portfolio.balance < amount ? 'disabled:bg-black disabled:cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processing...' : 
                   remainingFreebies > 0 ? 'Cannot sell until all freebies claimed' :
                   'Sell Tokens'}
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3">
              <p className="text-sm text-yellow-400">
                Please connect your wallet to trade creator tokens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

