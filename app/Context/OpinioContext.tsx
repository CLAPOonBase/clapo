'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { OpinioContractService } from '../lib/opinioContract';

interface OpinioContextType {
  provider: ethers.Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  walletAddress: string | null;
  networkInfo: { chainId: number; name: string } | null;
  usdcStatus: any;
  markets: any[];
  userPositions: any[];
  userVotes: any[];
  tradingSummary: any;
  loading: boolean;
  error: string | null;
  
  connect: (provider: ethers.Provider, signer: ethers.Signer) => Promise<void>;
  connectWithMetaMask: (provider: ethers.Provider, signer: ethers.Signer) => Promise<void>;
  disconnect: () => void;
  refreshData: () => Promise<void>;

  
  createMarket: (title: string, description: string, category: string, tags: string[], endDate: number, marketType: number, initialLiquidity: number, minLiquidity: number, maxMarketSize: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  addMarketOption: (marketId: number, optionText: string) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  castVote: (marketId: number, prediction: number, confidence: number, amount: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  buyShares: (marketId: number, amount: number, isLong: boolean, optionId: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  sellShares: (marketId: number, sharesToSell: number, isLong: boolean, optionId: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  addLiquidity: (marketId: number, amount: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  removeLiquidity: (marketId: number, amount: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  claimWinnings: (marketId: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  approveUSDC: (amount: number) => Promise<{ hash: string; blockNumber: number; gasUsed: string }>;
  
  getMarket: (marketId: number) => Promise<any>;
  getMarketOptions: (marketId: number) => Promise<any[]>;
  getMarketProbabilities: (marketId: number) => Promise<any>;
}

const OpinioContext = createContext<OpinioContextType | undefined>(undefined);

export const useOpinioContext = () => {
  const context = useContext(OpinioContext);
  if (context === undefined) {
    throw new Error('useOpinioContext must be used within an OpinioProvider');
  }
  return context;
};

interface OpinioProviderProps {
  children: ReactNode;
}

export const OpinioProvider: React.FC<OpinioProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<{ chainId: number; name: string } | null>(null);
  const [usdcStatus, setUsdcStatus] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>([]);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [tradingSummary, setTradingSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<OpinioContractService | null>(null);
  const marketsLastUpdated = useRef<number>(0);


  useEffect(() => {
    let isInitializing = true;
    
    const initReadOnlyService = async () => {
      if (!isInitializing) return;
      
      try {
        console.log('🔧 Initializing read-only service for market fetching...');
        const readOnlyProvider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
        const readOnlyService = new OpinioContractService(readOnlyProvider);
        setService(readOnlyService);
        

        let marketsData = null;
        let attempt = 0;
        const maxAttempts = 2;
        
        while (attempt < maxAttempts && !marketsData) {
          try {
            if (attempt > 0) {
              console.log(`🔄 Retry attempt ${attempt + 1}/${maxAttempts}...`);
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
            
            marketsData = await readOnlyService.getAllMarkets();
            console.log('✅ Initial markets fetched:', marketsData.length);
            setMarkets(marketsData);
            marketsLastUpdated.current = Date.now();
            setError(null);
            break;
          } catch (err) {
            attempt++;
            console.log(`⚠️ Attempt ${attempt} failed:`, err);
            
            if (attempt >= maxAttempts) {
              console.log('⚠️ All attempts failed, showing error message');
              setError('Failed to fetch markets. Please refresh the page to try again.');
            }
          }
        }
      } catch (err) {
        console.error('❌ Failed to initialize read-only service:', err);
        setError('Failed to initialize service. Please refresh the page.');
      }
    };

    initReadOnlyService();
    

    
    return () => {
      isInitializing = false;
    };
  }, []);

  const refreshData = useCallback(async () => {
    console.log('🔄 refreshData called with:', {
      service: !!service,
      serviceType: service?.constructor?.name,
      isConnected,
      walletAddress: walletAddress,
      walletAddressType: typeof walletAddress
    });
    
    if (!service || !isConnected || !walletAddress) {
      console.log('⚠️ refreshData early return - missing:', {
        service: !!service,
        isConnected,
        walletAddress: !!walletAddress
      });

      setUserPositions([]);
      setUserVotes([]);
      setTradingSummary(null);
      setUsdcStatus(null);
      return;
    }
    
    // Force refresh markets data as well
    console.log('🔄 Force refreshing markets data...');
    try {
      const marketsData = await service.getAllMarkets();
      setMarkets(marketsData);
      console.log('✅ Markets refreshed:', marketsData.length);
    } catch (err) {
      console.error('❌ Failed to refresh markets:', err);
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Starting data fetch for wallet:', walletAddress);
      
      const [
        marketsData,
        positions,
        votes,
        summary,
        usdcData
      ] = await Promise.all([
        service.getAllMarkets(),
        service.getUserPositions(walletAddress),
        service.getUserVotes(walletAddress),
        service.getUserTradingSummary(walletAddress),
        service.getUSDCStatus(walletAddress)
      ]);

      console.log('📊 Data fetch results:', {
        markets: marketsData?.length || 0,
        positions: positions?.length || 0,
        votes: votes?.length || 0,
        summary: !!summary,
        usdc: !!usdcData
      });

      console.log('📊 Detailed position data:', {
        positionsArray: positions,
        positionsType: typeof positions,
        positionsLength: positions?.length,
        firstPosition: positions?.[0]
      });

      setMarkets(marketsData);
      setUserPositions(positions);
      setUserVotes(votes);
      setTradingSummary(summary);
      setUsdcStatus(usdcData);
      
      console.log('✅ State updated - userPositions set to:', positions?.length || 0, 'positions');
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [service, isConnected, walletAddress]);





  const connect = useCallback(async (newProvider: ethers.Provider, newSigner: ethers.Signer) => {
    try {
      setProvider(newProvider);
      setSigner(newSigner);
      

      const network = await newProvider.getNetwork();
      const targetChainId = 10143;
      
      if (Number(network.chainId) !== targetChainId) {

        if (typeof window !== 'undefined' && window.ethereum) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
          } catch (switchError: any) {

            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: 'Monad Testnet',
                  nativeCurrency: {
                    name: 'MONAD',
                    symbol: 'MONAD',
                    decimals: 18
                  },
                  rpcUrls: ['https://testnet-rpc.monad.xyz'],
                  blockExplorerUrls: ['https://testnet.monadexplorer.com']
                }],
              });
            } else {
              throw new Error(`Please switch to Monad Testnet (Chain ID: ${targetChainId})`);
            }
          }
          

          const updatedNetwork = await newProvider.getNetwork();
          if (Number(updatedNetwork.chainId) !== targetChainId) {
            throw new Error(`Failed to switch to Monad Testnet. Current chain ID: ${updatedNetwork.chainId}`);
          }
        }
      }
      

      const newService = new OpinioContractService(newProvider, newSigner);
      console.log('🔧 Creating new service:', {
        serviceType: newService.constructor.name,
        provider: !!newProvider,
        signer: !!newSigner
      });
      setService(newService);
      
      const address = await newSigner.getAddress();
      console.log('🔧 Setting wallet address:', address);
      setWalletAddress(address);
      
      const finalNetwork = await newProvider.getNetwork();
      setNetworkInfo({
        chainId: Number(finalNetwork.chainId),
        name: finalNetwork.name
      });
      
      setIsConnected(true);
      
      // Force refresh markets with the new service
      console.log('🔄 Refreshing markets with new service...');
      try {
        const freshMarkets = await newService.getAllMarkets();
        setMarkets(freshMarkets);
        console.log('✅ Markets refreshed with new service:', freshMarkets.length);
      } catch (err) {
        console.error('❌ Failed to refresh markets with new service:', err);
      }

      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnected(false);
    }
  }, [refreshData]);

  // Periodic refresh for connected users
  useEffect(() => {
    if (!isConnected || !service || !walletAddress) return;
    
    const interval = setInterval(async () => {
      console.log('🔄 Periodic refresh triggered...');
      try {
        // Refresh markets data
        const freshMarkets = await service.getAllMarkets();
        setMarkets(freshMarkets);
        
        // Refresh user data
        await refreshData();
        
        console.log('✅ Periodic refresh completed');
      } catch (err) {
        console.error('❌ Periodic refresh failed:', err);
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, service, walletAddress, refreshData]);

  const connectWithMetaMask = useCallback(async (newProvider: ethers.Provider, newSigner: ethers.Signer) => {

    await connect(newProvider, newSigner);
  }, [connect]);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setWalletAddress(null);
    setNetworkInfo(null);
    setUsdcStatus(null);


    setUserPositions([]);
    setUserVotes([]);
    setTradingSummary(null);
    setService(null);
    setError(null);
  }, []);

  const createMarket = useCallback(async (
    title: string,
    description: string,
    category: string,
    tags: string[],
    endDate: number,
    marketType: number,
    initialLiquidity: number,
    minLiquidity: number,
    maxMarketSize: number
  ) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.createMarket(title, description, category, tags, endDate, marketType, initialLiquidity, minLiquidity, maxMarketSize);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const addMarketOption = useCallback(async (marketId: number, optionText: string) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.addMarketOption(marketId, optionText);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const castVote = useCallback(async (marketId: number, prediction: number, confidence: number, amount: number) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.castVote(marketId, prediction, confidence, amount);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const buyShares = useCallback(async (marketId: number, amount: number, isLong: boolean, optionId: number) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.buyShares(marketId, amount, isLong, optionId);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const sellShares = useCallback(async (marketId: number, sharesToSell: number, isLong: boolean, optionId: number) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.sellShares(marketId, sharesToSell, isLong, optionId);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const addLiquidity = useCallback(async (marketId: number, amount: number) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.addLiquidity(marketId, amount);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const removeLiquidity = useCallback(async (marketId: number, amount: number) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.removeLiquidity(marketId, amount);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const claimWinnings = useCallback(async (marketId: number) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.claimWinnings(marketId);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const approveUSDC = useCallback(async (amount: number) => {
    if (!service) throw new Error('Service not initialized');
    const result = await service.approveUSDC(amount);
    await refreshData();
    return result;
  }, [service, refreshData]);

  const getMarket = useCallback(async (marketId: number) => {
    if (!service) throw new Error('Service not initialized');
    return await service.getMarket(marketId);
  }, [service]);

  const getMarketOptions = useCallback(async (marketId: number) => {
    if (!service) throw new Error('Service not initialized');
    return await service.getMarketOptions(marketId);
  }, [service]);

  const getMarketProbabilities = useCallback(async (marketId: number) => {
    if (!service) throw new Error('Service not initialized');
    return await service.getMarketProbabilities(marketId);
  }, [service]);

  const contextValue: OpinioContextType = {
    provider,
    signer,
    isConnected,
    walletAddress,
    networkInfo,
    usdcStatus,
    markets,
    userPositions,
    userVotes,
    tradingSummary,
    loading,
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
    addLiquidity,
    removeLiquidity,
    claimWinnings,
    approveUSDC,
    getMarket,
    getMarketOptions,
    getMarketProbabilities
  };

  return (
    <OpinioContext.Provider value={contextValue}>
      {children}
    </OpinioContext.Provider>
  );
};




