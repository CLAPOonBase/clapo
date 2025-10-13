import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StoriesApiService, Story } from '@/app/lib/storiesApi';

export const useStories = () => {
  const { data: session } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stories from users that the current user is following
  const fetchFollowingStories = async (limit: number = 50) => {
    if (!session?.dbUser?.id) {
      console.log('No session or user ID available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const storiesData = await StoriesApiService.getFollowingStories(session.dbUser.id, limit);
      setStories(storiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
      console.error('Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stories for a specific user
  const fetchUserStories = async (userId: string) => {
    if (!session?.dbUser?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const storiesData = await StoriesApiService.getUserStories(userId, session.dbUser.id);
      setStories(storiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stories');
      console.error('Error fetching user stories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new story
  const createStory = async (mediaUrl: string, mediaType: 'image' | 'video', caption?: string) => {
    if (!session?.dbUser?.id) {
      throw new Error('User not authenticated');
    }
    
    console.log('Creating story with:', {
      user_id: session.dbUser.id,
      media_url: mediaUrl,
      media_type: mediaType,
      caption
    });
    
    try {
      const newStory = await StoriesApiService.createStory({
        user_id: session.dbUser.id,
        media_url: mediaUrl,
        media_type: mediaType,
        caption,
      });
      
      console.log('Story created successfully:', newStory);
      
      // Add the new story to the beginning of the list
      setStories(prev => [newStory, ...prev]);
      
      return newStory;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create story';
      console.error('Error creating story:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Record a story view
  const recordStoryView = async (storyId: string) => {
    if (!session?.dbUser?.id) return;
    
    try {
      await StoriesApiService.recordStoryView(storyId, session.dbUser.id);
      
      // Update the story to mark it as viewed
      setStories(prev => 
        prev.map(story => 
          story.id === storyId 
            ? { ...story, has_viewed: true, view_count: story.view_count + 1 }
            : story
        )
      );
    } catch (err) {
      console.error('Error recording story view:', err);
    }
  };

  // Delete a story
  const deleteStory = async (storyId: string) => {
    if (!session?.dbUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      await StoriesApiService.deleteStory(storyId);
      
      // Remove the story from the list
      setStories(prev => prev.filter(story => story.id !== storyId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete story';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get story viewers (only for story owner)
  const getStoryViewers = async (storyId: string) => {
    if (!session?.dbUser?.id) {
      throw new Error('User not authenticated');
    }
    
    try {
      return await StoriesApiService.getStoryViewers(storyId, session.dbUser.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch story viewers';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Group stories by user for display
  const groupedStories = stories.reduce((groups: Record<string, Story[]>, story) => {
    const userId = story.user_id;
    if (!groups[userId]) {
      groups[userId] = [];
    }
    groups[userId].push(story);
    return groups;
  }, {});

  return {
    stories,
    groupedStories,
    loading,
    error,
    fetchFollowingStories,
    fetchUserStories,
    createStory,
    recordStoryView,
    deleteStory,
    getStoryViewers,
  };
};
