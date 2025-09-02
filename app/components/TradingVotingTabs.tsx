'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VotingInterface from './VotingInterface';
import { TradingInterface } from './TradingInterface';

interface TradingVotingTabsProps {
  marketId: number;
  marketTitle: string;
  marketData?: any;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

type TabType = 'trading' | 'voting';

export default function TradingVotingTabs({ 
  marketId, 
  marketTitle, 
  marketData,
  onSuccess, 
  onError 
}: TradingVotingTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('trading');

  const tabs = [
    { id: 'trading' as TabType, label: 'Trade Shares', icon: '📊' },
    { id: 'voting' as TabType, label: 'Buy Shares', icon: '💰' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#2A2A2A] p-1 rounded-lg mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#6E54FF] text-white shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]'
                : 'text-gray-400 hover:text-white hover:bg-[#3A3A3A]'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'trading' ? (
            <TradingInterface
              marketId={marketId}
              marketTitle={marketTitle}
              marketData={marketData}
              onTradeSuccess={onSuccess}
              onError={onError}
            />
          ) : (
            <VotingInterface
              marketId={marketId}
              marketTitle={marketTitle}
              onVoteSuccess={onSuccess}
              onError={onError}
            />
          )}
        </motion.div>
      </div>

      {/* Tab Info */}
      <div className="mt-4 p-3 bg-[#1A1A1A] rounded-md border border-[#2A2A2A]">
        <div className="text-xs text-gray-400">
          {activeTab === 'trading' ? (
            <div className="space-y-1">
              <p><strong>Trading:</strong> Buy/sell shares to profit from price movements</p>
              <p>• LONG = bet the outcome will happen</p>
              <p>• SHORT = bet the outcome won't happen</p>
              <p>• Trade anytime before market closes</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p><strong>Buy Shares (Polymarket Style):</strong> Express predictions by buying shares</p>
              <p>• YES shares = you think it will happen</p>
              <p>• NO shares = you think it won't happen</p>
              <p>• Each share pays $1.00 if you're correct</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
