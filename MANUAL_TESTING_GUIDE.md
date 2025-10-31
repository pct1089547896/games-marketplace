# Manual Testing Guide - Rich Text Editor with Advanced Features

## Deployment Information
**Production URL**: https://2vd05s0g2spy.space.minimax.io
**Admin Login**: https://2vd05s0g2spy.space.minimax.io/admin/login
**Test Date**: 2025-10-30

---

## ✅ Pre-Test Checklist

### System Requirements:
- [ ] Modern web browser (Chrome, Firefox, Safari, Edge)
- [ ] JavaScript enabled
- [ ] Internet connection
- [ ] Admin credentials

### Test Files Needed:
- [ ] Test image files (JPG, PNG) - various sizes
- [ ] Large image (>5MB) for testing compression
- [ ] Invalid file (PDF, TXT) for error testing

---

## 🎯 Testing Pathways

### Pathway 1: Basic Rich Text Editing
**Goal**: Verify core editing functionality works

#### Test Steps:
1. **Login to Admin**
   - Navigate to `/admin/login`
   - Enter credentials
   - Verify successful login → redirects to dashboard

2. **Navigate to Content Creation**
   - Click "Blog Posts" tab
   - Click "Add New" button
   - Verify form loads with rich text editor

3. **Test Text Formatting**
   - [ ] Type some text
   - [ ] Select text and click **Bold** → verify text is bold
   - [ ] Select text and click **Italic** → verify text is italic
   - [ ] Select text and click **Underline** → verify text is underlined
   - [ ] Test color picker → verify color changes

4. **Test Headers**
   - [ ] Click header dropdown
   - [ ] Select H1 → verify large heading
   - [ ] Select H2 → verify medium heading
   - [ ] Select H3 → verify smaller heading

5. **Test Lists**
   - [ ] Click bullet list button
   - [ ] Type 3 items (press Enter between)
   - [ ] Verify bulleted list appears
   - [ ] Click numbered list button
   - [ ] Type 3 items
   - [ ] Verify numbered list appears

6. **Test Links**
   - [ ] Select text
   - [ ] Click link button
   - [ ] Enter URL (https://example.com)
   - [ ] Verify link is created and underlined

**Expected Result**: All formatting options work correctly
**Status**: [ ] PASS / [ ] FAIL
**Issues**:

---

### Pathway 2: Content Templates
**Goal**: Verify template system works

#### Test Steps:
1. **Open Templates Modal**
   - [ ] Click "Templates" button above editor
   - [ ] Verify modal opens
   - [ ] Verify templates are visible

2. **Test Blog Template**
   - [ ] Select "Article Post" template
   - [ ] Verify template content is inserted
   - [ ] Verify headers, paragraphs, blockquote format correctly
   - [ ] Edit template content → verify edits work

3. **Test Different Content Type**
   - [ ] Navigate to "Games" tab
   - [ ] Click "Add New"
   - [ ] Click "Templates"
   - [ ] Verify game-specific templates appear
   - [ ] Select "Feature List" template
   - [ ] Verify correct content is inserted

4. **Template Customization**
   - [ ] Insert a template
   - [ ] Edit the text
   - [ ] Add formatting
   - [ ] Verify changes are saved

**Expected Result**: Templates insert correctly and are editable
**Status**: [ ] PASS / [ ] FAIL
**Issues**:

---

### Pathway 3: Direct Image Upload
**Goal**: Verify image upload functionality

#### Test Steps:
1. **Upload via Button**
   - [ ] Click "Upload Image" button
   - [ ] Verify modal opens
   - [ ] Verify "Upload" tab is active
   - [ ] Click "Browse Files"
   - [ ] Select a JPG image (< 5MB)
   - [ ] Verify preview appears
   - [ ] Wait for upload to complete
   - [ ] Verify image is inserted into editor

2. **Drag-and-Drop Upload**
   - [ ] Click "Upload Image" button
   - [ ] Drag an image file from desktop
   - [ ] Drop into the dropzone
   - [ ] Verify dropzone highlights on drag
   - [ ] Verify preview appears
   - [ ] Verify upload completes
   - [ ] Verify image is inserted

3. **Image Compression Test**
   - [ ] Find a large image (>2MB, high resolution)
   - [ ] Upload via drag-and-drop
   - [ ] Verify upload succeeds
   - [ ] Save content
   - [ ] View on frontend
   - [ ] Right-click image → "Open image in new tab"
   - [ ] Check file size (should be compressed)

4. **Error Handling**
   - [ ] Try uploading a PDF file
   - [ ] Verify error message: "Please select an image file"
   - [ ] Try uploading very large file (>10MB)
   - [ ] Verify error message: "File size must be less than 10MB"

5. **URL Insert (Alternative)**
   - [ ] Click "Upload Image" button
   - [ ] Click "URL" tab
   - [ ] Enter image URL
   - [ ] Click "Insert Image"
   - [ ] Verify image is inserted

**Expected Result**: Images upload, compress, and insert correctly
**Status**: [ ] PASS / [ ] FAIL
**Issues**:

---

### Pathway 4: Live Preview
**Goal**: Verify preview functionality

#### Test Steps:
1. **Desktop Preview**
   - [ ] Type some content with formatting
   - [ ] Click "Preview" button
   - [ ] Verify preview modal opens
   - [ ] Verify "Desktop" mode is selected
   - [ ] Verify content appears with correct formatting
   - [ ] Verify images display correctly
   - [ ] Verify links are blue and underlined
   - [ ] Verify headers are sized correctly

2. **Mobile Preview**
   - [ ] In preview modal, click "Mobile" button
   - [ ] Verify preview width narrows
   - [ ] Verify content is responsive
   - [ ] Verify images scale properly
   - [ ] Scroll through content

3. **Preview Updates**
   - [ ] Close preview
   - [ ] Edit content (add text, images)
   - [ ] Reopen preview
   - [ ] Verify new content appears

4. **Preview Without Saving**
   - [ ] Make changes in editor
   - [ ] Open preview (do NOT save)
   - [ ] Verify preview shows unsaved changes
   - [ ] Close preview
   - [ ] Verify can continue editing

**Expected Result**: Preview shows accurate content in both modes
**Status**: [ ] PASS / [ ] FAIL
**Issues**:

---

### Pathway 5: Complete Workflow
**Goal**: Test entire content creation workflow

#### Test Steps:
1. **Create Game with Rich Content**
   - [ ] Go to Games → Add New
   - [ ] Fill in title: "Test Game 2025"
   - [ ] Click "Templates"
   - [ ] Select "Feature List" template
   - [ ] Edit template:
     - Change feature names
     - Add bold formatting
     - Change colors
   - [ ] Click "Upload Image"
   - [ ] Upload a game screenshot
   - [ ] Position image in content
   - [ ] Upload another image
   - [ ] Click "Preview"
   - [ ] Check desktop view → verify looks good
   - [ ] Check mobile view → verify responsive
   - [ ] Close preview
   - [ ] Fill download link: https://example.com
   - [ ] Fill category: "Action"
   - [ ] Check "Featured"
   - [ ] Click "Save"
   - [ ] Verify success message

2. **View on Frontend**
   - [ ] Navigate to public Games page
   - [ ] Find "Test Game 2025"
   - [ ] Click to view details
   - [ ] Verify rich content displays correctly:
     - Headers are styled
     - Bold text appears bold
     - Colors display correctly
     - Images are visible and responsive
     - Lists are formatted
   - [ ] Test on mobile (resize browser)
   - [ ] Verify responsive design works

3. **Edit Existing Content**
   - [ ] Return to admin dashboard
   - [ ] Click edit on "Test Game 2025"
   - [ ] Verify content loads in editor with formatting
   - [ ] Make changes
   - [ ] Upload another image
   - [ ] Save
   - [ ] Verify changes appear on frontend

**Expected Result**: Complete workflow works end-to-end
**Status**: [ ] PASS / [ ] FAIL
**Issues**:

---

### Pathway 6: Blog Post Creation
**Goal**: Test blog-specific features

#### Test Steps:
1. **Create Rich Blog Post**
   - [ ] Go to Blog Posts → Add New
   - [ ] Fill title: "Testing Rich Editor"
   - [ ] Click "Templates"
   - [ ] Select "Tutorial Guide"
   - [ ] Customize content:
     - Edit steps
     - Add code blocks (click code button)
     - Add blockquotes
     - Format text with colors
   - [ ] Upload featured image (separate field)
   - [ ] Upload inline images in content
   - [ ] Click "Preview"
   - [ ] Verify desktop view
   - [ ] Verify mobile view
   - [ ] Fill author: "Admin"
   - [ ] Check "Published"
   - [ ] Save

2. **View Blog Post**
   - [ ] Navigate to public Blog page
   - [ ] Find "Testing Rich Editor"
   - [ ] Click to read
   - [ ] Verify:
     - Featured image displays
     - Content renders with formatting
     - Code blocks have dark background
     - Blockquotes have border
     - Inline images appear
     - All styling is correct

**Expected Result**: Blog posts work with all features
**Status**: [ ] PASS / [ ] FAIL
**Issues**:

---

## 🔍 Edge Cases to Test

### Edge Case 1: Very Long Content
- [ ] Create content with 5000+ words
- [ ] Add 20+ images
- [ ] Save successfully
- [ ] Load in editor (should work)
- [ ] Preview (should work)
- [ ] View on frontend (should work)

### Edge Case 2: Special Characters
- [ ] Type special characters: & < > " '
- [ ] Type emojis: 😀 🎮 🚀
- [ ] Save and view
- [ ] Verify no encoding issues

### Edge Case 3: Paste from Word
- [ ] Copy formatted text from Microsoft Word
- [ ] Paste into editor
- [ ] Click "Clean" button to remove extra formatting
- [ ] Verify clean formatting

### Edge Case 4: Multiple Images
- [ ] Upload 10 images in one piece of content
- [ ] Verify all upload successfully
- [ ] Save
- [ ] View on frontend
- [ ] Verify all images load

### Edge Case 5: Mobile Browser
- [ ] Open admin panel on mobile device
- [ ] Try creating content
- [ ] Try uploading images
- [ ] Verify usability on mobile

---

## 📊 Test Results Summary

### Features Tested:

| Feature | Status | Notes |
|---------|--------|-------|
| Basic Text Formatting | [ ] PASS / [ ] FAIL | |
| Headers (H1-H6) | [ ] PASS / [ ] FAIL | |
| Lists (Ordered/Unordered) | [ ] PASS / [ ] FAIL | |
| Links | [ ] PASS / [ ] FAIL | |
| Colors | [ ] PASS / [ ] FAIL | |
| Content Templates | [ ] PASS / [ ] FAIL | |
| Template Customization | [ ] PASS / [ ] FAIL | |
| Image Upload (Button) | [ ] PASS / [ ] FAIL | |
| Image Upload (Drag-Drop) | [ ] PASS / [ ] FAIL | |
| Image Compression | [ ] PASS / [ ] FAIL | |
| Image URL Insert | [ ] PASS / [ ] FAIL | |
| Upload Error Handling | [ ] PASS / [ ] FAIL | |
| Live Preview (Desktop) | [ ] PASS / [ ] FAIL | |
| Live Preview (Mobile) | [ ] PASS / [ ] FAIL | |
| Preview Accuracy | [ ] PASS / [ ] FAIL | |
| Save Functionality | [ ] PASS / [ ] FAIL | |
| Frontend Display | [ ] PASS / [ ] FAIL | |
| Edit Existing Content | [ ] PASS / [ ] FAIL | |
| Responsive Design | [ ] PASS / [ ] FAIL | |

### Overall Status:
- [ ] All tests passed
- [ ] Some tests failed (see notes)
- [ ] Major issues found (see below)

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Recommendations:
1. 
2. 
3. 

---

## ✅ Sign-Off

**Tester Name**: _________________
**Test Date**: _________________
**Overall Status**: [ ] APPROVED / [ ] NEEDS FIXES
**Signature**: _________________

---

## 📝 Notes

Use this space for additional observations, suggestions, or feedback:

---

**End of Manual Testing Guide**

For automated testing when browser tools are available, refer to the test-progress.md file.
