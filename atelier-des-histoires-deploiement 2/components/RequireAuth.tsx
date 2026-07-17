"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function RequireAuth({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, loading, isAdmin, configured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && configured && (!user || (admin && !isAdmin))) router.replace(user ? "/" : "/login");
  }, [user, loading, admin, isAdmin, configured, router]);

  if (!configured) {
    return <section className="empty-state"><h2>Configuration requise</h2><p>Ajoute les variables Supabase dans <code>.env.local</code> pour activer les comptes et la sauvegarde cloud.</p></section>;
  }
  if (loading || !user || (admin && !isAdmin)) return <div className="loader">Chargement sécurisé…</div>;
  return <>{children}</>;
}
