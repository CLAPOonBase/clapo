"use client";

import React, { useState } from 'react';
import { Wallet, Loader2 } from 'lucide-react';

interface WalletConnectButtonProps {
  onConnect: () => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
  address?: string;
  onDisconnect?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WalletConnectButton({
  onConnect,
  isConnecting,
  isConnected,
  address,
  onDisconnect,
  size = 'md',
  className = ''
}: WalletConnectButtonProps) {
  const [showDisconnect, setShowDisconnect] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDisconnect(!showDisconnect)}
          className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors ${sizeClasses[size]} ${className}`}
        >
          <Wallet className={iconSizes[size]} />
          <span className="hidden sm:inline">
            {`${address.slice(0, 6)}...${address.slice(-4)}`}
          </span>
        </button>
        
        {showDisconnect && onDisconnect && (
          <div className="absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <button
              onClick={() => {
                onDisconnect();
                setShowDisconnect(false);
              }}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-black rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className={`flex items-center rounded-full gap-2 shadow-custom-purple hover:bg-blue-700 disabled:bg-blue-600/50 text-nowrap bg-[#6E54FF] text-white transition-colors ${sizeClasses[size]} ${className}`}
    >
      {isConnecting ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Wallet className={iconSizes[size]} />
      )}
      <span className="hidden sm:inline">
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </span>
    </button>
  );
}


