const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const router = express.Router();

// Allowed MIME types
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/json',
  'application/javascript',
  'text/plain',
  'text/html',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/mp3',
  'video/mp4',
  'video/x-matroska',
  'video/x-msvideo',
  'application/octet-stream'
];

// Middleware to handle file uploads
const upload = require('multer')({
  storage: require('multer').memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB default
  },
  fileFilter: function (req, file, cb) {
    // Validate MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error(`File type '${file.mimetype}' is not allowed.`), false);
    }
    cb(null, true);
  }
});

// POST /upload - Upload a file
router.post('/', upload.single('file'), async (req, res) => {
  console.log('📤 Upload request received');
  try {
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a file to upload'
      });
    }
    
    console.log(`📄 Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
    // ... rest of your existing code ...

    // Get expiry time from request or use default
    const expiresInHours = parseInt(req.body.expiresInHours) || 
                          parseInt(process.env.DEFAULT_EXPIRY_HOURS) || 24;
    
    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Generate unique fileId and filename with better extension handling
    const fileId = uuidv4();
    const fileExtension = req.file.originalname.includes('.') 
      ? req.file.originalname.split('.').pop() 
      : '';
    const fileName = fileExtension ? `${fileId}.${fileExtension}` : fileId;

    // Upload file to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({
        error: 'Upload failed',
        message: 'Failed to upload file to storage'
      });
    }

    // Save metadata to Supabase database
    const { data: dbData, error: dbError } = await supabase
      .from('files')
      .insert({
        file_id: fileId,
        original_name: req.file.originalname,
        storage_path: fileName,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        expires_at: expiresAt.toISOString(),
        download_count: 0
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('uploads').remove([fileName]);
      return res.status(500).json({
        error: 'Upload failed',
        message: 'Failed to save file metadata'
      });
    }

    // Generate download URL
    const downloadUrl = `${process.env.BASE_URL}/download/${fileId}`;

    // Return success response
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId: fileId,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        downloadUrl: downloadUrl,
        expiresAt: expiresAt,
        expiresInHours: expiresInHours
      }
    });

    console.log(downloadUrl);

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific error types
    if (error.message && error.message.includes('File type')) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Upload failed',
      message: 'An error occurred while uploading the file'
    });
  }
});

module.exports = router; 