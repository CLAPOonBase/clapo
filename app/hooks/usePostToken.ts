"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletContext } from '@/context/WalletContext';

// Contract ABI for Post Token with UUID support
const CONTRACT_ABI = [
  // Create post with UUID
  "function createPost(string memory uuid, string memory content, string memory imageUrl, uint256 _freebieCount, uint256 _quadraticDivisor) external returns (string memory)",
  
  // Buy/Sell functions
  "function buyPostTokensByUuid(string memory uuid) external",
  "function sellPostTokensByUuid(string memory uuid, uint256 amount) external",
  
  // View functions
  "function getCurrentPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getActualPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getBuyPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getSellPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getFreebieSellPriceByUuid(string memory uuid) external view returns (uint256)",
  "function canClaimFreebieByUuid(string memory uuid, address user) external view returns (bool)",
  "function getPostStatsByUuid(string memory uuid) external view returns (uint256 totalBuyers, uint256 payingBuyers, uint256 freebieClaimed, uint256 currentPrice, uint256 highestPrice, uint256 rewardPoolBalance, uint256 creatorFeeBalance, uint256 platformFeeBalance, uint256 liability, bool breakEven, uint256 totalSupply, uint256 circulatingSupply)",
  "function getUserPostPortfolioByUuid(string memory uuid, address user) external view returns (uint256 balance, uint256 totalBought, uint256 totalSold, uint256 totalFeesPaid, uint256 lastTransactionTime, bool hasFreebieFlag, uint256 transactionCount, uint256 netShares, uint256 currentValue)",
  "function getRemainingFreebiesByUuid(string memory uuid) external view returns (uint256)",
  "function getRemainingSupplyByUuid(string memory uuid) external view returns (uint256)",
  "function distributeFeesByUuid(string memory uuid) external",
  
  // UUID utility functions
  "function doesUuidExist(string memory uuid) external view returns (bool)",
  "function getInternalIdFromUuid(string memory uuid) external view returns (uint256)",
  "function getUuidFromInternalId(uint256 internalId) external view returns (string memory)",
  "function getPostByUuid(string memory uuid) external view returns (tuple(uint256 postId, string uuid, string content, string imageUrl, address creator, uint256 createdAt, bool exists))",
  
  // Contract state functions
  "function paused() external view returns (bool)",
  
  // Events
  "event PostCreated(uint256 indexed postId, address indexed creator, string content)",
  "event PostTokensBought(uint256 indexed postId, address indexed buyer, uint256 amount, uint256 price, bool isFreebie, uint256 transactionId)",
  "event PostTokensSold(uint256 indexed postId, address indexed seller, uint256 amount, uint256 payout, bool isFreebie, uint256 transactionId)"
];

const CONTRACT_ADDRESS = "0xAb6E048829A7c7Cc9b9C5f31cb445237F2b2dC7e"; // Post Token contract deployed on Monad testnet
const MOCK_USDC_ADDRESS = "0x44aAAEeC1A83c30Fe5784Af49E6a38D3709Ee148";

// ERC20 ABI for USDC approval
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

export interface PostTokenStats {
  totalBuyers: number;
  payingBuyers: number;
  freebieClaimed: number;
  currentPrice: number;
  highestPrice: number;
  rewardPoolBalance: number;
  creatorFeeBalance: number;
  platformFeeBalance: number;
  liability: number;
  breakEven: boolean;
  totalSupply: number;
  circulatingSupply: number;
}

export interface UserPortfolio {
  balance: number;
  totalBought: number;
  totalSold: number;
  totalFeesPaid: number;
  lastTransactionTime: number;
  hasFreebieFlag: boolean;
  transactionCount: number;
  netShares: number;
  currentValue: number;
}

export const usePostToken = () => {
  const { provider, signer, address, isConnecting, connect, disconnect } = useWalletContext();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Derive isConnected from global wallet context
  const isConnected = !!signer && !!address;

  // Update contract when wallet connection changes
  useEffect(() => {
    if (signer && address) {
      console.log('Setting up Post Token contract with global wallet context');
      console.log('Wallet connected:', address);
      console.log('Post Token Contract address:', CONTRACT_ADDRESS);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contract);
    } else {
      console.log('No wallet connection - clearing contract');
      setContract(null);
    }
  }, [signer, address]);

  // Connect wallet using global wallet context
  const connectWallet = async () => {
    try {
      console.log('Connecting wallet using global wallet context...');
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  // Disconnect wallet using global wallet context
  const disconnectWallet = () => {
    setContract(null);
    disconnect();
  };

  // Create post token
  const createPostToken = async (
    uuid: string,
    content: string,
    imageUrl: string,
    freebieCount: number = 3,
    quadraticDivisor: number = 1
  ) => {
    console.log('🚀 createPostToken called with:', {
      uuid,
      content: content.substring(0, 50) + '...',
      imageUrl,
      freebieCount,
      quadraticDivisor,
      contractAddress: CONTRACT_ADDRESS,
      hasContract: !!contract,
      hasSigner: !!signer,
      userAddress: address
    });

    if (!contract || !signer) {
      console.error('❌ Contract or signer not connected:', { hasContract: !!contract, hasSigner: !!signer });
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      console.log('📝 Calling contract.createPost...');
      console.log('Contract method details:', {
        method: 'createPost',
        params: [uuid, content, imageUrl, freebieCount, quadraticDivisor],
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address
      });

      // First check if the contract is paused
      try {
        const isPaused = await contract.paused();
        console.log('Contract paused status:', isPaused);
        if (isPaused) {
          throw new Error('Contract is currently paused');
        }
      } catch (pauseError) {
        console.log('Could not check pause status:', pauseError);
      }

      // Check if UUID already exists
      try {
        const exists = await contract.doesUuidExist(uuid);
        console.log('UUID exists check:', exists);
        if (exists) {
          throw new Error('Post with this UUID already exists');
        }
      } catch (existsError) {
        console.log('Could not check UUID existence:', existsError);
      }

      const tx = await contract.createPost(
        uuid,
        content,
        imageUrl,
        freebieCount,
        quadraticDivisor
      );

      console.log('✅ Transaction sent:', {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        gasLimit: tx.gasLimit?.toString(),
        gasPrice: tx.gasPrice?.toString()
      });

      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('🎉 Transaction confirmed:', {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      });

      // Create post token in backend database
      try {
        const { tokenApiService } = await import('@/app/lib/tokenApi');
        const backendResponse = await tokenApiService.createPostToken({
          uuid: uuid, // Pass the same UUID used for blockchain
          content: content,
          image_url: imageUrl,
          creator_address: address!,
          freebie_count: freebieCount,
          quadratic_divisor: quadraticDivisor,
          total_supply: 100000 // Default total supply
        });
        
        if (backendResponse.success) {
          console.log('✅ Post token created in backend database:', backendResponse.data?.uuid);
        } else {
          console.error('❌ Failed to create post token in backend:', backendResponse.message);
        }
      } catch (apiError) {
        console.error('❌ Failed to create post token in backend database:', apiError);
        // Don't throw here - blockchain transaction succeeded, backend is optional
      }

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to create post token:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data,
        stack: error.stack
      });
      
      // Try to parse the error message for better user feedback
      let userMessage = 'Failed to create post token';
      
      if (error.message?.includes('Post with this UUID already exists')) {
        userMessage = 'A token already exists for this post. Please try again.';
      } else if (error.message?.includes('Contract is currently paused')) {
        userMessage = 'Token creation is temporarily disabled. Please try again later.';
      } else if (error.message?.includes('execution reverted')) {
        userMessage = 'Transaction failed. Please check your wallet and try again.';
      } else if (error.message?.includes('Internal JSON-RPC error')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('insufficient funds')) {
        userMessage = 'Insufficient funds for gas fees. Please add ETH to your wallet.';
      }
      
      const enhancedError = new Error(userMessage) as Error & { originalError: any };
      enhancedError.originalError = error;
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  };

  // Check USDC balance
  const checkUSDCBalance = async (): Promise<number> => {
    if (!signer || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      const usdcContract = new ethers.Contract(MOCK_USDC_ADDRESS, ERC20_ABI, signer);
      const balance = await usdcContract.balanceOf(address);
      return parseFloat(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error('Failed to check USDC balance:', error);
      return 0;
    }
  };

  // Check and approve USDC allowance
  const checkAndApproveUSDC = async (requiredAmount: number): Promise<void> => {
    if (!signer || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // First check USDC balance
      const balance = await checkUSDCBalance();
      if (balance < requiredAmount) {
        throw new Error(`Insufficient USDC balance. You have ${balance.toFixed(2)} USDC but need ${requiredAmount.toFixed(2)} USDC.`);
      }

      // Create USDC contract instance
      const usdcContract = new ethers.Contract(MOCK_USDC_ADDRESS, ERC20_ABI, signer);
      
      // Check current allowance
      const currentAllowance = await usdcContract.allowance(address, CONTRACT_ADDRESS);
      const requiredAllowance = ethers.parseUnits(requiredAmount.toString(), 6); // USDC has 6 decimals
      
      console.log('USDC Allowance Check:', {
        currentAllowance: ethers.formatUnits(currentAllowance, 6),
        requiredAllowance: ethers.formatUnits(requiredAllowance, 6),
        needsApproval: currentAllowance < requiredAllowance
      });

      // If allowance is insufficient, approve
      if (currentAllowance < requiredAllowance) {
        console.log('Approving USDC allowance...');
        const approveTx = await usdcContract.approve(CONTRACT_ADDRESS, requiredAllowance);
        console.log('USDC approval transaction sent:', approveTx.hash);
        await approveTx.wait();
        console.log('USDC approval confirmed');
      } else {
        console.log('Sufficient USDC allowance already exists');
      }
    } catch (error) {
      console.error('Failed to approve USDC:', error);
      if (error.message?.includes('Insufficient USDC balance')) {
        throw error;
      }
      throw new Error('Failed to approve USDC allowance. Please try again.');
    }
  };

  // Buy shares
  const buyShares = async (uuid: string, buyerUserId?: string) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      // First, get the current price to determine required USDC amount
      const currentPrice = await getCurrentPrice(uuid);
      console.log('Current price for buying shares:', currentPrice);
      
      // Check and approve USDC allowance
      await checkAndApproveUSDC(currentPrice);
      
      // Now proceed with the purchase
      const tx = await contract.buyPostTokensByUuid(uuid);
      const receipt = await tx.wait();
      
      // Check if this was a freebie transaction by looking for FreebieClaimed event
      let isFreebie = false;
      let actualPrice = currentPrice;
      let actualTotalCost = currentPrice;
      
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'FreebieClaimed') {
              isFreebie = true;
              actualPrice = 0;
              actualTotalCost = 0;
              console.log('🎁 Freebie transaction detected!');
              break;
            } else if (parsedLog && parsedLog.name === 'PostTokensBought') {
              // Check if PostTokensBought event indicates it was a freebie
              const eventArgs = parsedLog.args;
              if (eventArgs && eventArgs.isFreebie === true) {
                isFreebie = true;
                actualPrice = 0;
                actualTotalCost = 0;
                console.log('🎁 Freebie transaction detected via PostTokensBought event!');
              }
              break;
            }
          } catch (e) {
            // Skip logs that can't be parsed (might be from other contracts)
            continue;
          }
        }
      }
      
      // Record transaction in backend database
      try {
        const { tokenApiService } = await import('@/app/lib/tokenApi');
        
        await tokenApiService.recordPostTokenTransaction({
          user_address: address!,
          buyer_user_id: buyerUserId,
          post_token_uuid: uuid,
          transaction_type: 'BUY',
          amount: 1,
          price_per_token: actualPrice,
          total_cost: actualTotalCost,
          tx_hash: tx.hash,
          block_number: receipt.blockNumber,
          gas_used: Number(receipt.gasUsed?.toString() || '0'),
          gas_price: Number(receipt.gasPrice?.toString() || '0'),
          is_freebie: isFreebie,
          fees_paid: 0
        });
        console.log('✅ Transaction recorded in backend database', { isFreebie, actualPrice, actualTotalCost });
      } catch (apiError) {
        console.error('❌ Failed to record transaction in backend:', apiError);
        // Transaction still succeeded on blockchain, but not recorded in backend
      }
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to buy shares:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sell shares
  const sellShares = async (uuid: string, amount: number) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      // Get current price for recording
      const currentPrice = await getCurrentPrice(uuid);
      
      const tx = await contract.sellPostTokensByUuid(uuid, amount);
      const receipt = await tx.wait();
      
      // Record transaction in backend database
      try {
        const { tokenApiService } = await import('@/app/lib/tokenApi');
        await tokenApiService.recordPostTokenTransaction({
          user_address: address!,
          post_token_uuid: uuid,
               transaction_type: 'SELL',
          amount: amount,
          price_per_token: currentPrice,
          total_cost: currentPrice * amount,
          tx_hash: tx.hash,
          block_number: receipt.blockNumber,
          gas_used: Number(receipt.gasUsed?.toString() || '0'),
          gas_price: Number(receipt.gasPrice?.toString() || '0'),
          is_freebie: false,
          fees_paid: 0
        });
        console.log('✅ Transaction recorded in backend database');
      } catch (apiError) {
        console.error('❌ Failed to record transaction in backend:', apiError);
        // Transaction still succeeded on blockchain, but not recorded in backend
      }
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to sell shares:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get current price
  const getCurrentPrice = async (uuid: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Post ${uuid} does not exist, returning 0 price`);
        return 0;
      }

      const price = await contract.getCurrentPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get current price:', error);
      return 0;
    }
  };

  // Get post stats
  const getPostStats = async (uuid: string): Promise<PostTokenStats | null> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Post ${uuid} does not exist, returning null stats`);
        return null;
      }

      const stats = await contract.getPostStatsByUuid(uuid);
      return {
        totalBuyers: Number(stats.totalBuyers),
        payingBuyers: Number(stats.payingBuyers),
        freebieClaimed: Number(stats.freebieClaimed),
        currentPrice: parseFloat(ethers.formatUnits(stats.currentPrice, 6)),
        highestPrice: parseFloat(ethers.formatUnits(stats.highestPrice, 6)),
        rewardPoolBalance: parseFloat(ethers.formatUnits(stats.rewardPoolBalance, 6)),
        creatorFeeBalance: parseFloat(ethers.formatUnits(stats.creatorFeeBalance, 6)),
        platformFeeBalance: parseFloat(ethers.formatUnits(stats.platformFeeBalance, 6)),
        liability: parseFloat(ethers.formatUnits(stats.liability, 6)),
        breakEven: stats.breakEven,
        totalSupply: Number(stats.totalSupply),
        circulatingSupply: Number(stats.circulatingSupply)
      };
    } catch (error) {
      console.error('Failed to get post stats:', error);
      return null;
    }
  };

  // Get user portfolio
  const getUserPortfolio = async (uuid: string, userAddress: string): Promise<UserPortfolio | null> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const portfolio = await contract.getUserPostPortfolioByUuid(uuid, userAddress);
      return {
        balance: Number(portfolio.balance),
        totalBought: Number(portfolio.totalBought),
        totalSold: Number(portfolio.totalSold),
        totalFeesPaid: parseFloat(ethers.formatUnits(portfolio.totalFeesPaid, 6)),
        lastTransactionTime: Number(portfolio.lastTransactionTime),
        hasFreebieFlag: portfolio.hasFreebieFlag,
        transactionCount: Number(portfolio.transactionCount),
        netShares: Number(portfolio.netShares),
        currentValue: parseFloat(ethers.formatUnits(portfolio.currentValue, 6))
      };
    } catch (error) {
      console.error('Failed to get user portfolio:', error);
      return null;
    }
  };

  // Get remaining freebies
  const getRemainingFreebies = async (uuid: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Post ${uuid} does not exist, returning 0 freebies`);
        return 0;
      }

      const freebies = await contract.getRemainingFreebiesByUuid(uuid);
      return Number(freebies);
    } catch (error) {
      console.error('Failed to get remaining freebies:', error);
      return 0;
    }
  };

  // Get actual price (ignores freebie availability)
  const getActualPrice = async (uuid: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Post ${uuid} does not exist, returning 0 actual price`);
        return 0;
      }

      const price = await contract.getActualPriceByUuid(uuid);
      return Number(ethers.formatUnits(price, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Failed to get actual price:', error);
      return 0;
    }
  };

  // Check if user can claim freebie
  const canClaimFreebie = async (uuid: string, userAddress: string): Promise<boolean> => {
    if (!contract) {
      console.log('No contract available for checking freebie eligibility');
      return false;
    }

    if (!userAddress) {
      console.log('No user address provided for checking freebie eligibility');
      return false;
    }

    try {
      // First check if post exists
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Post ${uuid} does not exist, returning false for freebie eligibility`);
        return false;
      }

      console.log(`Checking freebie eligibility for user ${userAddress} on post ${uuid}`);
      const canClaim = await contract.canClaimFreebieByUuid(uuid, userAddress);
      console.log(`User ${userAddress} can claim freebie on post ${uuid}:`, canClaim);
      return canClaim;
    } catch (error) {
      console.error('Failed to check freebie eligibility:', error);
      console.log('Error details:', {
        uuid,
        userAddress,
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code
      });
      return false;
    }
  };

  // Check contract state and connectivity
  const checkContractState = async (): Promise<{
    isConnected: boolean;
    isPaused: boolean;
    contractAddress: string;
    userAddress: string;
  }> => {
    if (!contract || !address) {
      return {
        isConnected: false,
        isPaused: false,
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address || 'Not connected'
      };
    }

    try {
      const isPaused = await contract.paused();
      return {
        isConnected: true,
        isPaused,
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address
      };
    } catch (error) {
      console.error('Failed to check contract state:', error);
      return {
        isConnected: false,
        isPaused: false,
        contractAddress: CONTRACT_ADDRESS,
        userAddress: address || 'Not connected'
      };
    }
  };

  // Check if post token exists
  const checkPostTokenExists = async (uuid: string): Promise<boolean> => {
    console.log(`🔍 checkPostTokenExists called for post: ${uuid}`);
    console.log(`Contract status:`, { 
      hasContract: !!contract, 
      contractAddress: CONTRACT_ADDRESS,
      hasSigner: !!signer,
      userAddress: address
    });
    
    if (!contract) {
      console.log('❌ No contract available for checking post existence');
      return false;
    }

    try {
      console.log(`📞 Calling contract.doesUuidExist(${uuid})...`);
      // Use the safe function that doesn't revert
      const exists = await contract.doesUuidExist(uuid);
      console.log(`✅ Contract response - Post ${uuid} exists:`, exists);
      return exists;
    } catch (error) {
      console.error('❌ Failed to check if post token exists:', error);
      console.error('Error details:', {
        uuid,
        contractAddress: CONTRACT_ADDRESS,
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorReason: error?.reason,
        errorData: error?.data
      });
      
      // If the call fails, assume the post doesn't exist
      return false;
    }
  };

  return {
    contract,
    signer,
    isConnected,
    loading,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    createPostToken,
    buyShares,
    sellShares,
    getCurrentPrice,
    getActualPrice,
    getPostStats,
    getUserPortfolio,
    getRemainingFreebies,
    canClaimFreebie,
    checkPostTokenExists,
    checkContractState,
    checkUSDCBalance,
    checkAndApproveUSDC
  };
};
