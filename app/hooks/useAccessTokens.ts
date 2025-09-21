"use client";

import { useState, useEffect } from 'react';
import { tokenApiService, AccessToken } from '@/app/lib/tokenApi';

export type { AccessToken };
import { useWalletContext } from '@/context/WalletContext';

export interface AccessTokenStats {
  total: number;
  used: number;
  available: number;
}

export const useAccessTokens = () => {
  const { address } = useWalletContext();
  const isConnected = !!address;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get access tokens for a creator
  const getAccessTokensForCreator = async (
    creatorTokenUuid: string,
    isUsed?: boolean,
    limit: number = 50,
    offset: number = 0
  ): Promise<AccessToken[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getAccessTokensForCreator(
        creatorTokenUuid,
        isUsed,
        limit,
        offset
      );
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch access tokens');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get access tokens for creator:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user's used access tokens
  const getUserUsedAccessTokens = async (
    userAddress: string,
    creatorTokenUuid?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<AccessToken[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getUserUsedAccessTokens(
        userAddress,
        creatorTokenUuid,
        limit,
        offset
      );
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user access tokens');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get user access tokens:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get access token statistics
  const getAccessTokenStats = async (creatorTokenUuid: string): Promise<AccessTokenStats> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getAccessTokenStats(creatorTokenUuid);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch access token stats');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get access token stats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Use an access token
  const claimAccessToken = async (token: string): Promise<boolean> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.useAccessToken({
        token,
        user_address: address,
      });
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to use access token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to use access token:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Validate an access token
  const validateAccessToken = async (token: string): Promise<AccessToken | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.validateAccessToken(token);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to validate access token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to validate access token:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Revoke an access token
  const revokeAccessToken = async (token: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.revokeAccessToken(token);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to revoke access token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to revoke access token:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has used access tokens for a creator
  const hasUserUsedAccessToken = async (creatorTokenUuid: string): Promise<boolean> => {
    if (!isConnected || !address) {
      return false;
    }

    try {
      const usedTokens = await getUserUsedAccessTokens(address, creatorTokenUuid, 1, 0);
      return usedTokens.length > 0;
    } catch (err) {
      console.error('Failed to check if user has used access token:', err);
      return false;
    }
  };

  // Get available access tokens for a creator
  const getAvailableAccessTokens = async (creatorTokenUuid: string): Promise<AccessToken[]> => {
    try {
      return await getAccessTokensForCreator(creatorTokenUuid, false);
    } catch (err) {
      console.error('Failed to get available access tokens:', err);
      return [];
    }
  };

  return {
    loading,
    error,
    isConnected,
    address,
    getAccessTokensForCreator,
    getUserUsedAccessTokens,
    getAccessTokenStats,
    claimAccessToken,
    validateAccessToken,
    revokeAccessToken,
    hasUserUsedAccessToken,
    getAvailableAccessTokens,
  };
};
