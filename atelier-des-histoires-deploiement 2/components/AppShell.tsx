"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BookOpen, Feather, LogIn, LogOut, Palette, PenLine } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();

  const nav = [
    { href: "/", label: "Bibliothèque", icon: BookOpen },
    ...(isAdmin
      ? [
          { href: "/studio", label: "Studio", icon: PenLine },
          { href: "/analytics", label: "Audience", icon: BarChart3 },
          { href: "/settings", label: "Design", icon: Palette },
        ]
      : []),
  ];

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark"><Feather size={20} /></span>
          <span><strong>Atelier des Histoires</strong><small>Écrire. Publier. Être lu.</small></span>
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}>
              <Icon size={17} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        {user ? (
          <button
            className="button ghost compact"
            onClick={async () => { await signOut(); router.push("/login"); }}
          >
            <LogOut size={17} /> Déconnexion
          </button>
        ) : (
          <Link className="button compact" href="/login"><LogIn size={17} /> Connexion</Link>
        )}
      </header>
      <main>{children}</main>
      <footer className="footer">Atelier des Histoires · PWA privée et communautaire</footer>
    </div>
  );
}
