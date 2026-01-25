/**
 * File Validation Utilities
 * 
 * Shared validation logic for file uploads across the application.
 * Ensures consistent file size limits and type checking.
 */

/**
 * Maximum file size in bytes (10MB)
 * Reasonable limit for mobile devices and receipt images
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Maximum file size in human-readable format
 */
export const MAX_FILE_SIZE_MB = 10;

/**
 * Allowed MIME types for receipt uploads
 */
export const ALLOWED_RECEIPT_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'application/pdf'
];

/**
 * MIME type to file extension mapping
 */
export const MIME_TO_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf'
};

/**
 * Validates file size
 * 
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateFileSize = (file) => {
  if (!file) {
    return { valid: false, error: 'Keine Datei ausgewählt.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `Datei zu groß (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximalgröße: ${MAX_FILE_SIZE_MB} MB.`
    };
  }

  return { valid: true, error: null };
};

/**
 * Validates file type
 * 
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateFileType = (file) => {
  if (!file) {
    return { valid: false, error: 'Keine Datei ausgewählt.' };
  }

  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Ungültiges Dateiformat. Nur Bilder (JPG, PNG, GIF, WebP) oder PDF erlaubt.'
    };
  }

  return { valid: true, error: null };
};

/**
 * Validates both file size and type
 * 
 * @param {File} file - The file to validate
 * @returns {Object} - { valid: boolean, error: string|null, extension: string|null }
 */
export const validateFile = (file) => {
  // Validate file exists
  if (!file) {
    return { valid: false, error: 'Keine Datei ausgewählt.', extension: null };
  }

  // Validate file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.valid) {
    return { valid: false, error: typeValidation.error, extension: null };
  }

  // Validate file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) {
    return { valid: false, error: sizeValidation.error, extension: null };
  }

  // Get file extension from MIME type
  const extension = MIME_TO_EXTENSION[file.type] || 'jpg';

  return { valid: true, error: null, extension };
};

/**
 * Formats file size to human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
