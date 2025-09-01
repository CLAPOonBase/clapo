'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOpinioContext } from '@/app/Context/OpinioContext';
import { getOpinioContractService } from '@/app/lib/opinioContract';
import { useSmartContract } from '@/app/lib/useSmartContract';

interface MarketProbabilitiesProps {
  marketId: number;
  className?: string;
  refreshTrigger?: number; // Add this to force refresh when trades happen
}

interface ProbabilityData {
  yesPercentage: number;
  noPercentage: number;
  yesPrice: number;
  noPrice: number;
  source?: string; // Track which method was used
  lastCalculated?: Date;
}

export default function MarketProbabilities({ marketId, className = '', refreshTrigger }: MarketProbabilitiesProps) {
  const [probabilities, setProbabilities] = useState<ProbabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { getMarket, isConnected } = useOpinioContext();
  const { getPrices, getMarketDetails } = useSmartContract();

  const manualRefresh = async () => {
    console.log('🔄 Manual refresh triggered for market', marketId);
    setIsLoading(true);
    // The useEffect will handle the actual refresh
    setLastUpdated(null); // Clear last updated to show loading
  };

  useEffect(() => {
    const fetchProbabilities = async () => {
      try {
        setIsLoading(true);
        
        console.log(`🎲 Fetching probabilities for market ${marketId}`);
        console.log('🔍 Available functions:', { 
          getMarket: !!getMarket, 
          getPrices: !!getPrices, 
          getMarketDetails: !!getMarketDetails,
          isConnected 
        });
        
        // Method 1: Try new comprehensive probability calculation
        if (isConnected) {
          try {
            console.log('📊 Trying new comprehensive probability calculation...');
            const service = getOpinioContractService();
            const probData = await service.getMarketProbabilities(marketId);
            
            if (probData) {
              console.log(`✅ Got probabilities: YES ${probData.yesPercent.toFixed(1)}%, NO ${probData.noPercent.toFixed(1)}%`);
              
              setProbabilities({
                yesPercentage: Math.round(probData.yesPercent),
                noPercentage: Math.round(probData.noPercent),
                yesPrice: probData.yesPercent / 100,
                noPrice: probData.noPercent / 100,
                source: probData.source,
                lastCalculated: new Date()
              });
              return;
            }
            
            // Try market data from Opinio contract
            const market = await getMarket(marketId);
            if (market) {
              console.log('📊 Full market data from Opinio:', market);
              
              // Method 1: Use getMarketProbability for markets with trading, getMarketPositions for new markets
              try {
                const service = getOpinioContractService();
                const positionDetails = await service.getMarketPositionDetails(Number(marketId));
                
                if (positionDetails) {
                  const totalShares = positionDetails.totalLongShares + positionDetails.totalShortShares;
                  
                  if (totalShares > 0) {
                    // Market has trading activity - use getMarketProbability (which uses calculatePositionRate)
                    const probData = await service.getMarketProbabilities(Number(marketId));
                    
                    if (probData) {
                      console.log(`📈 Market with trading: ${positionDetails.totalLongShares.toFixed(2)} LONG, ${positionDetails.totalShortShares.toFixed(2)} SHORT`);
                      console.log(`📈 Using getMarketProbability: YES ${probData.yesPercent}%, NO ${probData.noPercent}%`);
                      
                      setProbabilities({
                        yesPercentage: Math.round(probData.yesPercent),
                        noPercentage: Math.round(probData.noPercent),
                        yesPrice: probData.yesPercent / 100,
                        noPrice: probData.noPercent / 100,
                        source: probData.source,
                        lastCalculated: new Date()
                      });
                      return;
                    }
                  } else {
                    // New market with no trading - use percentages from getMarketPositions (50/50)
                    console.log(`📈 New market with no trading: LONG ${positionDetails.longPercentage}%, SHORT ${positionDetails.shortPercentage}%`);
                    setProbabilities({
                      yesPercentage: Math.round(positionDetails.longPercentage),
                      noPercentage: Math.round(positionDetails.shortPercentage),
                      yesPrice: positionDetails.longPercentage / 100,
                      noPrice: positionDetails.shortPercentage / 100,
                      source: 'New Market Default',
                      lastCalculated: new Date()
                    });
                    return;
                  }
                }
              } catch (positionError) {
                console.log('⚠️ Could not get position details:', positionError.message);
              }
              
              // Method 2: Check if market has any liquidity but no trading yet
              if (market.totalLiquidity && Number(market.totalLiquidity) > 0) {
                console.log('💰 Market has liquidity but no trading yet - using 50/50 default');
                setProbabilities({
                  yesPercentage: 50,
                  noPercentage: 50,
                  yesPrice: 0.5,
                  noPrice: 0.5,
                  source: 'Default 50/50 (No Trading Yet)',
                  lastCalculated: new Date()
                });
                return;
              }
              
              // Method 2: Check if we have option-specific data
              if (market.optionVotes && market.optionVotes.length >= 2) {
                const yesVotes = Number(market.optionVotes[0]) / 1e6;
                const noVotes = Number(market.optionVotes[1]) / 1e6;
                const totalVotes = yesVotes + noVotes;
                
                if (totalVotes > 0) {
                  const yesPercentage = (yesVotes / totalVotes) * 100;
                  const noPercentage = (noVotes / totalVotes) * 100;
                  
                  console.log(`📈 Calculated from option votes - YES: ${yesPercentage.toFixed(1)}%, NO: ${noPercentage.toFixed(1)}%`);
                  
                  setProbabilities({
                    yesPercentage: Math.round(yesPercentage),
                    noPercentage: Math.round(noPercentage),
                    yesPrice: yesPercentage / 100,
                    noPrice: noPercentage / 100,
                    source: 'Opinio Market Option Votes',
                    lastCalculated: new Date()
                  });
                  return;
                }
              }
              
              // Method 3: Check if we have liquidity data that might indicate positions
              if (market.totalLiquidity && Number(market.totalLiquidity) > 0) {
                console.log('📊 Market has liquidity but no clear vote distribution or currentRate');
                console.log('🔍 Available market fields:', Object.keys(market));
              }
            }
          } catch (opinioError) {
            console.log('⚠️ Opinio contract failed, trying Smart Contract:', opinioError.message);
          }
        }
        
        // Method 2: Try Smart Contract (for Sepolia markets with actual prices)
        try {
          console.log('📊 Trying Smart Contract getPrices...');
          const prices = await getPrices(marketId);
          
          if (prices && prices.priceYes && prices.priceNo) {
            console.log('✅ Found market prices:', prices);
            
            // Convert BigNumber prices to regular numbers
            const yesPrice = Number(prices.priceYes) / 1e18; // Assuming 18 decimals
            const noPrice = Number(prices.priceNo) / 1e18;
            
            console.log(`💰 Raw prices - YES: ${yesPrice}, NO: ${noPrice}`);
            
            // In prediction markets, prices represent probabilities
            // They should add up to ~1.0 in a well-functioning AMM
            const totalPrice = yesPrice + noPrice;
            
            if (totalPrice > 0) {
              const yesPercentage = (yesPrice / totalPrice) * 100;
              const noPercentage = (noPrice / totalPrice) * 100;
              
              console.log(`📈 Calculated from prices - YES: ${yesPercentage.toFixed(1)}%, NO: ${noPercentage.toFixed(1)}%`);
              
              setProbabilities({
                yesPercentage: Math.round(yesPercentage),
                noPercentage: Math.round(noPercentage),
                yesPrice,
                noPrice,
                source: 'Smart Contract Prices',
                lastCalculated: new Date()
              });
              return;
            }
          }
          
          // Try market details for total YES/NO shares
          const marketDetails = await getMarketDetails(marketId);
          if (marketDetails && marketDetails.totalYes && marketDetails.totalNo) {
            console.log('✅ Found market details with YES/NO totals:', marketDetails);
            
            const yesTotal = Number(marketDetails.totalYes);
            const noTotal = Number(marketDetails.totalNo);
            const total = yesTotal + noTotal;
            
            if (total > 0) {
              const yesPercentage = (yesTotal / total) * 100;
              const noPercentage = (noTotal / total) * 100;
              
              console.log(`📈 Calculated from YES/NO totals - YES: ${yesPercentage.toFixed(1)}%, NO: ${noPercentage.toFixed(1)}%`);
              
              setProbabilities({
                yesPercentage: Math.round(yesPercentage),
                noPercentage: Math.round(noPercentage),
                yesPrice: yesPercentage / 100,
                noPrice: noPercentage / 100,
                source: 'Smart Contract Market Details',
                lastCalculated: new Date()
              });
              return;
            }
          }
        } catch (smartContractError) {
          console.log('⚠️ Smart Contract failed:', smartContractError.message);
        }
        
        // Method 3: Fallback to 50/50 with a note
        console.log('⚠️ All methods failed, using 50/50 default');
        console.log('📊 This means:');
        console.log('   - Opinio contract getMarketOptions failed or returned no data');
        console.log('   - Opinio contract getMarket failed or returned no usable vote data');
        console.log('   - Smart contract getPrices failed or returned no data');
        console.log('   - Smart contract getMarketDetails failed or returned no data');
        setProbabilities({
          yesPercentage: 50,
          noPercentage: 50,
          yesPrice: 0.5,
          noPrice: 0.5,
          source: 'Fallback (No Data Found)',
          lastCalculated: new Date()
        });
        
              } catch (error) {
        console.error('❌ Failed to fetch market probabilities:', error);
        console.log('🔄 Using 50/50 fallback due to error');
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
        setLastUpdated(new Date());
      }
    };

    if (marketId !== undefined) {
      fetchProbabilities();
      
      // Refresh probabilities every 10 seconds (more frequent for real-time updates)
      const interval = setInterval(fetchProbabilities, 10000);
      return () => clearInterval(interval);
    }
  }, [marketId, getMarket, isConnected, getPrices, getMarketDetails, refreshTrigger]); // Add refreshTrigger to dependencies

  if (isLoading) {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <div className="flex-1 bg-gray-600 rounded-lg p-3 animate-pulse">
          <div className="h-4 bg-gray-500 rounded mb-2"></div>
          <div className="h-6 bg-gray-500 rounded"></div>
        </div>
        <div className="flex-1 bg-gray-600 rounded-lg p-3 animate-pulse">
          <div className="h-4 bg-gray-500 rounded mb-2"></div>
          <div className="h-6 bg-gray-500 rounded"></div>
        </div>
      </div>
    );
  }

  if (!probabilities) {
    return (
      <div className={`text-center text-gray-400 ${className}`}>
        Unable to load market probabilities
      </div>
    );
  }

    return (
    <div className={className}>
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* YES Probability */}
        <motion.div 
          className="flex-1 bg-green-900/30 border border-green-600/30 rounded-lg p-3 hover:bg-green-900/50 transition-colors cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={manualRefresh}
        >
          <div className="text-green-400 text-xs font-medium mb-1">YES</div>
          <div className="text-green-300 text-lg font-bold">
            {probabilities.yesPercentage}%
          </div>
          <div className="text-green-400/70 text-xs">
            ${probabilities.yesPrice.toFixed(3)}
          </div>
        </motion.div>

        {/* NO Probability */}
        <motion.div 
          className="flex-1 bg-red-900/30 border border-red-600/30 rounded-lg p-3 hover:bg-red-900/50 transition-colors cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={manualRefresh}
        >
          <div className="text-red-400 text-xs font-medium mb-1">NO</div>
          <div className="text-red-300 text-lg font-bold">
            {probabilities.noPercentage}%
          </div>
          <div className="text-red-400/70 text-xs">
            ${probabilities.noPrice.toFixed(3)}
          </div>
        </motion.div>
      </motion.div>
      

    </div>
  );
}
