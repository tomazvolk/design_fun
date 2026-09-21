/*
 * Leaky runtime config. Both values are public by design (the anon key only
 * allows what the row-level security policies in supabase/schema.sql allow).
 * Leave them empty to run in demo mode with simulated sign-in.
 */
window.LEAKY_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
};
