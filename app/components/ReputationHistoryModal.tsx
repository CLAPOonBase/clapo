"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import { X, TrendingUp, TrendingDown, Award, History } from "lucide-react"
import { getReputationHistory } from "@/app/lib/reputationApi"
import { ReputationEvent } from "@/app/types/api"

interface ReputationHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  username: string
}

export default function ReputationHistoryModal({
  isOpen,
  onClose,
  userId,
  username
}: ReputationHistoryModalProps) {
  const [history, setHistory] = useState<ReputationEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchHistory()
    }
  }, [isOpen, userId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getReputationHistory(userId, 50, 0)
      setHistory(response.data)
    } catch (err) {
      console.error('Failed to fetch reputation history:', err)
      setError('Failed to load reputation history')
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'clap_received':
        return '👏'
      case 'clap_given':
        return '👏'
      case 'reply_received':
        return '💬'
      case 'reply_given':
        return '💬'
      case 'remix_received':
        return '🔄'
      case 'remix_given':
        return '🔄'
      case 'giverep_received':
        return '⭐'
      case 'giverep_given':
        return '⭐'
      case 'decay':
        return '⏱️'
      case 'manual_adjustment':
        return '⚙️'
      case 'penalty':
        return '⚠️'
      default:
        return '📊'
    }
  }

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'clap_received':
        return 'Received Clap'
      case 'clap_given':
        return 'Gave Clap'
      case 'reply_received':
        return 'Received Reply'
      case 'reply_given':
        return 'Gave Reply'
      case 'remix_received':
        return 'Received Remix'
      case 'remix_given':
        return 'Gave Remix'
      case 'giverep_received':
        return 'Received Reputation'
      case 'giverep_given':
        return 'Gave Reputation'
      case 'decay':
        return 'Daily Decay'
      case 'manual_adjustment':
        return 'Manual Adjustment'
      case 'penalty':
        return 'Penalty Applied'
      default:
        return eventType.replace(/_/g, ' ')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-black/90 backdrop-blur-sm rounded-2xl border-2 border-gray-700/70 max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-gray-700/70">
              <div className="flex items-center space-x-3">
                <History className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-white text-xl font-bold">Reputation History</h3>
                  <p className="text-gray-400 text-sm">@{username}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800/50 rounded-xl transition-colors border border-gray-700/50"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-100px)] p-6">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl">
                      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={fetchHistory}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">No reputation history yet</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start engaging with the community to build your reputation!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-4 rounded-xl border-2 ${
                        event.points_change > 0
                          ? 'bg-green-900/20 border-green-700/30'
                          : event.points_change < 0
                          ? 'bg-red-900/20 border-red-700/30'
                          : 'bg-gray-800/50 border-gray-700/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Event Icon */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-xl">
                          {getEventIcon(event.event_type)}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-white text-sm">
                              {getEventLabel(event.event_type)}
                            </p>
                            <div className="flex items-center space-x-1">
                              {event.points_change > 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              ) : event.points_change < 0 ? (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              ) : null}
                              <span
                                className={`font-bold text-sm ${
                                  event.points_change > 0
                                    ? 'text-green-400'
                                    : event.points_change < 0
                                    ? 'text-red-400'
                                    : 'text-gray-400'
                                }`}
                              >
                                {event.points_change > 0 ? '+' : ''}{event.points_change}
                              </span>
                            </div>
                          </div>

                          {/* From User */}
                          {event.from_user && (
                            <div className="flex items-center space-x-2 mb-2">
                              <Image
                                src={event.from_user.avatar_url || '/4.png'}
                                alt={event.from_user.username}
                                width={20}
                                height={20}
                                className="w-5 h-5 rounded-full border border-gray-600"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/4.png';
                                }}
                              />
                              <span className="text-xs text-gray-400">
                                from <span className="text-white font-medium">@{event.from_user.username}</span>
                              </span>
                            </div>
                          )}

                          {/* Context */}
                          {event.context && (
                            <p className="text-xs text-gray-400 italic mb-2">"{event.context}"</p>
                          )}

                          {/* Score Change and Time */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {event.score_before} → {event.score_after} pts
                              {event.tier_before !== event.tier_after && (
                                <span className="ml-2 text-yellow-400 font-medium">
                                  Tier Up! {event.tier_before} → {event.tier_after}
                                </span>
                              )}
                            </span>
                            <span>{formatTime(event.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
