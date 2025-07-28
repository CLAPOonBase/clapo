"use client";

import { useState } from "react";
import UserDetails from "../Sections/UserDetails";

const CreateMarketPage = () => {
  const [options, setOptions] = useState(["", "", "", ""]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 text-left">
      <UserDetails />
      <div className="p-4 sm:p-6 bg-dark-800 text-white rounded-lg space-y-4">
        <h2 className="text-xl font-semibold tracking-widest">CREATE MARKET</h2>

        <div>
          <label className="block text-sm mb-1">MARKET TITLE</label>
          <input
            type="text"
            placeholder="WRITE YOUR QUESTION"
            className="w-full bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm outline-none"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">OPTIONS</label>
          {options.map((opt, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`CANDIDATES ${String.fromCharCode(65 + idx)}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              className="w-full bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm mb-2 outline-none"
            />
          ))}
          <button
            onClick={addOption}
            className="text-xs text-blue-400 hover:underline"
          >
            + ADD OPTION
          </button>
        </div>

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
            <input
              type="text"
              placeholder="ADD TAGS"
              className="w-full bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">DESCRIPTION</label>
          <textarea
            placeholder="ENTER DESCRIPTION"
            rows={3}
            className="w-full bg-transparent border border-secondary/20 px-4 py-2 rounded text-sm outline-none resize-none"
          />
        </div>

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded">
          CREATE MARKET
        </button>
      </div>
    </div>
  );
};

export default CreateMarketPage;
