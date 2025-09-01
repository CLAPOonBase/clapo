"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useOpinioContext } from "@/app/Context/OpinioContext";
import { useParams, useRouter } from "next/navigation";
import TradingVotingTabs from "@/app/components/TradingVotingTabs";
import MarketProbabilities from "@/app/components/MarketProbabilities";

function OpinionDetailPage() {
  const [marketData, setMarketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const params = useParams();
  const router = useRouter();
  const { markets, getMarket, isConnected } = useOpinioContext();
  
  const marketId = params.slug ? parseInt((params.slug as string).replace('market-', '')) : null;
  
  useEffect(() => {
    const loadMarketData = async () => {
      if (marketId === null) {
        setLoading(false);
        return;
      }

      console.log('🔍 Loading market data for ID:', marketId);
      console.log('📊 Available markets:', markets);

      try {
        // First try to find the market in the markets array
        if (markets && markets.length > 0) {
          const foundMarket = markets.find(market => 
            market.marketId === marketId || 
            market.marketId === BigInt(marketId) ||
            Number(market.marketId) === marketId
          );
          
          if (foundMarket) {
            console.log('✅ Found market in markets array:', foundMarket);
            setMarketData(foundMarket);
            setLoading(false);
            return;
          }
        }

        // If not found in markets array, try to fetch directly
        if (getMarket && isConnected) {
          console.log('🔄 Fetching market directly from contract...');
          const market = await getMarket(marketId);
          console.log('✅ Fetched market from contract:', market);
          setMarketData(market);
          setLoading(false);
        } else if (!isConnected) {
          console.log('❌ Not connected - cannot fetch market data');
          setLoading(false);
        } else {
          console.log('❌ getMarket function not available');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Failed to load market:', error);
        setLoading(false);
      }
    };

    loadMarketData();
  }, [marketId, markets, getMarket, isConnected]);

  if (loading) {
    return (
      <div className="min-h-screen text-white bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E54FF] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="min-h-screen text-white bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            {!isConnected ? 'Please connect your wallet to view market details' : 'Market not found'}
          </p>

          <div className="space-x-4">
            <button 
              onClick={() => router.push('/opinio')}
              className="bg-[#6E54FF] hover:bg-[#836EF9] text-white px-4 py-2 rounded-lg transition-colors"
            >
              {!isConnected ? 'Connect Wallet & View Markets' : 'Back to Markets'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-[#0A0A0A]">
      {/* Back Button */}
      <div className="p-4">
        <button 
          onClick={() => router.push('/opinio')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Markets</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-4">
        {/* Main Content */}
        <div className="flex-1">
          {/* Market Header */}
          <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] mb-6">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-[#6E54FF] rounded-md flex items-center justify-center overflow-hidden shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]">
                  <span className="text-white text-lg font-bold">M</span>
                </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white mb-2">
                  {marketData.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Market #{marketId}</span>
                  <span>•</span>
                  <span>{marketData.category || 'General'}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    marketData.isActive 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {marketData.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Market Description */}
          <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] mb-6">
            <h2 className="text-lg font-semibold mb-3">About This Market</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {marketData.description || 'No description provided for this market.'}
            </p>
            
            {marketData.tags && marketData.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {marketData.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-[#2A2A2A] text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                        </div>
                      </div>
            )}
                  </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
              <p className="text-xs text-gray-400 mb-1">Total Liquidity</p>
              <p className="text-lg font-semibold text-white">
                ${(Number(marketData.totalLiquidity) / 1e6).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
              <p className="text-xs text-gray-400 mb-1">Total Shares</p>
              <p className="text-lg font-semibold text-white">
                {(Number(marketData.totalShares) / 1e6).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
              <p className="text-xs text-gray-400 mb-1">Total Votes</p>
              <p className="text-lg font-semibold text-white">
                {Number(marketData.totalVotes).toLocaleString()}
              </p>
            </div>
            <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
              <p className="text-xs text-gray-400 mb-1">End Date</p>
              <p className="text-lg font-semibold text-white">
                {new Date(Number(marketData.endDate) * 1000).toLocaleDateString()}
              </p>
            </div>
            </div>

          {/* Market Probabilities */}
          {marketId && (
            <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] mb-6">
              <h2 className="text-lg font-semibold mb-4">Market Probabilities</h2>
              <MarketProbabilities 
                marketId={marketId} 
                className="w-full"
                refreshTrigger={Date.now()}
              />
            </div>
          )}

          {/* Market Creator Info */}
          <div className="bg-[#1A1A1A] rounded-lg p-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Market Created By</span>
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-mono">
                  {marketData.creator.slice(0, 6)}...{marketData.creator.slice(-4)}
                </span>
                <Image
                  src="/navlogo.png"
                  alt="Clapo Logo"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trading/Voting Panel */}
        <div className="w-full lg:w-96">
          <div className="sticky top-4">
            {!isConnected ? (
              <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] text-center">
                <p className="text-gray-400 mb-4">Connect your wallet to trade or vote</p>
                <button 
                  onClick={() => router.push('/opinio')}
                  className="bg-[#6E54FF] hover:bg-[#836EF9] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Connect Wallet
                </button>
              </div>
            ) : marketId && marketData ? (
              <TradingVotingTabs
                marketId={marketId}
                marketTitle={marketData.title || 'Unknown Market'}
                marketData={marketData}
                onSuccess={() => {
                  console.log('✅ Trade/Vote successful');
                }}
                onError={(error) => {
                  console.error('❌ Trade/Vote error:', error);
                  alert(error);
                }}
              />
            ) : (
              <div className="bg-[#1A1A1A] rounded-lg p-6 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] text-center">
                <p className="text-gray-400">Market data not available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OpinionDetailPage;
