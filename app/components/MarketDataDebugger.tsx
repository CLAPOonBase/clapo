'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOpinioContext } from '@/app/Context/OpinioContext';

import { useSmartContract } from '@/app/lib/useSmartContract';

interface MarketDataDebuggerProps {
  marketId: number;
  className?: string;
}

interface DebugData {
  opinioData?: any;
  smartContractData?: any;
  calculatedProbabilities?: any;
  errors?: string[];
}

export default function MarketDataDebugger({ marketId, className = '' }: MarketDataDebuggerProps) {
  const [debugData, setDebugData] = useState<DebugData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const { getMarket, getMarketOptions, getMarketProbabilities, isConnected } = useOpinioContext();
  const { getPrices, getMarketDetails } = useSmartContract();

  // Custom JSON serializer to handle BigInt values
  const safeStringify = (obj: any) => {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString() + 'n';
      }
      return value;
    }, 2);
  };

  const runFullDebug = async () => {
    setIsLoading(true);
    const errors: string[] = [];
    let opinioData: any = null;
    let smartContractData: any = null;
    let calculatedProbabilities: any = {};

    console.log(`🔍 Starting full debug for market ${marketId}`);

    // 1. Test Opinio Contract Data
    try {
      console.log('📊 Testing Opinio contract...');
      
      // Get basic market data
      if (getMarket && isConnected) {
        const market = await getMarket(marketId);
        console.log('✅ Opinio getMarket result:', market);
        
        // Get market options
        const options = await getMarketOptions(marketId);
        console.log('✅ Opinio getMarketOptions result:', options);
        
        // Get market probabilities
        let contractProbabilities = null;
        try {
          contractProbabilities = await getMarketProbabilities(marketId);
          console.log('✅ Market probabilities:', contractProbabilities);
        } catch (newFunctionError) {
          console.log('⚠️ Could not get market probabilities:', newFunctionError.message);
        }

        opinioData = {
          market,
          options,
          contractProbabilities,
          marketFields: market ? Object.keys(market) : [],
          optionFields: options && options.length > 0 ? Object.keys(options[0]) : []
        };

        // Calculate probabilities from Opinio data
        
        // Method 1: Use new comprehensive probability calculation
        try {
          const probData = await getMarketProbabilities(marketId);
          if (probData) {
            calculatedProbabilities.newComprehensiveMethod = {
              yesPercent: probData.yesPercent,
              noPercent: probData.noPercent,
              source: probData.source,
              method: 'New comprehensive calculation'
            };
          }
        } catch (probError) {
          console.log('⚠️ New probability method failed:', probError.message);
        }

        // Method 2: Use currentRate (most reliable for NO_OPTIONS markets)
        if (market && market.currentRate && Number(market.currentRate) > 0) {
          const rate = Number(market.currentRate);
          const yesPercent = rate / 10; // Convert 550 -> 55%
          const noPercent = 100 - yesPercent;
          
          calculatedProbabilities.opinioCurrentRate = {
            currentRate: rate,
            yesPercent,
            noPercent,
            method: 'currentRate field from market data'
          };
        }
        
        // Method 2: Use option shares (for WITH_OPTIONS markets)
        if (options && options.length >= 2) {
          const yesShares = Number(options[0].totalShares) / 1e6;
          const noShares = Number(options[1].totalShares) / 1e6;
          const totalShares = yesShares + noShares;
          
          calculatedProbabilities.opinioShares = {
            yesShares,
            noShares,
            totalShares,
            yesPercent: totalShares > 0 ? (yesShares / totalShares) * 100 : 50,
            noPercent: totalShares > 0 ? (noShares / totalShares) * 100 : 50
          };
        }

        // Check option votes from market data
        if (market && market.optionVotes && market.optionVotes.length >= 2) {
          const yesVotes = Number(market.optionVotes[0]) / 1e6;
          const noVotes = Number(market.optionVotes[1]) / 1e6;
          const totalVotes = yesVotes + noVotes;
          
          calculatedProbabilities.opinioVotes = {
            yesVotes,
            noVotes,
            totalVotes,
            yesPercent: totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 50,
            noPercent: totalVotes > 0 ? (noVotes / totalVotes) * 100 : 50
          };
        }
      } else {
        errors.push('Opinio: Not connected or getMarket not available');
      }
    } catch (error) {
      console.error('❌ Opinio contract error:', error);
      errors.push(`Opinio error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // 2. Test Smart Contract Data
    try {
      console.log('📊 Testing Smart contract...');
      
      // Get prices
      const prices = await getPrices(marketId);
      console.log('✅ Smart contract getPrices result:', prices);
      
      // Get market details
      const marketDetails = await getMarketDetails(marketId);
      console.log('✅ Smart contract getMarketDetails result:', marketDetails);
      
      smartContractData = {
        prices,
        marketDetails,
        priceFields: prices ? Object.keys(prices) : [],
        marketDetailFields: marketDetails ? Object.keys(marketDetails) : []
      };

      // Calculate probabilities from Smart Contract prices
      if (prices && prices.priceYes && prices.priceNo) {
        const yesPrice = Number(prices.priceYes) / 1e18;
        const noPrice = Number(prices.priceNo) / 1e18;
        const totalPrice = yesPrice + noPrice;
        
        calculatedProbabilities.smartContractPrices = {
          yesPrice,
          noPrice,
          totalPrice,
          yesPercent: totalPrice > 0 ? (yesPrice / totalPrice) * 100 : 50,
          noPercent: totalPrice > 0 ? (noPrice / totalPrice) * 100 : 50
        };
      }

      // Calculate probabilities from Smart Contract market details
      if (marketDetails && marketDetails.totalYes && marketDetails.totalNo) {
        const yesTotal = Number(marketDetails.totalYes);
        const noTotal = Number(marketDetails.totalNo);
        const total = yesTotal + noTotal;
        
        calculatedProbabilities.smartContractShares = {
          yesTotal,
          noTotal,
          total,
          yesPercent: total > 0 ? (yesTotal / total) * 100 : 50,
          noPercent: total > 0 ? (noTotal / total) * 100 : 50
        };
      }
    } catch (error) {
      console.error('❌ Smart contract error:', error);
      errors.push(`Smart Contract error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setDebugData({
      opinioData,
      smartContractData,
      calculatedProbabilities,
      errors
    });
    
    setIsLoading(false);
    
    // Log summary
    console.log('🎯 DEBUG SUMMARY:', {
      opinioData: !!opinioData,
      smartContractData: !!smartContractData,
      calculatedProbabilities,
      errors
    });
  };

  useEffect(() => {
    if (showDebug && marketId !== undefined) {
      runFullDebug();
    }
  }, [showDebug, marketId]);

  if (!showDebug) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setShowDebug(true)}
          className="text-xs text-gray-500 hover:text-gray-300 underline"
        >
          🔍 Debug Market Data
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`bg-gray-900 border border-gray-700 rounded-lg p-4 mt-4 text-xs ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white">🔍 Market {marketId} Debug Data</h3>
        <div className="flex space-x-2">
          <button
            onClick={runFullDebug}
            disabled={isLoading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-xs"
          >
            {isLoading ? 'Loading...' : '🔄 Refresh'}
          </button>
          <button
            onClick={() => setShowDebug(false)}
            className="px-3 py-1 bg-gray-600 hover:bg-black text-white rounded text-xs"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center text-gray-400 py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
          Running full debug...
        </div>
      )}

      {!isLoading && debugData && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Errors */}
          {debugData.errors && debugData.errors.length > 0 && (
            <div className="bg-red-900/30 border border-red-600 rounded p-3">
              <h4 className="text-red-400 font-semibold mb-2">❌ Errors:</h4>
              {debugData.errors.map((error, index) => (
                <div key={index} className="text-red-300 text-xs">{error}</div>
              ))}
            </div>
          )}

          {/* Calculated Probabilities */}
          {debugData.calculatedProbabilities && (
            <div className="bg-green-900/30 border border-green-600 rounded p-3">
              <h4 className="text-green-400 font-semibold mb-2">📈 Calculated Probabilities:</h4>
              {Object.entries(debugData.calculatedProbabilities).map(([method, data]: [string, any]) => (
                <div key={method} className="mb-2">
                  <div className="text-green-300 font-medium">{method}:</div>
                  <div className="text-gray-300 ml-2">
                    YES: {data.yesPercent?.toFixed(2)}% | NO: {data.noPercent?.toFixed(2)}%
                  </div>
                  <div className="text-gray-500 text-xs ml-2">
                    Raw: {safeStringify(data).slice(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Opinio Data */}
          {debugData.opinioData && (
            <div className="bg-blue-900/30 border border-blue-600 rounded p-3">
              <h4 className="text-blue-400 font-semibold mb-2">📊 Opinio Contract Data:</h4>
              <div className="text-gray-300">
                <div>Market fields: {debugData.opinioData.marketFields?.join(', ')}</div>
                <div>Option fields: {debugData.opinioData.optionFields?.join(', ')}</div>
                <div>User share fields: {debugData.opinioData.userShareFields?.join(', ')}</div>
                
                {/* Show new contract functions data */}
                {debugData.opinioData.contractProbabilities && (
                  <div className="mt-2 p-2 bg-green-900 rounded">
                    <div className="text-green-300 font-bold">🎯 New Contract Probabilities:</div>
                    <div>YES: {debugData.opinioData.contractProbabilities.yesPercent}% | NO: {debugData.opinioData.contractProbabilities.noPercent}%</div>
                    <div>Source: {debugData.opinioData.contractProbabilities.source}</div>
                  </div>
                )}
                
                {debugData.opinioData.positionDetails && (
                  <div className="mt-2 p-2 bg-blue-900 rounded">
                    <div className="text-blue-300 font-bold">📈 Position Details:</div>
                    <div>Long: {debugData.opinioData.positionDetails.totalLongShares.toFixed(2)} shares ({debugData.opinioData.positionDetails.longPercentage}%)</div>
                    <div>Short: {debugData.opinioData.positionDetails.totalShortShares.toFixed(2)} shares ({debugData.opinioData.positionDetails.shortPercentage}%)</div>
                    <div>Long Volume: ${debugData.opinioData.positionDetails.totalLongVolume.toFixed(2)} | Short Volume: ${debugData.opinioData.positionDetails.totalShortVolume.toFixed(2)}</div>
                  </div>
                )}
                
                <div className="mt-2 bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                  <pre>{safeStringify(debugData.opinioData)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Smart Contract Data */}
          {debugData.smartContractData && (
            <div className="bg-purple-900/30 border border-purple-600 rounded p-3">
              <h4 className="text-purple-400 font-semibold mb-2">📊 Smart Contract Data:</h4>
              <div className="text-gray-300">
                <div>Price fields: {debugData.smartContractData.priceFields?.join(', ')}</div>
                <div>Market detail fields: {debugData.smartContractData.marketDetailFields?.join(', ')}</div>
                <div className="mt-2 bg-gray-800 p-2 rounded text-xs overflow-x-auto">
                  <pre>{safeStringify(debugData.smartContractData)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-900/30 border border-yellow-600 rounded p-3">
            <h4 className="text-yellow-400 font-semibold mb-2">💡 How to Use This Debug:</h4>
            <div className="text-gray-300 text-xs space-y-1">
              <div>1. Check the "Calculated Probabilities" section to see which method works</div>
              <div>2. Look for non-50/50 values - those indicate real data</div>
              <div>3. Check the raw data to see what fields are available</div>
              <div>4. If all methods show 50/50, there might be no trading activity yet</div>
              <div>5. Open browser console for detailed logs</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
