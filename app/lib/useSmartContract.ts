import { useState, useCallback, useEffect } from 'react';
import { 
  SmartContractService, 
  initializeSmartContract, 
  getSmartContractService,
  MarketData,
  PriceData,
  USDCStatus,
  TransactionResult
} from './smartContract';

export interface UseSmartContractReturn {
  // Service state
  isInitialized: boolean;
  walletAddress: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Smart contract functions
  initializeContract: (rpcUrl: string, privateKey: string) => Promise<void>;
  getNetworkInfo: () => Promise<{ chainId: number; name: string } | null>;
  checkUSDCStatus: () => Promise<USDCStatus | null>;
  buyShares: (marketId: number, side: boolean, usdcAmount?: number) => Promise<TransactionResult | null>;
  getPrices: (marketId: number) => Promise<PriceData | null>;
  createMarket: (description: string) => Promise<{ marketId: string; transaction: TransactionResult } | null>;
  getMarketCount: () => Promise<string | null>;
  getMarketDetails: (id: number) => Promise<MarketData | null>;
  addCreatorToWhitelist: (address: string) => Promise<TransactionResult | null>;
  resolveMarket: (marketId: number, side: boolean) => Promise<TransactionResult | null>;
  claimReward: (marketId: number) => Promise<TransactionResult | null>;
  withdrawFees: (marketId: number) => Promise<TransactionResult | null>;
  isWhitelisted: (address: string) => Promise<boolean | null>;
  
  // Clear error
  clearError: () => void;
}

export const useSmartContract = (): UseSmartContractReturn => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initializeContract = useCallback(async (rpcUrl: string, privateKey: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const service = initializeSmartContract(rpcUrl, privateKey);
      const address = await service.getWalletAddress();
      
      setWalletAddress(address);
      setIsInitialized(true);
      
      console.log('Smart contract initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize smart contract';
      setError(errorMessage);
      console.error('Failed to initialize smart contract:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executeContractFunction = useCallback(async <T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T | null> => {
    if (!isInitialized) {
      setError('Smart contract not initialized. Please initialize first.');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await fn();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${operationName}`;
      setError(errorMessage);
      console.error(`Failed to ${operationName}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const getNetworkInfo = useCallback(async (): Promise<{ chainId: number; name: string } | null> => {
    return executeContractFunction(
      () => getSmartContractService().getNetworkInfo(),
      'get network info'
    );
  }, [executeContractFunction]);

  const checkUSDCStatus = useCallback(async (): Promise<USDCStatus | null> => {
    return executeContractFunction(
      () => getSmartContractService().checkUSDCStatus(),
      'check USDC status'
    );
  }, [executeContractFunction]);

  const buyShares = useCallback(async (
    marketId: number, 
    side: boolean, 
    usdcAmount: number = 10
  ): Promise<TransactionResult | null> => {
    return executeContractFunction(
      () => getSmartContractService().buyShares(marketId, side, usdcAmount),
      'buy shares'
    );
  }, [executeContractFunction]);

  const getPrices = useCallback(async (marketId: number): Promise<PriceData | null> => {
    return executeContractFunction(
      () => getSmartContractService().getPrices(marketId),
      'get prices'
    );
  }, [executeContractFunction]);

  const createMarket = useCallback(async (description: string) => {
    return executeContractFunction(
      () => getSmartContractService().createMarket(description),
      'create market'
    );
  }, [executeContractFunction]);

  const getMarketCount = useCallback(async (): Promise<string | null> => {
    return executeContractFunction(
      () => getSmartContractService().getMarketCount(),
      'get market count'
    );
  }, [executeContractFunction]);

  const getMarketDetails = useCallback(async (id: number): Promise<MarketData | null> => {
    return executeContractFunction(
      () => getSmartContractService().getMarketDetails(id),
      'get market details'
    );
  }, [executeContractFunction]);

  const addCreatorToWhitelist = useCallback(async (address: string): Promise<TransactionResult | null> => {
    return executeContractFunction(
      () => getSmartContractService().addCreatorToWhitelist(address),
      'add creator to whitelist'
    );
  }, [executeContractFunction]);

  const resolveMarket = useCallback(async (marketId: number, side: boolean): Promise<TransactionResult | null> => {
    return executeContractFunction(
      () => getSmartContractService().resolveMarket(marketId, side),
      'resolve market'
    );
  }, [executeContractFunction]);

  const claimReward = useCallback(async (marketId: number): Promise<TransactionResult | null> => {
    return executeContractFunction(
      () => getSmartContractService().claimReward(marketId),
      'claim reward'
    );
  }, [executeContractFunction]);

  const withdrawFees = useCallback(async (marketId: number): Promise<TransactionResult | null> => {
    return executeContractFunction(
      () => getSmartContractService().withdrawFees(marketId),
      'withdraw fees'
    );
  }, [executeContractFunction]);

  const isWhitelisted = useCallback(async (address: string): Promise<boolean | null> => {
    return executeContractFunction(
      () => getSmartContractService().isWhitelisted(address),
      'check whitelist status'
    );
  }, [executeContractFunction]);

  return {
    // State
    isInitialized,
    walletAddress,
    isLoading,
    error,
    
    // Functions
    initializeContract,
    getNetworkInfo,
    checkUSDCStatus,
    buyShares,
    getPrices,
    createMarket,
    getMarketCount,
    getMarketDetails,
    addCreatorToWhitelist,
    resolveMarket,
    claimReward,
    withdrawFees,
    isWhitelisted,
    
    // Utilities
    clearError,
  };
};
