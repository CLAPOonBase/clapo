'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<null | 'x' | 'wallet'>(null);
  const [showSubmenu, setShowSubmenu] = useState(false);

  const navItems = [
    { label: "CLAPS", href: "/" },
    {
      label: "SNAPS",
      href: "/snaps",
      submenu: [
        { label: "Recent", href: "/snaps/recent" },
        { label: "Top", href: "/snaps/top" }
      ]
    },
    { label: "OPINIO", href: "/opinio" },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const openDialog = (type: 'x' | 'wallet') => setActiveDialog(type);
  const closeDialog = () => setActiveDialog(null);

  return (
    <>
      <nav className="w-full relative p-4 md:p-6 flex items-center justify-between bg-transparent font-mono">
        <button onClick={toggleMobileMenu} className="md:hidden z-50 p-2 text-white" aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className="flex items-center z-50">
          <Image src="/navlogo.png" alt="Clapo Logo" width={120} height={40} className="object-contain h-6 md:h-8 w-auto" />
        </div>

        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 gap-8 items-center">
          {navItems.map((item) => (
            <div key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`tracking-widest text-sm font-bold transition-colors ${
                  pathname === item.href ? "text-[#E4761B]" : "text-[#A0A0A0] hover:text-white"
                } flex items-center gap-1`}
              >
                {item.label}
                {item.submenu && <ChevronDown className="w-4 h-4" />}
              </Link>

              {item.submenu && (
                <div className="absolute top-full mt-2 left-0 bg-[#1A1A1A] rounded shadow-md p-2 hidden group-hover:flex flex-col z-50">
                  {item.submenu.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="text-xs px-3 py-1 text-gray-300 hover:text-white"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute bg-[#1A1A1A] left-2 right-2 top-20 p-4 rounded-lg z-40"
          >
            <div className="flex flex-col items-center space-y-6 px-8">
              {navItems.map((item) => (
                <div key={item.href} className="w-full text-center">
                  <button
                    onClick={() =>
                      item.submenu ? setShowSubmenu((prev) => !prev) : setIsMobileMenuOpen(false)
                    }
                    className={`tracking-[0.3em] text-sm font-bold w-full ${
                      pathname === item.href ? "text-[#E4761B]" : "text-[#A0A0A0]"
                    }`}
                  >
                    {item.label}
                    {item.submenu && <ChevronDown className="inline w-4 h-4 ml-1" />}
                  </button>
                  {item.submenu && showSubmenu && (
                    <div className="mt-2 space-y-2">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block text-xs text-gray-300 hover:text-white"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog */}
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
              className=""
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">
                  {activeDialog === 'x' ? 'Connect X Options' : ''}
                </h2>
                <button onClick={closeDialog} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {activeDialog === 'x' ? (
                <div className="space-y-2 text-sm">
                 
                  <button className="w-full px-4 py-2 bg-[#E4761B] rounded hover:bg-[#c86619] font-semibold">
                    Connect X Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
             
                  <button className="w-full px-4 py-2 bg-[#E4761B] rounded hover:bg-[#c86619] font-semibold">
                    MetaMask
                  </button>
                  <button className="w-full px-4 py-2 bg-[#333] rounded hover:bg-[#444] font-semibold">
                    WalletConnect
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
