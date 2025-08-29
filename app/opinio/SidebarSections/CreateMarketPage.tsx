import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UserDetails from '../Sections/UserDetails';

const CreateMarketPage = ({ onMarketCreated, markets }) => {
  const [questionType, setQuestionType] = useState("no-options");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState({ day: "", month: "", year: "" });

  const availableTags = [
    { label: "TRENDING" },
    { label: "NEW" },
    { label: "POLITICS" },
    { label: "SPORTS" },
    { label: "CRYPTO" },
    { label: "TECH" },
    { label: "CELEBRITY" },
    { label: "WORLD" },
    { label: "ECONOMY" },
    { label: "TRUMP" },
    { label: "ELECTIONS" },
    { label: "MENTIONS" },
  ];

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleQuestionTypeChange = (type) => {
    setQuestionType(type);
    if (type === "no-options") {
      setOptions(["", "", "", ""]);
    }
  };

  const toggleTag = (tagLabel) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel)
        ? prev.filter((tag) => tag !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleCreateMarket = () => {
    if (!title.trim()) {
      alert("Please enter a market title");
      return;
    }

    const market = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      questionType,
      options: questionType === "with-options" ? options.filter(opt => opt.trim()) : [],
      tags: selectedTags,
      endDate,
      createdAt: new Date().toISOString(),
      status: "Active"
    };

    // Call the callback to update the parent component
    onMarketCreated(market);

    // Reset form
    setTitle("");
    setDescription("");
    setQuestionType("no-options");
    setOptions(["", "", "", ""]);
    setSelectedTags([]);
    setEndDate({ day: "", month: "", year: "" });

    alert("Market created successfully!");
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 text-left">
      <UserDetails />
            <div>
        <h2 className="text-xl font-semibold tracking-widest mb-4 h-10"></h2>
      </div>
      <div className="p-4 sm:p-6 bg-[#1A1A1A] text-white rounded-lg space-y-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
        <h2 className="text-xl font-semibold tracking-widest">CREATE MARKET</h2>

        <div>
          <label className="block text-sm mb-2">QUESTION TYPE</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="questionType"
                value="no-options"
                checked={questionType === "no-options"}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
                className="mr-2 accent-[#6E54FF]"
              />
              <span className="text-sm">NO OPTIONS</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="questionType"
                value="with-options"
                checked={questionType === "with-options"}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
                className="mr-2 accent-[#6E54FF]"
              />
              <span className="text-sm">WITH OPTIONS</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">MARKET TITLE</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              questionType === "no-options"
                ? "WRITE YOUR QUESTION (e.g., Will it rain tomorrow?)"
                : "WRITE YOUR QUESTION"
            }
            className="w-full bg-transparent border border-[#2A2A2A] px-4 py-2 rounded text-sm outline-none text-white placeholder-gray-400"
          />
        </div>

        {questionType === "with-options" && (
          <div>
            <label className="block text-sm mb-1">OPTIONS</label>
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder={`CANDIDATES ${String.fromCharCode(65 + idx)}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 bg-transparent border border-[#2A2A2A] px-4 py-2 rounded text-sm outline-none text-white placeholder-gray-400"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(idx)}
                    className="text-red-400 hover:text-red-300 px-2 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-xs text-[#6E54FF] hover:text-[#836EF9] transition-colors"
            >
              + ADD OPTION
            </button>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">END DATE</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="DAY"
                value={endDate.day}
                onChange={(e) => setEndDate(prev => ({ ...prev, day: e.target.value }))}
                className="flex-1 bg-transparent border border-[#2A2A2A] px-3 py-2 rounded text-sm outline-none text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="MONTH"
                value={endDate.month}
                onChange={(e) => setEndDate(prev => ({ ...prev, month: e.target.value }))}
                className="flex-1 bg-transparent border border-[#2A2A2A] px-3 py-2 rounded text-sm outline-none text-white placeholder-gray-400"
              />
              <input
                type="text"
                placeholder="YEAR"
                value={endDate.year}
                onChange={(e) => setEndDate(prev => ({ ...prev, year: e.target.value }))}
                className="flex-1 bg-transparent border border-[#2A2A2A] px-3 py-2 rounded text-sm outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">CATEGORY/TAGS</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-transparent border border-[#2A2A2A] px-4 py-2 rounded text-sm outline-none text-left flex items-center justify-between hover:border-[#6E54FF]/50 transition-colors"
              >
                <span className="text-gray-400">
                  {selectedTags.length > 0
                    ? `${selectedTags.length} tags selected`
                    : "SELECT TAGS"}
                </span>
                <span
                  className={`transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded max-h-48 overflow-y-auto z-10 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-[#2A2A2A] flex items-center justify-between transition-colors ${
                        selectedTags.includes(tag.label)
                          ? "text-[#6E54FF]"
                          : "text-gray-300"
                      }`}
                    >
                      <span>{tag.label}</span>
                      {selectedTags.includes(tag.label) && (
                        <span className="text-[#6E54FF]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-[#6E54FF] text-white text-xs rounded shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-[#836EF9] transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">DESCRIPTION</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              questionType === "no-options"
                ? "PROVIDE CONTEXT FOR YOUR QUESTION (Optional)"
                : "ENTER DESCRIPTION"
            }
            rows={3}
            className="w-full bg-transparent border border-[#2A2A2A] px-4 py-2 rounded text-sm outline-none resize-none text-white placeholder-gray-400"
          />
        </div>

        <button 
          onClick={handleCreateMarket}
          className="w-full bg-[#6E54FF] hover:bg-[#836EF9] text-white font-semibold py-3 rounded-[100px] transition-all duration-200 shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]"
        >
          CREATE MARKET
        </button>
      </div>
    </div>
  );
};
const MyMarketsPage = ({ markets, handleDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-400";
      case "Ended":
        return "text-red-400";
      case "Draft":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 text-left">
      <UserDetails />
      <div>
        <h2 className="text-xl font-semibold tracking-widest mb-4 h-10"></h2>
      </div>
      <div className="p-4 sm:p-6 bg-[#1A1A1A] text-white rounded-lg space-y-4 border border-[#2A2A2A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-widest">MY MARKETS</h2>
          <div className="text-sm text-gray-400">
            {markets.length} {markets.length === 1 ? "Market" : "Markets"}
          </div>
        </div>

        {markets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#2A2A2A] rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400">📊</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Markets Created</h3>
            <p className="text-gray-400 text-sm">
              Create your first market to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {markets.map((market) => (
              <div
                key={market.id}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg p-4 hover:border-[#6E54FF]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {market.title}
                    </h3>
                    {market.description && (
                      <p className="text-sm text-gray-400 mb-2">
                        {market.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created: {formatDate(market.createdAt)}</span>
                      <span
                        className={`font-semibold ${getStatusColor(
                          market.status
                        )}`}
                      >
                        {market.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${getStatusColor(
                        market.status
                      )} border border-current`}
                    >
                      {market.questionType === "no-options"
                        ? "YES/NO"
                        : "MULTIPLE"}
                    </span>
                  </div>
                </div>

                {market.options && market.options.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-2">
                      OPTIONS:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {market.options.map((option, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-[#2A2A2A] text-xs rounded text-gray-300"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {market.tags && market.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {market.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#6E54FF] text-white text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(market.endDate.day ||
                  market.endDate.month ||
                  market.endDate.year) && (
                  <div className="text-xs text-gray-400">
                    <span>
                      End Date: {market.endDate.day}/{market.endDate.month}/
                      {market.endDate.year}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2A2A2A]">
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-[#6E54FF] text-white text-xs rounded hover:bg-[#836EF9] transition-colors">
                      View Details
                    </button>
                    <button className="px-3 py-1 border border-[#2A2A2A] text-gray-400 text-xs rounded hover:border-[#6E54FF]/50 transition-colors">
                      Edit
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(market.id)}
                    className="text-red-400 hover:text-red-300 text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component with Navigation
const App = () => {
  const [activeTab, setActiveTab] = useState("CREATE MARKET");
  const [markets, setMarkets] = useState([]);
  const [hydrated, setHydrated] = useState(false); // hydration guard

  const tabs = ["CREATE MARKET", "MY MARKETS"];

  useEffect(() => {
    setHydrated(true);
    const stored = localStorage.getItem("markets");
    if (stored) setMarkets(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("markets", JSON.stringify(markets));
    }
  }, [markets, hydrated]);

  const handleMarketCreated = (newMarket) =>
    setMarkets((prev) => [...prev, newMarket]);
  const handleDelete = (id) =>
    setMarkets((prev) => prev.filter((m) => m.id !== id));

  if (!hydrated) return null; // prevents SSR/localStorage mismatch

  return (
    <div className="min-h-screen text-white relative">
      {/* Navigation */}
      <div className="mx-auto">
        <div
          style={{ zIndex: "9999" }}
          className="flex justify-start absolute top-40 left-6 text-nowrap"
        >
          <div className="flex justify-around items-center rounded-md relative">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`p-3 font-semibold w-full relative z-10 transition-colors duration-200 ${
                  activeTab === tab
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                {tab} {tab === "MY MARKETS" && `(${markets.length})`}
              </button>
            ))}

            <motion.div
              className="absolute h-[48px] rounded-full"
              style={{
                boxShadow:
                  "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF",
                backgroundColor: "#6E54FF",
              }}
              initial={false}
              animate={{
                left: activeTab === "CREATE MARKET" ? "0%" : "50%",
                width: "50%",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        </div>

        {/* Page Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}>
              {activeTab === "CREATE MARKET" ? (
                <CreateMarketPage
                  onMarketCreated={handleMarketCreated}
                  markets={markets}
                />
              ) : (
                <MyMarketsPage markets={markets} handleDelete={handleDelete} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default App;