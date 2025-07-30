"use client";

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import PasswordSetupModal from './PasswordSetupModal';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const { data: session, status } = useSession();
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  useEffect(() => {
    // Show password setup modal only when user has Twitter data but no database user
    if (status === 'authenticated' && 
        session?.needsPasswordSetup && 
        session?.provider === 'twitter' && 
        session?.twitterData && 
        !session?.dbUser) {
      console.log('🔐 Showing password setup modal for Twitter user:', session.twitterData.username);
      setShowPasswordSetup(true);
    } else {
      // Hide modal if user has database data or doesn't need password setup
      setShowPasswordSetup(false);
    }
  }, [session?.needsPasswordSetup, session?.provider, session?.twitterData, session?.dbUser, status]);

  const handlePasswordComplete = async () => {
    setShowPasswordSetup(false);
    
    // Update the session to remove needsPasswordSetup flag
    // This would typically be done by updating the session
    console.log('✅ Password setup completed for user:', session?.dbUser?.username);
    
    // You could also update the user's profile in the database here
    // to mark that they've completed password setup
  };

  const handlePasswordSkip = () => {
    setShowPasswordSetup(false);
    console.log('⏭️ Password setup skipped for user:', session?.dbUser?.username);
  };

  return (
    <>
      {children}
      <PasswordSetupModal
        isOpen={showPasswordSetup}
        onClose={handlePasswordSkip}
        onComplete={handlePasswordComplete}
      />
    </>
  );
} 