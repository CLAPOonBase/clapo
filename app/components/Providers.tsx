"use client";

import { SessionProvider } from "next-auth/react";
import { ApiProvider } from "../Context/ApiProvider";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { WalletProvider } from "@/context/WalletContext";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider 
      session={undefined}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      <ApiProvider>
        <WalletProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </WalletProvider>
      </ApiProvider>
    </SessionProvider>
  );
}
