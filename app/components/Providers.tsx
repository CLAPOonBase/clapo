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

const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    name: 'Monad Token',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        'https://testnet-rpc.monad.xyz',
        'https://rpc.ankr.com/monad_testnet',
        'https://rpc-testnet.monadinfra.com'
      ],
      webSocket: [
        'wss://testnet-rpc.monad.xyz'
      ]
    },
    public: {
      http: [
        'https://testnet-rpc.monad.xyz',
        'https://rpc.ankr.com/monad_testnet',
        'https://rpc-testnet.monadinfra.com'
      ],
      webSocket: [
        'wss://testnet-rpc.monad.xyz'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'Monad Testnet Explorer',
      url: 'https://testnet.monadexplorer.com'
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
            createOnLogin: 'users-without-wallets',
            requireUserPasswordOnCreate: false
          },
          defaultChain: monadTestnet,
          supportedChains: [monadTestnet]
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
