"use client";

import { Home, Search, Bell, User, MessageCircle, Activity } from "lucide-react";
import { PageKey } from "@/app/types";
import { useState } from "react";
import UserProfileCard from "./UserProfileCard";

type SidebarProps = {
  setCurrentPage: (page: PageKey) => void;
  currentPage?: PageKey;
};

const navItems: {
  label: string;
  value: PageKey;
  icon: React.ReactNode;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}[] = [
  { label: "Home", value: "home", icon: <Home className="w-5 h-5 md:mr-4" />, showOnMobile: true, showOnDesktop: true },
  { label: "Explore", value: "explore", icon: <Search className="w-5 h-5 md:mr-4" />, showOnMobile: true, showOnDesktop: true },
  { label: "Notifications", value: "notifications", icon: <Bell className="w-5 h-5 md:mr-4" />, showOnMobile: true, showOnDesktop: true },
  { label: "Activity", value: "activity", icon: <Activity className="w-5 h-5 md:mr-4" />, showOnDesktop: false },
  { label: "Messages", value: "messages", icon: <MessageCircle className="w-5 h-5 md:mr-4" />, showOnMobile: true },
  { label: "Profile", value: "profile", icon: <User className="w-5 h-5 md:mr-4" />, showOnDesktop: true },
];

export default function Sidebar({ setCurrentPage, currentPage }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (value: PageKey) => {
    setCurrentPage(value);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar (only visible on lg and up) */}
      <div
       style={{
  boxShadow:
    "0px 1px 0.5px 0px rgba(255, 255, 255, 0.5) inset, 0px 1px 2px 0px rgba(26, 26, 26, 0.7), 0px 0px 0px 1px #1a1a1a",
  // borderRadius: "8px",
}} 
        className={`
          hidden lg:block
          sticky top-20
          h-full
          w-16 lg:w-64
          px-4
          bg-dark-800 mx-4 rounded-2xl
          space-y-4
          overflow-y-auto
          pb-4
        `}
      >
        {/* User Profile Section */}
        <UserProfileCard onManageClick={() => handleNavClick("profile")} />

        {/* Navigation */}
        <nav className="space-y-2 relative bg-dark-800 rounded-md text-secondary">
          <div
            className="absolute bg-primary rounded-2xl transition-all duration-300 ease-in-out"
            style={{
              top: `${
                0 +
                navItems
                  .filter((item) => item.showOnDesktop !== false)
                  .findIndex((item) => item.value === currentPage) * 56
              }px`,
              left: "0px",
              right: "0px",
              height: "48px",
              opacity: currentPage ? 1 : 0,
               boxShadow:
          "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(26, 19, 161, 0.50), 0px 0px 0px 1px #4F47EB",
        backgroundColor: "#4F47EB",
        color: "white",
        padding: "8px 16px"
            }}
          />
          {navItems
            .filter((item) => item.showOnDesktop !== false)
            .map(({ label, value, icon }) => (
              <div
                key={value}
                onClick={() => handleNavClick(value)}
                className={`
                  relative flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-300
                  ${currentPage === value ? "text-white" : "text-gray-400"}
                `}
                title={label}
              >
                <div className="flex-shrink-0 z-10">{icon}</div>
                <span className="hidden lg:block ml-4 truncate z-10">{label}</span>
              </div>
            ))}
        </nav>
      </div>

      {/* Bottom Navigation Bar (Mobile + iPad, hidden only on lg and up) */}
      <div
        style={{ zIndex: "1000" }}
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-gray-700 z-30"
      >
        <div className="flex justify-around items-center py-2 px-4">
          {navItems
            .filter((item) => item.showOnMobile !== false)
            .map(({ value, icon }) => (
              <button
                key={value}
                onClick={() => handleNavClick(value)}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                  currentPage === value
                    ? "text-white bg-gray-700 rounded-full"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <div className="w-5 h-5 mb-1">{icon}</div>
              </button>
            ))}
        </div>
      </div>
    </>
  );
}
