import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';


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

 const chartData = [
    { name: 'Item1', value: 800 },
    { name: 'Item2', value: 3800 },
    { name: 'Item3', value: 1200 },
    { name: 'Item4', value: 3200 },
    { name: 'Item5', value: 2500 }
  ];

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

 const customBoxStyle = {
    boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.5) inset, 0px 1px 2px 0px rgba(26, 26, 26, 0.7), 0px 0px 0px 1px #1a1a1a",
  };

  const handleBack = () => {
    console.log('Back clicked');
  };

  // Pool Details View
  if (selectedPool) {
    return (
      <div className="min-h-[700px]">
        {/* Header */}
 <div className=" text-white">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={handleBack}
            className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
          {/* Left Section - Profile and Chart */}
          <div className="lg:col-span-2">
            {/* Profile Card */}
            <div 
          
            >
<div style= {customBoxStyle} className=' bg-dark-800 rounded-xl p-6 mb-6'>
                <div className="flex items-center space-x-4">
<div className="w-20 h-20 rounded-full relative">
  <img
    src="/bg.svg"
    alt="Background SVG"
    className="absolute inset-0 w-full h-full"
  />
  <Image
    src="https://robohash.org/ben.png?size=500x500"
    alt="Profilepage"
    width={80}
    height={80}
    className="absolute inset-1 w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] rounded-full object-cover"
    unoptimized
  />
</div>

                <div>
                  <h1 className="text-white text-2xl font-bold">@johndoe</h1>
                </div>
              </div>

              {/* Chart Section */}
              <div className="">
                <div className="flex justify-between items-center my-2">
                  {/* <h3 className="text-gray-300 text-sm">Pool Details : Clapo investment</h3> */}
                  {/* <span className="text-gray-300 text-sm">Pool Size : $252352</span> */}
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#00D4FF" 
                        strokeWidth={3}
                        dot={{ fill: '#00D4FF', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
</div>

              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div 
                  className="bg-gray-700/50 rounded-lg p-4"
                  style={customBoxStyle}
                >
                  <div className="text-gray-400 text-sm mb-1">Members</div>
                  <div className="text-white text-xl font-semibold">2733</div>
                </div>
                <div 
                  className="bg-gray-700/50 rounded-lg p-4"
                  style={customBoxStyle}
                >
                  <div className="text-gray-400 text-sm mb-1">Circ. Ticket</div>
                  <div className="text-white text-xl font-semibold">27,300</div>
                </div>
                <div 
                  className="bg-gray-700/50 rounded-lg p-4"
                  style={customBoxStyle}
                >
                  <div className="text-gray-400 text-sm mb-1">Last Traded</div>
                  <div className="text-white text-xl font-semibold">2 hrs Ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Trading Panel */}
          <div className="space-y-4 flex flex-col justify-between">
             <div 
              className="bg-gray-800/80 rounded-xl p-6"
              style={customBoxStyle}
            >
              <h3 className="text-gray-300 text-lg mb-2 ">Pool</h3>
              <div className="text-green-500 text-3xl font-bold">$ 120,200</div>
            </div>
             {/* Buy Price */}
            <div 
              className="bg-gray-800/80 rounded-xl p-6"
              style={customBoxStyle}
            >
              <h3 className="text-gray-300 text-lg mb-2">Buy Price</h3>
              <div className="text-green-400 text-3xl font-bold">1.011</div>
            </div>

            {/* Sell Price */}
            <div 
              className="bg-gray-800/80 rounded-xl p-6"
              style={customBoxStyle}
            >
              <h3 className="text-gray-300 text-lg mb-2">Sell Price</h3>
              <div className="text-red-500 text-3xl font-bold">1.0101</div>
            </div>

            {/* Holders */}
          

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
             style={{
  boxShadow:
    "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(21, 128, 61, 0.50), 0px 0px 0px 1px #15803D",
  backgroundColor: "#15803D",
  color: "white",
  // padding: "8px 16px",
  // borderRadius: "8px",
}}


                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-full font-semibold transition-colors"
                
              >
                Buy Shares
              </button>
              <button 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-full font-semibold transition-colors"
                style={customBoxStyle}
              >
                Sell Shares
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

        {/* Activity List */}
       <div className="space-y-2">
  <h3 className="text-white text-lg font-semibold mb-4">Activity</h3>
 <div  
       style={{
  boxShadow:
    "0px 1px 0.5px 0px rgba(255, 255, 255, 0.5) inset, 0px 1px 2px 0px rgba(26, 26, 26, 0.7), 0px 0px 0px 1px #1a1a1a",
  // borderRadius: "8px",
}}  className='p-2 rounded-2xl'>
   {activities.map((activity, i) => (
    <div
      key={activity.id}
      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-[#1A1F25] ${
        i % 2 === 0 ? "" : "bg-[#1A1F25]/60"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {activity.user.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="text-[#A0A0A0] text-sm">{activity.user}</div>
          <div className="text-white text-sm">
            <span
              className={
                activity.action === "Buy" ? "text-green-400" : "text-red-400"
              }
            >
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
        <div className="text-[#A0A0A0] text-xs">
          {activity.timestamp.toLocaleDateString()}
        </div>
      </div>
    </div>
  ))}
 </div>
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
      className="relative flex w-full rounded-lg p-1"
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
<div
  style={{
    boxShadow:
      "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 1px 0px rgba(26, 26, 26, 0.7), 0px 0px 0px 1px rgba(26, 26, 26, 0.7)",
  }}
  className="rounded-2xl bg-[#10151A] border border-[#23272B]"
>
  {activeTab === "users"
    ? users.map((user, i) => (
        <div
          key={user.id}
          className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:rounded-2xl ${
            i % 2 === 0 ? "bg-dark-700" : "bg-dark-800"
          }`}
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
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#10151A]"></div>
              )}
            </div>
            <span className="text-white font-medium">@{user.username}</span>
          </div>
          <div className="text-green-400 font-semibold">
            ${user.balance.toLocaleString()}
          </div>
        </div>
      ))
    : communities.map((community, i) => (
        <div
          key={community.id}
          className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 border border-[#23272B] hover:bg-[#1A1F25] ${
            i % 2 === 0 ? "bg-[#10151A]/80" : "bg-[#1A1F25]/60"
          }`}
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
              <div className="text-[#A0A0A0] text-sm">
                {community.memberCount.toLocaleString()} members
              </div>
            </div>
          </div>
          <div className="text-blue-400">→</div>
        </div>
      ))}
</div>


      </div>
    </div>
  );
}