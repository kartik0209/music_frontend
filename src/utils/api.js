import axios from 'axios';
import { message } from 'antd';

// Base URL - adjust according to your backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout for large file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For file uploads, don't set content-type (let browser set it with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle different error scenarios
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Bad request - validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              message.error(err.msg || err.message || 'Validation error');
            });
          } else {
            message.error(data.message || 'Bad request');
          }
          break;
          
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          message.error('Session expired. Please login again.');
          // You might want to redirect to login page here
          // window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          message.error('You don\'t have permission to perform this action');
          break;
          
        case 404:
          // Not found
          message.error(data.message || 'Resource not found');
          break;
          
        case 409:
          // Conflict
          message.error(data.message || 'Resource already exists');
          break;
          
        case 413:
          // Payload too large
          message.error('File too large. Please choose a smaller file.');
          break;
          
        case 429:
          // Too many requests
          message.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          // Internal server error
          message.error('Server error. Please try again later.');
          break;
          
        default:
          message.error(data.message || `Error ${status}: Something went wrong`);
      }
    } else if (error.request) {
      // Network error
      message.error('Network error. Please check your connection.');
    } else {
      // Something else
      message.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common API operations
export const apiHelpers = {
  // Upload file with progress tracking
  uploadFile: async (endpoint, formData, onUploadProgress) => {
    try {
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get with query parameters
  getWithParams: async (endpoint, params = {}) => {
    try {
      // Remove undefined/null values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v != null && v !== '')
      );
      
      const response = await api.get(endpoint, { params: cleanParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Batch operations
  batchOperation: async (operations) => {
    try {
      const results = await Promise.allSettled(operations);
      return results;
    } catch (error) {
      throw error;
    }
  },

  // Download file
  downloadFile: async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use provided filename
      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Retry mechanism for failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
        
        // Wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      throw error;
    }
  }
};

// Songs API endpoints
export const songsAPI = {
  // Get all songs with filters
  getSongs: (params = {}) => apiHelpers.getWithParams('/songs', params),
  
  // Get single song
  getSong: (id) => api.get(`/songs/${id}`),
  
  // Create new song
  createSong: (formData, onUploadProgress) => 
    apiHelpers.uploadFile('/songs', formData, onUploadProgress),
  
  // Update song
  updateSong: (id, formData, onUploadProgress) => 
    apiHelpers.uploadFile(`/songs/${id}`, formData, onUploadProgress),
  
  // Delete song
  deleteSong: (id) => api.delete(`/songs/${id}`),
  
  // Toggle featured status
  toggleFeatured: (id) => api.put(`/songs/${id}/featured`),
  
  // Get trending songs
  getTrending: (limit = 20) => api.get('/songs/trending', { params: { limit } }),
  
  // Get featured songs
  getFeatured: (limit = 20) => api.get('/songs/featured', { params: { limit } }),
  
  // Search songs
  searchSongs: (query, filters = {}) => 
    apiHelpers.getWithParams('/songs', { search: query, ...filters }),
  
  // Get songs by artist
  getSongsByArtist: (artist, params = {}) => 
    apiHelpers.getWithParams(`/songs/artist/${encodeURIComponent(artist)}`, params),
  
  // Play song (increment play count)
  playSong: (id) => api.post(`/songs/${id}/play`),
  
  // Like/unlike song
  likeSong: (id) => api.post(`/songs/${id}/like`),
  
  // Get user recommendations
  getRecommendations: (limit = 20) => 
    api.get('/songs/user/recommendations', { params: { limit } }),
  
  // Get user's liked songs
  getLikedSongs: (params = {}) => 
    apiHelpers.getWithParams('/songs/user/liked', params),
  
  // Get listening history
  getListeningHistory: (params = {}) => 
    apiHelpers.getWithParams('/songs/user/history', params),
  
  // Download song
  downloadSong: (id) => api.get(`/songs/${id}/download`)
};

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

// Users API endpoints
export const usersAPI = {
  getUsers: (params = {}) => apiHelpers.getWithParams('/users', params),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  updateProfile: (formData) => apiHelpers.uploadFile('/users/profile', formData),
  changePassword: (passwords) => api.put('/users/change-password', passwords),
  getUserStats: (id) => api.get(`/users/${id}/stats`),
  
  // Favorites API
  getFavorites: () => api.get('/users/favorites'),
  addToFavorites: (songId) => api.post(`/users/favorites/${songId}`),
  removeFromFavorites: (songId) => api.delete(`/users/favorites/${songId}`)
};

// Admin API endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getSystemInfo: () => api.get('/admin/system-info'),
  getAuditLogs: (params = {}) => apiHelpers.getWithParams('/admin/audit-logs', params),
  backupData: () => api.post('/admin/backup'),
  exportData: (type, params = {}) => 
    apiHelpers.downloadFile(`/admin/export/${type}`, `${type}-export.csv`),
  
  // Bulk operations
  bulkDeleteSongs: (songIds) => api.delete('/admin/songs/bulk', { data: { ids: songIds } }),
  bulkUpdateSongs: (songIds, updates) => 
    api.put('/admin/songs/bulk', { ids: songIds, updates }),
  bulkDeleteUsers: (userIds) => api.delete('/admin/users/bulk', { data: { ids: userIds } }),
  bulkUpdateUsers: (userIds, updates) => 
    api.put('/admin/users/bulk', { ids: userIds, updates })
};

// Streaming API endpoints
export const streamingAPI = {
  // Get stream URL for a song
  getStreamUrl: async (id) => {
    const response = await api.get(`/stream/audio/${id}`);
    return response.data;
  },
  
  // Report song completion
  reportCompletion: (id, data) => api.post(`/stream/complete/${id}`, data),
  
  // Get streaming stats
  getStreamingStats: () => api.get('/stream/stats')
};

// Utility functions for file handling
export const fileUtils = {
  // Validate audio file
  validateAudioFile: (file) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg'];
    const validExtensions = ['mp3', 'wav', 'flac', 'm4a', 'ogg'];
    
    const isValidType = validTypes.includes(file.type) || 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      return { valid: false, error: 'Invalid file type. Please upload MP3, WAV, FLAC, M4A, or OGG files.' };
    }
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 100MB.' };
    }
    
    return { valid: true };
  },

  // Validate image file
  validateImageFile: (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, or WebP files.' };
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }
    
    return { valid: true };
  },

  // Get audio duration
  getAudioDuration: (file) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.floor(audio.duration));
        URL.revokeObjectURL(url);
      });
      
      audio.addEventListener('error', () => {
        reject(new Error('Failed to load audio file'));
        URL.revokeObjectURL(url);
      });
      
      audio.src = url;
    });
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generate thumbnail for image
  generateImageThumbnail: (file, maxWidth = 300, maxHeight = 300, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and convert to blob
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
};

export default api;