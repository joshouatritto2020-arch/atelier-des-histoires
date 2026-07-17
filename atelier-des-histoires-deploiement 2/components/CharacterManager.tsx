"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Character } from "@/lib/types";

const emptyCharacter = {
  name: "", role: "Protagoniste", archetype: "", age_label: "", appearance: "", personality: "", goal: "", fear: "", backstory: "", notes: "", image_url: "",
};

export function CharacterManager({ storyId }: { storyId: string }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [form, setForm] = useState(emptyCharacter);
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await supabase.from("characters").select("*").eq("story_id", storyId).order("created_at");
    setCharacters((data || []) as Character[]);
  };
  useEffect(() => { void load(); }, [storyId]);

  const add = async () => {
    if (!form.name.trim()) return;
    const { error } = await supabase.from("characters").insert({ ...form, image_url: form.image_url || null, story_id: storyId });
    setMessage(error ? error.message : "Personnage enregistré.");
    if (!error) { setForm(emptyCharacter); await load(); }
  };

  return (
    <section className="character-manager">
      <div className="section-heading"><div><h3><UserRound size={20} /> Personnages</h3><p>Crée les fiches utiles pour garder une histoire cohérente.</p></div></div>
      <div className="character-layout">
        <div className="form-card">
          <div className="form-grid two">
            <label>Nom<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom du personnage" /></label>
            <label>Rôle<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option>Protagoniste</option><option>Antagoniste</option><option>Allié</option><option>Mentor</option><option>Secondaire</option><option>Créature</option><option>Groupe / faction</option></select></label>
            <label>Archétype<input value={form.archetype} onChange={(e) => setForm({ ...form, archetype: e.target.value })} placeholder="Explorateur, rival, sage…" /></label>
            <label>Âge / époque<input value={form.age_label} onChange={(e) => setForm({ ...form, age_label: e.target.value })} placeholder="19 ans, immortel, IA…" /></label>
          </div>
          <label>Apparence<textarea value={form.appearance} onChange={(e) => setForm({ ...form, appearance: e.target.value })} /></label>
          <label>Personnalité<textarea value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })} /></label>
          <div className="form-grid two"><label>Objectif<textarea value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></label><label>Peur / faille<textarea value={form.fear} onChange={(e) => setForm({ ...form, fear: e.target.value })} /></label></div>
          <label>Passé / histoire<textarea value={form.backstory} onChange={(e) => setForm({ ...form, backstory: e.target.value })} /></label>
          <button className="button" onClick={add}><Plus size={17} /> Ajouter le personnage</button>{message && <small className="form-message">{message}</small>}
        </div>
        <div className="character-list">
          {characters.length === 0 && <div className="empty-mini">Aucun personnage pour le moment.</div>}
          {characters.map((character) => (
            <article key={character.id} className="character-card"><div className="character-avatar">{character.name.slice(0, 1).toUpperCase()}</div><div><h4>{character.name}</h4><span>{character.role}{character.archetype ? ` · ${character.archetype}` : ""}</span><p>{character.goal || character.personality || "Fiche à enrichir."}</p></div><button className="icon-button danger" title="Supprimer" onClick={async () => { await supabase.from("characters").delete().eq("id", character.id); await load(); }}><Trash2 size={16} /></button></article>
          ))}
        </div>
      </div>
    </section>
  );
}
