import { useEffect, useState } from 'react';
import { useSocket } from './useSocket';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  threadId?: string;
  communityId?: string;
  sender_username?: string;
  sender_avatar?: string;
}

export const useMessageListener = (currentThreadId?: string, currentCommunityId?: string) => {
  const socket = useSocket();
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
  const [communityMessages, setCommunityMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_dm_message', (data) => {
      console.log('💬 New DM received in listener:', data);
      const message = data.message || data;
      const threadId = message.threadId || message.thread_id || message.threadId;
      
      if (threadId === currentThreadId) {
        console.log('✅ Adding DM message to socket state');
        setDmMessages(prev => [...prev, message]);
      }
    });

    socket.on('new_community_message', (data) => {
      console.log('📨 New community message received in listener:', data);
      const message = data.message || data;
      const communityId = message.communityId || message.community_id || message.communityId;
      
      if (communityId === currentCommunityId) {
        console.log('✅ Adding community message to socket state');
        setCommunityMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket.off('new_dm_message');
      socket.off('new_community_message');
    };
  }, [socket, currentThreadId, currentCommunityId]);

  return { dmMessages, communityMessages, setDmMessages, setCommunityMessages };
}; 