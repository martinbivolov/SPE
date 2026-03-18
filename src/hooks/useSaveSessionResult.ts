import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SaveSessionResultResult {
	data: boolean;
	loading: boolean;
	error: string | null;
	saveResult: (
		userId: string,
		sceneVersionId: string,
		preferredVersion: 'A' | 'B',
		preferenceStrength: number
	) => Promise<boolean>;
}

export const useSaveSessionResult = (): SaveSessionResultResult => {
	const [data, setData] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const saveResult = useCallback(async (
		userId: string,
		sceneVersionId: string,
		preferredVersion: 'A' | 'B',
		preferenceStrength: number
	) => {
		setLoading(true);
		setError(null);

		const { error: insertError } = await supabase.from('session_results').insert({
			user_id: userId,
			scene_version_id: sceneVersionId,
			preferred_version: preferredVersion,
			preference_strength: preferenceStrength,
		});

		setLoading(false);

		if (insertError) {
			setData(false);
			setError(insertError.message);
			return false;
		}

		setData(true);
		return true;
	}, []);

	return { data, loading, error, saveResult };
};
