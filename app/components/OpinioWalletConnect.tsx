"use client";

import { useState, useEffect } from 'react';
import { useOpinioContext } from '@/app/Context/OpinioContext';
import { useWalletContext } from '@/context/WalletContext';
import { motion } from 'framer-motion';

export default function OpinioWalletConnect() {
  const [rpcUrl, setRpcUrl] = useState('https://testnet-rpc.monad.xyz');
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [useMetaMask, setUseMetaMask] = useState(true);
  
    const { 
    isConnected, 
    walletAddress, 
    networkInfo, 
    usdcStatus, 
 
    connect, 
    connectWithMetaMask, 
    disconnect,

  } = useOpinioContext();
  
  const {
    provider: metaMaskProvider,
    signer: metaMaskSigner,
    address: metaMaskAddress,
    isConnecting: metaMaskConnecting,
    connect: connectMetaMask,
    disconnect: disconnectMetaMask
  } = useWalletContext();
  
  console.log('🔍 OpinioWalletConnect render - usdcStatus:', usdcStatus);
  console.log('🔍 usdcStatus details:', {
    exists: !!usdcStatus,
    balance: usdcStatus?.balance,
    balanceType: typeof usdcStatus?.balance,
    decimals: usdcStatus?.decimals,
    decimalsType: typeof usdcStatus?.decimals,
    symbol: usdcStatus?.symbol
  });
  
  useEffect(() => {
    console.log('🔄 OpinioWalletConnect useEffect - usdcStatus changed:', usdcStatus);
    if (usdcStatus) {
      console.log('🔄 New usdcStatus details:', {
        balance: usdcStatus.balance,
        balanceType: typeof usdcStatus.balance,
        decimals: usdcStatus.decimals,
        decimalsType: typeof usdcStatus.decimals
      });
    }
  }, [usdcStatus]);

  const handleConnect = async () => {
    if (useMetaMask) {
      try {

        if (!metaMaskAddress) {
          await connectMetaMask();
        }
        

        await new Promise(resolve => setTimeout(resolve, 1000));
        

        if (window.ethereum) {
          const freshProvider = new (await import('ethers')).BrowserProvider(window.ethereum);
          const freshSigner = await freshProvider.getSigner();
          
          await connectWithMetaMask(freshProvider, freshSigner);
        } else if (metaMaskProvider && metaMaskSigner) {
          await connectWithMetaMask(metaMaskProvider, metaMaskSigner);
        }
      } catch (err) {
        console.error('MetaMask connection failed:', err);

        if (err instanceof Error && err.message.includes('network changed')) {
          alert('Network changed detected. Please refresh the page and try connecting again.');
        }
      }
    } else {

      if (!rpcUrl || !privateKey) {
        alert('Please enter both RPC URL and private key');
        return;
      }
      
      try {
        const { ethers } = await import('ethers');
        

        const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
        

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(formattedPrivateKey, provider);
        
        await connect(provider, wallet);
      } catch (err) {
        console.error('Connection failed:', err);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    disconnectMetaMask();
    setPrivateKey('');
  };


  useEffect(() => {
    if (useMetaMask && metaMaskAddress && metaMaskProvider && metaMaskSigner && !isConnected) {

      const timer = setTimeout(() => {
        connectWithMetaMask(metaMaskProvider, metaMaskSigner).catch(err => {
          console.error('Auto-connection to Opinio failed:', err);
          // If it's a network change error, don't auto-retry to avoid loops
          if (!err.message?.includes('network changed')) {
            console.log('Will retry auto-connection...');
          }
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [metaMaskAddress, metaMaskProvider, metaMaskSigner, isConnected, connectWithMetaMask, useMetaMask]);

  // Listen for network changes and disconnect when they occur
  useEffect(() => {
    if (window.ethereum && useMetaMask) {
      const handleChainChanged = (chainId: string) => {
        console.log('🌐 Network changed to:', chainId);
        // Disconnect current connection to force reconnection with new network
        if (isConnected) {
          disconnect();
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [useMetaMask, isConnected, disconnect]);

  // Helper function to add/switch to Monad Testnet
  const addMonadNetwork = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found!');
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x279F', // 10143 in hex
          chainName: 'Monad Testnet',
          nativeCurrency: {
            name: 'MON',
            symbol: 'MON',
            decimals: 18
          },
          rpcUrls: ['https://testnet-rpc.monad.xyz'],
          blockExplorerUrls: ['https://testnet-explorer.monad.xyz']
        }]
      });
      console.log('✅ Monad Testnet added to MetaMask');
    } catch (error) {
      console.error('❌ Failed to add Monad Testnet:', error);
      alert('Failed to add Monad Testnet. Please add it manually.');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: any, decimals: any) => {
    try {
      console.log('🔢 formatBalance input:', { balance, decimals, balanceType: typeof balance, decimalsType: typeof decimals });
      
      // Handle BigInt properly for both balance and decimals
      const balanceStr = balance.toString();
      const balanceNum = parseFloat(balanceStr);
      const decimalsNum = parseInt(decimals.toString());
      const divisor = Math.pow(10, decimalsNum);
      const result = balanceNum / divisor;
      
      console.log('🔢 formatBalance calculation:', { balanceStr, balanceNum, decimalsNum, divisor, result });
      
      return result;
    } catch (error) {
      console.error('❌ formatBalance error:', error);
      return 0;
    }
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Wallet Connected</h3>
          <button
            onClick={handleDisconnect}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Address:</span>
            <span className="text-white font-mono">{formatAddress(walletAddress || '')}</span>
          </div>
          
          {networkInfo && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network:</span>
              <span className="text-white">{networkInfo.name} (ID: {networkInfo.chainId})</span>
            </div>
          )}
          
          {usdcStatus && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">USDC Balance:</span>
                <span className="text-white">
                  {(() => {
                    const result = formatBalance(usdcStatus.balance, usdcStatus.decimals);
                    console.log('🎯 USDC Balance display result:', result);
                    return result;
                  })()} {usdcStatus.symbol}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">USDC Allowance:</span>
                <span className="text-white">
                  {formatBalance(usdcStatus.allowance, usdcStatus.decimals)} {usdcStatus.symbol}
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                Debug: Raw balance: {usdcStatus.balance.toString()}, Decimals: {usdcStatus.decimals.toString()}
              </div>
              
              <div className="text-xs text-gray-500">
                Manual calc: {usdcStatus.balance.toString()} / 10^{usdcStatus.decimals.toString()} = {parseFloat(usdcStatus.balance.toString()) / Math.pow(10, parseInt(usdcStatus.decimals.toString()))}
              </div>
            </>
          )}
        </div>
        

      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]"
    >
      <h3 className="text-white font-semibold mb-4">Connect to Monad Testnet</h3>
      
      {/* Connection Method Toggle */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setUseMetaMask(true)}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
            useMetaMask 
              ? 'bg-[#6E54FF] text-white' 
              : 'bg-[#2A2A2A] text-gray-400 hover:text-white'
          }`}
        >
          🦊 MetaMask
        </button>
        <button
          onClick={() => setUseMetaMask(false)}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
            !useMetaMask 
              ? 'bg-[#6E54FF] text-white' 
              : 'bg-[#2A2A2A] text-gray-400 hover:text-white'
          }`}
        >
          🔑 Private Key
        </button>
      </div>

      {useMetaMask ? (
        <div className="space-y-3">
          <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-400 text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <span>🦊</span>
              <span className="font-medium">MetaMask Connection</span>
            </div>
            <p className="text-xs text-blue-300">
              Click connect to use your MetaMask wallet. Make sure you're on the Monad Testnet.
            </p>
            {metaMaskAddress && (
              <div className="mt-2 text-xs">
                <span className="text-gray-400">MetaMask Address:</span>
                <span className="text-white font-mono ml-1">{formatAddress(metaMaskAddress)}</span>
              </div>
            )}
            <button
              onClick={addMonadNetwork}
              className="mt-2 w-full bg-orange-600 hover:bg-orange-700 text-white text-xs py-2 px-3 rounded transition-colors"
            >
              🌐 Add/Switch to Monad Testnet
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">RPC URL</label>
            <input
              type="text"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              placeholder="https://testnet-rpc.monad.xyz"
              className="w-full bg-transparent border border-[#2A2A2A] px-3 py-2 rounded text-sm outline-none text-white placeholder-gray-400 focus:border-[#6E54FF]/50"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Private Key</label>
            <div className="relative">
              <input
                type={showPrivateKey ? "text" : "password"}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your private key"
                className="w-full bg-transparent border border-[#2A2A2A] px-3 py-2 pr-10 rounded text-sm outline-none text-white placeholder-gray-400 focus:border-[#6E54FF]/50"
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPrivateKey ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>
        </div>
      )}
        
      <button
        onClick={handleConnect}
        disabled={metaMaskConnecting || (!useMetaMask && (!rpcUrl || !privateKey))}
        className="w-full bg-[#6E54FF] hover:bg-[#836EF9] disabled:bg-gray-600 disabled:cursor-not-available text-white font-semibold py-2 rounded transition-all duration-200 mt-4"
      >
        {metaMaskConnecting ? 'Connecting...' : useMetaMask ? '🦊 Connect MetaMask' : '🔑 Connect with Private Key'}
      </button>
      

      
      <div className="mt-3 text-xs text-gray-500">
        {useMetaMask ? (
          <>
            <p>🦊 Make sure MetaMask is installed and set to Monad Testnet</p>
            <p>🔗 Chain ID: 10143 | RPC: https://testnet-rpc.monad.xyz</p>
          </>
        ) : (
          <>
            <p>⚠️ Never share your private key with anyone</p>
            <p>🔗 Connected to Monad Testnet (Chain ID: 10143)</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

