"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { createContext, useContext, useState, ReactNode } from "react";
import { BrowserProvider, ethers } from "ethers";

type WalletContextType = {
  provider: BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType>({
  provider: null,
  signer: null,
  address: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
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

  return (
    <WalletContext.Provider
      value={{ provider, signer, address, isConnecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
