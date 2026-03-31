import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

// Slim helper: directly patches profiles.background_info with a key/value map.
// For full quiz-answer saving (routing by question type, tag weighting, etc.)
// use useSaveQuizAnswers instead.

interface UseSaveBackgroundInfoResult {
  loading: boolean;
  error: string | null;
  saveBackgroundInfo: (
    userId: string,
    patch: Record<string, string>,
  ) => Promise<boolean>;
}

export const useSaveBackgroundInfo = (): UseSaveBackgroundInfoResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveBackgroundInfo = useCallback(
    async (userId: string, patch: Record<string, string>): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ background_info: patch })
          .eq('id', userId);

        if (updateError) {
          throw new Error(
            `Could not save background information. Please try again. (${updateError.message})`,
          );
        }

        setLoading(false);
        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while saving background information. Please try again.';
        setError(message);
        setLoading(false);
        return false;
      }
    },
    [],
  );

  return { loading, error, saveBackgroundInfo };
};
