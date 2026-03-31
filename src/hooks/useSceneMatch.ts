// This hook is superseded by useStoryRecommendation.
// It is kept here so any stale import does not crash the app at runtime.
// It now uses the story_recommendation view instead of the removed get_best_scene RPC.

import { useEffect, useState } from 'react';
import { useStoryRecommendation } from './useStoryRecommendation';
import type { LoadedStory } from './useStoryRecommendation';

interface SceneMatchResult {
	data: LoadedStory | null;
	loading: boolean;
	error: string | null;
}

export const useSceneMatch = (userId: string | null): SceneMatchResult => {
	return useStoryRecommendation(userId);
};
