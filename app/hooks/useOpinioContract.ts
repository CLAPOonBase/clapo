import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  initializeOpinioContract, 
  initializeOpinioContractWithMetaMask,
  getOpinioContractService,
  type MarketData,
  type OptionData,
  type PortfolioData,
  type UserPosition,
  type UserVote,
  type USDCStatus,
  type TransactionResult
} from '@/app/lib/opinioContract';

interface UseOpinioContractReturn {
  isConnected: boolean;
  walletAddress: string | null;
  networkInfo: { chainId: number; name: string } | null;
  usdcStatus: USDCStatus | null;
  marketCount: string | null;
  markets: MarketData[];
  portfolio: PortfolioData | null;
  userPositions: UserPosition[];
  userVotes: UserVote[];
  tradingSummary: {
    totalTrades: number;
    totalVolume: string;
    totalProfitLoss: string;
    winRate: string;
    avgTradeSize: string;
  } | null;
  isLoading: boolean;
  error: string | null;
  
  connect: (rpcUrl: string, privateKey: string) => Promise<void>;
  connectWithMetaMask: (provider: ethers.BrowserProvider, signer: ethers.Signer) => Promise<void>;
  disconnect: () => void;
  refreshData: () => Promise<void>;
  
  createMarket: (title: string, description: string, category: string, tags: string[], endDate: number, marketType?: number, initialLiquidity?: number, minLiquidity?: number, maxMarketSize?: number) => Promise<{ marketId: string; transaction: TransactionResult }>;
  addMarketOption: (marketId: number, optionText: string) => Promise<TransactionResult>;
  castVote: (marketId: number, prediction: number, confidence: number, amount: number) => Promise<TransactionResult>;
  buyShares: (marketId: number, amount: number, isLong: boolean, optionId: number) => Promise<TransactionResult>;
  sellShares: (marketId: number, amount: number, isLong: boolean, optionId: number) => Promise<TransactionResult>;
  approveUSDC: (amount: number) => Promise<TransactionResult>;
  
  getMarket: (marketId: number) => Promise<MarketData>;
  getOption: (marketId: number, optionId: number) => Promise<OptionData>;
  getUserPortfolio: (userAddress: string) => Promise<PortfolioData>;
}

export const useOpinioContract = (): UseOpinioContractReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{ chainId: number; name: string } | null>(null);
  const [usdcStatus, setUsdcStatus] = useState<USDCStatus | null>(null);
  const [marketCount, setMarketCount] = useState<string | null>(null);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [userPositions, setUserPositions] = useState<UserPosition[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [tradingSummary, setTradingSummary] = useState<{
    totalTrades: number;
    totalVolume: string;
    totalProfitLoss: string;
    winRate: string;
    avgTradeSize: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (rpcUrl: string, privateKey: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const service = initializeOpinioContract(rpcUrl, privateKey);
      console.log('🔗 Service initialized');
      
      const address = await service.getWalletAddress();
      console.log('📝 Wallet address:', address);
      
      const network = await service.getNetworkInfo();
      console.log('🌐 Network info:', network);
      
      const usdc = await service.checkUSDCStatus();
      console.log('💰 USDC status:', usdc);
      
      const count = await service.getMarketCount();
      console.log('📊 Market count:', count);
      
      console.log('🔄 Setting state values...');
      console.log('🔄 About to set usdcStatus:', usdc);
      setWalletAddress(address);
      setNetworkInfo(network);
      setUsdcStatus(usdc);
      setMarketCount(count);
      setIsConnected(true);
      console.log('✅ State values set - USDC Status:', usdc);
      
      // Verify the state was set correctly
      setTimeout(() => {
        console.log('⏰ State verification - usdcStatus should now be:', usdc);
      }, 100);
      
      // Now fetch markets and portfolio data
      const countNum = parseInt(count);
      if (countNum > 0) {
        const marketPromises = [];
        for (let i = 0; i < countNum; i++) {
          marketPromises.push(
            service.getMarket(i).catch(error => {
              console.warn(`⚠️ Skipping market ${i} (doesn't exist):`, error.message);
              return null; // Return null for failed markets
            })
          );
        }
        const allResults = await Promise.all(marketPromises);
        const marketData = allResults.filter(market => market !== null);
        
        console.log('🔍 Filtering markets...');
        console.log('📊 Raw market data:', marketData);
        
        const validMarkets = marketData.filter(market => 
          market.title && market.title.trim() !== '' && 
          market.description && market.description.trim() !== ''
        );
        
        console.log('✅ Valid markets after filtering:', validMarkets);
        console.log('🔄 About to set markets state:', validMarkets);
        setMarkets(validMarkets);
        console.log('✅ Markets state set');
        
              const userPortfolio = await service.getUserPortfolio(address);
      setPortfolio(userPortfolio);
      
      // Fetch user positions and votes after initial connection
      try {
        console.log('🔄 Fetching user positions and votes after connection...');
        const positions = await service.getUserPositions(address);
        console.log('📊 Initial positions loaded:', positions.length);
        setUserPositions(positions);
        
        const votes = await service.getUserVotes(address);
        console.log('🗳️ Initial votes loaded:', votes.length);
        setUserVotes(votes);
        
        const summary = await service.getUserTradingSummary(address);
        console.log('📈 Initial trading summary loaded:', summary);
        setTradingSummary({
          totalTrades: summary.totalTrades,
          totalVolume: summary.totalVolume,
          totalProfitLoss: summary.totalProfitLoss,
          winRate: summary.winRate,
          avgTradeSize: summary.avgTradeSize
        });
      } catch (dataError) {
        console.error('❌ Failed to load initial user data:', dataError);
        setUserPositions([]);
        setUserVotes([]);
        setTradingSummary(null);
      }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWithMetaMask = useCallback(async (provider: ethers.BrowserProvider, signer: ethers.Signer) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const service = initializeOpinioContractWithMetaMask(provider, signer);
      console.log('🔗 MetaMask service initialized');
      
      const address = await service.getWalletAddress();
      console.log('📝 Wallet address:', address);
      
      const network = await service.getNetworkInfo();
      console.log('🌐 Network info:', network);
      
      const usdc = await service.checkUSDCStatus();
      console.log('💰 USDC status:', usdc);
      
      const count = await service.getMarketCount();
      console.log('📊 Market count:', count);
      
      console.log('🔄 Setting state values...');
      setWalletAddress(address);
      setNetworkInfo(network);
      setUsdcStatus(usdc);
      setMarketCount(count);
      setIsConnected(true);
      console.log('✅ MetaMask connected successfully');
      
      // Now fetch markets and portfolio data
      const countNum = parseInt(count);
      if (countNum > 0) {
        const marketPromises = [];
        for (let i = 0; i < countNum; i++) {
          marketPromises.push(
            service.getMarket(i).catch(error => {
              console.warn(`⚠️ Skipping market ${i} (doesn't exist):`, error.message);
              return null; // Return null for failed markets
            })
          );
        }
        const allResults = await Promise.all(marketPromises);
        const validMarkets = allResults.filter(market => market !== null) as MarketData[];
        console.log(`📊 Loaded ${validMarkets.length} valid markets out of ${countNum} total`);
        setMarkets(validMarkets);
      }
      
      // Load user data
      try {
        const portfolio = await service.getUserPortfolio(address);
        console.log('💼 Initial portfolio loaded:', portfolio);
        setPortfolio(portfolio);

        const positions = await service.getUserPositions(address);
        console.log('📊 Initial positions loaded:', positions);
        setUserPositions(positions);

        const votes = await service.getUserVotes(address);
        console.log('🗳️ Initial votes loaded:', votes);
        setUserVotes(votes);

        const summary = await service.getUserTradingSummary(address);
        console.log('📈 Initial trading summary loaded:', summary);
        setTradingSummary({
          totalTrades: summary.totalTrades,
          totalVolume: summary.totalVolume,
          totalProfitLoss: summary.totalProfitLoss,
          winRate: summary.winRate,
          avgTradeSize: summary.avgTradeSize
        });
      } catch (dataError) {
        console.error('❌ Failed to load initial user data:', dataError);
        setUserPositions([]);
        setUserVotes([]);
        setTradingSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect with MetaMask');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setNetworkInfo(null);
    setUsdcStatus(null);
    setMarketCount(null);
    setMarkets([]);
    setPortfolio(null);
    setUserPositions([]);
    setUserVotes([]);
    setTradingSummary(null);
    setError(null);
  }, []);

  const refreshData = useCallback(async () => {
    if (!isConnected) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      if (!service) {
        console.log('⚠️ No service available in refreshData');
        return;
      }
      
      const count = await service.getMarketCount();
      setMarketCount(count);
      
      // Refresh USDC status
      console.log('🔄 Refreshing USDC status...');
      try {
        const usdc = await service.checkUSDCStatus();
        console.log('✅ USDC status updated:', usdc);
        setUsdcStatus(usdc);
      } catch (usdcError) {
        console.error('❌ Failed to refresh USDC status:', usdcError);
        // Don't update USDC status if it fails
      }
      
      const countNum = parseInt(count);
      if (countNum > 0) {
        const marketPromises = [];
        for (let i = 0; i < countNum; i++) {
          marketPromises.push(
            service.getMarket(i).catch(error => {
              console.warn(`⚠️ Skipping market ${i} during refresh (doesn't exist):`, error.message);
              return null; // Return null for failed markets
            })
          );
        }
        const allResults = await Promise.all(marketPromises);
        const marketData = allResults.filter(market => market !== null);
        
        // Filter out markets with empty titles (like market 0)
        console.log('🔍 Filtering markets...');
        console.log('📊 Raw market data:', marketData);
        
        const validMarkets = marketData.filter(market => 
          market.title && market.title.trim() !== '' && 
          market.description && market.description.trim() !== ''
        );
        
        console.log('✅ Valid markets after filtering:', validMarkets);
        setMarkets(validMarkets);
        
        if (walletAddress) {
          const userPortfolio = await service.getUserPortfolio(walletAddress);
          setPortfolio(userPortfolio);
          
          // Fetch user positions, votes, and trading summary
          try {
            console.log('🔄 Starting to fetch user positions for:', walletAddress);
            
            const positions = await service.getUserPositions(walletAddress);
            console.log('📊 getUserPositions returned:', positions.length, 'positions');
            setUserPositions(positions);
            
            const votes = await service.getUserVotes(walletAddress);
            console.log('🗳️ getUserVotes returned:', votes.length, 'votes');
            setUserVotes(votes);
            
            const summary = await service.getUserTradingSummary(walletAddress);
            console.log('📈 getUserTradingSummary returned:', summary);
            setTradingSummary({
              totalTrades: summary.totalTrades,
              totalVolume: summary.totalVolume,
              totalProfitLoss: summary.totalProfitLoss,
              winRate: summary.winRate,
              avgTradeSize: summary.avgTradeSize
            });
            
            console.log('✅ Final state - positions:', positions.length, 'votes:', votes.length);
          } catch (dataError) {
            console.error('❌ Failed to load user data:', dataError);
            console.error('❌ Error details:', dataError.stack);
            setUserPositions([]);
            setUserVotes([]);
            setTradingSummary(null);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, walletAddress]);

  const createMarket = useCallback(async (
    title: string, 
    description: string, 
    category: string = "General",
    tags: string[] = ["NEW"],
    endDate: number, 
    marketType: number = 0, 
    initialLiquidity: number = 0,
    minLiquidity: number = 0,
    maxMarketSize: number = 1000000
  ) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.createMarket(title, description, category, tags, endDate, marketType, initialLiquidity, minLiquidity, maxMarketSize);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create market';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);

  const addMarketOption = useCallback(async (marketId: number, optionText: string) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.addMarketOption(marketId, optionText);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add market option';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);

  const castVote = useCallback(async (marketId: number, prediction: number, confidence: number, amount: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.castVote(marketId, prediction, confidence, amount);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to cast vote';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);

  const buyShares = useCallback(async (marketId: number, amount: number, isLong: boolean, optionId: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.buyShares(marketId, amount, isLong, optionId);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to buy shares';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);

  const sellShares = useCallback(async (marketId: number, amount: number, isLong: boolean, optionId: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.sellShares(marketId, amount, isLong, optionId);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sell shares';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);

  const addLiquidity = useCallback(async (marketId: number, amount: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.addLiquidity(marketId, amount);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add liquidity';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);

  const removeLiquidity = useCallback(async (marketId: number, amount: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.removeLiquidity(marketId, amount);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to remove liquidity';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);



  const getMarket = useCallback(async (marketId: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    const service = getOpinioContractService();
    return await service.getMarket(marketId);
  }, [isConnected]);

  const getOption = useCallback(async (marketId: number, optionId: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    const service = getOpinioContractService();
    return await service.getOption(marketId, optionId);
  }, [isConnected]);

  const getUserPortfolio = useCallback(async (userAddress: string) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    const service = getOpinioContractService();
    return await service.getUserPortfolio(userAddress);
  }, [isConnected]);

  const approveUSDC = useCallback(async (amount: number) => {
    if (!isConnected) throw new Error('Not connected to contract');
    
    try {
      setIsLoading(true);
      setError(null);
      
      const service = getOpinioContractService();
      const result = await service.approveUSDC(amount);
      
      await refreshData();
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to approve USDC';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, refreshData]);

  // Monitor state changes for debugging
  useEffect(() => {
    console.log('🔄 Hook useEffect - markets state changed:', markets);
  }, [markets]);
  
  useEffect(() => {
    console.log('🔄 Hook useEffect - usdcStatus state changed:', usdcStatus);
  }, [usdcStatus]);
  
  // Removed automatic refreshData call to prevent conflicts
  // useEffect(() => {
  //   if (isConnected) {
  //     refreshData();
  //   }
  // }, [isConnected, refreshData]);

  return {
    isConnected,
    walletAddress,
    networkInfo,
    usdcStatus,
    marketCount,
    markets,
    portfolio,
    userPositions,
    userVotes,
    tradingSummary,
    isLoading,
    error,
    connect,
    connectWithMetaMask,
    disconnect,
    refreshData,
    createMarket,
    addMarketOption,
    castVote,
    buyShares,
    sellShares,
    approveUSDC,
    getMarket,
    getOption,
    getUserPortfolio
  };
};

