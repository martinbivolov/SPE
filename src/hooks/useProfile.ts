import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useProfile = (userId: string) => {
  const [profile, setProfile] = useState<{
    name: string | null;
    email: string | null;
    language: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('name, email, preferred_language')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setProfile({
          name: data?.name ?? null,
          email: data?.email ?? null,
          language: data?.preferred_language ?? 'en',
        });
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading };
};
