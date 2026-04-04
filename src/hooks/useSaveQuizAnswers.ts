import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { QuestionType } from '../types/supabase.types';

// ---------------------------------------------------------------------------
// Input shape — one entry per answer the user gave
// ---------------------------------------------------------------------------

export type QuizAnswerEntry =
  | {
      questionId: string;
      questionType: Exclude<QuestionType, 'free_text' | 'info_only'>;
      answerOptionId: string;
    }
  | {
      questionId: string;
      questionType: 'free_text';
      answerOptionId: string;
      textValue: string;
    }
  | {
      questionId: string;
      questionType: 'info_only';
    };

interface UseSaveQuizAnswersResult {
  loading: boolean;
  error: string | null;
  saveAnswers: (userId: string, answers: QuizAnswerEntry[]) => Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useSaveQuizAnswers = (): UseSaveQuizAnswersResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAnswers = useCallback(
    async (userId: string, answers: QuizAnswerEntry[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Confirm auth session before any DB writes.
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Not authenticated. Please sign in again.');

        // Partition by type. info_only entries are intentionally dropped.
        const weightedAnswers = answers.filter(
          (a): a is Extract<QuizAnswerEntry, { answerOptionId: string }> =>
            a.questionType === 'single' ||
            a.questionType === 'multi' ||
            a.questionType === 'quotes',
        );

        const freeTextAnswers = answers.filter(
          (a): a is Extract<QuizAnswerEntry, { questionType: 'free_text' }> =>
            a.questionType === 'free_text',
        );

        // ── Weighted answers (single / multi / quotes) ──────────────────────

        if (weightedAnswers.length > 0) {
          // Step 1: Upsert one lifestyle_answers row per selected option.
          // ignoreDuplicates: true silently skips rows that already exist.
          const { error: insertError } = await supabase
            .from('lifestyle_answers')
            .upsert(
              weightedAnswers.map((a) => ({
                user_id: user.id,
                question_id: a.questionId,
                answer_option_id: a.answerOptionId,
              })),
              { onConflict: 'user_id,question_id,answer_option_id', ignoreDuplicates: true },
            );

          if (insertError) {
            throw new Error(
              `Could not save your answers. Please try again. (${insertError.message})`,
            );
          }

          // Step 2: Look up which tags each selected option maps to.
          const { data: tagWeights, error: tagError } = await supabase
            .from('answer_option_tags')
            .select('tag_id, weight')
            .in(
              'answer_option_id',
              weightedAnswers.map((a) => a.answerOptionId),
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
        }

        // ── Free-text answers ───────────────────────────────────────────────
        // Delete any existing free-text row for this user+question+option,
        // then insert the new value with both answer_option_id and free_text_answer.

        if (freeTextAnswers.length > 0) {
          const { error: deleteError } = await supabase
            .from('lifestyle_answers')
            .delete()
            .eq('user_id', user.id)
            .in('question_id', freeTextAnswers.map((a) => a.questionId))
            .in('answer_option_id', freeTextAnswers.map((a) => a.answerOptionId));

          if (deleteError) {
            throw new Error(
              `Could not update your answers. Please try again. (${deleteError.message})`,
            );
          }

          const { error: insertError } = await supabase
            .from('lifestyle_answers')
            .insert(
              freeTextAnswers.map((a) => ({
                user_id: user.id,
                question_id: a.questionId,
                answer_option_id: a.answerOptionId,
                free_text_answer: a.textValue,
              })),
            );

          if (insertError) {
            throw new Error(
              `Could not save your answers. Please try again. (${insertError.message})`,
            );
          }
        }

        setLoading(false);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while saving your answers. Please try again.';
        setError(message);
        setLoading(false);
        return false;
      }
    },
    [],
  );

  return { loading, error, saveAnswers };
};
