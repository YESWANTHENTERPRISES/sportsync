import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env.VITE_SUPABASE_URL 
  : (process.env.VITE_SUPABASE_URL || 'https://efzngdzhmtgipvcaojcz.supabase.co');

const supabaseAnonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env)
  ? (import.meta as any).env.VITE_SUPABASE_ANON_KEY 
  : (process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vQUli-ghiOeo06Lpo0qONA_8uPq3LlB');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase configuration. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
