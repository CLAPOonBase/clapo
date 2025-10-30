"use client";

import { SessionProvider } from "next-auth/react";
import { PrivyProvider } from "@privy-io/react-auth";
import { defineChain } from "viem";
import { ApiProvider } from "../Context/ApiProvider";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import { WalletProvider } from "@/context/WalletContext";

interface ProvidersProps {
  children: React.ReactNode;
}

// NOTE: SessionProvider is kept for backward compatibility with existing credential-based logins.
// All new authentication should use Privy (PrivyProvider below).

const baseSepolia = defineChain({
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://sepolia.base.org',
        'https://base-sepolia-rpc.publicnode.com'
      ],
      webSocket: [
        'wss://base-sepolia-rpc.publicnode.com'
      ]
    },
    public: {
      http: [
        'https://sepolia.base.org',
        'https://base-sepolia-rpc.publicnode.com'
      ],
      webSocket: [
        'wss://base-sepolia-rpc.publicnode.com'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'BaseScan',
      url: 'https://sepolia.basescan.org'
    }
  },
  testnet: true
});

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      session={undefined}
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          appearance: { theme: 'dark' },
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            }
          },
          defaultChain: baseSepolia,
          supportedChains: [baseSepolia]
        }}
      >
        <ApiProvider>
          <WalletProvider>
            <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
          </WalletProvider>
        </ApiProvider>
      </PrivyProvider>
    </SessionProvider>
  );
}
