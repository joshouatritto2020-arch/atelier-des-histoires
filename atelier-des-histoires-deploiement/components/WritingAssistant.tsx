"use client";

import { useMemo } from "react";
import { CheckCircle2, Lightbulb, Sparkles } from "lucide-react";
import { analyseText, getStoryIdeas, getTextStats } from "@/lib/writingAssistant";

export function WritingAssistant({ text, genre, title, summary }: { text: string; genre: string; title: string; summary: string }) {
  const issues = useMemo(() => analyseText(text), [text]);
  const ideas = useMemo(() => getStoryIdeas(genre, title, summary), [genre, title, summary]);
  const stats = useMemo(() => getTextStats(text), [text]);

  return (
    <aside className="assistant-panel">
      <div className="assistant-title"><Sparkles size={19} /><div><strong>Assistant d’écriture</strong><small>Analyse locale et privée</small></div></div>
      <div className="stats-grid mini">
        <div><strong>{stats.words}</strong><span>mots</span></div>
        <div><strong>{stats.readingMinutes} min</strong><span>lecture</span></div>
        <div><strong>{stats.averageSentence}</strong><span>mots/phrase</span></div>
      </div>
      <div className="assistant-section">
        <h4>Conseils de rédaction</h4>
        {issues.length === 0 ? (
          <div className="positive"><CheckCircle2 size={18} /> Aucun signal important pour le moment.</div>
        ) : issues.map((issue) => (
          <div className="issue" key={issue.id}>
            <strong>{issue.title}</strong><p>{issue.detail}</p>{issue.suggestion && <small>Conseil : {issue.suggestion}</small>}
          </div>
        ))}
      </div>
      <details className="idea-box">
        <summary><Lightbulb size={17} /> Suggestions pour avancer</summary>
        <ul>{ideas.map((idea) => <li key={idea}>{idea}</li>)}</ul>
      </details>
    </aside>
  );
}
