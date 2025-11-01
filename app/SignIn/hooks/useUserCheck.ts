import { useState, useEffect } from 'react';
import type { User } from '@privy-io/react-auth';
import type { FlowState } from '../types';

interface UseUserCheckProps {
  authenticated: boolean;
  user: User | null;
  ready: boolean;
  flowState: FlowState;
  setFlowState: (state: FlowState) => void;
  setIsRedirecting: (value: boolean) => void;
}

export function useUserCheck({
  authenticated,
  user,
  ready,
  flowState,
  setFlowState,
  setIsRedirecting
}: UseUserCheckProps) {
  const [checkingExistingUser, setCheckingExistingUser] = useState(false);

  useEffect(() => {
    if (authenticated && user && ready) {
      console.log("🔍 User authenticated:", {
        privyId: user.id,
        email: user.email?.address,
        flowState: flowState,
        ready: ready
      });

      // Only check when on initial screen or success screen
      if (flowState === "initial" || flowState === "success") {
        const checkExistingUser = async () => {
          setCheckingExistingUser(true);
          try {
            console.log("🌐 Checking user in backend:", user.id);
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/users/privy/${user.id}`
            );
            const data = await response.json();
            console.log("📦 Backend response:", data);

            if (data.exists && data.user?.hasCompletedOnboarding) {
              // Existing user - redirect immediately
              console.log("✅ Returning user detected, redirecting immediately...");
              setIsRedirecting(true);
              console.log("🚀 Redirecting now to /snaps");
              window.location.href = '/snaps';
            } else if (flowState === "initial") {
              // New user - show onboarding
              console.log("🆕 New user detected, showing onboarding");
              setCheckingExistingUser(false);
              setFlowState("choice");
            }
          } catch (error) {
            console.error('❌ Error checking user:', error);
            // Fallback to localStorage check if API fails
            const profileKey = `profile_completed_${user.id}`;
            const hasCompletedProfile = localStorage.getItem(profileKey);

            if (hasCompletedProfile) {
              console.log("✅ Returning user detected (localStorage), redirecting...");
              setIsRedirecting(true);
              window.location.href = '/snaps';
            } else if (flowState === "initial") {
              console.log("🆕 New user detected (localStorage), showing onboarding");
              setCheckingExistingUser(false);
              setFlowState("choice");
            }
          }
        };

        checkExistingUser();
      }
    }
  }, [authenticated, user, ready, flowState, setFlowState, setIsRedirecting]);

  return { checkingExistingUser };
}
