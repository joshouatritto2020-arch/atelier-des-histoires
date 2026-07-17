"use client";

import { useEffect, useState } from "react";
import { Palette, RotateCcw, Save } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { applyTheme } from "@/components/ThemeLoader";
import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";

const defaults: SiteSettings = { id: 1, app_name: "Atelier des Histoires", tagline: "Écrire. Publier. Être lu.", primary_color: "#6c4cff", secondary_color: "#ebe5ff", accent_color: "#ffb347", background_color: "#f7f5fb", surface_color: "#ffffff", text_color: "#241f33", radius: 18, font_family: "serif" };

function Settings() {
  const [settings, setSettings] = useState(defaults); const [message, setMessage] = useState("");
  useEffect(() => { supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => { if (data) setSettings(data as SiteSettings); }); }, []);
  useEffect(() => { applyTheme(settings); }, [settings]);
  const save = async () => { const { error } = await supabase.from("site_settings").upsert(settings); if (!error) localStorage.setItem("story-app-theme", JSON.stringify(settings)); setMessage(error ? error.message : "Design enregistré pour tous les utilisateurs."); };
  return <section className="settings-page"><div className="page-heading"><div><span className="eyebrow">Personnalisation libre</span><h1>Agencer l’identité visuelle</h1><p>Change les couleurs, les arrondis et le style de lecture sans toucher au code.</p></div></div><div className="settings-layout"><div className="settings-form"><div className="form-grid two"><label>Nom de l’application<input value={settings.app_name} onChange={(e) => setSettings({ ...settings, app_name: e.target.value })} /></label><label>Slogan<input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} /></label></div><h2><Palette size={20} /> Palette</h2><div className="color-grid">{([ ["primary_color", "Couleur principale"], ["secondary_color", "Couleur secondaire"], ["accent_color", "Accent"], ["background_color", "Fond"], ["surface_color", "Cartes"], ["text_color", "Texte"] ] as Array<[keyof SiteSettings, string]>).map(([key, label]) => <label key={key}>{label}<div className="color-input"><input type="color" value={String(settings[key])} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} /><input value={String(settings[key])} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} /></div></label>)}</div><div className="form-grid two"><label>Arrondis : {settings.radius}px<input type="range" min="0" max="32" value={settings.radius} onChange={(e) => setSettings({ ...settings, radius: Number(e.target.value) })} /></label><label>Police principale<select value={settings.font_family} onChange={(e) => setSettings({ ...settings, font_family: e.target.value as "serif" | "sans" })}><option value="serif">Roman / littéraire</option><option value="sans">Moderne / épurée</option></select></label></div><div className="toolbar-actions"><button className="button secondary" onClick={() => setSettings(defaults)}><RotateCcw size={17} /> Valeurs initiales</button><button className="button" onClick={save}><Save size={17} /> Enregistrer</button></div>{message && <div className="notice">{message}</div>}</div><div className="theme-preview"><span className="eyebrow">Aperçu instantané</span><h2>Le dernier passage</h2><p>La lumière glissa sur les pages, comme si chaque mot attendait enfin d’être découvert.</p><button className="button">Continuer la lecture</button></div></div></section>;
}
export default function SettingsPage() { return <RequireAuth admin><Settings /></RequireAuth>; }
