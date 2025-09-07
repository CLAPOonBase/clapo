"use client";
import { Home, Bell, User, MessageCircle, Activity, Blocks } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type PageKey = "home" | "notifications" | "activity" | "messages" | "profile" | "share";

type SidebarProps = {
  setCurrentPage: (page: PageKey) => void;
  currentPage?: PageKey;
  collapsibleItems?: PageKey[];
  alwaysExpanded?: boolean;
};

const navItems: {
  label: string;
  value: PageKey;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}[] = [
  { 
    label: "Home", 
    value: "home", 
    icon: <Home className="w-6 h-6" />, 
    activeIcon: <Home className="w-6 h-6" fill="currentColor" />,
    showOnMobile: true, 
    showOnDesktop: true 
  },
  { 
    label: "Notifications", 
    value: "notifications", 
    icon: <Bell className="w-6 h-6" />, 
    activeIcon: <Bell className="w-6 h-6" fill="currentColor" />,
    showOnMobile: true, 
    showOnDesktop: true 
  },
  { 
    label: "Activity", 
    value: "activity", 
    icon: <Activity className="w-6 h-6" />, 
    activeIcon: <Activity className="w-6 h-6" fill="currentColor" />,
    showOnDesktop: true 
  },
  { 
    label: "Messages", 
    value: "messages", 
    icon: <MessageCircle className="w-6 h-6" />, 
    activeIcon: <MessageCircle className="w-6 h-6" fill="currentColor" />,
    showOnMobile: true 
  },
  { 
    label: "Profile", 
    value: "profile", 
    icon: <User className="w-6 h-6" />, 
    activeIcon: <User className="w-6 h-6" fill="currentColor" />,
    showOnDesktop: true 
  },
  { 
    label: "Share", 
    value: "share", 
    icon: <Blocks className="w-6 h-6" />, 
    activeIcon: <Blocks className="w-6 h-6" fill="currentColor" />,
    showOnDesktop: true 
  },
];

export default function Sidebar({ 
  setCurrentPage, 
  currentPage = "home",
  collapsibleItems = ["messages"], 
  alwaysExpanded = false
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleNavClick = (value: PageKey) => {
    setCurrentPage(value);
  };

  const shouldCollapse = !alwaysExpanded && collapsibleItems.includes(currentPage);
  const sidebarWidth = shouldCollapse ? (isHovered ? 220 : 85) : 220;

  return (
    <div className="fixed left-0 top-0 max-h-screen bg-black border-r-2 border-gray-700/70 z-50">
      <motion.div
        onMouseEnter={() => shouldCollapse && setIsHovered(true)}
        onMouseLeave={() => shouldCollapse && setIsHovered(false)}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 24, mass: 0.8 }}
        className="flex flex-col justify-between h-screen px-4 py-6 overflow-hidden"
      >
        {/* Logo Section */}
        <div>
          <div className="flex items-center justify-start px-4 mb-36">
            <Image
              src="/navlogo.png"
              alt="Clapo Logo"
              width={140}
              height={40}
              className="object-contain h-8 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navItems
              .filter((item) => item.showOnDesktop !== false)
              .map(({ label, value, icon, activeIcon }, index) => {
                const showLabel = !shouldCollapse || isHovered;
                const isActive = currentPage === value;

                return (
                  <motion.button
                    key={value}
                    onClick={() => handleNavClick(value)}
                    className={`flex items-center px-4 py-1.5 rounded-xl transition-all duration-200 group relative text-left
                      ${isActive 
                        ? "text-white font-semibold" 
                        : "text-gray-400 hover:text-white hover:bg-gray-700/40"
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="flex-shrink-0">
                      {isActive ? activeIcon : icon}
                    </span>

                    <AnimatePresence mode="wait">
                      {showLabel && (
                        <motion.span
                          className="ml-4 whitespace-nowrap font-medium text-sm"
                          initial={shouldCollapse ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={shouldCollapse ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
          </nav>
        </div>

        {/* Bottom Section */}
        <AnimatePresence>
          {(!shouldCollapse || isHovered) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <div className="text-xs text-gray-500 uppercase tracking-wider px-4">
                Explore More
              </div>
              
              <div className="space-y-2">
                <button className="w-full px-4 py-2 rounded-lg text-center bg-gray-700/30 border border-gray-600/40 hover:bg-gray-700/50 transition-colors">
                  <div className="text-gray-300 font-medium text-sm">Opinio</div>
                </button>
                
                <button className="w-full px-4 py-2 rounded-lg text-center bg-gray-700/30 border border-gray-600/40 hover:bg-gray-700/50 transition-colors">
                  <div className="text-gray-300 font-medium text-sm">Snaps</div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}