/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '../../hooks/useNotifications';
import { EnhancedNotification } from '../../types/api';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Eye, EyeOff, Check, ExternalLink, Wifi, WifiOff, Bookmark, Users, AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PostPopupModal } from '../../components/PostPopupModal';

const NotificationPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { 
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAsRead,
    getNotificationStats
  } = useNotifications(session?.dbUser?.id);

  const [showRead, setShowRead] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handleUserClick = (userId: string) => {
    // Store current page state and scroll position
    const currentState = {
      pathname: '/snaps',
      searchParams: 'page=notifications',
      scrollY: window.scrollY,
      timestamp: Date.now()
    }
    

    
    // Store in sessionStorage for persistence across navigation
    sessionStorage.setItem('profileNavigationState', JSON.stringify(currentState))
    
    router.push(`/snaps/profile/${userId}`)
  };

  const handleViewContent = (notification: EnhancedNotification) => {
    if (notification.content) {
      // Create a post object from the notification content
      const postData = {
        id: notification.ref_id || notification.id,
        content: notification.content.content,
        media_url: notification.content.media_url,
        created_at: notification.created_at,
        view_count: notification.content.view_count || 0,
        like_count: notification.content.like_count || 0,
        comment_count: notification.content.comment_count || 0,
        retweet_count: notification.content.retweet_count || 0,
        user: notification.from_user,
        is_liked: false, // These would come from API calls
        is_retweeted: false,
        is_bookmarked: false
      }
      
      setSelectedPost(postData)
      setIsPostModalOpen(true)
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
      case 'retweet':
        return <RefreshCw className="w-5 h-5 text-green-500" />;
      case 'bookmark':
        return <Bookmark className="w-5 h-5 text-yellow-500" />;
      case 'dm':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'community_message':
        return <Users className="w-5 h-5 text-purple-500" />;
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
      case 'retweet':
        return 'border-l-green-500 bg-green-500/10';
      case 'bookmark':
        return 'border-l-yellow-500 bg-yellow-500/10';
      case 'dm':
        return 'border-l-blue-500 bg-blue-500/10';
      case 'community_message':
        return 'border-l-purple-500 bg-purple-500/10';
      default:
        return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  const getNotificationMessage = (notification: EnhancedNotification) => {
    const actorName = notification.from_user?.username || 'Someone';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} liked your post`;
      case 'comment':
        return `${actorName} commented on your post`;
      case 'follow':
        return `${actorName} started following you`;
      case 'mention':
        return `${actorName} mentioned you in a comment`;
      case 'retweet':
        return `${actorName} retweeted your post`;
      case 'bookmark':
        return `${actorName} bookmarked your post`;
      case 'dm':
        return `${actorName} sent you a message`;
      case 'community_message':
        return `${actorName} sent a message in community`;
      default:
        return notification.context?.action || `${actorName} interacted with your content`;
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

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading && notifications.length === 0) {
    return (
      <div className="sticky top-20 bg-dark-700/70 p-4 rounded-2xl flex flex-col items-center justify-center text-white border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E54FF] mb-4"></div>
        <div className="text-gray-400">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="sticky top-20 flex flex-col rounded-2xl bg-dark-700/70 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
      {/* Header */}
      <div className="p-6 border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#6E54FF]">
            Notifications
          </h2>
          <div className="flex items-center space-x-3">
            {/* WebSocket Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              isConnected 
                ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                : 'bg-red-600/20 text-red-400 border border-red-500/30'
            }`}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm">{isConnected ? 'Live' : 'Offline'}</span>
            </div>

            <button
              onClick={() => setShowRead(!showRead)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#2A2A2A]/70 transition-colors"
            >
              {showRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">{showRead ? 'Hide Read' : 'Show All'}</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Total: {notifications.length}</span>
          <span>Unread: {unreadCount}</span>
          {isConnected && (
            <span className="text-green-400 font-medium">
              Real-time updates active
            </span>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell className="w-16 h-16 mb-2 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
            <p className="text-sm text-center">
              {showRead 
                ? "You're all caught up! No notifications right now." 
                : "No unread notifications at the moment."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification: EnhancedNotification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-2xl transition-all duration-200 hover:bg-[#2A2A2A]/30 ${
                getNotificationColor(notification.type)
              } ${notification.is_read ? 'opacity-70' : 'opacity-100'}`}
            >
              <div className="flex items-start space-x-3">
                {/* Actor Avatar */}
                <div className="flex-shrink-0">
                  {notification.from_user?.avatar_url ? (
                    <button
                      onClick={() => notification.from_user?.id && handleUserClick(notification.from_user.id)}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <Image
                        src={notification.from_user.avatar_url}
                        alt={notification.from_user.username || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                        unoptimized
                      />
                    </button>
                  ) : (
                    <button
                      onClick={() => notification.from_user?.id && handleUserClick(notification.from_user.id)}
                      className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center hover:bg-[#3A3A3A] transition-colors cursor-pointer"
                    >
                      <span className="text-white text-sm font-medium">
                        {notification.from_user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </button>
                  )}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">
                        {getNotificationMessage(notification)}
                      </span>
                      {!notification.is_read && (
                        <span className="inline-block w-2 h-2 bg-[#6E54FF] rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimeAgo(notification.created_at)}
                    </span>
                  </div>

                  {/* Content Preview */}
                  {notification.content && (
                    <div className="mb-3 p-3 bg-[#2A2A2A]/30 rounded-lg border border-[#2A2A2A]/30">
                      <div className="flex items-start space-x-2">
                        {notification.content.media_url && (
                          <div className="flex-shrink-0">
                            <Image
                              src={notification.content.media_url}
                              alt="Post media"
                              width={60}
                              height={60}
                              className="w-15 h-15 rounded-md object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 line-clamp-2">
                            {notification.content.content}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                            <span>View {notification.content.view_count}</span>
                            <span>Like {notification.content.like_count}</span>
                            <span>Comment {notification.content.comment_count}</span>
                            <span>Retweet {notification.content.retweet_count}</span>
                          </div>
                                                     {notification.ref_id && (
                             <button 
                               onClick={() => handleViewContent(notification)}
                               className="mt-2 flex items-center space-x-1 text-xs text-[#6E54FF] hover:text-[#836EF9] transition-colors"
                             >
                               <ExternalLink className="w-3 h-3" />
                               <span>View content</span>
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Context Information */}
                  {notification.context && (
                    <div className="mb-3 p-3 bg-[#6E54FF]/10 rounded-lg border border-[#6E54FF]/20">
                      <p className="text-sm text-[#6E54FF]">
                        {notification.context.preview}
                      </p>
                      {notification.context.engagement && (
                        <p className="text-xs text-[#6E54FF]/80 mt-1">
                          {notification.context.engagement}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="inline-block px-2 py-1 text-xs bg-[#2A2A2A] text-gray-300 rounded-full">
                        {notification.type}
                      </span>
                    </div>
                    
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-[#6E54FF] hover:bg-[#836EF9] text-white rounded-md transition-colors shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark read</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Popup Modal */}
      <PostPopupModal
        post={selectedPost}
        isOpen={isPostModalOpen}
        onClose={() => {
          setIsPostModalOpen(false)
          setSelectedPost(null)
        }}
      />
    </div>
  );
};

export default NotificationPage;