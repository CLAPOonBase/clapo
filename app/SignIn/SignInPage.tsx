"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, Check, Mail, AtSign, User, Hash, Users, Sparkles, Wallet, Camera } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

type FlowState = 
  | "initial" 
  | "choice"
  | "individual-name-username"
  | "individual-displayname"
  | "individual-topics"
  | "individual-follow"
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
    name: "",
    username: "",
    displayName: "",
    topics: [] as string[],
    following: [] as string[],
    communityId: "",
    communityName: "",
    communityType: ""
  });

  const { login, logout, authenticated, user, ready } = usePrivy();

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

  // Check if user is new and needs profile completion
  useEffect(() => {
    if (authenticated && user && flowState === "initial") {
      // Check if user has completed profile
      const profileKey = `profile_completed_${user.id}`;
      const hasCompletedProfile = localStorage.getItem(profileKey);
      
      if (!hasCompletedProfile) {
        // New user needs to complete profile
        setFlowState("choice");
      } else {
        // Returning user - you can redirect to app here
        console.log("Returning user detected, redirect to app");
        // window.location.href = '/dashboard';
      }
    }
  }, [authenticated, user, flowState]);

  const handleBack = () => {
    const backMap: Record<string, FlowState> = {
      "choice": "initial",
      "individual-name-username": "choice",
      "individual-displayname": "individual-name-username",
      "individual-topics": "individual-displayname",
      "individual-follow": "individual-topics",
      "community-id": "choice",
      "community-name": "community-id",
      "community-type": "community-name"
    };
    setFlowState(backMap[flowState] || "initial");
  };

  const handlePrivyLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Privy login error:", error);
    }
  };

  const handlePrivyLogout = async () => {
    try {
      await logout();
      setFlowState("initial");
      // Clear all form data
      setFormData({
        name: "",
        username: "",
        displayName: "",
        topics: [],
        following: [],
        communityId: "",
        communityName: "",
        communityType: ""
      });
    } catch (error) {
      console.error("Privy logout error:", error);
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

  const handleComplete = async () => {
    if (!user) return;

    // Prepare complete profile data
    const profileData = {
      // Privy Authentication Data
      privyId: user.id,
      email: user.email?.address || null,
      wallet: user.wallet?.address || null,
      phone: user.phone?.number || null,
      
      // Social Connections
      twitter: user.twitter?.username || null,
      discord: user.discord?.username || null,
      github: user.github?.username || null,
      google: user.google?.email || null,
      
      // User Profile Data
      name: formData.name || null,
      username: formData.username || null,
      displayName: formData.displayName || null,
      
      // Preferences
      topics: formData.topics || [],
      following: formData.following || [],
      
      // Community Data (if applicable)
      communityId: formData.communityId || null,
      communityName: formData.communityName || null,
      communityType: formData.communityType || null,
      
      // Metadata
      accountType: formData.username ? 'individual' : 'community',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Console log for API integration reference
    console.log("=================================");
    console.log("📦 COMPLETE PROFILE DATA FOR API");
    console.log("=================================");
    console.log(JSON.stringify(profileData, null, 2));
    console.log("=================================");
    console.log("💾 Use this object structure for your API endpoint");
    console.log("=================================");

    try {
      // Save to localStorage instead of API
      localStorage.setItem(`profile_completed_${user.id}`, 'true');
      localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(profileData));
      
      // Also save as latest user for easy access
      localStorage.setItem('latest_user_profile', JSON.stringify(profileData));
      
      console.log("✅ Profile saved to localStorage successfully!");
      console.log("Key: user_profile_" + user.id);
      
      setFlowState("success");
      
    } catch (error) {
      console.error("❌ Error saving to localStorage:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const handleClose = () => {
    // Navigate to landing page
    window.location.href = '/';
    // Or if using Next.js router:
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push('/');
  };

  const getStepInfo = () => {
    const stepMap: Record<string, string> = {
      "individual-name-username": "Step 1 of 4",
      "individual-displayname": "Step 2 of 4",
      "individual-topics": "Step 3 of 4",
      "individual-follow": "Final Step",
      "community-id": "Step 1 of 3",
      "community-name": "Step 2 of 3",
      "community-type": "Step 3 of 3"
    };
    return stepMap[flowState] || "";
  };

  const getAuthProviderText = () => {
    if (!user) return "";
    
    if (user.email?.address) return "Email";
    if (user.wallet?.address) return "Wallet";
    if (user.twitter?.username) return "Twitter";
    if (user.discord?.username) return "Discord";
    if (user.github?.username) return "GitHub";
    if (user.phone?.number) return "Phone";
    
    return "Privy";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-black border-2 border-gray-700/70 rounded-xl w-full max-w-5xl shadow-2xl flex overflow-hidden">
          
          {/* Left Side - Illustration/Branding */}
          <div 
            style={{
              backgroundColor: "#6E54FF",
              boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
            }} 
            className="hidden lg:flex lg:w-1/2 relative p-12 items-center justify-center bg-gradient-to-br from-[#4F47EB]/20 to-[#3B32C7]/20 border-r-2 border-gray-700/70"
          >
            <div className="relative z-10 text-center">
              <div className="mb-8 text-8xl">🎯</div>
              <h2 className="text-3xl font-bold text-white mb-4">Join, Create & Connect</h2>
              <h1 className="text-4xl font-bold text-white mb-4">Welcome to Clapo</h1>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                {flowState.includes("individual") 
                  ? "Join as an individual to connect with the community"
                  : flowState.includes("community")
                  ? "Create and manage your own community space"
                  : "Connect your wallet and social accounts to unlock the full Web3 experience"}
              </p>

              <div className="absolute top-10 left-10 w-20 h-20 bg-[#6E54FF]/20 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Right Side - Dynamic Content */}
          <div className="flex-1 lg:w-1/2 p-8 lg:p-12 relative overflow-y-auto max-h-screen">
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
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center" 
                  style={{
                    backgroundColor: "#6E54FF",
                    boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                  }}
                >
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
            <div className="flex justify-center items-start min-h-[400px]">
              {/* Initial Screen */}
              {flowState === "initial" && (
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
                          onClick={handlePrivyLogout}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center justify-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handlePrivyLogin}
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

                  {authenticated && user && (
                    <div className="space-y-4">
                      <button
                        onClick={() => setFlowState("choice")}
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
              )}

              {/* Choice Screen */}
              {flowState === "choice" && (
                <div className="space-y-4 w-full">
                  <p className="text-gray-400 text-center mb-6">How would you like to join Clapo?</p>
                  
                  <button
                    onClick={() => setFlowState("individual-name-username")}
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
                    onClick={() => setFlowState("community-id")}
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
              )}

              {/* Individual Flow - Combined Name & Username */}
              {flowState === "individual-name-username" && (
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                        placeholder="username"
                      />
                    </div>
                    {formData.name && (
                      <p className="text-xs text-gray-500">
                        Auto-generated username. Feel free to edit it.
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

              {/* Individual Flow - Topics */}
              {flowState === "individual-topics" && (
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
                  <div className="text-center text-sm text-gray-400">
                    {formData.topics.length} of 3 selected
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
                    {suggestedUsers.map((user) => (
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
                    onClick={handleComplete}
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

              {/* Community Flow - ID */}
              {flowState === "community-id" && (
                <div className="space-y-6 w-full">
                  <div className="text-center mb-6">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" 
                      style={{
                        backgroundColor: "#6E54FF",
                        boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                      }}
                    >
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

              {/* Community Flow - Name */}
              {flowState === "community-name" && (
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
                    <h2 className="text-2xl font-bold text-white mb-2">Community name</h2>
                    <p className="text-gray-400 text-sm">What should we call your community?</p>
                  </div>
                  <input
                    type="text"
                    value={formData.communityName}
                    onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                    className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500"
                    placeholder="My Awesome Community"
                  />
                  <button
                    onClick={() => setFlowState("community-type")}
                    disabled={!formData.communityName}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: formData.communityName ? "#6E54FF" : "#6B7280",
                      boxShadow: formData.communityName ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                    }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {/* Community Flow - Type */}
              {flowState === "community-type" && (
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
                    <h2 className="text-2xl font-bold text-white mb-2">Community type</h2>
                    <p className="text-gray-400 text-sm">Choose how you want to manage your community</p>
                  </div>
                  <div className="space-y-3">
                    {communityTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, communityType: type.id })}
                        className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                          formData.communityType === type.id
                            ? "border-[#6E54FF] bg-[#6E54FF]/10"
                            : "border-gray-600/30 bg-gray-700/30 hover:bg-gray-600/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-white font-semibold mb-1">{type.name}</h3>
                            <p className="text-gray-400 text-sm">{type.description}</p>
                          </div>
                          {formData.communityType === type.id && (
                            <div 
                              className="w-6 h-6 rounded-full flex items-center justify-center" 
                              style={{
                                backgroundColor: "#6E54FF",
                                boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                              }}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleComplete}
                    disabled={!formData.communityType}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: formData.communityType ? "#6E54FF" : "#6B7280",
                      boxShadow: formData.communityType ? "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF" : "none"
                    }}
                  >
                    Complete Setup <Check className="w-4 h-4 ml-2" />
                  </button>
                </div>
              )}

              {/* Success Screen */}
              {flowState === "success" && (
                <div className="text-center space-y-6 w-full">
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
                        <p>• Name: {formData.name}</p>
                        <p>• Display Name: {formData.displayName}</p>
                        <p>• Following {formData.following.length} users</p>
                        <p>• Interested in {formData.topics.length} topics</p>
                        {user && (
                          <p>• Connected: {user.email?.address || `${user.wallet?.address?.slice(0, 6)}...${user.wallet?.address?.slice(-4)}`}</p>
                        )}
                      </div>
                    )}
                    {formData.communityId && (
                      <div className="text-left space-y-2 text-sm text-gray-300">
                        <p>• Community ID: #{formData.communityId}</p>
                        <p>• Name: {formData.communityName}</p>
                        <p>• Type: {communityTypes.find(t => t.id === formData.communityType)?.name}</p>
                        <p>• Ready to add members</p>
                        {user && (
                          <p>• Admin: {user.email?.address || `${user.wallet?.address?.slice(0, 6)}...${user.wallet?.address?.slice(-4)}`}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      console.log("Profile completed successfully");
                      // Navigate to landing page after successful setup
                      window.location.href = '/';
                      // Or using Next.js router:
                      // router.push('/');
                    }}
                    className="w-full px-6 py-4 text-white text-sm font-medium rounded-full transition-all duration-200"
                    style={{
                      backgroundColor: "#10B981",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(16, 185, 129, 0.50), 0px 0px 0px 1px #10B981"
                    }}
                  >
                    Go to Landing Page →
                  </button>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      Profile saved successfully. You can now access all features.
                    </p>
                  </div>
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