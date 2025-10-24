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
    <div className="space-y-4 px-4 sm:px-6 md:px-10 text-left">
      <div className="flex flex-col xl:flex-row gap-4 w-full">
        <div className="flex-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-black border-2 border-gray-700/70 p-4 rounded-xl"
          >
            <p className="text-gray-400 text-xs font-semibold mb-1">HEY, {user.walletAddress}</p>
            <p className="text-gray-500 text-xs">Welcome back! Here's what's trending in the markets.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-black border-2 border-gray-700/70 rounded-xl p-5 space-y-4"
          >
            <div className="flex space-x-6 text-xs">
              {Object.entries(tabs).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as keyof typeof tabs)}
                  className={`pb-2 transition-all font-semibold ${
                    activeTab === key ? 'text-white border-b-2 border-[#6E54FF]' : 'text-gray-400 hover:text-gray-300'
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
                <p className="text-gray-400 text-xs font-semibold mb-2">EARNINGS</p>
                <p className="text-2xl font-bold text-white">${user.earnings.amount.toLocaleString()}</p>
                <p className="text-[#6E54FF] text-sm font-medium mt-1">{user.earnings.change}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black border-2 border-gray-700/70 rounded-xl p-5 w-full xl:w-1/2 text-center"
        >
          <p className="text-gray-400 text-xs font-semibold mb-2">TOTAL BALANCE</p>
          <p className="text-3xl font-bold text-white mb-1">${user.totalBalance.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">{user.depositRate}</p>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-transparent border-2 border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-white hover:bg-white hover:text-black transition-all"
            >
              Deposit
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#6E54FF] hover:bg-[#5940cc] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 border-[#6E54FF] shadow-lg"
            >
              Withdraw
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black border-2 border-gray-700/70 rounded-xl p-5 space-y-4"
      >
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-400 font-semibold">TRANSACTIONS</p>
          <span className="bg-gray-800 text-xs px-3 py-1 rounded-full text-gray-400 font-medium">LAST MONTH</span>
        </div>

        {transactions.map((tx) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * tx.id }}
            className="flex items-center justify-between border-t-2 border-gray-700/50 pt-4 mt-4 hover:bg-gray-900/30 transition-colors p-3 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="text-sm text-white font-medium">{tx.question}</p>
                <p className="text-xs text-gray-500">Posted on {tx.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <p className="text-sm font-semibold text-white">${tx.amount.toFixed(2)}</p>
              <span className="flex items-center text-xs bg-[#6E54FF]/20 text-[#6E54FF] px-2 py-1 rounded-full font-medium">
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
