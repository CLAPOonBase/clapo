import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Circle, Star, TrendingUp, Users, Volume2 } from 'lucide-react';

// Types
interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  price: number;
  change: number;
  holders: number;
  isVerified?: boolean;
  marketCap: number;
  volume24h: number;
}

interface Community {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  price: number;
  change: number;
  description?: string;
}

interface Post {
  id: string;
  author: string;
  content: string;
  image: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface ActivityItem {
  id: string;
  user: string;
  avatar: string;
  action: 'bought' | 'sold';
  timestamp: string;
}

interface Share {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  changePercent: number;
  change24h: number;
  shares: number;
  totalValue: number;
  marketCap: number;
}

// Mock data
const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'KIZZY GLOBAL',
    handle: '@KIZZY',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    price: 2.159,
    change: 3.24,
    holders: 13,
    isVerified: true,
    marketCap: 28500,
    volume24h: 5200
  },
  {
    id: '2',
    name: 'ALEX CREATOR',
    handle: '@ALEX',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b812b820?w=100&h=100&fit=crop&crop=face',
    price: 1.845,
    change: -1.2,
    holders: 8,
    isVerified: true,
    marketCap: 15600,
    volume24h: 3100
  },
  {
    id: '3',
    name: 'SARAH TECH',
    handle: '@SARAH',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    price: 3.421,
    change: 5.67,
    holders: 25,
    isVerified: false,
    marketCap: 85500,
    volume24h: 12300
  },
  {
    id: '4',
    name: 'MIKE GAMING',
    handle: '@MIKE',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face',
    price: 0.987,
    change: 2.1,
    holders: 5,
    isVerified: false,
    marketCap: 4900,
    volume24h: 890
  },
  {
    id: '5',
    name: 'EMMA ARTS',
    handle: '@EMMA',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face',
    price: 4.123,
    change: -0.8,
    holders: 31,
    isVerified: true,
    marketCap: 127800,
    volume24h: 18500
  }
];

const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Crypto Traders',
    avatar: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop',
    memberCount: 2543,
    price: 1.234,
    change: 4.5
  },
  {
    id: '2',
    name: 'DeFi Enthusiasts',
    avatar: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=100&fit=crop',
    memberCount: 1876,
    price: 2.567,
    change: -2.1
  },
  {
    id: '3',
    name: 'NFT Collectors',
    avatar: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
    memberCount: 3421,
    price: 3.789,
    change: 7.8
  }
];

const mockShares: Share[] = [
  {
    id: '1',
    symbol: 'KIZZY',
    name: 'Kizzy Global',
    currentPrice: 2.159,
    changePercent: 3.24,
    change24h: 0.067,
    shares: 25,
    totalValue: 53.975,
    marketCap: 28500
  },
  {
    id: '2',
    symbol: 'ALEX',
    name: 'Alex Creator',
    currentPrice: 1.845,
    changePercent: -1.2,
    change24h: -0.022,
    shares: 10,
    totalValue: 18.45,
    marketCap: 15600
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Riley_Seay',
    content: 'Just dropped some fire content! 🔥',
    image: '/api/placeholder/300/200',
    timestamp: '2h',
    likes: 234,
    comments: 45
  },
  {
    id: '2',
    author: 'Alexander_H',
    content: 'Working on something special...',
    image: '/api/placeholder/300/200',
    timestamp: '4h',
    likes: 189,
    comments: 23
  },
  {
    id: '3',
    author: 'Nightcap',
    content: 'Behind the scenes of today\'s shoot',
    image: '/api/placeholder/300/200',
    timestamp: '6h',
    likes: 456,
    comments: 78
  }
];

const mockActivity: ActivityItem[] = [
  { id: '1', user: 'Alex', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&fit=crop&crop=face', action: 'bought', timestamp: '2m ago' },
  { id: '2', user: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b812b820?w=32&h=32&fit=crop&crop=face', action: 'sold', timestamp: '5m ago' },
  { id: '3', user: 'Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face', action: 'bought', timestamp: '8m ago' },
  { id: '4', user: 'Emma', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face', action: 'bought', timestamp: '12m ago' },
  { id: '5', user: 'David', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=32&h=32&fit=crop&crop=face', action: 'sold', timestamp: '15m ago' }
];

const chartData = [
  { time: '1d', price: 1.8 },
  { time: '2d', price: 1.9 },
  { time: '3d', price: 2.0 },
  { time: '4d', price: 2.1 },
  { time: '5d', price: 2.15 },
  { time: '6d', price: 2.159 }
];

export default function CreatorTradingPlatform() {
  const [activeTab, setActiveTab] = useState<'creators' | 'communities' | 'myshares'>('creators');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [connectWallet, setConnectWallet] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(1) + 'B';
    }
    if (num >= 1e6) {
      return (num / 1e6).toFixed(1) + 'M';
    }
    if (num >= 1e3) {
      return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const handleCreatorClick = (creator: Creator) => {
    setSelectedCreator(creator);
    setSelectedCommunity(null);
  };

  const handleCommunityClick = (community: Community) => {
    // Convert community to creator-like object for display
    const communityAsCreator: Creator = {
      id: community.id,
      name: community.name,
      handle: `@${community.name.replace(/\s+/g, '').toLowerCase()}`,
      avatar: community.avatar,
      price: community.price,
      change: community.change,
      holders: community.memberCount,
      marketCap: community.memberCount * community.price,
      volume24h: Math.floor(Math.random() * 10000) + 1000
    };
    setSelectedCreator(communityAsCreator);
    setSelectedCommunity(community);
  };

  const handleBack = () => {
    setSelectedCreator(null);
    setSelectedCommunity(null);
  };

  const renderMyShares = () => (
    <div className="space-y-4">
      <div className="bg-black rounded-xl p-4 border border-gray-600/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Summary</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(mockShares.reduce((sum, share) => sum + share.totalValue, 0))}
            </div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-white">
              {mockShares.reduce((sum, share) => sum + share.shares, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Shares</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-400">
              +{formatCurrency(mockShares.reduce((sum, share) => sum + share.change24h * share.shares, 0))}
            </div>
            <div className="text-sm text-gray-400">24h Change</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-400">
              {mockShares.length}
            </div>
            <div className="text-sm text-gray-400">Assets</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">My Shares</h3>
        {mockShares.map((share) => (
          <motion.div
            key={share.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-200 cursor-pointer"
            onClick={() => {
              const creator = mockCreators.find(c => c.handle === `@${share.symbol}`);
              if (creator) handleCreatorClick(creator);
            }}
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

  // Show detailed creator page when one is selected
  if (selectedCreator) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="w-full">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 mb-6"
          >
            <span>←</span>
            <span>Back to Explore</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Creator Profile & Activity */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Creator Profile Card */}
              <div className="bg-black rounded-2xl p-6 border border-gray-800">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                      <img 
                        src={selectedCreator.avatar} 
                        alt={selectedCreator.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold text-white">{selectedCreator.name}</h1>
                        {selectedCreator.isVerified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-400">{selectedCreator.handle}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-2xl font-bold text-green-400">${selectedCreator.price}</span>
                        <span className={`text-sm ${selectedCreator.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedCreator.change >= 0 ? '+' : ''}{selectedCreator.change}%
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{selectedCreator.holders} HOLDERS</p>
                    </div>
                  </div>
                </div>

                {/* Live Activity Tracker */}
                <div className="bg-black rounded-xl p-4 border-2 border-[#3A07F4]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-400 font-semibold text-sm">LIVE ACTIVITY TRACKER</h3>
                    <div className="text-gray-400 text-xs">
                      Bob just bought a share of {selectedCreator.name} • +{Math.floor(Math.random() * 50) + 10} Holders in 24 hours
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {/* <Circle className="rounded-full"/> */}
                    <span className="text-gray-400 text-xs">TOP HOLDERS</span>
                    <div className="flex items-center space-x-1">
                      {mockActivity.slice(0, 5).map((activity, i) => (
                        <div key={activity.id} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-gray-900" style={{ marginLeft: i > 0 ? '-8px' : '0' }}>
                          <img src={activity.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-black rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">CONTENT PREVIEW</h2>
                  <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full text-sm font-medium transition-colors">
                    MOST COLLECTED POST
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockPosts.map((post, i) => (
                    <div key={post.id} className="bg-black rounded-xl overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 relative">
                        {i === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
                              <span className="text-2xl">🐻</span>
                            </div>
                          </div>
                        )}
                        {i === 1 && (
                          <div className="absolute inset-0 bg-white flex items-center justify-center">
                            <div className="text-black text-4xl">📱</div>
                          </div>
                        )}
                        {i === 2 && (
                          <div className="absolute inset-0 bg-amber-600 flex items-center justify-center">
                            <div className="text-2xl">🎭</div>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">@{post.author}</span>
                          <span className="text-gray-400">{post.timestamp}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-3 text-gray-400 text-sm">
                            <span>❤️ {post.likes}</span>
                            <span>💬 {post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button className="flex-1 bg-green-600 hover:bg-green-700 py-4 rounded-2xl font-bold text-lg transition-colors">
                  BUY CREATOR SHARE
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-2xl font-bold text-lg transition-colors">
                  SELL
                </button>
                <button className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-2xl font-bold text-lg transition-colors">
                  COLLECT POST
                </button>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
              {/* Wallet Connection */}
              <div className="bg-black rounded-2xl p-4 border border-gray-800">
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setConnectWallet(!connectWallet)}
                    className="flex-1 text-sm bg-black hover:bg-black py-1 px-2 rounded-xl text-center transition-colors"
                  >
                    CONNECT X
                  </button>
                  <button className="flex-1 text-sm bg-purple-600 hover:bg-purple-700 py-1 px-2 rounded-xl text-center transition-colors">
                    CONNECT WALLET
                  </button>
                </div>
              </div>

              {/* Community Chat */}
              <div className="p-2 overflow-hidden flex flex-col justify-center items-start border-2 border-gray-700/70 rounded-2xl mb-4">
                                  <span className="bg-black rounded-full px-2 mt-2">
                                 Community Chat
                                  </span>
                                  <div className="flex items-center space-x-3 my-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xs font-bold">{selectedCreator.name.charAt(0)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-sm">{selectedCreator.name}</span>
                    <p className="text-gray-400 text-xs">Top Shareholder</p>
                  </div>
                  <button className="ml-auto bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-full text-xs transition-colors">
                    GET ACCESS
                  </button>
                </div>
                                </div>

              {/* Holder Perks */}
              <div className="bg-black rounded-2xl p-6 border border-gray-800">
                <h3 className="font-bold mb-4">HOLDER PERKS</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-orange-400">👏</span>
                      <span className="text-sm">WEIGHTED CLAPS</span>
                    </div>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-400">💬</span>
                      <span className="text-sm">PRIVATE CHATROOM ACCESS</span>
                    </div>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400">🚀</span>
                      <span className="text-sm">EARLY ACCESS TO CAMPAIGNS</span>
                    </div>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>

              {/* Market Data */}
              <div className="bg-black rounded-2xl p-6 border border-gray-800">
                <h3 className="font-bold mb-4">MARKET DATA</h3>
                
                {/* Chart */}
                <div className="h-32 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9CA3AF' }}
                      />
                      <YAxis hide />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">SNAP PRICE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">MARKET PRICE</span>
                    <span className="text-green-400 font-mono">${formatNumber(selectedCreator.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">TRADING VOLUME</span>
                    <span className="text-white font-mono">${formatNumber(selectedCreator.volume24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">LEADERBOARD RANK</span>
                    <span className="text-white font-mono">#3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Explore View (List)
  return (
    <div className="min-h-[700px] p-4 bg-black text-white rounded-2xl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-6">Explore</h1>
          
          {/* Tabs */}
          <div className="relative flex w-full rounded-lg p-1 bg-black">
            {["creators", "communities", "myshares"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "creators" | "communities" | "myshares")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium relative z-10 transition-colors ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "creators" ? "Creators" : tab === "communities" ? "Communities" : "My Shares"}
              </button>
            ))}
            <motion.div
              className="absolute h-[40px] rounded-full"
              style={{
                boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
                backgroundColor: "#6E54FF",
              }}
              initial={false}
              animate={{
                left: activeTab === "creators" ? "0%" : activeTab === "communities" ? "33.33%" : "66.66%",
                width: "33.33%",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        </div>

        {/* Content */}
        {activeTab === "myshares" ? (
          renderMyShares()
        ) : (
          <div className="space-y-3">
            {activeTab === "creators"
              ? mockCreators.map((creator, i) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-black ${
                      i % 2 === 0 ? "bg-[#10151A]/80" : "bg-[#1A1F25]/60"
                    }`}
                    onClick={() => handleCreatorClick(creator)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                          <img
                            src={creator.avatar}
                            alt={creator.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        {creator.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-[#0D1117] flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">{creator.name}</span>
                        </div>
                        <div className="text-gray-400 text-sm">{creator.handle}</div>
                        <div className="text-gray-400 text-xs">{creator.holders} holders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">${creator.price.toFixed(3)}</div>
                      <div className={`text-sm ${creator.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {creator.change >= 0 ? '+' : ''}{creator.change.toFixed(2)}%
                      </div>
                      <div className="text-gray-400 text-xs">
                        {formatNumber(creator.marketCap)} cap
                      </div>
                    </div>
                  </motion.div>
                ))
              : mockCommunities.map((community, i) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-black ${
                      i % 2 === 0 ? "bg-[#10151A]/80" : "bg-[#1A1F25]/60"
                    }`}
                    onClick={() => handleCommunityClick(community)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
                        <img
                          src={community.avatar}
                          alt={community.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-semibold">{community.name}</div>
                        <div className="text-gray-400 text-sm">
                          {formatNumber(community.memberCount)} members
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">${community.price.toFixed(3)}</div>
                      <div className={`text-sm ${community.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {community.change >= 0 ? '+' : ''}{community.change.toFixed(2)}%
                      </div>
                      <div className="text-blue-400 text-sm">→</div>
                    </div>
                  </motion.div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}