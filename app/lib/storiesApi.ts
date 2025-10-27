const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps';

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  expires_at: string;
  created_at: string;
  updated_at?: string;
  user: {
    id: string;
    username: string;
    name?: string;
    avatar_url?: string;
  };
  view_count: number;
  has_viewed: boolean;
}

export interface CreateStoryRequest {
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  expires_at?: string;
}

export interface StoryViewRequest {
  story_id: string;
  user_id: string;
}

export class StoriesApiService {
  // Create a new story
  static async createStory(data: CreateStoryRequest): Promise<Story> {
    const response = await fetch(`${API_BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create story: ${response.statusText}`);
    }

    const result = await response.json();
    return result.story;
  }

  // Get stories from users that the current user is following
  static async getFollowingStories(userId: string, limit: number = 50): Promise<Story[]> {
    const response = await fetch(`${API_BASE_URL}/stories/following?user_id=${userId}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch following stories: ${response.statusText}`);
    }

    const result = await response.json();
    return result.stories;
  }

  // Get stories for a specific user
  static async getUserStories(userId: string, currentUserId: string): Promise<Story[]> {
    const response = await fetch(`${API_BASE_URL}/stories/user/${userId}?current_user_id=${currentUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user stories: ${response.statusText}`);
    }

    const result = await response.json();
    return result.stories;
  }

  // Record a story view
  static async recordStoryView(storyId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/stories/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ story_id: storyId, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to record story view: ${response.statusText}`);
    }
  }

  // Get story viewers (only for story owner)
  static async getStoryViewers(storyId: string, userId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/stories/${storyId}/viewers?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch story viewers: ${response.statusText}`);
    }

    const result = await response.json();
    return result.viewers;
  }

  // Delete a story
  static async deleteStory(storyId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/stories/${storyId}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete story: ${response.statusText}`);
    }
  }

  // Cleanup expired stories (admin)
  static async cleanupExpiredStories(): Promise<{ deletedCount: number }> {
    const response = await fetch(`${API_BASE_URL}/stories/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cleanup expired stories: ${response.statusText}`);
    }

    const result = await response.json();
    return { deletedCount: result.deletedCount };
  }
}
