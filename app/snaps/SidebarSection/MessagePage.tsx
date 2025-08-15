"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApi } from '../../Context/ApiProvider';
import { MessageCircle, Users, Plus, Search, ChevronDown, Hash, Dot } from 'lucide-react';
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
    createCommunity
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

  useEffect(() => {
    if (session?.dbUser?.id) {
      getCommunities();
      getUserCommunities(session.dbUser.id);
      getMessageThreads(session.dbUser.id);
    }
  }, [session?.dbUser?.id, getCommunities, getUserCommunities, getMessageThreads]);

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
    if (!selectedCommunity) return;

    try {
      if (isConnected && socket) {
        (socket as any).emit('send_community_message', {
          userId: session.dbUser.id,
          content,
          communityId: selectedCommunity
        }, async (response: { success: boolean; message?: string }) => {
          if (!response.success) {
            await sendCommunityMessage(content);
          }
          await fetchCommunityMessages();
        });
      } else {
        await sendCommunityMessage(content);
        await fetchCommunityMessages();
      }
    } catch (error) {
      console.error('Failed to send community message:', error);
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


  const sendCommunityMessage = async (content: string) => {
    // Implementation depends on your apiService
    // This is a placeholder for the actual implementation
  };

  const fetchCommunityMessages = async () => {
    // Implementation depends on your apiService
    // This is a placeholder for the actual implementation
  };

  const handleSelectThread = async (threadId: string) => {
    setSelectedThread(threadId);
    await getThreadMessages(threadId);
  };

  const handleSelectCommunity = async (communityId: string) => {
    setSelectedCommunity(communityId);
    // Fetch community messages implementation
  };

  return (
    <div className="rounded-xl shadow-2xl h-[700px] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-dark-800 mr-4 rounded-md backdrop-blur-sm flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
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
      <div className='flex w-full mr-6 rounded-md'>
        <div className="flex-1 flex flex-col bg-dark-800 rounded-md backdrop-blur-sm">
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

          <div className="px-6 py-2">
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
  );
}