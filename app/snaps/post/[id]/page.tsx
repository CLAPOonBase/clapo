"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Heart, MessageSquare, Share2, TrendingUp } from "lucide-react"
import Image from "next/image"
import Sidebar from "../../Sections/Sidebar"
import { motion } from "framer-motion"

// Mock post data - in real app, fetch based on ID
const mockPostData: any = {
  "1": {
    id: 1,
    author: "KIZZY GLOBAL",
    handle: "@KIZZY",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
    content: "Just launched our new crypto platform! Check it out and join the revolution.",
    image: "/post1.png",
    likes: 234,
    comments: 45,
    shares: 12,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%",
    holders: 156
  },
  "2": {
    id: 2,
    author: "Sarah Chen",
    handle: "@sarahc",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    content: "Market analysis: Bitcoin showing strong resistance at $45k. What are your thoughts?",
    image: "/post2.png",
    likes: 456,
    comments: 89,
    shares: 23,
    timeframe: "4H",
    price: "$4.892",
    change: "+5.67%",
    holders: 234
  },
  "3": {
    id: 3,
    author: "Alex Johnson",
    handle: "@alexj",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    content: "New NFT collection dropping tomorrow! Get ready for something special.",
    image: "/post3.png",
    likes: 678,
    comments: 123,
    shares: 45,
    timeframe: "1H",
    price: "$6.543",
    change: "+9.12%",
    holders: 312
  }
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const post = mockPostData[postId] || mockPostData["1"]

  const [activeTab, setActiveTab] = useState("comments")
  const [comment, setComment] = useState("")
  const [currentPage, setCurrentPage] = useState<any>("post")

  const tabs = [
    { key: "comments", label: "Comments" },
    { key: "holders", label: `Holders ${post.holders}` },
    { key: "activity", label: "Activity" },
    { key: "details", label: "Details" }
  ]

  const handleNavigateToOpinio = () => {
    window.location.href = '/opinio';
  };

  const handleNavigateToSnaps = () => {
    router.push('/snaps');
  };

  return (
    <div className="flex text-white min-h-screen bg-black">
      {/* Left Sidebar - Collapsed on desktop */}
      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          collapsibleItems={["post" as any]}
          onNavigateToOpinio={handleNavigateToOpinio}
          onNavigateToSnaps={handleNavigateToSnaps}
        />
      </div>

      {/* Mobile Sidebar - Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onNavigateToOpinio={handleNavigateToOpinio}
          onNavigateToSnaps={handleNavigateToSnaps}
        />
      </div>

      {/* Main Content - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex-1 pt-20 md:pt-0 px-4 md:px-6 pb-20 lg:pb-6"
      >
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-900">
                <img
                  src={post.image}
                  alt={post.author}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right Side - Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col"
            >
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-6">
                <Image
                  src={post.avatar}
                  alt={post.author}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-bold text-xl">{post.author}</h2>
                  <p className="text-gray-400 text-sm">{post.handle}</p>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-300 mb-6">{post.content}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-green-400" />
                    <span className="text-xs text-gray-400">Price</span>
                  </div>
                  <p className="text-lg font-bold text-green-400">{post.price}</p>
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-green-400" />
                    <span className="text-xs text-gray-400">Change</span>
                  </div>
                  <p className="text-lg font-bold text-green-400">{post.change}</p>
                </div>
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={16} className="text-red-400" />
                    <span className="text-xs text-gray-400">Likes</span>
                  </div>
                  <p className="text-lg font-bold">{post.likes}</p>
                </div>
              </div>

              {/* Buy/Sell Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors">
                  Buy
                </button>
                <button className="px-6 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors">
                  Sell
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-800">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 text-sm font-semibold transition-all ${
                      activeTab === tab.key
                        ? "text-white border-b-2 border-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1">
                {activeTab === "comments" && (
                  <div className="space-y-4">
                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-900 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-gray-700"
                      />
                      <button className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                        Post
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="text-gray-400 text-center py-8">
                      No comments yet. Be the first to comment!
                    </div>
                  </div>
                )}

                {activeTab === "holders" && (
                  <div className="text-gray-400 text-center py-8">
                    {post.holders} holders
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="text-gray-400 text-center py-8">
                    Recent activity will be shown here
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Posted</span>
                      <span>{post.timeframe} ago</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Engagement</span>
                      <span>{post.likes + post.comments + post.shares}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Shares</span>
                      <span>{post.shares}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
