"use client";
import { JSX, useEffect, useState } from "react";
import { motion } from "framer-motion";
import SocialFeedPage from "./snaps/page";
import {
  Home,
  Bell,
  Activity,
  MessageCircle,
  User,
  Blocks,
} from "lucide-react";
import { FloatingDock } from "./Experiment/FloatingDoc";

interface Row {
  rank: number;
  name: string;
  username: string;
  totalMindshare: string;
  clapoMindshare: string;
  clapoChange: string;
  clapoChangeColor: string;
  seiMindshare: string;
  seiChange: string;
  seiChangeColor: string;
  bg: string;
  avatar: string;
}

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
  const navItems: NavItem[] = [
    {
      label: "Home",
      value: "home",
      icon: <Home className="w-6 h-6" />,
      activeIcon: <Home className="w-6 h-6" fill="currentColor" />,
      showOnMobile: true,
      showOnDesktop: true,
    },
    {
      label: "Notifications",
      value: "notifications",
      icon: <Bell className="w-6 h-6" />,
      activeIcon: <Bell className="w-6 h-6" fill="currentColor" />,
      showOnMobile: true,
      showOnDesktop: true,
    },
    {
      label: "Activity",
      value: "activity",
      icon: <Activity className="w-6 h-6" />,
      activeIcon: <Activity className="w-6 h-6" fill="currentColor" />,
      showOnDesktop: true,
    },
    {
      label: "Messages",
      value: "messages",
      icon: <MessageCircle className="w-6 h-6" />,
      activeIcon: <MessageCircle className="w-6 h-6" fill="currentColor" />,
      showOnMobile: true,
    },
    {
      label: "Profile",
      value: "profile",
      icon: <User className="w-6 h-6" />,
      activeIcon: <User className="w-6 h-6" fill="currentColor" />,
      showOnDesktop: true,
    },
    {
      label: "Share",
      value: "share",
      icon: <Blocks className="w-6 h-6" />,
      activeIcon: <Blocks className="w-6 h-6" fill="currentColor" />,
      showOnDesktop: true,
    },
  ];

  return (
    <div>
      {/* <FloatingDock items={navItems} defaultActive="home" /> */}
      <SocialFeedPage />
    </div>
  );
}
