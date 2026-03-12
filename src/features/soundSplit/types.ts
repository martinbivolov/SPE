export type SceneSide = "A" | "B";

export interface SceneElement {
  id: string;
  label: string;
  imageUrl: string;
  x: number;
  y: number;
  size: number;
  sfxFrequency: number;
}

export interface SceneData {
  id: string;
  side: SceneSide;
  name: string;
  backgroundImageUrl: string;
  audioLabel: string;
  audioUrl: string;
  elements: SceneElement[];
}
