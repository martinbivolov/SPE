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
    async (_userId: string, answers: QuizAnswerEntry[]): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Confirm auth session before any DB writes.
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error('Not authenticated. Please sign in again.');

        // Drop info_only entries — nothing to persist.
        const saveable = answers.filter((a) => a.questionType !== 'info_only') as Extract<
          QuizAnswerEntry,
          { answerOptionId: string }
        >[];

        // ── Per-row UPDATE or INSERT ─────────────────────────────────────────
        // For each answer, check whether a row already exists for this
        // user + question combination, then update it or insert a new one.
        // This avoids constraint conflicts entirely and works without any
        // unique index on the table.

        for (const row of saveable) {
          const answerOptionId = row.answerOptionId ?? null;
          const freeTextAnswer =
            'textValue' in row ? (row.textValue ?? null) : null;

          const { data: existing } = await supabase
            .from('lifestyle_answers')
            .select('id')
            .eq('user_id', user.id)
            .eq('question_id', row.questionId)
            .maybeSingle();

          if (existing) {
            const { error: updateError } = await supabase
              .from('lifestyle_answers')
              .update({
                answer_option_id: answerOptionId,
                free_text_answer: freeTextAnswer,
              })
              .eq('id', existing.id);

            if (updateError) {
              throw new Error(
                `Could not update your answer. Please try again. (${updateError.message})`,
              );
            }
          } else {
            const { error: insertError } = await supabase
              .from('lifestyle_answers')
              .insert({
                user_id: user.id,
                question_id: row.questionId,
                answer_option_id: answerOptionId,
                free_text_answer: freeTextAnswer,
              });

            if (insertError) {
              throw new Error(
                `Could not save your answer. Please try again. (${insertError.message})`,
              );
            }
          }
        }

        // ── Tag weight increments (weighted answer types only) ───────────────

        const weightedAnswers = saveable.filter(
          (a) =>
            a.questionType === 'single' ||
            a.questionType === 'multi' ||
            a.questionType === 'quotes',
        );

        if (weightedAnswers.length > 0) {
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
