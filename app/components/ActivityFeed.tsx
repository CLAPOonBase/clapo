'use client';

import React, { useEffect } from 'react';
import { useActivityFeed } from '@/app/hooks/useActivityFeed';
import { ActivityItem } from '@/app/lib/tokenApi';
import { RefreshCw, TrendingUp, Gift, DollarSign, Clock } from 'lucide-react';

interface ActivityFeedProps {
  limit?: number;
  showRefresh?: boolean;
  className?: string;
}

export function ActivityFeed({ limit = 20, showRefresh = true, className = '' }: ActivityFeedProps) {
  const { activities, loading, error, fetchRecentActivity, refreshActivity } = useActivityFeed();

  useEffect(() => {
    fetchRecentActivity(limit);
  }, [limit]);

  const formatActivityMessage = (activity: ActivityItem): string => {
    const { username, action, token_name, creator_name, amount, total_cost, is_freebie, type } = activity;
    
    if (is_freebie) {
      if (type === 'post_token') {
        return `${username} claimed a freebie of a snap by ${creator_name}`;
      } else {
        return `${username} claimed a freebie of creator share of ${creator_name}`;
      }
    }
    
    const costText = total_cost > 0 ? ` for $${total_cost.toFixed(2)}` : '';
    
    switch (action) {
      case 'bought':
        if (type === 'post_token') {
          return `${username} bought a snap of ${creator_name}${costText}`;
        } else {
          return `${username} bought creator share of ${creator_name}${costText}`;
        }
      case 'sold':
        if (type === 'post_token') {
          return `${username} sold a snap of ${creator_name}${costText}`;
        } else {
          return `${username} sold creator share of ${creator_name}${costText}`;
        }
      case 'claimed_freebie':
        if (type === 'post_token') {
          return `${username} claimed a freebie of a snap by ${creator_name}`;
        } else {
          return `${username} claimed a freebie of creator share of ${creator_name}`;
        }
      default:
        return `${username} ${action} ${token_name}${costText}`;
    }
  };

  const getActivityIcon = (activity: ActivityItem) => {
    if (activity.is_freebie) {
      return <Gift className="w-4 h-4 text-green-500" />;
    }
    
    switch (activity.action) {
      case 'bought':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'sold':
        return <DollarSign className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const activityDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className={`bg-dark-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Recent Activity</h3>
          {showRefresh && (
            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-600 rounded animate-pulse" />
              </div>
              <div className="w-12 h-3 bg-gray-600 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-dark-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Recent Activity</h3>
          {showRefresh && (
            <button
              onClick={() => fetchRecentActivity(limit)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchRecentActivity(limit)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-dark-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Recent Activity</h3>
        {showRefresh && (
          <button
            onClick={refreshActivity}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-700 transition-colors"
            >
              <div className="flex-shrink-0">
                {getActivityIcon(activity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {formatActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-400">
                  {activity.type === 'post_token' ? 'Post Token' : 'Creator Token'} • {formatTimeAgo(activity.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
