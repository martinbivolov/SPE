import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

// Used by LifestyleSelectionSection (step 2 of onboarding).
// All answers at that step are single/multi type with known answer_option_ids,
// so this hook does not need to branch on question type.
// For mixed-type saving (including free_text and info_only) use useSaveQuizAnswers.

export interface LifestyleAnswer {
  questionId: string;
  answerOptionId: string;
}

interface UseSaveLifestyleAnswersResult {
  data: number;
  loading: boolean;
  error: string | null;
  saveAnswers: (userId: string, answers: LifestyleAnswer[]) => Promise<boolean>;
}

export const useSaveLifestyleAnswers = (): UseSaveLifestyleAnswersResult => {
  const [data, setData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAnswers = useCallback(
    async (userId: string, answers: LifestyleAnswer[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      if (answers.length === 0) {
        setData(0);
        setLoading(false);
        return true;
      }

      try {
        // Confirm auth session before any DB writes.
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Not authenticated. Please sign in again.');

        // Step 1: For each question, delete all existing answers then insert
        // the fresh set. This handles multi-select correctly: a user can have
        // multiple rows per question (one per selected option), so checking by
        // (user_id, question_id, answer_option_id) would miss deselected options.
        // DELETE then INSERT is the safe pattern when the selection count can change.

        const questionIds = [...new Set(answers.map((a) => a.questionId))];
        console.log('[save] deleting for questions:', questionIds);
        console.log('[save] inserting entries:', answers.length);

        for (const questionId of questionIds) {
          const { error: deleteError } = await supabase
            .from('lifestyle_answers')
            .delete()
            .eq('user_id', user.id)
            .eq('question_id', questionId);

          if (deleteError) {
            throw new Error(
              `Could not update your selections. Please try again. (${deleteError.message})`,
            );
          }

          const optionsForQuestion = answers
            .filter((a) => a.questionId === questionId)
            .map((a) => ({
              user_id: user.id,
              question_id: questionId,
              answer_option_id: a.answerOptionId,
              free_text_answer: null,
            }));

          const { error: insertError } = await supabase
            .from('lifestyle_answers')
            .insert(optionsForQuestion);

          if (insertError) {
            throw new Error(
              `Could not save your selections. Please try again. (${insertError.message})`,
            );
          }
        }

        // Step 2: Look up which tags each answer option maps to.
        const { data: tagWeights, error: tagError } = await supabase
          .from('answer_option_tags')
          .select('tag_id, weight')
          .in(
            'answer_option_id',
            answers.map((entry) => entry.answerOptionId),
          );

        if (tagError) {
          throw new Error(
            `Could not load preference data. Please try again. (${tagError.message})`,
          );
        }

        // Step 3: Increment the user's tag weight for every matched tag.
        const rpcResults = await Promise.all(
          (tagWeights ?? []).map(({ tag_id, weight }) =>
            supabase.rpc('increment_user_tag', {
              p_user_id: user.id,
              p_tag_id: tag_id,
              p_amount: weight,
            }),
          ),
        );

        const rpcFailure = rpcResults.find((r) => r.error);
        if (rpcFailure?.error) {
          throw new Error(
            `Could not update your preference profile. Please try again. (${rpcFailure.error.message})`,
          );
        }

        setData(answers.length);
        setLoading(false);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while saving your selections. Please try again.';
        setError(message);
        setData(0);
        setLoading(false);
        return false;
      }
    },
    [],
  );

  return { data, loading, error, saveAnswers };
};
