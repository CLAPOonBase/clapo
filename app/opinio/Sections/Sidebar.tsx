"use client";

import { BriefcaseBusiness, Telescope, Wallet, Settings } from "lucide-react";
import { OpinionPageKey } from "@/app/types";
import { useState } from "react";
import Hero from "./Hero";

type SidebarProps = {
  setCurrentPage: (page: OpinionPageKey) => void;
  currentPage?: OpinionPageKey;
};

const navItems: {
  label: string;
  value: OpinionPageKey;
  icon: React.ReactNode;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}[] = [
  {
    label: "Explore Market",
    value: "exploremarket",
    icon: <Telescope className="w-5 h-5 md:mr-4" />,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    label: "My Portfolio",
    value: "myportfolio",
    icon: <BriefcaseBusiness className="w-5 h-5 md:mr-4" />,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    label: "Wallet",
    value: "wallet",
    icon: <Wallet className="w-5 h-5 md:mr-4" />,
    showOnMobile: true,
    showOnDesktop: true,
  },
  {
    label: "Settings",
    value: "settings",
    icon: <Settings className="w-5 h-5 md:mr-4" />,
    showOnDesktop: true,
  },
];

export default function Sidebar({ setCurrentPage, currentPage }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (value: OpinionPageKey) => {
    setCurrentPage(value);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
        hidden md:block
        sticky top-0
        h-full
        
        px-4
        space-y-4
     
      `}
      >
        <div className="flex items-center pt-4 rounded-md bg-[#1A1A1A] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] border border-[#2A2A2A]">
          <Hero />
        </div>

        <nav className="space-y-2 bg-[#1A1A1A] rounded-md p-4 text-gray-300 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.3)] border border-[#2A2A2A]">
          {navItems
            .filter((item) => item.showOnDesktop !== false)
            .map(({ label, value, icon }) => (
              <div
                key={value}
                onClick={() => handleNavClick(value)}
                className={`flex items-center p-3 rounded-lg hover:bg-[#2A2A2A] cursor-pointer group relative transition-all duration-200 ${
                  currentPage === value ? "text-white bg-[#6E54FF] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]" : ""
                }`}
                title={label}
              >
                <div className="flex-shrink-0">{icon}</div>
                <span className="hidden lg:block ml-4 truncate">{label}</span>

                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 lg:hidden">
                  {label}
                </div>
              </div>
            ))}
        </nav>
        <div
          onClick={() => handleNavClick("createmarket")}
          className={`flex justify-center items-center py-3 bg-[#6E54FF] text-white rounded-[100px] hover:bg-[#836EF9] cursor-pointer transition-all duration-200 shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] ${
            currentPage === "createmarket" ? "bg-[#836EF9]" : ""
          }`}
        >
          Create a Market
        </div>
      </div>

      <div
        style={{ zIndex: "1000" }}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] z-30 shadow-[0px_-4px_20px_0px_rgba(0,0,0,0.3)]"
      >
        <div className="flex justify-around items-center py-2 px-4">
          {navItems
            .filter((item) => item.showOnMobile !== false)
            .map(({ value, icon }) => (
              <button
                key={value}
                onClick={() => handleNavClick(value)}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-all duration-200 ${
                  currentPage === value
                    ? "text-white bg-[#6E54FF] rounded-full shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB]"
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
