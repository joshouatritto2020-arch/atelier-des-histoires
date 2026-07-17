export interface WritingIssue {
  id: string;
  type: "orthographe" | "style" | "rythme" | "lisibilite";
  title: string;
  detail: string;
  suggestion?: string;
}

const replacements: Array<[RegExp, string, string]> = [
  [/\bcomme même\b/gi, "Orthographe", "quand même"],
  [/\bsa va\b/gi, "Orthographe", "ça va"],
  [/\bmalgré que\b/gi, "Tournure", "bien que"],
  [/\bau jour d'aujourd'hui\b/gi, "Tournure", "aujourd’hui"],
  [/\bsi j'aurais\b/gi, "Grammaire", "si j’avais"],
  [/\bils croivent\b/gi, "Conjugaison", "ils croient"],
  [/\bje vais aller\b/gi, "Style", "j’irai / je vais"],
];

export function analyseText(text: string): WritingIssue[] {
  const issues: WritingIssue[] = [];
  const clean = text.trim();
  if (!clean) return issues;

  replacements.forEach(([pattern, label, replacement], index) => {
    const match = clean.match(pattern);
    if (match) {
      issues.push({
        id: `replacement-${index}`,
        type: "orthographe",
        title: label,
        detail: `« ${match[0]} » peut être amélioré.`,
        suggestion: replacement,
      });
    }
  });

  const sentences = clean.split(/(?<=[.!?…])\s+/).filter(Boolean);
  sentences.forEach((sentence, index) => {
    const count = sentence.split(/\s+/).filter(Boolean).length;
    if (count > 34) {
      issues.push({
        id: `long-${index}`,
        type: "rythme",
        title: "Phrase très longue",
        detail: `Cette phrase compte ${count} mots. Elle peut fatiguer le lecteur.`,
        suggestion: "Coupe-la en deux ou trois phrases, avec une idée principale par phrase.",
      });
    }
  });

  const paragraphs = clean.split(/\n\s*\n/).filter(Boolean);
  paragraphs.forEach((paragraph, index) => {
    const count = paragraph.split(/\s+/).filter(Boolean).length;
    if (count > 150) {
      issues.push({
        id: `paragraph-${index}`,
        type: "lisibilite",
        title: "Paragraphe dense",
        detail: `Le paragraphe ${index + 1} contient environ ${count} mots.`,
        suggestion: "Ajoute une respiration, un dialogue ou un changement d’action.",
      });
    }
  });

  const words = clean
    .toLowerCase()
    .replace(/[^a-zà-ÿœæ'-]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4);
  const frequency = new Map<string, number>();
  words.forEach((word) => frequency.set(word, (frequency.get(word) || 0) + 1));
  [...frequency.entries()]
    .filter(([, count]) => count >= Math.max(4, Math.ceil(words.length / 70)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .forEach(([word, count], index) => {
      issues.push({
        id: `repeat-${index}`,
        type: "style",
        title: "Répétition possible",
        detail: `Le mot « ${word} » apparaît ${count} fois dans ce passage.`,
        suggestion: "Vérifie si un synonyme, un pronom ou une reformulation serait plus naturel.",
      });
    });

  const adverbs = clean.match(/\b[a-zà-ÿ]+ment\b/gi) || [];
  if (adverbs.length > Math.max(5, Math.ceil(words.length / 55))) {
    issues.push({
      id: "adverbs",
      type: "style",
      title: "Beaucoup d’adverbes",
      detail: `${adverbs.length} mots terminés par « -ment » ont été détectés.`,
      suggestion: "Remplace certains adverbes par un verbe plus précis ou une action visible.",
    });
  }

  const exclamations = (clean.match(/!/g) || []).length;
  if (exclamations > 5) {
    issues.push({
      id: "exclamations",
      type: "style",
      title: "Ponctuation expressive",
      detail: `${exclamations} points d’exclamation ont été détectés.`,
      suggestion: "Garde-les pour les moments réellement intenses afin de renforcer leur effet.",
    });
  }

  return issues.slice(0, 12);
}

const genreIdeas: Record<string, string[]> = {
  "Science-fiction": [
    "Révèle un coût inattendu de la technologie centrale.",
    "Fais découvrir que l’ennemi protège peut-être quelque chose d’essentiel.",
    "Force le personnage principal à choisir entre progrès et humanité.",
  ],
  Aventure: [
    "Place un obstacle qui oblige le groupe à se séparer.",
    "Transforme un objet banal en indice décisif.",
    "Fais échouer le plan initial, puis impose une solution risquée.",
  ],
  Fantastique: [
    "Donne une règle précise au pouvoir surnaturel, puis teste sa limite.",
    "Fais revenir une légende que tout le monde croyait fausse.",
    "Lie le conflit magique à une blessure intime du héros.",
  ],
  Mystère: [
    "Introduis un indice vrai qui semble d’abord trompeur.",
    "Fais mentir un personnage pour une raison compréhensible.",
    "Révèle que deux événements éloignés ont la même cause.",
  ],
  Romance: [
    "Crée un choix concret entre le lien affectif et un objectif personnel.",
    "Fais apparaître une incompatibilité réelle, pas seulement un malentendu.",
    "Utilise une action discrète pour montrer l’attachement sans l’expliquer.",
  ],
};

export function getStoryIdeas(genre: string, title: string, summary: string): string[] {
  const base = genreIdeas[genre] || [
    "Ajoute une conséquence imprévue à la dernière décision du héros.",
    "Fais entrer un personnage qui veut la même chose pour une raison opposée.",
    "Transforme une victoire apparente en nouveau problème.",
  ];
  const contextual = [
    `Dans « ${title || "ton histoire"} », fais remonter un élément discret du début pour qu’il devienne important.`,
    summary
      ? "Choisis une promesse de ton résumé et fais-la avancer clairement dans la prochaine scène."
      : "Écris une phrase-résumé : personnage + objectif + obstacle + risque.",
    "Termine la prochaine scène par une décision irréversible plutôt que par une simple information.",
  ];
  return [...base, ...contextual];
}

export function getTextStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const sentences = text.trim() ? text.split(/[.!?…]+/).filter((s) => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  const readingMinutes = Math.max(1, Math.ceil(words / 220));
  const averageSentence = sentences ? Math.round(words / sentences) : 0;
  return { words, characters, sentences, paragraphs, readingMinutes, averageSentence };
}
