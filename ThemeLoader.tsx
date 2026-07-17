"use client";

import { useEffect } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";

export function applyTheme(settings: Partial<SiteSettings>) {
  const root = document.documentElement;
  if (settings.primary_color) root.style.setProperty("--primary", settings.primary_color);
  if (settings.secondary_color) root.style.setProperty("--secondary", settings.secondary_color);
  if (settings.accent_color) root.style.setProperty("--accent", settings.accent_color);
  if (settings.background_color) root.style.setProperty("--background", settings.background_color);
  if (settings.surface_color) root.style.setProperty("--surface", settings.surface_color);
  if (settings.text_color) root.style.setProperty("--text", settings.text_color);
  if (settings.radius !== undefined) root.style.setProperty("--radius", `${settings.radius}px`);
  root.dataset.font = settings.font_family || "serif";
}

export function ThemeLoader() {
  useEffect(() => {
    const cached = localStorage.getItem("story-app-theme");
    if (cached) applyTheme(JSON.parse(cached));
    if (!isSupabaseConfigured) return;

    const loadTheme = async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (data) {
        localStorage.setItem("story-app-theme", JSON.stringify(data));
        applyTheme(data as SiteSettings);
      }
    };

    void loadTheme();
    const { data } = supabase.auth.onAuthStateChange(() => { void loadTheme(); });
    return () => data.subscription.unsubscribe();
  }, []);
  return null;
}
