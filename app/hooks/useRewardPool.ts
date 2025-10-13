"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletContext } from '@/context/WalletContext';

// RewardPool Contract ABI
const REWARD_POOL_ABI = [
  // Core functions
  "function registerPostUuid(uint256 postId, string memory uuid) external",
  "function registerCreatorUuid(uint256 creatorId, string memory uuid) external",
  "function depositPostRewardPool(uint256 postId, uint256 amount) external",
  "function depositCreatorRewardPool(uint256 creatorId, uint256 amount) external",
  
  // Query functions
  "function getPostRewardPoolBalance(uint256 postId) external view returns (uint256)",
  "function getCreatorRewardPoolBalance(uint256 creatorId) external view returns (uint256)",
  "function getPostRewardPoolBalanceByUuid(string memory uuid) external view returns (uint256)",
  "function getCreatorRewardPoolBalanceByUuid(string memory uuid) external view returns (uint256)",
  
  // Bulk query functions
  "function getAllPostRewardPoolBalances() external view returns (uint256[] memory postIds, uint256[] memory balances)",
  "function getAllCreatorRewardPoolBalances() external view returns (uint256[] memory creatorIds, uint256[] memory balances)",
  "function getAllPostRewardPoolBalancesWithUuids() external view returns (uint256[] memory postIds, string[] memory uuids, uint256[] memory balances)",
  "function getAllCreatorRewardPoolBalancesWithUuids() external view returns (uint256[] memory creatorIds, string[] memory uuids, uint256[] memory balances)",
  
  // Statistics functions
  "function getCombinedRewardPoolInfo() external view returns (uint256 totalBalance, uint256 postCount, uint256 creatorCount)",
  "function getRewardPoolStatistics() external view returns (uint256 totalPosts, uint256 totalCreators, uint256 totalRewardPool, uint256 contractBalance)",
  "function getTotalRewardPoolBalance() external view returns (uint256)",
  "function getContractBalance() external view returns (uint256)",
  
  // Admin functions
  "function owner() external view returns (address)",
  "function withdrawPostRewardPool(uint256 postId, uint256 amount, address to) external",
  "function withdrawCreatorRewardPool(uint256 creatorId, uint256 amount, address to) external",
  "function transferPostRewardPool(uint256 fromPostId, uint256 toPostId, uint256 amount) external",
  "function transferCreatorRewardPool(uint256 fromCreatorId, uint256 toCreatorId, uint256 amount) external",
  "function emergencyWithdraw(uint256 amount, address to) external"
];

// Contract addresses from deployment
const REWARD_POOL_ADDRESS = "0xF942be9969AE075594372c8e3f002Fa05b40D186";
const MOCK_USDC_ADDRESS = "0x44aAAEeC1A83c30Fe5784Af49E6a38D3709Ee148";

export interface RewardPoolBalance {
  id: number;
  uuid?: string;
  balance: number;
}

export interface RewardPoolStats {
  totalBalance: number;
  postCount: number;
  creatorCount: number;
  contractBalance: number;
}

export interface RewardPoolDetails {
  totalPosts: number;
  totalCreators: number;
  totalRewardPool: number;
  contractBalance: number;
}

export const useRewardPool = () => {
  const { provider, signer, address, isConnecting, connect, disconnect } = useWalletContext();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);

  // Derive isConnected from global wallet context
  const isConnected = !!signer && !!address;

  // Update contract when wallet connection changes
  useEffect(() => {
    if (signer && address) {
      console.log('Setting up RewardPool contract with global wallet context');
      console.log('Wallet connected:', address);
      console.log('RewardPool Contract address:', REWARD_POOL_ADDRESS);
      
      const contract = new ethers.Contract(REWARD_POOL_ADDRESS, REWARD_POOL_ABI, signer);
      setContract(contract);
    } else {
      console.log('No wallet connection - clearing RewardPool contract');
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

  // Get post reward pool balance by UUID
  const getPostRewardPoolBalanceByUuid = async (uuid: string): Promise<number> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return 0;
    }

    try {
      const balance = await contract.getPostRewardPoolBalanceByUuid(uuid);
      return parseFloat(ethers.formatUnits(balance, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Failed to get post reward pool balance:', error);
      return 0;
    }
  };

  // Get creator reward pool balance by UUID
  const getCreatorRewardPoolBalanceByUuid = async (uuid: string): Promise<number> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return 0;
    }

    try {
      const balance = await contract.getCreatorRewardPoolBalanceByUuid(uuid);
      return parseFloat(ethers.formatUnits(balance, 6)); // USDC has 6 decimals
    } catch (error) {
      console.error('Failed to get creator reward pool balance:', error);
      return 0;
    }
  };

  // Get all post reward pool balances with UUIDs
  const getAllPostRewardPoolBalancesWithUuids = async (): Promise<RewardPoolBalance[]> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return [];
    }

    try {
      const [postIds, uuids, balances] = await contract.getAllPostRewardPoolBalancesWithUuids();
      
      const result: RewardPoolBalance[] = [];
      for (let i = 0; i < postIds.length; i++) {
        result.push({
          id: Number(postIds[i]),
          uuid: uuids[i],
          balance: parseFloat(ethers.formatUnits(balances[i], 6))
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get all post reward pool balances:', error);
      return [];
    }
  };

  // Get all creator reward pool balances with UUIDs
  const getAllCreatorRewardPoolBalancesWithUuids = async (): Promise<RewardPoolBalance[]> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return [];
    }

    try {
      const [creatorIds, uuids, balances] = await contract.getAllCreatorRewardPoolBalancesWithUuids();
      
      const result: RewardPoolBalance[] = [];
      for (let i = 0; i < creatorIds.length; i++) {
        result.push({
          id: Number(creatorIds[i]),
          uuid: uuids[i],
          balance: parseFloat(ethers.formatUnits(balances[i], 6))
        });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to get all creator reward pool balances:', error);
      return [];
    }
  };

  // Get combined reward pool info
  const getCombinedRewardPoolInfo = async (): Promise<RewardPoolStats> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return {
        totalBalance: 0,
        postCount: 0,
        creatorCount: 0,
        contractBalance: 0
      };
    }

    try {
      const [totalBalance, postCount, creatorCount] = await contract.getCombinedRewardPoolInfo();
      const contractBalance = await contract.getContractBalance();
      
      return {
        totalBalance: parseFloat(ethers.formatUnits(totalBalance, 6)),
        postCount: Number(postCount),
        creatorCount: Number(creatorCount),
        contractBalance: parseFloat(ethers.formatUnits(contractBalance, 6))
      };
    } catch (error) {
      console.error('Failed to get combined reward pool info:', error);
      return {
        totalBalance: 0,
        postCount: 0,
        creatorCount: 0,
        contractBalance: 0
      };
    }
  };

  // Get detailed reward pool statistics
  const getRewardPoolStatistics = async (): Promise<RewardPoolDetails> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return {
        totalPosts: 0,
        totalCreators: 0,
        totalRewardPool: 0,
        contractBalance: 0
      };
    }

    try {
      const [totalPosts, totalCreators, totalRewardPool, contractBalance] = await contract.getRewardPoolStatistics();
      
      return {
        totalPosts: Number(totalPosts),
        totalCreators: Number(totalCreators),
        totalRewardPool: parseFloat(ethers.formatUnits(totalRewardPool, 6)),
        contractBalance: parseFloat(ethers.formatUnits(contractBalance, 6))
      };
    } catch (error) {
      console.error('Failed to get reward pool statistics:', error);
      return {
        totalPosts: 0,
        totalCreators: 0,
        totalRewardPool: 0,
        contractBalance: 0
      };
    }
  };

  // Get total reward pool balance
  const getTotalRewardPoolBalance = async (): Promise<number> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return 0;
    }

    try {
      const balance = await contract.getTotalRewardPoolBalance();
      return parseFloat(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error('Failed to get total reward pool balance:', error);
      return 0;
    }
  };

  // Get contract balance
  const getContractBalance = async (): Promise<number> => {
    if (!contract) {
      console.log('RewardPool contract not connected');
      return 0;
    }

    try {
      const balance = await contract.getContractBalance();
      return parseFloat(ethers.formatUnits(balance, 6));
    } catch (error) {
      console.error('Failed to get contract balance:', error);
      return 0;
    }
  };

  // Check if contract is owner (for admin functions)
  const isOwner = async (): Promise<boolean> => {
    if (!contract || !address) {
      return false;
    }

    try {
      const owner = await contract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Failed to check owner status:', error);
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
    getPostRewardPoolBalanceByUuid,
    getCreatorRewardPoolBalanceByUuid,
    getAllPostRewardPoolBalancesWithUuids,
    getAllCreatorRewardPoolBalancesWithUuids,
    getCombinedRewardPoolInfo,
    getRewardPoolStatistics,
    getTotalRewardPoolBalance,
    getContractBalance,
    isOwner
  };
};


