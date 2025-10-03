"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, DollarSign, Users, Gift, Triangle } from 'lucide-react';
import { usePostToken, PostTokenStats, UserPortfolio } from '../hooks/usePostToken';
import { useSession } from 'next-auth/react';
import WalletConnectButton from './WalletConnectButton';

interface PostTokenTradingProps {
  postId: string;
  postContent: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostTokenTrading({ postId, postContent, isOpen, onClose }: PostTokenTradingProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState(1);
  const [stats, setStats] = useState<PostTokenStats | null>(null);
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [remainingFreebies, setRemainingFreebies] = useState(0);
  const [userCanClaimFreebie, setUserCanClaimFreebie] = useState(false);
  const [actualPrice, setActualPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  

  const { 
    buyShares, 
    sellShares, 
    getCurrentPrice, 
    getActualPrice,
    getPostStats, 
    getUserPortfolio, 
    getRemainingFreebies,
    canClaimFreebie,
    isConnected,
    loading,
    connectWallet,
    isConnecting,
    address,
    disconnectWallet
  } = usePostToken();

  const { data: session } = useSession();
  const userAddress = address; // Use wallet address instead of session address

  // Load post token data
  useEffect(() => {
    if (isOpen && postId) {
      loadPostTokenData();
    }
  }, [isOpen, postId]);

  const loadPostTokenData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate the UUID that was used during token creation
      const tokenUuid = `post-${postId}`;
      
      const [price, actualPriceValue, postStats, freebies, canClaim] = await Promise.all([
        getCurrentPrice(tokenUuid),
        getActualPrice(tokenUuid),
        getPostStats(tokenUuid),
        getRemainingFreebies(tokenUuid),
        canClaimFreebie(tokenUuid, userAddress || '')
      ]);

      setCurrentPrice(price);
      setActualPrice(actualPriceValue);
      setStats(postStats);
      setRemainingFreebies(freebies);
      setUserCanClaimFreebie(canClaim);
      
      // Debug logging
      console.log('PostTokenTrading Debug:', {
        postId,
        price,
        actualPriceValue,
        freebies,
        canClaim,
        userAddress,
        stats: postStats
      });

      // Load user portfolio if connected
      if (userAddress) {
        const userPortfolio = await getUserPortfolio(tokenUuid, userAddress);
        setPortfolio(userPortfolio);
      }
    } catch (err) {
      setError('Failed to load post token data');
      console.error('Error loading post token data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to buy shares');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tokenUuid = `post-${postId}`;
      await buyShares(tokenUuid);
      setSuccess('Successfully bought shares!');
      await loadPostTokenData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to buy shares');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to sell shares');
      return;
    }

    if (!portfolio || portfolio.balance < amount) {
      setError('Insufficient shares to sell');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const tokenUuid = `post-${postId}`;
      await sellShares(tokenUuid, amount);
      setSuccess('Successfully sold shares!');
      await loadPostTokenData(); // Refresh data
    } catch (err: any) {
      setError(err.message || 'Failed to sell shares');
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
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
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
        className="bg-black/90 backdrop-blur-sm rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-700/70"
        style={{ 
          position: 'relative', 
          zIndex: 1000000,
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-gray-700/70">
  <span></span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 "
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wallet Connection */}
          {/* {!isConnected && (
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-lg font-bold tracking-tight mb-1">Connect Wallet</h3>
                  <p className="text-gray-400 text-sm">Connect your wallet to trade post tokens</p>
                </div>
                <WalletConnectButton
                  onConnect={connectWallet}
                  isConnecting={isConnecting}
                  isConnected={false}
                  size="md"
                />
              </div>
            </div>
          )} */}

          {/* Connected Wallet Info */}
          {/* {isConnected && address && (
            <div className="bg-green-900/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-500/30 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-green-400 text-lg font-bold tracking-tight mb-1">Wallet Connected</h3>
                  <p className="text-gray-400 text-sm">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium border border-red-500/30"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )} */}

          {/* Stats Overview */}
          {/* {stats && (
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-green-400" />
                    <span className="text-gray-400 text-xs">Price</span>
                  </div>
                  <p className="text-white text-sm font-bold">{formatPrice(currentPrice)}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-400 text-xs">Buyers</span>
                  </div>
                  <p className="text-white text-sm font-bold">{formatNumber(stats.totalBuyers)}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Gift className="w-3 h-3 text-purple-400" />
                    <span className="text-gray-400 text-xs">Freebies</span>
                  </div>
                  <p className="text-white text-sm font-bold">{formatNumber(remainingFreebies)}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-orange-400" />
                    <span className="text-gray-400 text-xs">Peak</span>
                  </div>
                  <p className="text-white text-sm font-bold">{formatPrice(stats.highestPrice)}</p>
                </div>
              </div>
            </div>
          )} */}

          {/* User Portfolio */}
          {/* {isConnected && portfolio && (
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-3">
              <h3 className="text-gray-400 text-xs font-bold tracking-wide mb-2 text-center">PORTFOLIO</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <p className="text-gray-500 text-xs">Owned</p>
                  <p className="text-white text-sm font-bold">{portfolio.balance}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Value</p>
                  <p className="text-white text-sm font-bold">{formatPrice(portfolio.currentValue)}</p>
                </div>
              </div>
            </div>
          )} */}

          {/* Trading Tabs */}
          <div className='bg-gray-700/70 p-1 rounded-full'>
            <div className="flex bg-black backdrop-blur-sm rounded-full p-1">
              <button
                onClick={() => setActiveTab('buy')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold tracking-tight transition-colors ${
                  activeTab === 'buy'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-bold tracking-tight transition-colors ${
                  activeTab === 'sell'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Trading Form */}
          <div className="space-y-4">
            {activeTab === 'buy' ? (
              <div className="space-y-4">
                 <div>
                   <label className="block text-gray-400 text-sm font-bold tracking-wide mb-2">
                     AMOUNT TO BUY
                   </label>
                   <input
                     type="number"
                     min="1"
                     value={userCanClaimFreebie && remainingFreebies > 0 ? 1 : amount}
                     onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                     disabled={userCanClaimFreebie && remainingFreebies > 0}
                     className={`w-full px-4 py-3 bg-black/50 border-2 border-gray-700 backdrop-blur-sm rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                       userCanClaimFreebie && remainingFreebies > 0 ? 'opacity-50 cursor-not-allowed' : ''
                     }`}
                   />
                   {userCanClaimFreebie && remainingFreebies > 0 && (
                     <p className="text-green-400 text-xs mt-1 font-medium">
                       You can only claim 1 free share
                     </p>
                   )}
                 </div>
                
                 <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-gray-400 text-sm">Price per share</span>
                     <span className="text-white text-sm font-bold">
                       {userCanClaimFreebie && remainingFreebies > 0 ? 'FREE' : formatPrice(currentPrice)}
                     </span>
                   </div>
                   {userCanClaimFreebie && remainingFreebies > 0 && actualPrice > 0 && (
                     <div className="flex justify-between items-center mb-2">
                       <span className="text-gray-500 text-xs">Actual price</span>
                       <span className="text-gray-500 text-xs">{formatPrice(actualPrice)}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center">
                     <span className="text-gray-400 text-sm">Total cost</span>
                     <span className="text-white text-lg font-bold tracking-tight">
                       {userCanClaimFreebie && remainingFreebies > 0 ? 'FREE' : formatPrice(currentPrice * amount)}
                     </span>
                   </div>
                      <div className="flex justify-between items-center">
                     <span className="text-gray-400 text-sm">Your Porfolio</span>
                     <span className="text-white text-lg font-bold tracking-tight">
                      {/* user portfolio balance i want  */}
                        {portfolio ? formatPrice(portfolio.currentValue) : '$0.0000'}
                        
                     </span>
                   </div>
                 </div>

                {/* Buy Button - Show Connect Wallet if not connected */}
                {!isConnected ? (
                  <WalletConnectButton
                    onConnect={connectWallet}
                    isConnecting={isConnecting}
                    isConnected={false}
                    size="lg"
                    className="w-full py-3 font-bold tracking-tight rounded-2xl border-2 border-blue-500/30"
                  />
                ) : (
                  <button
                    onClick={handleBuy}
                    disabled={loading || (!userCanClaimFreebie && remainingFreebies > 0)}
                    className={`w-full py-3 font-bold tracking-tight rounded-2xl transition-colors border-2 ${
                      userCanClaimFreebie && remainingFreebies > 0
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30'
                        : !userCanClaimFreebie && remainingFreebies > 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-700/50'
                        : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30'
                    } ${loading ? 'disabled:bg-black disabled:cursor-not-allowed disabled:border-gray-700/50' : ''}`}
                  >
                    {loading ? 'Processing...' : 
                     userCanClaimFreebie && remainingFreebies > 0 ? 'Claim Free Share' :
                     !userCanClaimFreebie && remainingFreebies > 0 ? 'Already Claimed Freebie' :
                     'Buy Shares'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-bold tracking-wide mb-2">
                    AMOUNT TO SELL
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={portfolio?.balance || 0}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-black/50 border-2 border-gray-700 backdrop-blur-sm rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                  />
                  {portfolio && (
                    <p className="text-gray-500 text-xs mt-1 font-medium">
                      Max: {portfolio.balance} shares
                    </p>
                  )}
                </div>
                
                 <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-gray-400 text-sm">Price per share</span>
                     <span className="text-white text-sm font-bold">{formatPrice(actualPrice)}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-gray-400 text-sm">You'll receive</span>
                     <span className="text-white text-lg font-bold tracking-tight">
                       {formatPrice(actualPrice * amount * 0.75)} {/* Assuming 25% fees */}
                     </span>
                   </div>
                 </div>

                {/* Sell Button - Show Connect Wallet if not connected */}
                {!isConnected ? (
                  <WalletConnectButton
                    onConnect={connectWallet}
                    isConnecting={isConnecting}
                    isConnected={false}
                    size="lg"
                    className="w-full py-3 font-bold tracking-tight rounded-2xl border-2 border-red-500/30"
                  />
                ) : (
                  <button
                    onClick={handleSell}
                    disabled={loading || !portfolio || portfolio.balance < amount || remainingFreebies > 0}
                    className={`w-full py-3 font-bold tracking-tight rounded-2xl transition-colors border-2 ${
                      remainingFreebies > 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-700/50'
                        : 'bg-red-600 hover:bg-red-700 text-white border-red-500/30'
                    } ${loading || !portfolio || portfolio.balance < amount ? 'disabled:bg-black disabled:cursor-not-allowed disabled:border-gray-700/50' : ''}`}
                  >
                    {loading ? 'Processing...' : 
                     remainingFreebies > 0 ? 'Cannot sell until all freebies claimed' :
                     'Sell Shares'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900/20 backdrop-blur-sm border-2 border-red-500/30 rounded-2xl p-3">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 backdrop-blur-sm border-2 border-green-500/30 rounded-2xl p-3">
              <p className="text-green-400 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-900/20 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl p-3">
              <p className="text-yellow-400 text-sm font-medium">
                Please connect your wallet to trade post tokens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}