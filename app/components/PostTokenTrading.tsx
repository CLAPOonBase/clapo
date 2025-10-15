"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, DollarSign, Users, Gift, Triangle } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [totalCost, setTotalCost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  

  const { data: session } = useSession();

  const { 
    buyShares, 
    sellShares, 
    getCurrentPrice, 
    getActualPrice,
    getBuyPriceForAmount,
    getSellPayoutForAmount,
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

  const userAddress = address; // Use wallet address instead of session address

  // Load post token data
  useEffect(() => {
    if (isOpen && postId) {
      loadPostTokenData();
    }
  }, [isOpen, postId]);

  // Calculate total cost when amount changes
  useEffect(() => {
    const calculateTotalCost = async () => {
      if (postId && amount > 0) {
        try {
          const tokenUuid = await getPostTokenUuid();
          const cost = await getBuyPriceForAmount(tokenUuid, amount);
          setTotalCost(cost);
        } catch (error) {
          console.error('Failed to calculate total cost:', error);
          // Fallback to flat pricing if quadratic pricing fails
          setTotalCost(currentPrice * amount);
        }
      }
    };

    calculateTotalCost();
  }, [amount, postId, getBuyPriceForAmount, currentPrice]);

  // Helper function to get the correct post token UUID
  const getPostTokenUuid = async (): Promise<string> => {
    // Now the postId IS the token UUID (they're the same!)
    return postId;
  };

  const loadPostTokenData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the correct post token UUID
      const tokenUuid = await getPostTokenUuid();
      
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
      
      // Debug logging removed for cleaner console

      // Load user portfolio if connected
      if (userAddress) {
        const userPortfolio = await getUserPortfolio(tokenUuid, userAddress);
        setPortfolio(userPortfolio);
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.message?.includes('Post with this UUID not found') || 
          err.reason?.includes('Post with this UUID not found')) {
        // Post doesn't exist on blockchain yet, show appropriate message
        setError('Post token not yet created on blockchain. Please wait or create the token first.');
      } else if (err.message?.includes('Contract not connected')) {
        setError('Please connect your wallet to view post token data');
      } else {
        setError('Failed to load post token data');
      }
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
      const tokenUuid = await getPostTokenUuid();
      await buyShares(tokenUuid, amount, session?.dbUser?.id);
      setSuccess(`Successfully bought ${amount} shares!`);
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
      const tokenUuid = await getPostTokenUuid();
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
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
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
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-black border-2 border-gray-700/70 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        style={{
          position: 'relative',
          zIndex: 1000000,
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-700/70">
          <h2 className="text-lg font-bold text-white">Trade Token</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
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
          <div className="bg-gray-700/50 rounded-full p-0.5">
            <div className="flex justify-around bg-black m-0.5 p-1 items-center rounded-full relative">
              <button
                onClick={() => setActiveTab('buy')}
                className={`p-2 my-1 font-semibold w-full relative z-10 text-sm ${
                  activeTab === 'buy' ? "text-white" : "text-gray-400"
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`p-2 my-1 font-semibold w-full relative z-10 text-sm ${
                  activeTab === 'sell' ? "text-white" : "text-gray-400"
                }`}
              >
                Sell
              </button>

              <motion.div
                className="absolute rounded-full"
                style={{
                  height: "40px",
                  boxShadow:
                    "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
                  backgroundColor: "#6E54FF",
                  margin: "6px",
                }}
                initial={false}
                animate={{
                  left: activeTab === 'buy' ? "0%" : "calc(50% + 0px)",
                  width: "calc(50% - 6px)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>
          </div>

          {/* Trading Form */}
          <div className="space-y-4">
            {activeTab === 'buy' ? (
              <div className="space-y-4">
                 <div>
                   <label className="block text-gray-400 text-sm font-semibold mb-2">
                     Amount to Buy
                   </label>
                   <input
                     type="number"
                     min="1"
                     value={userCanClaimFreebie && remainingFreebies > 0 ? 1 : amount}
                     onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                     disabled={userCanClaimFreebie && remainingFreebies > 0}
                     className={`w-full px-4 py-3 bg-black border-2 border-gray-700/70 rounded-xl text-white focus:outline-none focus:border-[#6E54FF] transition-colors font-medium ${
                       userCanClaimFreebie && remainingFreebies > 0 ? 'opacity-50 cursor-not-allowed' : ''
                     }`}
                   />
                   {userCanClaimFreebie && remainingFreebies > 0 && (
                     <p className="text-[#6E54FF] text-xs mt-2 font-medium">
                       You can only claim 1 free share
                     </p>
                   )}
                 </div>

                 <div className="bg-black border-2 border-gray-700/70 rounded-xl p-4 space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-400 text-sm">Price per share</span>
                     <span className="text-white text-sm font-bold">
                       {userCanClaimFreebie && remainingFreebies > 0 ? 'FREE' : formatPrice(currentPrice)}
                     </span>
                   </div>
                   {userCanClaimFreebie && remainingFreebies > 0 && actualPrice > 0 && (
                     <div className="flex justify-between items-center">
                       <span className="text-gray-500 text-xs">Actual price</span>
                       <span className="text-gray-500 text-xs">{formatPrice(actualPrice)}</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                     <span className="text-gray-400 text-sm">Total cost</span>
                     <span className="text-white text-lg font-bold tracking-tight">
                       {userCanClaimFreebie && remainingFreebies > 0 ? 'FREE' : formatPrice(totalCost)}
                     </span>
                   </div>
                   <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
                     <span className="text-gray-400 text-sm">Your Portfolio</span>
                     <span className="text-white text-lg font-bold tracking-tight">
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
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuy}
                    disabled={loading || (!userCanClaimFreebie && remainingFreebies > 0)}
                    className={`w-full py-3 font-bold tracking-tight rounded-xl transition-all duration-200 border-2 shadow-lg ${
                      userCanClaimFreebie && remainingFreebies > 0
                        ? 'bg-[#6E54FF] hover:bg-[#5940cc] text-white border-[#6E54FF]'
                        : !userCanClaimFreebie && remainingFreebies > 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-700/50'
                        : 'bg-[#6E54FF] hover:bg-[#5940cc] text-white border-[#6E54FF]'
                    } ${loading ? 'disabled:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-700/50' : ''}`}
                  >
                    {loading ? 'Processing...' :
                     userCanClaimFreebie && remainingFreebies > 0 ? 'Claim Free Share' :
                     !userCanClaimFreebie && remainingFreebies > 0 ? 'Already Claimed Freebie' :
                     'Buy Shares'}
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm font-semibold mb-2">
                    Amount to Sell
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={portfolio?.balance || 0}
                    value={amount}
                    onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 rounded-xl text-white focus:outline-none focus:border-[#6E54FF] transition-colors font-medium"
                  />
                  {portfolio && (
                    <p className="text-gray-500 text-xs mt-2 font-medium">
                      Max: {portfolio.balance} shares
                    </p>
                  )}
                </div>

                 <div className="bg-black border-2 border-gray-700/70 rounded-xl p-4 space-y-3">
                   <div className="flex justify-between items-center">
                     <span className="text-gray-400 text-sm">Price per share</span>
                     <span className="text-white text-sm font-bold">{formatPrice(actualPrice)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2 border-t border-gray-700/50">
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
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSell}
                    disabled={loading || !portfolio || portfolio.balance < amount || remainingFreebies > 0}
                    className={`w-full py-3 font-bold tracking-tight rounded-xl transition-all duration-200 border-2 shadow-lg ${
                      remainingFreebies > 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-700/50'
                        : 'bg-[#6E54FF] hover:bg-[#5940cc] text-white border-[#6E54FF]'
                    } ${loading || !portfolio || portfolio.balance < amount ? 'disabled:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-700/50' : ''}`}
                  >
                    {loading ? 'Processing...' :
                     remainingFreebies > 0 ? 'Cannot sell until all freebies claimed' :
                     'Sell Shares'}
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/20 border-2 border-red-500/30 rounded-xl p-4"
            >
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#6E54FF]/10 border-2 border-[#6E54FF]/30 rounded-xl p-4"
            >
              <p className="text-[#6E54FF] text-sm font-medium">{success}</p>
            </motion.div>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-4"
            >
              <p className="text-yellow-400 text-sm font-medium">
                Please connect your wallet to trade post tokens
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}