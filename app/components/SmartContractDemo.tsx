"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSmartContract } from '../lib/useSmartContract';
import { getClientConfig } from '../lib/config';

export default function SmartContractDemo() {
  const [rpcUrl, setRpcUrl] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [marketDescription, setMarketDescription] = useState('Will Switzerland win the World Cup?');
  const [marketId, setMarketId] = useState('1');
  const [usdcAmount, setUsdcAmount] = useState('10');
  const [whitelistAddress, setWhitelistAddress] = useState('');
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  
  const {
    isInitialized,
    walletAddress,
    isLoading,
    error,
    initializeContract,
    getNetworkInfo,
    checkUSDCStatus,
    buyShares,
    getPrices,
    createMarket,
    getMarketCount,
    getMarketDetails,
    addCreatorToWhitelist,
    resolveMarket,
    claimReward,
    withdrawFees,
    isWhitelisted,
    clearError,
  } = useSmartContract();

  const config = getClientConfig();

  const handleInitialize = async () => {
    if (!rpcUrl || !privateKey) {
      alert('Please provide both RPC URL and Private Key');
      return;
    }
    await initializeContract(rpcUrl, privateKey);
  };

  const handleBuyShares = async () => {
    const result = await buyShares(parseInt(marketId), selectedSide === 'yes', parseFloat(usdcAmount));
    if (result) {
      alert(`Shares bought successfully! Transaction: ${result.hash}`);
    }
  };

  const handleCreateMarket = async () => {
    const result = await createMarket(marketDescription);
    if (result) {
      alert(`Market created successfully! Market ID: ${result.marketId}`);
    }
  };

  const handleResolveMarket = async () => {
    const result = await resolveMarket(parseInt(marketId), selectedSide === 'yes');
    if (result) {
      alert(`Market resolved successfully! Transaction: ${result.hash}`);
    }
  };

  const handleClaimReward = async () => {
    const result = await claimReward(parseInt(marketId));
    if (result) {
      alert(`Reward claimed successfully! Transaction: ${result.hash}`);
    }
  };

  const handleWithdrawFees = async () => {
    const result = await withdrawFees(parseInt(marketId));
    if (result) {
      alert(`Fees withdrawn successfully! Transaction: ${result.hash}`);
    }
  };

  const handleAddWhitelist = async () => {
    if (!whitelistAddress) {
      alert('Please provide an address');
      return;
    }
    const result = await addCreatorToWhitelist(whitelistAddress);
    if (result) {
      alert(`Creator added to whitelist successfully! Transaction: ${result.hash}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Smart Contract Demo</h1>
          <p className="text-gray-400 text-lg">Test all smart contract functions</p>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6"
          >
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}

        {/* Initialization Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 rounded-lg p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-4">Initialize Contract</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RPC URL
              </label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                placeholder={config.rpcUrl}
                className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Private Key
              </label>
              <input
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key"
                className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInitialize}
              disabled={isLoading || isInitialized}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Initializing...' : isInitialized ? 'Initialized' : 'Initialize Contract'}
            </button>
            {isInitialized && (
              <button
                onClick={async () => {
                  try {
                    const networkInfo = await getNetworkInfo();
                    if (networkInfo) {
                      alert(`Network: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);
                    }
                  } catch (err) {
                    alert(`Failed to get network info: ${err}`);
                  }
                }}
                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Check Network
              </button>
            )}
          </div>
          {isInitialized && walletAddress && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
              <p className="text-green-400">Connected: {walletAddress}</p>
            </div>
          )}
        </motion.div>

        {/* Contract Functions */}
        {isInitialized && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Operations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-bold mb-4">Market Operations</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Market Description
                  </label>
                  <input
                    type="text"
                    value={marketDescription}
                    onChange={(e) => setMarketDescription(e.target.value)}
                    className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={handleCreateMarket}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Creating...' : 'Create Market'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => getMarketCount()}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Get Market Count
                  </button>
                  <button
                    onClick={() => getMarketDetails(parseInt(marketId))}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Get Market Details
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Trading Operations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-bold mb-4">Trading Operations</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Market ID
                  </label>
                  <input
                    type="number"
                    value={marketId}
                    onChange={(e) => setMarketId(e.target.value)}
                    className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    USDC Amount
                  </label>
                  <input
                    type="number"
                    value={usdcAmount}
                    onChange={(e) => setUsdcAmount(e.target.value)}
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

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleBuyShares}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Buying...' : 'Buy Shares'}
                  </button>
                  <button
                    onClick={() => getPrices(parseInt(marketId))}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Get Prices
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Admin Operations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-bold mb-4">Admin Operations</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address to Whitelist
                  </label>
                  <input
                    type="text"
                    value={whitelistAddress}
                    onChange={(e) => setWhitelistAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleAddWhitelist}
                  disabled={isLoading}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Adding...' : 'Add to Whitelist'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleResolveMarket}
                    disabled={isLoading}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Resolving...' : 'Resolve Market'}
                  </button>
                  <button
                    onClick={handleWithdrawFees}
                    disabled={isLoading}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? 'Withdrawing...' : 'Withdraw Fees'}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Utility Operations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-800 rounded-lg p-6"
            >
              <h3 className="text-xl font-bold mb-4">Utility Operations</h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => checkUSDCStatus()}
                  disabled={isLoading}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Checking...' : 'Check USDC Status'}
                </button>

                <button
                  onClick={handleClaimReward}
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Claiming...' : 'Claim Reward'}
                </button>

                <button
                  onClick={() => isWhitelisted(walletAddress || '')}
                  disabled={isLoading || !walletAddress}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Checking...' : 'Check My Whitelist Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-dark-800 rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-white">Processing transaction...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
