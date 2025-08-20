'use client';

import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import UserDetails from "../Sections/UserDetails";
import { motion } from "framer-motion";
import TradingTabs from "../Sections/TradingTabs";

interface ChartDataItem {
  time: string;
  value: number;
}

interface ChartData {
  [key: string]: ChartDataItem[];
}

const MyPortfolioPage = () => {
  const portfolio = 123456.78;
  const [selectedPeriod, setSelectedPeriod] = useState<'1d' | '1w' | '1m' | '1y'>('1d');

  const chartData: ChartData = {
    '1d': [
      { time: '9AM', value: 123000 },
      { time: '10AM', value: 123150 },
      { time: '11AM', value: 123200 },
      { time: '12PM', value: 123180 },
      { time: '1PM', value: 123250 },
      { time: '2PM', value: 123300 },
      { time: '3PM', value: 123280 },
      { time: '4PM', value: 123350 },
      { time: '5PM', value: 123400 },
      { time: '6PM', value: 123456.78 },
    ],
    '1w': [
      { time: 'Mon', value: 122000 },
      { time: 'Tue', value: 122800 },
      { time: 'Wed', value: 123200 },
      { time: 'Thu', value: 122900 },
      { time: 'Fri', value: 123400 },
      { time: 'Sat', value: 123300 },
      { time: 'Sun', value: 123456.78 },
    ],
    '1m': [
      { time: 'W1', value: 120000 },
      { time: 'W2', value: 121200 },
      { time: 'W3', value: 122100 },
      { time: 'W4', value: 123456.78 },
    ],
    '1y': [
      { time: 'Jan', value: 115000 },
      { time: 'Mar', value: 118000 },
      { time: 'Jun', value: 120500 },
      { time: 'Sep', value: 121800 },
      { time: 'Dec', value: 123456.78 },
    ],
  };

  const initialPortfolioValue = 120000;
  const profitLoss = portfolio - initialPortfolioValue;
  const isProfit = profitLoss > 0;
  const profitLossPercentage = ((profitLoss / initialPortfolioValue) * 100).toFixed(2);

  const periods: { key: '1d' | '1w' | '1m' | '1y'; label: string }[] = [
    { key: '1d', label: '1d' },
    { key: '1w', label: '1w' },
    { key: '1m', label: '1m' },
    { key: '1y', label: '1y' },
  ];

  return (
    <motion.div
      className="px-4 sm:px-6 space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <UserDetails />

      <div className="w-full flex flex-col lg:flex-row gap-4">
        <div className="bg-[#1A1A1A] p-4 space-y-4 rounded-md w-full flex flex-col text-left group border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
          <div className="justify-between flex">
            <span className="flex items-center">
              <ArrowRight className="-rotate-45 text-green-500 transition-transform duration-200" />
              Portfolio
            </span>
            <span
              className={`text-[8px] rounded-full px-2 flex justify-center items-center py-1 ${
                isProfit ? 'bg-green-700' : 'bg-red-700'
              }`}
            >
              {isProfit ? '+' : ''}
              {profitLossPercentage}%
            </span>
          </div>
          <span className="text-2xl text-white font-semibold">
            ${portfolio.toLocaleString()}
          </span>
          <span
            className={`${
              isProfit ? 'text-green-500' : 'text-red-500'
            } text-[8px] flex items-center gap-1`}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isProfit ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></span>
            {isProfit ? '+' : '-'}${Math.abs(profitLoss).toFixed(2)}{' '}
            <span className="text-gray-400">Today</span>
          </span>
          <div className="flex space-x-2">
            <button className="bg-[#2A2A2A] text-white rounded-md px-4 py-2 w-full hover:bg-[#3A3A3A] transition-all duration-200 font-medium border border-[#2A2A2A]">
              Deposit
            </button>
            <button className="bg-[#6E54FF] text-white rounded-md px-4 py-2 w-full hover:bg-[#836EF9] transition-all duration-200 font-medium shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]">
              Withdraw
            </button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] p-4 space-y-4 rounded-md w-full flex flex-col text-left border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
          <div className="justify-between flex">
            <span className="flex items-center">
              {isProfit ? (
                <TrendingUp className="text-green-500" />
              ) : (
                <TrendingDown className="text-red-500" />
              )}
              Profit/Loss
            </span>
            <div className="flex text-[8px] space-x-1">
              {periods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key)}
                  className={`transition-colors duration-200 hover:text-white ${
                    selectedPeriod === period.key
                      ? 'text-white bg-[#6E54FF] rounded-md px-3 font-bold shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]'
                      : 'text-gray-400 px-3'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <span className="text-2xl text-white">
            ${Math.abs(profitLoss).toFixed(2)}
          </span>
          <span
            className={`${
              isProfit ? 'text-green-500' : 'text-red-500'
            } text-[8px]`}
          >
            {isProfit ? '+' : '-'}${Math.abs(profitLoss).toFixed(2)}{' '}
            <span className="text-gray-400">
              {selectedPeriod === '1d'
                ? 'Today'
                : selectedPeriod === '1w'
                ? 'This Week'
                : selectedPeriod === '1m'
                ? 'This Month'
                : 'This Year'}
            </span>
          </span>
          <div className="h-14" key={selectedPeriod}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData[selectedPeriod]}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                  tickFormatter={(value: number) =>
                    `$${value.toLocaleString()}`
                  }
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(31, 41, 55)',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                  labelStyle={{ color: '#cbd5e1' }}
                  formatter={(value: number | string) => [
                    `$${parseFloat(value as string).toLocaleString()}`,
                    'Value',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isProfit ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: isProfit ? '#10b981' : '#ef4444',
                    stroke: '#ffffff',
                    strokeWidth: 1,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <TradingTabs />
    </motion.div>
  );
};

export default MyPortfolioPage;
