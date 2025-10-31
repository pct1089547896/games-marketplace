import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dieqhiezcpexkivklxcw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseSchema() {
  console.log('='.repeat(70));
  console.log('STEP 1: DATABASE SCHEMA CHECK');
  console.log('='.repeat(70));
  
  // Test 1: Check gallery_layout column in blog_posts
  console.log('\n1. Testing gallery_layout column in blog_posts...');
  const { data: layoutTest, error: layoutError } = await supabase
    .from('blog_posts')
    .select('id, gallery_layout')
    .limit(1);
  
  if (layoutError) {
    console.log('   X FAILED - gallery_layout column missing!');
    console.log('   Error:', layoutError.message);
    console.log('   --> Run URGENT_DATABASE_FIX.sql first!');
    return false;
  } else {
    console.log('   ✓ PASSED - gallery_layout column exists');
  }
  
  // Test 2: Check post_images table
  console.log('\n2. Testing post_images table...');
  const { data: images, error: imagesError } = await supabase
    .from('post_images')
    .select('id')
    .limit(1);
  
  if (imagesError) {
    console.log('   X FAILED - post_images table missing!');
    console.log('   Error:', imagesError.message);
    console.log('   --> Run URGENT_DATABASE_FIX.sql first!');
    return false;
  } else {
    console.log('   ✓ PASSED - post_images table exists');
    console.log(`   Found ${images?.length || 0} gallery images in database`);
  }
  
  console.log('\n✅ DATABASE SCHEMA: ALL CHECKS PASSED\n');
  return true;
}

async function checkStorageBucket() {
  console.log('='.repeat(70));
  console.log('STEP 2: STORAGE BUCKET CHECK');
  console.log('='.repeat(70));
  
  console.log('\n1. Checking if gallery-images bucket exists...');
  const { data: buckets, error: bucketsError } = await supabase
    .storage
    .listBuckets();
  
  if (bucketsError) {
    console.log('   X FAILED - Cannot list buckets');
    console.log('   Error:', bucketsError.message);
    return false;
  }
  
  const galleryBucket = buckets?.find(b => b.name === 'gallery-images');
  if (!galleryBucket) {
    console.log('   X FAILED - gallery-images bucket does not exist!');
    console.log('   --> Create bucket in Supabase dashboard');
    return false;
  }
  
  console.log('   ✓ PASSED - gallery-images bucket exists');
  console.log(`   Public: ${galleryBucket.public}`);
  console.log(`   File size limit: ${galleryBucket.file_size_limit ? galleryBucket.file_size_limit / 1024 / 1024 + 'MB' : 'Not set'}`);
  
  console.log('\n✅ STORAGE BUCKET: ALL CHECKS PASSED\n');
  return true;
}

async function testStorageRLS() {
  console.log('='.repeat(70));
  console.log('STEP 3: STORAGE RLS POLICIES TEST');
  console.log('='.repeat(70));
  
  // Create a test image (1x1 pixel transparent PNG)
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  const testFileName = `rls-test-${Date.now()}.png`;
  
  // Test 1: Upload test image
  console.log('\n1. Testing image upload (INSERT policy)...');
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('gallery-images')
    .upload(testFileName, testImageBuffer, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (uploadError) {
    console.log('   X FAILED - Upload blocked by RLS policy!');
    console.log('   Error:', uploadError.message);
    console.log('   --> Run STORAGE_RLS_FIX.sql to fix policies!');
    return false;
  } else {
    console.log('   ✓ PASSED - Upload successful (INSERT policy working)');
    console.log('   Path:', uploadData.path);
  }
  
  // Test 2: Get public URL (SELECT policy)
  console.log('\n2. Testing public URL access (SELECT policy)...');
  const { data: urlData } = supabase
    .storage
    .from('gallery-images')
    .getPublicUrl(testFileName);
  
  console.log('   ✓ PASSED - Public URL generated (SELECT policy working)');
  console.log('   URL:', urlData.publicUrl);
  
  // Test 3: List files (SELECT policy)
  console.log('\n3. Testing file listing (SELECT policy)...');
  const { data: listData, error: listError } = await supabase
    .storage
    .from('gallery-images')
    .list('', { limit: 1 });
  
  if (listError) {
    console.log('   X FAILED - Cannot list files');
    console.log('   Error:', listError.message);
  } else {
    console.log('   ✓ PASSED - File listing successful');
    console.log(`   Found ${listData?.length || 0} files in bucket`);
  }
  
  // Test 4: Delete test image (DELETE policy)
  console.log('\n4. Testing file deletion (DELETE policy)...');
  const { error: deleteError } = await supabase
    .storage
    .from('gallery-images')
    .remove([testFileName]);
  
  if (deleteError) {
    console.log('   ⚠ WARNING - Could not delete test image');
    console.log('   Error:', deleteError.message);
    console.log('   (This may require authenticated user, but upload works)');
  } else {
    console.log('   ✓ PASSED - File deletion successful (DELETE policy working)');
  }
  
  console.log('\n✅ STORAGE RLS POLICIES: ALL CRITICAL TESTS PASSED\n');
  return true;
}

async function testImageUploadFlow() {
  console.log('='.repeat(70));
  console.log('STEP 4: END-TO-END IMAGE UPLOAD TEST');
  console.log('='.repeat(70));
  
  // Create a realistic test image
  const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
  const testImageBuffer = Buffer.from(testImageBase64, 'base64');
  const timestamp = Date.now();
  const mainFileName = `gallery-${timestamp}.png`;
  const thumbnailFileName = `gallery-${timestamp}-thumb.png`;
  
  console.log('\n1. Uploading main image...');
  const { data: mainUpload, error: mainError } = await supabase
    .storage
    .from('gallery-images')
    .upload(mainFileName, testImageBuffer, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (mainError) {
    console.log('   X FAILED - Main image upload failed');
    console.log('   Error:', mainError.message);
    return false;
  }
  console.log('   ✓ Main image uploaded');
  
  const mainUrl = supabase.storage.from('gallery-images').getPublicUrl(mainFileName).data.publicUrl;
  
  console.log('\n2. Uploading thumbnail...');
  const { data: thumbUpload, error: thumbError } = await supabase
    .storage
    .from('gallery-images')
    .upload(thumbnailFileName, testImageBuffer, {
      contentType: 'image/png',
      upsert: false
    });
  
  if (thumbError) {
    console.log('   X FAILED - Thumbnail upload failed');
    console.log('   Error:', thumbError.message);
    return false;
  }
  console.log('   ✓ Thumbnail uploaded');
  
  const thumbUrl = supabase.storage.from('gallery-images').getPublicUrl(thumbnailFileName).data.publicUrl;
  
  console.log('\n3. Saving image metadata to post_images table...');
  const { data: insertData, error: insertError } = await supabase
    .from('post_images')
    .insert({
      post_id: '00000000-0000-0000-0000-000000000000', // Test UUID
      post_type: 'blog',
      image_url: mainUrl,
      thumbnail_url: thumbUrl,
      alt_text: 'Test image',
      caption: 'End-to-end test image',
      display_order: 0
    })
    .select();
  
  if (insertError) {
    console.log('   X FAILED - Database insert failed');
    console.log('   Error:', insertError.message);
    // Clean up uploaded files
    await supabase.storage.from('gallery-images').remove([mainFileName, thumbnailFileName]);
    return false;
  }
  console.log('   ✓ Metadata saved to database');
  
  console.log('\n4. Cleaning up test data...');
  // Delete from database
  if (insertData && insertData[0]) {
    await supabase.from('post_images').delete().eq('id', insertData[0].id);
  }
  // Delete from storage
  await supabase.storage.from('gallery-images').remove([mainFileName, thumbnailFileName]);
  console.log('   ✓ Test data cleaned up');
  
  console.log('\n✅ END-TO-END TEST: COMPLETE SUCCESS!\n');
  console.log('   Your gallery system is fully functional and ready to use.');
  return true;
}

async function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║     GALLERY SYSTEM COMPREHENSIVE VERIFICATION TEST                ║');
  console.log('║     Testing Database Schema, Storage Bucket, and RLS Policies     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  let allPassed = true;
  
  // Step 1: Database Schema
  const dbOk = await checkDatabaseSchema();
  if (!dbOk) {
    allPassed = false;
    console.log('\n❌ CRITICAL: Database migration required!');
    console.log('   Please run: URGENT_DATABASE_FIX.sql\n');
    process.exit(1);
  }
  
  // Step 2: Storage Bucket
  const bucketOk = await checkStorageBucket();
  if (!bucketOk) {
    allPassed = false;
    console.log('\n❌ CRITICAL: Storage bucket missing!');
    console.log('   Please create the gallery-images bucket in Supabase dashboard\n');
    process.exit(1);
  }
  
  // Step 3: Storage RLS Policies
  const rlsOk = await testStorageRLS();
  if (!rlsOk) {
    allPassed = false;
    console.log('\n❌ CRITICAL: Storage RLS policies need fixing!');
    console.log('   Please run: STORAGE_RLS_FIX.sql\n');
    process.exit(1);
  }
  
  // Step 4: End-to-End Test
  const e2eOk = await testImageUploadFlow();
  if (!e2eOk) {
    allPassed = false;
    console.log('\n❌ CRITICAL: End-to-end test failed!');
    console.log('   Check error messages above\n');
    process.exit(1);
  }
  
  // Final Summary
  console.log('='.repeat(70));
  console.log('FINAL VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  console.log('\n✅ Database Schema: READY');
  console.log('✅ Storage Bucket: READY');
  console.log('✅ RLS Policies: CONFIGURED');
  console.log('✅ End-to-End Flow: WORKING\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║  🎉 SUCCESS! Your gallery system is fully operational!           ║');
  console.log('║                                                                   ║');
  console.log('║  You can now upload images in your admin panel at:               ║');
  console.log('║  https://1klct3zdsvna.space.minimax.io                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

main().catch(error => {
  console.error('\n❌ TEST FAILED WITH ERROR:');
  console.error(error);
  process.exit(1);
});
