import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import type { FormData } from '../types';
import { SUGGESTED_USERS } from '../types/constants';

interface FollowScreenProps {
  formData: FormData;
  submitError: string | null;
  onToggleFollow: (username: string) => void;
  onContinue: () => void;
}

export function FollowScreen({ formData, submitError, onToggleFollow, onContinue }: FollowScreenProps) {
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
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Follow suggested users</h2>
        <p className="text-gray-400 text-sm">Optional • You can skip this step</p>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {SUGGESTED_USERS.map((user) => (
          <div
            key={user.username}
            className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: "#6E54FF",
                  boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                }}
              >
                {user.avatar}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{user.name}</p>
                <p className="text-xs text-gray-400">@{user.username} • {user.followers}</p>
              </div>
            </div>
            <button
              onClick={() => onToggleFollow(user.username)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                formData.following.includes(user.username)
                  ? "bg-gray-700 text-white border border-gray-600"
                  : "text-white"
              }`}
              style={!formData.following.includes(user.username) ? {
                backgroundColor: "#6E54FF",
                boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
              } : {}}
            >
              {formData.following.includes(user.username) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
      {submitError && (
        <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-xl">
          <p className="text-sm text-red-300">{submitError}</p>
        </div>
      )}
      <button
        onClick={onContinue}
        className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center justify-center"
        style={{
          backgroundColor: "#6E54FF",
          boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
        }}
      >
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}
