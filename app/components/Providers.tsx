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
    <SessionProvider>
      <ApiProvider>
        <WalletProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </WalletProvider>
      </ApiProvider>
    </SessionProvider>
  );
}
