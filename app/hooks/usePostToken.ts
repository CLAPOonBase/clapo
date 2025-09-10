"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract ABI - you'll need to get this from your deployed contract
const CONTRACT_ABI = [
  // Create post with custom ID
  "function createPostWithId(string memory customPostId, string memory content, string memory imageUrl, uint256 _priceStart, uint256 _priceIncrement, uint256 _freebieCount) external returns (string memory)",
  
  // Buy/Sell functions
  "function buyPostSharesByCustomId(string memory customPostId) external",
  "function sellPostSharesByCustomId(string memory customPostId, uint256 amount) external",
  
  // View functions
  "function getCurrentPriceByCustomId(string memory customPostId) external view returns (uint256)",
  "function getActualPriceByCustomId(string memory customPostId) external view returns (uint256)",
  "function canClaimFreebieByCustomId(string memory customPostId, address user) external view returns (bool)",
  "function getPostStatsByCustomId(string memory customPostId) external view returns (uint256 totalBuyers, uint256 payingBuyers, uint256 freebieClaimed, uint256 currentPrice, uint256 highestPrice, uint256 rewardPoolBalance, uint256 creatorFeeBalance, uint256 platformFeeBalance, uint256 liability, bool breakEven)",
  "function getUserPostPortfolioByCustomId(string memory customPostId, address user) external view returns (uint256 balance, uint256 totalBought, uint256 totalSold, uint256 totalFeesPaid, uint256 lastTransactionTime, bool hasFreebieFlag, uint256 transactionCount, uint256 netShares, uint256 currentValue)",
  "function getRemainingFreebiesByCustomId(string memory customPostId) external view returns (uint256)",
  "function getFreebieSellPriceByCustomId(string memory customPostId) external view returns (uint256)",
  
  // Check if post exists
  "function doesCustomPostExist(string memory customPostId) external view returns (bool)",
  
  // Events
  "event PostCreated(uint256 indexed postId, address indexed creator, string content)",
  "event SharesBought(uint256 indexed postId, address indexed buyer, uint256 amount, uint256 price, bool isFreebie, uint256 transactionId)",
  "event SharesSold(uint256 indexed postId, address indexed seller, uint256 amount, uint256 payout, bool isFreebie, uint256 transactionId)"
];

const CONTRACT_ADDRESS = "0x23Ef1aE7fBF47977c1f40d6E6C98FB4371d87850"; // New contract with proper freebie sell pricing
const MOCK_USDC_ADDRESS = "0x44aAAEeC1A83c30Fe5784Af49E6a38D3709Ee148";

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
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          console.log('Checking wallet connection...');
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          console.log('Available accounts:', accounts.length);
          
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const address = await signer.getAddress();
            
            console.log('Wallet connected:', address);
            console.log('Contract address:', CONTRACT_ADDRESS);
            
            setContract(contract);
            setSigner(signer);
            setAddress(address);
            setIsConnected(true);
          } else {
            console.log('No accounts found');
            setIsConnected(false);
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
          setIsConnected(false);
        }
      } else {
        console.log('window.ethereum not available');
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not found! Please install MetaMask to use this feature.');
    }

    setIsConnecting(true);
    try {
      console.log('Connecting wallet...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const address = await signer.getAddress();
      
      console.log('Wallet connected successfully:', address);
      console.log('Contract address:', CONTRACT_ADDRESS);
      
      setContract(contract);
      setSigner(signer);
      setAddress(address);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setContract(null);
    setSigner(null);
    setAddress(null);
    setIsConnected(false);
  };

  // Create post token
  const createPostToken = async (
    customPostId: string,
    content: string,
    imageUrl: string,
    priceStart: string = "0.01", // $0.01 USDC
    priceIncrement: string = "0.01", // $0.01 USDC
    freebieCount: number = 100
  ) => {
    console.log('🚀 createPostToken called with:', {
      customPostId,
      content: content.substring(0, 50) + '...',
      imageUrl,
      priceStart,
      priceIncrement,
      freebieCount,
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
      console.log('💰 Converting prices to Wei...');
      const priceStartWei = ethers.parseUnits(priceStart, 6); // USDC has 6 decimals
      const priceIncrementWei = ethers.parseUnits(priceIncrement, 6);
      
      console.log('📊 Price conversion results:', {
        priceStart,
        priceStartWei: priceStartWei.toString(),
        priceIncrement,
        priceIncrementWei: priceIncrementWei.toString()
      });

      console.log('📝 Calling contract.createPostWithId...');
      console.log('Contract method details:', {
        method: 'createPostWithId',
        params: [customPostId, content, imageUrl, priceStartWei, priceIncrementWei, freebieCount]
      });

      const tx = await contract.createPostWithId(
        customPostId,
        content,
        imageUrl,
        priceStartWei,
        priceIncrementWei,
        freebieCount
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

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to create post token:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buy shares
  const buyShares = async (customPostId: string) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.buyPostSharesByCustomId(customPostId);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to buy shares:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sell shares
  const sellShares = async (customPostId: string, amount: number) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.sellPostSharesByCustomId(customPostId, amount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to sell shares:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get current price
  const getCurrentPrice = async (customPostId: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesCustomPostExist(customPostId);
      if (!exists) {
        console.log(`Post ${customPostId} does not exist, returning 0 price`);
        return 0;
      }

      const price = await contract.getCurrentPriceByCustomId(customPostId);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get current price:', error);
      return 0;
    }
  };

  // Get post stats
  const getPostStats = async (customPostId: string): Promise<PostTokenStats | null> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesCustomPostExist(customPostId);
      if (!exists) {
        console.log(`Post ${customPostId} does not exist, returning null stats`);
        return null;
      }

      const stats = await contract.getPostStatsByCustomId(customPostId);
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
        breakEven: stats.breakEven
      };
    } catch (error) {
      console.error('Failed to get post stats:', error);
      return null;
    }
  };

  // Get user portfolio
  const getUserPortfolio = async (customPostId: string, userAddress: string): Promise<UserPortfolio | null> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const portfolio = await contract.getUserPostPortfolioByCustomId(customPostId, userAddress);
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
  const getRemainingFreebies = async (customPostId: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesCustomPostExist(customPostId);
      if (!exists) {
        console.log(`Post ${customPostId} does not exist, returning 0 freebies`);
        return 0;
      }

      const freebies = await contract.getRemainingFreebiesByCustomId(customPostId);
      return Number(freebies);
    } catch (error) {
      console.error('Failed to get remaining freebies:', error);
      return 0;
    }
  };

  // Get actual price (ignores freebie availability)
  const getActualPrice = async (customPostId: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      // First check if post exists
      const exists = await contract.doesCustomPostExist(customPostId);
      if (!exists) {
        console.log(`Post ${customPostId} does not exist, returning 0 actual price`);
        return 0;
      }

      const price = await contract.getActualPriceByCustomId(customPostId);
      return Number(ethers.formatUnits(price, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Failed to get actual price:', error);
      return 0;
    }
  };

  // Check if user can claim freebie
  const canClaimFreebie = async (customPostId: string, userAddress: string): Promise<boolean> => {
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
      const exists = await contract.doesCustomPostExist(customPostId);
      if (!exists) {
        console.log(`Post ${customPostId} does not exist, returning false for freebie eligibility`);
        return false;
      }

      console.log(`Checking freebie eligibility for user ${userAddress} on post ${customPostId}`);
      const canClaim = await contract.canClaimFreebieByCustomId(customPostId, userAddress);
      console.log(`User ${userAddress} can claim freebie on post ${customPostId}:`, canClaim);
      return canClaim;
    } catch (error) {
      console.error('Failed to check freebie eligibility:', error);
      console.log('Error details:', {
        customPostId,
        userAddress,
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code
      });
      return false;
    }
  };

  // Check if post token exists
  const checkPostTokenExists = async (customPostId: string): Promise<boolean> => {
    console.log(`🔍 checkPostTokenExists called for post: ${customPostId}`);
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
      console.log(`📞 Calling contract.doesCustomPostExist(${customPostId})...`);
      // Use the safe function that doesn't revert
      const exists = await contract.doesCustomPostExist(customPostId);
      console.log(`✅ Contract response - Post ${customPostId} exists:`, exists);
      return exists;
    } catch (error) {
      console.error('❌ Failed to check if post token exists:', error);
      console.error('Error details:', {
        postId: customPostId,
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
    checkPostTokenExists
  };
};
