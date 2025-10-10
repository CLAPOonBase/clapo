"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, DollarSign, Users, Gift, User, Key, Minus, Plus } from 'lucide-react';
import { useCreatorToken, CreatorTokenStats, CreatorPortfolio } from '../hooks/useCreatorToken';
import { useAccessTokens } from '../hooks/useAccessTokens';
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
  
  // Access token states
  const [accessToken, setAccessToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    tokenData?: any;
  } | null>(null);
  const [hasUsedAccessToken, setHasUsedAccessToken] = useState(false);
  const [isAccessTokenValid, setIsAccessTokenValid] = useState(false);

  const { 
    buyCreatorTokens, 
    sellCreatorTokens, 
    getCurrentPrice, 
    getActualPrice,
    getCreatorStats, 
    getUserPortfolio, 
    getRemainingFreebies,
    canClaimFreebie,
    checkCreatorExists,
    isConnected,
    loading,
    connectWallet,
    isConnecting,
    address,
    disconnectWallet
  } = useCreatorToken();

  const {
    claimAccessToken,
    validateAccessToken,
    hasUserUsedAccessToken,
  } = useAccessTokens();

  const { data: session } = useSession();
  const userAddress = address; // Use wallet address instead of session address

  // Load creator token data
  useEffect(() => {
    if (isOpen && creatorUuid && isConnected) {
      // Add a small delay to ensure the contract is fully initialized
      const timer = setTimeout(() => {
        loadCreatorTokenData();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, creatorUuid, isConnected]);

  const loadCreatorTokenData = async (retryCount = 0) => {
    if (!isConnected) {
      setError('Please connect your wallet to view token data');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // First check if creator exists (this function works)
      console.log('🔍 Checking if creator exists first...');
      const exists = await checkCreatorExists(creatorUuid);
      console.log('🔍 Creator exists:', exists);
      
      if (!exists) {
        setError('Creator token does not exist');
        return;
      }
      
      console.log('🔍 Loading creator token data...');
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
        
        // Check if user has used access token
        const hasUsed = await hasUserUsedAccessToken(creatorUuid);
        setHasUsedAccessToken(hasUsed);
      }
    } catch (err) {
      console.error('Error loading creator token data:', err);
      
      // Retry once if it's a contract connection error
      if (retryCount === 0 && err instanceof Error && err.message.includes('Contract not connected')) {
        console.log('Retrying loadCreatorTokenData...');
        setTimeout(() => loadCreatorTokenData(1), 2000);
        return;
      }
      
      setError('Failed to load creator token data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to buy creator tokens');
      return;
    }

    // If claiming freebie, use access token
    if (userCanClaimFreebie && remainingFreebies > 0 && isAccessTokenValid) {
      await handleClaimWithAccessToken();
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await buyCreatorTokens(creatorUuid, session?.dbUser?.id);
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

  const handleValidateAccessToken = async () => {
    if (!accessToken.trim()) {
      setValidationResult({
        isValid: false,
        message: 'Please enter an access token'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const tokenData = await validateAccessToken(accessToken.trim());
      
      if (tokenData) {
        if (tokenData.is_used) {
          setValidationResult({
            isValid: false,
            message: 'This access token has already been used'
          });
        } else if (tokenData.creator_token_uuid !== creatorUuid) {
          setValidationResult({
            isValid: false,
            message: 'This access token is not valid for this creator'
          });
        } else {
          setValidationResult({
            isValid: true,
            message: 'Access token is valid! You can claim your freebie.',
            tokenData
          });
          setIsAccessTokenValid(true);
        }
      } else {
        setValidationResult({
          isValid: false,
          message: 'Invalid access token'
        });
        setIsAccessTokenValid(false);
      }
    } catch (err) {
      setValidationResult({
        isValid: false,
        message: err instanceof Error ? err.message : 'Failed to validate token'
      });
      setIsAccessTokenValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClaimWithAccessToken = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to claim freebie');
      return;
    }

    if (!validationResult?.isValid || !accessToken.trim()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // First, use the access token
      await claimAccessToken(accessToken.trim());
      
      // Then, claim the freebie through the smart contract
      await buyCreatorTokens(creatorUuid);
      
      // Reset form
      setAccessToken('');
      setValidationResult(null);
      setHasUsedAccessToken(true);
      
      setSuccess('Successfully claimed your free creator tokens!');
      await loadCreatorTokenData(); // Refresh data
    } catch (err: any) {
      setError('Failed to claim freebie: ' + (err.message || 'Unknown error'));
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

  const resetAccessTokenState = () => {
    setAccessToken('');
    setValidationResult(null);
    setIsAccessTokenValid(false);
  };

  // Reset access token state when modal closes or tab changes
  useEffect(() => {
    if (!isOpen) {
      resetAccessTokenState();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeTab !== 'buy') {
      resetAccessTokenState();
    }
  }, [activeTab]);

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
        className="bg-black/90 backdrop-blur-sm rounded-2xl  max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-gray-700/70 "
        style={{ 
          position: 'relative', 
          zIndex: 1000000,
          margin: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-700/70">
          <h2 className="text-white text-xl font-bold tracking-tight">Buy Tickets</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors border border-gray-700/50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Wallet Connection */}
          {!isConnected && (
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4  shadow-2xl shadow-custom-purple">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-lg font-bold tracking-tight mb-1">Connect Wallet</h3>
                  <p className="text-gray-400 text-sm">Connect your wallet to trade creator tokens</p>
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
          )}

          {/* You Own Section */}
          <div className="mb-4">
            <div className="text-gray-400 text-sm font-medium">YOU OWN: {portfolio?.balance || 0}</div>
          </div>

          {/* User Profile Card */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={creatorImageUrl || '/4.png'}
                alt={creatorName}
                className="w-12 h-12 rounded-full border border-gray-600"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/4.png';
                }}
              />
              <div className="flex-1">
                <div className="text-white font-semibold">@{creatorName}</div>
                <div className="text-gray-400 text-sm">{stats?.totalBuyers || 0} Followers</div>
              </div>
              <div className="text-right">
                <div className="text-red-400 text-sm">{formatPrice(currentPrice)}</div>
                <div className="text-green-400 text-sm">0%</div>
              </div>
            </div>
          </div>

          {/* Balance and Fee Info */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm">
              <span className="text-gray-400">BALANCE: </span>
              <span className="text-white">{formatPrice(portfolio?.currentValue || 0)}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">TOTAL FEE: </span>
              <span className="text-white">10%</span>
            </div>
          </div>

          {/* Stats Overview */}
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 ">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400 text-sm font-medium">Current Price</span>
                </div>
                <p className="text-white text-xl font-bold tracking-tight">{formatPrice(currentPrice)}</p>
                {remainingFreebies > 0 && actualPrice > 0 && (
                  <p className="text-gray-500 text-xs">Actual: {formatPrice(actualPrice)}</p>
                )}
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 ">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-400 text-sm font-medium">Total Buyers</span>
                </div>
                <p className="text-white text-xl font-bold tracking-tight">{formatNumber(stats.totalBuyers)}</p>
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 ">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-purple-400" />
                  <span className="text-gray-400 text-sm font-medium">Freebies Left</span>
                </div>
                <p className="text-white text-xl font-bold tracking-tight">{formatNumber(remainingFreebies)}</p>
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 ">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <span className="text-gray-400 text-sm font-medium">Highest Price</span>
                </div>
                <p className="text-white text-xl font-bold tracking-tight">{formatPrice(stats.highestPrice)}</p>
              </div>
            </div>
          )}

          {/* User Portfolio */}
          {portfolio && (
            <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 ">
              <h3 className="text-gray-400 text-sm font-bold tracking-wide mb-3">YOUR PORTFOLIO</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs">Shares Owned</p>
                  <p className="text-white text-lg font-bold tracking-tight">{portfolio.balance}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Current Value</p>
                  <p className="text-white text-lg font-bold tracking-tight">{formatPrice(portfolio.currentValue)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Bought</p>
                  <p className="text-gray-300 text-sm">{portfolio.totalBought}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Total Sold</p>
                  <p className="text-gray-300 text-sm">{portfolio.totalSold}</p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                disabled={loading}
              >
                <Minus className="w-5 h-5 text-white" />
              </button>
              <div className="text-white text-2xl font-semibold">{amount.toFixed(2)}</div>
              <button
                onClick={() => setAmount(amount + 1)}
                className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
                disabled={loading}
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Buy/Sell Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleBuy}
              disabled={loading || !isConnected}
              className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-full py-4 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Buy</span>
              <span>{formatPrice(currentPrice)}</span>
            </button>
            <button
              onClick={handleSell}
              disabled={loading || !isConnected || !portfolio || portfolio.balance < amount}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white text-sm font-medium rounded-full py-4 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Sell</span>
              <span>{formatPrice(actualPrice)}</span>
            </button>
          </div>

          {/* Keep wallet connect functionality */}
          <div className="hidden">
            {false ? (
              <div className="space-y-4">
                {/* Coupon/Access Token Section */}
                {remainingFreebies > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <Key className="w-4 h-4 mr-2" />
                      Apply Freebie Access Token
                    </h4>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value)}
                          placeholder="Enter freebie access token..."
                          className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                          disabled={isValidating}
                        />
                        <button
                          onClick={handleValidateAccessToken}
                          disabled={isValidating || !accessToken.trim()}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {isValidating ? 'Validating...' : 'Apply'}
                        </button>
                      </div>
                      
                      {/* Validation Result */}
                      {validationResult && (
                        <div className={`p-2 rounded-lg text-sm ${
                          validationResult.isValid 
                            ? 'bg-green-900/30 text-green-400 border border-green-500/30' 
                            : 'bg-red-900/30 text-red-400 border border-red-500/30'
                        }`}>
                          {validationResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                     className={`w-full px-4 py-3 bg-black/50 border border-gray-700 backdrop-blur-sm  rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                       userCanClaimFreebie && remainingFreebies > 0 ? 'opacity-50 cursor-not-allowed' : ''
                     }`}
                   />
                   {userCanClaimFreebie && remainingFreebies > 0 && (
                     <p className="text-green-400 text-xs mt-1 font-medium">
                       You can only claim 1 free share
                     </p>
                   )}
                 </div>
                
                 <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 ">
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
                 </div>

                <button
                  onClick={handleBuy}
                  disabled={loading || !isConnected || (remainingFreebies > 0 && !isAccessTokenValid)}
                  className={`w-full py-3 font-bold tracking-tight rounded-2xl transition-colors border-2 ${
                    remainingFreebies > 0 && !isAccessTokenValid
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-700/50'
                      : userCanClaimFreebie && remainingFreebies > 0 && isAccessTokenValid
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-500/30'
                      : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500/30'
                  } ${loading || !isConnected ? 'disabled:bg-black disabled:cursor-not-allowed disabled:border-gray-700/50' : ''}`}
                >
                  {loading ? 'Processing...' : 
                   remainingFreebies > 0 && !isAccessTokenValid ? (
                     <div className="flex items-center justify-center space-x-2">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                       </svg>
                       <span>Claim Free Share (Locked)</span>
                     </div>
                   ) :
                   userCanClaimFreebie && remainingFreebies > 0 && isAccessTokenValid ? 'Claim Free Share' :
                   'Buy Shares'}
                </button>
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
                    className="w-full px-4 py-3 bg-black/50 border-2 border-gray-700 backdrop-blur-sm  rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium"
                  />
                  {portfolio && (
                    <p className="text-gray-500 text-xs mt-1 font-medium">
                      Max: {portfolio.balance} shares
                    </p>
                  )}
                </div>
                
                 <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 ">
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

                <button
                  onClick={handleSell}
                  disabled={loading || !isConnected || !portfolio || portfolio.balance < amount || remainingFreebies > 0}
                  className={`w-full py-3 font-bold tracking-tight rounded-2xl transition-colors border-2 ${
                    remainingFreebies > 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed border-gray-700/50'
                      : 'bg-red-600 hover:bg-red-700 text-white border-red-500/30'
                  } ${loading || !isConnected || !portfolio || portfolio.balance < amount ? 'disabled:bg-black disabled:cursor-not-allowed disabled:border-gray-700/50' : ''}`}
                >
                   {loading ? 'Processing...' : 
                    remainingFreebies > 0 ? 'Cannot sell until all freebies claimed' :
                    'Sell Shares'}
                </button>
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

