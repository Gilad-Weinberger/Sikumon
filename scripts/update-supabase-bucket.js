#!/usr/bin/env node

/**
 * Script to update Supabase storage bucket MIME types
 * Run this script to update the summaries bucket to allow all supported file types
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing required environment variables:");
  console.error("   - NEXT_PUBLIC_SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nMake sure these are set in your .env.local file");
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Supported MIME types (matching the frontend validation)
const ALLOWED_MIME_TYPES = [
  // PDF files
  "application/pdf",

  // Word documents (.doc and .docx)
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Image files
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
  "image/bmp",
  "image/x-icon",
];

async function updateBucketMimeTypes() {
  try {
    console.log("🔄 Updating Supabase storage bucket MIME types...");

    // Read and execute the SQL script
    const sqlScript = fs.readFileSync(
      path.join(
        __dirname,
        "../lib/sql/storage/update_summaries_bucket_mime_types.sql"
      ),
      "utf8"
    );

    // Execute the SQL update
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: `
        UPDATE storage.buckets 
        SET allowed_mime_types = ARRAY[${ALLOWED_MIME_TYPES.map(
          (type) => `'${type}'`
        ).join(", ")}]
        WHERE id = 'summaries';
        
        SELECT id, name, allowed_mime_types, file_size_limit 
        FROM storage.buckets 
        WHERE id = 'summaries';
      `,
    });

    if (error) {
      console.error("❌ Error updating bucket:", error.message);

      // Try alternative approach using direct SQL
      console.log("🔄 Trying alternative update method...");

      const { data: bucketData, error: bucketError } = await supabase
        .from("storage.buckets")
        .update({
          allowed_mime_types: ALLOWED_MIME_TYPES,
        })
        .eq("id", "summaries")
        .select();

      if (bucketError) {
        console.error("❌ Alternative update failed:", bucketError.message);
        console.log("\n📋 Manual Update Required:");
        console.log("Please run this SQL in your Supabase SQL Editor:");
        console.log("\n" + sqlScript);
        process.exit(1);
      }

      console.log("✅ Bucket updated successfully using alternative method");
      console.log("📊 Updated bucket configuration:", bucketData);
    } else {
      console.log("✅ Bucket updated successfully");
      console.log("📊 Bucket configuration:", data);
    }

    // Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from("storage.buckets")
      .select("id, name, allowed_mime_types, file_size_limit")
      .eq("id", "summaries")
      .single();

    if (verifyError) {
      console.warn("⚠️  Could not verify update:", verifyError.message);
    } else {
      console.log("\n✅ Verification successful:");
      console.log(`   Bucket: ${verifyData.name}`);
      console.log(
        `   File size limit: ${verifyData.file_size_limit} bytes (${Math.round(
          verifyData.file_size_limit / 1024 / 1024
        )}MB)`
      );
      console.log(
        `   Allowed MIME types (${verifyData.allowed_mime_types.length}):`
      );
      verifyData.allowed_mime_types.forEach((type) => {
        console.log(`     - ${type}`);
      });
    }

    console.log("\n🎉 Bucket update completed successfully!");
    console.log("   Your app now supports uploading:");
    console.log("   - PDF files (.pdf)");
    console.log("   - Word documents (.doc, .docx)");
    console.log(
      "   - Images (.jpg, .jpeg, .png, .gif, .svg, .webp, .bmp, .ico)"
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    console.log("\n📋 Manual Update Required:");
    console.log("Please run this SQL in your Supabase SQL Editor:");

    const sqlScript = fs.readFileSync(
      path.join(
        __dirname,
        "../lib/sql/storage/update_summaries_bucket_mime_types.sql"
      ),
      "utf8"
    );
    console.log("\n" + sqlScript);

    process.exit(1);
  }
}

// Run the update
updateBucketMimeTypes();
