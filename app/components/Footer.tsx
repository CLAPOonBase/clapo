import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative w-full mt-20 py-20 flex bg-[#05121B] flex-col sm:flex-row justify-between items-center text-xs text-[#A0A0A0] gap-6 px-8 overflow-visible">
      <div
        className="absolute -top-10 left-0 w-full h-40 bg-no-repeat bg-top"
        style={{ backgroundImage: 'url("/footer.svg")' }}
      />
      <div className="flex flex-col justify-start items-start gap-2">
        <Image src="/navlogo.png" alt="Clapo Logo" width={68} height={68} />
        <span>© 2025 CLAPO. ALL RIGHTS RESERVED</span>
      </div>
      <div className="flex gap-20">
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">PRODUCT</div>
          <div className="text-[#E4761B]">CLAPS</div>
          <div>SNAPS</div>
          <div>OPINIO</div>
        </div>
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">RESOURCES</div>
          <div>GITBOOK</div>
        </div>
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">CONTACT US</div>
          <div>X</div>
          <div>TELEGRAM</div>
          <div>MAIL</div>
        </div>
        <div>
          <div className="font-bold text-white mb-1 tracking-widest">COMPANY</div>
          <div>ABOUT US</div>
          <div>TERM AND CONDITION</div>
          <div>PRIVACY POLICY</div>
        </div>
      </div>
    </footer>
  );
}
