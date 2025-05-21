import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecfhbnjesskwuhjlswvc.supabase.co';
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZmhibmplc3Nrd3Voamxzd3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjAxOTEsImV4cCI6MjA2MzMzNjE5MX0.E4Z3_eWAZs7RWHsQVFIwqNBW7a6YQyDoCJP2aHTtHfA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
