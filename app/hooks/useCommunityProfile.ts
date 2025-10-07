import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CommunityApiService, CommunityProfile } from '@/app/lib/communityApi';

export const useCommunityProfile = (communityId?: string) => {
  const { data: session } = useSession();
  const [communityProfile, setCommunityProfile] = useState<CommunityProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch community profile
  const fetchCommunityProfile = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const profile = await CommunityApiService.getCommunityProfile(id);
      setCommunityProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch community profile');
      console.error('Error fetching community profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update community profile
  const updateCommunityProfile = async (
    id: string, 
    data: {
      name?: string;
      description?: string;
      profile_picture_url?: string;
      cover_image_url?: string;
    }
  ) => {
    if (!session?.dbUser?.id) {
      throw new Error('User not authenticated');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedProfile = await CommunityApiService.updateCommunityProfile(id, {
        ...data,
        user_id: session.dbUser.id
      });
      setCommunityProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update community profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when communityId changes
  useEffect(() => {
    if (communityId) {
      fetchCommunityProfile(communityId);
    }
  }, [communityId]);

  return {
    communityProfile,
    loading,
    error,
    fetchCommunityProfile,
    updateCommunityProfile,
  };
};
