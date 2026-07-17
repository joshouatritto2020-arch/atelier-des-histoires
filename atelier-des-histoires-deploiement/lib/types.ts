export type StoryStatus = "draft" | "published" | "archived";

export interface Story {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  summary: string;
  genre: string;
  cover_url: string | null;
  status: StoryStatus;
  theme: Record<string, string>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  content: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  story_id: string;
  name: string;
  role: string;
  archetype: string;
  age_label: string;
  appearance: string;
  personality: string;
  goal: string;
  fear: string;
  backstory: string;
  notes: string;
  image_url: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

export interface SiteSettings {
  id: number;
  app_name: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  surface_color: string;
  text_color: string;
  radius: number;
  font_family: "serif" | "sans";
}
