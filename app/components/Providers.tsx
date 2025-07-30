"use client";

import { SessionProvider } from 'next-auth/react'
import { ApiProvider } from '../Context/ApiProvider'
import ClientLayoutWrapper from './ClientLayoutWrapper'

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ApiProvider>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </ApiProvider>
    </SessionProvider>
  );
} 