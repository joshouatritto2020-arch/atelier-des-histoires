"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeLoader } from "@/components/ThemeLoader";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return <AuthProvider><ThemeLoader />{children}</AuthProvider>;
}
