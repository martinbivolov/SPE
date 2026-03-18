import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SaveBackgroundInfoResult {
	data: boolean;
	loading: boolean;
	error: string | null;
	saveBackgroundInfo: (userId: string, answers: Record<string, string>) => Promise<boolean>;
}

export const useSaveBackgroundInfo = (): SaveBackgroundInfoResult => {
	const [data, setData] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const saveBackgroundInfo = useCallback(async (userId: string, answers: Record<string, string>) => {
		setLoading(true);
		setError(null);

		const { error: updateError } = await supabase
			.from('profiles')
			.update({ background_info: answers })
			.eq('id', userId);

		setLoading(false);

		if (updateError) {
			setData(false);
			setError(updateError.message);
			return false;
		}

		setData(true);
		return true;
	}, []);

	return { data, loading, error, saveBackgroundInfo };
};
