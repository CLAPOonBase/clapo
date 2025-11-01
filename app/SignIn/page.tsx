"use client";

import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Check, Sparkles, Camera, User, ArrowRight, Loader2, AtSign } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

type FlowState =
  | "initial"
  | "choice"
  | "name-username"
  | "displayname"
  | "topics"
  | "follow"
  | "avatar"
  | "bio"
  | "success";

// Hooks
import { useUsernameCheck } from './hooks/useUsernameCheck';
import { useUserCheck } from './hooks/useUserCheck';
import { useFormHandlers } from './hooks/useFormHandlers';

// Components
import { InitialScreen } from './components/InitialScreen';
import { ChoiceScreen } from './components/ChoiceScreen';
import { NameUsernameScreen } from './components/NameUsernameScreen';
import { DisplayNameScreen } from './components/DisplayNameScreen';
import { TopicsScreen } from './components/TopicsScreen';
import { FollowScreen } from './components/FollowScreen';
import { SuccessScreen } from './components/SuccessScreen';

// Utils
import { generateUsername, getAuthProviderText } from './utils/helpers';

function SignInPage() {
  const [flowState, setFlowState] = useState<FlowState>("initial");
  const [accountType, setAccountType] = useState<'individual' | 'community'>('individual');
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    displayName: "",
    topics: [] as string[],
    following: [] as string[],
    avatarFile: null as File | null,
    avatarPreview: "" as string,
    bio: ""
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { login, logout, authenticated, user, ready } = usePrivy();

  // Custom hooks
  const { usernameAvailable, checkingUsername } = useUsernameCheck(formData.username);
  const { checkingExistingUser } = useUserCheck({
    authenticated,
    user,
    ready,
    flowState,
    setFlowState,
    setIsRedirecting
  });
  const { handleComplete, isSubmitting, submitError } = useFormHandlers(
    user,
    formData,
    accountType,
    setFlowState
  );

  // Auto-generate username when name changes
  useEffect(() => {
    if (flowState === "name-username" && formData.name) {
      const generatedUsername = generateUsername(formData.name);
      setFormData(prev => ({ ...prev, username: generatedUsername }));
    }
  }, [formData.name, flowState]);

  // Handlers
  const handleBack = () => {
    const backMap: Record<string, FlowState> = {
      "choice": "initial",
      "name-username": "choice",
      "displayname": "name-username",
      "topics": "displayname",
      "follow": "topics",
      "avatar": "follow",
      "bio": "avatar"
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
      setAccountType('individual');
      // Clear all form data
      setFormData({
        name: "",
        username: "",
        displayName: "",
        topics: [],
        following: [],
        avatarFile: null,
        avatarPreview: "",
        bio: ""
      });
    } catch (error) {
      console.error("Privy logout error:", error);
    }
  };

  const handleChooseAccountType = (type: AccountType) => {
    setAccountType(type);
    setFlowState("name-username");
  };

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
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

  // Handle avatar file selection
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, avatarFile: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, avatarPreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Step 1: Upload avatar if provided
      let avatarUrl: string | null = null;
      if (formData.avatarFile) {
        try {
          const formDataUpload = new FormData();
          formDataUpload.append('file', formData.avatarFile);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formDataUpload,
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            avatarUrl = uploadResult.url;
            console.log('✅ Avatar uploaded:', avatarUrl);
          }
        } catch (uploadError) {
          console.error('⚠️ Avatar upload failed, continuing without it:', uploadError);
        }
      }

      // Step 2: Prepare complete profile data
      const profileData: any = {
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

        // Metadata
        accountType: accountType,

        // User profile fields
        name: formData.name,
        username: formData.username,
        displayName: formData.displayName || null,
        bio: formData.bio || null,
        topics: formData.topics || [],
        following: formData.following || [],
        ...(avatarUrl && { avatar_url: avatarUrl })
      };

      console.log("📦 Submitting profile data to API:", profileData);

      // Step 3: Create profile
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signup/privy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message?.message || data.message || 'Failed to create account';
        throw new Error(errorMessage);
      }

      // Save minimal data to localStorage for session
      localStorage.setItem(`profile_completed_${user.id}`, 'true');
      localStorage.setItem('latest_user_profile', JSON.stringify(data.user || profileData));

      console.log("✅ Profile created successfully:", data);
      setFlowState("success");

    } catch (error) {
      console.error("❌ Error creating account:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    window.location.href = '/';
  };

  const getStepInfo = () => {
    const stepMap: Record<string, string> = {
      "name-username": "Step 1 of 6",
      "displayname": "Step 2 of 6",
      "topics": "Step 3 of 6",
      "follow": "Step 4 of 6",
      "avatar": "Step 5 of 6",
      "bio": "Final Step"
    };
    return stepMap[flowState] || "";
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
                {flowState === "choice"
                  ? "Choose your account type and get started"
                  : flowState !== "initial" && flowState !== "success"
                  ? accountType === 'community'
                    ? "Create your community profile"
                    : "Create your personal profile"
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
              {flowState === "initial" && (
                <InitialScreen
                  authenticated={authenticated}
                  user={user}
                  ready={ready}
                  checkingExistingUser={checkingExistingUser}
                  onLogin={handlePrivyLogin}
                  onLogout={handlePrivyLogout}
                  onContinue={() => setFlowState("choice")}
                  getAuthProviderText={() => getAuthProviderText(user)}
                />
              )}

              {flowState === "choice" && (
                <ChoiceScreen onChoose={handleChooseAccountType} />
              )}

              {flowState === "name-username" && (
                <NameUsernameScreen
                  formData={formData}
                  usernameAvailable={usernameAvailable}
                  checkingUsername={checkingUsername}
                  onUpdateFormData={updateFormData}
                  onContinue={() => setFlowState("displayname")}
                />
              )}

              {flowState === "displayname" && (
                <DisplayNameScreen
                  formData={formData}
                  onUpdateFormData={updateFormData}
                  onContinue={() => setFlowState("topics")}
                />
              )}

              {flowState === "topics" && (
                <TopicsScreen
                  formData={formData}
                  onToggleTopic={toggleTopic}
                  onContinue={() => setFlowState("follow")}
                />
              )}

              {flowState === "follow" && (
                <FollowScreen
                  formData={formData}
                  submitError={submitError}
                  onToggleFollow={toggleFollow}
                  onContinue={handleComplete}
                />
              )}

              {/* Avatar Upload Step */}
              {flowState === "avatar" && (
                <div className="space-y-6 w-full">
                  <div className="text-center mb-6">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: "#6E54FF",
                        boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                      }}
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Add a profile picture</h2>
                    <p className="text-gray-400 text-sm">Optional • You can skip this step</p>
                  </div>

                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div
                        className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700/70 bg-gray-800"
                        style={{
                          boxShadow: "0px 0px 0px 4px rgba(110, 84, 255, 0.2)"
                        }}
                      >
                        {formData.avatarPreview ? (
                          <img
                            src={formData.avatarPreview}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                            <User className="w-16 h-16 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                        style={{
                          backgroundColor: "#6E54FF",
                          boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                        }}
                      >
                        <Camera className="w-5 h-5 text-white" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center max-w-xs">
                      Choose an image that represents you (Max 5MB, JPG/PNG)
                    </p>
                  </div>

                  <button
                    onClick={() => setFlowState("bio")}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center justify-center"
                    style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                  <button
                    onClick={() => setFlowState("bio")}
                    className="w-full px-6 py-3 text-gray-400 text-sm font-medium rounded-full transition-all duration-200 hover:text-white hover:bg-gray-700/30"
                  >
                    Skip for now
                  </button>
                </div>
              )}

              {/* Bio Step */}
              {flowState === "bio" && (
                <div className="space-y-6 w-full">
                  <div className="text-center mb-6">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: "#6E54FF",
                        boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                      }}
                    >
                      <AtSign className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Write a bio</h2>
                    <p className="text-gray-400 text-sm">Tell people about yourself</p>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={formData.bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 160) {
                          setFormData({ ...formData, bio: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-3 bg-black border-2 border-gray-700/70 text-white rounded-xl focus:border-[#6E54FF]/50 focus:outline-none transition-all duration-200 placeholder:text-gray-500 resize-none h-32"
                      placeholder="Share something interesting about yourself..."
                    />
                    <div className="flex justify-between items-center px-2">
                      <p className="text-xs text-gray-500">Optional</p>
                      <p className={`text-xs ${formData.bio.length >= 160 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {formData.bio.length}/160
                      </p>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-4 bg-red-600/20 border border-red-600/50 rounded-xl">
                      <p className="text-sm text-red-300">{submitError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleComplete}
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 text-white text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor: "#6E54FF",
                      boxShadow: "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(110, 84, 255, 0.50), 0px 0px 0px 1px #6E54FF"
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Complete Setup <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Success Screen */}
              {flowState === "success" && (
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
                    <div className="text-left space-y-2 text-sm text-gray-300">
                      <p>• Account Type: {accountType === 'community' ? 'Community' : 'Individual'}</p>
                      <p>• Name: {formData.name}</p>
                      <p>• Display Name: {formData.displayName}</p>
                      {formData.bio && <p>• Bio: {formData.bio}</p>}
                      <p>• Following {formData.following.length} users</p>
                      <p>• Interested in {formData.topics.length} topics</p>
                      {user && (
                        <p>• Connected: {user.email?.address || `${user.wallet?.address?.slice(0, 6)}...${user.wallet?.address?.slice(-4)}`}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      console.log("Profile completed successfully - redirecting to snaps");
                      // Small delay to ensure everything is saved
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
