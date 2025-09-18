-- Update Summaries Storage Bucket MIME Types
-- Created: 2025-09-18
-- Description: Updates the summaries bucket to allow all supported file types including .doc files

-- Update the summaries bucket to include all supported MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  -- PDF files
  'application/pdf',
  
  -- Word documents (.doc and .docx)
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  -- Image files
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/svg+xml', 
  'image/webp',
  'image/bmp',
  'image/x-icon'
]
WHERE id = 'summaries';

-- Verify the update
SELECT id, name, allowed_mime_types, file_size_limit 
FROM storage.buckets 
WHERE id = 'summaries';
