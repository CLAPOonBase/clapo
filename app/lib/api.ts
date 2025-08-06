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
  BookmarkRequest,
  BookmarkResponse,
  FollowRequest,
  FollowResponse,
  UnfollowResponse,
  SendMessageRequest,
  SendMessageResponse,
  CreateCommunityRequest,
  JoinCommunityRequest,
  NotificationsResponse,
  ActivityResponse,
  ApiError,
  CreateMessageThreadRequest,
  MessageThreadsResponse,
  ThreadMessagesResponse,
  AddParticipantRequest,
  AddParticipantResponse,
} from '../types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://server.blazeswap.io/api/snaps'

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
        
        const errorMessage = errorData.message || `HTTP error! status: ${response.status}`
        console.error('API Error:', errorData)
        throw new Error(errorMessage)
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
    const response = await this.request<ProfileResponse>(`/users/${userId}/profile/posts`);
    return response;
  }

  async updateUserProfile(userId: string, data: UpdateProfileRequest): Promise<ProfileResponse> {
    return this.request<ProfileResponse>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating user password:', error);
      throw error;
    }
  }

  async createMessageThread(data: CreateMessageThreadRequest): Promise<unknown> {
    try {
      const requestBody: { userId1: string; userId2: string; name?: string } = {
        userId1: data.creatorId,
        userId2: data.targetUserId
      }
      
      if (data.name) {
        requestBody.name = data.name
      }
      
      const response = await this.request('/messages/direct-thread', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      })
      
      return response
    } catch (error) {
      console.error('Error creating message thread:', error);
      throw error;
    }
  }

  async getMessageThreads(userId: string, limit = 20, offset = 0): Promise<MessageThreadsResponse> {
    try {
      const response = await this.request(`/message-threads?userId=${userId}&limit=${limit}&offset=${offset}`)
      return response as MessageThreadsResponse
    } catch (error) {
      console.error('Error fetching message threads:', error);
      throw error;
    }
  }

  async getThreadMessages(threadId: string, limit = 50, offset = 0): Promise<ThreadMessagesResponse> {
    try {
      const response = await this.request(`/message-threads/${threadId}/messages?limit=${limit}&offset=${offset}`)
      return response as ThreadMessagesResponse
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      throw error;
    }
  }

  async sendMessage(threadId: string, data: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await this.request(`/messages/thread/${threadId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response as SendMessageResponse
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async addParticipantToThread(threadId: string, data: AddParticipantRequest): Promise<AddParticipantResponse> {
    try {
      const response = await this.request(`/message-threads/${threadId}/participants`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response as AddParticipantResponse
    } catch (error) {
      console.error('Error adding participant to thread:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string): Promise<unknown> {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async createCommunity(data: CreateCommunityRequest): Promise<unknown> {
    try {
      const response = await this.request('/communities', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      console.error('Error creating community:', error)
      throw error
    }
  }

  async getCommunities(searchQuery?: string, limit = 20, offset = 0): Promise<unknown> {
    try {
      const queryParams = new URLSearchParams()
      if (searchQuery) queryParams.append('searchQuery', searchQuery)
      queryParams.append('limit', limit.toString())
      queryParams.append('offset', offset.toString())
      
      const response = await this.request(`/communities?${queryParams}`)
      return response
    } catch (error) {
      console.error('Error fetching communities:', error)
      throw error
    }
  }

  async getUserCommunities(userId: string): Promise<unknown> {
    try {
      const response = await this.request(`/users/${userId}/communities`)
      return response
    } catch (error) {
      console.error('Error fetching user communities:', error)
      throw error
    }
  }

  async joinCommunity(communityId: string, data: JoinCommunityRequest): Promise<unknown> {
    try {
      const response = await this.request(`/communities/${communityId}/join`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      console.error('Error joining community:', error)
      throw error
    }
  }

  async getCommunityMembers(communityId: string, limit = 50, offset = 0): Promise<unknown> {
    try {
      const response = await this.request(`/communities/${communityId}/members?limit=${limit}&offset=${offset}`)
      return response
    } catch (error) {
      console.error('Error fetching community members:', error)
      throw error
    }
  }

  async sendCommunityMessage(communityId: string, data: SendMessageRequest): Promise<unknown> {
    try {
      const response = await this.request(`/communities/${communityId}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return response
    } catch (error) {
      console.error('Error sending community message:', error)
      throw error
    }
  }

  async getCommunityMessages(communityId: string, limit = 50, offset = 0): Promise<unknown> {
    try {
      const response = await this.request(`/communities/${communityId}/messages?limit=${limit}&offset=${offset}`)
      return response
    } catch (error) {
      console.error('Error fetching community messages:', error)
      throw error
    }
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

  async getPosts(userId: string, limit: number = 10, offset: number = 0): Promise<FeedResponse> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request<FeedResponse>(`/feed/foryou?${params}`)
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
    console.log('🔍 Like API Request:', { postId, data })
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

  async bookmarkPost(postId: string, data: BookmarkRequest): Promise<BookmarkResponse> {
    console.log('🔍 Bookmark API Request:', { postId, data })
    return this.request<BookmarkResponse>(`/posts/${postId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async unbookmarkPost(postId: string, data: BookmarkRequest): Promise<unknown> {
    console.log('🔍 Unbookmark API Request:', { postId, data })
    try {
      return this.request(`/posts/${postId}/bookmark`, {
        method: 'DELETE',
        body: JSON.stringify(data),
      })
    } catch (error) {
      console.error('❌ Unbookmark API failed, trying alternative approach:', error)
      // Fallback: try POST with unbookmark flag
      return this.request(`/posts/${postId}/bookmark`, {
        method: 'POST',
        body: JSON.stringify({ ...data, action: 'unbookmark' }),
      })
    }
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

  async getNotifications(userId: string, limit: number = 10, offset: number = 0): Promise<NotificationsResponse> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request<NotificationsResponse>(`/notifications?${params}`)
  }

  async getActivities(userId: string, limit: number = 10, offset: number = 0): Promise<ActivityResponse> {
    const params = new URLSearchParams({
      userId,
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request<ActivityResponse>(`/activity/recent?${params}`)
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

export const apiService = new ApiService()

export { ApiService }