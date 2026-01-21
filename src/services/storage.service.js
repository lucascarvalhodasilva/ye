/**
 * Storage Service
 * Handles all file system operations using Capacitor Filesystem
 */

import { Filesystem, Directory } from '@capacitor/filesystem';
import { FILE_PATHS } from '@/constants';

/**
 * Save a file to the receipts directory
 * @param {string} fileName - Name of the file
 * @param {string} data - Base64 encoded data
 * @returns {Promise<string>} Path to saved file
 */
export const saveReceipt = async (fileName, data) => {
  try {
    const result = await Filesystem.writeFile({
      path: `${FILE_PATHS.RECEIPTS}/${fileName}`,
      data,
      directory: Directory.Documents,
      recursive: true
    });
    return result.uri;
  } catch (error) {
    console.error('Error saving receipt:', error);
    throw error;
  }
};

/**
 * Read a receipt file
 * @param {string} fileName - Name of the file
 * @returns {Promise<string>} Base64 encoded data
 */
export const readReceipt = async (fileName) => {
  try {
    const result = await Filesystem.readFile({
      path: `${FILE_PATHS.RECEIPTS}/${fileName}`,
      directory: Directory.Documents
    });
    return result.data;
  } catch (error) {
    console.error('Error reading receipt:', error);
    throw error;
  }
};

/**
 * Delete a receipt file
 * @param {string} fileName - Name of the file
 * @returns {Promise<void>}
 */
export const deleteReceipt = async (fileName) => {
  if (!fileName) return;

  try {
    await Filesystem.deleteFile({
      path: `${FILE_PATHS.RECEIPTS}/${fileName}`,
      directory: Directory.Documents
    });
  } catch (error) {
    console.warn(`Failed to delete receipt ${fileName}:`, error);
  }
};

/**
 * Check if a receipt file exists
 * @param {string} fileName - Name of the file
 * @returns {Promise<boolean>}
 */
export const receiptExists = async (fileName) => {
  try {
    await Filesystem.stat({
      path: `${FILE_PATHS.RECEIPTS}/${fileName}`,
      directory: Directory.Documents
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * List all receipt files
 * @returns {Promise<string[]>} Array of file names
 */
export const listReceipts = async () => {
  try {
    const result = await Filesystem.readdir({
      path: FILE_PATHS.RECEIPTS,
      directory: Directory.Documents
    });
    return result.files.map(f => f.name);
  } catch {
    return [];
  }
};
