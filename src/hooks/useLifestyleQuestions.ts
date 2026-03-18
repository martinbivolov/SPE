import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { QuestionGroup } from '../types/supabase.types';

interface LifestyleQuestionsResult {
	data: QuestionGroup[];
	loading: boolean;
	error: string | null;
}

export const useLifestyleQuestions = (): LifestyleQuestionsResult => {
	const [data, setData] = useState<QuestionGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const fetchQuestions = async () => {
			const { data: groups, error: fetchError } = await supabase
				.from('lifestyle_question_groups')
				.select(`
					id, title, sort_order,
					lifestyle_questions (
						id, text, type, sort_order,
						answer_options ( id, label, sort_order )
					)
				`)
				.order('sort_order');

			if (!isMounted) {
				return;
			}

			if (fetchError) {
				setError(fetchError.message);
				setData([]);
				setLoading(false);
				return;
			}

			const normalized = ((groups ?? []) as QuestionGroup[]).map((group) => ({
				...group,
				lifestyle_questions: (group.lifestyle_questions ?? [])
					.slice()
					.sort((a, b) => a.sort_order - b.sort_order)
					.map((question) => ({
						...question,
						answer_options: (question.answer_options ?? []).slice().sort((a, b) => a.sort_order - b.sort_order),
					})),
			}));

			setError(null);
			setData(normalized);
			setLoading(false);
		};

		void fetchQuestions();

		return () => {
			isMounted = false;
		};
	}, []);

	return { data, loading, error };
};
