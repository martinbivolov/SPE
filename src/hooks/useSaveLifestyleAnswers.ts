import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface LifestyleAnswer {
	questionId: string;
	answerOptionId: string;
}

interface SaveLifestyleAnswersResult {
	data: number;
	loading: boolean;
	error: string | null;
	saveAnswers: (userId: string, answers: LifestyleAnswer[]) => Promise<boolean>;
}

export const useSaveLifestyleAnswers = (): SaveLifestyleAnswersResult => {
	const [data, setData] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const saveAnswers = useCallback(async (userId: string, answers: LifestyleAnswer[]) => {
		setLoading(true);
		setError(null);

		if (answers.length === 0) {
			setData(0);
			setLoading(false);
			return true;
		}

		const { error: insertError } = await supabase.from('lifestyle_answers').insert(
			answers.map((entry) => ({
				user_id: userId,
				question_id: entry.questionId,
				answer_option_id: entry.answerOptionId,
			}))
		);

		if (insertError) {
			setData(0);
			setError(insertError.message);
			setLoading(false);
			return false;
		}

		const { data: tagWeights, error: weightError } = await supabase
			.from('answer_option_tags')
			.select('tag_id, weight')
			.in(
				'answer_option_id',
				answers.map((entry) => entry.answerOptionId)
			);

		if (weightError) {
			setData(0);
			setError(weightError.message);
			setLoading(false);
			return false;
		}

		const rpcResults = await Promise.all(
			(tagWeights ?? []).map(({ tag_id, weight }) =>
				supabase.rpc('increment_user_tag', {
					uid: userId,
					tid: tag_id,
					amount: weight,
				})
			)
		);

		const rpcFailure = rpcResults.find((result) => result.error);
		if (rpcFailure?.error) {
			setData(0);
			setError(rpcFailure.error.message);
			setLoading(false);
			return false;
		}

		setData(answers.length);
		setLoading(false);
		return true;
	}, []);

	return { data, loading, error, saveAnswers };
};
