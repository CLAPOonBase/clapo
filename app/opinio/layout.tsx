"use client";

import { OpinioProvider } from "@/app/Context/OpinioContext";

export default function OpinioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OpinioProvider>
      {children}
    </OpinioProvider>
  );
}


