import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  name: string | null;
  email: string;
  language: string;
}

export const useProfile = (userId: string): Profile | null => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('name, email, preferred_language')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            name: data.name ?? null,
            email: data.email,
            language: data.preferred_language ?? 'en',
          });
        }
      });
  }, [userId]);

  return profile;
};
