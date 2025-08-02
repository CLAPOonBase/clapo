"use client"
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useApi } from '../../Context/ApiProvider'
import { MessageCircle, Users, Plus, Send, Search, UserPlus } from 'lucide-react'

export default function MessagePage() {
  const { data: session } = useSession()
  const { state, getMessageThreads, getThreadMessages, sendMessage, getCommunities, joinCommunity, sendCommunityMessage, getCommunityMessages, createCommunity } = useApi()
  
  const [activeTab, setActiveTab] = useState<'dms' | 'communities'>('dms')
  const [dmSection, setDmSection] = useState<'threads' | 'search'>('threads')
  const [communitySection, setCommunitySection] = useState<'my' | 'join' | 'create'>('my')
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunityDescription, setNewCommunityDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false)
  const [hasInitializedUsers, setHasInitializedUsers] = useState(false)

  useEffect(() => {
    if (session?.dbUser?.id) {
      getMessageThreads(session.dbUser.id)
      getCommunities()
      fetchAllUsers()
    }
    
    // Reset when user logs out
    if (!session?.dbUser?.id) {
      setHasInitializedUsers(false)
    }
  }, [session?.dbUser?.id])

  useEffect(() => {
    if (dmSection === 'search' && !hasInitializedUsers) {
      if (allUsers.length > 0) {
        setSearchResults(allUsers)
        setHasInitializedUsers(true)
      } else {
        fetchAllUsers()
      }
    }
  }, [dmSection, hasInitializedUsers])

  const fetchAllUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('https://server.blazeswap.io/api/snaps/users/search?q=')
      const data = await response.json()
      if (data.users) {
        const filteredUsers = data.users.filter((user: any) => user.id !== session?.dbUser?.id)
        setAllUsers(filteredUsers)
        // Also update search results if we're in search section
        if (dmSection === 'search') {
          setSearchResults(filteredUsers)
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(allUsers)
      return
    }
    
    try {
      const response = await fetch(`https://server.blazeswap.io/api/snaps/users/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.users) {
        setSearchResults(data.users.filter((user: any) => user.id !== session?.dbUser?.id))
      }
    } catch (error) {
      console.error('Failed to search users:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !session?.dbUser?.id) return

    if (activeTab === 'dms' && selectedThread) {
      await sendMessage(selectedThread, {
        senderId: session.dbUser.id,
        content: messageContent.trim()
      })
    } else if (activeTab === 'communities' && selectedCommunity) {
      await sendCommunityMessage(selectedCommunity, {
        senderId: session.dbUser.id,
        content: messageContent.trim()
      })
    }

    setMessageContent('')
  }

  const handleStartChatWithUser = async (user: any) => {
    if (!session?.dbUser?.id) return

    console.log('🚀 Starting chat with user:', user.username)
    console.log('👤 Current user ID:', session.dbUser.id)
    console.log('👥 Target user ID:', user.id)

    try {
      // Create a direct message thread without a custom name
      // We'll handle the display logic in the UI
      const response = await fetch('https://server.blazeswap.io/api/snaps/messages/direct-thread', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: session.dbUser.id,
          userId2: user.id
        }),
      })
      
      const threadResponse = await response.json()
      
      console.log('📝 Thread Response:', threadResponse)
      console.log('📝 Thread Response Type:', typeof threadResponse)
      console.log('📝 Thread Response Keys:', Object.keys(threadResponse || {}))
      
      // Handle different possible response structures
      const thread = threadResponse?.thread || threadResponse?.data?.thread || threadResponse?.data || threadResponse
      
      if (thread && thread.id) {
        console.log('✅ Thread created successfully!')
        console.log('✅ Thread ID:', thread.id)
        console.log('✅ Thread Name:', thread.name)

        // Select the new thread
        setSelectedThread(thread.id)
        await getThreadMessages(thread.id)
        
        // Refresh threads list
        await getMessageThreads(session.dbUser.id)
        
        // Switch to threads section
        setDmSection('threads')
        
        console.log('✅ Chat setup complete!')
      } else {
        console.error('❌ Thread creation failed - no thread in response')
        console.error('❌ Full response:', threadResponse)
        console.error('❌ Extracted thread:', thread)
      }
    } catch (error) {
      console.error('❌ Failed to start chat with user:', error)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!session?.dbUser?.id) return

    await joinCommunity(communityId, {
      userId: session.dbUser.id
    })
  }

  const handleSelectThread = async (threadId: string) => {
    setSelectedThread(threadId)
    await getThreadMessages(threadId)
  }

  const handleSelectCommunity = async (communityId: string) => {
    setSelectedCommunity(communityId)
    await getCommunityMessages(communityId)
  }

  const currentMessages = activeTab === 'dms' 
    ? state.threadMessages[selectedThread || ''] || []
    : state.communityMessages[selectedCommunity || ''] || []

  const currentThread = state.messageThreads?.find(t => t.id === selectedThread)
  const currentCommunity = state.communities?.find(c => c.id === selectedCommunity)

  const displayUsers = searchQuery.trim() ? searchResults : allUsers

  return (
    <div className="bg-dark-800 rounded-md h-[600px] flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Messages</h2>
            <button className="text-blue-400 hover:text-blue-300">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('dms')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'dms' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Direct Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'communities' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Communities</span>
            </button>
          </div>

          {/* DM Section Tabs */}
          {activeTab === 'dms' && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => setDmSection('threads')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  dmSection === 'threads' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                My Chats
              </button>
              <button
                onClick={() => setDmSection('search')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  dmSection === 'search' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Find Users
              </button>
            </div>
          )}

          {/* Communities Section Tabs */}
          {activeTab === 'communities' && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => setCommunitySection('my')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  communitySection === 'my' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                My Communities
              </button>
              <button
                onClick={() => setCommunitySection('join')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  communitySection === 'join' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Join Communities
              </button>
              <button
                onClick={() => setShowCreateCommunityModal(true)}
                className="ml-auto px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'dms' ? (
            dmSection === 'threads' ? (
              <div className="p-4">
                <div className="space-y-2">
                  {state.messageThreads?.map((thread) => {
                    // For direct messages, show the other participant's name
                    const currentUserId = session?.dbUser?.id
                    let displayName = thread.name || 'Direct Message'
                    
                    console.log('🔍 Thread Debug:', {
                      threadId: thread.id,
                      threadName: thread.name,
                      creatorId: (thread as any).creator_id,
                      currentUserId,
                      isGroup: (thread as any).is_group,
                      allUsersCount: allUsers.length
                    })
                    
                    // If this is a direct message, determine the other participant
                    if (!(thread as any).is_group && currentUserId) {
                      // If current user is the creator, the other participant is not the creator
                      // If current user is not the creator, the other participant is the creator
                      const otherParticipantId = (thread as any).creator_id === currentUserId 
                        ? 'unknown' // We need to find the other participant
                        : (thread as any).creator_id
                      
                      console.log('🔍 Other Participant ID:', otherParticipantId)
                      
                      if (otherParticipantId !== 'unknown') {
                        // Try to get the other participant's info from the users list
                        const otherUser = allUsers.find(user => user.id === otherParticipantId)
                        console.log('🔍 Found Other User:', otherUser)
                        if (otherUser) {
                          displayName = otherUser.username || otherUser.name || 'User'
                        } else {
                          // Fallback to thread name if we can't find the user
                          displayName = thread.name || 'Direct Message'
                        }
                      } else {
                        // For threads where current user is creator, try to get info from thread name
                        // The thread name might contain the other participant's username
                        if (thread.name && thread.name !== 'Direct Message') {
                          displayName = thread.name
                        } else {
                          displayName = 'Direct Message'
                        }
                      }
                    }
                    
                    console.log('🔍 Final Display Name:', displayName)
                    
                    return (
                      <div
                        key={thread.id}
                        onClick={() => handleSelectThread(thread.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedThread === thread.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                        }`}
                      >
                        <div className="font-medium">{displayName}</div>
                        <div className="text-sm opacity-75">
                          {(thread as any).is_group ? 'Group' : 'Direct Message'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchUsers(e.target.value)
                      }}
                      className="w-full pl-10 pr-3 py-2 bg-dark-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {loadingUsers ? (
                    <div className="text-center py-8 text-gray-400">
                      Loading users...
                    </div>
                  ) : displayUsers.length > 0 ? (
                    displayUsers?.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleStartChatWithUser(user)}
                        className="p-3 rounded-lg cursor-pointer transition-colors bg-dark-700 text-gray-300 hover:bg-dark-600"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {user.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.bio || 'No bio'}</div>
                          </div>
                          <UserPlus className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No users found
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="p-4">
              <div className="mb-4">
                {communitySection === 'my' ? (
                  <div className="space-y-2">
                    {state.communities?.map((community) => (
                      <div
                        key={community.id}
                        onClick={() => handleSelectCommunity(community.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedCommunity === community.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                        }`}
                      >
                        <div className="font-medium">{community.name}</div>
                        <div className="text-sm opacity-75">{community.description}</div>
                      </div>
                    ))}
                  </div>
                ) : communitySection === 'join' ? (
                  <div className="space-y-2">
                    {state.communities?.map((community) => (
                      <div
                        key={community.id}
                        className="p-3 rounded-lg bg-dark-700 text-gray-300"
                      >
                        <div className="font-medium">{community.name}</div>
                        <div className="text-sm opacity-75">{community.description}</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleJoinCommunity(community.id)
                          }}
                          className="mt-2 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700">
          {activeTab === 'dms' && currentThread ? (
            <div>
              <h3 className="text-lg font-semibold text-white">{currentThread.name || 'Direct Message'}</h3>
              <p className="text-sm text-gray-400">
                {currentThread.isGroup ? 'Group Chat' : 'Direct Message'}
              </p>
            </div>
          ) : activeTab === 'communities' && currentCommunity ? (
            <div>
              <h3 className="text-lg font-semibold text-white">{currentCommunity.name}</h3>
              <p className="text-sm text-gray-400">{currentCommunity.description}</p>
            </div>
          ) : (
            <div className="text-gray-400">
              {activeTab === 'dms' && dmSection === 'search' 
                ? 'Search for users to start a conversation'
                : `Select a ${activeTab === 'dms' ? 'thread' : 'community'} to start messaging`
              }
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentMessages?.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {message.senderUsername?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-white">{message.senderUsername}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-300">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder={`Type a message...`}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-3 py-2 bg-dark-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Community Modal */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Create Community</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Community name..."
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              
              <textarea
                placeholder="Community description..."
                value={newCommunityDescription}
                onChange={(e) => setNewCommunityDescription(e.target.value)}
                className="w-full px-3 py-2 bg-dark-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                rows={3}
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (newCommunityName.trim() && newCommunityDescription.trim() && session?.dbUser?.id) {
                      createCommunity({
                        name: newCommunityName.trim(),
                        description: newCommunityDescription.trim(),
                        creatorId: session.dbUser.id
                      })
                      setNewCommunityName('')
                      setNewCommunityDescription('')
                      setShowCreateCommunityModal(false)
                    }
                  }}
                  disabled={!newCommunityName.trim() || !newCommunityDescription.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                
                <button
                  onClick={() => {
                    setShowCreateCommunityModal(false)
                    setNewCommunityName('')
                    setNewCommunityDescription('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}