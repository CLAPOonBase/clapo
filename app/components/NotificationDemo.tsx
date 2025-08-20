/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
"use client";

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useSession } from 'next-auth/react';
import { Bell, Heart, MessageCircle, UserPlus, AtSign, RefreshCw, Play, Square } from 'lucide-react';

const NotificationDemo = () => {
  const { data: session } = useSession();
  const {
    getNotificationStats
  } = useNotifications();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');

  const handleCreateLikeNotification = () => {
    if (!session?.dbUser?.id) return;
    
    setCurrentAction('Creating like notification...');
    setIsPlaying(true);
    
    try {
      console.log('Creating like notification:', {
        userId: session.dbUser.id,
        fromUserId: 'demo-user-1',
        fromUsername: 'demo_liker',
        fromAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        postId: 'demo-post-1',
        postContent: 'This is a demo post to show how enhanced notifications work. Users can now see exactly who liked their posts and get context about the interaction.',
        postMedia: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop'
      });
      
      setTimeout(() => {
        setCurrentAction('Like notification created successfully!');
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      setCurrentAction('Failed to create notification');
      setIsPlaying(false);
    }
  };

  const handleCreateCommentNotification = () => {
    if (!session?.dbUser?.id) return;
    
    setCurrentAction('Creating comment notification...');
    setIsPlaying(true);
    
    try {
      console.log('Creating comment notification:', {
        userId: session.dbUser.id,
        fromUserId: 'demo-user-2',
        fromUsername: 'demo_commenter',
        fromAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        postId: 'demo-post-2',
        postContent: 'Another demo post showing the enhanced notification system capabilities.',
        commentContent: 'This is a great feature! I love how detailed the notifications are now. Much better user experience!'
      });
      
      setTimeout(() => {
        setCurrentAction('Comment notification created successfully!');
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      setCurrentAction('Failed to create notification');
      setIsPlaying(false);
    }
  };

  const handleCreateFollowNotification = () => {
    if (!session?.dbUser?.id) return;
    
    setCurrentAction('Creating follow notification...');
    setIsPlaying(true);
    
    try {
      console.log('Creating follow notification:', {
        userId: session.dbUser.id,
        fromUserId: 'demo-user-3',
        fromUsername: 'demo_follower',
        fromAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      });
      
      setTimeout(() => {
        setCurrentAction('Follow notification created successfully!');
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      setCurrentAction('Failed to create notification');
      setIsPlaying(false);
    }
  };

  const handleCreateMentionNotification = () => {
    if (!session?.dbUser?.id) return;
    
    setCurrentAction('Creating mention notification...');
    setIsPlaying(true);
    
    try {
      console.log('Creating mention notification:', {
        userId: session.dbUser.id,
        fromUserId: 'demo-user-4',
        fromUsername: 'demo_mentioner',
        fromAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        postId: 'demo-post-3',
        postContent: 'Discussion about notification systems and user experience improvements.',
        mentionContent: 'Hey @current_user, what do you think about this new notification approach? Your input would be valuable!'
      });
      
      setTimeout(() => {
        setCurrentAction('Mention notification created successfully!');
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      setCurrentAction('Failed to create notification');
      setIsPlaying(false);
    }
  };

  const handleCreateRetweetNotification = () => {
    if (!session?.dbUser?.id) return;
    
    setCurrentAction('Creating retweet notification...');
    setIsPlaying(true);
    
    try {
      console.log('Creating retweet notification:', {
        userId: session.dbUser.id,
        fromUserId: 'demo-user-5',
        fromUsername: 'demo_retweeter',
        fromAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        postId: 'demo-post-4',
        postContent: 'Sharing thoughts on modern web development and user interface design principles.'
      });
      
      setTimeout(() => {
        setCurrentAction('Retweet notification created successfully!');
        setIsPlaying(false);
      }, 2000);
    } catch (error) {
      setCurrentAction('Failed to create notification');
      setIsPlaying(false);
    }
  };
    
    const stats = getNotificationStats();

    return (
      <div className="p-6 bg-dark-800 rounded-xl border border-slate-700/50">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">
            Enhanced Notification System Demo
          </h3>
          <p className="text-slate-400 text-sm">
            Test the enhanced notification system by creating different types of notifications.
            Check the browser console to see the notification data being generated.
          </p>
        </div>

        {/* Current Action Status */}
        {currentAction && (
          <div className={`mb-6 p-4 rounded-lg border ${
            isPlaying 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
              : 'bg-green-500/10 border-green-500/30 text-green-300'
          }`}>
            <div className="flex items-center space-x-2">
              {isPlaying ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{currentAction}</span>
            </div>
          </div>
        )}

        {/* Notification Creation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleCreateLikeNotification}
            disabled={isPlaying}
            className="flex items-center space-x-3 p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-white font-medium">Create Like Notification</span>
          </button>

          <button
            onClick={handleCreateCommentNotification}
            disabled={isPlaying}
            className="flex items-center space-x-3 p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Create Comment Notification</span>
          </button>

          <button
            onClick={handleCreateFollowNotification}
            disabled={isPlaying}
            className="flex items-center space-x-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Create Follow Notification</span>
          </button>

          <button
            onClick={handleCreateMentionNotification}
            disabled={isPlaying}
            className="flex items-center space-x-3 p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AtSign className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Create Mention Notification</span>
          </button>

          <button
            onClick={handleCreateRetweetNotification}
            disabled={isPlaying}
            className="flex items-center space-x-3 p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Create Retweet Notification</span>
          </button>
        </div>

        {/* Notification Statistics */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-3">Notification Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.totalCount}</div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{stats.unreadCount}</div>
              <div className="text-xs text-slate-400">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Object.keys(stats.typeBreakdown).length}
              </div>
              <div className="text-xs text-slate-400">Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {stats.recentNotifications.length}
              </div>
              <div className="text-xs text-slate-400">Recent</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-slate-700/20 rounded-lg border border-slate-600/30">
          <h4 className="text-sm font-semibold text-white mb-2">How to Test:</h4>
          <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
            <li>Click any of the notification creation buttons above</li>
            <li>Check the browser console to see the notification data</li>
            <li>Navigate to the Notifications page to see the enhanced UI</li>
            <li>Toggle to demo mode to see sample enhanced notifications</li>
          </ol>
        </div>
      </div>
    );
};

export default NotificationDemo;




