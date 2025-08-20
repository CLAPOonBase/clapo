"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../lib/api';
import { useRouter } from 'next/navigation';

interface PasswordSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function PasswordSetupModal({ isOpen, onClose, onComplete }: PasswordSetupModalProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  const fetchAccurateTwitterDetails = async (accessToken: string) => {
    console.log('🔍 Fetching Twitter details with access token:', accessToken);
    try {
      const response = await fetch(`/api/twitter?accessToken=${accessToken}`);
      console.log('🔍 Twitter API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Raw Twitter API response:', data);
        
        const userDetails = {
          username: data.data.username,
          name: data.data.name,
          description: data.data.description,
          avatarUrl: data.data.profile_image_url,
          verified: data.data.verified,
          followersCount: data.data.followers_count,
          followingCount: data.data.following_count,
          tweetCount: data.data.tweet_count,
        };
        
        console.log('🔍 Processed Twitter user details:', userDetails);
        localStorage.setItem('twitterDetails', JSON.stringify(userDetails));
        console.log('🔍 Cached Twitter details in localStorage');
        return userDetails;
      } else {
        console.error('🔍 Twitter API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🔍 Error fetching accurate Twitter details:', error);
    }
    return null;
  };

  const getCachedOrFetchTwitterDetails = async (accessToken: string) => {
    console.log('🔍 Checking for cached Twitter details...');
    const cachedDetails = localStorage.getItem('twitterDetails');
    if (cachedDetails) {
      try {
        const parsedDetails = JSON.parse(cachedDetails);
        console.log('🔍 Found cached Twitter details:', parsedDetails);
        return parsedDetails;
      } catch (error) {
        console.error('🔍 Error parsing cached details:', error);
        localStorage.removeItem('twitterDetails');
      }
    } else {
      console.log('🔍 No cached details found, fetching from API...');
    }
    return await fetchAccurateTwitterDetails(accessToken);
  };

  useEffect(() => {
    console.log('🔍 Session changed in PasswordSetupModal:', {
      hasSession: !!session,
      accessToken: session?.access_token ? 'EXISTS' : 'MISSING',
      twitterData: session?.twitterData,
      dbUser: session?.dbUser,
      needsPasswordSetup: session?.needsPasswordSetup,
      provider: session?.provider
    });
    
    if (session?.access_token) {
      console.log('🔍 Access token found, fetching Twitter details...');
      getCachedOrFetchTwitterDetails(session.access_token);
    } else {
      console.log('🔍 No access token in session');
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      let accurateTwitterData = null;
      
      console.log('🔍 Starting password setup process...');
      console.log('🔍 Session data:', {
        hasSession: !!session,
        accessToken: session?.access_token ? 'EXISTS' : 'MISSING',
        twitterData: session?.twitterData,
        needsPasswordSetup: session?.needsPasswordSetup,
        provider: session?.provider
      });
      
      if (session?.access_token) {
        console.log('🔍 Fetching accurate Twitter data with access token...');
        accurateTwitterData = await getCachedOrFetchTwitterDetails(session.access_token);
        console.log('🔍 Accurate Twitter data received:', accurateTwitterData);
      } else {
        console.log('🔍 No access token available, using fallback data');
      }
      
      console.log('🔍 Session data for signup:', {
        twitterData: session?.twitterData,
        accurateTwitterData: accurateTwitterData,
        provider: session?.provider,
        email: session?.twitterData?.email || `${session?.twitterData?.username || 'user'}@twitter.com`
      });
      
      const signupData = {
        username: accurateTwitterData?.username || session?.twitterData?.username || '',
        email: session?.twitterData?.email || `${session?.twitterData?.username || 'user'}@twitter.com`, // Fallback email
        password: passwordData.password,
        bio: accurateTwitterData?.description || session?.twitterData?.bio || 'Twitter user',
        avatarUrl: accurateTwitterData?.avatarUrl || session?.twitterData?.avatarUrl || '',
      };

      console.log('🔍 Final signup data:', {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password ? '[HIDDEN]' : 'MISSING',
        bio: signupData.bio,
        avatarUrl: signupData.avatarUrl,
        dataSource: accurateTwitterData ? 'Twitter API' : 'OAuth Fallback'
      });

      if (!signupData.username) {
        throw new Error('Username is missing');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(signupData.username)) {
        throw new Error('Username must contain only letters, numbers, and underscores');
      }
      if (signupData.username.length > 50) {
        throw new Error('Username must be 50 characters or less');
      }
      if (!signupData.email) {
        throw new Error('Email is missing');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.email)) {
        throw new Error('Email format is invalid');
      }
      if (signupData.email.length > 100) {
        throw new Error('Email must be 100 characters or less');
      }
      if (!signupData.password) {
        throw new Error('Password is missing');
      }
      if (signupData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      if (!signupData.bio) {
        throw new Error('Bio is missing');
      }
      if (!signupData.avatarUrl) {
        throw new Error('Avatar URL is missing');
      }
      if (!signupData.avatarUrl.startsWith('http')) {
        throw new Error('Avatar URL must be a valid HTTP URL');
      }

      const signupResponse = await apiService.signup(signupData);
      
      if (signupResponse && signupResponse.user && signupResponse.user.id) {
        try {
          const profileResponse = await apiService.getUserProfile(signupResponse.user.id);
          
          const completeUserData = profileResponse.profile;
          
          if (!completeUserData.avatarUrl && (profileResponse.profile as any).avatar_url) {
            completeUserData.avatarUrl = (profileResponse.profile as any).avatar_url;
          }
          
          if (!completeUserData.avatarUrl && session?.twitterData?.avatarUrl) {
            completeUserData.avatarUrl = session.twitterData.avatarUrl;
          }
          
          await update({
            dbUserId: completeUserData.id,
            dbUser: completeUserData,
            needsPasswordSetup: false,
            twitterData: null
          });
          
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          
          const fallbackUserData = { ...signupResponse.user };
          if (!fallbackUserData.avatarUrl && session?.twitterData?.avatarUrl) {
            fallbackUserData.avatarUrl = session.twitterData.avatarUrl;
          }
          
          await update({
            dbUserId: fallbackUserData.id,
            dbUser: fallbackUserData,
            needsPasswordSetup: false,
            twitterData: null
          });
        }
        
        onComplete();
      } else {
        throw new Error('Failed to create user account');
      }
    } catch (error) {
      console.error('Failed to create user account:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-dark-800 rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-white">Set Your Password</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-400 mb-6">
            Welcome, {session?.twitterData?.username || session?.dbUser?.username || 'User'}! Please set a password for future logins.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full bg-dark-700 border border-gray-600 rounded-lg px-3 py-2 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {isLoading ? 'Setting password...' : 'Set Password'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 