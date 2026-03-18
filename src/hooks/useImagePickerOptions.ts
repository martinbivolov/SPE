import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ImagePickerOption } from '../types/supabase.types';

interface ImagePickerOptionsResult {
	data: ImagePickerOption[];
	loading: boolean;
	error: string | null;
}

export const useImagePickerOptions = (): ImagePickerOptionsResult => {
	const [data, setData] = useState<ImagePickerOption[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchOptions = async () => {
			const { data: options, error: fetchError } = await supabase
				.from('image_picker_options')
				.select('id, image_url, label, tag_id, weight')
				.order('label');

			if (!isMounted) {
				return;
			}

			if (fetchError) {
				setError(fetchError.message);
				setData([]);
			} else {
				setError(null);
				setData((options ?? []) as ImagePickerOption[]);
			}

			setLoading(false);
		};

		void fetchOptions();

		return () => {
			isMounted = false;
		};
	}, []);

	return { data, loading, error };
};
