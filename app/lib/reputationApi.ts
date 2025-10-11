import {
  ReputationResponse,
  ReputationHistoryResponse,
  GiveRepRequest,
  GiveRepResponse,
  LeaderboardResponse,
} from '../types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_REPUTATION_API_URL || 'https://server.blazeswap.io/api'

/**
 * Get user's reputation score and stats
 */
export async function getUserReputation(userId: string): Promise<ReputationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/reputation/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch reputation: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching user reputation:', error)
    throw error
  }
}

/**
 * Get user's reputation history with pagination
 */
export async function getReputationHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ReputationHistoryResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reputation/${userId}/history?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch reputation history: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching reputation history:', error)
    throw error
  }
}

/**
 * Give reputation to another user
 */
export async function giveReputation(
  fromUserId: string,
  toUserId: string,
  context?: string
): Promise<GiveRepResponse> {
  try {
    const requestBody: GiveRepRequest = {
      from_user_id: fromUserId,
      to_user_id: toUserId,
      context,
    }

    const response = await fetch(`${API_BASE_URL}/reputation/give`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to give reputation: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error giving reputation:', error)
    throw error
  }
}

/**
 * Get reputation leaderboard with pagination
 */
export async function getLeaderboard(
  limit: number = 50,
  offset: number = 0
): Promise<LeaderboardResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/reputation/leaderboard?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Failed to fetch leaderboard: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }
}
