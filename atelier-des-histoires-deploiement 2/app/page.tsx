"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookHeart, Library, LockKeyhole, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { InstallButton } from "@/components/InstallButton";
import { StoryCard } from "@/components/StoryCard";
import { supabase } from "@/lib/supabase";
import type { Story } from "@/lib/types";

const genres = ["Tous", "Aventure", "Science-fiction", "Fantastique", "Mystère", "Romance", "Drame", "Thriller", "Jeunesse", "Autre"];

export default function HomePage() {
  const { user, loading, configured } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("Tous");

  useEffect(() => {
    if (!user) return;
    supabase.from("stories").select("*").eq("status", "published").order("published_at", { ascending: false }).then(({ data }) => setStories((data || []) as Story[]));
  }, [user]);

  if (loading) return <div className="loader">Ouverture de la bibliothèque…</div>;
  if (!configured) return <section className="hero"><div className="hero-copy"><span className="eyebrow">Prototype prêt</span><h1>Votre univers d’écriture, dans une seule application.</h1><p>Le projet est installé. Connectez Supabase pour activer les comptes, la publication et les statistiques.</p><InstallButton /></div><div className="hero-visual"><BookHeart size={90} /><span>Écriture · Lecture · Communauté</span></div></section>;
  if (!user) return (
    <section className="login-gate"><div className="gate-icon"><LockKeyhole size={34} /></div><span className="eyebrow">Bibliothèque réservée aux membres</span><h1>Connectez-vous pour découvrir les œuvres.</h1><p>Chaque lecteur dispose de son propre compte par e-mail pour lire, aimer, commenter et partager.</p><Link className="button large" href="/login">Créer un compte ou se connecter</Link><InstallButton /></section>
  );

  const filtered = stories.filter((story) => (genre === "Tous" || story.genre === genre) && `${story.title} ${story.summary}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <>
      <section className="library-hero"><div><span className="eyebrow">Bibliothèque communautaire</span><h1>Des mondes à découvrir.</h1><p>Lis les œuvres publiées, encourage leurs auteurs et rejoins la conversation.</p></div><InstallButton /></section>
      <section className="content-section">
        <div className="filter-row"><div className="search-box"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une œuvre…" /></div><select value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((item) => <option key={item}>{item}</option>)}</select></div>
        {filtered.length ? <div className="story-grid">{filtered.map((story) => <StoryCard key={story.id} story={story} />)}</div> : <div className="empty-state"><Library size={38} /><h2>Aucune œuvre publiée</h2><p>La première histoire apparaîtra ici dès sa publication.</p></div>}
      </section>
    </>
  );
}
