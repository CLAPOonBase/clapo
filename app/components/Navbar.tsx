"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useWalletContext } from "@/context/WalletContext";

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
    avatarUrl: string;
    createdAt: string;
  };
  dbUserId?: string;
  access_token?: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { connect, disconnect, address } = useWalletContext();
  const [activeDialog, setActiveDialog] = useState<null | "x" | "wallet">(null);
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const navItems = [
    { label: "CLAPS", href: "/" },
    { label: "SNAPS", href: "/snaps" },
    { label: "OPINIO", href: "/opinio" },
  ];

  const openDialog = (type: "x" | "wallet") => setActiveDialog(type);
  const closeDialog = () => setActiveDialog(null);

  const isLoggedIn = !!session;
  const isWalletConnected = !!address;

  return (
    <>
      <nav className="w-full sticky top-0 md:relative p-4 md:p-6 flex items-center justify-between bg-black font-mono z-[9999]">
        <div className="md:hidden z-50">
          <Drawer>
            <DrawerTrigger className="p-2 text-white">
              <Menu size={24} />
            </DrawerTrigger>
            <DrawerContent className="bg-dark-800 text-white border-none mb-20 rounded-t-[40px]">
              <DrawerHeader>
                <DrawerTitle className="text-primary"></DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col space-y-6 px-6 pb-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`tracking-[0.3em] text-sm font-bold ${
                      pathname === item.href
                        ? "text-[#E4761B]"
                        : "text-[#A0A0A0] hover:text-white"
                    }`}
                    onClick={() => {
                      const drawerTrigger = document.querySelector(
                        "[data-radix-popper-content-wrapper]"
                      );
                      if (drawerTrigger) {
                        drawerTrigger.classList.remove("open");
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex items-center z-50">
          <Image
            src="/navlogo.png"
            alt="Clapo Logo"
            width={120}
            height={40}
            className="object-contain h-6 md:h-8 w-auto"
          />
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`tracking-widest text-sm font-bold transition-colors ${
                pathname === item.href
                  ? "text-[#E4761B]"
                  : "text-[#A0A0A0] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex gap-2 items-center">
          <button
            onClick={() => openDialog("x")}
            className="text-[#E4761B] bg-white rounded px-3 py-1 text-xs font-bold shadow hover:text-white hover:bg-[#E4761B] transition"
          >
            {isLoggedIn
              ? session.dbUser?.username || session.user?.name || "CONNECTED"
              : "CONNECT X"}
          </button>
          <button
            onClick={() => {
              openDialog("wallet");
            }}
            className="bg-[#23272B] text-white rounded px-3 py-1 text-xs font-bold shadow"
          >
            {isWalletConnected
              ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
              : "CONNECT WALLET"}
          </button>
        </div>

        <div className="flex md:hidden justify-center">
          <button
            onClick={() => openDialog("x")}
            className="text-[#E4761B] bg-white rounded px-3 py-1 text-xs font-bold shadow hover:text-white hover:bg-[#E4761B] transition"
          >
            {isLoggedIn
              ? session.dbUser?.username || session.user?.name || "Connected"
              : "Connect"}
          </button>
        </div>
      </nav>

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
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1A1A1A] p-6 rounded-lg shadow-lg w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">
                  {activeDialog === "x"
                    ? "Connect X Options"
                    : "Wallet Options"}
                </h2>
                <button
                  onClick={closeDialog}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                {activeDialog === "x" ? (
                  isLoggedIn ? (
                    <button
                      onClick={() => {
                        signOut();
                        closeDialog();
                      }}
                      className="w-full px-4 py-2 bg-[#333] text-white rounded hover:bg-[#444] font-semibold transition-colors"
                    >
                      Logout (
                      {session.dbUser?.username || session.user?.name || "User"}
                      )
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        signIn("twitter");
                        closeDialog();
                      }}
                      className="w-full px-4 py-2 bg-[#E4761B] text-white rounded hover:bg-[#c86619] font-semibold transition-colors"
                    >
                      Connect X Now
                    </button>
                  )
                ) : (
                  <>
                    {isWalletConnected ? (
                      <button
                        onClick={() => {
                          disconnect();
                          closeDialog();
                        }}
                        className="w-full px-4 py-2 bg-[#333] text-white rounded hover:bg-[#444] font-semibold transition-colors"
                      >
                        Disconnect Wallet ({address?.slice(0, 6)}...
                        {address?.slice(-4)})
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          connect();
                          closeDialog();
                        }}
                        className="w-full px-4 py-2 bg-[#E4761B] text-white rounded hover:bg-[#c86619] font-semibold transition-colors"
                      >
                        Connect MetaMask
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
