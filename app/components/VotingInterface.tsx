'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOpinioContext } from '@/app/Context/OpinioContext';

interface VotingInterfaceProps {
  marketId: number;
  marketTitle: string;
  onVoteSuccess?: () => void;
  onError?: (error: string) => void;
}

type VoteChoice = 'yes' | 'no';

export default function VotingInterface({ 
  marketId, 
  marketTitle, 
  onVoteSuccess, 
  onError 
}: VotingInterfaceProps) {
  const [voteChoice, setVoteChoice] = useState<VoteChoice>('yes');
  const [amount, setAmount] = useState<number>(10);
  const [isVoting, setIsVoting] = useState(false);
  
  // Polymarket-style: voting = buying shares
  const { buyShares, isConnected } = useOpinioContext();
  
  // Mock prices (in real Polymarket, these come from the market)
  const yesPrice = 0.65; // 65 cents per YES share
  const noPrice = 0.35;  // 35 cents per NO share

  const handleVote = async () => {
    if (!isConnected) {
      onError?.('Please connect your wallet first');
      return;
    }

    if (amount <= 0) {
      onError?.('Amount must be greater than 0');
      return;
    }

    try {
      setIsVoting(true);
      
      // Polymarket style: Buy shares to express prediction
      const isLong = voteChoice === 'yes'; // YES = long position, NO = short position
      const optionId = 0; // Always 0 for binary markets
      
      console.log('🗳️ Buying shares (Polymarket style):', {
        marketId,
        amount,
        isLong,
        optionId,
        voteChoice
      });
      
      const result = await buyShares(marketId, amount, isLong, optionId);
      console.log('✅ Shares purchased successfully:', result);
      
      onVoteSuccess?.();
      
      // Reset form
      setAmount(10);
      
    } catch (error) {
      console.error('❌ Failed to buy shares:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to buy shares');
    } finally {
      setIsVoting(false);
    }
  };

  // Calculate shares and potential payout (Polymarket style)
  const currentPrice = voteChoice === 'yes' ? yesPrice : noPrice;
  const sharesReceived = amount / currentPrice;
  const maxPayout = sharesReceived; // Each share pays $1 if correct

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1A1A1A] p-4 rounded-lg shadow-custom space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Buy Shares</h3>
        <div className="text-xs text-gray-400">
          Polymarket Style
        </div>
      </div>

      <div className="text-sm text-gray-300 mb-4">
        {marketTitle}
      </div>

      {/* Polymarket-style Yes/No Buttons with Prices */}
      <div className="space-y-3">
        <div className="flex space-x-3">
          <button
            onClick={() => setVoteChoice('yes')}
            className={`flex-1 p-4 rounded-lg border-2 transition ${
              voteChoice === 'yes'
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-600 hover:border-green-500/50'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">YES</div>
              <div className="text-2xl font-bold text-white">${yesPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-400">{Math.round(yesPrice * 100)}% chance</div>
            </div>
          </button>
          
          <button
            onClick={() => setVoteChoice('no')}
            className={`flex-1 p-4 rounded-lg border-2 transition ${
              voteChoice === 'no'
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-600 hover:border-red-500/50'
            }`}
          >
            <div className="text-center">
              <div className="text-lg font-bold text-red-400">NO</div>
              <div className="text-2xl font-bold text-white">${noPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-400">{Math.round(noPrice * 100)}% chance</div>
            </div>
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Amount to Spend
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full pl-8 pr-3 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#6E54FF] text-lg"
            placeholder="10.00"
            min="0.01"
            step="0.01"
          />
        </div>
      </div>

      {/* Polymarket-style Summary */}
      <div className="bg-[#2A2A2A] p-4 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Shares</span>
          <span className="text-white font-medium">{sharesReceived.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Avg price</span>
          <span className="text-white font-medium">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Max payout</span>
          <span className="text-green-400 font-medium">${maxPayout.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Potential return</span>
          <span className="text-green-400 font-medium">
            +${(maxPayout - amount).toFixed(2)} ({(((maxPayout - amount) / amount) * 100).toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={handleVote}
        disabled={!isConnected || isVoting}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
          !isConnected || isVoting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : voteChoice === 'yes'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {!isConnected 
          ? 'Connect Wallet' 
          : isVoting
          ? 'Buying...'
          : `Buy ${voteChoice.toUpperCase()} ${sharesReceived.toFixed(2)} shares`
        }
      </button>

      {/* Polymarket-style Info */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>• Buy shares to express your prediction</p>
        <p>• Each share pays $1.00 if your prediction is correct</p>
        <p>• You can sell your shares anytime before resolution</p>
        <p>• Prices reflect market sentiment and probability</p>
      </div>
    </motion.div>
  );
}
