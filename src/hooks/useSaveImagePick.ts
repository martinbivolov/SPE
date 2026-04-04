import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ImagePickerOption } from '../types/supabase.types';

interface SaveImagePickResult {
	loading: boolean;
	error: string | null;
	initializeUserTagWeights: (userId: string) => Promise<boolean>;
	saveSelections: (userId: string, selectedOptions: ImagePickerOption[]) => Promise<boolean>;
}

export const useSaveImagePick = (): SaveImagePickResult => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const initializeUserTagWeights = useCallback(async (userId: string) => {
		setLoading(true);
		setError(null);

		const { error: initError } = await supabase.rpc('initialize_user_tag_weights', { p_user_id: userId });
		setLoading(false);

		if (initError) {
			setError(initError.message);
			return false;
		}

		return true;
	}, []);

	const saveSelections = useCallback(async (
		userId: string,
		selectedOptions: ImagePickerOption[],
	): Promise<boolean> => {
		if (selectedOptions.length === 0) return true;

		setLoading(true);
		setError(null);

		try {
			// Insert one image_picker_responses row per selected image.
			const { error: insertError } = await supabase
				.from('image_picker_responses')
				.insert(
					selectedOptions.map((opt) => ({
						user_id: userId,
						chosen_id: opt.id,
					})),
				);

			if (insertError) throw new Error(insertError.message);

			// Increment the tag weight for each selected option.
			const rpcResults = await Promise.all(
				selectedOptions
					.filter((opt) => opt.tag_id != null)
					.map((opt) =>
						supabase.rpc('increment_user_tag', {
							p_user_id: userId,
							p_tag_id: opt.tag_id,
							p_amount: opt.weight,
						}),
					),
			);

			const rpcFailure = rpcResults.find((r) => r.error);
			if (rpcFailure?.error) throw new Error(rpcFailure.error.message);

			setLoading(false);
			return true;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
			setLoading(false);
			return false;
		}
	}, []);

	return { loading, error, initializeUserTagWeights, saveSelections };
};
