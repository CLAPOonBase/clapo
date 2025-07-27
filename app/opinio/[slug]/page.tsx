"use client";

import React, { useState, ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, Minus, Plus } from "lucide-react";
import DualLineChart from "./Sections/DualCharts";
import Image from "next/image";

// ---- Types ----

type PredictionOption = {
  label: string;
  percent: number;
  yesPrice: number;
  noPrice: number;
  value: number;
};

type Opinion = {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
};

type TimelineEvent = {
  date: string;
  time: string;
  event: string;
  description: string;
};

type PeopleDatum = {
  name: string;
  avatar: string;
};

type UserVote = {
  prediction: number;
  confidence: number;
};

type OrderType = "Market" | "Limit";
type ModeType = "buy" | "sell";
type OutcomeType = "yes" | "no";

export default function OpinionDetailPage() {
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  const [showPeople, setShowPeople] = useState<boolean>(false);
  

  // Mock data
  const opinionmock = {
    cutBasisPoints: 25,
    category: "FEDERAL RESERVE",
    description:
      "The Federal Reserve's benchmark interest rate policy affects economic conditions and market sentiment during key financial periods.",
    createdAt: "2024-01-15",
    expiryDate: "2024-12-31",
    totalVotes: 15847,
  };

  const opinion: Opinion = {
    id: "1",
    slug: "fed-rate-decision",
    title: "Fed Rate Decision March 2024",
    image: "https://via.placeholder.com/32x32/ff6b35/ffffff?text=FED",
    category: "FEDERAL RESERVE",
  };

  const timelineEvents: TimelineEvent[] = [
    {
      date: "JAN 30, 2024",
      time: "2:15 PM EST",
      event: "MARKET OPEN",
      description: "Fed maintains rate decision pending",
    },
    {
      date: "FEB 15, 2024",
      time: "2:00 PM EST",
      event: "POWELL CLOSES",
      description: "Federal Reserve Chairman speaks on policy",
    },
    {
      date: "MAR 20, 2024",
      time: "2:00 PM EST",
      event: "PROJECTED PAYOUT",
      description: "Expected resolution date for rate decision",
    },
  ];

  const peopleData: PeopleDatum[] = [
    { name: "NEXT FED RATE HIKE?", avatar: "person1" },
    { name: "NUMBER OF RATE CUTS IN 2024?", avatar: "person2" },
    { name: "FED FUNDS RATE IN SEPTEMBER?", avatar: "person3" },
    { name: "FED FUNDS RATE IN SEPTEMBER?", avatar: "person4" },
  ];

  const predictionOptions: PredictionOption[] = [
    {
      label: `${opinionmock.cutBasisPoints} BPS Cut`,
      percent: 45,
      yesPrice: 5.5,
      noPrice: 4.5,
      value: opinionmock.cutBasisPoints,
    },
    {
      label: "0 BPS (No Cut)",
      percent: 15,
      yesPrice: 1.5,
      noPrice: 8.5,
      value: 0,
    },
    {
      label: "50 BPS Cut",
      percent: 30,
      yesPrice: 3.1,
      noPrice: 7.1,
      value: 50,
    },
  ];

  const [userVote, setUserVote] = useState<UserVote>({
    prediction: 25,
    confidence: 70,
  });
  const [voting, setVoting] = useState<boolean>(false);

  const [selectedOption, setSelectedOption] = useState<PredictionOption>(
    predictionOptions[0]
  );
  const [mode, setMode] = useState<ModeType>("buy");
  const [orderType, setOrderType] = useState<OrderType>("Market");
  const [amount, setAmount] = useState<number>(100);
  const [limitPrice, setLimitPrice] = useState<number>(3.6);
  const [shares, setShares] = useState<number>(0);

  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType>("yes");

  const marketOptions: OrderType[] = ["Market", "Limit"];

  // Calculate shares based on amount and price
  const calculateShares = (): number => {
    const price =
      selectedOutcome === "yes"
        ? selectedOption.yesPrice
        : selectedOption.noPrice;
    return Math.floor((amount / price) * 100) / 100;
  };

  const handlePredictionClick = (
    option: PredictionOption,
    outcome: OutcomeType
  ) => {
    setSelectedOption(option);
    setSelectedOutcome(outcome);
    setUserVote({ ...userVote, prediction: option.value });
  };

  const handleVoteSubmit = async () => {
    if (
      !opinion ||
      userVote.prediction === undefined ||
      userVote.confidence === undefined
    )
      return;

    setVoting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const vote = {
      id: Math.random().toString(36).substr(2, 9),
      opinionId: opinion.id,
      userId: "current-user",
      prediction: userVote.prediction,
      confidence: userVote.confidence,
      createdAt: new Date().toISOString(),
    };

    console.log("Vote submitted:", vote);
    setVoting(false);
    alert("Your vote has been recorded!");
  };

  return (
    <div className="min-h-screen text-white">
      {/* Mobile Header */}
      <div className="lg:hidden p-4 bg-dark-800 border-gray-700 mx-4 my-2 rounded-md md:px-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center overflow-hidden">
            <img
              src={opinion.image}
              alt={opinion.title}
              className="w-6 h-6 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-white truncate">
              {opinion.title}
            </h1>
            <div className="text-xs text-gray-400">$121,212,122 VOL</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 lg:order-1">
          {/* Desktop Header */}
          <div className="hidden lg:block px-4 lg:px-6 py-2">
            <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500 rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src={opinion.image}
                    alt={opinion.title}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h1 className="text-lg font-semibold text-white">
                  {opinion.title}
                </h1>
              </div>
              <div className="text-gray-400 text-sm">$121,212,122 VOL</div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="px-4 lg:px-6 py-2">
            <div className="bg-dark-800 rounded-lg p-4">
              <DualLineChart />
            </div>
          </div>

          {/* Prediction Options */}
          <div className="px-4 lg:px-6 py-2">
            <div className="space-y-3 mb-6">
              {predictionOptions.map((item, idx) => (
                <motion.div
                  key={idx}
                  className={`p-4 rounded-lg transition-all duration-200 ${
                    selectedOption.value === item.value
                      ? " bg-dark-800 shadow-lg"
                      : " bg-dark-800 hover:border-gray-500"
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-sm">{item.label}</span>
                      <div className="text-right">
                        <div className="font-bold text-lg">{item.percent}%</div>
                        <div className="text-xs text-gray-400">
                          YES {item.yesPrice}¢
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className={`flex-1 py-3 rounded text-xs font-semibold transition-colors ${
                          selectedOption.value === item.value &&
                          selectedOutcome === "yes"
                            ? "bg-green-600 text-white"
                            : "bg-white text-black hover:bg-green-700 hover:text-white"
                        }`}
                        onClick={() => handlePredictionClick(item, "yes")}
                      >
                        YES ${item.yesPrice}
                      </button>
                      <button
                        className={`flex-1 py-3 rounded text-xs font-semibold transition-colors ${
                          selectedOption.value === item.value &&
                          selectedOutcome === "no"
                            ? "bg-red-600 text-white"
                            : "bg-gray-900 text-purple-400 hover:bg-red-700 hover:text-white"
                        }`}
                        onClick={() => handlePredictionClick(item, "no")}
                      >
                        NO ${item.noPrice}
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-8 lg:space-x-12">
                      <div className="text-right">
                        <div className="font-bold text-lg">{item.percent}%</div>
                        <div className="text-xs text-gray-400">
                          YES {item.yesPrice}¢
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          className={`px-6 lg:px-10 py-3 rounded text-xs font-semibold transition-colors ${
                            selectedOption.value === item.value &&
                            selectedOutcome === "yes"
                              ? "bg-green-600 text-white"
                              : "bg-white text-black hover:bg-green-700 hover:text-white"
                          }`}
                          onClick={() => handlePredictionClick(item, "yes")}
                        >
                          YES ${item.yesPrice}
                        </button>
                        <button
                          className={`px-6 lg:px-10 py-3 rounded text-xs font-semibold transition-colors ${
                            selectedOption.value === item.value &&
                            selectedOutcome === "no"
                              ? "bg-red-600 text-white"
                              : "bg-gray-900 text-purple-400 hover:bg-red-700 hover:text-white"
                          }`}
                          onClick={() => handlePredictionClick(item, "no")}
                        >
                          NO ${item.noPrice}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rules Summary */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">
                <span className="underline text-xl lg:text-2xl block">
                  RULES SUMMARY
                </span>
                <span className="text-green-500 text-xs block mt-1">
                  Fed Maintain Rate
                </span>
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                If the Federal Reserve does a Hike of 0bps on July 30, 2025,
                then the market resolves to Yes. Outcome verified from
              </p>
              <div className="mt-8">
                <span className="underline text-xl lg:text-2xl block mb-2">
                  FEDERAL RESERVE
                </span>
                <p className="text-sm text-gray-400 mb-4">
                  This market is mutually exclusive. Therefore, if the Federal
                  Reserve hikes by 50bps, the 50bps market will resolve to Yes
                  and the 25bps market will resolve to No. Only one bucket, at
                  maximum, can resolve to Yes. Note 4/28/25: For the…
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-green-500 rounded-md text-xs p-2 border border-green-500/20">
                  View Full Rules
                </span>
                <span className="text-green-500 rounded-md text-xs p-2 border border-green-500/20">
                  Help Center
                </span>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="mb-6 border-y border-gray-600">
              <motion.div
                className="flex items-center justify-between cursor-pointer px-4 py-3"
                onClick={() => setShowTimeline(!showTimeline)}
              >
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>TIMELINE AND PAYOUT</span>
                </div>
                <motion.div
                  animate={{ rotate: showTimeline ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4 text-gray-400 border rounded-full border-gray-600" />
                </motion.div>
              </motion.div>

              <AnimatePresence>
                {showTimeline && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="px-4 lg:px-6 py-2 pb-6"
                  >
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-700" />
                      {timelineEvents.map((event, idx) => {
                        const isCompleted = idx === 0;
                        return (
                          <div
                            key={idx}
                            className="flex items-start relative mb-6 last:mb-0"
                          >
                            <div
                              className={`z-10 relative w-6 h-6 flex items-center justify-center rounded-full text-white text-xs font-bold ${
                                isCompleted ? "bg-green-500" : "bg-gray-500"
                              }`}
                            >
                              ✓
                            </div>
                            <div className="ml-6">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">
                                  {event.event}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {event.date} {event.time}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {event.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* About Section */}
            <div className="mb-6">
              <h3 className="text-xl lg:text-2xl underline mb-3">ABOUT</h3>
              <p className="text-sm text-gray-400 mb-4">
                The FOMC meeting determines interest rate policy, timing rates
                moves down the economy and market conditions. Federal Reserve
                decisions during the time frames impact conditions such as a
                unique bitcoin as a hedge to protect somebodys finances.
              </p>
            </div>

            {/* People Also Buying Section */}
            <div className="mb-6">
              <h3 className="text-xl lg:text-2xl underline mb-3">
                PEOPLE ARE ALSO BUYING
              </h3>
              <div className="space-y-3">
                {peopleData
                  .slice(0, showPeople ? peopleData.length : 2)
                  .map((person, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center space-x-3 p-2 rounded hover:bg-dark-800/50 transition-colors cursor-pointer"
                    >
                      <img
                        src={`https://robohash.org/${person.avatar}.png?size=32x32`}
                        alt=""
                        className="w-8 h-8 rounded-md bg-orange-500"
                      />
                      <span className="text-xs font-medium">{person.name}</span>
                    </motion.div>
                  ))}
              </div>

              {!showPeople && peopleData.length > 2 && (
                <motion.button
                  className="text-xs text-green-500 rounded-md px-2 py-1 border border-green-500/20 hover:text-green-400 mt-2 transition-colors"
                  onClick={() => setShowPeople(true)}
                  whileHover={{ scale: 1.05 }}
                >
                  Show {peopleData.length - 2} more
                </motion.button>
              )}

              {showPeople && (
                <motion.button
                  className="text-xs text-green-500 px-2 py-1 border border-green-500/20 rounded-md hover:text-green-400 mt-2 transition-colors"
                  onClick={() => setShowPeople(false)}
                  whileHover={{ scale: 1.05 }}
                >
                  Show less
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Trading Panel - Mobile Bottom, Desktop Right */}
        <div className="w-full lg:w-96 lg:order-2 rounded-md px-4 md:px-0 md:pr-4 py-2">
          <div className="sticky top-0 bg-dark-800 rounded-md px-4 lg:px-6 py-2">
            {/* Panel Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center overflow-hidden">
                <img
                  src={opinion.image}
                  alt={opinion.title}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-widest">
                  {selectedOption.label}
                </div>
                <div className="text-xs text-green-500 font-medium">
                  {opinion.category.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Buy/Sell Toggle */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded text-xs font-bold transition ${
                    mode === "buy"
                      ? "bg-white text-green-500"
                      : "bg-gray-700 text-white"
                  }`}
                  onClick={() => setMode("buy")}
                >
                  Buy
                </button>
                <button
                  className={`px-4 py-2 rounded text-xs font-bold transition ${
                    mode === "sell"
                      ? "bg-red-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                  onClick={() => setMode("sell")}
                >
                  Sell
                </button>
              </div>

              <select
                value={orderType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setOrderType(e.target.value as OrderType)
                }
                className="bg-gray-700 text-white rounded px-3 py-2 text-xs border border-gray-600"
              >
                {marketOptions.map((value) => (
                  <option key={value} value={value} className="bg-gray-700">
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Market Order UI */}
            {orderType === "Market" && (
              <>
                <div className="flex mb-4 space-x-2">
                  <button
                    className={`flex-1 py-3 rounded-md font-semibold text-sm transition ${
                      selectedOutcome === "yes"
                        ? "bg-white text-black"
                        : "bg-gray-700 text-gray-400"
                    }`}
                    onClick={() => setSelectedOutcome("yes")}
                  >
                    Yes ${Number(selectedOption.yesPrice).toFixed(2)}
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-md font-semibold text-sm transition ${
                      selectedOutcome === "no"
                        ? "bg-red-600 text-white"
                        : "bg-gray-700 text-purple-400"
                    }`}
                    onClick={() => setSelectedOutcome("no")}
                  >
                    No ${Number(selectedOption.noPrice).toFixed(2)}
                  </button>
                </div>

                <div className="mb-4 flex justify-between items-center">
                  <span className="text-sm">Amount</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setAmount(Number(e.target.value))
                    }
                    className="w-32 p-2 rounded-md bg-gray-700 text-right border border-gray-600"
                    placeholder="$0"
                  />
                </div>

                <div className="mb-4 flex justify-between items-center text-sm text-gray-400">
                  <span>Shares</span>
                  <span>{calculateShares()}</span>
                </div>

                <div className="mb-4 flex justify-between items-center text-sm text-gray-400">
                  <span>Avg Price</span>
                  <span>
                    $
                    {selectedOutcome === "yes"
                      ? selectedOption.yesPrice
                      : selectedOption.noPrice}
                  </span>
                </div>
              </>
            )}

            {/* Limit Order UI */}
            {orderType === "Limit" && (
              <>
                <div className="flex mb-4 space-x-2">
                  <button
                    className={`flex-1 py-3 rounded-md font-semibold text-sm transition ${
                      selectedOutcome === "yes"
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-400"
                    }`}
                    onClick={() => setSelectedOutcome("yes")}
                  >
                    Yes ${(limitPrice / 100).toFixed(2)}
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-md font-semibold text-sm transition ${
                      selectedOutcome === "no"
                        ? "bg-slate-600 text-white"
                        : "bg-gray-700 text-purple-400"
                    }`}
                    onClick={() => setSelectedOutcome("no")}
                  >
                    No ${((100 - limitPrice) / 100).toFixed(2)}
                  </button>
                </div>

                {/* Limit Price Controls */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Limit Price</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setLimitPrice(Math.max(0.1, limitPrice - 0.1))
                      }
                      className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 border border-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="flex-1 bg-gray-700 rounded px-3 py-2 text-center font-bold border border-gray-600">
                      {limitPrice.toFixed(1)}¢
                    </div>
                    <button
                      onClick={() =>
                        setLimitPrice(Math.min(99.9, limitPrice + 0.1))
                      }
                      className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center hover:bg-gray-600 border border-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Shares Controls */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Shares</label>
                  </div>
                  <div className="mb-2">
                    <input
                      type="number"
                      value={shares}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setShares(Math.max(0, Number(e.target.value)))
                      }
                      className="w-full p-2 rounded-md bg-gray-700 text-center border border-gray-600 font-bold text-lg text-gray-300"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShares(Math.max(0, shares - 10))}
                      className="px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 border border-gray-600"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => setShares(shares + 10)}
                      className="px-3 py-1 bg-slate-600 rounded text-xs hover:bg-gray-500 border border-gray-600"
                    >
                      +10
                    </button>
                  </div>
                </div>

                {/* Total and To Win for Limit Orders */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-blue-400">
                      ${((shares * limitPrice) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">To Win</span>
                      <span className="text-green-400">💵</span>
                    </div>
                    <span className="font-bold text-green-400">
                      ${((shares * (100 - limitPrice)) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              onClick={handleVoteSubmit}
              disabled={
                voting || (orderType === "Market" ? amount <= 0 : shares <= 0)
              }
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-800/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors text-sm"
            >
              {voting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : orderType === "Market" ? (
                `${mode.toUpperCase()} ${calculateShares()} SHARES`
              ) : (
                "Trade"
              )}
            </button>

            {/* Footer */}
            <div className="flex justify-end items-center mt-2">
              <span className="text-gray-400 text-xs mr-2">Market By</span>
              <div className="flex items-center">
                <Image
                  src="/navlogo.png"
                  alt="Clapo Logo"
                  width={100}
                  height={100}
                  className="w-auto h-4"
                />
                <span className="text-xs text-green-500 ml-1">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
