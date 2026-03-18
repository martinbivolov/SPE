import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SaveImagePickResult {
	data: boolean;
	loading: boolean;
	error: string | null;
	initializeUserTagWeights: (userId: string) => Promise<boolean>;
	savePick: (
		userId: string,
		chosenId: string,
		rejectedId: string,
		chosenTagId: string,
		rejectedTagId: string,
		weight?: number
	) => Promise<boolean>;
}

export const useSaveImagePick = (): SaveImagePickResult => {
	const [data, setData] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const initializeUserTagWeights = useCallback(async (userId: string) => {
		setLoading(true);
		setError(null);

		const { error: initError } = await supabase.rpc('initialize_user_tag_weights', { uid: userId });
		setLoading(false);

		if (initError) {
			setData(false);
			setError(initError.message);
			return false;
		}

		setData(true);
		return true;
	}, []);

	const savePick = useCallback(async (
		userId: string,
		chosenId: string,
		rejectedId: string,
		chosenTagId: string,
		rejectedTagId: string,
		weight: number = 2
	) => {
		setLoading(true);
		setError(null);

		const { error: insertError } = await supabase.from('image_picker_responses').insert({
			user_id: userId,
			chosen_id: chosenId,
			rejected_id: rejectedId,
		});

		if (insertError) {
			setLoading(false);
			setData(false);
			setError(insertError.message);
			return false;
		}

		const { error: chosenError } = await supabase.rpc('increment_user_tag', {
			uid: userId,
			tid: chosenTagId,
			amount: weight,
		});

		if (chosenError) {
			setLoading(false);
			setData(false);
			setError(chosenError.message);
			return false;
		}

		const { error: rejectedError } = await supabase.rpc('increment_user_tag', {
			uid: userId,
			tid: rejectedTagId,
			amount: -1,
		});

		setLoading(false);

		if (rejectedError) {
			setData(false);
			setError(rejectedError.message);
			return false;
		}

		setData(true);
		return true;
	}, []);

	return { data, loading, error, initializeUserTagWeights, savePick };
};
