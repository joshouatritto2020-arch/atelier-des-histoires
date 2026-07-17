import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Atelier des Histoires",
  description: "Écrivez, publiez et partagez vos histoires.",
  applicationName: "Atelier des Histoires",
  appleWebApp: { capable: true, title: "Histoires", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#6c4cff", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><Providers><AppShell>{children}</AppShell></Providers></body></html>;
}
