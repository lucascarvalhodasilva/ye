/**
 * Export Service
 * Handles data export and backup operations
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import JSZip from 'jszip';

/**
 * Export all app data as JSON
 * @param {Object} data - All app data to export
 * @returns {Promise<string>} JSON string
 */
export const exportToJSON = async (data) => {
  const exportData = {
    ...data,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import data from JSON
 * @param {string} jsonString - JSON string to import
 * @returns {Object} Parsed data
 */
export const importFromJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error('Invalid JSON format');
  }
};

/**
 * Create a backup ZIP file with data and receipts
 * @param {Object} data - App data
 * @param {string[]} receiptFiles - Array of receipt file names
 * @returns {Promise<Blob>} ZIP file as Blob
 */
export const createBackupZip = async (data, receiptFiles = []) => {
  const zip = new JSZip();
  
  // Add data JSON
  zip.file('data.json', JSON.stringify(data, null, 2));
  
  // Add receipts folder
  const receiptsFolder = zip.folder('receipts');
  
  for (const fileName of receiptFiles) {
    try {
      const file = await Filesystem.readFile({
        path: `receipts/${fileName}`,
        directory: Directory.Documents
      });
      receiptsFolder.file(fileName, file.data, { base64: true });
    } catch (error) {
      console.warn(`Could not add receipt ${fileName} to backup:`, error);
    }
  }
  
  return await zip.generateAsync({ type: 'blob' });
};

/**
 * Share a file using native share
 * @param {string} title - Share dialog title
 * @param {string} filePath - Path to file to share
 * @returns {Promise<void>}
 */
export const shareFile = async (title, filePath) => {
  try {
    await Share.share({
      title,
      url: filePath,
      dialogTitle: title
    });
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
};
