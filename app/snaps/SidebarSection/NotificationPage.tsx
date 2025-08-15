"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApi } from '../../Context/ApiProvider';
import { Notification } from '../../types/api';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Eye, EyeOff } from 'lucide-react';

const NotificationPage = () => {
  const { data: session } = useSession();
  const { state, fetchNotifications } = useApi();
  const [loading, setLoading] = useState(false);
  const [showRead, setShowRead] = useState(true);

  const notifications = state.notifications || [];

  useEffect(() => {
    if (session?.dbUser?.id) {
      loadNotifications();
    }
  }, [session?.dbUser?.id]);

  const loadNotifications = async () => {
    if (!session?.dbUser?.id) return;
    
    console.log('🔍 Loading notifications for user:', session.dbUser.id);
    setLoading(true);
    try {
      await fetchNotifications(session.dbUser.id);
      console.log('✅ Notifications loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'border-l-red-500 bg-red-500/10';
      case 'comment':
        return 'border-l-blue-500 bg-blue-500/10';
      case 'follow':
        return 'border-l-green-500 bg-green-500/10';
      case 'mention':
        return 'border-l-purple-500 bg-purple-500/10';
      default:
        return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = showRead 
    ? notifications 
    : notifications.filter(notification => !notification.is_read);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
        <div className="text-gray-400">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Notifications
          </h2>
          <button
            onClick={() => setShowRead(!showRead)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 transition-colors"
          >
            {showRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">{showRead ? 'Hide Read' : 'Show All'}</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-slate-400">
          <span>Total: {notifications.length}</span>
          <span>Unread: {notifications.filter(n => !n.is_read).length}</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Bell className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-sm text-center">
              {showRead 
                ? "You're all caught up! No notifications right now." 
                : "No unread notifications at the moment."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:bg-slate-700/30 ${
                getNotificationColor(notification.type)
              } ${notification.is_read ? 'opacity-70' : 'opacity-100'}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">
                      {notification.content}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="inline-block px-2 py-1 text-xs bg-slate-600/50 text-slate-300 rounded-full">
                      {notification.type}
                    </span>
                    {!notification.is_read && (
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={loadNotifications}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
        >
          Refresh Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationPage;