"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, TrendingUp, Users, MessageSquare, Droplet, FolderOpen, Megaphone, Heart, Share2, Video, Clock, ArrowUp, Trophy, Mail } from "lucide-react"
import { getLeaderboard } from "@/app/lib/reputationApi"
import { LeaderboardEntry } from "@/app/types/api"
import ReputationBadge from "@/app/components/ReputationBadge"
import Image from "next/image"
import { apiService } from "@/app/lib/api"
import { useRouter } from "next/navigation"

const mockCreators = [
  {
    id: 1,
    name: "KIZZY GLOBAL",
    handle: "@KIZZY",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    holders: 13,
    buyers: 36,
    timeframe: "2H",
    price: "$2.159",
    change: "+3.24%"
  },
  {
    id: 2,
    name: "Sarah Chen",
    handle: "@sarahc",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    holders: 28,
    buyers: 52,
    timeframe: "1H",
    price: "$4.892",
    change: "+5.67%"
  },
  {
    id: 3,
    name: "Alex Johnson",
    handle: "@alexj",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
    holders: 45,
    buyers: 89,
    timeframe: "3H",
    price: "$3.421",
    change: "+2.14%"
  },
  {
    id: 4,
    name: "Mike Torres",
    handle: "@miket",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    holders: 67,
    buyers: 123,
    timeframe: "5H",
    price: "$5.234",
    change: "+7.89%"
  },
  {
    id: 5,
    name: "Emma Wilson",
    handle: "@emmaw",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    holders: 34,
    buyers: 78,
    timeframe: "4H",
    price: "$3.876",
    change: "+4.21%"
  },
  {
    id: 6,
    name: "David Kim",
    handle: "@davidk",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    holders: 91,
    buyers: 156,
    timeframe: "6H",
    price: "$6.543",
    change: "+9.12%"
  },
  {
    id: 7,
    name: "Lisa Park",
    handle: "@lisap",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    holders: 23,
    buyers: 45,
    timeframe: "3H",
    price: "$2.987",
    change: "+2.67%"
  },
  {
    id: 8,
    name: "James Reed",
    handle: "@jamesr",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    holders: 56,
    buyers: 98,
    timeframe: "7H",
    price: "$4.321",
    change: "+5.43%"
  }
]

const mockPosts = [
  {
    id: 1,
    author: "KIZZY GLOBAL",
    handle: "@KIZZY",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
    content: "Just launched our new crypto platform! Check it out and join the revolution.",
    image: "/post1.png",
    likes: 234,
    comments: 45,
    shares: 12,
    timeframe: "2H"
  },
  {
    id: 2,
    author: "Sarah Chen",
    handle: "@sarahc",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    content: "Market analysis: Bitcoin showing strong resistance at $45k. What are your thoughts?",
    image: "/post2.png",
    likes: 456,
    comments: 89,
    shares: 23,
    timeframe: "4H"
  },
  {
    id: 3,
    author: "Alex Johnson",
    handle: "@alexj",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    content: "New NFT collection dropping tomorrow! Get ready for something special.",
    image: "/post3.png",
    likes: 678,
    comments: 123,
    shares: 45,
    timeframe: "1H"
  },
  {
    id: 4,
    author: "Mike Torres",
    handle: "@miket",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop",
    content: "DeFi yields are looking interesting this week. Here's my portfolio breakdown.",
    image: "/post4.jpeg",
    likes: 321,
    comments: 67,
    shares: 34,
    timeframe: "3H"
  },
  {
    id: 5,
    author: "Emma Wilson",
    handle: "@emmaw",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    content: "Web3 gaming is the future. Just tried this new play-to-earn game and it's amazing!",
    image: "/post5.jpeg",
    likes: 543,
    comments: 98,
    shares: 56,
    timeframe: "5H"
  },
  {
    id: 6,
    author: "David Kim",
    handle: "@davidk",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    content: "Ethereum merge complete! This is a historic moment for blockchain technology.",
    image: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&h=800&fit=crop",
    likes: 891,
    comments: 156,
    shares: 78,
    timeframe: "6H"
  },
  {
    id: 7,
    author: "Lisa Park",
    handle: "@lisap",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop",
    content: "NFT art is revolutionizing the creative industry. Just sold my first piece!",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=800&fit=crop",
    likes: 412,
    comments: 73,
    shares: 29,
    timeframe: "7H"
  },
  {
    id: 8,
    author: "James Reed",
    handle: "@jamesr",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    content: "Smart contract security audit complete. Here are the key findings and recommendations.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
    likes: 567,
    comments: 102,
    shares: 41,
    timeframe: "8H"
  },
  {
    id: 9,
    author: "Maria Garcia",
    handle: "@mariag",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop",
    content: "Just launched my Web3 startup! Excited to share our vision for decentralized social media.",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=800&fit=crop",
    likes: 789,
    comments: 134,
    shares: 67,
    timeframe: "9H"
  },
  {
    id: 10,
    author: "Tom Anderson",
    handle: "@toma",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    content: "Crypto market update: Top 5 coins to watch this week",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=600&fit=crop",
    likes: 345,
    comments: 62,
    shares: 28,
    timeframe: "10H"
  },
  {
    id: 11,
    author: "Nina Patel",
    handle: "@ninap",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
    content: "Building the future of decentralized finance, one block at a time",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop",
    likes: 523,
    comments: 91,
    shares: 37,
    timeframe: "11H"
  },
  {
    id: 12,
    author: "Chris Lee",
    handle: "@chrisl",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=200&h=200&fit=crop",
    content: "DAO governance proposal passed! Exciting times ahead for our community",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=800&fit=crop",
    likes: 612,
    comments: 118,
    shares: 54,
    timeframe: "12H"
  },
  {
    id: 13,
    author: "Rachel Green",
    handle: "@rachelg",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    content: "Metaverse land sale update: Record-breaking sales this month!",
    image: "https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&h=600&fit=crop",
    likes: 298,
    comments: 47,
    shares: 19,
    timeframe: "13H"
  },
  {
    id: 14,
    author: "Kevin Wu",
    handle: "@kevinw",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop",
    content: "Tokenomics explained: Understanding supply, demand, and value",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
    likes: 401,
    comments: 76,
    shares: 31,
    timeframe: "14H"
  },
  {
    id: 15,
    author: "Sophia Martinez",
    handle: "@sophiam",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop",
    content: "Just minted my first NFT collection! 100 unique pieces available now",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&h=800&fit=crop",
    likes: 876,
    comments: 143,
    shares: 71,
    timeframe: "15H"
  },
  {
    id: 16,
    author: "Daniel Brown",
    handle: "@danielb",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop",
    content: "Blockchain scalability solutions: Layer 2 vs Sidechains comparison",
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=600&fit=crop",
    likes: 734,
    comments: 125,
    shares: 58,
    timeframe: "16H"
  }
]

const mockChatrooms = [
  {
    id: 1,
    name: "Crypto Traders Hub",
    description: "Daily crypto trading discussions and market analysis",
    members: 1243,
    online: 234,
    lastActive: "2m ago",
    category: "Trading"
  },
  {
    id: 2,
    name: "NFT Collectors",
    description: "Share and discuss the latest NFT drops and collections",
    members: 856,
    online: 145,
    lastActive: "5m ago",
    category: "NFTs"
  },
  {
    id: 3,
    name: "DeFi Enthusiasts",
    description: "Decentralized finance protocols and yield farming",
    members: 2341,
    online: 567,
    lastActive: "1m ago",
    category: "DeFi"
  },
  {
    id: 4,
    name: "Blockchain Developers",
    description: "Technical discussions about smart contracts and dApps",
    members: 1876,
    online: 423,
    lastActive: "3m ago",
    category: "Development"
  },
  {
    id: 5,
    name: "Metaverse Explorers",
    description: "Virtual worlds, gaming, and metaverse projects",
    members: 1532,
    online: 289,
    lastActive: "7m ago",
    category: "Metaverse"
  },
  {
    id: 6,
    name: "Token Launch Alerts",
    description: "Get notified about new token launches and presales",
    members: 3421,
    online: 678,
    lastActive: "4m ago",
    category: "Launches"
  },
  {
    id: 7,
    name: "Web3 Marketing",
    description: "Marketing strategies and growth hacking for Web3 projects",
    members: 987,
    online: 167,
    lastActive: "8m ago",
    category: "Marketing"
  },
  {
    id: 8,
    name: "DAO Governance",
    description: "Discussions about decentralized autonomous organizations",
    members: 1654,
    online: 312,
    lastActive: "6m ago",
    category: "DAOs"
  }
]

const mockProjects = [
  {
    id: 1,
    name: "MetaVerse DAO",
    description: "Building the future of virtual worlds",
    logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop",
    category: "Metaverse",
    holders: 5421,
    volume: "$2.4M",
    change: "+12.5%"
  },
  {
    id: 2,
    name: "ChainLink AI",
    description: "Decentralized AI infrastructure",
    logo: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=200&h=200&fit=crop",
    category: "AI",
    holders: 3289,
    volume: "$1.8M",
    change: "+8.3%"
  },
  {
    id: 3,
    name: "DeFi Protocol X",
    description: "Next-gen yield optimization platform",
    logo: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=200&h=200&fit=crop",
    category: "DeFi",
    holders: 7654,
    volume: "$4.2M",
    change: "+15.7%"
  },
  {
    id: 4,
    name: "NFT Marketplace",
    description: "Curated digital art and collectibles",
    logo: "https://images.unsplash.com/photo-1644088379091-d574269d422f?w=200&h=200&fit=crop",
    category: "NFTs",
    holders: 4321,
    volume: "$3.1M",
    change: "+9.8%"
  },
  {
    id: 5,
    name: "Gaming Token",
    description: "Play-to-earn gaming ecosystem",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop",
    category: "Gaming",
    holders: 8976,
    volume: "$5.6M",
    change: "+18.2%"
  },
  {
    id: 6,
    name: "Social DAO",
    description: "Community-driven social platform",
    logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop",
    category: "Social",
    holders: 6543,
    volume: "$3.8M",
    change: "+11.4%"
  }
]

const mockVideos = [
  {
    id: 1,
    title: "How to Trade NFTs for Beginners",
    creator: "KIZZY GLOBAL",
    handle: "@KIZZY",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop",
    views: "12.3K",
    duration: "15:42",
    timeframe: "2H"
  },
  {
    id: 2,
    title: "Market Analysis: Bitcoin Predictions",
    creator: "Sarah Chen",
    handle: "@sarahc",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop",
    views: "23.5K",
    duration: "22:15",
    timeframe: "4H"
  },
  {
    id: 3,
    title: "DeFi Explained: Complete Guide",
    creator: "Alex Johnson",
    handle: "@alexj",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=400&fit=crop",
    views: "18.7K",
    duration: "28:33",
    timeframe: "1H"
  },
  {
    id: 4,
    title: "Building Your First Smart Contract",
    creator: "Mike Torres",
    handle: "@miket",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1644088379091-d574269d422f?w=800&h=400&fit=crop",
    views: "15.9K",
    duration: "35:20",
    timeframe: "3H"
  }
]

const mockAirdrops = [
  {
    id: 1,
    name: "MetaVerse Token Airdrop",
    project: "MetaVerse DAO",
    logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=200&fit=crop",
    amount: "500 MVT",
    value: "$250",
    endsIn: "2 days",
    participants: 4523,
    status: "active"
  },
  {
    id: 2,
    name: "DeFi Protocol Rewards",
    project: "DeFi Protocol X",
    logo: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=200&h=200&fit=crop",
    amount: "1000 DPX",
    value: "$500",
    endsIn: "5 days",
    participants: 7821,
    status: "active"
  },
  {
    id: 3,
    name: "Gaming Token Launch",
    project: "Gaming Token",
    logo: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop",
    amount: "2500 GTK",
    value: "$1250",
    endsIn: "1 day",
    participants: 9234,
    status: "active"
  },
  {
    id: 4,
    name: "NFT Holder Rewards",
    project: "NFT Marketplace",
    logo: "https://images.unsplash.com/photo-1644088379091-d574269d422f?w=200&h=200&fit=crop",
    amount: "300 NFM",
    value: "$180",
    endsIn: "3 days",
    participants: 5643,
    status: "active"
  }
]

const mockCampaigns = [
  {
    id: 1,
    name: "Launch Campaign: New DeFi Protocol",
    project: "DeFi Protocol X",
    logo: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=200&h=200&fit=crop",
    description: "Join our launch campaign and earn exclusive rewards",
    reward: "$500 in tokens",
    participants: 3421,
    endsIn: "7 days",
    tasks: 5
  },
  {
    id: 2,
    name: "Community Growth Challenge",
    project: "Social DAO",
    logo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop",
    description: "Help us grow and earn rewards for your contributions",
    reward: "$1000 prize pool",
    participants: 5678,
    endsIn: "10 days",
    tasks: 7
  },
  {
    id: 3,
    name: "NFT Collection Promotion",
    project: "NFT Marketplace",
    logo: "https://images.unsplash.com/photo-1644088379091-d574269d422f?w=200&h=200&fit=crop",
    description: "Promote our new NFT collection and win prizes",
    reward: "Exclusive NFTs",
    participants: 2134,
    endsIn: "5 days",
    tasks: 4
  }
]

const tabs = [
  { key: "creators", label: "Top Creators", icon: Users },
  { key: "users", label: "Top Users", icon: Trophy },
  { key: "posts", label: "Top Posts", icon: TrendingUp },
  { key: "chatrooms", label: "Top Chatrooms", icon: MessageSquare },
  { key: "videos", label: "Videos", icon: Video },
  { key: "airdrop", label: "Airdrop", icon: Droplet },
  { key: "projects", label: "Top Projects", icon: FolderOpen },
  { key: "campaigns", label: "Top Campaigns", icon: Megaphone }
]

export default function ExplorePage() {
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)

  const [activeTab, setActiveTab] = useState("creators")
  const [query, setQuery] = useState("")
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)

  // Global user search states
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    console.log('🔄 Active tab changed to:', activeTab)
    if (activeTab === "users") {
      console.log('👥 Users tab activated, fetching data...')
      fetchTopUsers()
    }
  }, [activeTab])

  // Global user search with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }

      setSearchLoading(true)
      try {
        const response = await apiService.searchUsers(query, 10, 0)
        setSearchResults(response.users || [])
        setShowSearchResults(true)
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleUserClick = (userId: string) => {
    setShowSearchResults(false)
    setQuery("")
    router.push(`/snaps/profile/${userId}`)
  }

  const handleMessageUser = async (userId: string) => {
    const currentUserId = localStorage.getItem('userId')
    if (!currentUserId) {
      console.error('No current user found')
      return
    }

    try {
      await apiService.createMessageThread({
        creatorId: currentUserId,
        targetUserId: userId
      })
      router.push('/snaps/messages')
    } catch (error) {
      console.error('Error creating message thread:', error)
    }
  }

  const fetchTopUsers = async () => {
    try {
      setLoadingUsers(true)
      setUsersError(null)
      console.log('🔍 Fetching top users...')
      const response: any = await getLeaderboard(50, 0)
      console.log('✅ Leaderboard response:', response)

      // API returns { success: true, users: [...] }
      if (response.success && response.users && Array.isArray(response.users)) {
        console.log('📈 Users count:', response.users.length)
        setTopUsers(response.users)
      } else {
        console.warn('⚠️ Invalid response format:', response)
        setUsersError('Invalid response format from API')
        setTopUsers([])
      }
    } catch (error) {
      console.error('❌ Failed to fetch top users:', error)
      setUsersError(error instanceof Error ? error.message : 'Failed to load users')
      setTopUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const filteredUsers = topUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(query.toLowerCase())
  )

  const filteredCreators = mockCreators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(query.toLowerCase()) ||
      creator.handle.toLowerCase().includes(query.toLowerCase())
  )

  const filteredPosts = mockPosts.filter(
    (post) =>
      post.author.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase())
  )

  const filteredChatrooms = mockChatrooms.filter(
    (room) =>
      room.name.toLowerCase().includes(query.toLowerCase()) ||
      room.description.toLowerCase().includes(query.toLowerCase())
  )

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.description.toLowerCase().includes(query.toLowerCase())
  )

  const filteredVideos = mockVideos.filter(
    (video) =>
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.creator.toLowerCase().includes(query.toLowerCase())
  )

  const filteredAirdrops = mockAirdrops.filter(
    (airdrop) =>
      airdrop.name.toLowerCase().includes(query.toLowerCase()) ||
      airdrop.project.toLowerCase().includes(query.toLowerCase())
  )

  const filteredCampaigns = mockCampaigns.filter(
    (campaign) =>
      campaign.name.toLowerCase().includes(query.toLowerCase()) ||
      campaign.project.toLowerCase().includes(query.toLowerCase())
  )

  const renderContent = () => {
    if (activeTab === "users") {
      if (loadingUsers) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-black rounded-2xl p-4 border border-gray-700 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
      if (usersError) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-400 text-sm mb-4">{usersError}</p>
              <button
                onClick={fetchTopUsers}
                className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )
      }
      if (filteredUsers.length === 0) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-400"
          >
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              {topUsers.length === 0 ? 'No users found in leaderboard' : 'No results match your search'}
            </p>
          </motion.div>
        )
      }
      return (
        <div className="space-y-2">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                {/* Rank Number */}
                <div className="flex-shrink-0 w-8 text-center">
                  <span className="text-2xl font-bold text-gray-400">{user.rank}</span>
                </div>

                {/* Avatar and Username */}
                <div
                  className="flex items-center gap-3 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push(`/snaps/profile/${user.user_id}`)}
                >
                  <Image
                    src={user.avatar_url || '/4.png'}
                    alt={user.username}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/4.png';
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-white text-base hover:text-blue-400 transition-colors">{user.username}</h3>
                    <p className="text-gray-400 text-sm">@{user.username.toLowerCase()}</p>
                  </div>
                </div>

                {/* Score with Icon */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  <ArrowUp size={16} className="text-green-400" />
                  <span className="text-green-400 font-bold text-lg">{user.score}</span>
                </div>

                {/* Reputation Badge */}
                <div className="flex-shrink-0">
                  <ReputationBadge
                    tier={user.tier}
                    score={user.score}
                    size="sm"
                    showScore={false}
                    showLabel={true}
                  />
                </div>

                {/* Buy Button */}
                <button className="px-6 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 ml-4">
                  Buy Shares
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    if (activeTab === "creators") {
      if (filteredCreators.length === 0) return renderNoResults()
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCreators.map((creator) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{creator.name}</h3>
                  <p className="text-gray-400 text-xs">{creator.handle}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{creator.holders} HOLDERS</span>
                  <span className="text-gray-500">{creator.timeframe} AGO</span>
                </div>
                <div className="text-xs text-gray-400">
                  {creator.buyers} BUYERS IN {creator.timeframe}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-gray-700">
                <div className="flex items-end justify-between">
                  <div className="text-xl font-bold text-green-400">
                    {creator.price}
                  </div>
                  <div className="text-green-400 text-xs font-semibold">
                    {creator.change}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    if (activeTab === "posts") {
      if (filteredPosts.length === 0) return renderNoResults()

      // Calculate total engagement (likes + comments + shares) and sort
      const sortedPosts = [...filteredPosts].sort((a, b) => {
        const engagementA = a.likes + a.comments + a.shares
        const engagementB = b.likes + b.comments + b.shares
        return engagementB - engagementA
      })

      return (
        <div className="columns-4 gap-1 space-y-1">
          {sortedPosts.map((post) => {
            const totalEngagement = post.likes + post.comments + post.shares

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => router.push(`/snaps/post/${post.id}`)}
                className="relative group cursor-pointer overflow-hidden break-inside-avoid mb-1"
              >
                <img
                  src={post.image}
                  alt={post.author}
                  className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-6 text-white">
                    <div className="flex items-center gap-2">
                      <Heart size={18} className="fill-white" />
                      <span className="font-bold text-sm">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare size={18} className="fill-white" />
                      <span className="font-bold text-sm">{post.comments}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )
    }

    if (activeTab === "chatrooms") {
      if (filteredChatrooms.length === 0) return renderNoResults()
      return (
        <div className="space-y-3">
          {filteredChatrooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare size={18} className="text-blue-500 flex-shrink-0" />
                    <h3 className="font-bold text-white text-sm">{room.name}</h3>
                    <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                      {room.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2 ml-7">{room.description}</p>
                  <div className="flex items-center gap-4 ml-7 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>{room.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{room.online} online</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{room.lastActive}</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors flex-shrink-0">
                  Join
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    if (activeTab === "videos") {
      if (filteredVideos.length === 0) return renderNoResults()
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 px-2 py-1 rounded text-white text-xs font-semibold">
                  {video.duration}
                </div>
                <div className="absolute top-2 right-2">
                  <Video size={20} className="text-white drop-shadow-lg" />
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-2 line-clamp-2">{video.title}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={video.avatar}
                    alt={video.creator}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-xs truncate">{video.creator}</p>
                    <p className="text-gray-500 text-xs">{video.handle}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{video.views} views</span>
                  <span>{video.timeframe} ago</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    if (activeTab === "airdrop") {
      if (filteredAirdrops.length === 0) return renderNoResults()
      return (
        <div className="space-y-3">
          {filteredAirdrops.map((airdrop) => (
            <motion.div
              key={airdrop.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={airdrop.logo}
                    alt={airdrop.project}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Droplet size={16} className="text-blue-500 flex-shrink-0" />
                      <h3 className="font-bold text-white text-sm truncate">{airdrop.name}</h3>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{airdrop.project}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{airdrop.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Ends in {airdrop.endsIn}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{airdrop.amount}</p>
                    <p className="text-green-400 text-xs">{airdrop.value}</p>
                  </div>
                  <button className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors">
                    Claim
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    if (activeTab === "projects") {
      if (filteredProjects.length === 0) return renderNoResults()
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black rounded-2xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={project.logo}
                  alt={project.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm truncate">{project.name}</h3>
                  <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                    {project.category}
                  </span>
                </div>
              </div>

              <p className="text-gray-400 text-xs mb-4">{project.description}</p>

              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">HOLDERS</span>
                  <span className="text-white font-semibold">{project.holders}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">24H VOLUME</span>
                  <span className="text-white font-semibold">{project.volume}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">24H CHANGE</span>
                  <div className="flex items-center gap-1 text-green-400 text-xs font-semibold">
                    <ArrowUp size={12} />
                    {project.change}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }

    if (activeTab === "campaigns") {
      if (filteredCampaigns.length === 0) return renderNoResults()
      return (
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <img
                    src={campaign.logo}
                    alt={campaign.project}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Megaphone size={16} className="text-purple-500 flex-shrink-0" />
                      <h3 className="font-bold text-white text-sm">{campaign.name}</h3>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{campaign.project}</p>
                    <p className="text-gray-300 text-xs mb-3">{campaign.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{campaign.participants} participants</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Ends in {campaign.endsIn}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} />
                        <span>{campaign.tasks} tasks</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Reward</p>
                    <p className="text-green-400 font-bold text-xs">{campaign.reward}</p>
                  </div>
                  <button className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap">
                    Join Campaign
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )
    }
  }

  const renderNoResults = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 text-gray-400"
    >
      <Search size={48} className="mx-auto mb-4 opacity-50" />
      <p className="text-sm">No results found</p>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className="border border-[#3A07F4] rounded-full p-1 ring-0">
            <div className="bg-black rounded-full flex items-center px-2 py-1">
              <Search className="text-gray-400 mr-3" size={24} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH USERS"
                className="w-full bg-transparent text-white text-xl font-bold placeholder-gray-400 outline-none tracking-wider"
              />
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 w-full bg-black border border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50"
            >
              {searchLoading ? (
                <div className="p-4 text-center text-gray-400">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-900 transition-colors border-b border-gray-800 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={user.avatar_url || '/4.png'}
                          alt={user.username}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover cursor-pointer"
                          onClick={() => handleUserClick(user.id)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/4.png';
                          }}
                        />
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleUserClick(user.id)}
                        >
                          <p className="font-semibold text-white text-sm truncate hover:text-blue-400 transition-colors">
                            {user.username}
                          </p>
                          {user.bio && (
                            <p className="text-gray-400 text-xs truncate">{user.bio}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMessageUser(user.id)
                          }}
                          className="flex-shrink-0 p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                          title="Send message"
                        >
                          <Mail size={16} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No users found
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-white text-black"
                    : "bg-black text-white border border-gray-700 hover:border-gray-600"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}