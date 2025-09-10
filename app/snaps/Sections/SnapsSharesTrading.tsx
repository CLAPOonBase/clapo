"use client";
import React, { useState, useEffect } from 'react';
import { useSnapsShares } from '../../hooks/useSnapsShares';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Users,
  DollarSign,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface SnapsSharesTradingProps {
  onClose?: () => void;
}

export default function SnapsSharesTrading({ onClose }: SnapsSharesTradingProps) {
  const {
    isConnected,
    account,
    loading,
    error,
    stats,
    portfolio,
    transactions,
    profitLoss,
    connectWallet,
    buyShares,
    sellShares,
    loadContractData,
    checkCanClaimFreebie,
    getRemainingFreebies,
    getCurrentPrice,
    getFreebieSellPrice,
  } = useSnapsShares();

  const [sellAmount, setSellAmount] = useState(1);
  const [canClaimFreebie, setCanClaimFreebie] = useState(false);
  const [remainingFreebies, setRemainingFreebies] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [freebieSellPrice, setFreebieSellPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load additional data
  useEffect(() => {
    if (isConnected) {
      loadAdditionalData();
    }
  }, [isConnected]);

  const loadAdditionalData = async () => {
    try {
      const [canClaim, remaining, price, sellPrice] = await Promise.all([
        checkCanClaimFreebie(),
        getRemainingFreebies(),
        getCurrentPrice(),
        getFreebieSellPrice(),
      ]);
      
      setCanClaimFreebie(canClaim);
      setRemainingFreebies(remaining);
      setCurrentPrice(price);
      setFreebieSellPrice(sellPrice);
    } catch (err) {
      console.error('Error loading additional data:', err);
    }
  };

  const handleBuy = async () => {
    try {
      await buyShares();
      setSuccessMessage('Shares purchased successfully!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Buy error:', err);
    }
  };

  const handleSell = async () => {
    try {
      await sellShares(sellAmount);
      setSuccessMessage(`${sellAmount} share(s) sold successfully!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Sell error:', err);
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(4)}`;
  const formatNumber = (num: number) => num.toLocaleString();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">SnapsShares Trading</h1>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to start trading SnapsShares
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">SnapsShares Trading</h1>
            <p className="text-gray-400 mt-2">
              Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadContractData}
              disabled={loading}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400">{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trading Interface */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Stats */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Market Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatPrice(currentPrice)}
                  </div>
                  <div className="text-sm text-gray-400">Current Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {formatNumber(stats?.totalBuyers || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Total Buyers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {formatNumber(remainingFreebies)}
                  </div>
                  <div className="text-sm text-gray-400">Freebies Left</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {formatPrice(stats?.highestPrice || 0)}
                  </div>
                  <div className="text-sm text-gray-400">Highest Price</div>
                </div>
              </div>
            </div>

            {/* Trading Actions */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Trading
              </h2>
              
              <div className="space-y-4">
                {/* Buy Section */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-400 flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4" />
                      Buy Shares
                    </h3>
                    {canClaimFreebie && (
                      <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                        FREEBIE AVAILABLE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">
                        {canClaimFreebie ? 'Free Share' : `Price: ${formatPrice(currentPrice)}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {canClaimFreebie 
                          ? 'Claim your free share!' 
                          : 'Purchase 1 share at current market price'
                        }
                      </div>
                    </div>
                    <button
                      onClick={handleBuy}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {loading ? 'Processing...' : 'Buy'}
                    </button>
                  </div>
                </div>

                {/* Sell Section */}
                {portfolio && portfolio.balance > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-red-400 flex items-center gap-2 mb-3">
                      <ArrowDownRight className="w-4 h-4" />
                      Sell Shares
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">
                          Amount: {sellAmount} share(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          Sell Price: {formatPrice(portfolio.hasFreebieFlag ? freebieSellPrice : currentPrice)}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="number"
                            min="1"
                            max={portfolio.balance}
                            value={sellAmount}
                            onChange={(e) => setSellAmount(Math.max(1, Math.min(portfolio.balance, parseInt(e.target.value) || 1)))}
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                          />
                          <span className="text-xs text-gray-400">
                            / {portfolio.balance} available
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleSell}
                        disabled={loading || sellAmount > portfolio.balance}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        {loading ? 'Processing...' : 'Sell'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Transactions
              </h2>
              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.isBuy ? 'bg-green-900/30' : 'bg-red-900/30'
                        }`}>
                          {tx.isBuy ? (
                            <ArrowUpRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {tx.isBuy ? 'Bought' : 'Sold'} {tx.amount} share{tx.amount > 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-gray-400">
                            {tx.isFreebie ? 'Freebie' : formatPrice(tx.price)} • {new Date(tx.timestamp * 1000).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${
                          tx.isBuy ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tx.isBuy ? '+' : '-'}{tx.amount}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No transactions yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Portfolio */}
          <div className="space-y-6">
            {/* Portfolio Overview */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Portfolio
              </h2>
              
              {portfolio ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">
                      {portfolio.balance}
                    </div>
                    <div className="text-sm text-gray-400">Shares Owned</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-400">
                        {portfolio.totalBought}
                      </div>
                      <div className="text-xs text-gray-400">Total Bought</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-400">
                        {portfolio.totalSold}
                      </div>
                      <div className="text-xs text-gray-400">Total Sold</div>
                    </div>
                  </div>

                  {portfolio.hasFreebieFlag && (
                    <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-3 text-center">
                      <div className="text-sm text-green-400 font-medium">
                        🎉 Freebie Holder
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        You have freebie shares with special pricing
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No portfolio data
                </div>
              )}
            </div>

            {/* Profit/Loss */}
            {profitLoss && (
              <div className="bg-gray-900 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  P&L
                </h2>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      profitLoss.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {profitLoss.totalProfitLoss >= 0 ? '+' : ''}{formatPrice(profitLoss.totalProfitLoss)}
                    </div>
                    <div className="text-sm text-gray-400">Total P&L</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-400">
                        {formatPrice(profitLoss.totalInvested)}
                      </div>
                      <div className="text-xs text-gray-400">Invested</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-400">
                        {formatPrice(profitLoss.currentValue)}
                      </div>
                      <div className="text-xs text-gray-400">Current Value</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-sm font-medium ${
                      profitLoss.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {profitLoss.profitLossPercentage >= 0 ? '+' : ''}{profitLoss.profitLossPercentage.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-400">Return</div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Info */}
            <div className="bg-gray-900 rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Market Info
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Freebie Sell Price:</span>
                  <span className="font-medium">{formatPrice(freebieSellPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Break Even:</span>
                  <span className={`font-medium ${
                    stats?.breakEven ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stats?.breakEven ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Liability:</span>
                  <span className="font-medium">{formatPrice(stats?.liability || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

