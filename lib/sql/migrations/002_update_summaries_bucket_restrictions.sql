-- Migration: Update summaries bucket to restrict file types to PDF, DOCX, and images only
-- Created: 2025-09-18
-- Description: Updates the summaries storage bucket to only allow PDF, DOCX, and image files

-- Update the summaries bucket to restrict allowed MIME types
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png', 
  'image/gif',
  'image/svg+xml',
  'image/webp'
]
WHERE id = 'summaries';
