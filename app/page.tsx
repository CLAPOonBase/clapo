"use client";
import { JSX, useEffect, useState } from "react";
import SocialFeedPage from "./snaps/page";
import { PrivyProvider } from "@privy-io/react-auth";


type PageKey =
  | "home"
  | "notifications"
  | "activity"
  | "messages"
  | "profile"
  | "share";

interface NavItem {
  label: string;
  value: PageKey;
  icon: JSX.Element;
  activeIcon: JSX.Element;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

export default function HomePage() {

  return (
    <div>
      <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            appearance: { theme: 'dark' },
            embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
          }}
        >
  <SocialFeedPage />
        </PrivyProvider>
      {/* <FloatingDock items={navItems} defaultActive="home" /> */}
    
    </div>
  );
}
