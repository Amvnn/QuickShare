const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalName: {
    type: String,
    required: true
  },
  storagePath: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    // index: true
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// TTL index for automatic deletion of expired files
fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if file is expired
fileSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Virtual for time remaining in hours
fileSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  const remaining = this.expiresAt - now;
  return remaining > 0 ? Math.ceil(remaining / (1000 * 60 * 60)) : 0;
});

// Ensure virtuals are serialized
fileSchema.set('toJSON', { virtuals: true });
fileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('File', fileSchema); 