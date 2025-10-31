"use client";

import { useSendTransaction } from '@privy-io/react-auth';
import { useCallback } from 'react';
import { encodeFunctionData } from 'viem';

/**
 * Hook for sending sponsored transactions using Privy's native gas sponsorship
 *
 * This hook wraps Privy's useSendTransaction with sponsor: true to enable
 * gas-free transactions for users on Base Sepolia testnet.
 *
 * Requirements:
 * - Gas sponsorship must be enabled in Privy Dashboard
 * - Base Sepolia must be configured as a supported chain
 * - User must have an embedded wallet created through Privy
 *
 * @example
 * ```tsx
 * const { sendSponsoredTransaction, isLoading } = useSponsoredTransaction();
 *
 * await sendSponsoredTransaction({
 *   to: contractAddress,
 *   data: encodedData,
 *   value: 0n
 * });
 * ```
 */
export const useSponsoredTransaction = () => {
  const { sendTransaction } = useSendTransaction();

  /**
   * Send a sponsored transaction (gas fees covered by Privy)
   *
   * @param transaction - Transaction parameters
   * @param transaction.to - Destination address
   * @param transaction.data - Encoded transaction data
   * @param transaction.value - Value to send in wei (default: 0)
   * @returns Transaction hash as string
   */
  const sendSponsoredTransaction = useCallback(async (transaction: {
    to: `0x${string}`;
    data?: `0x${string}`;
    value?: bigint;
  }): Promise<string> => {
    try {
      console.log('🎫 Sending sponsored transaction:', {
        to: transaction.to,
        value: transaction.value?.toString() || '0',
        dataLength: transaction.data?.length || 0
      });

      const txResult = await sendTransaction(
        {
          to: transaction.to,
          value: transaction.value || 0n,
          data: transaction.data,
        },
        {
          // Enable gas sponsorship - Privy will cover the gas fees
          sponsor: true
        }
      );

      // Extract transaction hash from result
      const txHash = typeof txResult === 'string' ? txResult : (txResult as any).hash || (txResult as any).transactionHash;
      console.log('✅ Sponsored transaction sent:', txHash);
      return txHash;
    } catch (error) {
      console.error('❌ Sponsored transaction failed:', error);
      throw error;
    }
  }, [sendTransaction]);

  return {
    sendSponsoredTransaction
  };
};

/**
 * Helper function to encode contract function calls
 * Re-exported from viem for convenience
 */
export { encodeFunctionData };
