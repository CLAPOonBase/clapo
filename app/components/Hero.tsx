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
    <section className="relative w-full h-[600px] flex flex-col justify-center items-center">
      <div className="flex flex-col items-start w-full px-8 z-10">
        <span className="text-8xl -ml-2 font-bold leading-none">CLAPO</span>
        <span className="text-[40px] tracking-[0.18em] mt-2 mb-4 flex items-center gap-2">
          FOR{" "}
          <span className="text-[#E4761B] min-w-[180px] inline-flex items-center">
            {displayed}
            <span className="border-r-2 border-[#E4761B] animate-pulse h-[1em] ml-1 inline-block align-middle"></span>
          </span>
        </span>
        <span className="text-xs text-[#A0A0A0] mb-8 mt-2 max-w-lg tracking-widest">
          THE FIRST PROTOCOL TO TOKENIZE SOCIAL INFLUENCE AND CONVERT IT INTO REVENUE GENERATION
        </span>
      </div>
      <div className="absolute right-0 top-0 h-full flex justify-end z-0 pointer-events-none">
        <OrbitalAnimation />
      </div>
    </section>
  );
}
