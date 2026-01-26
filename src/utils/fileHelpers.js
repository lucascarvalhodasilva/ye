/**
 * File Helper Utilities
 * 
 * Helper functions for file type detection and MIME type mapping.
 */

/**
 * Extracts the file extension from a filename
 * 
 * @param {string} fileName - The filename to analyze
 * @returns {string} - The lowercase file extension without the dot, or empty string if no extension
 */
export const getFileExtension = (fileName) => {
  if (!fileName || typeof fileName !== 'string') return '';
  
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === fileName.length - 1) {
    return '';
  }
  
  return fileName.slice(lastDotIndex + 1).toLowerCase();
};

/**
 * Gets the MIME type from a filename based on its extension
 * 
 * @param {string} fileName - The filename to analyze
 * @returns {string} - The MIME type (e.g., 'application/pdf', 'image/jpeg')
 */
export const getMimeType = (fileName) => {
  const ext = getFileExtension(fileName);
  
  if (ext === 'pdf') return 'application/pdf';
  if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  
  return 'image/jpeg'; // Default fallback
};

/**
 * Gets the file type category from a filename based on its extension
 * 
 * @param {string} fileName - The filename to analyze
 * @returns {string} - The file type ('pdf' or 'image')
 */
export const getFileType = (fileName) => {
  const ext = getFileExtension(fileName);
  
  if (ext === 'pdf') return 'pdf';
  
  return 'image'; // Default to image for all other types
};

/**
 * Converts base64 string to Uint8Array for PDF rendering
 * 
 * @param {string} base64 - The base64 string (with or without data URI prefix)
 * @returns {Uint8Array} - The converted byte array
 */
export const base64ToUint8Array = (base64) => {
  const cleaned = base64.replace(/^data:application\/pdf;base64,/, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};
