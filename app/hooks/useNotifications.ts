import { useCallback, useEffect, useState, useRef } from 'react';
import { useApi } from '../Context/ApiProvider';
import { useWebSocket } from './useWebSocket';
import { EnhancedNotification } from '../types/api';
import { showNotificationToast } from '../components/ToastContainer';

export const useNotifications = (userId?: string) => {
  const { state, fetchEnhancedNotifications, markNotificationAsRead } = useApi();
  const [notifications, setNotifications] = useState<EnhancedNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const loadingRef = useRef(false);

  // WebSocket connection for real-time notifications
  const {
    isConnected,
    onUserNotification,
    onSystemNotification,
    onNewDMMessage,
    onNewCommunityMessage
  } = useWebSocket(userId);

  // Load enhanced notifications from API
  const loadNotifications = useCallback(async () => {
    if (!userId || loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      console.log('🔄 Loading enhanced notifications for user:', userId);
      await fetchEnhancedNotifications(userId);
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load enhanced notifications:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [userId, fetchEnhancedNotifications]);

  // Update notifications when state changes (only once after loading)
  useEffect(() => {
    if (state.enhancedNotifications.length > 0 && !loading && hasLoaded) {
      console.log('📱 Updating notifications from state:', state.enhancedNotifications.length);
      setNotifications(state.enhancedNotifications);
      const unread = state.enhancedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [state.enhancedNotifications, loading, hasLoaded]);

  // Handle real-time notifications
  useEffect(() => {
    if (!userId) return;

    // Listen for user-specific notifications
    const handleUserNotification = (notification: EnhancedNotification) => {
      console.log('🔔 Real-time notification received:', notification);
      
      // Show toast notification
      showNotificationToast({
        type: notification.type,
        fromUser: notification.from_user?.username,
        content: notification.context?.preview || notification.content?.content,
        avatar: notification.from_user?.avatar_url
      });
      
      // Update local state
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Listen for system notifications
    const handleSystemNotification = (notification: EnhancedNotification) => {
      console.log('🔔 System notification received:', notification);
      
      // Show toast for system notifications
      showNotificationToast({
        type: 'system',
        fromUser: 'System',
        content: notification.context?.preview || 'System notification'
      });
    };

    // Listen for new DM messages
    const handleNewDM = (data: any) => {
      console.log('💬 New DM message:', data);
      
      // Show toast for DM notifications
      showNotificationToast({
        type: 'dm',
        fromUser: data.senderUsername || data.senderId || 'Someone',
        content: data.message || 'New direct message',
        avatar: data.senderAvatar
      });
      
      // Create a DM notification object if needed
      const dmNotification: EnhancedNotification = {
        id: `dm-${Date.now()}`,
        type: 'dm',
        user_id: userId,
        from_user_id: data.senderId || 'unknown',
        ref_id: data.threadId || 'unknown',
        is_read: false,
        created_at: new Date().toISOString(),
        from_user: {
          id: data.senderId || 'unknown',
          username: data.senderUsername || 'Unknown User',
          email: '',
          bio: '',
          avatar_url: data.senderAvatar || '',
          created_at: new Date().toISOString()
        },
        content: {
          id: `content-${Date.now()}`,
          content: data.message || 'New direct message',
          media_url: null,
          created_at: new Date().toISOString(),
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          retweet_count: 0,
          author_username: data.senderUsername || 'Unknown User',
          author_avatar: data.senderAvatar || ''
        },
        context: {
          action: 'sent you a message',
          preview: data.message || 'New direct message',
          engagement: 'Direct message'
        }
      };
      
      // Add to notifications
      setNotifications(prev => [dmNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Listen for new community messages
    const handleNewCommunityMessage = (data: any) => {
      console.log('🏘️ New community message:', data);
      
      // Show toast for community message notifications
      showNotificationToast({
        type: 'community_message',
        fromUser: data.senderUsername || data.senderId || 'Someone',
        content: data.message || 'New community message',
        avatar: data.senderAvatar
      });
      
      // Create a community message notification object if needed
      const communityNotification: EnhancedNotification = {
        id: `community-${Date.now()}`,
        type: 'community_message',
        user_id: userId,
        ref_id: data.communityId || 'unknown',
        is_read: false,
        created_at: new Date().toISOString(),
        from_user: {
          id: data.senderId || 'unknown',
          username: data.senderUsername || 'Unknown User',
          email: '',
          bio: '',
          avatar_url: data.senderAvatar || '',
          created_at: new Date().toISOString()
        },
        content: {
          id: `content-${Date.now()}`,
          content: data.message || 'New community message',
          media_url: null,
          created_at: new Date().toISOString(),
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          retweet_count: 0,
          author_username: data.senderUsername || 'Unknown User',
          author_avatar: data.senderAvatar || ''
        },
        context: {
          action: 'sent a message in community',
          preview: data.message || 'New community message',
          engagement: `Community: ${data.communityName || 'Unknown Community'}`
        }
      };
      
      // Add to notifications
      setNotifications(prev => [communityNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Set up event listeners
    onUserNotification(handleUserNotification);
    onSystemNotification(handleSystemNotification);
    onNewDMMessage(handleNewDM);
    onNewCommunityMessage(handleNewCommunityMessage);

    // Cleanup function
    return () => {
      // Event listeners are automatically cleaned up by the WebSocket hook
    };
  }, [userId, onUserNotification, onSystemNotification, onNewDMMessage, onNewCommunityMessage]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [markNotificationAsRead]);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const totalCount = notifications.length;
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    const typeBreakdown = notifications.reduce((acc, notification) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCount,
      unreadCount,
      typeBreakdown,
      recentNotifications: notifications.slice(0, 5),
      isConnected
    };
  }, [notifications, isConnected]);

  // Initial load - only run once when userId changes
  useEffect(() => {
    if (userId && !hasLoaded) {
      console.log('🚀 Initial load of notifications for user:', userId);
      loadNotifications();
    }
  }, [userId, hasLoaded, loadNotifications]);

  return {
    // Data
    notifications,
    unreadCount,
    loading,
    isConnected,
    
    // Actions
    markAsRead: handleMarkAsRead,
    
    // Statistics
    getNotificationStats,
    
    // WebSocket status
    isWebSocketConnected: isConnected
  };
};


