import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dieqhiezcpexkivklxcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Checking storage policies and testing upload...\n');

// First, let's try a simple upload to see the exact error
console.log('1. Attempting file upload with anon key...');
const testData = Buffer.from('test');
const testFileName = `diagnostic-test-${Date.now()}.txt`;

const { data: uploadData, error: uploadError } = await supabase
  .storage
  .from('gallery-images')
  .upload(testFileName, testData, {
    contentType: 'text/plain',
    upsert: false
  });

if (uploadError) {
  console.log('   Upload failed with error:', uploadError.message);
  console.log('   Error name:', uploadError.name);
  console.log('   Status code:', uploadError.status);
  
  if (uploadError.message.includes('row-level security')) {
    console.log('\n   DIAGNOSIS: RLS policy is blocking the upload');
    console.log('   The policy might not include auth.role() = \'anon\'');
    console.log('\n   SOLUTION: Run this SQL in Supabase SQL Editor:');
    console.log('   --------------------------------------------------------');
    console.log(`
-- Fix the INSERT policy to allow anon role
DROP POLICY IF EXISTS "Allow upload via edge function" ON storage.objects;

CREATE POLICY "Allow upload via edge function" 
ON storage.objects
FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery-images'
  AND (
    auth.role() = 'anon' 
    OR auth.role() = 'authenticated'
    OR auth.role() = 'service_role'
  )
);
    `);
    console.log('   --------------------------------------------------------\n');
  }
} else {
  console.log('   ✓ SUCCESS! Upload worked!');
  console.log('   Path:', uploadData.path);
  
  // Clean up
  await supabase.storage.from('gallery-images').remove([testFileName]);
  console.log('   Test file cleaned up\n');
  
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  🎉 GALLERY STORAGE IS WORKING!                                  ║');
  console.log('║                                                                   ║');
  console.log('║  Your gallery system is ready to use!                            ║');
  console.log('║  Go to: https://1klct3zdsvna.space.minimax.io                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
}
