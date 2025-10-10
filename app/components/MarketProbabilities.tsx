'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOpinioContext } from '../Context/OpinioContext';

interface MarketProbabilitiesProps {
  marketId: number;
  className?: string;
  refreshTrigger?: number;
}

interface ProbabilityData {
  yesPercentage: number;
  noPercentage: number;
  yesPrice: number;
  noPrice: number;
  source?: string;
  lastCalculated?: Date;
}

export const MarketProbabilities: React.FC<MarketProbabilitiesProps> = ({ marketId, className = '', refreshTrigger }: MarketProbabilitiesProps) => {
  const [probabilities, setProbabilities] = useState<ProbabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getMarketProbabilities, isConnected } = useOpinioContext();

  const manualRefresh = async () => {
    console.log('🔄 Manual refresh triggered for market', marketId);
    setIsRefreshing(true);
    setError(null);
    setLastUpdated(null);
  };

  useEffect(() => {
    const fetchProbabilities = async () => {
      try {
        if (!isRefreshing) {
          setIsLoading(true);
        }
        
        console.log(`🎲 Fetching probabilities for market ${marketId}`);
        
        // Always set a default 50/50 probability first
        const defaultProbabilities = {
          yesPercentage: 50,
          noPercentage: 50,
          yesPrice: 0.5,
          noPrice: 0.5,
          source: 'Default 50/50',
          lastCalculated: new Date()
        };
        
        setProbabilities(defaultProbabilities);
        
        // Try to get real probabilities if connected
        if (isConnected && marketId) {
          try {
            console.log('📊 Trying to get real probabilities...');
            const probData = await getMarketProbabilities(marketId);
            
            if (probData && probData.yesPercent !== undefined && probData.noPercent !== undefined) {
              console.log(`✅ Got real probabilities: YES ${probData.yesPercent}%, NO ${probData.noPercent}%`);
              
              setProbabilities({
                yesPercentage: Math.round(probData.yesPercent),
                noPercentage: Math.round(probData.noPercent),
                yesPrice: probData.yesPercent / 100,
                noPrice: probData.noPercent / 100,
                source: probData.source || 'Contract Calculation',
                lastCalculated: new Date()
              });
            } else {
              console.log('⚠️ No real probability data, keeping 50/50 default');
            }
          } catch (contractError) {
            console.log('⚠️ Contract error, keeping 50/50 default:', contractError.message);
          }
        } else {
          console.log('ℹ️ Not connected or no marketId, using 50/50 default');
        }
        
      } catch (error) {
        console.error('❌ Error in fetchProbabilities:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        
        // Always ensure we have probabilities even on error
        setProbabilities({
          yesPercentage: 50,
          noPercentage: 50,
          yesPrice: 0.5,
          noPrice: 0.5,
          source: 'Error Fallback',
          lastCalculated: new Date()
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setLastUpdated(new Date());
      }
    };

    if (marketId !== undefined) {
      fetchProbabilities();
      
      // Refresh probabilities every 5 seconds to avoid rate limiting
      const interval = setInterval(fetchProbabilities, 5000);
      return () => clearInterval(interval);
    }
  }, [marketId, getMarketProbabilities, isConnected, refreshTrigger, isRefreshing]);

  // Show loading state
  if (isLoading && !probabilities) {
    return (
      <div className={`flex space-x-1.5 ${className}`}>
        <div className="flex-1 bg-gray-600 rounded-md p-2 animate-pulse">
          <div className="h-2.5 bg-gray-500 rounded mb-1"></div>
          <div className="h-4 bg-gray-500 rounded"></div>
        </div>
        <div className="flex-1 bg-gray-600 rounded-md p-2 animate-pulse">
          <div className="h-2.5 bg-gray-500 rounded mb-1"></div>
          <div className="h-4 bg-gray-500 rounded"></div>
        </div>
      </div>
    );
  }

  // Always show probabilities (even if it's 50/50 default)
  if (!probabilities) {
    return (
      <div className={`text-center text-gray-400 text-xs ${className}`}>
        Loading probabilities...
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Compact status indicators */}
      {(isRefreshing || error) && (
        <div className="flex items-center justify-center mb-1">
          {isRefreshing && (
            <div className="animate-spin rounded-full h-2 w-2 border border-blue-400 border-t-transparent mr-1"></div>
          )}
          {error && <span className="text-yellow-400 text-xs">⚠</span>}
        </div>
      )}
      
      <motion.div
        className="flex space-x-1.5"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* YES Probability */}
        <motion.div 
          className="flex-1 bg-green-900/20  shadow-custom rounded-md p-2 hover:bg-green-900/30 transition-colors cursor-pointer"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          // onClick={manualRefresh}
        >
          <div className="text-green-400 text-xs font-medium mb-0.5">YES</div>
          <div className="flex items-center justify-between w-full space-x-2 text-green-300 text-base font-bold leading-tight">
            {probabilities.yesPercentage}%   <div className="text-green-400/60 text-xs leading-tight">
            ${probabilities.yesPrice.toFixed(2)}
          </div></div>
        </motion.div>

        {/* NO Probability */}
        <motion.div 
          className="flex-1 bg-red-900/20 shadow-custom rounded-md p-2 hover:bg-red-900/30 transition-colors cursor-pointer"
          whileHover={{ scale: 1.01 }}
          // whileTap={{ scale: 0.99 }}
          // onClick={manualRefresh}
        >
          <div className="text-red-400 text-xs font-medium">NO</div>
          <div className="flex items-center justify-between w-full space-x-2 text-red-300 text-base font-bold leading-tight">
            {probabilities.noPercentage}%   <div className="text-red-400/60 text-xs leading-tight">
            ${probabilities.noPrice.toFixed(2)}
          </div>
          </div>
       
        </motion.div>
      </motion.div>
    </div>
  );
};