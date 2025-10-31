import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { createWalletClient, http, encodeFunctionData, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// Initialize Privy client
const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
);

// Contract configuration
const POST_TOKEN_CONTRACT = '0xcaC4DF2Bd3723CEA847e1AE07F37Fb4B33c6Cb61';

// Contract ABI for createPost function
const CONTRACT_ABI = [
  {
    name: 'createPost',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'uuid', type: 'string' },
      { name: 'content', type: 'string' },
      { name: 'imageUrl', type: 'string' },
      { name: 'freebieCount', type: 'uint256' },
      { name: '_quadraticDivisor', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'string' }]
  }
] as const;

/**
 * POST /api/sponsor-transaction
 * Sponsors gas for creating post tokens
 *
 * Request body:
 * - userAddress: string - The user's wallet address
 * - uuid: string - Post UUID
 * - content: string - Post content
 * - imageUrl: string - Post image URL
 * - quadraticDivisor: number - Price curve divisor
 * - privyUserId: string - Privy user ID for verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, uuid, content, imageUrl, quadraticDivisor, privyUserId } = body;

    console.log('🎫 Gas sponsorship request received:', {
      userAddress,
      uuid: uuid.substring(0, 8) + '...',
      privyUserId,
      quadraticDivisor
    });

    // Validate required fields
    if (!userAddress || !uuid || !content || quadraticDivisor === undefined || !privyUserId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the Privy user (optional but recommended for security)
    try {
      const privyUser = await privy.getUser(privyUserId);
      console.log('✅ Privy user verified:', privyUser.id);

      // Optional: Verify that the userAddress belongs to this Privy user
      const userWallets = privyUser.linkedAccounts
        ?.filter(account => account.type === 'wallet')
        .map(account => account.address?.toLowerCase());

      if (!userWallets?.includes(userAddress.toLowerCase())) {
        console.warn('⚠️ Warning: Wallet address does not match Privy user');
      }
    } catch (verifyError) {
      console.error('❌ Failed to verify Privy user:', verifyError);
      return NextResponse.json(
        { error: 'User verification failed' },
        { status: 401 }
      );
    }

    // Create wallet client using sponsor's private key
    const sponsorAccount = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

    const walletClient = createWalletClient({
      account: sponsorAccount,
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL)
    });

    console.log('💰 Sponsor account:', sponsorAccount.address);

    // IMPORTANT: This implementation sponsors the transaction by having the backend
    // send it with the sponsor's wallet. However, the contract will record the
    // sponsor's address as the creator, not the user's address.
    //
    // For a production implementation, you should either:
    // 1. Modify the contract to accept a "creator" parameter
    // 2. Use account abstraction with a paymaster
    // 3. Use a meta-transaction pattern
    //
    // For now, we'll proceed with this approach for demonstration purposes.

    // Encode the contract call
    const data = encodeFunctionData({
      abi: CONTRACT_ABI,
      functionName: 'createPost',
      args: [uuid, content, imageUrl, 0n, BigInt(quadraticDivisor)]
    });

    console.log('📝 Encoded transaction data');

    // Estimate gas
    let gasEstimate: bigint;
    try {
      const publicClient = await import('viem').then(m => m.createPublicClient({
        chain: baseSepolia,
        transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL)
      }));

      gasEstimate = await publicClient.estimateGas({
        account: sponsorAccount,
        to: POST_TOKEN_CONTRACT,
        data
      });

      console.log('⛽ Gas estimate:', gasEstimate.toString());
    } catch (estimateError) {
      console.error('❌ Gas estimation failed:', estimateError);
      return NextResponse.json(
        {
          error: 'Transaction will fail. Please check your inputs.',
          details: estimateError instanceof Error ? estimateError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    // Send the transaction with sponsored gas
    console.log('📤 Sending sponsored transaction...');

    const txHash = await walletClient.sendTransaction({
      account: sponsorAccount,
      to: POST_TOKEN_CONTRACT,
      data,
      gas: gasEstimate * 120n / 100n, // Add 20% buffer
    } as any);

    console.log('✅ Transaction sent:', txHash);

    return NextResponse.json({
      success: true,
      txHash,
      sponsorAddress: sponsorAccount.address,
      message: 'Transaction sponsored successfully'
    });

  } catch (error) {
    console.error('❌ Gas sponsorship failed:', error);

    let errorMessage = 'Failed to sponsor transaction';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
