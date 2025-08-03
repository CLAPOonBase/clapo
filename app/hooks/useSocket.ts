import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('🔌 Attempting to connect to WebSocket...');
    socketRef.current = io('https://server.blazeswap.io', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      console.log('Socket ID:', socketRef.current?.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket:', reason);
    });

    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}; 