import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthResult {
	data: User | null;
	loading: boolean;
	error: string | null;
	signIn: (email: string) => Promise<{ error: string | null }>;
	signOut: () => Promise<{ error: string | null }>;
}

export const useAuth = (): AuthResult => {
	const [data, setData] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		const initializeSession = async () => {
			const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
			if (!isMounted) {
				return;
			}

			if (sessionError) {
				setError(sessionError.message);
			}

			setData(sessionData.session?.user ?? null);
			setLoading(false);
		};

		void initializeSession();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setData(session?.user ?? null);
			setLoading(false);
			setError(null);
		});

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, []);

	const signIn = async (email: string) => {
		setError(null);
		const { error: signInError } = await supabase.auth.signInWithOtp({
			email,
			options: { emailRedirectTo: window.location.origin },
		});

		if (signInError) {
			setError(signInError.message);
			return { error: signInError.message };
		}

		return { error: null };
	};

	const signOut = async () => {
		const { error: signOutError } = await supabase.auth.signOut();
		if (signOutError) {
			setError(signOutError.message);
			return { error: signOutError.message };
		}

		setError(null);
		return { error: null };
	};

	return { data, loading, error, signIn, signOut };
};
