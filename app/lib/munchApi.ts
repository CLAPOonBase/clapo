// Production API endpoint for Munch
const API_BASE_URL = 'https://server.blazeswap.io/api/snaps';

export interface MunchVideo {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string;
  caption?: string;
  duration: number; // in seconds
  created_at: string;
  updated_at?: string;
  // Flattened user data from backend
  username: string;
  name?: string | null;
  avatar_url?: string;
  // Counts
  like_count: number;
  comment_count: number;
  view_count: number;
  share_count: number;
  has_liked: boolean;
  has_viewed: boolean;
  // Helper property for frontend compatibility
  user: {
    id: string;
    username: string;
    name?: string;
    avatar_url?: string;
  };
}

export interface CreateMunchVideoRequest {
  userId: string; // camelCase for backend
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  duration: number;
}

export interface MunchComment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // Flattened user data from backend
  username: string;
  name?: string | null;
  avatar_url?: string;
  // Helper property for frontend compatibility
  user: {
    id: string;
    username: string;
    name?: string;
    avatar_url?: string;
  };
}

export class MunchApiService {
  // Helper function to transform backend response to include nested user object
  private static transformVideo(video: any): MunchVideo {
    return {
      ...video,
      user: {
        id: video.user_id,
        username: video.username,
        name: video.name,
        avatar_url: video.avatar_url,
      },
    };
  }

  // Helper function to transform comment response
  private static transformComment(comment: any): MunchComment {
    return {
      ...comment,
      user: {
        id: comment.user_id,
        username: comment.username,
        name: comment.name,
        avatar_url: comment.avatar_url,
      },
    };
  }

  // Get feed of munch videos (short videos <= 60 seconds)
  static async getMunchFeed(userId: string, limit: number = 20, offset: number = 0): Promise<MunchVideo[]> {
    const url = `${API_BASE_URL}/munch?userId=${userId}&limit=${limit}&offset=${offset}`;
    console.log('📹 MunchAPI: GET', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📹 MunchAPI: Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ MunchAPI: Error response:', errorText);
      throw new Error(`Failed to fetch munch feed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📹 MunchAPI: Response data:', result);

    const videos = result.videos || [];
    console.log('📹 MunchAPI: Found videos:', videos.length);

    const transformedVideos = videos.map((video: any) => this.transformVideo(video));
    console.log('📹 MunchAPI: Transformed videos:', transformedVideos);

    return transformedVideos;
  }

  // Get videos from users the current user is following
  static async getFollowingMunchFeed(userId: string, limit: number = 20, offset: number = 0): Promise<MunchVideo[]> {
    const response = await fetch(
      `${API_BASE_URL}/munch/following?userId=${userId}&limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch following munch feed: ${response.statusText}`);
    }

    const result = await response.json();
    const videos = result.videos || [];
    return videos.map((video: any) => this.transformVideo(video));
  }

  // Create a new munch video
  static async createMunchVideo(data: CreateMunchVideoRequest): Promise<MunchVideo> {
    const response = await fetch(`${API_BASE_URL}/munch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create munch video: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformVideo(result.video);
  }

  // Like a munch video
  static async likeMunchVideo(videoId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/munch/${videoId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to like munch video: ${response.statusText}`);
    }
  }

  // Unlike a munch video
  static async unlikeMunchVideo(videoId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/munch/${videoId}/unlike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to unlike munch video: ${response.statusText}`);
    }
  }

  // Record a video view
  static async recordMunchView(videoId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/munch/${videoId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to record munch view: ${response.statusText}`);
    }
  }

  // Get comments for a video
  static async getMunchComments(videoId: string, userId: string): Promise<MunchComment[]> {
    const response = await fetch(
      `${API_BASE_URL}/munch/${videoId}/comments?user_id=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    const result = await response.json();
    const comments = result.comments || [];
    return comments.map((comment: any) => this.transformComment(comment));
  }

  // Add a comment to a video
  static async addMunchComment(videoId: string, userId: string, content: string): Promise<MunchComment> {
    const response = await fetch(`${API_BASE_URL}/munch/${videoId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }

    const result = await response.json();
    return this.transformComment(result.comment);
  }

  // Delete a munch video
  static async deleteMunchVideo(videoId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/munch/${videoId}?user_id=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete munch video: ${response.statusText}`);
    }
  }

  // Share a munch video
  static async shareMunchVideo(videoId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/munch/${videoId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to share munch video: ${response.statusText}`);
    }
  }

  // Get user's own munch videos
  static async getUserMunchVideos(userId: string, limit: number = 50, offset: number = 0): Promise<MunchVideo[]> {
    const url = `${API_BASE_URL}/munch/user/${userId}?limit=${limit}&offset=${offset}`;
    console.log('📹 MunchAPI: GET user videos', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📹 MunchAPI: User videos response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ MunchAPI: Error response:', errorText);
      throw new Error(`Failed to fetch user munch videos: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📹 MunchAPI: User videos response data:', result);

    const videos = result.videos || [];
    console.log('📹 MunchAPI: Found user videos:', videos.length);

    const transformedVideos = videos.map((video: any) => this.transformVideo(video));
    console.log('📹 MunchAPI: Transformed user videos:', transformedVideos);

    return transformedVideos;
  }
}
