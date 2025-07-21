import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-[#0A1014] border-b border-[#23272B] font-mono">
      <div className="flex items-center gap-3">
        <Image src="/navlogo.png" alt="Clapo Logo" width={68} height={68} />
        <span className="text-white text-xl font-bold tracking-widest">Clapo</span>
      </div>
      <div className="flex gap-8 items-center">
        <Link href="/claps" className="text-[#E4761B] font-bold tracking-widest text-sm">CLAPS</Link>
        <Link href="/snaps" className="text-[#A0A0A0] hover:text-white tracking-widest text-sm">SNAPS</Link>
        <Link href="/opinio" className="text-[#A0A0A0] hover:text-white tracking-widest text-sm">OPINIO</Link>
      </div>
      <div className="flex gap-2 items-center">
        <button className="bg-[#E4761B] text-black rounded px-3 py-1 text-xs font-bold shadow hover:bg-[#ffcb7b] transition">CONNECT ✗</button>
        <button className="bg-[#23272B] text-[#A0A0A0] rounded px-3 py-1 text-xs font-bold shadow">CONNECT WALLET</button>
      </div>
    </nav>
  );
} 