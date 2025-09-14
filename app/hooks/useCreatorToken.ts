"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract ABI for Creator Token
const CREATOR_TOKEN_ABI = [
  // Create creator with UUID
  "function createCreator(string memory uuid, string memory name, string memory imageUrl, string memory description, uint256 _freebieCount, uint256 _quadraticDivisor) external returns (string memory)",
  
  // Buy/Sell functions
  "function buyCreatorTokensByUuid(string memory uuid) external",
  "function sellCreatorTokensByUuid(string memory uuid, uint256 amount) external",
  
  // View functions
  "function getCurrentPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getActualPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getBuyPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getSellPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getFreebieSellPriceByUuid(string memory uuid) external view returns (uint256)",
  "function canClaimFreebieByUuid(string memory uuid, address user) external view returns (bool)",
  "function getCreatorStatsByUuid(string memory uuid) external view returns (uint256 totalBuyers, uint256 payingBuyers, uint256 freebieClaimed, uint256 currentPrice, uint256 highestPrice, uint256 rewardPoolBalance, uint256 creatorFeeBalance, uint256 platformFeeBalance, uint256 liability, bool breakEven)",
  "function getUserCreatorPortfolioByUuid(string memory uuid, address user) external view returns (uint256 balance, uint256 totalBought, uint256 totalSold, uint256 totalFeesPaid, uint256 lastTransactionTime, bool hasFreebieFlag, uint256 transactionCount, uint256 netShares, uint256 currentValue)",
  "function getRemainingFreebiesByUuid(string memory uuid) external view returns (uint256)",
  "function distributeFeesByUuid(string memory uuid) external",
  
  // UUID utility functions
  "function doesUuidExist(string memory uuid) external view returns (bool)",
  "function getInternalIdFromUuid(string memory uuid) external view returns (uint256)",
  "function getUuidFromInternalId(uint256 internalId) external view returns (string memory)",
  "function getCreatorByUuid(string memory uuid) external view returns (tuple(uint256 creatorId, string uuid, string name, string imageUrl, string description, address creatorAddress, uint256 createdAt, bool exists))",
  
  // Events
  "event CreatorCreated(uint256 indexed creatorId, address indexed creator, string name)",
  "event CreatorTokensBought(uint256 indexed creatorId, address indexed buyer, uint256 amount, uint256 price, bool isFreebie, uint256 transactionId)",
  "event CreatorTokensSold(uint256 indexed creatorId, address indexed seller, uint256 amount, uint256 payout, bool isFreebie, uint256 transactionId)"
];

// Contract addresses from deployment
const CREATOR_TOKEN_ADDRESS = "0xED2752fD59d1514d905A3f11CbF99CdDFe6d69a8"; // Creator Token contract deployed on Monad testnet
const MOCK_USDC_ADDRESS = "0x44aAAEeC1A83c30Fe5784Af49E6a38D3709Ee148";

export interface CreatorTokenStats {
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

export interface CreatorPortfolio {
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

export interface CreatorData {
  creatorId: number;
  uuid: string;
  name: string;
  imageUrl: string;
  description: string;
  creatorAddress: string;
  createdAt: number;
  exists: boolean;
}

export const useCreatorToken = () => {
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
            const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
            const address = await signer.getAddress();
            
            console.log('Wallet connected:', address);
            console.log('Creator Token Contract address:', CREATOR_TOKEN_ADDRESS);
            
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
      const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
      const address = await signer.getAddress();
      
      console.log('Wallet connected successfully:', address);
      console.log('Creator Token Contract address:', CREATOR_TOKEN_ADDRESS);
      
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

  // Create creator token
  const createCreatorToken = async (
    uuid: string,
    name: string,
    imageUrl: string,
    description: string,
    freebieCount: number = 3,
    quadraticDivisor: number = 1
  ) => {
    console.log('🚀 createCreatorToken called with:', {
      uuid,
      name,
      imageUrl,
      description,
      freebieCount,
      quadraticDivisor,
      contractAddress: CREATOR_TOKEN_ADDRESS,
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
      console.log('📝 Calling contract.createCreator...');
      console.log('Contract method details:', {
        method: 'createCreator',
        params: [uuid, name, imageUrl, description, freebieCount, quadraticDivisor]
      });

      const tx = await contract.createCreator(
        uuid,
        name,
        imageUrl,
        description,
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

      return tx.hash;
    } catch (error) {
      console.error('❌ Failed to create creator token:', error);
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

  // Buy creator tokens
  const buyCreatorTokens = async (uuid: string) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.buyCreatorTokensByUuid(uuid);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to buy creator tokens:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sell creator tokens
  const sellCreatorTokens = async (uuid: string, amount: number) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.sellCreatorTokensByUuid(uuid, amount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to sell creator tokens:', error);
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
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 price`);
        return 0;
      }

      const price = await contract.getCurrentPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get current price:', error);
      return 0;
    }
  };

  // Get actual price
  const getActualPrice = async (uuid: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 actual price`);
        return 0;
      }

      const price = await contract.getActualPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Failed to get actual price:', error);
      return 0;
    }
  };

  // Get creator stats
  const getCreatorStats = async (uuid: string): Promise<CreatorTokenStats | null> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning null stats`);
        return null;
      }

      const stats = await contract.getCreatorStatsByUuid(uuid);
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
      console.error('Failed to get creator stats:', error);
      return null;
    }
  };

  // Get user portfolio
  const getUserPortfolio = async (uuid: string, userAddress: string): Promise<CreatorPortfolio | null> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const portfolio = await contract.getUserCreatorPortfolioByUuid(uuid, userAddress);
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
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 freebies`);
        return 0;
      }

      const freebies = await contract.getRemainingFreebiesByUuid(uuid);
      return Number(freebies);
    } catch (error) {
      console.error('Failed to get remaining freebies:', error);
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
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning false for freebie eligibility`);
        return false;
      }

      console.log(`Checking freebie eligibility for user ${userAddress} on creator ${uuid}`);
      const canClaim = await contract.canClaimFreebieByUuid(uuid, userAddress);
      console.log(`User ${userAddress} can claim freebie on creator ${uuid}:`, canClaim);
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

  // Check if creator exists
  const checkCreatorExists = async (uuid: string): Promise<boolean> => {
    console.log(`🔍 checkCreatorExists called for creator: ${uuid}`);
    console.log(`Contract status:`, { 
      hasContract: !!contract, 
      contractAddress: CREATOR_TOKEN_ADDRESS,
      hasSigner: !!signer,
      userAddress: address
    });
    
    if (!contract) {
      console.log('❌ No contract available for checking creator existence');
      return false;
    }

    try {
      console.log(`📞 Calling contract.doesUuidExist(${uuid})...`);
      const exists = await contract.doesUuidExist(uuid);
      console.log(`✅ Contract response - Creator ${uuid} exists:`, exists);
      return exists;
    } catch (error) {
      console.error('❌ Failed to check if creator exists:', error);
      console.error('Error details:', {
        uuid,
        contractAddress: CREATOR_TOKEN_ADDRESS,
        error: error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorReason: error?.reason,
        errorData: error?.data
      });
      
      // If the call fails, assume the creator doesn't exist
      return false;
    }
  };

  // Get creator data
  const getCreatorData = async (uuid: string): Promise<CreatorData | null> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning null data`);
        return null;
      }

      const creator = await contract.getCreatorByUuid(uuid);
      return {
        creatorId: Number(creator.creatorId),
        uuid: creator.uuid,
        name: creator.name,
        imageUrl: creator.imageUrl,
        description: creator.description,
        creatorAddress: creator.creatorAddress,
        createdAt: Number(creator.createdAt),
        exists: creator.exists
      };
    } catch (error) {
      console.error('Failed to get creator data:', error);
      return null;
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
    createCreatorToken,
    buyCreatorTokens,
    sellCreatorTokens,
    getCurrentPrice,
    getActualPrice,
    getCreatorStats,
    getUserPortfolio,
    getRemainingFreebies,
    canClaimFreebie,
    checkCreatorExists,
    getCreatorData
  };
};

