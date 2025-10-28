'use client'

import { usePrivy } from '@privy-io/react-auth'
import { LogOut, X, Mail, Wallet, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApi } from '../Context/ApiProvider'

interface AccountInfoProps {
  onClose?: () => void
}

export default function AccountInfo({ onClose }: AccountInfoProps) {
  const { authenticated, user: privyUser, ready, logout } = usePrivy()
  const { getUserProfile } = useApi()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Initialize user ID from Privy
  useEffect(() => {
    const initializeUser = async () => {
      if (authenticated && privyUser && ready) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/privy/${privyUser.id}`
          )
          const data = await response.json()

          if (data.exists && data.user?.id) {
            console.log('AccountInfo - Found user ID:', data.user.id)
            setCurrentUserId(data.user.id)
          }
        } catch (error) {
          console.error('AccountInfo - Error fetching user ID:', error)
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    initializeUser()
  }, [authenticated, privyUser, ready])

  // Fetch profile using getUserProfile (same as ProfilePage)
  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUserId) {
        try {
          setLoading(true)
          const profileData = await getUserProfile(currentUserId)
          console.log('AccountInfo - Profile data from backend:', profileData)
          console.log('AccountInfo - Avatar URL from backend:', profileData.profile?.avatar_url)
          setCurrentUser(profileData.profile)
        } catch (error) {
          console.error('AccountInfo - Failed to fetch profile:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchProfile()
  }, [currentUserId, getUserProfile])

  const handleLogout = async () => {
    await logout()
    window.location.href = '/'
  }

  if (!authenticated || !ready) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-black border-2 border-gray-700/70 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="text-center">
          <p className="text-white text-lg font-semibold mb-2">Not Connected</p>
          <p className="text-gray-400 text-sm">Please sign in to view your account</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-black border-2 border-gray-700/70 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl relative"
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/40 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header with Badge */}
      <div className="text-center mb-6">
        <div className="inline-block bg-gray-700/30 border-2 border-[#6e54ff] rounded-2xl px-4 py-2 mb-3">
          <h2 className="text-white text-sm font-semibold tracking-wide uppercase">Connected Account</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-[#6e54ff] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Avatar and Username */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser?.username || 'User'}
                  className={`relative w-24 h-24 border-2 border-[#6e54ff] object-cover shadow-lg ${currentUser?.account_type === 'community' ? 'rounded-md' : 'rounded-full'}`}
                  onError={(e) => {
                    console.error('AccountInfo - Failed to load avatar:', currentUser.avatar_url);
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = 'https://robohash.org/' + (currentUser?.username || 'user') + '.png?size=96x96';
                  }}
                />
              ) : (
                <img
                  src={'https://robohash.org/' + (currentUser?.username || 'user') + '.png?size=96x96'}
                  alt={currentUser?.username || 'User'}
                  className={`relative w-24 h-24 border-2 border-[#6e54ff] object-cover shadow-lg ${currentUser?.account_type === 'community' ? 'rounded-md' : 'rounded-full'}`}
                />
              )}
            </div>
            {currentUser && (
              <div className="text-center">
                <p className="text-white font-bold text-xl">{currentUser.username}</p>
                <p className="text-gray-400 text-sm">@{currentUser.username}</p>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="space-y-2">
            {privyUser?.email?.address && (
              <div className="flex items-center space-x-3 bg-gray-700/30 border border-gray-700/50 rounded-xl p-3 hover:bg-gray-700/40 transition-colors">
                <div className="bg-[#6e54ff]/20 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-[#6e54ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                  <p className="text-white text-sm truncate">{privyUser.email.address}</p>
                </div>
              </div>
            )}

            {privyUser?.wallet?.address && (
              <div className="flex items-center space-x-3 bg-gray-700/30 border border-gray-700/50 rounded-xl p-3 hover:bg-gray-700/40 transition-colors">
                <div className="bg-[#6e54ff]/20 p-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-[#6e54ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Wallet</p>
                  <p className="text-white text-xs font-mono truncate">
                    {privyUser.wallet.address.slice(0, 6)}...{privyUser.wallet.address.slice(-4)}
                  </p>
                </div>
              </div>
            )}

            {currentUser?.account_type && (
              <div className="flex items-center space-x-3 bg-gray-700/30 border border-gray-700/50 rounded-xl p-3 hover:bg-gray-700/40 transition-colors">
                <div className="bg-[#6e54ff]/20 p-2 rounded-lg">
                  <User className="w-4 h-4 text-[#6e54ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Account Type</p>
                  <p className="text-white text-sm capitalize">{currentUser.account_type}</p>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full text-white rounded-full px-6 py-3 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#DC2626",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(220, 38, 38, 0.50), 0px 0px 0px 1px #DC2626"
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </motion.div>
  )
}
