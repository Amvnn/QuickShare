const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const router = express.Router();

// GET /status/:fileId - Get file status
router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find file in Supabase database
    const { data: fileDoc, error: dbError } = await supabase
      .from('files')
      .select('*')
      .eq('file_id', fileId)
      .single();

    if (dbError || !fileDoc) {
      return res.status(404).json({
        error: 'File not found',
        message: 'The requested file does not exist'
      });
    }

    // Calculate time remaining
    const now = new Date();
    const expiresAt = new Date(fileDoc.expires_at);
    const isExpired = now > expiresAt;

    if (isExpired) {
      return res.status(410).json({
        error: 'File expired',
        message: 'This file has expired and is no longer available',
        expiredAt: fileDoc.expires_at
      });
    }

    const timeRemaining = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60))); // in hours

    // Return file status
    res.json({
      success: true,
      data: {
        fileId: fileDoc.file_id,
        originalName: fileDoc.original_name,
        fileSize: fileDoc.file_size,
        mimeType: fileDoc.mime_type,
        uploadedAt: fileDoc.uploaded_at,
        expiresAt: fileDoc.expires_at,
        isExpired: isExpired,
        timeRemaining: timeRemaining,
        downloadCount: fileDoc.download_count,
        downloadUrl: `${process.env.BASE_URL}/download/${fileDoc.file_id}`
      }
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: 'An error occurred while checking file status'
    });
  }
});

module.exports = router;