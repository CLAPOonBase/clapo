import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  Circle,
  Star,
  TrendingUp,
  Users,
  Volume2,
  ArrowLeft,
  Check,
  Crown,
  MessageCircle,
  Zap,
  Lock,
  Award,
  BarChart3,
  Wallet,
  Twitter,
  MessageCircleIcon,
  Heart,
  ArrowUpFromLine,
  Bookmark,
  Triangle
} from 'lucide-react';

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
    content: 'Just dropped some fire content!',
    image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=300&h=200&fit=crop',
    timestamp: '2h',
    likes: 234,
    comments: 45
  },
  {
    id: '2',
    author: 'Alexander_H',
    content: 'Working on something special...',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=300&h=200&fit=crop',
    timestamp: '4h',
    likes: 189,
    comments: 23
  },
  {
    id: '3',
    author: 'Nightcap',
    content: 'Behind the scenes of today\'s shoot',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=200&fit=crop',
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
      <div className="bg-black rounded-xl p-4 border-2 border-gray-700/70">
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
            className="bg-black rounded-xl p-4 border-2 border-gray-700/70 hover:border-gray-600/50 transition-all duration-200 cursor-pointer"
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
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explore</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Creator Profile & Activity */}
            <div className="lg:col-span-2 space-y-2">
              
              {/* Creator Profile Card */}
              <div className="bg-black rounded-2xl p-6 border-2 border-gray-700/70">
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
                            <Check className="w-3 h-3 text-white" />
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
                <div className=" rounded-xl border border-[#6E54FF]">
                  <div className="flex items-center justify-between pb-2 p-2 border-b border-gray-700/70">
                    <div className="flex items-center space-x-2">
                     
                      <h3 className="text-white italic font-semibold text-sm">LIVE ACTIVITY TRACKER</h3>
                    </div>
                    <div className="text-gray-400 text-xs">
                      Bob just bought a share of {selectedCreator.name} • +{Math.floor(Math.random() * 50) + 10} Holders in 24 hours
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2">
                    
                    <span className="text-gray-400 text-xs flex gap-2 items-center"> <div className="w-3 h-3 text-green-400 border border-[#6E54FF] rounded-full  fill-green-400" ></div> TOP HOLDERS</span>
                    <div className="flex items-center space-x-1">
                      {mockActivity.slice(0, 5).map((activity, i) => (
                        <div key={activity.id} className="w-8 h-8 rounded-full bg-gradient-to-br border-2 border-gray-900" style={{ marginLeft: i > 0 ? '-8px' : '0' }}>
                          <img src={activity.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
  <h2 className="text-xl px-2 font-bold text-white">CONTENT PREVIEW</h2>
              {/* Content Preview */}
              <div className="bg-black rounded-2xl px-4 py-2  border-2 border-gray-700/70">
                <div className="flex items-center justify-between -mt-8 mb-6">
                <span></span>
                  <button style={{
          height: "30px",
          boxShadow:
            "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
          backgroundColor: "#6E54FF",
          margin: "6px",
        }} className="bg-purple-600 hover:bg-purple-700 px-4 rounded-full text-sm font-medium transition-colors">
                    MOST COLLECTED POST
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockPosts.map((post) => (
                    <div key={post.id} className="bg-gray-800/30 rounded-xl overflow-hidden hover:bg-gray-700/30 transition-colors cursor-pointer border-2 border-gray-700/70">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.content}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">@{post.author}</span>
                          <span className="text-gray-400">{post.timestamp}</span>
                        </div>
                        <p className="text-white text-sm mt-2">{post.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1 text-gray-400 text-xs">
                            <span className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{post.comments}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-xs">
                       
                              <MessageCircleIcon className="w-3 h-3" />
                              <span>{post.likes}</span>
                               <ArrowUpFromLine className="w-3 h-3" />
                              <span>{post.comments * 2}</span>
                            </span>
                          </div>
                          <div className='text-gray-400 text-xs space-x-1 flex items-center '>
                             <Bookmark className="w-3 h-3" />
                              <span>{post.comments * 2}</span>
                              <Triangle className="w-3 h-3 text-green-400" />
                              <span className='text-green-600'>{post.comments * 0.5}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
          <div className="flex space-x-4 w-full">
  <button 
    className="inline-flex w-full items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[6px] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[hsla(220,10%,12%,1)] text-white shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(0,0,0,0.08),0px_0px_0px_1px_#000] hover:bg-[hsla(220,10%,18%,1)] px-8 py-2 text-sm rounded-2xl leading-[24px] font-bold whitespace-nowrap"
    style={{ height: "30px", margin: "6px" }}
  >
    BUY CREATOR SHARE
  </button>
  
  <button 
    className="inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors px-8 py-2 text-sm rounded-2xl font-bold whitespace-nowrap"
    style={{
      height: "30px",
      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
      backgroundColor: "#6E54FF",
      margin: "6px",
    }}
  >
    SELL
  </button>
  
  <button 
    className="inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-colors px-8 py-2 text-sm rounded-2xl font-bold whitespace-nowrap"
    style={{
      height: "30px",
      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
      backgroundColor: "#6E54FF",
      margin: "6px",
    }}
  >
    COLLECT POST
  </button>
</div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              
          

              {/* Community Chat */}
              <div className="bg-black rounded-2xl p-4 border-2 border-gray-700/70">
                <div className="flex items-center space-x-2 mb-4">
                  <MessageCircle className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white">Community Chat</span>
                </div>
                <div className="flex justify-between items-center space-x-3">
              <div className='flex items-center space-x-3'>
                    <div className="w-8 h-8 rounded-full border border-gray-700/70 to-pink-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{selectedCreator.name.charAt(0)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-sm text-white">{selectedCreator.name}</span>
                    <p className="text-gray-400 text-xs">Top Shareholder</p>
                  </div>
              </div>
                  <button style={{
          height: "30px",
          boxShadow:
            "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
          backgroundColor: "#6E54FF",
          margin: "6px",
        }} className="ml-auto bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-full text-xs transition-colors">
                    GET ACCESS
                  </button>
                </div>
              </div>

              {/* Holder Perks */}
              <div className="bg-black rounded-2xl p-6 border-2 border-gray-700/70">
                <h3 className="font-bold mb-4 text-white">HOLDER PERKS</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-gray-300">WEIGHTED CLAPS</span>
                    </div>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">PRIVATE CHATROOM ACCESS</span>
                    </div>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-300">EARLY ACCESS TO CAMPAIGNS</span>
                    </div>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                </div>
              </div>

              {/* Market Data */}
              <div className="bg-black rounded-2xl p-6 border-2 border-gray-700/70">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <h3 className="font-bold text-white">MARKET DATA</h3>
                </div>
                
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
                    <span className="text-white font-mono">${selectedCreator.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">MARKET CAP</span>
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
   <div className="bg-gray-700/70 rounded-full mt-2 p-1">
  <div>
<div className="flex justify-around bg-black m-1 p-1 items-center rounded-full relative">
  {["Creators", "Communities", "My Shares"].map((tab) => {
    const tabValue =
      tab === "Creators"
        ? "creators"
        : tab === "Communities"
        ? "communities"
        : "myshares";
    return (
      <button
        key={tab}
        onClick={() => setActiveTab(tabValue)}
        className={`flex-1 text-center p-2 font-semibold text-xs sm:text-sm relative z-10 ${
          activeTab === tabValue ? "text-white" : "text-gray-400"
        }`}
      >
        {tab}
      </button>
    );
  })}

  <motion.div
    className="absolute top-1 bottom-1 rounded-full bg-[#6E54FF]"
    style={{
      boxShadow:
        "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
    }}
    initial={false}
    animate={{
      left:
        activeTab === "creators"
          ? "4px"
          : activeTab === "communities"
          ? "33.3333%"
          : "66.6666%",
      width: "33.3333%",
    }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
  />
</div>

  </div>
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
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-black border-2 border-gray-700/70 ${
                      i % 2 === 0 ? "bg-gray-900/30" : "bg-gray-900/10"
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
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-semibold">{creator.name}</span>
                        </div>
                        <div className="text-gray-400 text-sm">{creator.handle}</div>
                        <div className="text-gray-400 text-xs flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{creator.holders} holders</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">${creator.price.toFixed(3)}</div>
                      <div className={`text-sm flex items-center justify-end space-x-1 ${creator.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <TrendingUp className={`w-3 h-3 ${creator.change < 0 ? 'rotate-180' : ''}`} />
                        <span>{creator.change >= 0 ? '+' : ''}{creator.change.toFixed(2)}%</span>
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
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-black border-2 border-gray-700/70 ${
                      i % 2 === 0 ? "bg-gray-900/30" : "bg-gray-900/10"
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
                        <div className="text-gray-400 text-sm flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{formatNumber(community.memberCount)} members</span>
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