import { useState } from 'react';
import type { User } from '@privy-io/react-auth';
import type { FormData, FlowState } from '../types';

export function useFormHandlers(
  user: User | null,
  formData: FormData,
  accountType: 'individual' | 'community',
  setFlowState: (state: FlowState) => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
        username: formData.username,
        displayName: formData.displayName || null,
        topics: formData.topics || [],
        following: formData.following || []
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

      // Step 4: Create creator token if enabled (optional, don't block on failure)
      if (formData.enableCreatorShare) {
        try {
          console.log('🎨 Creating creator share token...');
          console.log('⚠️ Creator share token creation will be implemented');
        } catch (tokenError) {
          console.error('⚠️ Creator token creation failed, continuing anyway:', tokenError);
        }
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

  return { handleComplete, isSubmitting, submitError };
}
