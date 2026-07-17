"use client";

import Link from "next/link";
import { BookOpen, Clock, Heart } from "lucide-react";
import type { Story } from "@/lib/types";

export function StoryCard({ story }: { story: Story }) {
  return (
    <article className="story-card">
      <div className="story-cover" style={story.cover_url ? { backgroundImage: `url(${story.cover_url})` } : undefined}>
        {!story.cover_url && <span>{story.genre.slice(0, 2).toUpperCase()}</span>}
        <div className="genre-pill">{story.genre}</div>
      </div>
      <div className="story-card-body">
        <h3>{story.title}</h3>
        <p>{story.summary || "Une nouvelle œuvre attend ses premiers lecteurs."}</p>
        <div className="story-meta"><span><Clock size={15} /> Lecture</span><span><Heart size={15} /> Communauté</span></div>
        <Link href={`/story/${story.slug}`} className="button full"><BookOpen size={17} /> Lire l’œuvre</Link>
      </div>
    </article>
  );
}
