import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { useApi } from '../Context/ApiProvider';

export const useSocket = (
  selectedThread: string | null,
  selectedCommunity: string | null
) => {
  const { data: session } = useSession();
  const { dispatch } = useApi();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!session?.dbUser?.id) return;

    const newSocket = io('http://server.blazeswap.io', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection handlers
    newSocket.on('connect', () => {
      console.log('✅ Connected to socket server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setIsConnected(false);
    });

    // Message handlers
    newSocket.on('new_dm_message', async (data) => {
      const message = data.message || data;
      if (data.threadId === selectedThread || message.thread_id === selectedThread) {
        try {
          const response = await fetch(
            `http://server.blazeswap.io/api/snaps/message-threads/${selectedThread}/messages?limit=50&offset=0`
          );
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            dispatch({
              type: 'SET_THREAD_MESSAGES',
              payload: { threadId: selectedThread, messages: data.messages }
            });
          }
        } catch (error) {
          console.error('❌ Failed to refresh messages:', error);
        }
      }
    });

    newSocket.on('new_community_message', async (data) => {
      const message = data.message || data;
      if (data.communityId === selectedCommunity || message.community_id === selectedCommunity) {
        try {
          const response = await fetch(
            `http://server.blazeswap.io/api/snaps/communities/${selectedCommunity}/messages?limit=50&offset=0`
          );
          const data = await response.json();
          if (data.messages && Array.isArray(data.messages)) {
            dispatch({
              type: 'SET_COMMUNITY_MESSAGES',
              payload: { communityId: selectedCommunity, messages: data.messages }
            });
          }
        } catch (error) {
          console.error('❌ Failed to refresh community messages:', error);
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session?.dbUser?.id, selectedThread, selectedCommunity, dispatch]);

  return { socket, isConnected };
};