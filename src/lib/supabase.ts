import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dieqhiezcpexkivklxcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export for use in forum login
export { supabaseUrl as supabaseUrlExport };
export const supabaseKey = supabaseAnonKey;
