"use client";

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Gift, Database, ExternalLink } from 'lucide-react';
import { useRewardPool, RewardPoolStats, RewardPoolBalance } from '../hooks/useRewardPool';
import { useWalletContext } from '@/context/WalletContext';

interface RewardPoolDisplayProps {
  tokenUuid: string;
  tokenType: 'post' | 'creator';
  tokenName?: string;
}

export default function RewardPoolDisplay({ tokenUuid, tokenType, tokenName }: RewardPoolDisplayProps) {
  const [rewardPoolBalance, setRewardPoolBalance] = useState<number>(0);
  const [combinedStats, setCombinedStats] = useState<RewardPoolStats | null>(null);
  const [detailedStats, setDetailedStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    getPostRewardPoolBalanceByUuid,
    getCreatorRewardPoolBalanceByUuid,
    getCombinedRewardPoolInfo,
    getRewardPoolStatistics,
    isConnected,
    connectWallet,
    isConnecting,
    address,
    disconnectWallet
  } = useRewardPool();

  const { signer } = useWalletContext();

  // Load reward pool data
  useEffect(() => {
    if (tokenUuid) {
      loadRewardPoolData();
    }
  }, [tokenUuid, isConnected]);

  const loadRewardPoolData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get specific token reward pool balance
      const balance = tokenType === 'post' 
        ? await getPostRewardPoolBalanceByUuid(tokenUuid)
        : await getCreatorRewardPoolBalanceByUuid(tokenUuid);
      
      setRewardPoolBalance(balance);

      // Get combined stats if connected
      if (isConnected) {
        const [combined, detailed] = await Promise.all([
          getCombinedRewardPoolInfo(),
          getRewardPoolStatistics()
        ]);
        
        setCombinedStats(combined);
        setDetailedStats(detailed);
      }
    } catch (err) {
      setError('Failed to load reward pool data');
      console.error('Error loading reward pool data:', err);
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

  if (isLoading) {
    return (
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-700/70">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl p-4 border-2 border-red-500/30">
        <p className="text-red-400 text-sm font-medium">{error}</p>
        <button
          onClick={loadRewardPoolData}
          className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Token-specific Reward Pool */}
      <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-700/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400 text-sm font-medium">
              {tokenType === 'post' ? 'Post' : 'Creator'} Reward Pool
            </span>
          </div>
          <div className="text-right">
            <p className="text-white text-lg font-bold tracking-tight">
              {formatPrice(rewardPoolBalance)}
            </p>
            {tokenName && (
              <p className="text-gray-500 text-xs">{tokenName}</p>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-400">
          UUID: <span className="text-gray-300 font-mono">{tokenUuid.slice(0, 20)}...</span>
        </div>
      </div>

      {/* Global Reward Pool Stats (only if connected) */}
      {isConnected && combinedStats && detailedStats && (
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-700/70">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-sm font-medium">Global Reward Pool Stats</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-green-400" />
                <span className="text-gray-400 text-xs">Total Balance</span>
              </div>
              <p className="text-white text-sm font-bold">{formatPrice(combinedStats.totalBalance)}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-3 h-3 text-blue-400" />
                <span className="text-gray-400 text-xs">Total Pools</span>
              </div>
              <p className="text-white text-sm font-bold">
                {formatNumber(combinedStats.postCount + combinedStats.creatorCount)}
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Gift className="w-3 h-3 text-purple-400" />
                <span className="text-gray-400 text-xs">Post Pools</span>
              </div>
              <p className="text-white text-sm font-bold">{formatNumber(combinedStats.postCount)}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ExternalLink className="w-3 h-3 text-orange-400" />
                <span className="text-gray-400 text-xs">Creator Pools</span>
              </div>
              <p className="text-white text-sm font-bold">{formatNumber(combinedStats.creatorCount)}</p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Contract Balance:</span>
              <span className="text-white font-medium">{formatPrice(detailedStats.contractBalance)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-900/20 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl p-3">
          <p className="text-yellow-400 text-sm font-medium">
            Connect wallet to view global reward pool statistics
          </p>
        </div>
      )}
    </div>
  );
}


