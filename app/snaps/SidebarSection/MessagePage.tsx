"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApi } from '../../Context/ApiProvider';
import { MessageCircle, Users, Plus, Search, ChevronDown, Hash, Dot, ArrowLeft, UserPlus, MessageSquare, Eye, Clock, User } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { MessageList } from '../../components/MessageList';
import { MessageInput } from '../../components/MessageInput';
import { CreateCommunityModal } from '@/app/components/CreateCommunityModal';
import { ConnectionStatus } from '../../components/ConnectionStatus';
import { TabNavigation } from '@/app/components/TabNavigation';
import { DMSection } from '@/app/components/DMSection';
import { CommunitySection } from '@/app/components/CommunitySection';
import { ChatHeader } from '@/app/components/ChatHeader';

export default function MessagePage() {
  const { data: session } = useSession();
  const { 
    state, 
    dispatch,
    getMessageThreads, 
    getThreadMessages, 
    sendMessage, 
    getCommunities, 
    getUserCommunities,
    joinCommunity, 
    createCommunity,
    getCommunityMessages,
    sendCommunityMessage
  } = useApi();
  
  const handleStartChatWithUser = async (user: { id: string; username: string }) => {
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
        // On mobile, show chat view when a thread is selected
        setMobileView('chat')
      } else {
        console.error('❌ Thread creation failed - no thread in response')
      }
    } catch (error) {
      console.error('❌ Failed to start chat with user:', error)
    }
  }

  const [activeTab, setActiveTab] = useState<'dms' | 'communities'>('dms');
  const [dmSection, setDmSection] = useState<'threads' | 'search'>('threads');
  const [communitySection, setCommunitySection] = useState<'my' | 'join' | 'create'>('my');
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
  
  // Mobile view state: 'sidebar' or 'chat'
  const [mobileView, setMobileView] = useState<'sidebar' | 'chat'>('sidebar');

  // New state for activity and suggestions
  const [recentActivity, setRecentActivity] = useState([]);
  const [followerSuggestions, setFollowerSuggestions] = useState([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const { socket, isConnected } = useSocket(selectedThread, selectedCommunity);

  const currentThread = state.messageThreads?.find(t => t.id === selectedThread);
  const currentCommunity = state.communities?.find(c => c.id === selectedCommunity);
  const currentMessages = activeTab === 'dms' 
    ? state.threadMessages[selectedThread || ''] || []
    : (state.communityMessages[selectedCommunity || ''] || []).map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id ?? msg.senderId ?? '',
        content: msg.content,
        created_at: msg.created_at ?? msg.createdAt ?? '',
        sender_username: msg.sender_username ?? msg.senderUsername,
        sender_avatar: msg.sender_avatar ?? msg.senderAvatar,
      }));

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    // Mock recent activity data
    setRecentActivity([
      {
        id: 1,
        type: 'message',
        user: { username: 'john_doe', avatar: '/api/placeholder/32/32' },
        content: 'Sent you a message',
        timestamp: '2 min ago',
        community: null
      },
      {
        id: 2,
        type: 'community_join',
        user: { username: 'alice_crypto', avatar: '/api/placeholder/32/32' },
        content: 'Joined Trading Signals',
        timestamp: '5 min ago',
        community: 'Trading Signals'
      },
      {
        id: 3,
        type: 'community_message',
        user: { username: 'bob_trader', avatar: '/api/placeholder/32/32' },
        content: 'Posted in DeFi Discussion',
        timestamp: '10 min ago',
        community: 'DeFi Discussion'
      }
    ]);

    // Mock follower suggestions
    setFollowerSuggestions([
      {
        id: 1,
        username: 'sarah_defi',
        name: 'Sarah Johnson',
        avatar: '/api/placeholder/40/40',
        mutualFollowers: 5,
        bio: 'DeFi enthusiast & trader'
      },
      {
        id: 2,
        username: 'mike_crypto',
        name: 'Mike Chen',
        avatar: '/api/placeholder/40/40',
        mutualFollowers: 12,
        bio: 'Blockchain developer'
      },
      {
        id: 3,
        username: 'emma_nft',
        name: 'Emma Rodriguez',
        avatar: '/api/placeholder/40/40',
        mutualFollowers: 8,
        bio: 'NFT collector & artist'
      },
      {
        id: 4,
        username: 'alex_web3',
        name: 'Alex Thompson',
        avatar: '/api/placeholder/40/40',
        mutualFollowers: 3,
        bio: 'Web3 consultant'
      }
    ]);
  }, []);

  // Update selected user profile based on current thread or community
  useEffect(() => {
    if (currentThread && currentThread.participants) {
      const otherUser = currentThread.participants.find(p => p.id !== session?.dbUser?.id);
      if (otherUser) {
        setSelectedUserProfile({
          username: otherUser.username,
          name: otherUser.name || otherUser.username,
          avatar: otherUser.avatar || '/api/placeholder/80/80',
          bio: otherUser.bio || 'No bio available',
          status: 'online',
          lastSeen: otherUser.lastSeen || 'Recently',
          mutualFollowers: Math.floor(Math.random() * 20) + 1
        });
      }
    } else if (currentCommunity) {
      setSelectedUserProfile({
        username: currentCommunity.name,
        name: currentCommunity.name,
        avatar: currentCommunity.creator_avatar || '/api/placeholder/80/80',
        bio: currentCommunity.description || 'No description available',
        status: 'community',
        members: currentCommunity.member_count || 0,
        type: 'community'
      });
    } else {
      setSelectedUserProfile(null);
    }
  }, [currentThread, currentCommunity, session?.dbUser?.id]);

  // Debug logging for messages
  useEffect(() => {
    console.log('🔍 currentMessages debug:', {
      activeTab,
      selectedCommunity,
      selectedThread,
      communityMessagesKeys: Object.keys(state.communityMessages || {}),
      communityMessagesForSelected: state.communityMessages[selectedCommunity || ''],
      currentMessagesLength: currentMessages.length
    });
  }, [activeTab, selectedCommunity, selectedThread, state.communityMessages, currentMessages]);

  useEffect(() => {
    if (session?.dbUser?.id) {
      getCommunities();
      getMessageThreads(session.dbUser.id);
    }
  }, [session?.dbUser?.id, getCommunities, getMessageThreads]);

  const handleSendMessage = async (content: string) => {
    if (!session?.dbUser?.id) return;

    if (activeTab === 'dms' && selectedThread) {
      await handleSendDMMessage(content);
    } else if (activeTab === 'communities' && selectedCommunity) {
      await handleSendCommunityMessage(content);
    }
  };

  const handleSendDMMessage = async (content: string) => {
    if (!selectedThread || !socket) return;

    try {
      if (isConnected) {
        (socket as any).emit('send_dm_message', { 
          userId: session.dbUser.id, 
          content, 
          threadId: selectedThread 
        }, async (response: { success: boolean; message?: string }) => {
          if (!response.success) {
            await sendMessage(selectedThread, {
              senderId: session.dbUser.id,
              content
            });
          }
          await getThreadMessages(selectedThread);
        });
      } else {
        await sendMessage(selectedThread, {
          senderId: session.dbUser.id,
          content
        });
        await getThreadMessages(selectedThread);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const [newCommunityName, setNewCommunityName] = useState('')
  const [newCommunityDescription, setNewCommunityDescription] = useState('')

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

  const handleSendCommunityMessage = async (content: string) => {
    if (!selectedCommunity || !session?.dbUser?.id) return;

    console.log('🔍 Sending community message:', { content, communityId: selectedCommunity, userId: session.dbUser.id });

    try {
      if (isConnected && socket) {
        console.log('🔍 Using WebSocket for real-time message');
        (socket as any).emit('send_community_message', {
          userId: session.dbUser.id,
          content,
          communityId: selectedCommunity
        }, async (response: { success: boolean; message?: string }) => {
          console.log('🔍 WebSocket response:', response);
          if (!response.success) {
            console.log('🔍 Falling back to REST API');
            await sendCommunityMessage(selectedCommunity, {
              senderId: session.dbUser.id,
              content
            });
          }
          await fetchCommunityMessages();
        });
      } else {
        console.log('🔍 Using REST API for message');
        await sendCommunityMessage(selectedCommunity, {
          senderId: session.dbUser.id,
          content
        });
        await fetchCommunityMessages();
      }
      console.log('✅ Community message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send community message:', error);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!session?.dbUser?.id) return

    try {
      await joinCommunity(communityId, { userId: session.dbUser.id })
      getCommunities()
    } catch (error) {
      console.error('Failed to join community:', error)
    }
  }

  const [hasInitializedUsers, setHasInitializedUsers] = useState(false);

  const fetchCommunityMessages = async () => {
    if (!selectedCommunity) return;
    
    try {
      console.log('🔍 Fetching community messages for:', selectedCommunity);
      await getCommunityMessages(selectedCommunity);
      console.log('✅ Community messages fetched successfully');
    } catch (error) {
      console.error('❌ Failed to fetch community messages:', error);
    }
  };

  const handleSelectThread = async (threadId: string) => {
    setSelectedThread(threadId);
    await getThreadMessages(threadId);
    // On mobile, show chat view when a thread is selected
    setMobileView('chat');
  };

  const handleSelectCommunity = async (communityId: string) => {
    console.log('🔍 Selecting community:', communityId);
    setSelectedCommunity(communityId);
    if (communityId) {
      console.log('🔍 About to fetch community messages for:', communityId);
      await fetchCommunityMessages();
      // On mobile, show chat view when a community is selected
      setMobileView('chat');
    }
  };

  // Handle back button on mobile
  const handleBackToSidebar = () => {
    setMobileView('sidebar');
    // Optionally clear selections
    // setSelectedThread(null);
    // setSelectedCommunity(null);
  };

  useEffect(() => {
    console.log('🔍 selectedCommunity changed to:', selectedCommunity);
    if (selectedCommunity && activeTab === 'communities') {
      console.log('🔍 Auto-fetching messages for selected community:', selectedCommunity);
      fetchCommunityMessages();
    }
  }, [selectedCommunity, activeTab]);

  // Reset mobile view when no thread/community is selected
  useEffect(() => {
    if (!selectedThread && !selectedCommunity) {
      setMobileView('sidebar');
    }
  }, [selectedThread, selectedCommunity]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'community_join':
        return <UserPlus className="w-4 h-4 text-green-400" />;
      case 'community_message':
        return <Hash className="w-4 h-4 text-purple-400" />;
      default:
        return <Eye className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleFollowUser = (userId: number) => {
    // Implement follow functionality
    console.log('Following user:', userId);
  };

  return (
      <div className="md:static fixed inset-x-0 z-[9999]">
    <div className=" flex">
      {/* Mobile Layout */}
      <div className="md:hidden w-full flex">
        {/* Sidebar View */}
        <div className={`w-full bg-dark-800 rounded-xl backdrop-blur-sm flex flex-col transition-transform duration-300 ${
          mobileView === 'chat' ? '-translate-x-full absolute' : 'translate-x-0'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#6E54FF]">
                Messages
              </h2>
              <ConnectionStatus isConnected={isConnected} />
            </div>
            
            <TabNavigation 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              dmSection={dmSection}
              setDmSection={setDmSection}
              communitySection={communitySection}
              setCommunitySection={setCommunitySection}
              setShowCreateCommunityModal={setShowCreateCommunityModal}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'dms' ? (
              <DMSection 
                dmSection={dmSection}
                state={state}
                session={session}
                selectedThread={selectedThread}
                onSelectThread={handleSelectThread}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onStartChat={handleStartChatWithUser}
              />
            ) : (
              <CommunitySection 
                communitySection={communitySection}
                state={state}
                session={session}
                selectedCommunity={selectedCommunity}
                onSelectCommunity={handleSelectCommunity}
                onJoinCommunity={handleJoinCommunity}
              />
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className={`w-full bg-dark-800 rounded-xl backdrop-blur-sm flex flex-col transition-transform duration-300 ${
          mobileView === 'sidebar' ? 'translate-x-full absolute' : 'translate-x-0'
        }`}>
          {/* Back Button + Chat Header */}
          <div className="flex items-center p-4 border-b border-slate-700/50">
            <button
              onClick={handleBackToSidebar}
              className="mr-3 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div className="flex-1">
              <ChatHeader 
                activeTab={activeTab}
                currentThread={currentThread}
                currentCommunity={currentCommunity}
                session={session}
              />
            </div>
          </div>

          <MessageList 
            messages={currentMessages} 
            currentUserId={session?.dbUser?.id} 
          />

          <div className="p-4 absolute bottom-52 bg-dark-800 w-full">
            <MessageInput 
              onSend={handleSendMessage}
              disabled={!selectedThread && !selectedCommunity}
            />
          </div>
        </div>
      </div>
     

      {/* Desktop Layout */}
      <div  className="hidden md:flex w-full shadow-2xl overflow-hidden">
        {/* Sidebar */}
        <div  className="w-80 h-screen flex flex-col border-r border-gray-700/70 pr-2">
          {/* Header */}
          <div className="">
            {/* <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-white bg-clip-text text-transparent">
                Messages
              </h2>
              <ConnectionStatus isConnected={isConnected} />
            </div> */}
            
            <TabNavigation 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              dmSection={dmSection}
              setDmSection={setDmSection}
              communitySection={communitySection}
              setCommunitySection={setCommunitySection}
              setShowCreateCommunityModal={setShowCreateCommunityModal}
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide scrollbar-thumb-slate-600 scrollbar-track-transparent">
            {activeTab === 'dms' ? (
              <DMSection 
                dmSection={dmSection}
                state={state}
                session={session}
                selectedThread={selectedThread}
                onSelectThread={handleSelectThread}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onStartChat={handleStartChatWithUser}
              />
            ) : (
              <CommunitySection 
                communitySection={communitySection}
                state={state}
                session={session}
                selectedCommunity={selectedCommunity}
                onSelectCommunity={handleSelectCommunity}
                onJoinCommunity={handleJoinCommunity}
              />
            )}
          </div>
        </div>

        {/* Chat Area */}
   <div className="flex w-full">
         <div className="flex-1 max-h-screen flex flex-col">
          <ChatHeader 
            activeTab={activeTab}
            currentThread={currentThread}
            currentCommunity={currentCommunity}
            session={session}
          />

          <MessageList 
            messages={currentMessages} 
            currentUserId={session?.dbUser?.id} 
          />

          <div className="px-6 py-4">
            <MessageInput 
              onSend={handleSendMessage}
              disabled={!selectedThread && !selectedCommunity}
            />
          </div>
         
        </div>
          <div>
        <div
                   className="hidden 2xl:block w-96 border-l-2 h-screen border-gray-700/70 sticky top-0"
                   style={{ zIndex: 999 }}
                 >
                   <div className="p-6">
                     {/* Recent Activity */}
                     <div className="h-80 overflow-y-auto flex flex-col border-2 border-gray-700/70 rounded-2xl mb-4">
                       <div className="bg-dark-700 rounded-full px-3 py-1 mt-2 mx-2 self-start">
                         <span className="text-sm font-medium text-slate-300">Recent Activity</span>
                       </div>
                       
                       {selectedUserProfile && (
                         <div className="p-4 border-b border-gray-700/50">
                           <div className="flex items-center space-x-3 mb-3">
                             <img 
                               src={selectedUserProfile.avatar} 
                               alt={selectedUserProfile.name}
                               className="w-12 h-12 rounded-full object-cover"
                             />
                             <div className="flex-1">
                               <h4 className="font-semibold text-white text-sm">
                                 {selectedUserProfile.name}
                               </h4>
                               <p className="text-xs text-slate-400">
                                 @{selectedUserProfile.username}
                               </p>
                               {selectedUserProfile.type === 'community' ? (
                                 <p className="text-xs text-green-400">
                                   {selectedUserProfile.members} members
                                 </p>
                               ) : (
                                 <p className="text-xs text-green-400">
                                   {selectedUserProfile.status}
                                 </p>
                               )}
                             </div>
                           </div>
                           <p className="text-xs text-slate-300 mb-2">
                             {selectedUserProfile.bio}
                           </p>
                           {selectedUserProfile.mutualFollowers && (
                             <p className="text-xs text-blue-400">
                               {selectedUserProfile.mutualFollowers} mutual followers
                             </p>
                           )}
                         </div>
                       )}

                       <div className="flex-1 p-3">
                         {recentActivity.length > 0 ? (
                           recentActivity.map((activity) => (
                             <div key={activity.id} className="flex items-start space-x-3 mb-4 p-2 hover:bg-slate-800/30 rounded-lg transition-colors">
                               <div className="flex-shrink-0 mt-1">
                                 {getActivityIcon(activity.type)}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center space-x-2 mb-1">
                                   <img 
                                     src={activity.user.avatar} 
                                     alt={activity.user.username}
                                     className="w-5 h-5 rounded-full object-cover"
                                   />
                                   <span className="text-xs font-medium text-white">
                                     {activity.user.username}
                                   </span>
                                 </div>
                                 <p className="text-xs text-slate-300 mb-1">
                                   {activity.content}
                                 </p>
                                 <div className="flex items-center justify-between">
                                   <p className="text-xs text-slate-400">
                                     {activity.timestamp}
                                   </p>
                                   {activity.community && (
                                     <span className="text-xs text-purple-400">
                                       #{activity.community}
                                     </span>
                                   )}
                                 </div>
                               </div>
                             </div>
                           ))
                         ) : (
                           <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                             <Clock className="w-8 h-8 mb-2" />
                             <p className="text-sm">No recent activity</p>
                           </div>
                         )}
                       </div>
                     </div>
       
                     {/* Followers Suggestions */}
                     <div className="h-80 overflow-y-auto flex flex-col border-2 border-gray-700/70 rounded-2xl">
                       <div className="bg-dark-700 rounded-full px-3 py-1 mt-2 mx-2 self-start">
                         <span className="text-sm font-medium text-slate-300">Followers Suggestions</span>
                       </div>
                       
                       <div className="flex-1 p-3">
                         {followerSuggestions.length > 0 ? (
                           followerSuggestions.map((user) => (
                             <div key={user.id} className="flex items-start space-x-3 mb-4 p-2 hover:bg-slate-800/30 rounded-lg transition-colors">
                               <img 
                                 src={user.avatar} 
                                 alt={user.username}
                                 className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                               />
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center justify-between mb-1">
                                   <div>
                                     <h4 className="text-sm font-medium text-white truncate">
                                       {user.name}
                                     </h4>
                                     <p className="text-xs text-slate-400">
                                       @{user.username}
                                     </p>
                                   </div>
                                   <button
                                     onClick={() => handleFollowUser(user.id)}
                                     className="flex items-center space-x-1 bg-[#6E54FF] hover:bg-[#5940CC] text-white text-xs px-2 py-1 rounded-full transition-colors"
                                   >
                                     <UserPlus className="w-3 h-3" />
                                     <span>Follow</span>
                                   </button>
                                 </div>
                                 <p className="text-xs text-slate-300 mb-1 line-clamp-2">
                                   {user.bio}
                                 </p>
                                 <p className="text-xs text-blue-400">
                                   {user.mutualFollowers} mutual followers
                                 </p>
                               </div>
                             </div>
                           ))
                         ) : (
                           <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                             <Users className="w-8 h-8 mb-2" />
                             <p className="text-sm">No suggestions available</p>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
      </div>
   </div>
      </div>
      

      <CreateCommunityModal 
        show={showCreateCommunityModal}
        onClose={() => setShowCreateCommunityModal(false)}
        creatorId={session?.dbUser?.id || ''}
        onCreated={handleCreateCommunity}
      />
    </div>
    </div>
  );
}