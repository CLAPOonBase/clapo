import { useState, useEffect } from 'react';
import { tokenApiService } from '@/app/lib/tokenApi';
import { ActivityItem } from '@/app/lib/tokenApi';

export const useActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentActivity = async (limit: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await tokenApiService.getRecentActivity(limit);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userAddress: string, limit: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await tokenApiService.getUserActivity(userAddress, limit);
      setActivities(data);
    } catch (err) {
      console.error('Error fetching user activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user activity');
    } finally {
      setLoading(false);
    }
  };

  const refreshActivity = () => {
    if (activities.length > 0) {
      // Refresh with current limit
      fetchRecentActivity(activities.length);
    }
  };

  return {
    activities,
    loading,
    error,
    fetchRecentActivity,
    fetchUserActivity,
    refreshActivity,
  };
};
