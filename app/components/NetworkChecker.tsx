'use client'

import { useEffect, useState } from 'react'
import { useWallets } from '@privy-io/react-auth'
import { AlertTriangle, Check } from 'lucide-react'

export function NetworkChecker() {
  const { wallets } = useWallets()
  const [chainId, setChainId] = useState<number | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  const BASE_SEPOLIA_CHAIN_ID = 84532

  useEffect(() => {
    const checkNetwork = async () => {
      if (wallets.length > 0) {
        const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
        if (embeddedWallet) {
          try {
            const provider = await embeddedWallet.getEthereumProvider()
            const currentChainId = await provider.request({ method: 'eth_chainId' })
            setChainId(parseInt(currentChainId as string, 16))
          } catch (error) {
            console.error('Failed to get chain ID:', error)
          }
        }
      }
    }

    checkNetwork()
  }, [wallets])

  const switchNetwork = async () => {
    if (wallets.length > 0) {
      const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
      if (embeddedWallet) {
        try {
          setIsSwitching(true)
          await embeddedWallet.switchChain(BASE_SEPOLIA_CHAIN_ID)
          setChainId(BASE_SEPOLIA_CHAIN_ID)
        } catch (error) {
          console.error('Failed to switch network:', error)
          alert('Failed to switch to Base Sepolia. Please try again.')
        } finally {
          setIsSwitching(false)
        }
      }
    }
  }

  if (chainId === null || chainId === BASE_SEPOLIA_CHAIN_ID) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-900" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                Wrong Network Detected
              </p>
              <p className="text-xs text-yellow-800">
                Please switch to Base Sepolia (Chain ID: {BASE_SEPOLIA_CHAIN_ID})
              </p>
            </div>
          </div>
          <button
            onClick={switchNetwork}
            disabled={isSwitching}
            className="px-4 py-2 bg-yellow-900 hover:bg-yellow-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSwitching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Switching...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Switch to Base Sepolia
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
