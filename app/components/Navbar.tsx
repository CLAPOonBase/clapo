'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function Navbar() {
  const pathname = usePathname();
  const [activeDialog, setActiveDialog] = useState<null | 'x' | 'wallet'>(null);

  const navItems = [
    { label: "CLAPS", href: "/" },
    { label: "SNAPS", href: "/snaps" },
    { label: "OPINIO", href: "/opinio" },
  ];

  const openDialog = (type: 'x' | 'wallet') => setActiveDialog(type);
  const closeDialog = () => setActiveDialog(null);

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
                      pathname === item.href ? "text-[#E4761B]" : "text-[#A0A0A0] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex items-center z-50">
          <Image src="/navlogo.png" alt="Clapo Logo" width={120} height={40} className="object-contain h-6 md:h-8 w-auto" />
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`tracking-widest text-sm font-bold transition-colors ${
                pathname === item.href ? "text-[#E4761B]" : "text-[#A0A0A0] hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex gap-2 items-center">
          <button
            onClick={() => openDialog('x')}
            className="text-[#E4761B] bg-white rounded px-3 py-1 text-xs font-bold shadow hover:text-white hover:bg-[#E4761B] transition"
          >
            CONNECT X
          </button>
          <button
            onClick={() => openDialog('wallet')}
            className="bg-[#23272B] text-white rounded px-3 py-1 text-xs font-bold shadow"
          >
            CONNECT WALLET
          </button>
        </div>

        <div className="flex md:hidden justify-center">
          <button
            onClick={() => openDialog('wallet')}
            className="text-[#E4761B] bg-white rounded px-3 py-1 text-xs font-bold shadow hover:text-white hover:bg-[#E4761B] transition"
          >
            Connect
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
            className="md:hidden absolute bg-[#1A1A1A] left-2 right-2 top-20 p-4 rounded-lg z-40"
            onClick={closeDialog}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">
                  {activeDialog === 'x' ? 'Connect X Options' : 'Connect Wallet'}
                </h2>
                <button onClick={closeDialog} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                {activeDialog === 'x' ? (
                  <button className="w-full px-4 py-2 bg-[#E4761B] rounded hover:bg-[#c86619] font-semibold">
                    Connect X Now
                  </button>
                ) : (
                  <>
                    <button className="w-full px-4 py-2 bg-[#E4761B] rounded hover:bg-[#c86619] font-semibold">
                      MetaMask
                    </button>
                    <button className="w-full px-4 py-2 bg-[#333] rounded hover:bg-[#444] font-semibold">
                      WalletConnect
                    </button>
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
