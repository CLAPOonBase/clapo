import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:8080');

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}; 