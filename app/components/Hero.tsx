"use client";
import { useEffect, useState } from "react";
import OrbitalAnimation from "./OrbitalAnimation";

const words = ["YAPPERS", "INFLUENCER", "PROTOCOL"];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentWord = words[wordIndex];

    if (!deleting) {
      if (displayed.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayed(currentWord.slice(0, displayed.length + 1));
        }, 90);
      } else {
        timeout = setTimeout(() => setDeleting(true), 1200);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(currentWord.slice(0, displayed.length - 1));
        }, 60);
      } else {
        setDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  return (
    <section className="relative w-full mt-20 md:mt-0 md:h-[600px] flex flex-col justify-center items-center">
      <div className="flex flex-col items-start w-full px-8 z-10">
        <span className="text-5xl sm:text-6xl md:text-8xl -ml-2 font-bold leading-none">CLAPO</span>
        <span className="text-2xl sm:text-3xl md:text-[40px] tracking-[0.18em] mt-2 mb-4 flex items-center gap-2">
          FOR{" "}
          <span className="text-[#E4761B] min-w-[180px] inline-flex items-center">
            {displayed}
            <span className="border-r-2 border-[#E4761B] animate-pulse h-[1em] ml-1 inline-block align-middle"></span>
          </span>
        </span>
        <span className="text-[10px] uppercase sm:text-xs text-[#A0A0A0] mb-8 mt-2 max-w-lg tracking-widest">
The First Social Economy Layer on Monad for Creators, Protocol, Yappers and Community        </span>
      </div>
      <div className="md:absolute block right-0 top-0 h-full md:flex justify-end z-0 pointer-events-none">
        <OrbitalAnimation />
      </div>
    </section>
  );
}
