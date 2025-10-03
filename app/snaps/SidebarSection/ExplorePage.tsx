"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, TrendingUp, Users, MessageSquare, Droplet, FolderOpen, Megaphone } from "lucide-react"

const mockCreators = [
  {
    id: 1,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 2,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 3,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 4,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 5,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 6,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 7,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 8,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  }
]

const tabs = [
  { key: "creators", label: "Top Creators", icon: Users },
  { key: "posts", label: "Top Posts", icon: TrendingUp },
  { key: "chatrooms", label: "Top Chatrooms", icon: MessageSquare },
  { key: "vedios", label: "Vedios", icon: TrendingUp },
  { key: "airdrop", label: "Airdrop", icon: Droplet },
  { key: "projects", label: "Top Projects", icon: FolderOpen },
  { key: "campaigns", label: "Top Campaigns", icon: Megaphone }
]

export function ExplorePage() {
  const [activeTab, setActiveTab] = useState("creators")
  const [query, setQuery] = useState("")

  const filteredCreators = mockCreators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(query.toLowerCase()) ||
      creator.handle.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="border-2 border-[#3A07F4] rounded-full p-1 ring-0">
            <div className="bg-black rounded-full flex items-center px-6 py-4">
              <Search className="text-gray-400 mr-3" size={24} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH"
                className="w-full bg-transparent text-white text-xl font-bold placeholder-gray-400 outline-none tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-white text-black"
                    : "bg-black text-white hover:bg-black"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredCreators.map((creator, index) => (
              <motion.div
                key={creator.id}
                // transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-black rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20"
              >
                {/* Image */}
                <div className="relative mb-4 rounded-xl overflow-hidden bg-black">
                  <img
                    src={creator.image}
                    alt={creator.name}
                    className="w-full h-48 object-cover"
                  />
               
                </div>

                {/* Creator Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">{creator.name}</h3>
                    <p className="text-gray-400 text-xs">{creator.handle}</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{creator.holders} HOLDERS</span>
                      <span className="text-gray-500 text-[10px]">{creator.timeframe} AGO</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {creator.buyers} BUYERS IN {creator.timeframe}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-green-400">
                        {creator.price}
                      </div>
                      <div className="text-green-400 text-sm font-semibold">
                        {creator.change}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredCreators.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-400"
          >
            <Search size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No results found</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}