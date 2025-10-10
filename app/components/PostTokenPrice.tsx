"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, Gift } from 'lucide-react';
import { usePostToken, PostTokenStats } from '../hooks/usePostToken';
import WalletConnectButton from './WalletConnectButton';

interface PostTokenPriceProps {
  postId: string;
  postContent: string;
  onTradeClick: () => void;
}

export default function PostTokenPrice({ postId, postContent, onTradeClick }: PostTokenPriceProps) {
  const [stats, setStats] = useState<PostTokenStats | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [remainingFreebies, setRemainingFreebies] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const { 
    getCurrentPrice, 
    getActualPrice,
    getPostStats, 
    getRemainingFreebies,
    canClaimFreebie,
    checkPostTokenExists,
    isConnected,
    connectWallet,
    isConnecting,
    address,
    disconnectWallet
  } = usePostToken();

  useEffect(() => {
    if (isConnected) {
      loadTokenData();
    } else {
      setIsLoading(false);
      setHasToken(false);
    }
  }, [postId, isConnected]);

  const loadTokenData = async () => {
    if (!isConnected) {
      console.log(`Not connected to wallet, skipping token data load for post: ${postId}`);
      return;
    }
    
    console.log(`🔍 Starting token data load for post: ${postId}`);
    console.log(`Wallet connection status:`, { isConnected, address, isConnecting });
    
    setIsLoading(true);
    try {
      console.log(`📋 Step 1: Checking if post has a token...`);
      
      // Check if post has a token
      // Generate the UUID that was used during token creation
      const tokenUuid = `post-${postId}`;
      const exists = await checkPostTokenExists(tokenUuid);
      console.log(`✅ Post ${postId} token exists:`, exists);
      setHasToken(exists);

      if (exists) {
        console.log(`📊 Step 2: Loading token stats for post: ${postId}`);
        try {
          console.log(`📊 Step 2a: Getting current price...`);
          const price = await getCurrentPrice(tokenUuid);
          console.log(`💰 Current price:`, price);
          
          console.log(`📊 Step 2b: Getting post stats...`);
          const postStats = await getPostStats(tokenUuid);
          console.log(`📈 Post stats:`, postStats);
          
          console.log(`📊 Step 2c: Getting remaining freebies...`);
          const freebies = await getRemainingFreebies(tokenUuid);
          console.log(`🎁 Remaining freebies:`, freebies);

          console.log(`✅ Token data loaded successfully for post ${postId}:`, { 
            price, 
            postStats, 
            freebies,
            hasToken: true
          });
          
          setCurrentPrice(price);
          setStats(postStats);
          setRemainingFreebies(freebies);
        } catch (error) {
          console.error(`❌ Error loading token data for post ${postId}:`, error);
          console.error(`Error details:`, {
            message: error.message,
            code: error.code,
            reason: error.reason,
            stack: error.stack
          });
          // If loading fails, treat as no token
          setHasToken(false);
          setCurrentPrice(0);
          setStats(null);
          setRemainingFreebies(0);
        }
      } else {
        console.log(`❌ Post ${postId} has no token`);
        setCurrentPrice(0);
        setStats(null);
        setRemainingFreebies(0);
      }
    } catch (error) {
      console.error(`❌ Error checking token existence for post ${postId}:`, error);
      console.error(`Error details:`, {
        message: error.message,
        code: error.code,
        reason: error.reason,
        stack: error.stack
      });
      setHasToken(false);
      setCurrentPrice(0);
      setStats(null);
      setRemainingFreebies(0);
    } finally {
      setIsLoading(false);
      console.log(`🏁 Finished loading token data for post: ${postId}`);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
        <div className="animate-pulse">
          <div className="h-4 bg-black rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-black rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Show connect wallet button if not connected
  if (!isConnected) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-600/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-400">Connect Wallet</div>
              <div className="text-xs text-gray-500">To view token prices</div>
              <div className="text-xs text-gray-600">Post ID: {postId}</div>
            </div>
          </div>
          <WalletConnectButton
            onConnect={connectWallet}
            isConnecting={isConnecting}
            isConnected={false}
            size="sm"
          />
        </div>
      </div>
    );
  }

  if (!hasToken) {
    // Show debug info for posts without tokens
    return (
      <div className="bg-gray-800/20 rounded-lg p-2 border border-gray-700/30">
        <div className="text-xs text-gray-500">
          No token • Post ID: {postId}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-2 border border-blue-500/30 cursor-pointer hover:border-blue-400/50 transition-all duration-200 group"
      onClick={onTradeClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-bold text-white">{formatPrice(currentPrice)}</span>
        </div>
        
        {remainingFreebies > 0 && (
          <div className="flex items-center gap-1">
            <Gift className="w-3 h-3 text-purple-400" />
            <span className="text-xs text-purple-400">{formatNumber(remainingFreebies)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
