import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dieqhiezcpexkivklxcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseState() {
  console.log('Checking database state...\n');
  
  // Test 1: Check if we can query blog_posts
  console.log('1. Testing blog_posts table access...');
  const { data: blogPosts, error: blogError } = await supabase
    .from('blog_posts')
    .select('id, title')
    .limit(1);
  
  if (blogError) {
    console.log('   Error querying blog_posts:', blogError.message);
  } else {
    console.log('   ✓ blog_posts table accessible');
    console.log(`   Found ${blogPosts?.length || 0} posts`);
  }
  
  // Test 2: Check if gallery_layout column exists by trying to select it
  console.log('\n2. Testing gallery_layout column in blog_posts...');
  const { data: layoutTest, error: layoutError } = await supabase
    .from('blog_posts')
    .select('id, gallery_layout')
    .limit(1);
  
  if (layoutError) {
    console.log('   ✗ gallery_layout column missing!');
    console.log('   Error:', layoutError.message);
    console.log('   --> MIGRATION REQUIRED');
    return false;
  } else {
    console.log('   ✓ gallery_layout column exists');
  }
  
  // Test 3: Check if post_images table exists
  console.log('\n3. Testing post_images table...');
  const { data: images, error: imagesError } = await supabase
    .from('post_images')
    .select('id')
    .limit(1);
  
  if (imagesError) {
    console.log('   ✗ post_images table missing!');
    console.log('   Error:', imagesError.message);
    console.log('   --> MIGRATION REQUIRED');
    return false;
  } else {
    console.log('   ✓ post_images table exists');
    console.log(`   Found ${images?.length || 0} gallery images`);
  }
  
  // Test 4: Check storage bucket
  console.log('\n4. Testing gallery-images storage bucket...');
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketsError) {
    console.log('   Error checking buckets:', bucketsError.message);
  } else {
    const galleryBucket = buckets?.find(b => b.name === 'gallery-images');
    if (galleryBucket) {
      console.log('   ✓ gallery-images bucket exists');
      console.log(`   Public: ${galleryBucket.public}`);
    } else {
      console.log('   ✗ gallery-images bucket missing!');
      console.log('   --> BUCKET CREATION REQUIRED');
      return false;
    }
  }
  
  console.log('\n✅ All checks passed! Database is properly configured.');
  return true;
}

async function testImageUpload() {
  console.log('\n\nTesting image upload functionality...\n');
  
  // Create a test image (1x1 pixel red PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  const testFileName = `test-${Date.now()}.png`;
  
  console.log('1. Uploading test image...');
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('gallery-images')
    .upload(testFileName, testImageBuffer, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (uploadError) {
    console.log('   ✗ Upload failed:', uploadError.message);
    return false;
  } else {
    console.log('   ✓ Upload successful');
    console.log('   Path:', uploadData.path);
  }
  
  // Get public URL
  console.log('\n2. Getting public URL...');
  const { data: urlData } = supabase
    .storage
    .from('gallery-images')
    .getPublicUrl(testFileName);
  
  console.log('   ✓ Public URL:', urlData.publicUrl);
  
  // Clean up test image
  console.log('\n3. Cleaning up test image...');
  const { error: deleteError } = await supabase
    .storage
    .from('gallery-images')
    .remove([testFileName]);
  
  if (deleteError) {
    console.log('   Warning: Could not delete test image:', deleteError.message);
  } else {
    console.log('   ✓ Test image deleted');
  }
  
  console.log('\n✅ Image upload functionality is working!');
  return true;
}

async function main() {
  console.log('='.repeat(60));
  console.log('DATABASE AND STORAGE CHECK FOR GALLERY SYSTEM');
  console.log('='.repeat(60));
  console.log();
  
  const dbReady = await checkDatabaseState();
  
  if (dbReady) {
    await testImageUpload();
  } else {
    console.log('\n❌ Database migration is required!');
    console.log('\nPlease run the SQL script from URGENT_DATABASE_FIX.sql');
    console.log('in your Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw/sql');
    process.exit(1);
  }
}

main().catch(console.error);
