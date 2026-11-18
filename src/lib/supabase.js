import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const supabaseConfigError =
  !supabaseUrl && !supabaseKey
    ? 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env or .env.local file.'
    : !supabaseUrl || !supabaseKey
      ? 'Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.'
      : null;

export const supabase = supabaseConfigError ? null : createClient(supabaseUrl, supabaseKey);
