'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useOpinioContract } from '@/app/hooks/useOpinioContract';

interface OpinioContextType {
  isConnected: boolean;
  walletAddress: string | null;
  networkInfo: { chainId: number; name: string } | null;
  usdcStatus: any;
  marketCount: string | null;
  markets: any[];
  portfolio: any;
  isLoading: boolean;
  error: string | null;
  
  connect: (rpcUrl: string, privateKey: string) => Promise<void>;
  disconnect: () => void;
  refreshData: () => Promise<void>;
  
  createMarket: (title: string, description: string, category: string, tags: string[], endDate: number, marketType?: number, initialLiquidity?: number, minLiquidity?: number, maxMarketSize?: number) => Promise<{ marketId: string; transaction: any }>;
  addMarketOption: (marketId: number, optionText: string) => Promise<any>;
  castVote: (marketId: number, prediction: number, confidence: number, amount: number) => Promise<any>;
  
  getMarket: (marketId: number) => Promise<any>;
  getOption: (marketId: number, optionId: number) => Promise<any>;
  getUserPortfolio: (userAddress: string) => Promise<any>;
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
  const opinioContract = useOpinioContract();

  return (
    <OpinioContext.Provider value={opinioContract}>
      {children}
    </OpinioContext.Provider>
  );
};




