"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockOpinions } from "@/app/lib/mockdata";
import { Opinion, Vote } from "@/app/types";
import DualLineChart from "./Sections/DualCharts";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronDown, Minus, Plus } from "lucide-react";

export default function OpinionDetailPage() {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPeople, setShowPeople] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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

  const timelineEvents = [
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

  const peopleData = [
    { name: "NEXT FED RATE HIKE?", avatar: "person1" },
    { name: "NUMBER OF RATE CUTS IN 2024?", avatar: "person2" },
    { name: "FED FUNDS RATE IN SEPTEMBER?", avatar: "person3" },
    { name: "FED FUNDS RATE IN SEPTEMBER?", avatar: "person4" },
  ];

  const predictionOptions = [
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

  const router = useRouter();
  const { slug } = useParams() as { slug: string };

  const [opinion, setOpinion] = useState<Opinion | null>(null);
  const [userVote, setUserVote] = useState<Partial<Vote>>({
    prediction: 25,
    confidence: 70,
  });
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const [selectedOption, setSelectedOption] = useState(predictionOptions[0]);
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState("Market");
  const [amount, setAmount] = useState(100);
  const [limitPrice, setLimitPrice] = useState(3.6);
  const [shares, setShares] = useState(0);

  const [selectedOutcome, setSelectedOutcome] = useState<"yes" | "no">("yes");

  useEffect(() => {
    const foundOpinion = mockOpinions.find((op) => op.slug === slug);
    setOpinion(foundOpinion || null);
    setLoading(false);
  }, [slug]);

  const marketOptions = ["Market", "Limit"];

  // Calculate shares based on amount and price
  const calculateShares = () => {
    const price =
      selectedOutcome === "yes"
        ? selectedOption.yesPrice
        : selectedOption.noPrice;
    return Math.floor((amount / price) * 100) / 100;
  };

  const handlePredictionClick = (
    option: SetStateAction<{
      label: string;
      percent: number;
      yesPrice: number;
      noPrice: number;
      value: number;
    }>,
    outcome: "yes" | "no"
  ) => {
    setSelectedOption(option);
    setSelectedOutcome(outcome);

    if (typeof option === "function") {
      const resolvedOption = option(selectedOption);
      setUserVote({ ...userVote, prediction: resolvedOption.value });
    } else {
      setUserVote({ ...userVote, prediction: option.value });
    }
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

    const vote: Vote = {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!opinion) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-white mb-4">
          Opinion Not Found
        </h1>
        <p className="text-gray-400 mb-6">
          The opinion you&apos;re looking for doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1">
          <div className="flex">
            <div className="rounded-lg p-6 w-full">
              <div className="flex justify-between items-center mb-4">
                <div className="p-2 flex space-x-2 items-center rounded-lg w-full bg-dark-800">
                  <div className="flex w-14 h-full items-center justify-center bg-primary rounded-md overflow-hidden">
                    <Image
                      src={opinion.image}
                      alt={opinion.title}
                      width={100}
                      height={100}
                      className="w-6 h-6"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-white text-nowrap w-full">
                    {opinion.title}
                  </h2>
                  <div className="px-6 w-full">
                    <div className="flex justify-end text-secondary">
                      <span>$121,212,122 VOL</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative p-2 bg-dark-800 rounded-lg overflow-hidden">
                <DualLineChart />
              </div>
            </div>

            {/* Buy/Sell Panel */}
            <div className="w-full relative max-w-[340px] text-white mr-8 rounded-lg">
              <div className="w-full fixed max-w-[340px] bg-dark-800 text-white my-6 mr-8 p-4 rounded-lg">
                <div className="flex gap-2">
                  <div className="flex items-center justify-start w-8 h-8 bg-primary rounded-md overflow-hidden">
                    <Image
                      src={opinion.image}
                      alt={opinion.title}
                      width={100}
                      height={100}
                      className="object-contain w-6 h-6"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">
                      {selectedOption.label}
                    </div>
                    <div className="text-xs text-green-500 font-medium mb-2">
                      {opinion.category.toLowerCase()}
                    </div>
                  </div>
                </div>

                <div className="flex my-4 space-x-2">
                  <button
                    className={`text-green-500 bg-white rounded px-3 py-1 text-xs font-bold shadow hover:text-white hover:bg-[#E4761B] transition ${
                      mode === "buy" ? "text-green-500" : "text-green-500"
                    }`}
                    onClick={() => setMode("buy")}
                  >
                    Buy
                  </button>
                  <button
                    className={`rounded-md px-3 py-1 text-xs ${
                      mode === "sell"
                        ? "bg-red-500 text-white"
                        : "border border-secondary/50"
                    } border border-secondary/50`}
                    onClick={() => setMode("sell")}
                  >
                    Sell
                  </button>
                  <div className="w-full flex justify-end">
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="bg-dark-700 text-white rounded px-2 py-1 text-xs border border-secondary/50"
                    >
                      {marketOptions.map((value) => (
                        <option
                          key={value}
                          value={value}
                          className="bg-dark-700"
                        >
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Market Order UI - Keep Original */}
                {orderType === "Market" && (
                  <>
                    <div className="flex mb-4 space-x-2">
                      <button
                        className={`flex-1 py-2 rounded-md font-semibold text-sm ${
                          selectedOutcome === "yes"
                            ? "bg-white text-black"
                            : "bg-[#161B22] text-gray-400"
                        }`}
                        onClick={() => setSelectedOutcome("yes")}
                      >
                        Yes ${Number(selectedOption.yesPrice).toFixed(2)}
                      </button>
                      <button
                        className={`flex-1 py-2 rounded-md font-semibold text-sm ${
                          selectedOutcome === "no"
                            ? "bg-red-600 text-white"
                            : "bg-[#161B22] text-purple-600"
                        }`}
                        onClick={() => setSelectedOutcome("no")}
                      >
                        No ${Number(selectedOption.noPrice).toFixed(2)}
                      </button>
                    </div>

                    <div className="my-4 space-x-2 flex justify-between items-center">
                      <span className="text-sm">Amount</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full p-2 rounded-md bg-dark-700 text-right border border-secondary/50"
                        placeholder="$0"
                      />
                    </div>

                    <div className="my-4 flex justify-between items-center text-sm text-gray-400">
                      <span>Shares</span>
                      <span>{calculateShares()}</span>
                    </div>

                    <div className="my-4 flex justify-between items-center text-sm text-gray-400">
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

                {/* Limit Order UI - New Enhanced Version */}
                {orderType === "Limit" && (
                  <>
                    <div className="flex mb-4 space-x-2">
                      <button
                        className={`flex-1 py-2 rounded-md font-semibold text-sm ${
                          selectedOutcome === "yes"
                            ? "bg-green-600 text-white"
                            : "bg-[#161B22] text-gray-400"
                        }`}
                        onClick={() => setSelectedOutcome("yes")}
                      >
                        Yes ${(limitPrice / 100).toFixed(2)}
                      </button>
                      <button
                        className={`flex-1 py-2 rounded-md font-semibold text-sm ${
                          selectedOutcome === "no"
                            ? "bg-slate-600 text-white"
                            : "bg-[#161B22] text-purple-600"
                        }`}
                        onClick={() => setSelectedOutcome("no")}
                      >
                        No ${((100 - limitPrice) / 100).toFixed(2)}
                      </button>
                    </div>

                    {/* Limit Price Controls */}
                    <div className=" flex justify-between pb-4 items-center space-x-2">
                      <label className="block text-sm font-medium mb-2">
                        Limit Price
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setLimitPrice(Math.max(0.1, limitPrice - 0.1))
                          }
                          className="w-8 h-8 bg-dark-700 rounded flex items-center justify-center hover:bg-gray-600 border border-secondary/50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <div className="flex-1 bg-dark-700 rounded px-3 py-2 text-center font-bold border border-secondary/50">
                          {limitPrice.toFixed(1)}¢
                        </div>
                        <button
                          onClick={() =>
                            setLimitPrice(Math.min(99.9, limitPrice + 0.1))
                          }
                          className="w-8 h-8 bg-dark-700 rounded flex items-center justify-center hover:bg-gray-600 border border-secondary/50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Shares Controls */}
                    <div className="flex flex-col justify-center items-center">
                     <div className="flex justify-center items-center space-x-2">
                       <label className="block text-sm font-medium mb-2">
                        Shares
                      </label>
                        <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={shares}
                          onChange={(e) =>
                            setShares(Math.max(0, Number(e.target.value)))
                          }
                          className="flex-1 p-2 rounded-md bg-dark-700 text-center border border-secondary/50 font-bold text-lg text-gray-400"
                          placeholder="0"
                        />
                        
                        </div>
                     </div>
               <div className="w-full">
                     
                    <div className="flex space-x-2 w-full p-2 justify-end">
                        <button
                            onClick={() => setShares(Math.max(0, shares - 10))}
                            className="px-2 bg-dark-700 rounded text-xs hover:bg-gray-600 border border-secondary/50"
                          >
                            -10
                          </button>
                          <button
                            onClick={() => setShares(shares + 10)}
                            className="px-2 bg-slate-600 rounded text-xs hover:bg-gray-500 border border-secondary/50"
                          >
                            +10
                          </button>
                    </div>
               </div>
                    </div>

                
                    {/* Total and To Win for Limit Orders */}
                    <div className="space-y-2 my-4">
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

                <button
                  onClick={handleVoteSubmit}
                  disabled={
                    voting ||
                    (orderType === "Market" ? amount <= 0 : shares <= 0)
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

                <div className="flex justify-end pt-1 items-center">
                  <span className="text-secondary text-[8px]">Market By</span>
                  <Image
                    src="/navlogo.png"
                    alt="clapo logo"
                    width={1000}
                    height={1000}
                    className="w-auto h-4"
                  />
                  <Image
                    src="/verified.svg"
                    alt="clapo logo"
                    width={1000}
                    height={1000}
                    className="w-auto h-2 px-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-white min-h-screen">
            <div className="w-full flex mx-auto px-6">
              <div className="gap-6">
                {/* Main Prediction Panel */}
                <div className="lg:col-span-2">
                  <div className="">
                    {/* Prediction Options */}
                    <div className="space-y-3 mb-6">
                      {predictionOptions.map((item, idx) => (
                        <motion.div
                          key={idx}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                            selectedOption.value === item.value
                              ? "border-orange-500 bg-dark-800 shadow-lg"
                              : "border-gray-600 bg-dark-800 hover:border-gray-500 hover:bg-dark-800"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-sm">
                              {item.label}
                            </span>
                          </div>
                          <div className="flex items-center justify-between space-x-12">
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {item.percent}%
                              </div>
                              <div className="text-xs text-gray-400">
                                YES {item.yesPrice}¢
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                className={`px-10 py-3 rounded text-xs font-semibold transition-colors ${
                                  selectedOption.value === item.value &&
                                  selectedOutcome === "yes"
                                    ? "bg-green-600 text-white"
                                    : "bg-white text-black hover:bg-green-700 hover:text-white"
                                }`}
                                onClick={() =>
                                  handlePredictionClick(item, "yes")
                                }
                              >
                                YES ${item.yesPrice}
                              </button>
                              <button
                                className={`px-10 py-3 rounded text-xs font-semibold transition-colors ${
                                  selectedOption.value === item.value &&
                                  selectedOutcome === "no"
                                    ? "bg-red-600 text-white"
                                    : "bg-dark-900 text-purple-800 hover:bg-red-700 hover:text-white"
                                }`}
                                onClick={() =>
                                  handlePredictionClick(item, "no")
                                }
                              >
                                NO ${item.noPrice}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Rules Summary */}
                    <div className="rounded-lg mb-6">
                      <div>
                        <h3 className="font-semibold flex flex-col items-start text-start">
                          <span className="underline text-2xl">
                            RULES SUMMARY
                          </span>
                          <span className="text-green-500 text-[12px] text-start">
                            Fed Maintain Rate
                          </span>
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          If the Federal Reserve does a Hike of 0bps on July 30,
                          2025, then the market resolves to Yes. Outcome
                          verified from
                        </p>
                      </div>
                      <div className="mt-12">
                        <span className="underline text-2xl">
                          FEDERAL RESERVE
                        </span>
                        <p className="text-sm text-gray-400 mb-3">
                          This market is mutually exclusive. Therefore, if the
                          Federal Reserve hikes by 50bps, the 50bps market will
                          resolve to Yes and the 25bps market will resolve to
                          No. Only one bucket, at maximum, can resolve to Yes.
                          Note 4/28/25: For the…
                        </p>
                      </div>
                      <div className="space-x-2">
                        <span className="text-green-500 rounded-md text-[12px] p-2 border border-green-500/20">
                          View Full Rules
                        </span>
                        <span className="text-green-500 rounded-md text-[12px] p-2 border border-green-500/20">
                          Help Center
                        </span>
                      </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="mb-6 border-y border-secondary overflow-hidden">
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
                          <ChevronDown className="w-4 h-4 text-secondary border rounded-full border-secondary" />
                        </motion.div>
                      </motion.div>

                      <AnimatePresence>
                        {showTimeline && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="px-6 py-6"
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
                                        isCompleted
                                          ? "bg-green-500"
                                          : "bg-gray-500"
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
                  </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                  {/* About Section */}
                  <div className="">
                    <motion.div
                      className="flex items-center justify-between cursor-pointer mb-3"
                      onClick={() => setShowAbout(!showAbout)}
                    >
                      <h3 className="text-2xl underline">ABOUT</h3>
                    </motion.div>

                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm text-gray-400 mb-4">
                          The FOMC meeting determines interest rate policy,
                          timing rates moves down the economy and market
                          conditions. Federal Reserve decisions during the time
                          frames impact conditions such as a unique bitcoin as a
                          hedge to protect somebodys finances.
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* People Also Buying Section */}
                  <div className="">
                    <motion.div
                      className="flex items-center justify-between cursor-pointer mb-3"
                      onClick={() => setShowPeople(!showPeople)}
                    >
                      <h3 className="text-2xl underline">
                        PEOPLE ARE ALSO BUYING
                      </h3>
                    </motion.div>

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
                            <Image
                              src={`https://robohash.org/${person.avatar}.png?size=32x32`}
                              alt=""
                              width={100}
                              height={100}
                              className="w-8 h-8 rounded-md bg-primary"
                            />
                            <span className="text-xs font-medium">
                              {person.name}
                            </span>
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
              <div className="w-full max-w-[340px] text-white my-6 mr-8 p-4 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
