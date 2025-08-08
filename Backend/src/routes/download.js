const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const router = express.Router();

// GET /download/:fileId - Download a file
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

    // Check if file is expired
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

    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(fileDoc.storage_path);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      return res.status(404).json({
        error: 'File not found',
        message: 'The file was not found in storage'
      });
    }

    // Increment download count
    await supabase
      .from('files')
      .update({ download_count: fileDoc.download_count + 1 })
      .eq('file_id', fileId);

    // Set headers for file download
    res.setHeader('Content-Type', fileDoc.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${fileDoc.original_name}"`);
    res.setHeader('Content-Length', fileDoc.file_size);

    // Convert file data to buffer and send
    const buffer = await fileData.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Download failed',
      message: 'An error occurred while processing the download'
    });
  }
});

module.exports = router; 