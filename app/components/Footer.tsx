import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative w-full mt-20 py-20 flex bg-dark-800 flex-col sm:flex-row justify-between items-center text-xs text-[#A0A0A0] gap-6 px-8 overflow-visible">
      <div
        className="absolute -top-10 left-0 w-full h-40 bg-no-repeat bg-top"
        style={{ backgroundImage: 'url("/footer.svg")' ,zIndex:"-998"}}
      />
      <div className="flex flex-col justify-start items-start gap-2">
        <Image src="/navlogo.png" alt="Clapo Logo" width={68} height={68} />
        <span>© 2025 CLAPO. ALL RIGHTS RESERVED</span>
      </div>
      <div className="flex gap-20">
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">
            PRODUCT
          </div>
          <Link href="/" className="block hover:text-white transition-colors">
            <div className="text-[#E4761B]">CLAPS</div>
          </Link>
          <Link
            href="/snaps"
            className="block hover:text-white transition-colors"
          >
            <div>SNAPS</div>
          </Link>
          <Link
            href="/opinio"
            className="block hover:text-white transition-colors"
          >
            <div>OPINIO</div>
          </Link>
        </div>
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">
            RESOURCES
          </div>

          <Link
            href="https://docs.clapo.fun"
            className="block hover:text-white transition-colors"
          >
            <div>Gitbook</div>
          </Link>
        </div>
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">
            CONTACT US
          </div>
          <Link href="/" className="block hover:text-white transition-colors">
            <div>X</div>
          </Link>
          <Link href="/" className="block hover:text-white transition-colors">
            <div>Telegram</div>
          </Link>
          <Link href="/" className="block hover:text-white transition-colors">
            <div>Mail</div>
          </Link>
        </div>
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">
            COMPANY
          </div>
          <Link href="/" className="block hover:text-white transition-colors">
            <div>ABOUT US</div>
          </Link>
          <Link href="/" className="block hover:text-white transition-colors">
            <div>TERMS AND CONDITIONS</div>
          </Link>
          <Link href="/" className="block hover:text-white transition-colors">
            <div>PRIVACY POLICY</div>
          </Link>
        </div>
      </div>
    </footer>
  );
}
