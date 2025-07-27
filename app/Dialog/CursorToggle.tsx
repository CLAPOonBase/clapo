"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { SmoothCursor } from "../components/CustomCursor";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const CursorContext = createContext<{
  customCursor: boolean;
  toggleCursor: () => void;
}>({
  customCursor: true,
  toggleCursor: () => {},
});

export const useCursor = () => useContext(CursorContext);

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customCursor, setCustomCursor] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleCursor = () => {
    setCustomCursor((prev) => !prev);
  };

  if (!isMounted) return null;

  return (
    <CursorContext.Provider value={{ customCursor, toggleCursor }}>
      <div className="bg-black" style={{ cursor: customCursor ? "none" : "auto", zIndex: "-999" }}>
        {customCursor && <SmoothCursor />}
        <Navbar />
        {children}
        <Footer />
        <button
          onClick={toggleCursor}
          className="fixed hidden md:visible bottom-4 right-4 z-50 bg-black/20 backdrop-blur-sm border border-white/10 text-white px-3 py-2 rounded-full text-sm hover:bg-black/30 transition-all duration-200"
          title={customCursor ? "Switch to default cursor" : "Switch to custom cursor"}
        >
          {customCursor ? "Default Cursor" : "Custom Sexy Cursor"}
        </button>
      </div>
    </CursorContext.Provider>
  );
}
