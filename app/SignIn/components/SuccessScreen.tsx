import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { FormData, AccountType } from '../types';

interface SuccessScreenProps {
  formData: FormData;
  accountType: AccountType;
  isRedirecting: boolean;
}

export function SuccessScreen({ formData, accountType, isRedirecting }: SuccessScreenProps) {
  return (
    <div className="text-center space-y-6 w-full">
      {isRedirecting && (
        <div className="p-4 bg-blue-600/20 border border-blue-600/50 rounded-xl mb-4">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            <p className="text-sm text-blue-300">Redirecting to home page...</p>
          </div>
        </div>
      )}
      <div
        className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
        style={{
          backgroundColor: "#10B981",
          boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(16, 185, 129, 0.50), 0px 0px 0px 1px #10B981"
        }}
      >
        <Check className="w-10 h-10 text-white" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-white mb-3">Welcome to Clapo!</h2>
        <p className="text-gray-400 text-lg mb-2">
          @{formData.username}
        </p>
        <p className="text-gray-400">
          You're all set to explore the ecosystem
        </p>
      </div>
      {/* Profile Preview Card */}
      {formData.avatarPreview && (
        <div className="flex justify-center mb-4">
          <img
            src={formData.avatarPreview}
            alt="Profile"
            className="w-24 h-24 rounded-full border-4 border-[#6E54FF]"
          />
        </div>
      )}

      <div className="p-6 bg-green-600/20 border-2 border-green-600/50 rounded-xl">
        <p className="text-sm text-green-300 mb-4">
          🎉 Your {accountType === 'community' ? 'community' : 'account'} has been created successfully!
        </p>
      </div>
      <button
        onClick={() => {
          console.log("Profile completed successfully - redirecting to snaps");
          setTimeout(() => {
            window.location.href = '/snaps';
          }, 300);
        }}
        className="w-full px-6 py-4 text-white text-sm font-medium rounded-full transition-all duration-200 hover:bg-green-600 hover:scale-105 transform transition-transform"
        style={{
          backgroundColor: "#10B981",
          boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(16, 185, 129, 0.50), 0px 0px 0px 1px #10B981"
        }}
      >
        Start Exploring →
      </button>

      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Profile saved successfully. You can now access all features.
        </p>
      </div>
    </div>
  );
}
