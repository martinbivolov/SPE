import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AnswerOption, QuestionGroup } from '../types/supabase.types';

interface LifestyleQuestionsResult {
	data: QuestionGroup[];
	loading: boolean;
	error: string | null;
}

// Raw shape returned by the Supabase query before normalization.
// answer_options can be a single object (FK many-to-one) OR an array (PostgREST
// sometimes wraps it) — the normalization handles both.
type RawJoin = { answer_options: AnswerOption | AnswerOption[] | null };
type RawQuestion = Omit<NonNullable<QuestionGroup['lifestyle_questions']>[number], 'answer_options'> & {
	question_option_id_join: RawJoin[];
};
type RawGroup = Omit<QuestionGroup, 'lifestyle_questions'> & { lifestyle_questions: RawQuestion[] };

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
						question_option_id_join (
							answer_options ( id, label, sort_order )
						)
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

			// Temporary debug — remove once options appear
			console.log('[useLifestyleQuestions] raw groups:', JSON.stringify(groups?.[0], null, 2));

			const normalized = ((groups ?? []) as unknown as RawGroup[]).map((group) => ({
				...group,
				lifestyle_questions: (group.lifestyle_questions ?? [])
					.slice()
					.sort((a, b) => a.sort_order - b.sort_order)
					.map((question) => ({
						...question,
						answer_options: (question.question_option_id_join ?? [])
							.flatMap((j) => {
								const opt = j.answer_options;
								if (opt == null) return [];
								return Array.isArray(opt) ? opt : [opt];
							})
							.filter((opt, i, arr) => arr.findIndex((o) => o.id === opt.id) === i)
							.slice()
							.sort((a, b) => a.sort_order - b.sort_order),
					})),
			})) as QuestionGroup[];

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
