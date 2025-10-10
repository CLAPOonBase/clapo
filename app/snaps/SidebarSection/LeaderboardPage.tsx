"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from 'next/image'
import { Trophy, Crown, Medal, TrendingUp, Award } from "lucide-react"
import { getLeaderboard } from "@/app/lib/reputationApi"
import { LeaderboardEntry } from "@/app/types/api"
import ReputationBadge from "@/app/components/ReputationBadge"
import { UserProfileHover } from "@/app/components/UserProfileHover"

export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getLeaderboard(50, 0)
      setLeaderboard(response.data)
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err)
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />
      default:
        return null
    }
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    if (rank === 3) return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
    return 'bg-gray-700 text-gray-300'
  }

  if (loading) {
    return (
      <div className="flex-col max-w-3xl md:flex-row text-white flex mx-auto">
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky bg-black p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-6"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                  <div className="h-3 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-col md:flex-row text-white flex mx-auto">
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky bg-black p-4">
          <div className="text-center py-8 text-red-400">
            {error}
            <button
              onClick={fetchLeaderboard}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col md:flex-row max-w-3xl text-white flex mx-auto">
      <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky bg-black py-4">

        {/* Header */}
        <div className="mb-6 px-4">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Reputation Leaderboard</h1>
          </div>
          <p className="text-gray-400 mt-2 text-sm">
            Top contributors ranked by reputation score
          </p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8 px-4">
            <div className="grid grid-cols-3 gap-4 items-end">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <Image
                    src={leaderboard[1].avatar_url || '/4.png'}
                    alt={leaderboard[1].username}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-4 border-gray-400"
                  />
                  <div className="absolute -top-2 -right-2">
                    <Medal className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm truncate max-w-full">{leaderboard[1].username}</p>
                  <p className="text-xs text-gray-400">{leaderboard[1].score} pts</p>
                </div>
                <div className="h-20 w-full bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <Image
                    src={leaderboard[0].avatar_url || '/4.png'}
                    alt={leaderboard[0].username}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg shadow-yellow-400/50"
                  />
                  <div className="absolute -top-2 -right-2">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-base truncate max-w-full">{leaderboard[0].username}</p>
                  <p className="text-sm text-yellow-400">{leaderboard[0].score} pts</p>
                </div>
                <div className="h-28 w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="relative mb-2">
                  <Image
                    src={leaderboard[2].avatar_url || '/4.png'}
                    alt={leaderboard[2].username}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-4 border-orange-400"
                  />
                  <div className="absolute -top-2 -right-2">
                    <Medal className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm truncate max-w-full">{leaderboard[2].username}</p>
                  <p className="text-xs text-gray-400">{leaderboard[2].score} pts</p>
                </div>
                <div className="h-16 w-full bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="space-y-2 px-4">
          <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>All Rankings</span>
          </h2>

          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-black border border-gray-700/50 rounded-xl p-4 hover:bg-gray-900/50 transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                  {getRankIcon(entry.rank) || (
                    <span className="font-bold text-lg">#{entry.rank}</span>
                  )}
                </div>

                {/* User Info */}
                <UserProfileHover
                  userId={entry.user_id}
                  username={entry.username}
                  avatarUrl={entry.avatar_url}
                  position="right"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer group">
                    <Image
                      src={entry.avatar_url || '/4.png'}
                      alt={entry.username}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full border-2 border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/4.png';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                          {entry.username}
                        </p>
                        <ReputationBadge
                          tier={entry.tier}
                          score={entry.score}
                          size="sm"
                          showScore={false}
                        />
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                        <span>{entry.score} points</span>
                        <span>•</span>
                        <span>{entry.lifetime_claps_received} claps</span>
                        <span>•</span>
                        <span>{entry.lifetime_replies_received} replies</span>
                      </div>
                    </div>
                  </div>
                </UserProfileHover>

                {/* Score Display */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-white">{entry.score}</div>
                  <div className="text-xs text-gray-400 uppercase">Points</div>
                </div>
              </div>
            </motion.div>
          ))}

          {leaderboard.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">No leaderboard data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
