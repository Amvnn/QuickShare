import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  mimeType?: string;
  expiryTime?: number;
  expiresAt?: Date | string;
  downloadLink?: string;
  downloadUrl?: string;
  uploadTime?: number;
  uploadDate?: Date;
  downloadCount: number;
  lastModified?: number;
  lastModifiedDate?: string;
  filePath?: string;
}

interface FileContextType {
  uploadedFiles: UploadedFile[];
  addFile: (file: UploadedFile) => void;
  getFile: (id: string) => UploadedFile | undefined;
  updateFileDownloadCount: (id: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const addFile = (file: UploadedFile) => {
    const fileWithMetadata = {
      ...file,
      lastModified: file.lastModified || Date.now(),
      lastModifiedDate: file.lastModifiedDate || new Date().toISOString(),
      filePath: file.filePath || 'default/path'
    };
    setUploadedFiles(prev => [fileWithMetadata, ...prev]);
  };

  const getFile = (id: string) => {
    return uploadedFiles.find(file => file.id === id);
  };

  const updateFileDownloadCount = (id: string) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === id 
          ? { ...file, downloadCount: file.downloadCount + 1 }
          : file
      )
    );
  };

  return (
    <FileContext.Provider value={{ uploadedFiles, addFile, getFile, updateFileDownloadCount }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
};