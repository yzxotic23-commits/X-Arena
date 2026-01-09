import { createClient } from '@supabase/supabase-js';

// Supabase Client 2 - for Target Summary data (SGD)
const SUPABASE_URL_SGD = process.env.NEXT_PUBLIC_SUPABASE_URL_SGD || 'https://bbuxfnchflhtulainndm.supabase.co';
const SUPABASE_ANON_KEY_SGD = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_SGD || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJidXhmbmNoZmxodHVsYWlubmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDYzMjYsImV4cCI6MjA2OTQyMjMyNn0.AF6IiaeGB9-8FYZNKQsbnl5yZmSjBMj7Ag4eUunEbtc';

if (!SUPABASE_URL_SGD || !SUPABASE_ANON_KEY_SGD) {
  console.warn('Supabase SGD environment variables not set. Using default values.');
}

export const supabase2 = createClient(SUPABASE_URL_SGD, SUPABASE_ANON_KEY_SGD);

