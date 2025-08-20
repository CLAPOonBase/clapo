'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

const tabs = ['Position', 'Open Orders', 'History'];

const demoData = [
  { market: 'BTC/USD', date: 'Aug 1 - Nov 1', bet: '$500', toWin: '$750', value: '$1,250' },
  { market: 'ETH/USD', date: 'Aug 5 - Nov 10', bet: '$300', toWin: '$600', value: '$900' },
  { market: 'SOL/USD', date: 'Aug 3 - Nov 3', bet: '$200', toWin: '$300', value: '$500' }
];

export default function TradingTabs() {
  const [activeTab, setActiveTab] = useState('Position');
  const [search, setSearch] = useState('');

  const filteredData = demoData.filter(row =>
    row.market.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#1A1A1A] text-white rounded-xl w-full mx-auto p-4 space-y-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
      <div className="flex items-center space-x-4 text-sm border-b justify-between border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'py-2 px-3 w-full border-b-2 transition-colors duration-200',
              activeTab === tab
                ? 'border-[#6E54FF] text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            )}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'Position' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
         <div className='w-full flex items-center border border-[#2A2A2A] rounded-md bg-transparent px-3 py-2 space-x-2'>
               <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent w-full outline-none placeholder:text-gray-400 text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
         </div>
            <button className="ml-2 text-sm text-nowrap px-3 py-2 bg-[#2A2A2A] border-[#2A2A2A] border rounded-md text-gray-400 hover:text-white transition-colors">
              CURRENT VALUE
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400">
                  <th className="p-2">Market</th>
                  <th className="p-2">Aug → Nov</th>
                  <th className="p-2">Bet</th>
                  <th className="p-2">To Win</th>
                  <th className="p-2">Value ↓</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-700 hover:bg-slate-800">
                    <td className="p-2">{row.market}</td>
                    <td className="p-2">{row.date}</td>
                    <td className="p-2">{row.bet}</td>
                    <td className="p-2">{row.toWin}</td>
                    <td className="p-2">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Open Orders' && (
        <div className="text-gray-400 text-sm p-4 bg-[#2A2A2A] rounded-md text-center border border-[#2A2A2A]">
          No open orders right now.
        </div>
      )}

      {activeTab === 'History' && (
        <div className="text-gray-400 text-sm p-4 bg-[#2A2A2A] rounded-md text-center border border-[#2A2A2A]">
          No history to show.
        </div>
      )}
    </div>
  );
}
