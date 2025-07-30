import { useWalletContext } from "@/context/WalletContext";
import React from "react";
import { Wallet, WalletCards } from "lucide-react";

const UserDetails = () => {
  const { connect, disconnect, address, isConnecting } = useWalletContext();
  
  // Mock balance - in a real app, you'd fetch this from your backend or blockchain
  const balance = 1000;

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletAction = () => {
    if (address) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div>
      <div className="w-full rounded-md md:flex md:space-x-4 space-y-4 md:space-y-0 justify-between">
        {/* Welcome Section */}
        <div className="bg-dark-800 p-4 rounded-md w-full flex flex-col text-left">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">
              Hey, {address ? formatAddress(address) : "Guest"}
            </span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${address ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${address ? 'text-green-400' : 'text-red-400'}`}>
                {address ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          <span className="text-secondary">
            Welcome back! Here&apos;s what&apos;s trending in the markets.
          </span>
          
          {/* Wallet Connection Button */}
          <button
            onClick={handleWalletAction}
            disabled={isConnecting}
            className={`mt-3 self-start flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              address 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-primary hover:bg-primary/90 text-white'
            } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Wallet size={16} />
            <span>
              {isConnecting 
                ? 'Connecting...' 
                : address 
                  ? 'Disconnect Wallet' 
                  : 'Connect Wallet'
              }
            </span>
          </button>
        </div>

        {/* Balance Section */}
        <div className="bg-dark-800 p-4 rounded-md w-full flex justify-between items-center">
          <div className="flex flex-col items-start text-secondary">
            <span>Balance</span>
            <span className="text-2xl text-white">${balance}</span>
            {address && (
              <span className="text-xs text-green-400 mt-1">
                Wallet Connected ✓
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <button 
              className={`bg-white text-primary px-4 py-2 rounded-md transition flex items-center space-x-2 ${
                address 
                  ? 'hover:bg-gray-100' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!address}
              title={!address ? 'Connect wallet to make deposits' : ''}
            >
              <WalletCards size={16} />
              <span>Make Deposit</span>
            </button>
            
            {!address && (
              <span className="text-xs text-secondary text-center">
                Connect wallet first
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;