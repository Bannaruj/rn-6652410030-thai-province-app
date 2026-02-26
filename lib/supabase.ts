import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qwezdzbntjojtqypjick.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZXpkemJudGpvanRxeXBqaWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5ODg3NjMsImV4cCI6MjA4NzU2NDc2M30.TZq5QSC44i0NhMtils5hvtPQsXl5OGon29ijeRPf6qU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
