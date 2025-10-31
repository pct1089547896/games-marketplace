import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dieqhiezcpexkivklxcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Testing storage bucket with anon key...\n');

// Test 1: Try to list buckets
console.log('1. Testing bucket list access...');
const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

if (bucketsError) {
  console.log('   Error:', bucketsError.message);
  console.log('   (This is expected if bucket listing requires auth)\n');
} else {
  console.log('   Success! Found buckets:', buckets?.map(b => b.name).join(', '));
  const galleryBucket = buckets?.find(b => b.name === 'gallery-images');
  if (galleryBucket) {
    console.log('   ✓ gallery-images bucket EXISTS!');
    console.log('   Public:', galleryBucket.public);
    console.log('   File size limit:', galleryBucket.file_size_limit);
  } else {
    console.log('   X gallery-images bucket NOT FOUND');
  }
  console.log('');
}

// Test 2: Try to upload a test file
console.log('2. Testing file upload with anon key...');
const testData = Buffer.from('test image data');
const testFileName = `test-${Date.now()}.txt`;

const { data: uploadData, error: uploadError } = await supabase
  .storage
  .from('gallery-images')
  .upload(testFileName, testData, {
    contentType: 'text/plain',
    upsert: false
  });

if (uploadError) {
  console.log('   Error:', uploadError.message);
  if (uploadError.message.includes('Bucket not found')) {
    console.log('   ✗ BUCKET DOES NOT EXIST - needs to be created');
  } else if (uploadError.message.includes('row-level security')) {
    console.log('   ✓ Bucket exists but RLS policies need configuration');
  }
} else {
  console.log('   ✓ Upload successful!');
  console.log('   Path:', uploadData.path);
  
  // Clean up
  await supabase.storage.from('gallery-images').remove([testFileName]);
  console.log('   Test file cleaned up');
}

console.log('\nTest complete.');
