'use client'

import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'

interface NetworkConfigProps {
  onClose?: () => void
}

export function NetworkConfig({ onClose }: NetworkConfigProps) {
  const [copied, setCopied] = useState(false)

  const baseSepoliaConfig = {
    chainId: '0x14a34', // 84532 in hex
    chainName: 'Base Sepolia',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  }

  const addBaseSepolia = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [baseSepoliaConfig],
        })
      } catch (error) {
        console.error('Failed to add Base Sepolia:', error)
      }
    }
  }

  const copyConfig = () => {
    const configText = `Chain ID: ${baseSepoliaConfig.chainId}
Chain Name: ${baseSepoliaConfig.chainName}
RPC URL: ${baseSepoliaConfig.rpcUrls[0]}
Block Explorer: ${baseSepoliaConfig.blockExplorerUrls[0]}
Currency: ${baseSepoliaConfig.nativeCurrency.symbol}`

    navigator.clipboard.writeText(configText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-black rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-semibold flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
            Network Configuration
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              To use creator tokens and interact with contracts, you need to connect to Base Sepolia testnet.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium">Base Sepolia Details:</h4>
            <div className="bg-dark-700 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Chain ID:</span>
                <span className="text-white font-mono">{baseSepoliaConfig.chainId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chain Name:</span>
                <span className="text-white">{baseSepoliaConfig.chainName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">RPC URL:</span>
                <span className="text-white font-mono text-xs">{baseSepoliaConfig.rpcUrls[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Currency:</span>
                <span className="text-white">{baseSepoliaConfig.nativeCurrency.symbol}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-medium">Quick Setup:</h4>
            <div className="space-y-2">
              <button
                onClick={addBaseSepolia}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Add Base Sepolia to Wallet</span>
              </button>
              
              <button
                onClick={copyConfig}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    <span>Copy Network Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-200 text-xs">
              <strong>Note:</strong> You'll need some ETH for gas fees. 
              Get testnet ETH from the Base Sepolia faucet.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


