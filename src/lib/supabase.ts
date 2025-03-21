import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: true } }
);

// Svelte 5 reactive state with $state rune
export let session = $state<Session | null>(null);

// Auth listener using Svelte 5 $effect
$effect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_, newSession) => {
    session = newSession;
  });

  // Cleanup on component unmount
  return () => subscription?.unsubscribe();
});