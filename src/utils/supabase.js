import { createClient } from '@supabase/supabase-js';

// These will be set as Vercel environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveEmail(email, name = '') {
  if (!SUPABASE_URL) {
    console.warn('Supabase not configured');
    return { error: null }; // Silently succeed in dev
  }
  const { error } = await supabase
    .from('waitlist')
    .insert([{
      email: email.toLowerCase().trim(),
      name: name.trim(),
      source: 'loteria-remix-app',
      created_at: new Date().toISOString(),
    }]);
  return { error };
}

export const isSupabaseConfigured = !!SUPABASE_URL;

export async function submitScore(gameMode, score, nickname) {
  if (!SUPABASE_URL) return { error: null };
  const { error } = await supabase
    .from('scores')
    .insert([{ game_mode: gameMode, score, nickname: nickname.trim().slice(0, 20), created_at: new Date().toISOString() }]);
  return { error };
}

export async function getLeaderboard(gameMode, limit = 10) {
  if (!SUPABASE_URL) return { data: [], error: null };
  const { data, error } = await supabase
    .from('scores')
    .select('nickname, score, created_at')
    .eq('game_mode', gameMode)
    .order('score', { ascending: false })
    .limit(limit);
  return { data: data || [], error };
}
