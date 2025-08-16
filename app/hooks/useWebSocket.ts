import { useEffect, useRef, useCallback, useState } from 'react';

interface WebSocketConfig {
  url?: string;
  transports?: string[];
  autoConnect?: boolean;
}

interface NotificationEvent {
  id: string;
  type: string;
  user_id: string;
  from_user_id: string;
  ref_id: string;
  is_read: boolean;
  created_at: string;
  from_user: {
    id: string;
    username: string;
    email: string;
    bio: string;
    avatar_url: string;
    created_at: string;
  };
  content: {
    id: string;
    content: string;
    media_url: string | null;
    created_at: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    retweet_count: number;
    author_username: string;
    author_avatar: string;
  };
  context: {
    action: string;
    preview: string;
    engagement: string;
  };
}

interface DMMessageEvent {
  message: any;
  threadId: string;
  senderId: string;
}

interface CommunityMessageEvent {
  message: any;
  communityId: string;
  senderId: string;
}

export const useWebSocket = (
  userId: string | undefined,
  config: WebSocketConfig = {}
) => {
  const [isConnected, setIsConnected] = useState(false);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    url = 'http://localhost:8080',
    transports = ['websocket'],
    autoConnect = true
  } = config;

  // Mock WebSocket connection
  const connect = useCallback(() => {
    if (!userId) return;

    console.log('🔌 Mock WebSocket connecting to:', url);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      console.log('✅ Mock WebSocket connected');
      
      // Simulate periodic connection status updates
      mockIntervalRef.current = setInterval(() => {
        // Randomly simulate connection issues
        if (Math.random() < 0.1) {
          setIsConnected(false);
          setTimeout(() => setIsConnected(true), 2000);
        }
      }, 30000);
    }, 1000);

    return { mock: true };
  }, [userId, url]);

  // Disconnect mock WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Mock WebSocket disconnecting');
    setIsConnected(false);
    
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  }, []);

  // Join user room (mock)
  const joinUserRoom = useCallback((userId: string) => {
    console.log('🏠 Mock: Joined user room for:', userId);
  }, []);

  // Leave user room (mock)
  const leaveUserRoom = useCallback((userId: string) => {
    console.log('🚪 Mock: Left user room for:', userId);
  }, []);

  // Mock event listeners that can be used for testing
  const onUserNotification = useCallback((callback: (notification: NotificationEvent) => void) => {
    console.log('🔔 Mock: Listening for user notifications');
    // In a real implementation, this would set up the event listener
  }, []);

  const onSystemNotification = useCallback((callback: (notification: NotificationEvent) => void) => {
    console.log('🔔 Mock: Listening for system notifications');
    // In a real implementation, this would set up the event listener
  }, []);

  const onNewDMMessage = useCallback((callback: (data: DMMessageEvent) => void) => {
    console.log('💬 Mock: Listening for DM messages');
    // In a real implementation, this would set up the event listener
  }, []);

  const onNewCommunityMessage = useCallback((callback: (data: CommunityMessageEvent) => void) => {
    console.log('🏘️ Mock: Listening for community messages');
    // In a real implementation, this would set up the event listener
  }, []);

  // Remove specific event listeners (mock)
  const removeListener = useCallback((event: string, callback?: Function) => {
    console.log('🗑️ Mock: Removed listener for:', event);
  }, []);

  // Remove all listeners (mock)
  const removeAllListeners = useCallback(() => {
    console.log('🗑️ Mock: Removed all listeners');
  }, []);

  // Emit custom events (mock)
  const emit = useCallback((event: string, data: any) => {
    console.log('📤 Mock: Emitted event:', event, 'with data:', data);
  }, []);

  // Get socket instance (mock)
  const getSocket = useCallback(() => ({ mock: true, connected: isConnected }), [isConnected]);

  // Check connection status
  const isConnectedCallback = useCallback(() => {
    return isConnected;
  }, [isConnected]);

  // Auto-connect when userId changes
  useEffect(() => {
    if (userId && autoConnect) {
      const socket = connect();
      
      return () => {
        disconnect();
      };
    }
  }, [userId, autoConnect, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    // Connection management
    connect,
    disconnect,
    isConnected: isConnectedCallback,
    getSocket,
    
    // Room management
    joinUserRoom,
    leaveUserRoom,
    
    // Event listeners
    onUserNotification,
    onSystemNotification,
    onNewDMMessage,
    onNewCommunityMessage,
    
    // Event management
    removeListener,
    removeAllListeners,
    emit
  };
};


