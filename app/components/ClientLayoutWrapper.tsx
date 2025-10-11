'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

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

  // Redirect to homepage after successful authentication
  useEffect(() => {
    if (status === 'authenticated' && session?.dbUser) {
      console.log('✅ User authenticated with dbUser, redirecting to homepage');
      // Only redirect if we're on an auth page
      if (window.location.pathname.includes('/auth/') || window.location.pathname.includes('/SignIn')) {
        router.push('/');
      }
    }
  }, [session?.dbUser, status, router]);

  return <>{children}</>;
}
