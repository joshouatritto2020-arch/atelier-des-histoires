"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { BookOpen, Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import type { Chapter, Comment, Story } from "@/lib/types";

function Reader() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const openedAt = useRef(Date.now());

  const track = async (eventType: string, metadata: Record<string, unknown> = {}) => {
    if (!story || !user) return;
    await supabase.from("analytics_events").insert({ story_id: story.id, user_id: user.id, event_type: eventType, metadata });
  };

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("stories").select("*").eq("slug", slug).eq("status", "published").single();
      if (!data) return;
      const current = data as Story; setStory(current);
      const [{ data: chapterData }, { data: likes }, { data: userLike }, { data: commentData }] = await Promise.all([
        supabase.from("chapters").select("*").eq("story_id", current.id).order("position"),
        supabase.from("likes").select("id", { count: "exact" }).eq("story_id", current.id),
        supabase.from("likes").select("id").eq("story_id", current.id).eq("user_id", user!.id).maybeSingle(),
        supabase.from("comments").select("*, profiles(display_name)").eq("story_id", current.id).eq("is_hidden", false).order("created_at", { ascending: false }),
      ]);
      setChapters((chapterData || []) as Chapter[]); setLikeCount(likes?.length || 0); setLiked(Boolean(userLike)); setComments((commentData || []) as Comment[]);
      await supabase.from("analytics_events").insert({ story_id: current.id, user_id: user!.id, event_type: "view", metadata: { slug } });
    };
    if (user) void load();
  }, [slug, user?.id]);

  useEffect(() => {
    const saveDuration = () => {
      if (!story || !user) return;
      const seconds = Math.round((Date.now() - openedAt.current) / 1000);
      if (seconds >= 5) void supabase.from("analytics_events").insert({ story_id: story.id, user_id: user.id, event_type: "read_time", value: seconds, metadata: { chapter: chapterIndex + 1 } });
      openedAt.current = Date.now();
    };
    document.addEventListener("visibilitychange", saveDuration);
    return () => { document.removeEventListener("visibilitychange", saveDuration); saveDuration(); };
  }, [story?.id, user?.id, chapterIndex]);

  const currentChapter = chapters[chapterIndex];
  const paragraphs = useMemo(() => (currentChapter?.content || "").split(/\n\s*\n/).filter(Boolean), [currentChapter]);

  async function toggleLike() {
    if (!story || !user) return;
    if (liked) { await supabase.from("likes").delete().eq("story_id", story.id).eq("user_id", user.id); setLikeCount((n) => Math.max(0, n - 1)); }
    else { await supabase.from("likes").insert({ story_id: story.id, user_id: user.id }); setLikeCount((n) => n + 1); await track("like"); }
    setLiked(!liked);
  }
  async function share() {
    const payload = { title: story?.title || "Une histoire", text: story?.summary || "Découvre cette histoire", url: window.location.href };
    if (navigator.share) await navigator.share(payload); else await navigator.clipboard.writeText(window.location.href);
    await track("share");
  }
  async function postComment() {
    if (!story || !user || !comment.trim()) return;
    await supabase.from("comments").insert({ story_id: story.id, user_id: user.id, body: comment.trim() });
    setComment(""); await track("comment");
    const { data } = await supabase.from("comments").select("*, profiles(display_name)").eq("story_id", story.id).eq("is_hidden", false).order("created_at", { ascending: false }); setComments((data || []) as Comment[]);
  }

  if (!story) return <div className="loader">Ouverture de l’œuvre…</div>;
  return (
    <div className="reader-page"><section className="reader-hero" style={story.cover_url ? { backgroundImage: `linear-gradient(90deg, rgba(21,15,40,.93), rgba(21,15,40,.55)), url(${story.cover_url})` } : undefined}><div><span className="genre-pill">{story.genre}</span><h1>{story.title}</h1><p>{story.summary}</p><div className="reader-actions"><button className={`button ${liked ? "liked" : "secondary"}`} onClick={toggleLike}><Heart size={18} fill={liked ? "currentColor" : "none"} /> {likeCount}</button><button className="button secondary" onClick={share}><Share2 size={18} /> Partager</button></div></div></section><section className="reading-layout"><aside className="toc"><h3><BookOpen size={18} /> Sommaire</h3>{chapters.map((chapter, index) => <button key={chapter.id} className={index === chapterIndex ? "active" : ""} onClick={() => { setChapterIndex(index); openedAt.current = Date.now(); void track("chapter_click", { chapter: index + 1 }); }}>{chapter.position}. {chapter.title}</button>)}</aside><article className="book-page"><span className="chapter-kicker">Chapitre {currentChapter?.position}</span><h2>{currentChapter?.title}</h2><div className="prose">{paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div><div className="chapter-navigation"><button className="button ghost" disabled={chapterIndex === 0} onClick={() => setChapterIndex((i) => i - 1)}>Chapitre précédent</button><button className="button" disabled={chapterIndex >= chapters.length - 1} onClick={() => setChapterIndex((i) => i + 1)}>Chapitre suivant</button></div></article></section><section className="comments-section"><div className="section-heading"><div><h2><MessageCircle size={22} /> Commentaires</h2><p>Partage une impression constructive sur cette œuvre.</p></div></div><div className="comment-form"><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Écrire un commentaire…" maxLength={1200} /><button className="button" onClick={postComment}><Send size={17} /> Publier</button></div><div className="comments-list">{comments.map((item) => <article key={item.id}><strong>{item.profiles?.display_name || "Lecteur"}</strong><time>{new Date(item.created_at).toLocaleDateString("fr-FR")}</time><p>{item.body}</p></article>)}</div></section></div>
  );
}

export default function StoryPage() { return <RequireAuth><Reader /></RequireAuth>; }
