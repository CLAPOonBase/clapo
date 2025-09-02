"use client";

import { useState } from 'react';
import { useOpinioContext } from '@/app/Context/OpinioContext';
import { motion } from 'framer-motion';

interface OpinioTradingProps {
  marketId: number;
  marketData: any;
}

export default function OpinioTrading({ marketId, marketData }: OpinioTradingProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [isTrading, setIsTrading] = useState(false);
  
  const { buyShares, sellShares } = useOpinioContext();

  // Don't render if marketData is not available
  if (!marketData) {
    return (
      <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
        <div className="text-gray-400 text-sm text-center">
          Market data not available
        </div>
      </div>
    );
  }

  const handleTrade = async () => {
    if (!selectedOption || !amount || parseFloat(amount) <= 0) {
      alert('Please select an option and enter a valid amount');
      return;
    }

    try {
      setIsTrading(true);
      
      if (tradeType === 'buy') {
        // buyShares(marketId, amount, isLong, optionId)
        const result = await buyShares(marketId, parseFloat(amount), true, selectedOption);
        if (result) {
          alert(`Successfully bought shares!`);
        }
      } else {
        // sellShares(marketId, amount, isLong, optionId)
        const result = await sellShares(marketId, parseFloat(amount), true, selectedOption);
        if (result) {
          alert(`Successfully sold shares!`);
        }
      }
      
      setAmount('');
    } catch (err) {
      console.error('Trade failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Please try again.';
      if (errorMessage.includes('getAddress')) {
        alert('Wallet connection error. Please reconnect your wallet and try again.');
      } else {
        alert(`Trade failed: ${errorMessage}`);
      }
    } finally {
      setIsTrading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: any, decimals: number) => {
    try {
      return parseFloat(balance.toString()) / Math.pow(10, decimals);
    } catch {
      return '0';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]"
    >
      <h3 className="text-white font-semibold mb-4">Trade Market #{marketId}</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-white text-sm mb-2">Market Question</h4>
          <p className="text-gray-300 text-sm">{marketData?.title || 'No title provided'}</p>
        </div>
        
        <div>
          <h4 className="text-white text-sm mb-2">Description</h4>
          <p className="text-gray-300 text-sm">{marketData?.description || 'No description provided'}</p>
        </div>
        
        <div>
          <h4 className="text-white text-sm mb-2">Options</h4>
          <div className="space-y-2">
            {marketData?.optionIds && marketData.optionIds.length > 0 ? (
              marketData.optionIds.map((optionId: number, index: number) => (
                <label key={optionId} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="option"
                    value={optionId}
                    checked={selectedOption === optionId}
                    onChange={(e) => setSelectedOption(Number(e.target.value))}
                    className="accent-[#6E54FF]"
                  />
                  <span className="text-white text-sm">Option {index + 1}</span>
                  <span className="text-gray-400 text-xs">
                    (Votes: {marketData.optionVotes && marketData.optionVotes[index] ? formatBalance(marketData.optionVotes[index], 6) : '0'})
                  </span>
                </label>
              ))
            ) : (
              <div className="text-gray-400 text-sm">
                No options available for this market yet.
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-white text-sm mb-2">Trade Type</h4>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tradeType"
                value="buy"
                checked={tradeType === 'buy'}
                onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
                className="accent-[#6E54FF]"
              />
              <span className="text-white text-sm ml-2">Buy Shares</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tradeType"
                value="sell"
                checked={tradeType === 'sell'}
                onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
                className="accent-[#6E54FF]"
              />
              <span className="text-white text-sm ml-2">Sell Shares</span>
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-white text-sm mb-2">
            {tradeType === 'buy' ? 'USDC Amount' : 'Share Amount'}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={tradeType === 'buy' ? 'Enter USDC amount' : 'Enter share amount'}
            className="w-full bg-transparent border border-[#2A2A2A] px-3 py-2 rounded text-sm outline-none text-white placeholder-gray-400 focus:border-[#6E54FF]/50"
          />
        </div>
        
        <button
          onClick={handleTrade}
          disabled={isTrading || !selectedOption || !amount}
          className="w-full bg-[#6E54FF] hover:bg-[#836EF9] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 rounded transition-all duration-200"
        >
          {isTrading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Shares`}
        </button>
        

      </div>
      
      <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Creator:</span>
            <span className="text-white ml-2">{marketData?.creator ? formatAddress(marketData.creator) : 'Unknown'}</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <span className="text-white ml-2">
              {marketData?.status === 0 ? 'Active' : marketData?.status === 1 ? 'Resolved' : 'Closed'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Total Liquidity:</span>
            <span className="text-white ml-2">
              {formatBalance(marketData.totalLiquidity, 6)} USDC
            </span>
          </div>
          <div>
            <span className="text-gray-400">Total Shares:</span>
            <span className="text-white ml-2">
              {formatBalance(marketData.totalShares, 6)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

