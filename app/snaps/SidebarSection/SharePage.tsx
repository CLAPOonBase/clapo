"use client"
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApi } from '../../Context/ApiProvider';
import { Share2, TrendingUp, Users, BarChart3, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShareData {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  changePercent: number;
  shares: number;
  totalValue: number;
  marketCap: number;
}

export default function SharePage() {
  const { data: session } = useSession();
  const { state } = useApi();
  const [activeTab, setActiveTab] = useState<'my-shares' | 'trending' | 'market'>('my-shares');
  const [shares, setShares] = useState<ShareData[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for shares - replace with actual API call
  useEffect(() => {
    const mockShares: ShareData[] = [
      {
        id: '1',
        symbol: 'CLAPO',
        name: 'Clapo Token',
        currentPrice: 0.85,
        change24h: 0.12,
        changePercent: 16.47,
        shares: 1500,
        totalValue: 1275.00,
        marketCap: 85000000
      },
      {
        id: '2',
        symbol: 'WEB3',
        name: 'Web3 Protocol',
        currentPrice: 2.34,
        change24h: -0.08,
        changePercent: -3.31,
        shares: 800,
        totalValue: 1872.00,
        marketCap: 234000000
      },
      {
        id: '3',
        symbol: 'SOCIAL',
        name: 'Social Finance',
        currentPrice: 1.56,
        change24h: 0.23,
        changePercent: 17.31,
        shares: 2200,
        totalValue: 3432.00,
        marketCap: 156000000
      }
    ];
    setShares(mockShares);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const renderMyShares = () => (
    <div className="space-y-4">
      <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Summary</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(shares.reduce((sum, share) => sum + share.totalValue, 0))}
            </div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-white">
              {shares.reduce((sum, share) => sum + share.shares, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Shares</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-400">
              +{formatCurrency(shares.reduce((sum, share) => sum + share.change24h * share.shares, 0))}
            </div>
            <div className="text-sm text-gray-400">24h Change</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-400">
              {shares.length}
            </div>
            <div className="text-sm text-gray-400">Assets</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">My Shares</h3>
        {shares.map((share) => (
          <motion.div
            key={share.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-700/50 rounded-xl p-4 border border-dark-600/50 hover:border-dark-500/50 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{share.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-semibold text-white">{share.symbol}</div>
                  <div className="text-sm text-gray-400">{share.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-white">{formatCurrency(share.currentPrice)}</div>
                <div className={`text-sm ${share.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {share.changePercent >= 0 ? '+' : ''}{share.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-400">Shares</div>
                <div className="font-semibold text-white">{share.shares.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Value</div>
                <div className="font-semibold text-white">{formatCurrency(share.totalValue)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Market Cap</div>
                <div className="font-semibold text-white">{formatNumber(share.marketCap)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTrending = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Trending Shares</h3>
      <div className="space-y-3">
        {shares
          .sort((a, b) => b.changePercent - a.changePercent)
          .map((share, index) => (
            <motion.div
              key={share.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-700/50 rounded-xl p-4 border border-dark-600/50 hover:border-dark-500/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">{share.symbol.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{share.symbol}</div>
                    <div className="text-sm text-gray-400">{share.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">{formatCurrency(share.currentPrice)}</div>
                  <div className={`text-sm ${share.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {share.changePercent >= 0 ? '+' : ''}{share.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );

  const renderMarket = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Market Overview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600/50">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h4 className="font-semibold text-white">Top Gainers</h4>
          </div>
          <div className="space-y-2">
            {shares
              .filter(share => share.changePercent > 0)
              .sort((a, b) => b.changePercent - a.changePercent)
              .slice(0, 3)
              .map((share) => (
                <div key={share.id} className="flex items-center justify-between text-sm">
                  <span className="text-white">{share.symbol}</span>
                  <span className="text-green-400">+{share.changePercent.toFixed(2)}%</span>
                </div>
              ))}
          </div>
        </div>
        
        <div className="bg-dark-700/50 rounded-xl p-4 border border-dark-600/50">
          <div className="flex items-center space-x-3 mb-3">
            <BarChart3 className="w-6 h-6 text-red-400" />
            <h4 className="font-semibold text-white">Top Losers</h4>
          </div>
          <div className="space-y-2">
            {shares
              .filter(share => share.changePercent < 0)
              .sort((a, b) => a.changePercent - b.changePercent)
              .slice(0, 3)
              .map((share) => (
                <div key={share.id} className="flex items-center justify-between text-sm">
                  <span className="text-white">{share.symbol}</span>
                  <span className="text-red-400">{share.changePercent.toFixed(2)}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Shares & Trading</h2>
        <p className="text-gray-400">Track your investments and market performance</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-dark-800 rounded-xl p-1 relative">
          {["my-shares", "trending", "market"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium relative z-10 transition-all duration-200 ${
                activeTab === tab ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "my-shares" ? "My Shares" : tab === "trending" ? "Trending" : "Market"}
            </button>
          ))}
          
          <motion.div
            className="absolute h-8 bg-dark-700 rounded-lg"
            initial={false}
            animate={{
              left: activeTab === "my-shares" ? "0%" : activeTab === "trending" ? "33.33%" : "66.66%",
              width: "33.33%",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "my-shares" && renderMyShares()}
        {activeTab === "trending" && renderTrending()}
        {activeTab === "market" && renderMarket()}
      </div>
    </div>
  );
}