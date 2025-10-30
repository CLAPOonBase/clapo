'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Users, FileText, Copy, Check, ExternalLink, RefreshCw, Shield, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWalletContext } from '@/context/WalletContext'
import Sidebar from '@/app/snaps/Sections/Sidebar'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { tokenApiService } from '@/app/lib/tokenApi'

interface PostHolding {
  postId: string
  postContent: string
  postAuthor: string
  shares: number
  currentPrice: number
  totalValue: number
  profitLoss: number
  profitLossPercentage: number
}

interface CreatorHolding {
  creatorId: string
  creatorName: string
  creatorAvatar: string
  shares: number
  currentPrice: number
  totalValue: number
  profitLoss: number
  profitLossPercentage: number
}

export default function WalletPage() {
  const { data: session } = useSession()
  const { address, getETHBalance } = useWalletContext()
  const { authenticated, user, ready: privyReady, login } = usePrivy()
  const [monBalance, setMonBalance] = useState<string>('0')
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [copiedPrivyAddress, setCopiedPrivyAddress] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'creators'>('posts')
  const [currentPage, setCurrentPage] = useState<'wallet'>('wallet')
  const [postHoldings, setPostHoldings] = useState<PostHolding[]>([])
  const [creatorHoldings, setCreatorHoldings] = useState<CreatorHolding[]>([])
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(false)
  const router = useRouter()

  const totalPortfolioValue =
    postHoldings.reduce((acc, holding) => acc + holding.totalValue, 0) +
    creatorHoldings.reduce((acc, holding) => acc + holding.totalValue, 0)

  const totalProfitLoss =
    postHoldings.reduce((acc, holding) => acc + holding.profitLoss, 0) +
    creatorHoldings.reduce((acc, holding) => acc + holding.profitLoss, 0)

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      console.log('🔍 Fetch balance check:', { authenticated, address, privyReady })

      if (authenticated && address && privyReady) {
        setIsLoadingBalance(true)
        try {
          console.log('🔍 Attempting to fetch balance for address:', address)
          const balance = await getETHBalance()
          console.log('✅ Balance fetched:', balance)
          setMonBalance(parseFloat(balance).toFixed(4))
        } catch (error) {
          console.error('❌ Failed to fetch MON balance:', error)
        } finally {
          setIsLoadingBalance(false)
        }
      } else {
        console.log('⚠️ Not ready to fetch balance')
        setMonBalance('0')
      }
    }

    fetchBalance()
  }, [authenticated, address, getETHBalance, privyReady])

  // Fetch portfolio holdings
  useEffect(() => {
    const fetchHoldings = async () => {
      if (!authenticated || !address) {
        setPostHoldings([])
        setCreatorHoldings([])
        return
      }

      setIsLoadingHoldings(true)
      try {
        console.log('🔍 Fetching holdings for address:', address)

        // Fetch post token holdings
        const postHoldingsResponse = await tokenApiService.getUserPostTokenHoldings(address)
        console.log('📊 Post holdings response:', postHoldingsResponse)

        // Fetch creator token holdings
        const creatorHoldingsResponse = await tokenApiService.getUserCreatorTokenHoldings(address)
        console.log('📊 Creator holdings response:', creatorHoldingsResponse)

        // Transform post holdings data
        if (postHoldingsResponse.success && postHoldingsResponse.data) {
          const transformedPostHoldings: PostHolding[] = postHoldingsResponse.data.map((holding: any) => {
            const currentPrice = parseFloat(holding.current_price || '0')
            const shares = holding.balance || 0
            const averageBuyPrice = parseFloat(holding.average_buy_price || '0')
            const totalValue = currentPrice * shares
            const totalCost = averageBuyPrice * shares
            const profitLoss = totalValue - totalCost
            const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

            return {
              postId: holding.post_token_uuid,
              postContent: holding.content || 'No content available',
              postAuthor: holding.creator_username || holding.creator_address?.slice(0, 10) || 'Unknown',
              shares,
              currentPrice,
              totalValue,
              profitLoss,
              profitLossPercentage
            }
          })
          setPostHoldings(transformedPostHoldings)
        }

        // Transform creator holdings data
        if (creatorHoldingsResponse.success && creatorHoldingsResponse.data) {
          const transformedCreatorHoldings: CreatorHolding[] = creatorHoldingsResponse.data.map((holding: any) => {
            const currentPrice = parseFloat(holding.current_price || '0')
            const shares = holding.balance || 0
            const averageBuyPrice = parseFloat(holding.average_buy_price || '0')
            const totalValue = currentPrice * shares
            const totalCost = averageBuyPrice * shares
            const profitLoss = totalValue - totalCost
            const profitLossPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0

            return {
              creatorId: holding.creator_token_uuid,
              creatorName: holding.name || 'Unknown Creator',
              creatorAvatar: holding.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(holding.name || 'Unknown')}`,
              shares,
              currentPrice,
              totalValue,
              profitLoss,
              profitLossPercentage
            }
          })
          setCreatorHoldings(transformedCreatorHoldings)
        }

        console.log('✅ Holdings fetched successfully')
      } catch (error) {
        console.error('❌ Failed to fetch holdings:', error)
      } finally {
        setIsLoadingHoldings(false)
      }
    }

    fetchHoldings()
  }, [authenticated, address])

  const copyPrivyAddress = () => {
    const privyWalletAddress = user?.wallet?.address
    if (privyWalletAddress) {
      navigator.clipboard.writeText(privyWalletAddress)
      setCopiedPrivyAddress(true)
      setTimeout(() => setCopiedPrivyAddress(false), 2000)
    }
  }

  const handleNavigateToOpinio = () => {
    router.push('/opinio')
  }

  const handleNavigateToSnaps = () => {
    router.push('/snaps')
  }

  // Check authentication: Either NextAuth OR Privy
  const isAuthenticated = session?.dbUser || authenticated;

  if (!isAuthenticated && privyReady) {
    return (
      <div className="flex min-h-screen bg-black text-white">
        <div className="hidden lg:block">
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage as any}
            onNavigateToOpinio={handleNavigateToOpinio}
            onNavigateToSnaps={handleNavigateToSnaps}
          />
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <Sidebar
            currentPage={currentPage}
            setCurrentPage={setCurrentPage as any}
            onNavigateToOpinio={handleNavigateToOpinio}
            onNavigateToSnaps={handleNavigateToSnaps}
          />
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Wallet Access Required</h2>
            <p className="text-gray-400 mb-4">Please sign in to view your wallet</p>
            <button
              onClick={login}
              className="flex items-center gap-2 px-6 py-3 bg-[#6e54ff] hover:bg-[#5a43e0] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#6e54ff]/20 mx-auto"
            >
              <LogIn size={18} />
              Sign In with Privy
            </button>
          </div>
        </div>
      </div>
    )
  }

  const username = session?.dbUser?.username || user?.email?.address || user?.twitter?.username || 'User'
  const walletTitle = `${username}'s Wallet`

  return (
    <div className="flex min-h-screen bg-black text-white relative">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 rounded-full blur-2xl" />
      </div>

      <div className="hidden lg:block">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage as any}
          onNavigateToOpinio={handleNavigateToOpinio}
          onNavigateToSnaps={handleNavigateToSnaps}
        />
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage as any}
          onNavigateToOpinio={handleNavigateToOpinio}
          onNavigateToSnaps={handleNavigateToSnaps}
        />
      </div>

      <div className="flex-1 p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">{walletTitle}</h1>
            {!authenticated && (
              <button
                onClick={login}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#6e54ff] hover:bg-[#5a43e0] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#6e54ff]/20"
              >
                <LogIn size={18} />
                Connect Privy Wallet
              </button>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-black border-2 border-gray-700/70 rounded-2xl p-6 shadow-xl shadow-black/20"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gray-700/30 border-2 border-[#6e54ff] rounded-xl px-3 py-1.5 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#6e54ff]" />
                <h2 className="text-sm font-semibold text-gray-200">Available Funds</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-xs font-semibold mb-1">TOTAL PORTFOLIO VALUE</p>
                <p className="text-2xl font-bold">${totalPortfolioValue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold mb-1">TOTAL PROFIT/LOSS</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${Math.abs(totalProfitLoss).toFixed(2)}
                  </p>
                  {totalProfitLoss >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-semibold mb-1">WALLET BALANCE (MON)</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {!authenticated ? '0.0000' : isLoadingBalance ? '...' : monBalance}
                  </p>
                  {authenticated && address && (
                    <button
                      onClick={async () => {
                        setIsLoadingBalance(true)
                        try {
                          const balance = await getETHBalance()
                          setMonBalance(parseFloat(balance).toFixed(4))
                        } catch (error) {
                          console.error('Failed to refresh balance:', error)
                        } finally {
                          setIsLoadingBalance(false)
                        }
                      }}
                      className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {authenticated && user?.wallet?.address && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="bg-black border-2 border-gray-700/70 rounded-2xl p-6 shadow-xl shadow-black/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-gray-700/30 border-2 border-[#6e54ff] rounded-xl px-3 py-1.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#6e54ff]" />
                  <h2 className="text-sm font-semibold text-gray-200">Privy Wallet</h2>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black/30 border border-gray-700/50 rounded-xl p-4 hover:border-[#6e54ff]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Embedded Wallet</p>
                      <p className="font-mono text-sm">{`${user.wallet.address.slice(0, 10)}...${user.wallet.address.slice(-8)}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyPrivyAddress}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      {copiedPrivyAddress ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <a
                      href={`https://sepolia.basescan.org/address/${user.wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                      title="View on BaseScan"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>
                {user.email?.address && (
                  <div className="flex items-center gap-3 bg-black/30 border border-gray-700/50 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.email.address[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Connected Email</p>
                      <p className="text-sm">{user.email.address}</p>
                    </div>
                  </div>
                )}
                {user.twitter?.username && (
                  <div className="flex items-center gap-3 bg-black/30 border border-gray-700/50 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      𝕏
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Connected Twitter</p>
                      <p className="text-sm">@{user.twitter.username}</p>
                    </div>
                  </div>
                )}
                {user.discord?.username && (
                  <div className="flex items-center gap-3 bg-black/30 border border-gray-700/50 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      D
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Connected Discord</p>
                      <p className="text-sm">{user.discord.username}</p>
                    </div>
                  </div>
                )}
                {user.github?.username && (
                  <div className="flex items-center gap-3 bg-black/30 border border-gray-700/50 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm">
                      GH
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Connected GitHub</p>
                      <p className="text-sm">{user.github.username}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-black border-2 border-gray-700/70 rounded-2xl p-6 shadow-xl shadow-black/20"
          >
            <div className="bg-gray-700/50 rounded-full mb-6 p-0.5">
              <div className="flex justify-around bg-black m-0.5 p-1 items-center rounded-full relative">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 my-1 font-semibold w-full relative z-10 text-xs sm:text-sm rounded-full transition-colors ${
                    activeTab === 'posts'
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Post Holdings ({postHoldings.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('creators')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 my-1 font-semibold w-full relative z-10 text-xs sm:text-sm rounded-full transition-colors ${
                    activeTab === 'creators'
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Creator Shares ({creatorHoldings.length})</span>
                </button>
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    height: "40px",
                    boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
                    backgroundColor: "#6E54FF",
                    margin: "6px",
                  }}
                  initial={false}
                  animate={{
                    left: activeTab === 'posts' ? "0%" : "calc(50% + 0px)",
                    width: "calc(50% - 6px)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'posts' ? (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {postHoldings.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">
                        No Post Holdings
                      </h3>
                      <p className="text-gray-500">
                        Start trading post tokens to build your portfolio
                      </p>
                    </div>
                  ) : (
                    postHoldings.map((holding) => (
                      <motion.div
                        key={holding.postId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/30 border border-gray-700/50 rounded-xl p-4 hover:border-[#6e54ff]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-gray-300 mb-1 line-clamp-2">{holding.postContent}</p>
                            <p className="text-sm text-gray-500">{holding.postAuthor}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Shares</p>
                            <p className="font-semibold">{holding.shares}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Price</p>
                            <p className="font-semibold">${holding.currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Total Value</p>
                            <p className="font-semibold">${holding.totalValue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Profit/Loss</p>
                            <p className={`font-semibold ${holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${Math.abs(holding.profitLoss).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Change</p>
                            <div className="flex items-center gap-1">
                              {holding.profitLossPercentage >= 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-400" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-400" />
                              )}
                              <p className={`font-semibold ${holding.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Math.abs(holding.profitLossPercentage).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="creators"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {creatorHoldings.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-400 mb-2">
                        No Creator Holdings
                      </h3>
                      <p className="text-gray-500">
                        Invest in creators to support their content and earn returns
                      </p>
                    </div>
                  ) : (
                    creatorHoldings.map((holding) => (
                      <motion.div
                        key={holding.creatorId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/30 border border-gray-700/50 rounded-xl p-4 hover:border-[#6e54ff]/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <img
                            src={holding.creatorAvatar}
                            alt={holding.creatorName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold">{holding.creatorName}</p>
                            <p className="text-sm text-gray-500">{holding.shares} shares</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-1">Price per Share</p>
                            <p className="font-semibold">${holding.currentPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Total Value</p>
                            <p className="font-semibold">${holding.totalValue.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Profit/Loss</p>
                            <p className={`font-semibold ${holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              ${Math.abs(holding.profitLoss).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-1">Change</p>
                            <div className="flex items-center gap-1">
                              {holding.profitLossPercentage >= 0 ? (
                                <TrendingUp className="w-3 h-3 text-green-400" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-400" />
                              )}
                              <p className={`font-semibold ${holding.profitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {Math.abs(holding.profitLossPercentage).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
