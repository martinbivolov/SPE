import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SceneVersion } from '../types/supabase.types';

interface SceneMatchResult {
	data: SceneVersion | null;
	loading: boolean;
	error: string | null;
}

interface MatchRow {
	version_id: string;
}

export const useSceneMatch = (userId: string | null): SceneMatchResult => {
	const [data, setData] = useState<SceneVersion | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchScene = async () => {
			if (!userId) {
				if (isMounted) {
					setData(null);
					setError(null);
					setLoading(false);
				}
				return;
			}

			setLoading(true);

			let versionId: string | null = null;

			const { data: matchData, error: matchError } = await supabase.rpc('get_best_scene', { uid: userId });
			if (!matchError && Array.isArray(matchData) && matchData.length > 0) {
				versionId = (matchData[0] as MatchRow).version_id;
			}

			if (!versionId) {
				const { data: fallback, error: fallbackError } = await supabase
					.from('scene_versions')
					.select('id')
					.eq('active', true)
					.order('label')
					.limit(1)
					.single();

				if (fallbackError || !fallback?.id) {
					if (!isMounted) {
						return;
					}

					setData(null);
					setError(matchError?.message ?? fallbackError?.message ?? 'No scenes available');
					setLoading(false);
					return;
				}

				versionId = fallback.id;
			}

			const { data: sceneData, error: sceneError } = await supabase
				.from('scene_versions')
				.select(
					`
					id, label, video_a_url, video_b_url, background_image_url,
					scene_objects ( id, label, image_url, sfx_url, x, y, size )
				`
				)
				.eq('id', versionId)
				.single();

			if (!isMounted) {
				return;
			}

			if (sceneError) {
				setData(null);
				setError(sceneError.message);
			} else {
				setData((sceneData ?? null) as SceneVersion | null);
				setError(null);
			}

			setLoading(false);
		};

		void fetchScene();

		return () => {
			isMounted = false;
		};
	}, [userId]);

	return { data, loading, error };
};
