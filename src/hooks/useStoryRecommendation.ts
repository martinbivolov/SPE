import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SceneObject } from '../types/supabase.types';

// ---------------------------------------------------------------------------
// Shape returned by the hook
// ---------------------------------------------------------------------------

export interface LoadedVersion {
  id: string;
  video_a_url: string;
  video_b_url: string;
  background_image_url: string;
  interactive_enabled: boolean;
  scene_objects: SceneObject[];
}

export interface LoadedScene {
  id: string;
  scene_type: string;
  name: string;
  sort_order: number;
  narration_url: string;
  filler_url: string | null;
  version: LoadedVersion | null;
}

export interface LoadedStory {
  id: string;
  name: string;
  narration_url: string | null; // intro audio, plays once before all scenes
  scenes: LoadedScene[];        // ordered by sort_order
}

interface UseStoryRecommendationResult {
  data: LoadedStory | null;
  loading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useStoryRecommendation = (
  _userId?: string | null,
): UseStoryRecommendationResult => {
  const [data, setData] = useState<LoadedStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent double-fetch within a single mount lifecycle.
    // Reset in cleanup so StrictMode's simulated unmount/remount can
    // re-run the fetch with fresh state rather than being permanently blocked.
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchStory = async () => {
      setLoading(true);
      setError(null);

      try {
        // Always resolve the user from the live session — never trust a prop.
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setData(null);
          setError(null);
          setLoading(false);
          return;
        }

        // ── Step 1: Recommended story from the view ──────────────────────────
        let storyId: string | null = null;
        let storyName = '';
        let storyNarrationUrl: string | null = null;

        const { data: recRow, error: recError } = await supabase
          .from('story_recommendation')
          .select('story_id, story_name, intro_narration_url')
          .eq('user_id', user.id)
          .order('score', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recError) {
          // View query failed (e.g. user has no tag weights yet) — non-fatal,
          // fall through to the sort_order = 1 fallback below.
          console.warn('story_recommendation query failed:', recError.message);
        }

        if (recRow) {
          storyId = recRow.story_id as string;
          storyName = recRow.story_name as string;
          storyNarrationUrl = recRow.intro_narration_url as string | null;
        }

        // ── Step 2: Fallback — story with sort_order = 1 ────────────────────
        if (!storyId) {
          const { data: fallback, error: fallbackError } = await supabase
            .from('stories')
            .select('id, name, narration_url')
            .eq('sort_order', 1)
            .limit(1)
            .maybeSingle();

          if (fallbackError) {
            throw new Error(
              `Could not load a story. Please try again. (${fallbackError.message})`,
            );
          }
          if (!fallback) {
            throw new Error('No stories are available. Please contact support.');
          }

          storyId = fallback.id as string;
          storyName = fallback.name as string;
          storyNarrationUrl = fallback.narration_url as string | null;
        }

        // ── Step 3: All scenes for the story with versions + objects ─────────
        const { data: rawScenes, error: scenesError } = await supabase
          .from('scenes')
          .select(`
            id, scene_type, name, sort_order, narration_url, filler_url,
            scene_versions (
              id, video_a_url, video_b_url, background_image_url,
              interactive_enabled, active,
              scene_objects ( id, label, image_url, sfx_url, x, y, size )
            )
          `)
          .eq('story_id', storyId)
          .order('sort_order');

        if (scenesError) {
          throw new Error(
            `Could not load scenes. Please try again. (${scenesError.message})`,
          );
        }

        console.log('[story] raw scene versions:',
          JSON.stringify(rawScenes?.map(s => ({
            name: s.name,
            versions: s.scene_versions?.map((v: any) => ({
              id: v.id,
              active: v.active,
              interactive_enabled: v.interactive_enabled,
              object_count: v.scene_objects?.length
            }))
          })), null, 2)
        );

        console.log('[raw] first scene name:', rawScenes?.[0]?.name,
          'scene_versions:', rawScenes?.[0]?.scene_versions
        );

        // Normalise: prefer the first active version, fall back to any version.

        const scenes: LoadedScene[] = ((rawScenes ?? []) as any[]).map((scene) => {

          const rawVersions = scene.scene_versions;
          const versions: any[] = Array.isArray(rawVersions)
            ? rawVersions
            : rawVersions
              ? [rawVersions]
              : [];
          const chosen =
            versions.find((v) => v.active === true) ?? versions[0] ?? null;

          console.log('[norm] scene:', scene.name,
            'total versions:', versions.length,
            'active versions:', versions.filter((v: any) => v.active === true).length,
            'chosen id:', chosen?.id ?? 'NULL'
          );

          return {
            id: scene.id as string,
            scene_type: scene.scene_type as string,
            name: scene.name as string,
            sort_order: scene.sort_order as number,
            narration_url: scene.narration_url as string,
            filler_url: (scene.filler_url ?? null) as string | null,
            version: chosen
              ? {
                  id: chosen.id as string,
                  video_a_url: chosen.video_a_url as string,
                  video_b_url: chosen.video_b_url as string,
                  background_image_url: chosen.background_image_url as string,
                  interactive_enabled: (chosen.interactive_enabled ?? true) as boolean,
                  scene_objects: (chosen.scene_objects ?? []) as SceneObject[],
                }
              : null,
          };
        });

        scenes.forEach(scene => {
          console.log(
            '[story] scene:', scene.name,
            'version:', scene.version?.id,
            'objects:', scene.version?.scene_objects?.length,
            scene.version?.scene_objects
          );
        });

        const result = {
          id: storyId,
          name: storyName,
          narration_url: storyNarrationUrl,
          scenes,
        };
        setData(result);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load your story experience.';
        setData(null);
        setError(message);
      } finally {
        // Always reset loading — even if unmounted mid-fetch.
        // Without this, StrictMode's unmount/remount leaves loading=true forever
        // because hasFetched prevents the remounted instance from re-fetching.
        setLoading(false);
      }
    };

    void fetchStory();

    return () => {
      // No cleanup needed — hasFetched.current stays true to prevent re-fetching.
    };
  }, []); // run once per mount — user resolved inside via supabase.auth.getUser()

  return { data, loading, error };
};
