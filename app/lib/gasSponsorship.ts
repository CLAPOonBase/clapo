import { ethers } from 'ethers';

/**
 * Gas Sponsorship Helper Functions
 *
 * This module provides utilities for sponsoring gas fees for post creation transactions.
 * It integrates with the backend API to handle gas sponsorship.
 */

interface SponsorTransactionParams {
  userAddress: string;
  uuid: string;
  content: string;
  imageUrl: string;
  quadraticDivisor: number;
  privyUserId: string;
}

interface SponsorTransactionResponse {
  success: boolean;
  txHash: string;
  sponsorAddress?: string;
  message?: string;
  error?: string;
}

/**
 * Request gas sponsorship for a post creation transaction
 * This function calls the backend API to sponsor the transaction
 */
export async function requestGasSponsorship(
  params: SponsorTransactionParams
): Promise<SponsorTransactionResponse> {
  try {
    console.log('🎫 Requesting gas sponsorship for post creation...');

    const response = await fetch('/api/sponsor-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sponsor transaction');
    }

    console.log('✅ Gas sponsorship successful:', data.txHash);
    return data;
  } catch (error) {
    console.error('❌ Gas sponsorship request failed:', error);
    throw error;
  }
}

/**
 * Create post token with gas sponsorship
 * This function attempts to use gas sponsorship, falling back to user-paid gas if sponsorship fails
 */
export async function createPostTokenWithSponsorship(
  contract: ethers.Contract,
  uuid: string,
  content: string,
  imageUrl: string,
  quadraticDivisor: number,
  userAddress: string,
  privyUserId: string,
  enableSponsorship: boolean = true
): Promise<{ txHash: string; sponsored: boolean }> {
  console.log('🚀 Creating post token with sponsorship option:', {
    uuid: uuid.substring(0, 8) + '...',
    enableSponsorship,
    userAddress,
  });

  // Try gas sponsorship first if enabled
  if (enableSponsorship && privyUserId) {
    try {
      console.log('💰 Attempting gas sponsorship...');

      const sponsorResult = await requestGasSponsorship({
        userAddress,
        uuid,
        content,
        imageUrl,
        quadraticDivisor,
        privyUserId,
      });

      if (sponsorResult.success && sponsorResult.txHash) {
        console.log('✅ Transaction sponsored successfully:', sponsorResult.txHash);
        return {
          txHash: sponsorResult.txHash,
          sponsored: true,
        };
      }
    } catch (sponsorError) {
      console.warn('⚠️ Gas sponsorship failed, falling back to user-paid transaction:', sponsorError);
      // Continue to fallback below
    }
  }

  // Fallback: User pays for gas
  console.log('💳 User paying for gas...');

  try {
    const tx = await contract.createPost(
      uuid,
      content,
      imageUrl,
      0, // freebieCount
      quadraticDivisor
    );

    console.log('📤 Transaction sent (user-paid):', tx.hash);
    await tx.wait();

    return {
      txHash: tx.hash,
      sponsored: false,
    };
  } catch (error) {
    console.error('❌ Failed to create post token (user-paid):', error);
    throw error;
  }
}

/**
 * Check if gas sponsorship is available
 * This checks if the backend sponsorship service is configured and available
 */
export async function isGasSponsorshipAvailable(): Promise<boolean> {
  try {
    // Check if required environment variables are set
    const hasPrivyConfig =
      process.env.NEXT_PUBLIC_PRIVY_APP_ID &&
      process.env.PRIVY_APP_SECRET;

    const hasSponsorWallet = process.env.PRIVATE_KEY;

    return !!(hasPrivyConfig && hasSponsorWallet);
  } catch (error) {
    console.error('Failed to check gas sponsorship availability:', error);
    return false;
  }
}

/**
 * Format sponsorship status message for user
 */
export function getGasSponsorshipMessage(sponsored: boolean, txHash: string): string {
  if (sponsored) {
    return `🎉 Post created! Gas fees sponsored. TX: ${txHash.slice(0, 10)}...`;
  } else {
    return `✅ Post created! TX: ${txHash.slice(0, 10)}...`;
  }
}
