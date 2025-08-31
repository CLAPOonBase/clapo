"use client";
import { useState } from "react";
import UserDetails from "../Sections/UserDetails";
import { useOpinioContext } from "@/app/Context/OpinioContext";
import OpinioWalletConnect from "@/app/components/OpinioWalletConnect";

const CreateMarketPage = () => {
  const [questionType, setQuestionType] = useState("no-options");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const { isConnected, createMarket, isLoading, error } = useOpinioContext();

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

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleQuestionTypeChange = (type: string) => {
    setQuestionType(type);
    if (type === "no-options") {
      setOptions(["", "", "", ""]);
    }
  };

  const toggleTag = (tagLabel: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel)
        ? prev.filter((tag) => tag !== tagLabel)
        : [...prev, tagLabel]
    );
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleCreateMarket = async () => {
    if (!question.trim()) {
      alert("Please enter a question");
      return;
    }

    if (!endDate) {
      alert("Please select an end date");
      return;
    }

    try {
      setIsCreating(true);
      const endTime = Math.floor(new Date(endDate).getTime() / 1000);
      const marketType = questionType === "with-options" ? 1 : 0;
      const marketOptions = questionType === "with-options" ? options.filter(opt => opt.trim()) : ["Yes", "No"];
      
      const result = await createMarket(
        question, 
        description, 
        "General", // category
        ["NEW"], // tags
        endTime, 
        marketType, 
        0, // initialLiquidity
        0, // minLiquidity
        1000000 // maxMarketSize
      );
      
      alert(`Market created successfully! Market ID: ${result.marketId}`);
      
      setQuestion("");
      setDescription("");
      setEndDate("");
      setOptions(["", "", "", ""]);
      setSelectedTags([]);
    } catch (err) {
      console.error("Failed to create market:", err);
      alert("Failed to create market. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 text-left">
      <UserDetails />
      
      {!isConnected ? (
        <OpinioWalletConnect />
      ) : (
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
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
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
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent border border-[#2A2A2A] px-3 py-2 rounded text-sm outline-none text-white placeholder-gray-400"
            />
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
          disabled={isCreating || isLoading}
          className="w-full bg-[#6E54FF] hover:bg-[#836EF9] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-[100px] transition-all duration-200 shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]"
        >
          {isCreating ? 'Creating Market...' : 'CREATE MARKET'}
        </button>
        
        {error && (
          <div className="p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-xs">
            {error}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default CreateMarketPage;
