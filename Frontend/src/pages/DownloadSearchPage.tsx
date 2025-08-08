import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Link as LinkIcon, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import { useFileContext } from '../context/FileContext';

const DownloadSearchPage: React.FC = () => {
  const [downloadLink, setDownloadLink] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { uploadedFiles } = useFileContext();

  const handleSearch = async () => {
    if (!downloadLink.trim()) return;

    setLoading(true);
    
    try {
      // Extract file ID from the link
      let fileId = downloadLink.trim();
      
      // Handle different link formats
      if (fileId.includes('/download/')) {
        fileId = fileId.split('/download/')[1];
      } else if (fileId.includes('/')) {
        // Extract just the ID if it's at the end of any URL
        fileId = fileId.split('/').pop() || fileId;
      }
      
      // Remove any query parameters or fragments
      fileId = fileId.split('?')[0].split('#')[0];
      
      console.log('Navigating to file ID:', fileId);
      
      // Simulate validation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate(`/download/${fileId}`);
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getFileIcon = (fileType: string | undefined) => {
    // Add null/undefined check
    if (!fileType || typeof fileType !== 'string') {
      return '📄'; // Default icon if fileType is undefined or not a string
    }
    
    const lowerType = fileType.toLowerCase();
    
    if (lowerType.startsWith('image/')) {
      return '🖼️';
    } else if (lowerType.startsWith('video/')) {
      return '🎥';
    } else if (lowerType.startsWith('audio/')) {
      return '🔊';
    } else if (lowerType === 'application/pdf') {
      return '📄';
    } else if (lowerType.includes('word') || lowerType.includes('document')) {
      return '📝';
    } else if (lowerType.includes('spreadsheet') || lowerType.includes('excel')) {
      return '📊';
    } else if (lowerType.includes('presentation') || lowerType.includes('powerpoint')) {
      return '📑';
    } else if (lowerType.includes('zip') || lowerType.includes('compressed')) {
      return '🗜️';
    }
    return '📄'; // Default icon
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Download className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Download Files
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Paste your download link to access shared files
            </p>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Download Link or File ID
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={downloadLink}
                    onChange={(e) => setDownloadLink(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="http://localhost:3000/download/abc123 or just abc123"
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              <div className="md:self-end">
                <Button
                  onClick={handleSearch}
                  loading={loading}
                  size="lg"
                  className="w-full md:w-auto px-8"
                  disabled={!downloadLink.trim()}
                >
                  <Search className="w-5 h-5" />
                  Access File
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>💡 You can paste the full download link or just the file ID</p>
            </div>
          </motion.div>

          {/* Recent Files */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h3 className="text-2xl font-bold">Your Recent Uploads</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedFiles.slice(0, 6).map((file, index) => {
                  // Get the correct properties with safe fallbacks
                  const fileType = file.mimeType || file.type || '';
                  const uploadTime = file.uploadTime || (file.uploadDate ? file.uploadDate.getTime() : Date.now());
                  const expiresAt = file.expiresAt || (file.expiryTime ? new Date(file.expiryTime) : null);
                  const downloadUrl = file.downloadUrl || file.downloadLink || '';
                  
                  return (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        console.log('Navigating to file:', file.id);
                        navigate(`/download/${file.id}`);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {getFileIcon(fileType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{file.name || 'Unknown File'}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>{formatFileSize(file.size || 0)}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(uploadTime)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-blue-600">
                            {file.downloadCount || 0} downloads
                          </div>
                          <div className="text-xs text-gray-500">
                            {!expiresAt || new Date(expiresAt) > new Date() ? 'Active' : 'Expired'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {uploadedFiles.length > 6 && (
                <div className="text-center mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/files')}
                  >
                    View All Files
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Show message when no recent files */}
          {(!uploadedFiles || uploadedFiles.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 text-center"
            >
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Recent Files</h3>
              <p className="text-gray-500">Upload some files to see them here</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate('/upload')}
              >
                Upload Your First File
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DownloadSearchPage;