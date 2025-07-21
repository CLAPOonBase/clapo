'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "CLAPS", href: "/claps" },
    { label: "SNAPS", href: "/snaps" },
    { label: "OPINIO", href: "/opinio" },
  ];

  return (
    <nav className="w-full relative px-6 py-2 flex items-center justify-between bg-transparent font-mono">
      <div className="flex items-center">
        <Image
          src="/navlogo.png"
          alt="Clapo Logo"
          width={120}
          height={40}
          className="object-contain h-8 w-auto"
        />
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex gap-8 items-center">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`tracking-widest text-sm font-bold ${
              pathname === item.href ? "text-[#E4761B]" : "text-[#A0A0A0] hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <button className="bg-[#E4761B] text-black rounded px-3 py-1 text-xs font-bold shadow hover:bg-[#ffcb7b] transition">
          CONNECT ✗
        </button>
        <button className="bg-[#23272B] text-[#A0A0A0] rounded px-3 py-1 text-xs font-bold shadow">
          CONNECT WALLET
        </button>
      </div>
    </nav>
  );
}
