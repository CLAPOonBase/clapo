"use client";
import { Home, Bell, User, MessageCircle, Activity, Blocks, TrendingUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWalletContext } from "@/context/WalletContext";
import { useSession } from "next-auth/react";
import SignInPage from "@/app/SignIn/SignInPage";

type PageKey = "home" | "notifications" | "activity" | "messages" | "profile" | "share" |"explore" | "search" | "likes" | "bookmarks";

type SidebarProps = {
  setCurrentPage: (page: PageKey) => void;
  currentPage?: PageKey;
  collapsibleItems?: PageKey[];
  alwaysExpanded?: boolean;
  onNavigateToOpinio?: () => void;
  onNavigateToSnaps?: () => void;
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

interface ExtendedSession {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  dbUser?: {
    id: string;
    username: string;
    email: string;
    bio: string;
    avatar_url: string;
    createdAt: string;
  };
  dbUserId?: string;
  access_token?: string;
}

export default function Sidebar({ 
  setCurrentPage, 
  currentPage = "home",
  collapsibleItems = ["messages"], 
  alwaysExpanded = false,
  onNavigateToOpinio,
  onNavigateToSnaps
}: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeDialog, setActiveDialog] = useState<null | "x" | "wallet">(null);
  const router = useRouter();
  const { connect, disconnect, address } = useWalletContext();
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const bottomNavItems = [
     { name: "Opinio", path: "/opinio" },
     { name: "Claps", path: "/" },
   ];

  const handleNavClick = (value: PageKey) => {
    setCurrentPage(value);
  };

  const handleOpinioClick = () => {
    if (onNavigateToOpinio) {
      onNavigateToOpinio();
    } else {
      router.push('/opinio');
    }
  };

  const handleSnapsClick = () => {
    if (onNavigateToSnaps) {
      onNavigateToSnaps();
    } else {
      router.push('/snaps');
    }
  };

  const openDialog = (type: "x" | "wallet") => setActiveDialog(type);
  const closeDialog = () => setActiveDialog(null);

  const shouldCollapse = !alwaysExpanded && collapsibleItems.includes(currentPage);
  const sidebarWidth = shouldCollapse ? (isHovered ? 220 : 85) : 220;

  const isLoggedIn = !!session;
  const isWalletConnected = !!address;
  
  return (
    <>
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
            <div className="flex items-center justify-start mb-36">
              <Image
                src="/navlogo.png"
                alt="Clapo Logo"
                width={1000}
                height={1000}
                className="object-contain w-40 h-auto"
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
                {/* Desktop Buttons (only lg and up) */}
                <div className="hidden lg:flex flex-col gap-2 items-center">
                  <button
                    onClick={() => openDialog("x")}
                    className="inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[6px] min-w-[105px] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[hsla(220,10%,12%,1)] text-white shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(0,0,0,0.08),0px_0px_0px_1px_#000] hover:bg-[hsla(220,10%,18%,1)] px-3 py-1.5 text-xs rounded-full leading-[24px] font-bold w-full sm:w-auto whitespace-nowrap"
                  >
                    {isLoggedIn ? session.dbUser?.username || "CONNECTED" : "CONNECT X"}
                  </button>
                  <button
                    style={{
                      boxShadow:
                        "0px 1px 0.5px 0px rgba(255, 255, 255, 0.50) inset, 0px 1px 2px 0px rgba(26, 19, 161, 0.50), 0px 0px 0px 1px #4F47EB",
                      backgroundColor: "#6E54FF",
                      color: "white",
                      padding: "8px 16px",
                    }}
                    onClick={() => openDialog("wallet")}
                    className="bg-[#23272B] text-white rounded-full px-3 py-1 text-xs font-bold shadow"
                  >
                    {isWalletConnected
                      ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                      : "CONNECT WALLET"}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {bottomNavItems.map((item, index) => (
                    <button 
                      key={item.name}
                      onClick={() => {
                        if (item.name === "Opinio") {
                          handleOpinioClick();
                        } else if (item.name === "Claps") {
                          handleSnapsClick();
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg text-center bg-gray-700/30 border border-gray-600/40 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="text-gray-300 font-medium text-sm">{item.name}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add the Dialog Rendering - This was missing! */}
      <AnimatePresence>
        {activeDialog && (
          <motion.div
            key="dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
            onClick={closeDialog}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <SignInPage close={closeDialog} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}