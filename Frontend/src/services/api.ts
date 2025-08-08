// src/services/api.ts

// Base URL for our backend - we'll make this configurable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
}

// Corrected interface based on your actual backend response
export interface UploadResponse {
  success: boolean;
  data: {
    fileId: string;
    originalName: string;    // Backend DOES have originalName
    fileSize: number;
    mimeType: string;        // Backend DOES have mimeType
    downloadUrl: string;     // Backend DOES have downloadUrl
    expiresAt: string;
    expiresInHours: number;  // Additional field from backend
  };
  message?: string;
}

// File upload function
export async function uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    console.log('📤 Starting file upload...', file.name, file.size);
    const formData = new FormData();
    formData.append('file', file);
  
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log(`📊 Upload progress: ${progress}%`);
          onProgress(progress);
        }
      };
  
      xhr.onload = () => {
        console.log('✅ Upload complete', xhr.status, xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            console.error('Error parsing response:', e);
            reject(new Error('Invalid server response'));
          }
        } else {
          console.error('Upload failed:', xhr.statusText);
          reject(new Error('Upload failed: ' + xhr.statusText));
        }
      };
  
      xhr.onerror = () => {
        console.error('❌ Network error during upload');
        reject(new Error('Network error during upload'));
      };
      
      const url = `${API_BASE_URL}/upload`;
      console.log('🌐 Sending request to:', url);
      xhr.open('POST', url, true);
      xhr.send(formData);
    });
}

// Download file function
export async function downloadFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/download/${fileId}`, {
      method: 'GET',
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Download failed');
    }
  
    return response.blob();
}
  
// Helper function to trigger file download in the browser
export function triggerDownload(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

// File status interface - Updated to potentially match backend response
export interface FileStatus {
    success: boolean;
    data: {
      fileId: string;
      originalName?: string;   // Backend might have originalName
      fileName?: string;       // Or fileName
      fileSize: number;
      mimeType?: string;       // Backend might have mimeType  
      fileType?: string;       // Or fileType
      downloadUrl?: string;    // Backend might have downloadUrl
      downloadLink?: string;   // Or downloadLink
      expiresAt: string;
      timeRemaining?: number;  // in hours
      isExpired?: boolean;
      expiresInHours?: number;
    };
    message?: string;
}
  
// Check file status
export async function checkFileStatus(fileId: string): Promise<FileStatus> {
    console.log('🔍 Checking file status for:', fileId);
    const response = await fetch(`${API_BASE_URL}/status/${fileId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const result = await handleResponse<FileStatus>(response);
    console.log('📊 File status result:', result);
    return result;
}

// Get file info for download page  
export async function getFileInfo(fileId: string): Promise<FileStatus> {
    console.log('📄 Getting file info for:', fileId);
    
    // Try the file info endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/file/${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await handleResponse<FileStatus>(response);
        console.log('📄 File info result:', result);
        return result;
      }
    } catch (error) {
      console.log('File info endpoint failed, trying status endpoint');
    }

    // Fall back to status endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/status/${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('File not found or has expired');
        }
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to get file info');
      }

      const result = await handleResponse<FileStatus>(response);
      console.log('📄 File status result:', result);
      return result;
    } catch (error) {
      console.error('Both file info and status endpoints failed:', error);
      throw error;
    }
}