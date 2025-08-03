"use client"
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useApi } from '../../Context/ApiProvider'
import { apiService } from '../../lib/api'
import { MessageCircle, Users, Plus, Send, Search, UserPlus, ChevronDown, RefreshCw, Hash, Dot } from 'lucide-react'
import { io } from 'socket.io-client'

export default function MessagePage() {
  const { data: session } = useSession()
  const { 
    state, 
    dispatch,
    getMessageThreads, 
    getThreadMessages, 
    sendMessage, 
    getCommunities, 
    joinCommunity, 
    createCommunity
  } = useApi()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)
  
  const [activeTab, setActiveTab] = useState<'dms' | 'communities'>('dms')
  const [dmSection, setDmSection] = useState<'threads' | 'search'>('threads')
  const [communitySection, setCommunitySection] = useState<'my' | 'join' | 'create'>('my')
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [communityMessages, setCommunityMessages] = useState<any[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  

  const [messageContent, setMessageContent] = useState('')
  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunityDescription, setNewCommunityDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false)
  const [hasInitializedUsers, setHasInitializedUsers] = useState(false)
  
  const [socket, setSocket] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (session?.dbUser?.id) {
      const newSocket = io('https://server.blazeswap.io', {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
      
      newSocket.on('connect', () => {
        console.log('✅ Connected to socket server')
        setIsConnected(true)
      })
      
      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from socket server:', reason)
        setIsConnected(false)
      })
      
      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error)
        setIsConnected(false)
      })
      
      newSocket.on('new_dm_message', async (data) => {
        console.log('📨 New DM received in MessagePage:', data)
        
        const message = data.message || data
        const isOwnMessage = message.sender_id === session.dbUser.id || data.senderId === session.dbUser.id
        
        console.log('🔍 Message filtering:', {
          messageSenderId: message.sender_id,
          dataSenderId: data.senderId,
          currentUserId: session.dbUser.id,
          isOwnMessage,
          messageThreadId: message.thread_id,
          dataThreadId: data.threadId,
          selectedThread,
          threadMatches: data.threadId === selectedThread || message.thread_id === selectedThread
        })
        
        if (data.threadId === selectedThread || message.thread_id === selectedThread) {
          console.log('✅ New message received for current thread')
          console.log('📝 Message content:', message.content)
          console.log('📝 Message sender:', message.sender_username || message.sender_id)
          
          try {
            const response = await fetch(`https://server.blazeswap.io/api/snaps/message-threads/${selectedThread}/messages?limit=50&offset=0`)
            const data = await response.json()
            
            if (data.messages && Array.isArray(data.messages)) {
              console.log('📊 Refreshed messages count:', data.messages.length)
              dispatch({ 
                type: 'SET_THREAD_MESSAGES', 
                payload: { threadId: selectedThread, messages: data.messages } 
              })
            }
          } catch (error) {
            console.error('❌ Failed to refresh messages:', error)
          }
        } else {
          console.log('❌ Message filtered out - not for current thread')
        }
      })
      

      newSocket.on('new_community_message', async (data) => {
        console.log('📨 New community message received:', data)
        console.log('🔍 Debug info:', {
          dataCommunityId: data.communityId,
          messageCommunityId: data.message?.community_id,
          selectedCommunity,
          communityMatches: data.communityId === selectedCommunity || data.message?.community_id === selectedCommunity
        })
        
        const message = data.message || data
        
        console.log('🔍 Community ID comparison:', {
          dataCommunityId: data.communityId,
          messageCommunityId: message.community_id,
          selectedCommunity,
          exactMatch: data.communityId === selectedCommunity,
          messageMatch: message.community_id === selectedCommunity
        })
        
        console.log('✅ New community message received for current community')
        console.log('📝 Message content:', message.content)
        console.log('📝 Message sender:', message.sender_username || message.sender_id)
        
        try {
          const response = await fetch(`https://server.blazeswap.io/api/snaps/communities/${selectedCommunity}/messages?limit=50&offset=0`)
          const data = await response.json()
          
          if (data.messages && Array.isArray(data.messages)) {
            console.log('📊 Refreshed community messages count:', data.messages.length)
            setCommunityMessages(data.messages)
          }
        } catch (error) {
          console.error('❌ Failed to refresh community messages:', error)
        }
      })
      
      setSocket(newSocket)
      
      return () => {
        newSocket.disconnect()
      }
    }
  }, [session?.dbUser?.id, selectedThread, selectedCommunity])

  useEffect(() => {
    if (session?.dbUser?.id) {
      getCommunities()
      getMessageThreads(session.dbUser.id)
    }
  }, [session?.dbUser?.id, getCommunities, getMessageThreads])

  const handleCreateCommunity = async () => {
    if (!session?.dbUser?.id || !newCommunityName.trim() || !newCommunityDescription.trim()) return

    try {
      await createCommunity({
        name: newCommunityName.trim(),
        description: newCommunityDescription.trim(),
        creatorId: session.dbUser.id
      })
      
      setShowCreateCommunityModal(false)
      setNewCommunityName('')
      setNewCommunityDescription('')
      
      getCommunities()
    } catch (error) {
      console.error('Failed to create community:', error)
    }
  }

  const handleJoinCommunity = async (communityId: string) => {
    if (!session?.dbUser?.id) return

    try {
      await joinCommunity(communityId, { userId: session.dbUser.id })
      
      getCommunities()
    } catch (error) {
      console.error('Failed to join community:', error)
    }
  }

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

    const messageText = messageContent.trim()
    setMessageContent('')

    console.log('🔍 Sending message:', {
      currentUserId: session.dbUser.id,
      selectedThread,
      selectedCommunity,
      activeTab,
      socketConnected: !!socket
    })

    if (activeTab === 'dms' && selectedThread && socket) {
 
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content: messageText,
        sender_id: session.dbUser.id,
        created_at: new Date().toISOString(),
        sender_username: session.dbUser.username,
        sender_avatar: session.dbUser.avatarUrl
      }
      
  
      const currentMessages = state.threadMessages[selectedThread] || []
      const updatedMessages = [...currentMessages, tempMessage]

      const sortedMessages = updatedMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      dispatch({ 
        type: 'SET_THREAD_MESSAGES', 
        payload: { threadId: selectedThread, messages: sortedMessages } 
      })

      // Send via socket like the test chat
      socket.emit('send_dm_message', { 
        userId: session.dbUser.id, 
        content: messageText, 
        threadId: selectedThread 
      }, (response: any) => {
        if (response.success) {
          console.log('✅ Message sent successfully via socket')
      
          getThreadMessages(selectedThread)
        } else {
          console.error('❌ Failed to send message via socket:', response.message)

          dispatch({ 
            type: 'SET_THREAD_MESSAGES', 
            payload: { threadId: selectedThread, messages: currentMessages } 
          })
          sendMessage(selectedThread, {
            senderId: session.dbUser.id,
            content: messageText
          })
        }
      })
    } else if (activeTab === 'dms' && selectedThread) {

      await sendMessage(selectedThread, {
        senderId: session.dbUser.id,
        content: messageText
      })
  
      await getThreadMessages(selectedThread)
          } else if (activeTab === 'communities' && selectedCommunity && socket && isConnected) {
        const tempMessage = {
          id: `temp-${Date.now()}`,
          content: messageText,
          sender_id: session.dbUser.id,
          created_at: new Date().toISOString(),
          sender_username: session.dbUser.username,
          sender_avatar: session.dbUser.avatarUrl
        }
        
        const updatedMessages = [...communityMessages, tempMessage]
        setCommunityMessages(updatedMessages)

        console.log('🔍 Sending community message:', {
          userId: session.dbUser.id,
          content: messageText,
          communityId: selectedCommunity,
          socketConnected: isConnected
        })
        
        socket.emit('send_community_message', {
          userId: session.dbUser.id,
          content: messageText,
          communityId: selectedCommunity
        }, async (response: any) => {
          if (response.success) {
            console.log('✅ Community message sent successfully via socket')
            const apiResponse = await apiService.getCommunityMessages(selectedCommunity)
            setCommunityMessages(apiResponse.messages || [])
          } else {
            console.error('❌ Failed to send community message via socket:', response.message)
            setCommunityMessages(communityMessages)
            await apiService.sendCommunityMessage(selectedCommunity, {
              senderId: session.dbUser.id,
              content: messageText
            })
            const apiResponse = await apiService.getCommunityMessages(selectedCommunity)
            setCommunityMessages(apiResponse.messages || [])
          }
      })
    } else if (activeTab === 'communities' && selectedCommunity) {
        const tempMessage = {
          id: `temp-${Date.now()}`,
          content: messageText,
          sender_id: session.dbUser.id,
          created_at: new Date().toISOString(),
          sender_username: session.dbUser.username,
          sender_avatar: session.dbUser.avatarUrl
        }
        
        const updatedMessages = [...communityMessages, tempMessage]
        setCommunityMessages(updatedMessages)

      await apiService.sendCommunityMessage(selectedCommunity, {
        senderId: session.dbUser.id,
          content: messageText
      })
      
      const response = await apiService.getCommunityMessages(selectedCommunity)
      setCommunityMessages(response.messages || [])
    }
  }

  const handleStartChatWithUser = async (user: any) => {
    if (!session?.dbUser?.id) return

    try {
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
      
      const thread = threadResponse?.thread || threadResponse?.data?.thread || threadResponse?.data || threadResponse
      
      if (thread && thread.id) {
        setSelectedThread(thread.id)
        await getThreadMessages(thread.id)
        
        await getMessageThreads(session.dbUser.id)
        
        setDmSection('threads')
      } else {
        console.error('❌ Thread creation failed - no thread in response')
      }
    } catch (error) {
      console.error('❌ Failed to start chat with user:', error)
    }
  }

  const handleSelectThread = async (threadId: string) => {
    setSelectedThread(threadId)
    await getThreadMessages(threadId)
  }

  const handleSelectCommunity = async (communityId: string) => {
    setSelectedCommunity(communityId)
    try {
      const response = await apiService.getCommunityMessages(communityId)
      setCommunityMessages(response.messages || [])
    } catch (error) {
      console.error('Failed to fetch community messages:', error)
      setCommunityMessages([])
    }
  }

  const handleSendCommunityMessage = async () => {
    if (!selectedCommunity || !session?.dbUser?.id || !messageContent.trim()) return

    try {
      await apiService.sendCommunityMessage(selectedCommunity, {
        senderId: session.dbUser.id,
        content: messageContent.trim()
      })
      setMessageContent('')
    } catch (error) {
      console.error('Failed to send community message:', error)
    }
  }

  const currentMessages = activeTab === 'dms' 
    ? state.threadMessages[selectedThread || ''] || []
    : communityMessages

  const displayMessages = activeTab === 'dms' 
    ? currentMessages?.slice().reverse()
    : currentMessages

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setNewMessageCount(0)
  }

  
  useEffect(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      
              if (isNearBottom) {
          setTimeout(() => {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
          }, 100)
        } else {
          setNewMessageCount(prev => prev + 1)
        }
      } else {
        setTimeout(() => {
          messagesContainerRef.current?.scrollTo(0, messagesContainerRef.current.scrollHeight)
        }, 100)
      }
        }, [currentMessages])

        useEffect(() => {
      if ((selectedThread || selectedCommunity) && messagesContainerRef.current) {
        setTimeout(() => {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }, 200)
      }
    }, [selectedThread, selectedCommunity])

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!isNearBottom)
      
      if (isNearBottom) {
        setNewMessageCount(0)
      }
    }
  }

  const currentThread = state.messageThreads?.find(t => t.id === selectedThread)
  const currentCommunity = state.communities?.find(c => c.id === selectedCommunity)

  const displayUsers = searchQuery.trim() ? searchResults : allUsers

  return (
    <div className=" rounded-xl shadow-2xl h-[700px] flex overflow-hidden ">
      {/* Sidebar */}
      <div className="w-80 bg-dark-800 mr-4 rounded-md backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Messages
            </h2>
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`} />
                <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
          
            </div>
          </div>
          
          {/* Main Tabs */}
          <div className="flex space-x-2 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dms')}
              className={`flex items-center space-x-2 py-2.5 justify-center transition-all duration-200 font-medium ${
                activeTab === 'dms' 
                  ? 'border-b-2 border-primary text-white w-full' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-600/50 w-full'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>DMs</span>
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`flex items-center space-x-2 py-2.5 justify-center transition-all duration-200 font-medium ${
                activeTab === 'communities' 
                       ? 'border-b-2 border-primary text-white w-full' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-600/50 w-full'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Communities</span>
            </button>
          </div>

          {/* Sub Tabs */}
          {activeTab === 'dms' && (
            <div className="flex space-x-2 mt-4 text-nowrap text-xs">
              <button
                onClick={() => setDmSection('threads')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                  dmSection === 'threads' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
                }`}
              >
                My Chats
              </button>
              <button
                onClick={() => setDmSection('search')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                  dmSection === 'search' 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
                }`}
              >
                Find Users
              </button>
            </div>
          )}

          {activeTab === 'communities' && (
            <div className="flex items-center space-x-2 mt-4">
              <button
                onClick={() => setCommunitySection('my')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                  communitySection === 'my' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
                }`}
              >
                My Communities
              </button>
              <button
                onClick={() => setCommunitySection('join')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                  communitySection === 'join' 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-600/30'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setShowCreateCommunityModal(true)}
                className="ml-auto p-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all duration-200 hover:scale-110"
                title="Create Community"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {activeTab === 'dms' ? (
            dmSection === 'threads' ? (
              <div className="p-4">
                <div className="space-y-2">
                  {!state.messageThreads ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm">Loading chats...</p>
                    </div>
                  ) : state.messageThreads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm text-center">No chats yet<br />Start a conversation!</p>
                    </div>
                  ) : (
                    state.messageThreads?.map((thread) => {
                      const currentUserId = session?.dbUser?.id
                      let displayName = thread.name || 'Direct Message'
                      
                      if (!(thread as any).is_group && currentUserId && (thread as any).participants) {
                        const otherParticipant = (thread as any).participants.find(
                          (participant: any) => participant.user_id !== currentUserId
                        )
                        
                        if (otherParticipant) {
                          displayName = otherParticipant.username || 'User'
                        } else {
                          displayName = thread.name || 'Direct Message'
                        }
                      }
                      
                      return (
                        <div
                          key={thread.id}
                          onClick={() => handleSelectThread(thread.id)}
                          className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                            selectedThread === thread.id 
                              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/50 text-white shadow-lg' 
                              : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                selectedThread === thread.id ? 'bg-blue-500' : 'bg-slate-600 group-hover:bg-slate-500'
                              }`}>
                                {displayName.charAt(0).toUpperCase()}
                              </div>
                              {/* <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-800"></div> */}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{displayName}</div>
                              <div className="text-xs opacity-70 flex items-center">
                                <Dot className="w-3 h-3 mr-1" />
                                {(thread as any).is_group ? 'Group Chat' : 'Direct Message'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        searchUsers(e.target.value)
                      }}
                      className="w-full pl-12 pr-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {loadingUsers ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                      <p className="text-sm">Finding users...</p>
                    </div>
                  ) : displayUsers.length > 0 ? (
                    displayUsers?.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleStartChatWithUser(user)}
                        className="group p-4 rounded-xl cursor-pointer transition-all duration-200 bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50 hover:shadow-lg"
                      >
                        <div className="flex flex-col items-center space-x-4">
                        <div className='flex justify-between w-full space-x-2 items-start '>
                            <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-lg font-bold">
                                {user.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-800"></div> */}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                              {user.username}
                            </div>
                            <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                            <button className='text-xs bg-green-900 px-2 rounded-md'>
                              Add Friend
                            </button>
                          </div>
                          </div>
                        </div>
                         
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Search className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-sm">No users found</p>
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
                    {state.communities?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm text-center">No communities yet<br />Join or create one!</p>
                      </div>
                    ) : (
                      state.communities?.map((community) => (
                        <div
                          key={community.id}
                          onClick={() => handleSelectCommunity(community.id)}
                          className={`group p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                            selectedCommunity === community.id 
                              ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-white shadow-lg' 
                              : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                              selectedCommunity === community.id ? 'bg-purple-500' : 'bg-slate-600 group-hover:bg-slate-500'
                            }`}>
                              <Hash className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{community.name}</div>
                              <div className="text-xs opacity-70 truncate">{community.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs opacity-60">
                            <span>Created by {(community as any).creator_username || 'Unknown'}</span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {(community as any).member_count || 0}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : communitySection === 'join' ? (
                  <div className="space-y-2">
                    {state.communities?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-sm">No communities to discover</p>
                      </div>
                    ) : (
                      state.communities?.map((community) => (
                        <div
                          key={community.id}
                          className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <Hash className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-white">{community.name}</div>
                              <div className="text-sm text-slate-400 truncate">{community.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {community.member_count || 0} members
                            </span>
                            <button
                              onClick={() => handleJoinCommunity(community.id)}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
                            >
                              Join
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
     <div className='flex w-full mr-6 rounded-md'>
 <div className="flex-1 flex flex-col bg-dark-800  rounded-md backdrop-blur-sm">
        {/* Chat Header */}
        <div className="px-6 py-2 border-b border-slate-700/50">
          {activeTab === 'dms' && currentThread ? (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {(currentThread.name || 'DM').charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900"></div> */}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{currentThread.name || 'Direct Message'}</h3>
                <p className="text-sm text-slate-400 flex items-center">
                  <Dot className="w-4 h-4 mr-1" />
                  {currentThread.isGroup ? 'Group Chat' : 'Direct Message'}
                </p>
              </div>
            </div>
          ) : activeTab === 'communities' && currentCommunity ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Hash className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{currentCommunity.name}</h3>
                <p className="text-sm text-slate-400">{currentCommunity.description}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">
                {activeTab === 'dms' && dmSection === 'search' 
                  ? 'Find someone to chat with'
                  : `Select a ${activeTab === 'dms' ? 'conversation' : 'community'}`
                }
              </p>
              <p className="text-sm opacity-75">
                {activeTab === 'dms' && dmSection === 'search' 
                  ? 'Search for users and start a conversation'
                  : `Choose from your ${activeTab === 'dms' ? 'chats' : 'communities'} to begin messaging`
                }
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
      <div 
  ref={messagesContainerRef}
  onScroll={handleScroll}
  className="flex-1 overflow-y-auto p-4 space-y-3 relative scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent"
>
  {displayMessages?.map((message: any) => {
    const currentUserId = session?.dbUser?.id;
    const isOwnMessage = message.sender_id === currentUserId;

    return (
      <div
        key={message.id}
        className={`group flex justify-center items-center gap-2 px-2 rounded-xl transition-all duration-200
          ${isOwnMessage ? 'flex-row-reverse text-right justify-end' : 'justify-start'}
          ${!isOwnMessage ? 'hover:bg-slate-800/30' : ''}`}
      >
        <div className="relative flex-shrink-0">
          <img 
            src={message.sender_avatar || 'https://robohash.org/default.png'} 
            alt="Avatar" 
            className={`w-10 h-10 rounded-full border-2 transition-colors
              ${isOwnMessage ? 'border-blue-500/50' : 'border-slate-600/50 group-hover:border-slate-500/50'}`}
          />
          {/* <div className="absolute -top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900"></div> */}
        </div>
        <div className={`flex-1 min-w-0 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <div className={`flex flex-col items-center mb-2 ${isOwnMessage ? 'justify-end flex-row-reverse' : ''}`}>
            <span  className={`font-semibold flex w-full text-white group-hover:text-blue-300 transition-colors  ${isOwnMessage 
                ? 'ml-auto justify-end' 
                : 'justify-start'
              }`}>
              {/* {message.sender_username || 'User'} */}
            </span>
          
          </div>
          <div
            className={`rounded-xl px-3 inline-block max-w-[80%]
              ${isOwnMessage 
                ? 'bg-blue-900/40 ml-auto' 
                : 'bg-slate-800/40 text-slate-200 border-slate-700/30 mr-auto'
              }`}
          >
            <p className="leading-relaxed">{message.content}</p>
              <span  className={`text-[8px] text-slate-400  rounded-full  ${isOwnMessage 
                ? 'ml-auto' 
                : ''
              }`}
              >
            
              {new Date(message.created_at || message.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  })}

  <div ref={messagesEndRef} />

  {showScrollButton && (
    <button
      onClick={scrollToBottom}
      className="absolute bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-3 rounded-full shadow-xl transition-all duration-200 hover:scale-110 hover:shadow-2xl"
      title={`Scroll to bottom${newMessageCount > 0 ? ` (${newMessageCount} new)` : ''}`}
    >
      <ChevronDown className="w-5 h-5" />
      {newMessageCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
          {newMessageCount > 9 ? '9+' : newMessageCount}
        </span>
      )}
    </button>
  )}
</div>


        {/* Message Input */}
        <div className="px-6 py-2">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="w-full px-6 py-2 bg-slate-700/50 text-white rounded-2xl border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-slate-400"
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!messageContent.trim()}
              className="py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
            
           
          </div>
        </div>
      </div>
     </div>

      {/* Create Community Modal */}
      {showCreateCommunityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-full max-w-md border border-slate-700/50 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Create Community</h3>
                <p className="text-sm text-slate-400">Build your own space</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Community Name</label>
                <input
                  type="text"
                  placeholder="Enter community name..."
                  value={newCommunityName}
                  onChange={(e) => setNewCommunityName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  placeholder="Describe your community..."
                  value={newCommunityDescription}
                  onChange={(e) => setNewCommunityDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleCreateCommunity}
                  disabled={!newCommunityName.trim() || !newCommunityDescription.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Community
                </button>
                
                <button
                  onClick={() => {
                    setShowCreateCommunityModal(false)
                    setNewCommunityName('')
                    setNewCommunityDescription('')
                  }}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
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