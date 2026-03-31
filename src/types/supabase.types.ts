// =============================================================================
// Row types — shape returned by SELECT queries
// =============================================================================

export interface Tag {
  id: string;
  name: string;
}

// -----------------------------------------------------------------------------
// Stories
// -----------------------------------------------------------------------------

export interface Story {
  id: string;
  name: string;
  description: string | null;
  narration_url: string | null;
  sort_order: number;
  created_at: string;
}

export type StoryInsert = Omit<Story, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type StoryUpdate = Partial<StoryInsert>;

// -----------------------------------------------------------------------------
// Scenes
// -----------------------------------------------------------------------------

export type SceneType = 'kitchen' | 'car' | 'park' | 'restaurant' | 'piano';

export interface Scene {
  id: string;
  story_id: string;
  scene_type: SceneType;
  name: string;
  description: string | null;
  sort_order: number;
  narration_url: string;
  filler_url: string | null;
  created_at: string;
}

export type SceneInsert = Omit<Scene, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SceneUpdate = Partial<SceneInsert>;

// -----------------------------------------------------------------------------
// Scene versions
// -----------------------------------------------------------------------------

export interface SceneObject {
  id: string;
  version_id: string;
  label: string;
  image_url: string;
  sfx_url: string;
  x: number;
  y: number;
  size: number;
  created_at: string;
}

export type SceneObjectInsert = Omit<SceneObject, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type SceneObjectUpdate = Partial<SceneObjectInsert>;

export interface SceneVersion {
  id: string;
  scene_id: string;
  label: string;
  video_a_url: string;
  video_b_url: string;
  background_image_url: string;
  interactive_enabled: boolean;
  version_number: number;
  active: boolean;
  created_at: string;
  // Joined relation — only present when fetched with nested select
  scene_objects?: SceneObject[];
}

export type SceneVersionInsert = Omit<SceneVersion, 'id' | 'created_at' | 'scene_objects'> & {
  id?: string;
  created_at?: string;
};

export type SceneVersionUpdate = Partial<SceneVersionInsert>;

// -----------------------------------------------------------------------------
// Story recommendation view
// -----------------------------------------------------------------------------

export interface StoryRecommendation {
  user_id: string;
  story_id: string;
  story_name: string;
  story_sort_order: number;
  intro_narration_url: string | null;
  score: number;
}

// =============================================================================
// Quiz / onboarding types
// =============================================================================

export interface AnswerOption {
  id: string;
  question_id: string;
  label: string;
  sort_order: number;
}

export type AnswerOptionInsert = Omit<AnswerOption, 'id'> & { id?: string };
export type AnswerOptionUpdate = Partial<AnswerOptionInsert>;

export type QuestionType = 'single' | 'multi' | 'quotes' | 'free_text' | 'info_only';

export interface LifestyleQuestion {
  id: string;
  group_id: string | null;
  text: string;
  type: QuestionType;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  // Joined relation — only present when fetched with nested select
  answer_options?: AnswerOption[];
}

export type LifestyleQuestionInsert = Omit<LifestyleQuestion, 'id' | 'created_at' | 'answer_options'> & {
  id?: string;
  created_at?: string;
};

export type LifestyleQuestionUpdate = Partial<LifestyleQuestionInsert>;

export interface QuestionGroup {
  id: string;
  title: string;
  sort_order: number;
  created_at: string;
  // Joined relation — only present when fetched with nested select
  lifestyle_questions?: LifestyleQuestion[];
}

export type QuestionGroupInsert = Omit<QuestionGroup, 'id' | 'created_at' | 'lifestyle_questions'> & {
  id?: string;
  created_at?: string;
};

export type QuestionGroupUpdate = Partial<QuestionGroupInsert>;

// -----------------------------------------------------------------------------
// Lifestyle answers — one row per user per question per selected option
// -----------------------------------------------------------------------------

export interface LifestyleAnswer {
  id: string;
  user_id: string;
  question_id: string;
  answer_option_id: string;
  created_at: string;
}

export type LifestyleAnswerInsert = Omit<LifestyleAnswer, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type LifestyleAnswerUpdate = Partial<LifestyleAnswerInsert>;

// =============================================================================
// Image picker types
// =============================================================================

export interface ImagePickerOption {
  id: string;
  image_url: string;
  label: string | null;
  tag_id: string | null;
  weight: number;
}

export type ImagePickerOptionInsert = Omit<ImagePickerOption, 'id'> & { id?: string };
export type ImagePickerOptionUpdate = Partial<ImagePickerOptionInsert>;

export interface ImagePickerResponse {
  user_id: string;
  chosen_id: string;
  rejected_id: string;
  created_at: string;
}

export type ImagePickerResponseInsert = Omit<ImagePickerResponse, 'created_at'> & {
  created_at?: string;
};

// =============================================================================
// Session results
// =============================================================================

export interface SessionResult {
  id: string;
  user_id: string;
  scene_version_id: string;
  preferred_version: 'A' | 'B' | null;
  preference_strength: number | null;
  completed_at: string;
}

export type SessionResultInsert = Omit<SessionResult, 'id' | 'completed_at'> & {
  id?: string;
  completed_at?: string;
};

export type SessionResultUpdate = Partial<SessionResultInsert>;

// =============================================================================
// Tag weights
// =============================================================================

export interface UserTagWeight {
  id: string;
  user_id: string;
  tag_id: string;
  weight: number;
}

export type UserTagWeightInsert = Omit<UserTagWeight, 'id'> & { id?: string };
export type UserTagWeightUpdate = Partial<UserTagWeightInsert>;

export interface AnswerOptionTag {
  id: string;
  answer_option_id: string;
  tag_id: string;
  weight: number;
}

export type AnswerOptionTagInsert = Omit<AnswerOptionTag, 'id'> & { id?: string };
export type AnswerOptionTagUpdate = Partial<AnswerOptionTagInsert>;

export interface StoryTag {
  id: string;
  story_id: string;
  tag_id: string;
  weight: number;
}

export type StoryTagInsert = Omit<StoryTag, 'id'> & { id?: string };
export type StoryTagUpdate = Partial<StoryTagInsert>;
