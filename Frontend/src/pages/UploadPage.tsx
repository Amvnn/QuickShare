import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, Check, Copy, Share2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import { useFileContext, UploadedFile } from '../context/FileContext';
import { uploadFile } from '../services/api';

const UploadPage: React.FC = () => {
  const { addFile } = useFileContext();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [expiryHours, setExpiryHours] = useState(24);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      handleUpload(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'text/*': ['.txt', '.md'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const response = await uploadFile(file, (progress) => {
        setUploadProgress(progress);
      });

      // Create the uploaded file object with correct field mapping based on actual backend response
      const uploadedFile: UploadedFile = {
        id: response.data.fileId,
        name: response.data.originalName, // Backend DOES have originalName
        size: response.data.fileSize,
        type: response.data.mimeType, // Backend DOES have mimeType
        mimeType: response.data.mimeType, // Backend DOES have mimeType
        downloadUrl: response.data.downloadUrl, // Backend DOES have downloadUrl
        downloadLink: response.data.downloadUrl, // For backward compatibility
        expiresAt: response.data.expiresAt ? new Date(response.data.expiresAt) : undefined,
        expiryTime: response.data.expiresAt ? new Date(response.data.expiresAt).getTime() : undefined,
        uploadDate: new Date(),
        uploadTime: Date.now(),
        downloadCount: 0
      };

      // Add to context
      addFile(uploadedFile);
      
      // Set the uploaded file for display
      setUploadedFile(uploadedFile);
      
      // Show success message
      toast.success('File uploaded successfully!');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return '📄'; // Default icon if fileType is undefined
    
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType.startsWith('video/')) {
      return '🎥';
    } else if (fileType.startsWith('audio/')) {
      return '🔊';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return '📊';
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return '📑';
    } else if (fileType.includes('zip') || fileType.includes('compressed')) {
      return '🗜️';
    }
    return '📄'; // Default icon
  };

  if (uploadedFile) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-green-600" />
              </motion.div>

              <h1 className="text-3xl font-bold text-center mb-2">Upload Successful!</h1>
              <p className="text-gray-600 text-center mb-8">Your file is ready to share</p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{getFileIcon(uploadedFile.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{uploadedFile.name}</h3>
                    <p className="text-gray-600">{formatFileSize(uploadedFile.size)} • {uploadedFile.type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Expires in {expiryHours} hours</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <code className="flex-1 text-sm text-gray-800 break-all">
                      {uploadedFile.downloadUrl || uploadedFile.downloadLink}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(uploadedFile.downloadUrl || uploadedFile.downloadLink || '')}
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => copyToClipboard(uploadedFile.downloadUrl || uploadedFile.downloadLink || '')}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const downloadUrl = uploadedFile.downloadUrl || uploadedFile.downloadLink || '';
                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                          `Check out this file I shared via QuickShare: ${downloadUrl}`
                        )}`;
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="flex-1"
                    >
                      <Share2 className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  setUploadedFile(null);
                  setUploadProgress(0);
                }}
                variant="secondary"
                className="w-full"
              >
                Upload Another File
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Get dropzone props and separate the ref to avoid conflicts
  const { ref, ...dropzoneProps } = getRootProps();

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
                Upload & Share
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Drag and drop your file or click to browse
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div
                ref={ref}
                {...dropzoneProps}
                className={`relative border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer
                  transition-all duration-300 bg-white/50 backdrop-blur-sm
                  ${isDragActive ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'}`}
              >
                <input {...getInputProps()} />
                
                <motion.div
                  animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                  className="mb-8"
                >
                  <Upload className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                </motion.div>

                {isDragActive ? (
                  <div>
                    <h3 className="text-2xl font-bold text-blue-600 mb-2">
                      Drop your file here
                    </h3>
                    <p className="text-blue-500">Release to upload</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Drop files to upload
                    </h3>
                    <p className="text-gray-600 mb-4">or click to browse from your device</p>
                    <div className="flex justify-center">
                      <Button size="lg">Choose File</Button>
                    </div>
                  </div>
                )}

                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="w-32 h-32 relative mx-auto mb-6">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-200"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - uploadProgress / 100)}`}
                            className="text-blue-500 transition-all duration-300"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-blue-600">
                            {Math.round(uploadProgress)}%
                          </span>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-gray-800">Uploading...</p>
                      <p className="text-gray-600">Please wait while we upload your file</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Expiry Settings</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Time (hours)
                    </label>
                    <select
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>1 hour</option>
                      <option value={6}>6 hours</option>
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={48}>48 hours</option>
                      <option value={72}>72 hours</option>
                      <option value={168}>1 week</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <span>File Restrictions</span>
                </h3>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Maximum file size:</span>
                    <span className="font-semibold">50 MB</span>
                  </div>
                  <div className="border-t pt-3">
                    <p className="font-medium mb-2">Supported formats:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <span>• Images (PNG, JPG, GIF)</span>
                      <span>• Videos (MP4, AVI, MOV)</span>
                      <span>• Audio (MP3, WAV)</span>
                      <span>• Documents (PDF, DOC)</span>
                      <span>• Spreadsheets (XLS)</span>
                      <span>• Archives (ZIP, RAR)</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;