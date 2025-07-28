'use client';
import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const user = {
  walletAddress: '0X0X...EBD',
  totalBalance: 81910,
  earnings: {
    amount: 21500,
    change: '12%',
  },
  depositRate: '2.03X',
};

const transactions = [
  {
    id: 1,
    question: 'Who wins US election?',
    date: '15 July',
    amount: 20.3,
    status: 'settled',
  },
];

const tabs = {
  spending: 'SPENDING',
  earnings: 'EARNINGS',
} as const;

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>('earnings');

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-10 text-left">
      <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="flex-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-dark-800 p-4 rounded-xl text-sm"
          >
            <p className="text-[#999]">HEY, {user.walletAddress}</p>
            <p className="text-[#666]">Welcome back! Here’s what’s trending in the markets.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-dark-800 rounded-xl p-6 space-y-4"
          >
            <div className="flex space-x-4 text-sm">
              {Object.entries(tabs).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as keyof typeof tabs)}
                  className={`pb-2 ${
                    activeTab === key ? 'text-white border-b-2 border-primary' : 'text-[#888]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'earnings' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-[#aaa] text-xs">EARNING</p>
                <p className="text-3xl font-bold">${user.earnings.amount.toLocaleString()}</p>
                <p className="text-green-500 text-sm">{user.earnings.change}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-dark-800 rounded-xl p-6 w-full xl:w-1/2 text-center"
        >
          <p className="text-[#888] text-xs">TOTAL BALANCE</p>
          <p className="text-4xl font-bold">${user.totalBalance.toLocaleString()}</p>
          <p className="text-[#888] text-sm">{user.depositRate}</p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="w-full bg-white text-black px-4 py-2 rounded-lg text-sm font-medium">
              DEPOSIT
            </button>
            <button className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
              WITHDRAW
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-dark-800 rounded-xl p-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#aaa]">TRANSACTION</p>
          <span className="bg-[#333] text-xs px-3 py-1 rounded-full">LAST MONTH</span>
        </div>

        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * tx.id }}
            className="flex items-center justify-between border-t border-[#333] pt-4 mt-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#666] flex items-center justify-center text-white text-sm">
                🤖
              </div>
              <div>
                <p className="text-sm">{tx.question}</p>
                <p className="text-xs text-[#777]">Posted on {tx.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm font-medium">${tx.amount.toFixed(2)}</p>
              <span className="flex items-center text-xs bg-green-700 text-white px-2 py-1 rounded-full">
                <CheckCircle2 className="mr-1" size={12} />
                {tx.status}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default WalletPage;
