export type SceneSide = "A" | "B";

export type SessionPhase =
  | "story-intro"
  | "scene-narration"
  | "videoA"
  | "videoB"
  | "replay"
  | "preference"
  | "strength"
  | "exploration"
  | "filler"
  | "complete";

export interface SceneElement {
  id: string;
  label: string;
  imageUrl: string;
  sfxUrl: string;
  x: number;
  y: number;
  size: number;
}

export interface SceneData {
  id: string;
  side: SceneSide;
  name: string;
  backgroundImageUrl: string;
  audioLabel: string;
  audioUrl: string;
  videoUrl: string;
  elements: SceneElement[];
}

