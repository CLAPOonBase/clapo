import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract addresses
const SNAPS_SHARES_ADDRESS = '0xc5CB9f650f99941A8bF9947824A6Ae48Bb957f89';
const MOCK_USDC_ADDRESS = '0x44aAAEeC1A83c30Fe5784Af49E6a38D3709Ee148';

// Contract ABI (simplified for the interface)
const SNAPS_SHARES_ABI = [
  // View functions
  'function getStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool)',
  'function getPricingInfo() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)',
  'function getUserPortfolio(address user) external view returns (uint256, uint256, uint256, uint256, uint256, bool, uint256, uint256, uint256)',
  'function getUserTransactions(address user, uint256 offset, uint256 limit) external view returns (tuple(address user, bool isBuy, uint256 amount, uint256 price, uint256 timestamp, bool isFreebie, uint256 feesPaid)[])',
  'function getCurrentPrice() external view returns (uint256)',
  'function getFreebieSellPrice() external view returns (uint256)',
  'function getRemainingFreebies() external view returns (uint256)',
  'function canClaimFreebie(address user) external view returns (bool)',
  'function getUserProfitLoss(address user) external view returns (int256, int256, uint256, uint256)',
  'function getMarketStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool, uint256, uint256)',
  'function getLiquidityInfo() external view returns (uint256, uint256, uint256, uint256, uint256, bool)',
  
  // Write functions
  'function buy() external',
  'function sell(uint256 amount) external',
  'function distributeFees() external',
  
  // Events
  'event SharesBought(address indexed user, uint256 amount, uint256 price, bool isFreebie, uint256 transactionId)',
  'event SharesSold(address indexed user, uint256 amount, uint256 payout, bool isFreebie, uint256 transactionId)',
  'event FreebieClaimed(address indexed user, uint256 transactionId)',
];

const MOCK_USDC_ABI = [
  'function balanceOf(address owner) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
];

export interface SnapsSharesStats {
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

export interface Transaction {
  user: string;
  isBuy: boolean;
  amount: number;
  price: number;
  timestamp: number;
  isFreebie: boolean;
  feesPaid: number;
}

export interface ProfitLoss {
  totalProfitLoss: number;
  profitLossPercentage: number;
  totalInvested: number;
  currentValue: number;
}

export function useSnapsShares() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [usdcContract, setUsdcContract] = useState<ethers.Contract | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Contract state
  const [stats, setStats] = useState<SnapsSharesStats | null>(null);
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(SNAPS_SHARES_ADDRESS, SNAPS_SHARES_ABI, signer);
      const usdcContract = new ethers.Contract(MOCK_USDC_ADDRESS, MOCK_USDC_ABI, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setUsdcContract(usdcContract);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Load initial data
      await loadContractData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      console.error('Wallet connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load contract data
  const loadContractData = async () => {
    if (!contract || !account) return;

    try {
      setLoading(true);
      
      // Load stats
      const statsData = await contract.getStats();
      setStats({
        totalBuyers: Number(statsData[0]),
        payingBuyers: Number(statsData[1]),
        freebieClaimed: Number(statsData[2]),
        currentPrice: parseFloat(ethers.formatUnits(statsData[3], 6)),
        highestPrice: parseFloat(ethers.formatUnits(statsData[4], 6)),
        rewardPoolBalance: parseFloat(ethers.formatUnits(statsData[5], 6)),
        creatorFeeBalance: parseFloat(ethers.formatUnits(statsData[6], 6)),
        platformFeeBalance: parseFloat(ethers.formatUnits(statsData[7], 6)),
        liability: parseFloat(ethers.formatUnits(statsData[8], 6)),
        breakEven: statsData[9],
      });

      // Load portfolio
      const portfolioData = await contract.getUserPortfolio(account);
      setPortfolio({
        balance: Number(portfolioData[0]),
        totalBought: Number(portfolioData[1]),
        totalSold: Number(portfolioData[2]),
        totalFeesPaid: parseFloat(ethers.formatUnits(portfolioData[3], 6)),
        lastTransactionTime: Number(portfolioData[4]),
        hasFreebieFlag: portfolioData[5],
        transactionCount: Number(portfolioData[6]),
        netShares: Number(portfolioData[7]),
        currentValue: parseFloat(ethers.formatUnits(portfolioData[8], 6)),
      });

      // Load transactions
      const txData = await contract.getUserTransactions(account, 0, 20);
      setTransactions(txData.map((tx: any) => ({
        user: tx.user,
        isBuy: tx.isBuy,
        amount: Number(tx.amount),
        price: parseFloat(ethers.formatUnits(tx.price, 6)),
        timestamp: Number(tx.timestamp),
        isFreebie: tx.isFreebie,
        feesPaid: parseFloat(ethers.formatUnits(tx.feesPaid, 6)),
      })));

      // Load profit/loss
      const plData = await contract.getUserProfitLoss(account);
      setProfitLoss({
        totalProfitLoss: parseFloat(ethers.formatUnits(plData[0], 6)),
        profitLossPercentage: Number(plData[1]),
        totalInvested: parseFloat(ethers.formatUnits(plData[2], 6)),
        currentValue: parseFloat(ethers.formatUnits(plData[3], 6)),
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contract data');
      console.error('Contract data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Buy shares
  const buyShares = async () => {
    if (!contract || !usdcContract) {
      throw new Error('Contract not connected');
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user can claim freebie
      const canClaimFreebie = await contract.canClaimFreebie(account);
      
      if (canClaimFreebie) {
        // Freebie - no USDC needed
        const tx = await contract.buy();
        await tx.wait();
      } else {
        // Paid purchase - need USDC
        const currentPrice = await contract.getCurrentPrice();
        const allowance = await usdcContract.allowance(account, SNAPS_SHARES_ADDRESS);
        
        if (allowance < currentPrice) {
          // Approve USDC spending
          const approveTx = await usdcContract.approve(SNAPS_SHARES_ADDRESS, currentPrice);
          await approveTx.wait();
        }
        
        const tx = await contract.buy();
        await tx.wait();
      }

      // Reload data
      await loadContractData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy shares');
      console.error('Buy shares error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sell shares
  const sellShares = async (amount: number) => {
    if (!contract) {
      throw new Error('Contract not connected');
    }

    try {
      setLoading(true);
      setError(null);

      const tx = await contract.sell(amount);
      await tx.wait();

      // Reload data
      await loadContractData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sell shares');
      console.error('Sell shares error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user can claim freebie
  const checkCanClaimFreebie = async (): Promise<boolean> => {
    if (!contract || !account) return false;
    
    try {
      return await contract.canClaimFreebie(account);
    } catch (err) {
      console.error('Error checking freebie eligibility:', err);
      return false;
    }
  };

  // Get remaining freebies
  const getRemainingFreebies = async (): Promise<number> => {
    if (!contract) return 0;
    
    try {
      const remaining = await contract.getRemainingFreebies();
      return Number(remaining);
    } catch (err) {
      console.error('Error getting remaining freebies:', err);
      return 0;
    }
  };

  // Get current price
  const getCurrentPrice = async (): Promise<number> => {
    if (!contract) return 0;
    
    try {
      const price = await contract.getCurrentPrice();
      return parseFloat(ethers.formatUnits(price, 6));
    } catch (err) {
      console.error('Error getting current price:', err);
      return 0;
    }
  };

  // Get freebie sell price
  const getFreebieSellPrice = async (): Promise<number> => {
    if (!contract) return 0;
    
    try {
      const price = await contract.getFreebieSellPrice();
      return parseFloat(ethers.formatUnits(price, 6));
    } catch (err) {
      console.error('Error getting freebie sell price:', err);
      return 0;
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      loadContractData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, contract, account]);

  return {
    // Connection state
    isConnected,
    account,
    loading,
    error,
    
    // Contract data
    stats,
    portfolio,
    transactions,
    profitLoss,
    
    // Actions
    connectWallet,
    buyShares,
    sellShares,
    loadContractData,
    checkCanClaimFreebie,
    getRemainingFreebies,
    getCurrentPrice,
    getFreebieSellPrice,
  };
}




