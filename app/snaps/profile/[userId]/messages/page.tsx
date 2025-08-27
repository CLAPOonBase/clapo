'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowLeft, MessageSquare, Search, Users, Calendar } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useApi } from '@/app/Context/ApiProvider'
import { useRouter } from 'next/navigation'
import Sidebar from '../../Sections/Sidebar'
import UserActivityFeed from '../../Sections/ActivityFeed'
import { DMSection } from '@/app/components/DMSection'

interface UserProfile {
  id: string
  username: string
  email: string
  bio: string
  avatar_url?: string
  created_at: string
  total_posts: number
  total_likes_given: number
  total_comments_made: number
  total_retweets_made: number
  total_bookmarks_made: number
  followers_count: number
  following_count: number
}

export default function UserProfileMessagesPage({ params }: { params: { userId: string } }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState<'home' | 'explore' | 'notifications' | 'likes' | 'activity' | 'profile' | 'messages' | 'bookmarks' | 'share' | 'search'>('messages')
  
  // Message state
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [dmSection, setDmSection] = useState<'threads' | 'search'>('threads')
  
  // Mock data for messages (replace with real API calls)
  const [messageThreads, setMessageThreads] = useState<any[]>([])
  
  const { data: session } = useSession()
  const { getUserProfile } = useApi()
  const router = useRouter()
  
  const currentUserId = session?.dbUser?.id
  const isOwnProfile = currentUserId === params.userId

  useEffect(() => {
    if (params.userId) {
      loadUserProfile()
      loadMessageThreads()
    }
  }, [params.userId])

  const loadUserProfile = async () => {
    if (!params.userId || isLoading) return
    
    setIsLoading(true)
    try {
      const profileResponse = await getUserProfile(params.userId)
      
      if (profileResponse && profileResponse.profile) {
        setUserProfile(profileResponse.profile)
      } else {
        console.error('Invalid profile response structure:', profileResponse)
        router.push('/snaps')
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
      router.push('/snaps')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessageThreads = async () => {
    // Mock data - replace with real API call
    const mockThreads = [
      {
        id: '1',
        participants: [{ user_id: '1', username: 'john_doe' }, { user_id: '2', username: 'jane_smith' }],
        lastMessage: { content: 'Hey, how are you?', timestamp: new Date().toISOString() },
        unreadCount: 2
      },
      {
        id: '2',
        participants: [{ user_id: '1', username: 'john_doe' }, { user_id: '3', username: 'bob_wilson' }],
        lastMessage: { content: 'Thanks for the help!', timestamp: new Date().toISOString() },
        unreadCount: 0
      },
      {
        id: '3',
        participants: [{ user_id: '1', username: 'john_doe' }, { user_id: '4', username: 'alice_johnson' }],
        lastMessage: { content: 'Great idea! Let\'s discuss this further.', timestamp: new Date().toISOString() },
        unreadCount: 1
      }
    ]
    setMessageThreads(mockThreads)
  }

  const handleStartChat = (user: any) => {
    // Handle starting a new chat
    console.log('Starting chat with:', user)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (isLoading) {
    return (
      <div className="flex-col md:flex-row text-white flex mx-auto">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky top-20 bg-dark-800 p-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-dark-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-dark-700 rounded w-32"></div>
                <div className="h-4 bg-dark-700 rounded w-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex-col md:flex-row text-white flex mx-auto">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky top-20 bg-dark-800 p-4">
          <div className="text-center py-8 text-dark-400">
            User not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-col md:flex-row text-white flex mx-auto">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 md:m-4 md:mt-1 rounded-2xl sticky top-20 bg-dark-800 p-4">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="p-6 border-b border-dark-700 mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Image
                src={userProfile.avatar_url || '/4.png'}
                alt={userProfile.username}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-white text-xl font-bold">
                  {userProfile.username}
                </h3>
                <div className="flex items-center space-x-2 text-blue-400">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Messages</span>
                </div>
              </div>
              
              {userProfile.bio && (
                <p className="text-dark-300 text-sm mb-4">
                  {userProfile.bio}
                </p>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-dark-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(userProfile.created_at)}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-xs text-dark-400">
                <div className="text-center">
                  <span>Posts: {userProfile.total_posts}</span>
                </div>
                <div className="text-center">
                  <span>Followers: {userProfile.followers_count}</span>
                </div>
                <div className="text-center">
                  <span>Following: {userProfile.following_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div className="bg-dark-700 rounded-lg p-4">
          <div className="mb-4">
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setDmSection('threads')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dmSection === 'threads'
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-600 text-dark-300 hover:text-white'
                }`}
              >
                Threads
              </button>
              <button
                onClick={() => setDmSection('search')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dmSection === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-dark-600 text-dark-300 hover:text-white'
                }`}
              >
                Search Users
              </button>
            </div>
            
            <DMSection
              dmSection={dmSection}
              state={{ messageThreads, communities: [] }}
              session={session}
              selectedThread={selectedThread}
              onSelectThread={setSelectedThread}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onStartChat={handleStartChat}
              unreadCounts={{}}
              lastMessages={{}}
            />
          </div>
        </div>
      </div>
      
      {session?.dbUser && (
        <div className="hidden md:block top-20 w-[300px]">
          <UserActivityFeed username={session.dbUser.username} activity={[]} />
        </div>
      )}
    </div>
  )
}
