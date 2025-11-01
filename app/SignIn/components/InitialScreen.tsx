import React from 'react';
import { X, Check, Wallet, Loader2, ArrowRight } from 'lucide-react';
import type { User } from '@privy-io/react-auth';
import type { FlowState } from '../types';

interface InitialScreenProps {
  authenticated: boolean;
  user: User | null;
  ready: boolean;
  checkingExistingUser: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onContinue: () => void;
  getAuthProviderText: () => string;
}

export function InitialScreen({
  authenticated,
  user,
  ready,
  checkingExistingUser,
  onLogin,
  onLogout,
  onContinue,
  getAuthProviderText
}: InitialScreenProps) {
  return (
    <div className="text-center space-y-6 w-full">
      <div>
        <h2 className="text-2xl font-bold text-white mb-3">Join Clapo Today</h2>
        <p className="text-gray-400">Create your account with Privy</p>
      </div>

      {/* Privy Auth */}
      <div className="space-y-3">
        {authenticated && user ? (
          <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                  {user.email?.address?.[0]?.toUpperCase() ||
                   user.twitter?.username?.[0]?.toUpperCase() ||
                   user.wallet?.address?.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">
                    {user.email?.address ||
                     user.twitter?.username ||
                     `${user.wallet?.address?.slice(0, 6)}...${user.wallet?.address?.slice(-4)}`}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {getAuthProviderText()} Connected
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            disabled={!ready}
            className="w-full px-6 py-4 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }}
          >
            {!ready ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                Loading...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2 inline-block" />
                Connect with Privy
              </>
            )}
          </button>
        )}
      </div>

      {authenticated && user && !checkingExistingUser && (
        <div className="space-y-4">
          <button
            onClick={onContinue}
            className="w-full px-6 py-4 text-white text-sm font-medium rounded-full transition-all duration-200"
            style={{
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }}
          >
            Continue Setup <ArrowRight className="w-4 h-4 ml-2 inline-block" />
          </button>

          <div className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-xl">
            <p className="text-sm text-blue-300">
              ✅ Successfully connected! Complete your profile to continue.
            </p>
          </div>
        </div>
      )}

      {checkingExistingUser && (
        <div className="p-4 bg-purple-600/20 border border-purple-600/30 rounded-xl">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            <p className="text-sm text-purple-300">
              Checking your account...
            </p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">
          Powered by Privy • Secure & Decentralized
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>📧 Email</span>
          <span>•</span>
          <span>🔗 Wallet</span>
          <span>•</span>
          <span>🔐 Social</span>
        </div>
      </div>
    </div>
  );
}
