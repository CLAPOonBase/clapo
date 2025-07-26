import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative w-full mt-20 py-20 bg-dark-800 px-6 sm:px-10 text-xs text-[#A0A0A0] overflow-visible">
      <div
        className="absolute -top-10 left-0 w-full h-40 bg-no-repeat bg-top"
        style={{ backgroundImage: 'url("/footer.svg")', zIndex: "-998" }}
      />
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
        <div className="flex flex-col items-start gap-2">
          <Image src="/navlogo.png" alt="Clapo Logo" width={68} height={68} />
          <span>© 2025 CLAPO. ALL RIGHTS RESERVED</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-10 w-full max-w-5xl">
          <div>
            <div className="font-bold text-white mb-2 tracking-widest">
              PRODUCT
            </div>
            <Link href="/" className="block hover:text-white transition-colors text-[#E4761B]">CLAPS</Link>
            <Link href="/snaps" className="block hover:text-white transition-colors">SNAPS</Link>
            <Link href="/opinio" className="block hover:text-white transition-colors">OPINIO</Link>
          </div>

          <div>
            <div className="font-bold text-white mb-2 tracking-widest">
              RESOURCES
            </div>
            <Link href="https://docs.clapo.fun" className="block hover:text-white transition-colors">Gitbook</Link>
          </div>

          <div>
            <div className="font-bold text-white mb-2 tracking-widest">
              CONTACT US
            </div>
            <Link href="/" className="block hover:text-white transition-colors">X</Link>
            <Link href="/" className="block hover:text-white transition-colors">Telegram</Link>
            <Link href="/" className="block hover:text-white transition-colors">Mail</Link>
          </div>

          <div>
            <div className="font-bold text-white mb-2 tracking-widest">
              COMPANY
            </div>
            <Link href="/" className="block hover:text-white transition-colors">ABOUT US</Link>
            <Link href="/" className="block hover:text-white transition-colors">TERMS AND CONDITIONS</Link>
            <Link href="/" className="block hover:text-white transition-colors">PRIVACY POLICY</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
