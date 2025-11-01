import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { FormData } from '../types';
import { TOPICS } from '../types/constants';

interface TopicsScreenProps {
  formData: FormData;
  onToggleTopic: (topic: string) => void;
  onContinue: () => void;
}

export function TopicsScreen({ formData, onToggleTopic, onContinue }: TopicsScreenProps) {
  return (
    <div className="space-y-6 w-full">
      <div className="text-center mb-6">
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
          style={{
            backgroundColor: "#6E54FF",
            boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
          }}
        >
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">What interests you?</h2>
        <p className="text-gray-400 text-sm">Select at least 3 topics</p>
      </div>
      <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto p-1">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            onClick={() => onToggleTopic(topic)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              formData.topics.includes(topic)
                ? "text-white"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600"
            }`}
            style={formData.topics.includes(topic) ? {
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            } : {}}
          >
            {topic}
          </button>
        ))}
      </div>
      <div className="text-center text-sm text-gray-400">
        {formData.topics.length} of 3 selected
      </div>
      <button
        onClick={onContinue}
        disabled={formData.topics.length < 3}
        className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{
          backgroundColor: formData.topics.length >= 3 ? "#6E54FF" : "#6B7280",
          boxShadow: formData.topics.length >= 3 ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
        }}
      >
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}
