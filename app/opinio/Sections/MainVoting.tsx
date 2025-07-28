'use client';

import { useState } from 'react';
import { OpinionCard } from './OpinionCard';
import { Opinion } from '@/app/types';
import { mockOpinions } from '@/app/lib/mockdata';
import { Search } from 'lucide-react';

const navItems = [
  { label: 'TRENDING' },
  { label: 'NEW' },
  { label: 'POLITICS' },
  { label: 'SPORTS' },
  { label: 'CRYPTO' },
  { label: 'TECH' },
  { label: 'CELEBRITY' },
  { label: 'WORLD' },
  { label: 'ECONOMY' },
  { label: 'TRUMP' },
  { label: 'ELECTIONS' },
  { label: 'MENTIONS' }
];

export default function MainVoting() {
  const [opinions] = useState<Opinion[]>(mockOpinions);
  const [selectedCategory, setSelectedCategory] = useState<string>('TRENDING');
  const user_id = '0000.....021212'; 
  const balance = 1000;

  const filteredOpinions = opinions.filter((opinion) => {
    if (selectedCategory === 'TRENDING') {
      return opinion.totalVotes > 1000;
    }
    if (selectedCategory === 'NEW') {
      const createdAt = new Date(opinion.createdAt);
      const now = new Date();
      const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return diffInHours <= 72;
    }
    return opinion.category === selectedCategory;
  });

  return (
    <div className="space-y-6 px-6">
      <div className='w-full rounded-md flex space-x-4 justify-between'>
        <div className='bg-dark-800 p-4 rounded-md w-full flex flex-col text-left'>
          <span className='text-2xl'>Hey, {user_id}</span>
          <span className='text-secondary'>Welcome back! Here&apos;s what trending in the markets.</span>
        </div>
        <div className='bg-dark-800 p-4 rounded-md w-full flex justify-between items-center'>
         <div className='flex flex-col items-start text-white'>
 <span>Balance</span>
          <span className='text-2xl text-secondary'>${balance}</span>
         </div>
          <div>
 <button className='bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition'>
  Make Deposit
 </button>
         </div>
        </div>
      </div>
        <div>
 <div className="flex space-x-6 justify-center items-center border-b border-secondary-light/10 overflow-x-auto">
        {navItems.map(({ label }) => (
          <button
            key={label}
            onClick={() => setSelectedCategory(label)}
            className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === label
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
        
      </div>
      <div className='w-full mt-4 flex justify-center items-center px-4 rounded-md bg-dark-800'>
        <Search className='text-secondary'/>
      <input type="search" name="" id="" placeholder='Search Market' className='w-full p-2 bg-transparent' />
      </div>
        </div>
     
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredOpinions.length > 0 ? (
          filteredOpinions.map((opinion) => (
            <OpinionCard key={opinion.id} opinion={opinion} />
          ))
        ) : (
          <p className="text-center col-span-full text-secondary">No opinions found in this category.</p>
        )}
      </div>
    </div>
  );
}
