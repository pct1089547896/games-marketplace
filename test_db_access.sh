#!/bin/bash

SUPABASE_URL="https://dieqhiezcpexkivklxcw.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXFoaWV6Y3BleGtpdmtseGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDQ0ODIsImV4cCI6MjA3NzI4MDQ4Mn0.ZPl_HnCEmr9tPDhCOZ_Ks7zyjHIZLEu3cDFsEQYPYbo"

# Test if we can query the database using anon key
echo "Testing database access with anon key..."
curl -s "${SUPABASE_URL}/rest/v1/blog_posts?select=id&limit=1" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  | jq '.' 2>/dev/null || echo "Query failed"

# Check if we can see table columns
echo -e "\nChecking blog_posts columns..."
curl -s "${SUPABASE_URL}/rest/v1/?select=*" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  | head -20

