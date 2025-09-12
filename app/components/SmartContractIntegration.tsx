"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSmartContract } from '../lib/useSmartContract';
import { getClientConfig } from '../lib/config';

interface SmartContractIntegrationProps {
  marketId: number;
  onTradeExecuted?: (result: any) => void;
  onError?: (error: string) => void;
}

export default function SmartContractIntegration({ 
  marketId, 
  onTradeExecuted, 
  onError 
}: SmartContractIntegrationProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [usdcAmount, setUsdcAmount] = useState('10');
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [prices, setPrices] = useState<{ priceYes: string; priceNo: string } | null>(null);
  const [usdcStatus, setUsdcStatus] = useState<any>(null);
  
  const {
    isInitialized: contractInitialized,
    walletAddress,
    isLoading,
    error,
    initializeContract,
    checkUSDCStatus,
    buyShares,
    getPrices,
    clearError,
  } = useSmartContract();

  const config = getClientConfig();

  // Auto-initialize if environment variables are available
  useEffect(() => {
    const autoInitialize = async () => {
      if (process.env.NEXT_PUBLIC_RPC_URL && process.env.NEXT_PUBLIC_PRIVATE_KEY) {
        try {
          await initializeContract(
            process.env.NEXT_PUBLIC_RPC_URL,
            process.env.NEXT_PUBLIC_PRIVATE_KEY
          );
          setIsInitialized(true);
        } catch (err) {
          console.warn('Auto-initialization failed:', err);
        }
      }
    };

    autoInitialize();
  }, [initializeContract]);

  // Update local state when contract initializes
  useEffect(() => {
    setIsInitialized(contractInitialized);
  }, [contractInitialized]);

  // Handle errors
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Fetch prices when market ID changes
  useEffect(() => {
    if (isInitialized && marketId) {
      fetchPrices();
    }
  }, [isInitialized, marketId]);

  // Fetch USDC status when initialized
  useEffect(() => {
    if (isInitialized) {
      fetchUSDCStatus();
    }
  }, [isInitialized]);

  const fetchPrices = async () => {
    try {
      const priceData = await getPrices(marketId);
      if (priceData) {
        setPrices({
          priceYes: priceData.priceYes.toString(),
          priceNo: priceData.priceNo.toString()
        });
      }
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    }
  };

  const fetchUSDCStatus = async () => {
    try {
      const status = await checkUSDCStatus();
      if (status) {
        setUsdcStatus(status);
      }
    } catch (err) {
      console.error('Failed to fetch USDC status:', err);
    }
  };

  const handleBuyShares = async () => {
    if (!isInitialized) {
      onError?.('Smart contract not initialized');
      return;
    }

    try {
      const result = await buyShares(marketId, selectedSide === 'yes', parseFloat(usdcAmount));
      if (result && onTradeExecuted) {
        onTradeExecuted({
          type: 'buy',
          side: selectedSide,
          amount: usdcAmount,
          transaction: result,
          marketId
        });
      }
      
      // Refresh data after trade
      setTimeout(() => {
        fetchPrices();
        fetchUSDCStatus();
      }, 2000);
      
    } catch (err) {
      onError?.(`Failed to buy shares: ${err}`);
    }
  };

  const handleManualInitialize = async () => {
    const rpcUrl = prompt('Enter RPC URL:', config.rpcUrl);
    const privateKey = prompt('Enter Private Key:');
    
    if (rpcUrl && privateKey) {
      try {
        await initializeContract(rpcUrl, privateKey);
        setIsInitialized(true);
      } catch (err) {
        onError?.(`Failed to initialize: ${err}`);
      }
    }
  };

  if (!isInitialized) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-black rounded-lg p-6 text-center"
      >
        <h3 className="text-xl font-bold mb-4">Smart Contract Trading</h3>
        <p className="text-gray-400 mb-4">
          Initialize smart contract to enable on-chain trading
        </p>
        <button
          onClick={handleManualInitialize}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Initialize Contract
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black rounded-lg p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Smart Contract Trading</h3>
        <div className="text-sm text-gray-400">
          {walletAddress && (
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* USDC Status */}
      {usdcStatus && (
        <div className="bg-dark-700 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Balance: </span>
              <span className="text-white font-medium">
                {parseFloat(usdcStatus.balance.toString()) / Math.pow(10, usdcStatus.decimals)} USDC
              </span>
            </div>
            <div>
              <span className="text-gray-400">Allowance: </span>
              <span className="text-white font-medium">
                {parseFloat(usdcStatus.allowance.toString()) / Math.pow(10, usdcStatus.decimals)} USDC
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Prices */}
      {prices && (
        <div className="bg-dark-700 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">YES Price: </span>
              <span className="text-green-400 font-medium">
                ${(parseFloat(prices.priceYes) / 1e18).toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">NO Price: </span>
              <span className="text-red-400 font-medium">
                ${(parseFloat(prices.priceNo) / 1e18).toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Trading Interface */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            USDC Amount
          </label>
          <input
            type="number"
            value={usdcAmount}
            onChange={(e) => setUsdcAmount(e.target.value)}
            min="0.01"
            step="0.01"
            className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Side
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedSide('yes')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                selectedSide === 'yes' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              YES
            </button>
            <button
              onClick={() => setSelectedSide('no')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                selectedSide === 'no' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        <button
          onClick={handleBuyShares}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {isLoading ? 'Processing...' : `Buy ${selectedSide.toUpperCase()} Shares`}
        </button>

        {/* Refresh Button */}
        <button
          onClick={() => {
            fetchPrices();
            fetchUSDCStatus();
          }}
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </motion.div>
  );
}
