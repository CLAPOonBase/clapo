'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import PasswordSetupModal from './PasswordSetupModal';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const { data: session, status } = useSession();
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
      const mobileRegex = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Password setup modal logic
  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowPasswordSetup(false);
      return;
    }

    if (
      status === 'authenticated' &&
      session?.needsPasswordSetup === true &&
      session?.provider === 'twitter' &&
      session?.twitterData &&
      !session?.dbUser
    ) {
      setShowPasswordSetup(true);
    } else {
      setShowPasswordSetup(false);
    }
  }, [session?.needsPasswordSetup, session?.provider, session?.twitterData, session?.dbUser, status]);

  const handlePasswordComplete = async () => {
    setShowPasswordSetup(false);
  };

  const handlePasswordSkip = () => {
    setShowPasswordSetup(false);
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
