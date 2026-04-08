import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  name: string | null;
  email: string;
}

export const useProfile = (userId: string): Profile | null => {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('name, email')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data as Profile);
      });
  }, [userId]);

  return profile;
};
