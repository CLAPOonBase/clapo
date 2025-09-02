"use client";

import { useState, useEffect } from "react";
import { OpinionCard } from "./OpinionCard";
import { Opinion } from "@/app/types";
import { mockOpinions } from "@/app/lib/mockdata";
import { Search } from "lucide-react";
import UserDetails from "./UserDetails";
import { motion, AnimatePresence } from "framer-motion";
import { useOpinioContext } from "@/app/Context/OpinioContext";
import OpinioWalletConnect from "@/app/components/OpinioWalletConnect";
import { useRouter } from "next/navigation";
import { MarketProbabilities } from "@/app/components/MarketProbabilities";


const navItems = [
  { label: "ALL" },
  { label: "TRENDING" },
  { label: "NEW" },
  { label: "ACTIVE" },
  { label: "CLOSED" },
  { label: "TECHNOLOGY" },
  { label: "POLITICS" },
  { label: "ECONOMY" },
  { label: "SPORTS" },
  { label: "CRYPTO" },
];

export default function MainVoting() {
  const [opinions] = useState<Opinion[]>(mockOpinions);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  
  const router = useRouter();
  const { isConnected, markets, refreshData } = useOpinioContext();
  
  console.log('🔍 MainVoting render - markets:', markets);
  
  // Refresh data when component mounts (only once)
  useEffect(() => {
    if (isConnected && refreshData) {
      console.log('🔄 MainVoting useEffect - refreshing full data...');
      refreshData().catch(err => {
        console.error('Failed to refresh data:', err);
      });
    }
    // Markets are loaded once on app initialization - no need to refresh
  }, [isConnected, refreshData]);
  
  useEffect(() => {
    console.log('🔄 MainVoting useEffect - markets changed:', markets);
    if (markets && markets.length > 0) {
      console.log('🔄 Markets details:', markets.map(m => ({
        title: m.title,
        description: m.description,
        category: m.category,
        endDate: m.endDate
      })));
    }
  }, [markets]);

  // Filter real markets based on selected category and validity
  const filteredMarkets = markets ? markets.filter((market) => {
    // Filter out invalid markets (empty titles, wrong dates, etc.)
    if (!market.title || market.title.trim() === '' || 
        Number(market.endDate) === 0 || 
        market.creator === '0x0000000000000000000000000000000000000000') {
      return false;
    }
    
    // Apply category filtering
    if (selectedCategory === "ALL") {
      return true; // Show all valid markets
    }
    if (selectedCategory === "TRENDING") {
      return Number(market.totalVotes) > 1000;
    }
    if (selectedCategory === "NEW") {
      const createdAt = new Date(Number(market.createdAt) * 1000);
      const now = new Date();
      const diffInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      return diffInHours <= 72;
    }
    if (selectedCategory === "ACTIVE") {
      return market.isActive === true;
    }
    if (selectedCategory === "CLOSED") {
      return market.isActive === false;
    }
    // For other categories, check if market category matches
    return market.category && market.category.toLowerCase() === selectedCategory.toLowerCase();
  }) : [];

  return (
    <motion.div
      className="space-y-6 px-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <UserDetails />

      {!isConnected ? (
        <OpinioWalletConnect />
      ) : (
        <>
          <div>
        <div className="flex space-x-6 justify-center items-center border-b border-[#2A2A2A] overflow-x-auto pb-4">
          {navItems.map(({ label }) => (
            <button
              key={label}
              onClick={() => setSelectedCategory(label)}
              className={`pb-2 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === label
                  ? "text-[#6E54FF] border-b-2 border-[#6E54FF]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-full mt-4 flex justify-center items-center px-4 py-3 rounded-md bg-[#1A1A1A] border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
          <Search className="text-gray-400 mr-2" />
          <input
            type="search"
            placeholder="Search Market"
            className="w-full p-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            onClick={() => window.location.reload()}
            className="ml-2 p-2 bg-[#6E54FF] hover:bg-[#836EF9] rounded-md transition-colors"
            title="Refresh Markets"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        {/* Debug Info */}
        <div className="text-xs text-gray-400 text-center">
          Markets: {markets?.length || 0} | Filtered: {filteredMarkets?.length || 0} | 
          Ready | 
          {isConnected ? ' Connected' : ' Not Connected'}
        </div>
      </div>



          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {false ? (
                <div className="col-span-full text-center text-gray-400">
                  Loading markets from blockchain...
                </div>
              ) : filteredMarkets && filteredMarkets.length > 0 ? (
                filteredMarkets.map((market, index) => (
                  <motion.div
                    key={index}
                    className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] hover:border-[#6E54FF]/30 transition-all duration-200 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] hover:shadow-[0px_8px_30px_0px_rgba(110,84,255,0.1)] cursor-pointer"
                    onClick={() => router.push(`/opinio/market-${market.marketId}`)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-[#6E54FF] rounded-md shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]">
                        <span className="text-white text-xs font-bold">M</span>
                      </div>
                      <h3 className="text-white font-medium text-sm">{market.title}</h3>
                    </div>

                    {market.description && (
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                        {market.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">MARKET ID</span>
                        <span className="text-white">#{market.marketId}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">STATUS</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          market.isActive 
                            ? 'bg-green-900/30 text-green-400' 
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {market.isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">CATEGORY</span>
                        <span className="text-white">{market.category || 'General'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">END DATE</span>
                        <span className="text-white">{new Date(Number(market.endDate) * 1000).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Market Probabilities */}
                    <div className="mb-4">
                      <MarketProbabilities 
                        marketId={Number(market.marketId)} 
                        className="w-full"
                        refreshTrigger={Date.now()}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Created by: {market.creator.slice(0, 6)}...{market.creator.slice(-4)}</span>
                      <span>
                        <div className="flex justify-center items-center">
                          <span className="text-gray-400">Market By</span>
                          <img
                            src="/navlogo.png"
                            alt="clapo logo"
                            className="w-auto h-4"
                          />
                          <img
                            src="/verified.svg"
                            alt="clapo logo"
                            className="w-auto h-2 px-1"
                          />
                        </div>
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center">
                  <p className="text-gray-400 mb-2">
                    No markets found on blockchain. Create one to get started!
                  </p>
                                          <p className="text-yellow-400 text-sm">
                          Debug: markets = {(() => {
                            try {
                              return JSON.stringify(markets, (key, value) => 
                                typeof value === 'bigint' ? value.toString() : value
                              );
                            } catch (err) {
                              return 'Error serializing markets data';
                            }
                          })()}
                        </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}
      

    </motion.div>
  );
}
