const express = require('express');
// const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Add this after creating the Supabase client
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Log Supabase connection
console.log('✅ Connected to Supabase:', process.env.SUPABASE_URL);

// Middleware - Restrict CORS to specific origins in production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || [] 
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR)));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'File Sharing API with Expiry Links',
    version: '1.0.0',
    endpoints: {
      upload: 'POST /upload',
      download: 'GET /download/:fileId',
      status: 'GET /status/:fileId'
    }
  });
});

// Import routes
const uploadRoutes = require('./src/routes/upload');
const downloadRoutes = require('./src/routes/download');
const statusRoutes = require('./src/routes/status');

// Use routes
app.use('/upload', uploadRoutes);
app.use('/download', downloadRoutes);
app.use('/status', statusRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});