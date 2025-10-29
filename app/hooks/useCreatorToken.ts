"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWalletContext } from '@/context/WalletContext';

// Contract ABI for Creator Token
const CREATOR_TOKEN_ABI = [
  // Create creator with UUID (freebieCount is now fixed at 50)
  "function createCreator(string memory uuid, string memory name, string memory imageUrl, string memory description, uint256 _quadraticDivisor) external returns (string memory)",
  
  // Buy/Sell functions with multi-token support
  "function buyCreatorTokensByUuid(string memory uuid, uint256 amount) external",
  "function sellCreatorTokensByUuid(string memory uuid, uint256 amount) external",
  
  // View functions
  "function getCurrentPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getActualPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getBuyPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getSellPriceByUuid(string memory uuid) external view returns (uint256)",
  "function getFreebieSellPriceByUuid(string memory uuid) external view returns (uint256)",
  
  // Multi-token pricing functions
  "function getBuyPriceForAmountByUuid(string memory uuid, uint256 amount) external view returns (uint256)",
  "function getSellPayoutForAmountByUuid(string memory uuid, uint256 amount) external view returns (uint256)",
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
const CREATOR_TOKEN_ADDRESS = "0xDfd05ed372C5eD9f7aaD54A5A2d5A5c94a99f5fb";
const MOCK_USDC_ADDRESS = "0xCADCa295a223E3DA821a243520df8e2a302C9840";

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
      
      const setupContract = async () => {
        try {
          const contract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
          const signerAddress = await signer.getAddress();
          console.log('🔍 Contract creation details:', {
            contractAddress: CREATOR_TOKEN_ADDRESS,
            hasContract: !!contract,
            abiLength: CREATOR_TOKEN_ABI.length,
            signerAddress: signerAddress,
            providerNetwork: signer.provider ? 'has provider' : 'no provider'
          });
          
          // CRITICAL: Test contract immediately and synchronously
          console.log('🚨 CRITICAL: Testing contract immediately...');
          try {
            const syncTestResult = await contract.doesUuidExist('test-creator-1760362456338');
            console.log('🚨 CRITICAL: Sync test result:', syncTestResult);
            
            const syncUserResult = await contract.doesUuidExist('3c585066-ccba-475d-8c32-9e6a8997c503');
            console.log('🚨 CRITICAL: Sync user UUID result:', syncUserResult);
            
            if (syncTestResult && !syncUserResult) {
              console.log('🚨 CRITICAL: Known UUID works but user UUID fails - this is the issue!');
            }
            
            // CRITICAL: Test with fresh contract instance
            console.log('🚨 CRITICAL: Testing with fresh contract instance...');
            const freshContract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
            const freshTestResult = await freshContract.doesUuidExist('test-creator-1760362456338');
            const freshUserResult = await freshContract.doesUuidExist('3c585066-ccba-475d-8c32-9e6a8997c503');
            console.log('🚨 CRITICAL: Fresh contract test result:', freshTestResult);
            console.log('🚨 CRITICAL: Fresh contract user UUID result:', freshUserResult);
            
          } catch (syncError) {
            console.log('🚨 CRITICAL: Sync test error:', syncError.message);
          }
          
          setContract(contract);
          console.log('✅ Contract state updated');
          
        } catch (error) {
          console.error('❌ Error creating contract:', error);
        }
      };
      
      setupContract();
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

  // Switch to Monad testnet
  const switchToMonadTestnet = async () => {
    if (window.ethereum) {
      try {
        console.log('Switching to Monad testnet...');
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2797' }], // 10143 in hex
        });
        console.log('✅ Switched to Monad testnet');
      } catch (switchError: any) {
        // If the chain doesn't exist, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x2797', // 10143 in hex
                chainName: 'Monad Testnet',
                nativeCurrency: {
                  name: 'Monad',
                  symbol: 'MON',
                  decimals: 18,
                },
                rpcUrls: ['https://testnet-rpc.monad.xyz'],
                blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
              }],
            });
            console.log('✅ Added and switched to Monad testnet');
          } catch (addError) {
            console.error('Failed to add Monad testnet:', addError);
            throw addError;
          }
        } else {
          console.error('Failed to switch to Monad testnet:', switchError);
          throw switchError;
        }
      }
    } else {
      throw new Error('MetaMask not found');
    }
  };

  // Disconnect wallet using global wallet context
  const disconnectWallet = () => {
    setContract(null);
    disconnect();
  };

  // Create creator token (freebieCount is now fixed at 50)
  const createCreatorToken = async (
    uuid: string,
    name: string,
    imageUrl: string,
    description: string,
    quadraticDivisor: number = 1,
    userId?: string
  ) => {
    console.log('🚀 createCreatorToken called with:', {
      uuid,
      name,
      imageUrl,
      description,
      freebieCount: 50, // Fixed at 50 for creator tokens
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
      if (!contract) {
        throw new Error('Contract not connected');
      }

      console.log('📝 Calling contract.createCreator...');
      console.log('Contract method details:', {
        method: 'createCreator',
        params: [uuid, name, imageUrl, description, quadraticDivisor]
      });

      const tx = await contract.createCreator(
        uuid,
        name,
        imageUrl,
        description,
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

      // Create creator token in backend database
      try {
        const { tokenApiService } = await import('@/app/lib/tokenApi');
        const backendResponse = await tokenApiService.createCreatorToken({
          uuid: uuid, // Pass the same UUID used for blockchain
          name: name,
          image_url: imageUrl,
          description: description,
          creator_address: address!,
          user_id: userId, // Pass user ID for updating creator_token_uuid field
          freebie_count: 50, // Fixed at 50 for creator tokens
          quadratic_divisor: quadraticDivisor
        });
        
        if (backendResponse.success) {
          console.log('✅ Creator token created in backend database:', backendResponse.data?.uuid);
        } else {
          console.error('❌ Failed to create creator token in backend:', backendResponse.message);
        }
      } catch (apiError) {
        console.error('❌ Failed to create creator token in backend database:', apiError);
        // Don't throw here - blockchain transaction succeeded, backend is optional
      }

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

  // Buy creator tokens (now supports multi-token buying)
  const buyCreatorTokens = async (uuid: string, amount: number = 1, buyerUserId?: string) => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      // First, get the total price for the amount to determine required USDC amount
      const totalPrice = await getBuyPriceForAmount(uuid, amount);
      console.log(`Total price for buying ${amount} creator tokens:`, totalPrice);
      
      // Check and approve USDC allowance
      await checkAndApproveUSDC(totalPrice);
      
      // Now proceed with the purchase
      const tx = await contract.buyCreatorTokensByUuid(uuid, amount);
      const receipt = await tx.wait();
      
      // Check if this was a freebie transaction by looking for FreebieClaimed event
      let isFreebie = false;
      let actualPrice = totalPrice / amount; // Price per token
      let actualTotalCost = totalPrice;
      
      if (receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === 'FreebieClaimed') {
              isFreebie = true;
              actualPrice = 0;
              actualTotalCost = 0;
              console.log('🎁 Creator token freebie transaction detected!');
              break;
            } else if (parsedLog && parsedLog.name === 'CreatorTokensBought') {
              // Check if CreatorTokensBought event indicates it was a freebie
              const eventArgs = parsedLog.args;
              if (eventArgs && eventArgs.isFreebie === true) {
                isFreebie = true;
                actualPrice = 0;
                actualTotalCost = 0;
                console.log('🎁 Creator token freebie transaction detected via CreatorTokensBought event!');
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
        
        await tokenApiService.recordCreatorTokenTransaction({
          user_address: address!,
          buyer_user_id: buyerUserId,
          creator_token_uuid: uuid,
          transaction_type: 'BUY',
          amount: amount,
          price_per_token: actualPrice,
          total_cost: actualTotalCost,
          tx_hash: tx.hash,
          block_number: receipt.blockNumber,
          gas_used: Number(receipt.gasUsed?.toString() || '0'),
          gas_price: Number(receipt.gasPrice?.toString() || '0'),
          is_freebie: isFreebie,
          fees_paid: 0
        });
        console.log('✅ Creator token transaction recorded in backend database', { isFreebie, actualPrice, actualTotalCost });
      } catch (apiError) {
        console.error('❌ Failed to record creator token transaction in backend:', apiError);
        // Transaction still succeeded on blockchain, but not recorded in backend
      }
      
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
      // Get current price for recording
      const currentPrice = await getCurrentPrice(uuid);
      
      const tx = await contract.sellCreatorTokensByUuid(uuid, amount);
      const receipt = await tx.wait();
      
      // Record transaction in backend database
      try {
        const { tokenApiService } = await import('@/app/lib/tokenApi');
        await tokenApiService.recordCreatorTokenTransaction({
          user_address: address!,
          creator_token_uuid: uuid,
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
        console.log('✅ Creator token transaction recorded in backend database');
      } catch (apiError) {
        console.error('❌ Failed to record creator token transaction in backend:', apiError);
        // Transaction still succeeded on blockchain, but not recorded in backend
      }
      
      return tx.hash;
    } catch (error) {
      console.error('Failed to sell creator tokens:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get current price
  const getCurrentPrice = useCallback(async (uuid: string): Promise<number> => {
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
  }, [contract]);

  // Get actual price
  const getActualPrice = useCallback(async (uuid: string): Promise<number> => {
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
  }, [contract]);

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

  // Helper function removed - using contract state directly

  // Check if creator exists by trying to get creator details directly
  const checkCreatorExists = useCallback(async (uuid: string): Promise<boolean> => {
    console.log(`🔍 checkCreatorExists called for creator: ${uuid}`);
    
    console.log(`Contract status:`, { 
      hasContract: !!contract, 
      contractAddress: CREATOR_TOKEN_ADDRESS,
      hasSigner: !!signer,
      userAddress: address,
      isConnected
    });
    
    if (!signer || !address) {
      console.log('❌ No signer or address available for checking creator existence');
      return false;
    }

    // CRITICAL: Always use a fresh contract instance to avoid corruption
    console.log('🚨 CRITICAL: Creating fresh contract instance for checkCreatorExists...');
    const freshContract = new ethers.Contract(CREATOR_TOKEN_ADDRESS, CREATOR_TOKEN_ABI, signer);
    console.log('🚨 CRITICAL: Fresh contract created:', {
      address: freshContract.target,
      matches: CREATOR_TOKEN_ADDRESS === freshContract.target
    });

    try {
      // Check what network we're connected to
      if (signer && signer.provider) {
        try {
          const network = await signer.provider.getNetwork();
          console.log('🌐 Connected to network:', {
            name: network.name,
            chainId: network.chainId.toString(),
            chainIdHex: `0x${network.chainId.toString(16)}`,
            expectedChainId: '10143',
            isMonadTestnet: network.chainId.toString() === '10143'
          });
          
          // If not on Monad testnet, try to switch
          if (network.chainId.toString() !== '10143') {
            console.log('⚠️ Not on Monad testnet, attempting to switch...');
            await switchToMonadTestnet();
          }
        } catch (networkError) {
          console.log('⚠️ Could not get network info:', networkError.message);
        }
      }
      
      console.log('📞 Trying to get creator details directly for UUID:', uuid);
      
      // CRITICAL: Test fresh contract with doesUuidExist first
      console.log('🚨 CRITICAL: Testing fresh contract with doesUuidExist...');
      try {
        const uuidExists = await freshContract.doesUuidExist(uuid);
        console.log('🚨 CRITICAL: Fresh contract doesUuidExist result:', uuidExists);
        
        if (uuidExists) {
          console.log('🚨 CRITICAL: Fresh contract says TRUE - creator should exist!');
          return true; // If doesUuidExist returns true, creator exists
        } else {
          console.log('🚨 CRITICAL: Fresh contract says FALSE - creator should not exist!');
          return false; // If doesUuidExist returns false, creator doesn't exist
        }
      } catch (uuidError) {
        console.log('🚨 CRITICAL: Fresh contract doesUuidExist error:', uuidError.message);
        
        // If doesUuidExist fails, try getCreatorByUuid as fallback
        console.log('📞 Fallback: Trying to get creator details directly for UUID:', uuid);
        
        try {
          const creatorDetails = await freshContract.getCreatorByUuid(uuid);
          console.log('✅ Creator details retrieved:', creatorDetails);
        
          // Check if we got valid data
          if (creatorDetails && creatorDetails.length > 0) {
            console.log('✅ Creator exists - got valid details:', {
              creatorId: creatorDetails[0].toString(),
              uuid: creatorDetails[1],
              name: creatorDetails[2],
              imageUrl: creatorDetails[3],
              description: creatorDetails[4],
              creatorAddress: creatorDetails[5],
              quadraticDivisor: creatorDetails[6].toString(),
              totalSupply: creatorDetails[7].toString(),
              freebieCount: creatorDetails[8].toString(),
              freebiesClaimed: creatorDetails[9].toString(),
              payingBuyers: creatorDetails[10].toString(),
              exists: creatorDetails[11]
            });
            return true;
          } else {
            console.log('❌ Creator details empty or invalid');
            return false;
          }
        } catch (getDetailsError: any) {
          console.log('❌ Failed to get creator details:', getDetailsError.message);
          
          // If it's a "not found" error, creator doesn't exist
          if (getDetailsError.message.includes('not found') || 
              getDetailsError.message.includes('Creator with this UUID not found') ||
              getDetailsError.reason === 'Creator with this UUID not found') {
            console.log('✅ Confirmed: Creator does not exist');
            return false;
          }
          
          // For other errors, log and return false
          console.log('❌ Unexpected error getting creator details:', getDetailsError);
          return false;
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error checking creator existence:', error);
      console.log('Error details:', {
        message: error.message,
        code: error.code,
        reason: error.reason,
        data: error.data
      });
      
      return false;
    }
  }, [contract, signer, address, isConnected]);

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

  // Get buy price
  const getBuyPrice = async (uuid: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 buy price`);
        return 0;
      }

      const price = await contract.getBuyPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get buy price:', error);
      return 0;
    }
  };

  // Get sell price
  const getSellPrice = async (uuid: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 sell price`);
        return 0;
      }

      const price = await contract.getSellPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get sell price:', error);
      return 0;
    }
  };

  // Get buy price for multiple tokens
  const getBuyPriceForAmount = useCallback(async (uuid: string, amount: number): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 buy price`);
        return 0;
      }

      const price = await contract.getBuyPriceForAmountByUuid(uuid, amount);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get buy price for amount:', error);
      return 0;
    }
  }, [contract]);

  // Get sell payout for multiple tokens
  const getSellPayoutForAmount = useCallback(async (uuid: string, amount: number): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 sell payout`);
        return 0;
      }

      const payout = await contract.getSellPayoutForAmountByUuid(uuid, amount);
      return parseFloat(ethers.formatUnits(payout, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get sell payout for amount:', error);
      return 0;
    }
  }, [contract]);

  // Get freebie sell price
  const getFreebieSellPrice = async (uuid: string): Promise<number> => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      const exists = await contract.doesUuidExist(uuid);
      if (!exists) {
        console.log(`Creator ${uuid} does not exist, returning 0 freebie sell price`);
        return 0;
      }

      const price = await contract.getFreebieSellPriceByUuid(uuid);
      return parseFloat(ethers.formatUnits(price, 6)); // Convert from wei to USDC
    } catch (error) {
      console.error('Failed to get freebie sell price:', error);
      return 0;
    }
  };

  // Distribute fees
  const distributeFees = async (uuid: string): Promise<string> => {
    if (!contract || !signer) {
      throw new Error('Contract not connected');
    }

    setLoading(true);
    try {
      const tx = await contract.distributeFeesByUuid(uuid);
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
    switchToMonadTestnet,
    createCreatorToken,
    buyCreatorTokens,
    sellCreatorTokens,
    getCurrentPrice,
    getActualPrice,
    getBuyPrice,
    getSellPrice,
    getBuyPriceForAmount,
    getSellPayoutForAmount,
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

