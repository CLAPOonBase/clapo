import React from 'react';
import { User, Users } from 'lucide-react';
import type { AccountType } from '../types';

interface ChoiceScreenProps {
  onChoose: (type: AccountType) => void;
}

export function ChoiceScreen({ onChoose }: ChoiceScreenProps) {
  return (
    <div className="space-y-4 w-full">
      <p className="text-gray-400 text-center mb-6">How would you like to join Clapo?</p>

      <button
        onClick={() => onChoose('individual')}
        className="w-full p-6 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border border-gray-600/30 transition-all duration-200 text-left"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }}
          >
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Join as Individual</h3>
            <p className="text-gray-400 text-sm">Create a personal account to connect with others</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onChoose('community')}
        className="w-full p-6 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border border-gray-600/30 transition-all duration-200 text-left"
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Create Community</h3>
            <p className="text-gray-400 text-sm">Build and manage your own community space</p>
          </div>
        </div>
      </button>
    </div>
  );
}
