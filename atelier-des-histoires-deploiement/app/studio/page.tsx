"use client";

import { useEffect, useMemo, useState } from "react";
import { BookPlus, Check, ChevronLeft, ChevronRight, FileText, Plus, Save, Send, Trash2 } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { CharacterManager } from "@/components/CharacterManager";
import { WritingAssistant } from "@/components/WritingAssistant";
import { supabase } from "@/lib/supabase";
import type { Chapter, Story } from "@/lib/types";

const genres = ["Aventure", "Science-fiction", "Fantastique", "Mystère", "Romance", "Drame", "Thriller", "Jeunesse", "Biographie", "Autre"];
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function Studio() {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [tab, setTab] = useState<"write" | "characters">("write");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadStories = async () => {
    const { data } = await supabase.from("stories").select("*").order("updated_at", { ascending: false });
    const list = (data || []) as Story[]; setStories(list);
    if (!selectedStory && list[0]) setSelectedStory(list[0]);
  };
  const loadChapters = async (storyId: string) => {
    const { data } = await supabase.from("chapters").select("*").eq("story_id", storyId).order("position");
    const list = (data || []) as Chapter[]; setChapters(list); setSelectedChapter(list[0] || null);
  };
  useEffect(() => { void loadStories(); }, []);
  useEffect(() => { if (selectedStory) void loadChapters(selectedStory.id); }, [selectedStory?.id]);

  const createStory = async () => {
    const title = `Nouvelle histoire ${stories.length + 1}`;
    const { data, error } = await supabase.from("stories").insert({ title, slug: `${slugify(title)}-${Date.now().toString().slice(-5)}`, summary: "", genre: "Aventure", status: "draft" }).select().single();
    if (error) return setMessage(error.message);
    await supabase.from("chapters").insert({ story_id: data.id, title: "Chapitre 1", content: "", position: 1 });
    setSelectedStory(data as Story); await loadStories();
  };

  const saveStory = async () => {
    if (!selectedStory) return; setSaving(true);
    const { error } = await supabase.from("stories").update({ title: selectedStory.title, slug: selectedStory.slug || slugify(selectedStory.title), summary: selectedStory.summary, genre: selectedStory.genre, cover_url: selectedStory.cover_url, status: selectedStory.status, updated_at: new Date().toISOString(), published_at: selectedStory.status === "published" ? selectedStory.published_at || new Date().toISOString() : null }).eq("id", selectedStory.id);
    if (selectedChapter) await supabase.from("chapters").update({ title: selectedChapter.title, content: selectedChapter.content, updated_at: new Date().toISOString() }).eq("id", selectedChapter.id);
    setSaving(false); setMessage(error ? error.message : "Sauvegarde cloud terminée."); await loadStories();
  };

  const addChapter = async () => {
    if (!selectedStory) return;
    const { data } = await supabase.from("chapters").insert({ story_id: selectedStory.id, title: `Chapitre ${chapters.length + 1}`, content: "", position: chapters.length + 1 }).select().single();
    if (data) { const next = [...chapters, data as Chapter]; setChapters(next); setSelectedChapter(data as Chapter); }
  };

  const totalWords = useMemo(() => chapters.reduce((sum, chapter) => sum + (chapter.content.trim() ? chapter.content.trim().split(/\s+/).length : 0), 0), [chapters]);

  return (
    <section className="studio-page">
      <aside className="studio-sidebar"><div className="sidebar-heading"><div><span className="eyebrow">Mes œuvres</span><strong>{stories.length} projet{stories.length > 1 ? "s" : ""}</strong></div><button className="icon-button" onClick={createStory} title="Nouvelle histoire"><BookPlus size={19} /></button></div><div className="story-list">{stories.map((story) => <button key={story.id} className={selectedStory?.id === story.id ? "selected" : ""} onClick={() => setSelectedStory(story)}><span>{story.title.slice(0, 1).toUpperCase()}</span><div><strong>{story.title}</strong><small>{story.genre} · {story.status === "published" ? "Publiée" : "Brouillon"}</small></div></button>)}</div></aside>
      <div className="studio-main">
        {!selectedStory ? <div className="empty-state"><FileText size={38} /><h2>Commence une nouvelle histoire</h2><button className="button" onClick={createStory}><Plus size={17} /> Créer mon premier projet</button></div> : <>
          <div className="studio-toolbar"><div className="tab-buttons"><button className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>Écriture</button><button className={tab === "characters" ? "active" : ""} onClick={() => setTab("characters")}>Personnages</button></div><div className="toolbar-actions"><span className="word-total">{totalWords.toLocaleString("fr-FR")} mots</span><button className="button ghost" onClick={() => setSelectedStory({ ...selectedStory, status: selectedStory.status === "published" ? "draft" : "published" })}>{selectedStory.status === "published" ? <Check size={17} /> : <Send size={17} />}{selectedStory.status === "published" ? "Publiée" : "Publier"}</button><button className="button" onClick={saveStory} disabled={saving}><Save size={17} /> {saving ? "Sauvegarde…" : "Sauvegarder"}</button></div></div>
          {message && <div className="save-toast">{message}</div>}
          {tab === "characters" ? <CharacterManager storyId={selectedStory.id} /> : <div className="editor-layout"><div className="editor-column"><div className="story-fields"><input className="title-input" value={selectedStory.title} onChange={(e) => setSelectedStory({ ...selectedStory, title: e.target.value, slug: slugify(e.target.value) })} /><div className="meta-fields"><select value={selectedStory.genre} onChange={(e) => setSelectedStory({ ...selectedStory, genre: e.target.value })}>{genres.map((genre) => <option key={genre}>{genre}</option>)}</select><input value={selectedStory.cover_url || ""} onChange={(e) => setSelectedStory({ ...selectedStory, cover_url: e.target.value })} placeholder="URL de couverture (optionnel)" /></div><textarea className="summary-input" value={selectedStory.summary} onChange={(e) => setSelectedStory({ ...selectedStory, summary: e.target.value })} placeholder="Résumé court de l’histoire…" /></div><div className="chapter-tabs">{chapters.map((chapter) => <button key={chapter.id} className={selectedChapter?.id === chapter.id ? "active" : ""} onClick={() => setSelectedChapter(chapter)}>{chapter.position}. {chapter.title}</button>)}<button className="add-chapter" onClick={addChapter}><Plus size={15} /> Chapitre</button></div>{selectedChapter && <div className="writing-sheet"><input className="chapter-title" value={selectedChapter.title} onChange={(e) => { const updated = { ...selectedChapter, title: e.target.value }; setSelectedChapter(updated); setChapters(chapters.map((c) => c.id === updated.id ? updated : c)); }} /><textarea spellCheck lang="fr" value={selectedChapter.content} onChange={(e) => { const updated = { ...selectedChapter, content: e.target.value }; setSelectedChapter(updated); setChapters(chapters.map((c) => c.id === updated.id ? updated : c)); }} placeholder="Il était une fois…" /></div>}</div><WritingAssistant text={selectedChapter?.content || ""} genre={selectedStory.genre} title={selectedStory.title} summary={selectedStory.summary} /></div>}
        </>}
      </div>
    </section>
  );
}

export default function StudioPage() { return <RequireAuth admin><Studio /></RequireAuth>; }
