import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
interface User {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  isOnline?: boolean;
}

interface Community {
  id: string;
  name: string;
  avatar: string;
  memberCount: number;
  description?: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: 'Buy' | 'Sell';
  quantity: number;
  price: number;
  timestamp: Date;
}

interface PoolInfo {
  username: string;
  avatar: string;
  avgPrice: number;
  buyPrice: number;
  sellPrice: number;
  holders: number;
  marketCap: number;
  totalTickets: number;
  ticketPrice: number;
  chartData: { x: number; y: number }[];
}

// Chart Component
const Chart: React.FC<{ data: { x: number; y: number }[]; width?: number; height?: number }> = ({ 
  data, 
  width = 300, 
  height = 150 
}) => {
  if (!data || data.length === 0) return null;

  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));

  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * width;
  const scaleY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

  const pathData = data.map((point, index) => {
    const x = scaleX(point.x);
    const y = scaleY(point.y);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className=" p-4">
      <svg width={width} height={height} className="w-full h-auto">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        {/* Fill area */}
        <path
          d={`${pathData} L ${scaleX(data[data.length - 1].x)} ${height} L ${scaleX(data[0].x)} ${height} Z`}
          fill="url(#chartGradient)"
        />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Points */}
        {data.map((point, index) => (
          <circle
            key={index}
            cx={scaleX(point.x)}
            cy={scaleY(point.y)}
            r={3}
            fill="#22d3ee"
            stroke="#0f172a"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
};

// Main Trading Platform Component
export default function TradingPlatform() {
  const [activeTab, setActiveTab] = useState<'users' | 'communities'>('users');
  const [selectedPool, setSelectedPool] = useState<PoolInfo | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Mock data generation
  useEffect(() => {
    const generateUsers = (): User[] => {
      const avatars = [
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1494790108755-2616b812b820?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      ];
      
      return Array.from({ length: 7 }, (_, i) => ({
        id: `user-${i}`,
        username: 'Shadowomics',
        avatar: avatars[i],
        balance: 108,
        isOnline: Math.random() > 0.5
      }));
    };

    const generateCommunities = (): Community[] => {
      const names = ['Crypto Traders', 'DeFi Enthusiasts', 'NFT Collectors', 'Blockchain Devs', 'Web3 Builders', 'Metaverse Explorers', 'Token Holders'];
      const avatars = [
        'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=100&h=100&fit=crop',
        'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&h=100&fit=crop'
      ];
      
      return names.map((name, i) => ({
        id: `community-${i}`,
        name,
        avatar: avatars[i],
        memberCount: Math.floor(Math.random() * 10000) + 1000
      }));
    };

    const generateActivities = (): ActivityItem[] => {
      const userNames = ['Ethan', 'Emma', 'Liam', 'Olivia', 'Noah'];
      return Array.from({ length: 5 }, (_, i) => ({
        id: `activity-${i}`,
        user: userNames[i],
        action: (Math.random() > 0.5 ? 'Buy' : 'Sell') as 'Buy' | 'Sell',
        quantity: 1000,
        price: 201.25,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      }));
    };

    setUsers(generateUsers());
    setCommunities(generateCommunities());
    setActivities(generateActivities());
  }, []);

  const handleUserClick = (user: User) => {
    const poolInfo: PoolInfo = {
      username: user.username,
      avatar: user.avatar,
      avgPrice: 162.83,
      buyPrice: 201.25,
      sellPrice: 201.25,
      holders: 2743,
      marketCap: 22296,
      totalTickets: 10756,
      ticketPrice: 201.25,
      chartData: [
        { x: 1, y: 100 },
        { x: 2, y: 120 },
        { x: 3, y: 180 },
        { x: 4, y: 160 },
        { x: 5, y: 200 },
        { x: 6, y: 180 },
        { x: 7, y: 220 }
      ]
    };
    setSelectedPool(poolInfo);
  };

  const handleCommunityClick = (community: Community) => {
    const poolInfo: PoolInfo = {
      username: community.name,
      avatar: community.avatar,
      avgPrice: 185.50,
      buyPrice: 225.75,
      sellPrice: 225.75,
      holders: community.memberCount,
      marketCap: 45500,
      totalTickets: 15680,
      ticketPrice: 225.75,
      chartData: [
        { x: 1, y: 150 },
        { x: 2, y: 170 },
        { x: 3, y: 200 },
        { x: 4, y: 190 },
        { x: 5, y: 230 },
        { x: 6, y: 210 },
        { x: 7, y: 250 }
      ]
    };
    setSelectedPool(poolInfo);
  };

  const handleBack = () => {
    setSelectedPool(null);
  };

  // Pool Details View
  if (selectedPool) {
    return (
      <div className="min-h-[700px] p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="text-dark-400 hover:text-white transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>

        {/* Pool Info Card */}
        <div className="bg-dark-800/50 rounded-xl p-6 mb-6 border border-dark-700/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img 
                src={selectedPool.avatar} 
                alt={selectedPool.username}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h1 className="text-white text-2xl font-bold">#{selectedPool.username}</h1>
                <div className="bg-blue-600 px-3 py-1 rounded-full text-white text-sm font-medium inline-block mt-2">
                  Buy shares
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <Chart data={selectedPool.chartData} />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-dark-400 text-sm">Avg Price</div>
              <div className="text-white text-lg font-semibold">${selectedPool.avgPrice}</div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-dark-400 text-sm">Buy Price</div>
              <div className="text-green-400 text-lg font-semibold">${selectedPool.buyPrice}</div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-dark-400 text-sm">Sell Price</div>
              <div className="text-red-400 text-lg font-semibold">${selectedPool.sellPrice}</div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-dark-400 text-sm">Holders</div>
              <div className="text-white text-lg font-semibold">{selectedPool.holders}</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-dark-400 text-sm">Market Cap</div>
              <div className="text-white text-lg font-semibold">
                ${selectedPool.marketCap.toLocaleString()}
              </div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-dark-400 text-sm">Total Tickets</div>
              <div className="text-white text-lg font-semibold">
                {selectedPool.totalTickets.toLocaleString()}
              </div>
            </div>
            <div className="bg-dark-800/50 rounded-lg p-4">
              <div className="text-dark-400 text-sm">Ticket Price</div>
              <div className="text-white text-lg font-semibold">
                ${selectedPool.ticketPrice}
              </div>
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="space-y-2">
          <h3 className="text-white text-lg font-semibold mb-4">Activity</h3>
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {activity.user.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-dark-400 text-sm">{activity.user}</div>
                  <div className="text-white text-sm">
                    <span className={activity.action === 'Buy' ? 'text-green-400' : 'text-red-400'}>
                      {activity.action}
                    </span>
                    <span className="ml-2">{activity.quantity.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  ${activity.price.toFixed(2)}
                </div>
                <div className="text-dark-400 text-xs">
                  {activity.timestamp.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Main Explore View
  return (
    <div className="min-h-[700px] p-4">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-6">Explore</h1>
          
          {/* Tabs */}
 <div
      style={{ zIndex: "9999" }}
      className="relative flex max-w-3xl rounded-lg p-1"
    >
      {["users", "communities"].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab as "users" | "communities")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium relative z-10 ${
            activeTab === tab ? "text-white" : "text-dark-400 hover:text-white"
          }`}
        >
          {tab === "users" ? "Users" : "Communities"}
        </button>
      ))}

      <motion.div
    className="absolute h-[40px] bg-dark-700/70 rounded-full"
   style={{
  boxShadow:
    "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
  backgroundColor: "#6E54FF",
  color: "white",
//   padding: "8px 16px",
}}

    initial={false}
    animate={{
      left: activeTab === "users" ? "0%" : "50%", // centers under button
      width: "50%", // same width for both
    }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
  />

    </div>
        </div>

        {/* Content */}
        <div style={{
  boxShadow:
  // make this color in white instead of blue to match the background
  "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 1px 0px rgba(26, 26, 26, 0.7), 0px 0px 0px 1px rgba(26, 26, 26, 0.7)"
//   padding: "8px 16px",
}} className="space-y-3 rounded-2xl p-4">
          {activeTab === 'users' ? (
            users.map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-4 bg-dark-800/70 rounded-2xl hover:bg-dark-700/50 cursor-pointer transition-all duration-200 border border-dark-700/50"
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {user.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-800"></div>
                    )}
                  </div>
                  <span className="text-white font-medium">@{user.username}</span>
                </div>
                <div className="text-green-400 font-semibold">
                  ${user.balance.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            communities.map((community) => (
              <div 
                key={community.id}
                className="flex items-center justify-between p-4 bg-dark-800/70 rounded-2xl hover:bg-dark-700/50 cursor-pointer transition-all duration-200 border border-dark-700/50"
                onClick={() => handleCommunityClick(community)}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={community.avatar} 
                    alt={community.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-white font-medium">{community.name}</div>
                    <div className="text-dark-400 text-sm">{community.memberCount.toLocaleString()} members</div>
                  </div>
                </div>
                <div className="text-blue-400">
                  →
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}