import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  UpdateProfileRequest,
  SearchUsersResponse,
  CreatePostRequest,
  CreatePostResponse,
  FeedResponse,
  ViewPostRequest,
  ViewPostResponse,
  LikePostRequest,
  LikeResponse,
  UnlikeResponse,
  CommentRequest,
  CommentResponse,
  RetweetResponse,
  BookmarkResponse,
  FollowRequest,
  FollowResponse,
  UnfollowResponse,
  CreateThreadRequest,
  CreateThreadResponse,
  SendMessageRequest,
  SendMessageResponse,
  CreateCommunityRequest,
  CreateCommunityResponse,
  JoinCommunityRequest,
  JoinCommunityResponse,
  NotificationsResponse,
  ActivityResponse,
  ApiError
} from '../types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server.blazeswap.io/api/snaps'

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorText = await response.text()
        
        let errorData: ApiError
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
          }
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      return responseData
    } catch (error) {
      console.error('Request failed:', error)
      throw error
    }
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await this.request<SignupResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      console.error('Signup failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        requestData: data
      })
      throw error
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserProfile(userId: string): Promise<ProfileResponse> {
    const response = await this.request<ProfileResponse>(`/users/${userId}/profile`);
    return response;
  }

  async updateUserProfile(userId: string, data: UpdateProfileRequest): Promise<ProfileResponse> {
    return this.request<ProfileResponse>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateUserPassword(userId: string, password: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    })
  }

  async searchUsers(query: string, limit: number = 10, offset: number = 0): Promise<SearchUsersResponse> {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request<SearchUsersResponse>(`/users/search?${params}`)
  }

  async createPost(data: CreatePostRequest): Promise<CreatePostResponse> {
    return this.request<CreatePostResponse>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getPersonalizedFeed(userId: string, limit: number = 10, offset: number = 0): Promise<FeedResponse> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request<FeedResponse>(`/feed/foryou?${params}`)
  }

  async viewPost(postId: string, data: ViewPostRequest): Promise<ViewPostResponse> {
    return this.request<ViewPostResponse>(`/posts/${postId}/view`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async likePost(postId: string, data: LikePostRequest): Promise<LikeResponse> {
    return this.request<LikeResponse>(`/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async unlikePost(postId: string, data: LikePostRequest): Promise<UnlikeResponse> {
    return this.request<UnlikeResponse>(`/posts/${postId}/like`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    })
  }

  async commentOnPost(postId: string, data: CommentRequest): Promise<CommentResponse> {
    return this.request<CommentResponse>(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async retweetPost(postId: string, data: LikePostRequest): Promise<RetweetResponse> {
    return this.request<RetweetResponse>(`/posts/${postId}/retweet`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async bookmarkPost(postId: string, data: LikePostRequest): Promise<BookmarkResponse> {
    return this.request<BookmarkResponse>(`/posts/${postId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async followUser(userId: string, data: FollowRequest): Promise<FollowResponse> {
    return this.request<FollowResponse>(`/users/${userId}/follow`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async unfollowUser(userId: string, data: FollowRequest): Promise<UnfollowResponse> {
    return this.request<UnfollowResponse>(`/users/${userId}/follow`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    })
  }

  async createMessageThread(data: CreateThreadRequest): Promise<CreateThreadResponse> {
    return this.request<CreateThreadResponse>('/messages/thread', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async sendMessage(threadId: string, data: SendMessageRequest): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>(`/messages/thread/${threadId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createCommunity(data: CreateCommunityRequest): Promise<CreateCommunityResponse> {
    return this.request<CreateCommunityResponse>('/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async joinCommunity(communityId: string, data: JoinCommunityRequest): Promise<JoinCommunityResponse> {
    return this.request<JoinCommunityResponse>(`/communities/${communityId}/join`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getNotifications(userId: string, limit: number = 10, offset: number = 0): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request<NotificationsResponse>(`/notifications?${params}`)
  }

  async getRecentActivity(userId: string, limit: number = 10, offset: number = 0): Promise<ActivityResponse> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request<ActivityResponse>(`/activity/recent?${params}`)
  }
}

// Create and export a singleton instance
export const apiService = new ApiService()

// Export the class for testing or custom instances
export { ApiService } 