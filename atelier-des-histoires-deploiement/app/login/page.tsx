"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Sparkles } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    if (!isSupabaseConfigured) { setMessage("Configure d’abord Supabase dans .env.local."); setBusy(false); return; }
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
      setMessage(error ? error.message : "Compte créé. Vérifie ton e-mail si la confirmation est activée.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message); else router.push("/");
    }
    setBusy(false);
  }

  async function magicLink() {
    if (!email) { setMessage("Entre ton adresse e-mail."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    setMessage(error ? error.message : "Lien de connexion envoyé par e-mail."); setBusy(false);
  }

  return (
    <section className="auth-page"><div className="auth-card"><div className="auth-brand"><span><Sparkles size={23} /></span><div><h1>{mode === "login" ? "Bon retour" : "Rejoindre la bibliothèque"}</h1><p>Un compte e-mail sécurisé pour lire et interagir.</p></div></div><div className="segmented"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Connexion</button><button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Inscription</button></div><form onSubmit={submit}>{mode === "signup" && <label>Nom affiché<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ton nom de lecteur" required /></label>}<label>Adresse e-mail<div className="input-icon"><Mail size={17} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" required /></div></label><label>Mot de passe<div className="input-icon"><KeyRound size={17} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></div></label><button className="button full large" disabled={busy}>{busy ? "Traitement…" : mode === "login" ? "Se connecter" : "Créer mon compte"}</button></form><div className="divider"><span>ou</span></div><button className="button secondary full" onClick={magicLink} disabled={busy}><Mail size={17} /> Recevoir un lien de connexion</button>{message && <div className="notice">{message}</div>}</div></section>
  );
}
