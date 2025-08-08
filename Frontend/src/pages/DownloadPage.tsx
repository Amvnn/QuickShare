import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Clock, FileX, AlertTriangle, Home, Sparkles } from 'lucide-react';
import Button from '../components/Button';
import { useFileContext } from '../context/FileContext';
import { getFileInfo, downloadFile, triggerDownload } from '../services/api';

interface FileData {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType: string;
  expiryTime: number;
  expiresAt: Date;
  downloadCount: number;
  downloadUrl: string;
  exists: boolean;
  expired: boolean;
  timeRemaining?: number;
}

const DownloadPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const { getFile, updateFileDownloadCount } = useFileContext();
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [confetti, setConfetti] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchFileData = async () => {
      if (!fileId) {
        setError('No file ID provided');
        setLoading(false);
        return;
      }

      try {
        setError('');
        
        // First check if file exists in context
        const contextFile = getFile(fileId);
        if (contextFile) {
          console.log('Found file in context:', contextFile);
          
          const expiresAt = contextFile.expiresAt || (contextFile.expiryTime ? new Date(contextFile.expiryTime) : new Date());
          const isExpired = new Date() > expiresAt;
          
          setFileData({
            id: contextFile.id,
            name: contextFile.name,
            size: contextFile.size,
            type: contextFile.type || contextFile.mimeType || '',
            mimeType: contextFile.mimeType || contextFile.type || '',
            expiryTime: expiresAt.getTime(),
            expiresAt: expiresAt,
            downloadCount: contextFile.downloadCount || 0,
            downloadUrl: contextFile.downloadUrl || contextFile.downloadLink || '',
            exists: true,
            expired: isExpired,
          });
          setLoading(false);
          return;
        }
        
        // If not in context, fetch from backend API
        console.log('Fetching file info from backend for ID:', fileId);
        const response = await getFileInfo(fileId);
        
        if (response.success && response.data) {
          const data = response.data;
          const expiresAt = new Date(data.expiresAt);
          const isExpired = data.isExpired || new Date() > expiresAt;
          
          setFileData({
            id: data.fileId,
            name: data.originalName || data.fileName || 'Unknown File',
            size: data.fileSize,
            type: data.mimeType || data.fileType || 'application/octet-stream',
            mimeType: data.mimeType || data.fileType || 'application/octet-stream',
            expiryTime: expiresAt.getTime(),
            expiresAt: expiresAt,
            downloadCount: 0, // Backend doesn't return download count in file info
            downloadUrl: data.downloadUrl || data.downloadLink || '',
            exists: true,
            expired: isExpired,
            timeRemaining: data.timeRemaining,
          });
        } else {
          // File not found
          setFileData({
            id: fileId,
            name: '',
            size: 0,
            type: '',
            mimeType: '',
            expiryTime: 0,
            expiresAt: new Date(),
            downloadCount: 0,
            downloadUrl: '',
            exists: false,
            expired: false,
          });
        }
      } catch (error) {
        console.error('Failed to fetch file data:', error);
        
        if (error instanceof Error) {
          if (error.message.includes('not found') || error.message.includes('expired')) {
            setFileData({
              id: fileId,
              name: '',
              size: 0,
              type: '',
              mimeType: '',
              expiryTime: 0,
              expiresAt: new Date(),
              downloadCount: 0,
              downloadUrl: '',
              exists: false,
              expired: error.message.includes('expired'),
            });
          } else {
            setError(error.message);
          }
        } else {
          setError('Failed to load file information');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFileData();
  }, [fileId, getFile]);

  useEffect(() => {
    if (fileData && !fileData.expired && fileData.exists) {
      const updateTimeLeft = () => {
        const now = Date.now();
        const remaining = fileData.expiryTime - now;
        
        if (remaining <= 0) {
          setTimeLeft('Expired');
          setFileData(prev => prev ? { ...prev, expired: true } : null);
          return;
        }

        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [fileData]);

  const handleDownload = async () => {
    if (!fileData || fileData.expired || !fileData.exists || !fileId) return;

    setDownloading(true);
    
    try {
      console.log('Starting download for file:', fileId);
      
      // Download file from backend
      const blob = await downloadFile(fileId);
      
      // Trigger browser download
      triggerDownload(blob, fileData.name);
      
      // Trigger confetti animation
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
      
      // Update download count locally
      setFileData(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null);
      
      // Update context if file exists there
      updateFileDownloadCount(fileId);
      
      console.log('File download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      alert(error instanceof Error ? error.message : 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string | undefined) => {
    // Add proper null/undefined checks
    if (!type || typeof type !== 'string') {
      return '📁'; // Default icon
    }

    const lowerType = type.toLowerCase();
    
    if (lowerType.startsWith('image/')) return '🖼️';
    if (lowerType.startsWith('video/')) return '🎥';
    if (lowerType.startsWith('audio/')) return '🎵';
    if (lowerType.includes('pdf')) return '📄';
    if (lowerType.includes('word') || lowerType.includes('document')) return '📝';
    if (lowerType.includes('excel') || lowerType.includes('spreadsheet')) return '📊';
    if (lowerType.includes('zip') || lowerType.includes('rar')) return '📦';
    return '📁';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading file information...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold mb-4">Error Loading File</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error}
            </p>
            
            <div className="space-y-4">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Link to="/download">
                <Button variant="secondary" className="w-full">
                  Search Another File
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!fileData || !fileData.exists) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <FileX className="w-10 h-10 text-red-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold mb-4">File Not Found</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The file you're looking for doesn't exist or may have been removed. Please check the link and try again.
            </p>
            
            <div className="space-y-4">
              <Link to="/download">
                <Button className="w-full">Search Another File</Button>
              </Link>
              <Link to="/upload">
                <Button variant="secondary" className="w-full">Upload New File</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Downloaded via QuickShare – Built under Arvana
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (fileData.expired) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-10 h-10 text-amber-600" />
            </motion.div>
            
            <h1 className="text-2xl font-bold mb-4">File Expired</h1>
            <p className="text-gray-600 mb-2">
              <strong>{fileData.name || 'Unknown File'}</strong>
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              This file has expired and is no longer available for download. 
              Please ask the sender to upload it again.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">File size:</span>
                <span className="font-medium">{formatFileSize(fileData.size)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">File type:</span>
                <span className="font-medium">{fileData.mimeType || 'Unknown'}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link to="/upload">
                <Button className="w-full">Upload New File</Button>
              </Link>
              <Link to="/download">
                <Button variant="secondary" className="w-full">Search Another File</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Downloaded via QuickShare – Built under Arvana
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      {/* Confetti Animation */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                y: -100,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                scale: Math.random() * 0.8 + 0.2,
                rotate: 0,
              }}
              animate={{
                opacity: 0,
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2,
              }}
              className={`absolute w-3 h-3 ${
                ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-500', 'bg-green-500'][i % 5]
              }`}
              style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                {getFileIcon(fileData.type)}
              </div>
              <h1 className="text-3xl font-bold mb-2">Ready to Download</h1>
              <p className="text-gray-600">Your file is ready and waiting for you</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{fileData.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>{formatFileSize(fileData.size)}</span>
                    <span>•</span>
                    <span>{fileData.mimeType}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Time Left</p>
                  <p className="font-bold text-blue-600">{timeLeft}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  </motion.div>
                  <p className="text-sm text-gray-600">Downloads</p>
                  <motion.p
                    key={fileData.downloadCount}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="font-bold text-purple-600"
                  >
                    {fileData.downloadCount}
                  </motion.p>
                </div>
              </div>

              <Button
                onClick={handleDownload}
                loading={downloading}
                size="lg"
                className="w-full text-lg"
                disabled={downloading}
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Downloading...' : 'Download File'}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center space-y-4"
            >
              <Link to="/upload">
                <Button variant="secondary" size="lg" className="w-full">
                  Upload Your Own File
                </Button>
              </Link>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Downloaded via QuickShare – Built under Arvana
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DownloadPage;