import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, Download, CheckCircle, XCircle, BarChart3, FileX } from 'lucide-react';
import Button from '../components/Button';
import { useFileContext } from '../context/FileContext';

interface FileStatus {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadTime: number;
  expiryTime: number;
  downloadCount: number;
  isActive: boolean;
  lastDownload?: number;
}

const StatusPage: React.FC = () => {
  const { uploadedFiles, getFile } = useFileContext();
  const [fileId, setFileId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileStatus, setFileStatus] = useState<FileStatus | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!fileId.trim()) return;

    setLoading(true);
    setNotFound(false);
    setFileStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // First check if file exists in context
      const contextFile = getFile(fileId);
      if (contextFile) {
        setFileStatus({
          id: contextFile.id,
          name: contextFile.name,
          size: contextFile.size,
          type: contextFile.type,
          uploadTime: contextFile.uploadTime,
          expiryTime: contextFile.expiryTime,
          downloadCount: contextFile.downloadCount,
          isActive: contextFile.expiryTime > Date.now(),
          lastDownload: contextFile.downloadCount > 0 ? Date.now() - 1800000 : undefined,
        });
        setLoading(false);
        return;
      }

      // Mock responses based on input
      if (fileId === 'expired' || fileId === 'demo') {
        setFileStatus({
          id: fileId,
          name: fileId === 'expired' ? 'expired-document.pdf' : 'sample-presentation.pptx',
          size: fileId === 'expired' ? 2048576 : 10485760,
          type: fileId === 'expired' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          uploadTime: Date.now() - (fileId === 'expired' ? 172800000 : 3600000), // 2 days ago or 1 hour ago
          expiryTime: Date.now() - (fileId === 'expired' ? 86400000 : -82800000), // 1 day ago or 23 hours from now
          downloadCount: fileId === 'expired' ? 8 : 3,
          isActive: fileId !== 'expired',
          lastDownload: fileId === 'expired' ? Date.now() - 90000000 : Date.now() - 1800000, // 25 hours ago or 30 minutes ago
        });
      } else if (fileId === 'invalid' || fileId.length < 3) {
        setNotFound(true);
      } else {
        // Default active file
        setFileStatus({
          id: fileId,
          name: 'my-awesome-file.zip',
          size: 15728640, // 15MB
          type: 'application/zip',
          uploadTime: Date.now() - 7200000, // 2 hours ago
          expiryTime: Date.now() + 79200000, // 22 hours from now
          downloadCount: 5,
          isActive: true,
          lastDownload: Date.now() - 900000, // 15 minutes ago
        });
      }
    } catch (error) {
      setNotFound(true);
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

  const formatTimeLeft = (expiryTime: number) => {
    const now = Date.now();
    const remaining = expiryTime - now;
    
    if (remaining <= 0) return 'Expired';

    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);

    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('presentation')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                File Status
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Check your file's download activity and time remaining
            </p>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter File ID
                </label>
                <input
                  type="text"
                  value={fileId}
                  onChange={(e) => setFileId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="e.g., abc123def456 (try: demo, expired, invalid)"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <div className="md:self-end">
                <Button
                  onClick={handleSearch}
                  loading={loading}
                  size="lg"
                  className="w-full md:w-auto px-8"
                >
                  <Search className="w-5 h-5" />
                  Check Status
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>💡 Try these sample IDs: <code className="bg-gray-100 px-2 py-1 rounded">demo</code> (active), 
              <code className="bg-gray-100 px-2 py-1 rounded mx-1">expired</code> (expired), 
              <code className="bg-gray-100 px-2 py-1 rounded">invalid</code> (not found)</p>
              {uploadedFiles.length > 0 && (
                <p className="mt-2">Or try one of your uploaded file IDs: {uploadedFiles.slice(0, 3).map(file => (
                  <code key={file.id} className="bg-gray-100 px-2 py-1 rounded mx-1">{file.id}</code>
                ))}</p>
              )}
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Searching for your file...</p>
            </motion.div>
          )}

          {/* Not Found State */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileX className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">File Not Found</h3>
              <p className="text-gray-600 mb-6">
                Invalid File ID or the file no longer exists. Please check your File ID and try again.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setNotFound(false);
                  setFileId('');
                }}
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {/* File Status Results */}
          {fileStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{getFileIcon(fileStatus.type)}</div>
                  <div>
                    <h3 className="text-2xl font-bold">{fileStatus.name}</h3>
                    <p className="text-gray-600">{formatFileSize(fileStatus.size)} • Uploaded {formatTimeAgo(fileStatus.uploadTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileStatus.isActive ? (
                    <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-red-100 px-4 py-2 rounded-full">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-red-700">Expired</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 text-center"
                >
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-blue-600 font-medium mb-1">TIME REMAINING</p>
                  <p className={`text-2xl font-bold ${fileStatus.isActive ? 'text-blue-700' : 'text-red-600'}`}>
                    {formatTimeLeft(fileStatus.expiryTime)}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 text-center"
                >
                  <Download className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <p className="text-sm text-purple-600 font-medium mb-1">TOTAL DOWNLOADS</p>
                  <p className="text-2xl font-bold text-purple-700">{fileStatus.downloadCount}</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 text-center"
                >
                  <BarChart3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-green-600 font-medium mb-1">LAST DOWNLOAD</p>
                  <p className="text-2xl font-bold text-green-700">
                    {fileStatus.lastDownload ? formatTimeAgo(fileStatus.lastDownload) : 'Never'}
                  </p>
                </motion.div>
              </div>

              {/* File Details */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-semibold mb-4">File Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File ID:</span>
                    <code className="font-mono bg-gray-200 px-2 py-1 rounded">{fileStatus.id}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">File Type:</span>
                    <span className="font-medium">{fileStatus.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upload Date:</span>
                    <span className="font-medium">{new Date(fileStatus.uploadTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expires On:</span>
                    <span className="font-medium">{new Date(fileStatus.expiryTime).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {fileStatus.isActive && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={() => window.open(`/download/${fileStatus.id}`, '_blank')}
                    size="lg"
                  >
                    <Download className="w-5 h-5" />
                    Download File
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StatusPage;