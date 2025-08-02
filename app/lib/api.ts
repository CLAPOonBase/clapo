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
  ApiError,
  CreateMessageThreadRequest,
  MessageThreadsResponse,
  ThreadMessagesResponse,
  AddParticipantRequest,
  AddParticipantResponse,
  CommunitiesResponse,
  CommunityMembersResponse,
  CommunityMessagesResponse
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

  async updateUserPassword(userId: string, newPassword: string): Promise<any> {
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

  async createMessageThread(data: CreateMessageThreadRequest): Promise<any> {
    try {
      const requestBody: any = {
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

  async markMessageAsRead(messageId: string): Promise<any> {
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

  async createCommunity(data: CreateCommunityRequest): Promise<any> {
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

  async getCommunities(searchQuery?: string, limit = 20, offset = 0): Promise<any> {
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

  async getUserCommunities(userId: string): Promise<any> {
    try {
      const response = await this.request(`/users/${userId}/communities`)
      return response
    } catch (error) {
      console.error('Error fetching user communities:', error)
      throw error
    }
  }

  async joinCommunity(communityId: string, data: JoinCommunityRequest): Promise<any> {
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

  async getCommunityMembers(communityId: string, limit = 50, offset = 0): Promise<any> {
    try {
      const response = await this.request(`