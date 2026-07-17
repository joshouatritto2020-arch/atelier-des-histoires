"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clock3, Eye, Heart, MessageCircle, MousePointerClick, Share2, Users } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { supabase } from "@/lib/supabase";
import type { Story } from "@/lib/types";

interface EventRow { id: string; story_id: string; user_id: string; event_type: string; value: number; created_at: string; }

function Analytics() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selected, setSelected] = useState("all");
  useEffect(() => { Promise.all([supabase.from("analytics_events").select("*").order("created_at", { ascending: false }).limit(5000), supabase.from("stories").select("*")]).then(([eventResult, storyResult]) => { setEvents((eventResult.data || []) as EventRow[]); setStories((storyResult.data || []) as Story[]); }); }, []);
  const filtered = selected === "all" ? events : events.filter((e) => e.story_id === selected);
  const stats = useMemo(() => {
    const count = (type: string) => filtered.filter((e) => e.event_type === type).length;
    const readRows = filtered.filter((e) => e.event_type === "read_time");
    return { views: count("view"), users: new Set(filtered.map((e) => e.user_id)).size, likes: count("like"), comments: count("comment"), shares: count("share"), clicks: filtered.filter((e) => e.event_type.includes("click")).length, avgRead: readRows.length ? Math.round(readRows.reduce((s, e) => s + Number(e.value || 0), 0) / readRows.length) : 0 };
  }, [filtered]);
  const cards = [{ label: "Vues", value: stats.views, icon: Eye }, { label: "Utilisateurs", value: stats.users, icon: Users }, { label: "Temps moyen", value: `${Math.floor(stats.avgRead / 60)}m ${stats.avgRead % 60}s`, icon: Clock3 }, { label: "J’aime", value: stats.likes, icon: Heart }, { label: "Commentaires", value: stats.comments, icon: MessageCircle }, { label: "Partages", value: stats.shares, icon: Share2 }, { label: "Clics chapitres", value: stats.clicks, icon: MousePointerClick }];
  const recent = filtered.slice(0, 20);
  return <section className="dashboard-page"><div className="page-heading"><div><span className="eyebrow">Pilotage</span><h1>Audience et engagement</h1><p>Comprends ce que les lecteurs ouvrent, lisent et partagent.</p></div><select value={selected} onChange={(e) => setSelected(e.target.value)}><option value="all">Toutes les œuvres</option>{stories.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div><div className="metric-grid">{cards.map(({ label, value, icon: Icon }) => <article key={label}><span><Icon size={20} /></span><div><strong>{value}</strong><small>{label}</small></div></article>)}</div><div className="analytics-panel"><h2><BarChart3 size={21} /> Activité récente</h2>{recent.length === 0 ? <div className="empty-mini">Les statistiques apparaîtront après les premières lectures.</div> : <div className="event-table"><div className="event-head"><span>Événement</span><span>Œuvre</span><span>Date</span></div>{recent.map((event) => <div key={event.id}><span>{event.event_type}</span><span>{stories.find((s) => s.id === event.story_id)?.title || "Œuvre"}</span><span>{new Date(event.created_at).toLocaleString("fr-FR")}</span></div>)}</div>}</div></section>;
}
export default function AnalyticsPage() { return <RequireAuth admin><Analytics /></RequireAuth>; }
