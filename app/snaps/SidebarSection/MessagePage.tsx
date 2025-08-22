"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApi } from '../../Context/ApiProvider';
import { MessageCircle, Users, Plus, Search, ChevronDown, Hash, Dot, ArrowLeft } from 'lucide-react';
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

  return (
      <div className="md:static fixed inset-x-0 z-[9999]">
    <div className="md:h-[700px] h-screen flex">
      {/* Mobile Layout */}
      <div className="md:hidden w-full flex">
        {/* Sidebar View */}
        <div className={`w-full bg-dark-800 rounded-xl backdrop-blur-sm flex flex-col transition-transform duration-300 ${
          mobileView === 'chat' ? '-translate-x-full absolute' : 'translate-x-0'
        }`}>
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-[#6E54FF] bg-clip-text text-transparent">
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

          <div className="p-4">
            <MessageInput 
              onSend={handleSendMessage}
              disabled={!selectedThread && !selectedCommunity}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div  className="hidden md:flex w-full rounded-xl shadow-2xl overflow-hidden">
        {/* Sidebar */}
        <div  className="w-80 flex flex-col border-r border-secondary/50">
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-[#6e54ff] bg-clip-text text-transparent">
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
        <div className="flex-1 flex flex-col">
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
      </div>

      <CreateCommunityModal 
        show={showCreateCommunityModal}
        onClose={() => setShowCreateCommunityModal(false)}
        onCreate={handleCreateCommunity}
      />
    </div>
    </div>
  );
}