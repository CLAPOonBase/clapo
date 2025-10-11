"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Mail, AtSign, User, Hash, Users, Sparkles, Camera } from 'lucide-react';
import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';

type FlowState = 
  | "initial" 
  | "choice"
  | "individual-email"
  | "individual-otp"
  | "individual-name-username" // Combined step
  | "individual-displayname"
  | "individual-topics"
  | "individual-follow"
  | "community-email"
  | "community-otp"
  | "community-id"
  | "community-name"
  | "community-type"
  | "success";

const topics = [
  "Technology", "Design", "Business", "Art", "Music", 
  "Gaming", "Sports", "Fashion", "Food", "Travel",
  "Science", "Education", "Health", "Finance", "Web3"
];

const suggestedUsers = [
  { username: "alex_dev", name: "Alex Chen", avatar: "👨‍💻", followers: "12.5K" },
  { username: "sarah_design", name: "Sarah Miller", avatar: "🎨", followers: "8.3K" },
  { username: "tech_guru", name: "Mike Johnson", avatar: "🚀", followers: "25.1K" },
  { username: "crypto_queen", name: "Emma Davis", avatar: "💎", followers: "15.7K" }
];

const communityTypes = [
  { id: "open", name: "Open", description: "Anyone can join and post" },
  { id: "closed", name: "Closed", description: "Anyone can join, admin approval for posts" },
  { id: "private", name: "Private", description: "Invite-only community" }
];

function SignInPage() {
  const [flowState, setFlowState] = useState<FlowState>("initial");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    username: "",
    displayName: "",
    topics: [] as string[],
    following: [] as string[],
    communityId: "",
    communityName: "",
    communityType: ""
  });
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isConnectingX, setIsConnectingX] = useState(false);

  const { data: session, status } = useSession();

  // Generate random username from name
  const generateUsername = (name: string) => {
    if (!name) return "";
    
    const baseName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomNum = Math.floor(Math.random() * 10000);
    return `${baseName}${randomNum}`;
  };

  // Update username when name changes
  useEffect(() => {
    if (flowState === "individual-name-username" && formData.name) {
      const generatedUsername = generateUsername(formData.name);
      setFormData(prev => ({ ...prev, username: generatedUsername }));
    }
  }, [formData.name, flowState]);

  // OTP timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleBack = () => {
    const backMap: Record<string, FlowState> = {
      "choice": "initial",
      "individual-email": "choice",
      "individual-otp": "individual-email",
      "individual-name-username": "individual-otp",
      "individual-displayname": "individual-name-username",
      "individual-topics": "individual-displayname",
      "individual-follow": "individual-topics",
      "community-email": "choice",
      "community-otp": "community-email",
      "community-id": "community-otp",
      "community-name": "community-id",
      "community-type": "community-name"
    };
    setFlowState(backMap[flowState] || "initial");
  };

  const sendOtp = async () => {
    // Simulate OTP sending
    console.log(`Sending OTP to ${formData.email}`);
    setIsOtpSent(true);
    setOtpTimer(60); // 60 seconds timer
    
    // In a real app, you would call your backend API here
    // await fetch('/api/send-otp', {
    //   method: 'POST',
    //   body: JSON.stringify({ email: formData.email }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
  };

  const verifyOtp = async () => {
    // Simulate OTP verification
    console.log(`Verifying OTP: ${formData.otp}`);
    
    // In a real app, you would call your backend API here
    // const response = await fetch('/api/verify-otp', {
    //   method: 'POST',
    //   body: JSON.stringify({ email: formData.email, otp: formData.otp }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    
    // For demo purposes, always succeed if OTP is 6 digits
    if (formData.otp.length === 6) {
      if (flowState === "individual-otp") {
        setFlowState("individual-name-username");
      } else if (flowState === "community-otp") {
        setFlowState("community-id");
      }
    } else {
      alert("Please enter a valid 6-digit OTP");
    }
  };

  const handleXConnect = async () => {
    setIsConnectingX(true);
    try {
      await signIn("twitter");
    } catch (error) {
      console.error("X sign in error:", error);
    } finally {
      setIsConnectingX(false);
    }
  };

  const handleXDisconnect = async () => {
    setIsConnectingX(true);
    try {
      await signOut();
    } catch (error) {
      console.error("X sign out error:", error);
    } finally {
      setIsConnectingX(false);
    }
  };

  const toggleTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const toggleFollow = (username: string) => {
    setFormData(prev => ({
      ...prev,
      following: prev.following.includes(username)
        ? prev.following.filter(u => u !== username)
        : [...prev.following, username]
    }));
  };

  const handleClose = () => {
    console.log("Close modal");
  };

  const getStepInfo = () => {
    const stepMap: Record<string, string> = {
      "individual-email": "Step 1 of 5",
      "individual-otp": "Step 2 of 5",
      "individual-name-username": "Step 3 of 5",
      "individual-displayname": "Step 4 of 5",
      "individual-topics": "Step 5 of 5",
      "individual-follow": "Final Step",
      "community-email": "Step 1 of 5",
      "community-otp": "Step 2 of 5",
      "community-id": "Step 3 of 5",
      "community-name": "Step 4 of 5",
      "community-type": "Step 5 of 5"
    };
    return stepMap[flowState] || "";
  };

  // X/Twitter Icon Component
  const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-black border-2 border-gray-700/70 rounded-xl w-full max-w-5xl shadow-custom flex overflow-hidden">
          
          {/* Left Side - Illustration/Branding */}
          <div style={{
                backgroundColor: "#6E54FF",
                boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
              }} className="hidden lg:flex lg:w-1/2 relative p-12 items-center justify-center bg-gradient-to-br from-[#4F47EB]/20 to-[#3B32C7]/20 border-r-2 border-gray-700/70">
            <div className="relative z-10 text-center">
             <div className="mb-8">
                <Image src="/clapo_log.png" alt="Main Illustration" width={400} height={400} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4"></h2>
              Join, Create & Connect
              <h1 className="text-4xl font-bold text-white mb-4">
                Welcome to Clapo
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                {flowState.includes("individual") 
                  ? "Join as an individual to connect with the community"
                  : flowState.includes("community")
                  ? "Create and manage your own community space"
                  : "Connect your social accounts and wallet to unlock the full Web3 experience"}
              </p>

              <div className="absolute top-10 left-10 w-20 h-20 bg-[#6E54FF]/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Right Side - Dynamic Content */}
          <div className="flex-1 lg:w-1/2 p-8 lg:p-12 relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                {flowState !== "initial" && flowState !== "choice" && (
                  <button 
                    onClick={handleBack}
                    className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors mr-2"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                  backgroundColor: "#6E54FF",
                  boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                }}>
                  {flowState === "success" ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {flowState === "initial" ? "Get Started" : 
                     flowState === "choice" ? "Choose Your Path" :
                     flowState === "success" ? "Welcome!" : "Sign Up"}
                  </h3>
                  {getStepInfo() && (
                    <p className="text-sm text-gray-400">{getStepInfo()}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Dynamic Content Based on Flow State */}
            <div className="flex justify-center items-center h-full">
              {/* Initial Screen */}
              {flowState === "initial" && (
                <div className="text-center space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">Join Clapo Today</h2>
                    <p className="text-gray-400">Create your account to get started</p>
                  </div>
                  
                  {/* Social Auth Buttons */}
                  <div className="space-y-3">
                    {session ? (
                      <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {session.user?.image && (
                              <Image 
                                src={session.user.image} 
                                alt="Profile" 
                                width={40} 
                                height={40} 
                                className="rounded-full"
                              />
                            )}
                            <div className="text-left">
                              <p className="text-white font-semibold">
                                {session.user?.name || 'X User'}
                              </p>
                              <p className="text-gray-400 text-sm">
                                @{session.user?.email?.split('@')[0] || 'xuser'}
                              </p>
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-400" />
                          </div>
                        </div>
                        <button
                          onClick={handleXDisconnect}
                          disabled={isConnectingX}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center justify-center"
                        >
                          {isConnectingX ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Disconnecting...
                            </>
                          ) : (
                            <>
                              <XIcon className="w-4 h-4 mr-2" />
                              Disconnect X
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleXConnect}
                        disabled={isConnectingX}
                        className="w-full px-6 py-3 bg-black hover:bg-gray-900 text-white text-sm font-medium rounded-full border border-gray-700 transition-all duration-200 flex items-center justify-center"
                      >
                        {isConnectingX ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <XIcon className="w-5 h-5 mr-2" />
                            Continue with X
                          </>
                        )}
                      </button>
                    )}
                    
                    {(status === 'unauthenticated' || !session) && (
                      <>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-black text-gray-400">or</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => setFlowState("choice")}
                      disabled={status === 'loading'}
                      className="w-full px-6 py-4 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "#6E54FF",
                        boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                      }}
                    >
                      {session ? 'Continue with X Account' : 'Create Account with Email'}
                    </button>
                    
                    {!session && (
                      <button 
                        className="w-full px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-full border border-gray-600 transition-all duration-200"
                      >
                        Sign In
                      </button>
                    )}
                  </div>
                  
                  {session && (
                    <div className="p-4 bg-blue-600/20 border border-blue-600/30 rounded-xl">
                      <p className="text-sm text-blue-300">
                        ✅ Successfully connected with X! Click continue to complete your profile.
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Clapo is in development. You may encounter issues during signup.
                  </p>
                </div>
              )}

              {/* Choice Screen */}
              {flowState === "choice" && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-center mb-6">How would you like to join Clapo?</p>
                  
                  <button
                    onClick={() => setFlowState("individual-email")}
                    className="w-full p-6 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border border-gray-600/30 transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                        backgroundColor: "#6E54FF",
                        boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                      }}>
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Join as Individual</h3>
                        <p className="text-gray-400 text-sm">Create a personal account to connect with others</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setFlowState("community-email")}
                    className="w-full p-6 bg-gray-700/30 hover:bg-gray-600/30 rounded-xl border border-gray-600/30 transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                        backgroundColor: "#6E54FF",
                        boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                      }}>
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Create Community</h3>
                        <p className="text-gray-400 text-sm">Build and manage your own community space</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Individual Flow - Email */}
              {flowState === "individual-email" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">What's your email?</h2>
                    <p className="text-gray-400 text-sm">We'll use this to keep you updated</p>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                    placeholder="you@example.com"
                  />
                  <button
                    onClick={() => {
                      sendOtp();
                      setFlowState("individual-otp");
                    }}
                    disabled={!formData.email}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: formData.email ? "#6E54FF" : "#6B7280",
                      boxShadow: formData.email ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                    }}
                  >
                    Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {/* Individual Flow - OTP Verification */}
              {flowState === "individual-otp" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
                    <p className="text-gray-400 text-sm">
                      We sent a 6-digit code to {formData.email}
                    </p>
                    {otpTimer > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        Resend in {otpTimer}s
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={sendOtp}
                      disabled={otpTimer > 0}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend OTP
                    </button>
                    <button
                      onClick={verifyOtp}
                      disabled={formData.otp.length !== 6}
                      className="flex-1 px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      style={{
                        backgroundColor: formData.otp.length === 6 ? "#6E54FF" : "#6B7280",
                        boxShadow: formData.otp.length === 6 ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                      }}
                    >
                      Verify OTP <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Individual Flow - Combined Name & Username */}
              {flowState === "individual-name-username" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Tell us about yourself</h2>
                    <p className="text-gray-400 text-sm">We'll generate a username based on your name</p>
                  </div>

                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Your full name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Username Input */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                        placeholder="username"
                      />
                    </div>
                    {formData.name && (
                      <p className="text-xs text-gray-500">
                        We generated this username for you. You can edit it.
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setFlowState("individual-displayname")}
                    disabled={!formData.name || !formData.username}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: (formData.name && formData.username) ? "#6E54FF" : "#6B7280",
                      boxShadow: (formData.name && formData.username) ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                    }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {/* Individual Flow - Display Name */}
              {flowState === "individual-displayname" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">What's your display name?</h2>
                    <p className="text-gray-400 text-sm">This is how others will see you</p>
                  </div>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                    placeholder="Your display name"
                  />
                  <button
                    onClick={() => setFlowState("individual-topics")}
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
              )}

              {/* Individual Flow - Topics (Step 5) */}
              {flowState === "individual-topics" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">What interests you?</h2>
                    <p className="text-gray-400 text-sm">Select at least 3 topics</p>
                  </div>
                  <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto">
                    {topics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
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
                  <button
                    onClick={() => setFlowState("individual-follow")}
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
              )}

              {/* Individual Flow - Follow */}
              {flowState === "individual-follow" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Follow suggested users</h2>
                    <p className="text-gray-400 text-sm">Optional • You can skip this step</p>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {suggestedUsers.map((user) => (
                      <div
                        key={user.username}
                        className="flex items-center justify-between p-4 bg-gray-700/30 border border-gray-600/30 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl" style={{
                            backgroundColor: "#6E54FF",
                            boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                          }}>
                            {user.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-sm">{user.name}</p>
                            <p className="text-xs text-gray-400">@{user.username} • {user.followers}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFollow(user.username)}
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
                  <button
                    onClick={() => setFlowState("success")}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center justify-center"
                    style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}
                  >
                    Complete Setup <Check className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

           {/* Community Flow - OTP */}
              {flowState === "community-otp" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Enter OTP</h2>
                    <p className="text-gray-400 text-sm">
                      We sent a 6-digit code to {formData.email}
                    </p>
                    {otpTimer > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        Resend in {otpTimer}s
                      </p>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                    maxLength={6}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500 text-center text-2xl tracking-widest"
                    placeholder="000000"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={sendOtp}
                      disabled={otpTimer > 0}
                      className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resend OTP
                    </button>
                    <button
                      onClick={verifyOtp}
                      disabled={formData.otp.length !== 6}
                      className="flex-1 px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      style={{
                        backgroundColor: formData.otp.length === 6 ? "#6E54FF" : "#6B7280",
                        boxShadow: formData.otp.length === 6 ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                      }}
                    >
                      Verify OTP <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Rest of the community flow remains the same */}
              {/* Community Flow - ID */}
              {flowState === "community-id" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <Hash className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Choose community ID</h2>
                    <p className="text-gray-400 text-sm">Your unique community identifier</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                    <input
                      type="text"
                      value={formData.communityId}
                      onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                      placeholder="communityname"
                    />
                  </div>
                  <button
                    onClick={() => setFlowState("community-name")}
                    disabled={!formData.communityId}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: formData.communityId ? "#6E54FF" : "#6B7280",
                      boxShadow: formData.communityId ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                    }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
       {flowState === "community-email" && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}>
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Community contact email</h2>
                    <p className="text-gray-400 text-sm">We'll use this for important updates</p>
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                    placeholder="community@example.com"
                  />
                  <button
                    onClick={() => {
                      sendOtp();
                      setFlowState("community-otp");
                    }}
                    disabled={!formData.email}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: formData.email ? "#6E54FF" : "#6B7280",
                      boxShadow: formData.email ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                    }}
                  >
                    Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}
              {/* Success Screen */}
              {flowState === "success" && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center" style={{
                    backgroundColor: "#10B981",
                    boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(16, 185, 129, 0.50), 0px 0px 0px 1px #10B981"
                  }}>
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-3">Welcome to Clapo!</h2>
                    <p className="text-gray-400 text-lg mb-2">
                      {formData.username ? `@${formData.username}` : `#${formData.communityId}`}
                    </p>
                    <p className="text-gray-400">
                      You're all set to explore the ecosystem
                    </p>
                  </div>
                  <div className="p-6 bg-green-600/20 border-2 border-green-600/50 rounded-xl">
                    <p className="text-sm text-green-300 mb-4">
                      🎉 Your account has been created successfully!
                    </p>
                    {formData.username && (
                      <div className="text-left space-y-2 text-sm text-gray-300">
                        <p>• Following {formData.following.length} users</p>
                        <p>• Interested in {formData.topics.length} topics</p>
                        {session && (
                          <p>• Connected with X: {session.user?.name}</p>
                        )}
                      </div>
                    )}
                    {formData.communityId && (
                      <div className="text-left space-y-2 text-sm text-gray-300">
                        <p>• Community Type: {communityTypes.find(t => t.id === formData.communityType)?.name}</p>
                        <p>• Ready to add members</p>
                      </div>
                    )}
                  </div>
                  <button
                    className="w-full px-6 py-4 text-white text-sm font-medium rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: "#10B981",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(16, 185, 129, 0.50), 0px 0px 0px 1px #10B981"
                    }}
                  >
                    Continue to App →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;