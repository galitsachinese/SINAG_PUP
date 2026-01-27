/**
 * API Configuration Helper
 * Centralized place to manage API base URL for both development and production
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getApiUrl = (endpoint) => {
  // If endpoint already has /api, don't add it again
  if (endpoint.startsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  // Otherwise, construct full URL
  return `${API_BASE_URL}/api${endpoint}`;
};

export const getUploadUrl = (filePath) => {
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${filePath}`;
};

export default API_BASE_URL;
