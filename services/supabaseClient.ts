import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://prdridyufkqjeakzbekb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByZHJpZHl1ZmtxamVha3piZWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NTQzMzMsImV4cCI6MjA4MzMzMDMzM30.PtTiCAxbFDlASbrFPu6Hjbb20L-0u-osaP5n8I0gafA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);