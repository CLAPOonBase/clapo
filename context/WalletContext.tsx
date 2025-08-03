"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { createContext, useContext, useState, ReactNode } from "react";
import { BrowserProvider, ethers, Contract, formatUnits } from "ethers";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
];

type TokenBalance = {
  raw: bigint;
  formatted: string;
  decimals: number;
  symbol: string;
  name: string;
};

type WalletContextType = {
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  getTokenBalance: (tokenAddress: string) => Promise<TokenBalance>;
  getETHBalance: () => Promise<string>;
};

const WalletContext = createContext<WalletContextType>({
  provider: null,
  signer: null,
  address: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  getTokenBalance: async () => ({
    raw: 0n,
    formatted: "0",
    decimals: 18,
    symbol: "",
    name: "",
  }),
  getETHBalance: async () => "0",
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        const _provider = new BrowserProvider(window.ethereum);
        await _provider.send("eth_requestAccounts", []);
        const _signer = await _provider.getSigner();
        const _address = await _signer.getAddress();

        setProvider(_provider);
        setSigner(_signer);
        setAddress(_address);
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        alert("Failed to connect wallet. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask not found! Please install MetaMask to use this feature.");
    }
  };

  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
  };

  const getTokenBalance = async (
    tokenAddress: string
  ): Promise<TokenBalance> => {
    if (!provider || !address) {
      throw new Error("Wallet not connected");
    }

    try {
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

      const [balance, decimals, symbol, name] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name(),
      ]);

      const formattedBalance = formatUnits(balance, decimals);

      return {
        raw: balance,
        formatted: formattedBalance,
        decimals,
        symbol,
        name,
      };
    } catch (error) {
      console.error("Error fetching token balance:", error);
      throw error;
    }
  };

  const getETHBalance = async (): Promise<string> => {
    if (!provider || !address) {
      throw new Error("Wallet not connected");
    }

    try {
      const balance = await provider.getBalance(address);
      return formatUnits(balance, 18); 
    } catch (error) {
      console.error("Error fetching ETH balance:", error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        provider,
        signer,
        address,
        isConnecting,
        connect,
        disconnect,
        getTokenBalance,
        getETHBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
