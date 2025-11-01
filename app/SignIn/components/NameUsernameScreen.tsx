import React from 'react';
import { User, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { FormData } from '../types';

interface NameUsernameScreenProps {
  formData: FormData;
  usernameAvailable: boolean | null;
  checkingUsername: boolean;
  onUpdateFormData: (data: Partial<FormData>) => void;
  onContinue: () => void;
}

export function NameUsernameScreen({
  formData,
  usernameAvailable,
  checkingUsername,
  onUpdateFormData,
  onContinue
}: NameUsernameScreenProps) {
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
        <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
        <p className="text-gray-400 text-sm">We'll generate a username based on your name</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Your full name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onUpdateFormData({ name: e.target.value })}
          className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Username</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => onUpdateFormData({ username: e.target.value })}
            className={`w-full pl-10 pr-12 py-3 bg-black border-2 text-white rounded-xl focus:outline-none transition-all duration-200 placeholder:text-gray-500 ${
              formData.username.length >= 3
                ? usernameAvailable === true
                  ? 'border-green-500/50 focus:border-green-500/70'
                  : usernameAvailable === false
                  ? 'border-red-500/50 focus:border-red-500/70'
                  : 'border-gray-700/70 focus:border-[#6E54FF]/50'
                : 'border-gray-700/70 focus:border-[#6E54FF]/50'
            }`}
            placeholder="username"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {checkingUsername && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
            {!checkingUsername && usernameAvailable === true && formData.username.length >= 3 && (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            )}
            {!checkingUsername && usernameAvailable === false && formData.username.length >= 3 && (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        {formData.name && !checkingUsername && (
          <p className="text-xs text-gray-500">
            Auto-generated username. Feel free to edit it.
          </p>
        )}
        {!checkingUsername && usernameAvailable === false && formData.username.length >= 3 && (
          <p className="text-xs text-red-400">
            Username is already taken. Please try another.
          </p>
        )}
        {!checkingUsername && usernameAvailable === true && formData.username.length >= 3 && (
          <p className="text-xs text-green-400">
            Username is available!
          </p>
        )}
      </div>

      <button
        onClick={onContinue}
        disabled={!formData.name || !formData.username || usernameAvailable === false || checkingUsername}
        className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        style={{
          backgroundColor: (formData.name && formData.username && usernameAvailable !== false && !checkingUsername) ? "#6E54FF" : "#6B7280",
          boxShadow: (formData.name && formData.username && usernameAvailable !== false && !checkingUsername) ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
        }}
      >
        {checkingUsername ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          <>
            Continue <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </button>
    </div>
  );
}
