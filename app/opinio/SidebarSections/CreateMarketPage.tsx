"use client";
import { useState } from "react";
import UserDetails from "../Sections/UserDetails";

const CreateMarketPage = () => {
  const [questionType, setQuestionType] = useState("no-options");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  return (
    <div className="space-y-6 px-4 sm:px-6 text-left">
      <UserDetails />
      <div className="p-4 sm:p-6 bg-dark-800 text-white rounded-lg space-y-4">
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
                className="mr-2 accent-orange-500"
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
                className="mr-2 accent-orange-500"
              />
              <span className="text-sm">WITH OPTIONS</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">MARKET TITLE</label>
          <input
            type="text"
            placeholder={
              questionType === "no-options"
                ? "WRITE YOUR QUESTION (e.g., Will it rain tomorrow?)"
                : "WRITE YOUR QUESTION"
            }
            className="w-full bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm outline-none"
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
                  className="flex-1 bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm outline-none"
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
              className="text-xs text-blue-400 hover:underline"
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
                className="flex-1 bg-transparent border border-secondary/20 px-3 py-2 rounded text-sm outline-none"
              />
              <input
                type="text"
                placeholder="MONTH"
                className="flex-1 bg-transparent border border-secondary/20 px-3 py-2 rounded text-sm outline-none"
              />
              <input
                type="text"
                placeholder="YEAR"
                className="flex-1 bg-transparent border border-secondary/20 px-3 py-2 rounded text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">CATEGORY/TAGS</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm outline-none text-left flex items-center justify-between hover:border-orange-500/50"
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
                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-secondary/20 rounded max-h-48 overflow-y-auto z-10">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => toggleTag(tag.label)}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-dark-600 flex items-center justify-between ${
                        selectedTags.includes(tag.label)
                          ? "text-orange-400"
                          : "text-gray-300"
                      }`}
                    >
                      <span>{tag.label}</span>
                      {selectedTags.includes(tag.label) && (
                        <span className="text-orange-400">✓</span>
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
                      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500 text-white text-xs rounded"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-orange-200"
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
            placeholder={
              questionType === "no-options"
                ? "PROVIDE CONTEXT FOR YOUR QUESTION (Optional)"
                : "ENTER DESCRIPTION"
            }
            rows={3}
            className="w-full bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm outline-none resize-none"
          />
        </div>

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded transition-colors">
          CREATE MARKET
        </button>
      </div>
    </div>
  );
};

export default CreateMarketPage;
