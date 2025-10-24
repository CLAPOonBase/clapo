"use client";
import { JSX, useEffect, useState } from "react";
import SocialFeedPage from "./snaps/page";

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
      <SocialFeedPage />
      {/* <FloatingDock items={navItems} defaultActive="home" /> */}
    </div>
  );
}
