const fs = require('fs');
const path = require('path');
const File = require('../models/File');

class CleanupService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
  }

  // Find and delete expired files
  async cleanupExpiredFiles() {
    try {
      console.log('Starting cleanup of expired files...');
      
      // Find all expired files in the database
      const expiredFiles = await File.find({
        expiresAt: { $lt: new Date() }
      });

      console.log(`Found ${expiredFiles.length} expired files to cleanup`);

      let deletedCount = 0;
      let errorCount = 0;

      for (const file of expiredFiles) {
        try {
          // Construct the file path
          const filePath = path.join(this.uploadsDir, file.storagePath);
          
          // Check if file exists and delete it
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(` Deleted file: ${file.originalName}`);
            deletedCount++;
          } else {
            console.log(`File not found on disk: ${file.originalName}`);
          }

          // Delete the database record
          await File.findByIdAndDelete(file._id);
          console.log(`Deleted database record for: ${file.originalName}`);
          
        } catch (error) {
          console.error(`Error cleaning up file ${file.originalName}:`, error.message);
          errorCount++;
        }
      }

      console.log(` Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`);
      
    } catch (error) {
      console.error('Cleanup service error:', error);
    }
  }

  // Manual cleanup trigger
  async manualCleanup() {
    console.log(' Manual cleanup triggered...');
    await this.cleanupExpiredFiles();
  }
}

module.exports = new CleanupService(); 