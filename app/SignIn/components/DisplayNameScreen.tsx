import React from 'react';
import { User, ArrowRight } from 'lucide-react';
import type { FormData } from '../types';

interface DisplayNameScreenProps {
  formData: FormData;
  onUpdateFormData: (data: Partial<FormData>) => void;
  onContinue: () => void;
}

export function DisplayNameScreen({ formData, onUpdateFormData, onContinue }: DisplayNameScreenProps) {
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
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">What's your display name?</h2>
        <p className="text-gray-400 text-sm">This is how others will see you</p>
      </div>
      <input
        type="text"
        value={formData.displayName}
        onChange={(e) => onUpdateFormData({ displayName: e.target.value })}
        className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
        placeholder="Your display name"
      />
      <button
        onClick={onContinue}
        disabled={!formData.displayName}
        className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{
          backgroundColor: formData.displayName ? "#6E54FF" : "#6B7280",
          boxShadow: formData.displayName ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
        }}
      >
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}
