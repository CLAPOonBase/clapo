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
    if (
      status === 'authenticated' &&
      session?.needsPasswordSetup &&
      session?.provider === 'twitter' &&
      session?.twitterData &&
      !session?.dbUser
    ) {
      console.log('🔐 Showing password setup modal for Twitter user:', session.twitterData.username);
      setShowPasswordSetup(true);
    } else {
      setShowPasswordSetup(false);
    }
  }, [session?.needsPasswordSetup, session?.provider, session?.twitterData, session?.dbUser, status]);

  const handlePasswordComplete = async () => {
    setShowPasswordSetup(false);
    console.log('✅ Password setup completed for user:', session?.dbUser?.username);
  };

  const handlePasswordSkip = () => {
    setShowPasswordSetup(false);
    console.log('⏭️ Password setup skipped for user:', session?.dbUser?.username);
  };

  // If mobile, show blocking message
  if (isMobile) {
    return (
      <div style={{ color: 'white', backgroundColor: 'black', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '1rem' }}>
        <div>
          <h1>This website is only available on desktop devices.</h1>
          <p>Please access it from a desktop browser for the best experience.</p>
        </div>
      </div>
    );
  }

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
