import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://xtalrmoacijdwioazfps.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YWxybW9hY2lqZHdpb2F6ZnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzI3MTcsImV4cCI6MjA5MTQwODcxN30.rVTdM7KNgWDC3r8MQ7_TVOf-xZd4j_XeFTJXeLXBHcA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  realtime: { params: { eventsPerSecond: 10 } },
});

export default supabase;