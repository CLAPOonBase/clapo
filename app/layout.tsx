import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { SmoothCursor } from "./components/CustomCursor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CLAPO",
  description:
    "CLAPO — the first protocol to tokenize social influence and convert it into revenue generation.",
  icons: {
    icon: "/4.png",
    apple: "/4.png",
    shortcut: "/4.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.className}>
        <SmoothCursor />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
