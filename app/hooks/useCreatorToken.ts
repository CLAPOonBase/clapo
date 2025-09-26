"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletContext } from '@/context/WalletContext';

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

// ERC20 ABI for USDC approval
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function name() external view returns (string)"
];

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
  const { provider, signer, address, isConnecting, connect, disconnect } = useWalletContext();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  
  console.log('🔄 useCreatorToken hook initialized with wallet context:', { 
    hasProvider: !!provider,
    hasSigner: !!signer, 
    hasAddress: !!address, 
    isConnecting 
  });
  
  // Derive isConnected from global wallet context
  const isConnected = !!signer && !!address;

  // Update contract when wallet connection changes
  useEffect(() => {
    console.log('🔄 useCreatorToken useEffect triggered:', { 
      hasSigner: !!signer, 
      hasAddress: !!address, 
      signer, 
      address 
    });
    
    if (signer && address) {
      console.log('✅ Setting up Creator Token contract with global wallet context');
      console.log('Wallet connected:', address);
      console.log('Creator Token Contract address:', CREATOR_TOKEN_ADDRESS);
      
      try {
        const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
        console.log('✅ Contract created successfully:', contract);
        setContract(contract);
        console.log('✅ Contract state updated');
      } catch (error) {
        console.error('❌ Error creating contract:', error);
      }
    } else {
      console.log('❌ No wallet connection - clearing contract');
      setContract(null);
    }
  }, [signer, address]);

  // Force contract setup if we have signer and address but no contract
  useEffect(() => {
    if (signer && address && !contract) {
      console.log('🔄 Force setting up contract - we have signer and address but no contract');
      try {
        const newContract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
        console.log('✅ Force contract created successfully:', newContract);
        setContract(newContract);
      } catch (error) {
        console.error('❌ Error in force contract creation:', error);
      }
    }
  }, [signer, address, contract]);

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
      const currentContract = getContract();
      if (!currentContract) {
        throw new Error('Contract not connected');
      }

      console.log('📝 Calling contract.createCreator...');
      console.log('Contract method details:', {
        method: 'createCreator',
        params: [uuid, name, imageUrl, description, freebieCount, quadraticDivisor]
      });

      const tx = await currentContract.createCreator(
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
      const currentAllowance = await usdcContract.allowance(address, CREATOR_TOKEN_ADDRESS);
      const requiredAllowance = ethers.parseUnits(requiredAmount.toString(), 6); // USDC has 6 decimals
      
      console.log('USDC Allowance Check:', {
        currentAllowance: ethers.formatUnits(currentAllowance, 6),
        requiredAllowance: ethers.formatUnits(requiredAllowance, 6),
        needsApproval: currentAllowance < requiredAllowance
      });

      // If allowance is insufficient, approve
      if (currentAllowance < requiredAllowance) {
        console.log('Approving USDC allowance...');
        const approveTx = await usdcContract.approve(CREATOR_TOKEN_ADDRESS, requiredAllowance);
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

  // Buy creator tokens
  const buyCreatorTokens = async (uuid: string) => {
    const currentContract = getContract();
    if (!currentContract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      // First, get the current price to determine required USDC amount
      const currentPrice = await getCurrentPrice(uuid);
      console.log('Current price for buying creator tokens:', currentPrice);
      
      // Check and approve USDC allowance
      await checkAndApproveUSDC(currentPrice);
      
      // Now proceed with the purchase
      const tx = await currentContract.buyCreatorTokensByUuid(uuid);
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
    const currentContract = getContract();
    if (!currentContract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await currentContract.sellCreatorTokensByUuid(uuid, amount);
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
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 price`);
        return 0;
      }

      const price = await currentContract.getCurrentPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get current price:', error);
      return 0;
    }
  };

  // Get actual price
  const getActualPrice = async (uuid: string): Promise<number> => {
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 actual price`);
        return 0;
      }

      const price = await currentContract.getActualPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Failed to get actual price:', error);
      return 0;
    }
  };

  // Get creator stats
  const getCreatorStats = async (uuid: string): Promise<CreatorTokenStats | null> => {
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning null stats`);
        return null;
      }

      const stats = await currentContract.getCreatorStatsByUuid(uuid);
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
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const portfolio = await currentContract.getUserCreatorPortfolioByUuid(uuid, userAddress);
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
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 freebies`);
        return 0;
      }

      const freebies = await currentContract.getRemainingFreebiesByUuid(uuid);
      return Number(freebies);
    } catch (error) {
      console.error('Failed to get remaining freebies:', error);
      return 0;
    }
  };

  // Check if user can claim freebie
  const canClaimFreebie = async (uuid: string, userAddress: string): Promise<boolean> => {
    const currentContract = getContract();
    if (!currentContract) {
      console.log('No contract available for checking freebie eligibility');
      return false;
    }

    if (!userAddress) {
      console.log('No user address provided for checking freebie eligibility');
      return false;
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning false for freebie eligibility`);
        return false;
      }

      console.log(`Checking freebie eligibility for user ${userAddress} on creator ${uuid}`);
      const canClaim = await currentContract.canClaimFreebieByUuid(uuid, userAddress);
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

  // Helper function to get or create contract
  const getContract = (): ethers.Contract | null => {
    if (contract) {
      return contract;
    }
    
    if (signer && address) {
      console.log('🔧 Creating contract on-demand');
      try {
        const newContract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
        setContract(newContract); // Update state for future calls
        return newContract;
      } catch (error) {
        console.error('❌ Error creating contract on-demand:', error);
        return null;
      }
    }
    
    return null;
  };

  // Check if creator exists
  const checkCreatorExists = async (uuid: string): Promise<boolean> => {
    console.log(`🔍 checkCreatorExists called for creator: ${uuid}`);
    
    const currentContract = getContract();
    console.log(`Contract status:`, { 
      hasContract: !!currentContract, 
      contractAddress: CREATOR_TOKEN_ADDRESS,
      hasSigner: !!signer,
      userAddress: address,
      isConnected
    });
    
    if (!currentContract) {
      console.log('❌ No contract available for checking creator existence');
      return false;
    }

    try {
      console.log(`📞 Calling contract.doesUuidExist(${uuid})...`);
      const exists = await currentContract.doesUuidExist(uuid);
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
      
      // Check if it's a network-related error
      if (error?.code === 'CALL_EXCEPTION' || error?.message?.includes('missing revert data')) {
        console.log('🌐 Network error detected - wallet may not be connected to Monad testnet');
        console.log('💡 User should connect wallet to Monad testnet to check token existence');
      }
      
      // If the call fails due to network issues, return false
      // This prevents the UI from breaking when wallet is not connected to the right network
      return false;
    }
  };

  // Get creator data
  const getCreatorData = async (uuid: string): Promise<CreatorData | null> => {
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning null data`);
        return null;
      }

      const creator = await currentContract.getCreatorByUuid(uuid);
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

  // Get buy price
  const getBuyPrice = async (uuid: string): Promise<number> => {
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 buy price`);
        return 0;
      }

      const price = await currentContract.getBuyPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get buy price:', error);
      return 0;
    }
  };

  // Get sell price
  const getSellPrice = async (uuid: string): Promise<number> => {
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 sell price`);
        return 0;
      }

      const price = await currentContract.getSellPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get sell price:', error);
      return 0;
    }
  };

  // Get freebie sell price
  const getFreebieSellPrice = async (uuid: string): Promise<number> => {
    const currentContract = getContract();
    if (!currentContract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await currentContract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 freebie sell price`);
        return 0;
      }

      const price = await currentContract.getFreebieSellPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get freebie sell price:', error);
      return 0;
    }
  };

  // Distribute fees
  const distributeFees = async (uuid: string): Promise<string> => {
    const currentContract = getContract();
    if (!currentContract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await currentContract.distributeFeesByUuid(uuid);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error('Failed to distribute fees:', error);
      throw error;
    } finally {
      setLoading(false);
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
    getBuyPrice,
    getSellPrice,
    getFreebieSellPrice,
    getCreatorStats,
    getUserPortfolio,
    getRemainingFreebies,
    canClaimFreebie,
    checkCreatorExists,
    getCreatorData,
    distributeFees,
    checkUSDCBalance,
    checkAndApproveUSDC
  };
};

