'use client'

import { useState } from 'react'
import { useApi } from '../Context/ApiProvider'
import { X, User, Lock, Mail, MessageSquare, Users, Building2 } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [accountType, setAccountType] = useState<'individual' | 'community'>('individual')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    communityId: '',
    communityName: '',
    communityType: 'open' as 'open' | 'closed' | 'private'
  })
  const { login, signup, state } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isLogin) {
        await login(formData.username, formData.password)
      } else {
        const signupData: any = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          avatarUrl: `https://robohash.org/${formData.username}?size=200x200`,
          accountType: accountType
        }

        // Add community-specific fields if account type is community
        if (accountType === 'community') {
          signupData.communityId = formData.communityId
          signupData.communityName = formData.communityName
          signupData.communityType = formData.communityType
        }

        await signup(signupData)
      }
      onClose()
      setFormData({ username: '', email: '', password: '', bio: '', communityId: '', communityName: '', communityType: 'open' })
      setAccountType('individual')
    } catch (error) {
      console.error('Authentication failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-black rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Login' : 'Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('individual')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                    accountType === 'individual'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-gray-600 bg-dark-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('community')}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                    accountType === 'community'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : 'border-gray-600 bg-dark-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Community</span>
                </button>
              </div>
            </div>
          )}

          {isLogin ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
          ) : accountType === 'individual' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Community ID
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.communityId}
                    onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="e.g., awesome-community"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Community Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.communityName}
                    onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                    placeholder="Enter community name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Community Type
                </label>
                <select
                  value={formData.communityType}
                  onChange={(e) => setFormData({ ...formData, communityType: e.target.value as 'open' | 'closed' | 'private' })}
                  className="w-full px-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  required
                >
                  <option value="open">Open - Anyone can join</option>
                  <option value="closed">Closed - Approval required</option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>
            </>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Tell us about yourself"
                  rows={3}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={state.user.loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {state.user.loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {state.user.error && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 rounded-lg text-red-200 text-sm">
            {state.user.error}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-500 hover:text-orange-400 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  )
} 