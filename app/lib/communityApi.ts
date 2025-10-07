const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io';

export interface CommunityProfile {
  id: string;
  name: string;
  description?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
  creator?: {
    id: string;
    username: string;
    name?: string;
    avatar_url?: string;
  };
  member_count: number;
  is_member: boolean;
}

export interface UpdateCommunityProfileRequest {
  user_id: string;
  name?: string;
  description?: string;
  profile_picture_url?: string;
  cover_image_url?: string;
}

export class CommunityApiService {
  // Update community profile
  static async updateCommunityProfile(
    communityId: string, 
    data: UpdateCommunityProfileRequest
  ): Promise<CommunityProfile> {
    const response = await fetch(`${API_BASE_URL}/api/snaps/communities/${communityId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update community profile: ${response.statusText}`);
    }

    const result = await response.json();
    return result.community;
  }

  // Get community with profile details
  static async getCommunityProfile(communityId: string): Promise<CommunityProfile> {
    const response = await fetch(`${API_BASE_URL}/api/snaps/communities/${communityId}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch community profile: ${response.statusText}`);
    }

    const result = await response.json();
    return result.community;
  }
}
