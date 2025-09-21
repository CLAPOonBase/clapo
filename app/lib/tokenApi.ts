// Token API service for integrating with the backend token APIs
const TOKEN_API_BASE_URL = process.env.NEXT_PUBLIC_TOKEN_API_URL || 'http://localhost:8080/api'

export interface PostToken {
  uuid: string
  content: string
  image_url?: string
  creator_address: string
  freebie_count: number
  quadratic_divisor: string
  total_supply: string
  circulating_supply: string
  current_price: string
  highest_price: string
  reward_pool_balance: string
  creator_fee_balance: string
  platform_fee_balance: string
  liability: string
  created_at: string
}

export interface CreatorToken {
  uuid: string
  name: string
  image_url?: string
  description?: string
  creator_address: string
  freebie_count: number
  quadratic_divisor: string
  current_price: string
  highest_price: string
  reward_pool_balance: string
  creator_fee_balance: string
  platform_fee_balance: string
  liability: string
  created_at: string
}

export interface AccessToken {
  id: number
  token: string
  is_used: boolean
  used_by_address?: string
  used_at?: string
  creator_token_uuid: string
  created_at: string
}

export interface PostTokenTransaction {
  user_address: string
  post_token_uuid: string
  transaction_type: 'BUY' | 'SELL' | 'CLAIM'
  amount: number
  price_per_token: number
  total_cost: number
  tx_hash: string
  block_number: number
  gas_used: number
  gas_price: number
  is_freebie: boolean
  fees_paid: number
}

export interface CreatorTokenTransaction {
  user_address: string
  creator_token_uuid: string
  transaction_type: 'BUY' | 'SELL' | 'CLAIM'
  amount: number
  price_per_token: number
  total_cost: number
  tx_hash: string
  block_number: number
  gas_used: number
  gas_price: number
  is_freebie: boolean
  fees_paid: number
}

export interface CreatePostTokenRequest {
  content: string
  image_url?: string
  creator_address: string
  freebie_count?: number
  quadratic_divisor?: number
  total_supply?: number
}

export interface CreateCreatorTokenRequest {
  name: string
  image_url?: string
  description?: string
  creator_address: string
  freebie_count?: number
  quadratic_divisor?: number
}

export interface UseAccessTokenRequest {
  token: string
  user_address: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  totalCount?: number
}

class TokenApiService {
  private baseUrl: string

  constructor(baseUrl: string = TOKEN_API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log('🔍 Token API Request:', {
      baseUrl: this.baseUrl,
      endpoint,
      fullUrl: url,
      method: options.method || 'GET',
      body: options.body
    })
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (typeof value === 'string') {
          headers[key] = value
        }
      })
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    }

    try {
      console.log('🚀 Making fetch request to:', url)
      const response = await fetch(url, config)
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseData = await response.json()
      console.log('✅ Response data:', responseData)
      return responseData
    } catch (error) {
      console.error('❌ Request failed:', error)
      throw error
    }
  }

  // Post Token APIs
  async getAllPostTokens(limit: number = 50, offset: number = 0): Promise<ApiResponse<PostToken[]>> {
    return this.request<ApiResponse<PostToken[]>>(`/post-tokens?limit=${limit}&offset=${offset}`)
  }

  async getPostToken(uuid: string): Promise<ApiResponse<PostToken>> {
    return this.request<ApiResponse<PostToken>>(`/post-tokens/${uuid}`)
  }

  async createPostToken(data: CreatePostTokenRequest): Promise<ApiResponse<PostToken>> {
    return this.request<ApiResponse<PostToken>>('/post-tokens/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async recordPostTokenTransaction(data: PostTokenTransaction): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/post-tokens/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserPostTokenHoldings(userAddress: string, postTokenUuid?: string): Promise<ApiResponse<any[]>> {
    const endpoint = postTokenUuid 
      ? `/post-tokens/holdings/${userAddress}?postTokenUuid=${postTokenUuid}`
      : `/post-tokens/holdings/${userAddress}`
    return this.request<ApiResponse<any[]>>(endpoint)
  }

  async getPostTokenTransactions(postTokenUuid: string, userAddress?: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    if (userAddress) params.append('userAddress', userAddress)
    
    return this.request<ApiResponse<any[]>>(`/post-tokens/${postTokenUuid}/transactions?${params}`)
  }

  // Creator Token APIs
  async getAllCreatorTokens(limit: number = 50, offset: number = 0): Promise<ApiResponse<CreatorToken[]>> {
    return this.request<ApiResponse<CreatorToken[]>>(`/creator-tokens?limit=${limit}&offset=${offset}`)
  }

  async getCreatorToken(uuid: string): Promise<ApiResponse<CreatorToken>> {
    return this.request<ApiResponse<CreatorToken>>(`/creator-tokens/${uuid}`)
  }

  async createCreatorToken(data: CreateCreatorTokenRequest): Promise<ApiResponse<CreatorToken>> {
    return this.request<ApiResponse<CreatorToken>>('/creator-tokens/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async recordCreatorTokenTransaction(data: CreatorTokenTransaction): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/creator-tokens/transaction', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getUserCreatorTokenHoldings(userAddress: string, creatorTokenUuid?: string): Promise<ApiResponse<any[]>> {
    const endpoint = creatorTokenUuid 
      ? `/creator-tokens/holdings/${userAddress}?creatorTokenUuid=${creatorTokenUuid}`
      : `/creator-tokens/holdings/${userAddress}`
    return this.request<ApiResponse<any[]>>(endpoint)
  }

  async getCreatorTokenTransactions(creatorTokenUuid: string, userAddress?: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    if (userAddress) params.append('userAddress', userAddress)
    
    return this.request<ApiResponse<any[]>>(`/creator-tokens/${creatorTokenUuid}/transactions?${params}`)
  }

  // Access Token APIs
  async getAccessTokensForCreator(creatorTokenUuid: string, isUsed?: boolean, limit: number = 50, offset: number = 0): Promise<ApiResponse<AccessToken[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    if (isUsed !== undefined) params.append('isUsed', isUsed.toString())
    
    return this.request<ApiResponse<AccessToken[]>>(`/access-tokens/creator/${creatorTokenUuid}?${params}`)
  }

  async getUserUsedAccessTokens(userAddress: string, creatorTokenUuid?: string, limit: number = 50, offset: number = 0): Promise<ApiResponse<AccessToken[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    if (creatorTokenUuid) params.append('creatorTokenUuid', creatorTokenUuid)
    
    return this.request<ApiResponse<AccessToken[]>>(`/access-tokens/user/${userAddress}?${params}`)
  }

  async getAccessTokenStats(creatorTokenUuid: string): Promise<ApiResponse<{ total: number; used: number; available: number }>> {
    return this.request<ApiResponse<{ total: number; used: number; available: number }>>(`/access-tokens/stats/${creatorTokenUuid}`)
  }

  async useAccessToken(data: UseAccessTokenRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/access-tokens/use', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async validateAccessToken(token: string): Promise<ApiResponse<AccessToken>> {
    return this.request<ApiResponse<AccessToken>>('/access-tokens/validate', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  }

  async revokeAccessToken(token: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/access-tokens/revoke', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    })
  }
}

export const tokenApiService = new TokenApiService()
export { TokenApiService }
