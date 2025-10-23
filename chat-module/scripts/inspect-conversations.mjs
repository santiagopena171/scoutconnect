import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || 'https://lcujogyjgncfsxeptrlz.supabase.co';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdWpvZ3lqZ25jZnN4ZXB0cmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODUwNTcsImV4cCI6MjA3NjQ2MTA1N30.9V_LbNKuIoHt1p1-jSnXM1U33bG6qMN4R4JTbxhRbbM';

const supabase = createClient(url, anonKey);

(async () => {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) {
    console.error('Auth error', userErr);
  } else {
    console.log('Current user', userRes?.user?.id);
  }

  const { data: cp, error: cpErr } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .limit(5);

  if (cpErr) {
    console.error('Conversation participants error', cpErr);
    return;
  }

  console.log('Conversation participants sample', cp);
})();
