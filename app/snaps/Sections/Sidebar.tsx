"use client";

import { Home, Search, Bell, Heart, Bookmark, User } from "lucide-react";
import Image from "next/image";
import { PageKey } from "@/app/types";

type SidebarProps = {
  setCurrentPage: (page: PageKey) => void;
};

const navItems: { label: string; value: PageKey; icon: React.ReactNode }[] = [
  { label: "HOME", value: "home", icon: <Home className="w-5 h-5 mr-4" /> },
  { label: "EXPLORE", value: "explore", icon: <Search className="w-5 h-5 mr-4" /> },
  { label: "NOTIFICATIONS", value: "notifications", icon: <Bell className="w-5 h-5 mr-4" /> },
  { label: "LIKES", value: "likes", icon: <Heart className="w-5 h-5 mr-4" /> },
  { label: "BOOKMARKS", value: "bookmarks", icon: <Bookmark className="w-5 h-5 mr-4" /> },
  { label: "PROFILE", value: "profile", icon: <User className="w-5 h-5 mr-4" /> }
];

export default function Sidebar({ setCurrentPage }: SidebarProps) {
  return (
    <div className="w-64 sticky top-0 px-4 h-full space-y-4">
      <div className="flex items-center p-4 rounded-md bg-dark-800">
        <div className="w-8 h-8 bg-black rounded-full mr-2 p-2">
          <Image src={"/4.png"} alt="User Avatar" width={100} height={100} />
        </div>
        <div>
          <div className="text-sm font-semibold">TITAN</div>
          <div className="text-xs text-gray-400">@PHANTOM</div>
        </div>
      </div>
      <nav className="space-y-2 bg-dark-800 rounded-md p-4 text-secondary">
        {navItems.map(({ label, value, icon }) => (
          <div
            key={value}
            onClick={() => setCurrentPage(value)}
            className="flex items-center p-3 rounded-lg hover:bg-gray-800 cursor-pointer"
          >
            {icon}
            <span>{label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
