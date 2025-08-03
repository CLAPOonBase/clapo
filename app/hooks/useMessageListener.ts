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
      console.log('💬 New DM received:', data.message);
      if (data.message.threadId === currentThreadId) {
        setDmMessages(prev => [...prev, data.message]);
      }
    });

    socket.on('new_community_message', (data) => {
      console.log('📨 New community message received:', data.message);
      if (data.message.communityId === currentCommunityId) {
        setCommunityMessages(prev => [...prev, data.message]);
      }
    });

    return () => {
      socket.off('new_dm_message');
      socket.off('new_community_message');
    };
  }, [socket, currentThreadId, currentCommunityId]);

  return { dmMessages, communityMessages, setDmMessages, setCommunityMessages };
}; 