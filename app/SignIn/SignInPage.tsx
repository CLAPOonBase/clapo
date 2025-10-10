// app/SignInPage.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useWalletContext } from "@/context/WalletContext";
import Link from "next/link";
import Image from "next/image";

interface ExtendedSession {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  dbUser?: {
    id: string;
    username: string;
    email: string;
    bio: string;
    avatar_url: string;
    createdAt: string;
  };
  dbUserId?: string;
  access_token?: string;
}

 function SignInPage({ close }: { close: () => void }) {
  const { connect, disconnect, address } = useWalletContext();
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const [isConnectingX, setIsConnectingX] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const isLoggedIn = !!session;
  const isWalletConnected = !!address;

  // Debug logging
  console.log('Session state:', { session, isLoggedIn });

  const handleXConnect = async () => {
    setIsConnectingX(true);
    try {
      await signIn("twitter");
    } finally {
      setIsConnectingX(false);
    }
  };

  const handleXDisconnect = async () => {
    setIsConnectingX(true);
    try {
      await signOut();
    } finally {
      setIsConnectingX(false);
    }
  };

  const handleWalletConnect = async () => {
    setIsConnectingWallet(true);
    try {
      await connect();
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleWalletDisconnect = async () => {
    setIsConnectingWallet(true);
    try {
      await disconnect();
    } finally {
      setIsConnectingWallet(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1A1A1A] rounded-2xl shadow-2xl w-full max-w-5xl border border-gray-800 overflow-hidden"
    >
      <div className="flex min-h-[600px]">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative px-4 py-2 text-white 
  shadow-[inset_0px_1px_0.5px_rgba(255,255,255,0.5),0px_1px_2px_rgba(26,19,161,0.5),0px_0px_0px_1px_#4F47EB] 
  bg-gradient-to-r from-[#4F47EB] to-[#3B32C7] rounded-lg">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
          
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.2)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
          </div>

          {/* Content on Image */}
          <div className="relative z-20 flex flex-col justify-center items-center p-12 text-center">
            <div className="mb-8">
              {/* Placeholder for your main illustration/image */}
              <Image src="/clapo_log.png" alt="Main Illustration" width={400} height={400} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Join, Create & Connect
            </h2>
            {/* <p className="text-white/80 text-lg leading-relaxed">
              Connect your social accounts and wallet to unlock the full Clapo experience
            </p> */}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 lg:w-1/2 p-8 lg:p-12 relative">
          {/* Close Button - Positioned absolutely */}
          <button 
            onClick={close} 
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg z-10"
          >
            <X size={24} />
          </button>

          {/* Centered Content Container */}
          <div className="flex flex-col justify-center items-center h-full max-w-md mx-auto">
            
            {/* Header - Centered */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Welcome to
              </h1>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-auto h-8 rounded-xl flex items-center justify-center">
                  <Image src="/navlogo.png" alt="Logo" className="w-auto h-8" width={1000} height={1000} />
                </div>
              </div>
              
              {/* Mobile description - only show on mobile */}
              <div className="lg:hidden mb-6">
                <h2 className="text-xl font-bold text-white mb-3">
                  Join the Future of Web3
                </h2>
                <p className="text-white/70 text-base leading-relaxed">Clapo is in the development phase, you may encounter troubles while logging into your account. Kindly connect with the team.                </p>
              </div>
            </div>

            {/* Login Content */}
            <div className="w-full space-y-6">
              {/* X Connection */}
              <div className="p-6 bg-gradient-to-r from-[#0A0A0A] to-[#1A1A1A] rounded-xl border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">𝕏</span>
                  </div>
                  <h3 className="font-bold text-white text-lg">X (Twitter)</h3>
                </div>

                <div className="space-y-4">
                  {/* Always show login button */}
                  <button
                    onClick={handleXConnect}
                    disabled={isConnectingX}
                    className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all font-medium shadow-lg"
                  >
                    {isConnectingX ? "Connecting..." : "Login with X"}
                  </button>

                  {/* Show connection status if logged in */}
                  {isLoggedIn && (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <p className="text-sm text-green-300">
                          Connected as @{session.dbUser?.username}
                        </p>
                      </div>
                      <button
                        onClick={handleXDisconnect}
                        disabled={isConnectingX}
                        className="w-full py-3 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        {isConnectingX ? "Disconnecting..." : "Disconnect"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Wallet Connection */}
  <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">
                  Join the Future of Web3
                </h2>
                <p className="text-white/70 text-base leading-relaxed">
Clapo is in the development phase, you may encounter troubles while logging into your account. Kindly connect with the team.                </p>
              </div>

              {/* Success State */}
              {isLoggedIn && isWalletConnected && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-600/50 rounded-xl text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <p className="text-green-300 font-semibold text-lg">All Connected!</p>
                  </div>
                  <p className="text-green-400/80 text-sm mb-6">
                    You're all set to explore the Clapo ecosystem
                  </p>
                  <Link
                    href="/"
                    onClick={close}
                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg"
                  >
                    Continue to App →
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SignInPage;