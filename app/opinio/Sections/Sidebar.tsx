"use client";

import { Home, Search, Bell ,Activity } from "lucide-react";
import Image from "next/image";
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
  { label: "Explore Market", value: "exploremarket", icon: <Home className="w-5 h-5 md:mr-4" />, showOnMobile: true, showOnDesktop: true },
  { label: "My Portfolio", value: "myportfolio", icon: <Search className="w-5 h-5 md:mr-4" />, showOnMobile: true, showOnDesktop: true },
  { label: "Wallet", value: "wallet", icon: <Bell className="w-5 h-5 md:mr-4" />, showOnMobile: true, showOnDesktop: true },
  { label: "Settings", value: "settings", icon: <Activity className="w-5 h-5 md:mr-4" />, showOnDesktop: true },
];


export default function Sidebar({ setCurrentPage, currentPage }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (value: OpinionPageKey) => {
    setCurrentPage(value);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <>
     

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop/Tablet Sidebar */}
      <div className={`
        hidden md:block
        sticky top-0
        h-full
        w-16 lg:w-96
        px-4
        space-y-4
        overflow-y-auto
      `}>
        {/* User Profile Section */}
        <div className="flex items-center pt-4 rounded-md bg-dark-800">
         <Hero/>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 bg-dark-800 rounded-md p-4 text-secondary">
          {navItems
  .filter((item) => item.showOnDesktop !== false)
  .map(({ label, value, icon }) => (

            <div
              key={value}
              onClick={() => handleNavClick(value)}
              className={`flex items-center p-3 rounded-lg hover:bg-gray-800 cursor-pointer group relative ${
                currentPage === value ? 'text-white' : ''
              }`}
              title={label} // Tooltip for collapsed state
            >
              <div className="flex-shrink-0">
                {icon}
              </div>
              <span className="hidden lg:block ml-4 truncate">
                {label}
              </span>
              
              {/* Tooltip for medium screens when collapsed */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 lg:hidden">
                {label}
              </div>
            </div>
          ))}
        </nav>
           <div className="flex justify-center items-center py-2 bg-primary text-white rounded-md hover:bg-orange-700"> Create a Market</div>
      </div>

     
      {/* Mobile Bottom Navigation Bar */}
      <div style={{zIndex:"1000"}} className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-800 border-t border-gray-700 z-30">
        <div className="flex justify-around items-center py-2 px-4">
         {navItems
  .filter((item) => item.showOnMobile !== false)
  .map(({ value, icon }) => (

            <button
              key={value}
              onClick={() => handleNavClick(value)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                currentPage === value ? 'text-white bg-gray-700 rounded-full' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-5 h-5 mb-1">
                {icon}
              </div>
              {/* <span className="text-[8px] truncate w-full text-center">{label}</span> */}
            </button>
          ))}
        </div>
     
      </div>

    </>
  );
}