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
