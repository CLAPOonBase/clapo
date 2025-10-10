"use client";

import { useState, useEffect } from 'react';
import { tokenApiService, PostToken, CreatorToken, PostTokenTransaction, CreatorTokenTransaction } from '@/app/lib/tokenApi';
import { useWalletContext } from '@/context/WalletContext';

export const useTokenIntegration = () => {
  const { address } = useWalletContext();
  const isConnected = !!address;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post Token APIs
  const getAllPostTokens = async (limit: number = 50, offset: number = 0): Promise<PostToken[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getAllPostTokens(limit, offset);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch post tokens');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get all post tokens:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPostToken = async (uuid: string): Promise<PostToken | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getPostToken(uuid);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch post token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get post token:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPostToken = async (data: {
    uuid?: string;
    content: string;
    image_url?: string;
    creator_address: string;
    freebie_count?: number;
    quadratic_divisor?: number;
    total_supply?: number;
  }): Promise<PostToken | null> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.createPostToken({
        ...data,
        creator_address: address,
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create post token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to create post token:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const recordPostTokenTransaction = async (data: PostTokenTransaction): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.recordPostTokenTransaction(data);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to record post token transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to record post token transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserPostTokenHoldings = async (userAddress: string, postTokenUuid?: string): Promise<any[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getUserPostTokenHoldings(userAddress, postTokenUuid);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user post token holdings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get user post token holdings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Creator Token APIs
  const getAllCreatorTokens = async (limit: number = 50, offset: number = 0): Promise<CreatorToken[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getAllCreatorTokens(limit, offset);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch creator tokens');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get all creator tokens:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCreatorToken = async (uuid: string): Promise<CreatorToken | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getCreatorToken(uuid);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch creator token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get creator token:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCreatorToken = async (data: {
    uuid?: string;
    name: string;
    image_url?: string;
    description?: string;
    creator_address: string;
    user_id?: string;
    freebie_count?: number;
    quadratic_divisor?: number;
  }): Promise<CreatorToken | null> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.createCreatorToken({
        ...data,
        creator_address: address,
      });
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create creator token');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to create creator token:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const recordCreatorTokenTransaction = async (data: CreatorTokenTransaction): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.recordCreatorTokenTransaction(data);
      
      if (response.success) {
        return true;
      } else {
        throw new Error(response.message || 'Failed to record creator token transaction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to record creator token transaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserCreatorTokenHoldings = async (userAddress: string, creatorTokenUuid?: string): Promise<any[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await tokenApiService.getUserCreatorTokenHoldings(userAddress, creatorTokenUuid);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch user creator token holdings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to get user creator token holdings:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Helper function to record a transaction after smart contract interaction
  const recordTransaction = async (
    type: 'post' | 'creator',
    transactionData: {
      tokenUuid: string;
      transactionType: 'BUY' | 'SELL' | 'CLAIM';
      amount: number;
      pricePerToken: number;
      totalCost: number;
      txHash: string;
      blockNumber: number;
      gasUsed: number;
      gasPrice: number;
      isFreebie: boolean;
      feesPaid: number;
    }
  ): Promise<boolean> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const baseTransactionData = {
      user_address: address,
      transaction_type: transactionData.transactionType,
      amount: transactionData.amount,
      price_per_token: transactionData.pricePerToken,
      total_cost: transactionData.totalCost,
      tx_hash: transactionData.txHash,
      block_number: transactionData.blockNumber,
      gas_used: transactionData.gasUsed,
      gas_price: transactionData.gasPrice,
      is_freebie: transactionData.isFreebie,
      fees_paid: transactionData.feesPaid,
    };

    if (type === 'post') {
      return await recordPostTokenTransaction({
        ...baseTransactionData,
        post_token_uuid: transactionData.tokenUuid,
      } as PostTokenTransaction);
    } else {
      return await recordCreatorTokenTransaction({
        ...baseTransactionData,
        creator_token_uuid: transactionData.tokenUuid,
      } as CreatorTokenTransaction);
    }
  };

  return {
    loading,
    error,
    isConnected,
    address,
    
    // Post Token methods
    getAllPostTokens,
    getPostToken,
    createPostToken,
    recordPostTokenTransaction,
    getUserPostTokenHoldings,
    
    // Creator Token methods
    getAllCreatorTokens,
    getCreatorToken,
    createCreatorToken,
    recordCreatorTokenTransaction,
    getUserCreatorTokenHoldings,
    
    // Helper methods
    recordTransaction,
  };
};
