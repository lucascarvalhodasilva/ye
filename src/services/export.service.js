/**
 * Export Service
 * Handles data export and backup operations
 * Version: 1.0.0 - Initial release with nested transportRecords architecture
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import JSZip from 'jszip';

/**
 * Export all app data as JSON (v1.0.0 format)
 * Exports data with nested transportRecords architecture
 * @param {Object} data - All app data to export
 * @param {Array} data.trips - Trip entries with nested transportRecords
 * @param {Array} data.equipment - Equipment entries
 * @param {Array} data.expenses - Expense entries
 * @param {Object} data.settings - Application settings
 * @returns {Promise<string>} JSON string
 */
export const exportToJSON = async (data) => {
  const exportData = {
    ...data,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    format: 'fleetprotax-export-v1'
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import data from JSON
 * Supports v1.0.0 format (nested transportRecords) and legacy formats
 * @param {string} jsonString - JSON string to import
 * @returns {Object} Parsed data with nested transportRecords
 * @throws {Error} If JSON is invalid
 */
export const importFromJSON = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    // Validate it's at least a valid structure
    if (!data || typeof data !== 'object') {
      throw new Error('Data must be a valid JSON object');
    }
    return data;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    throw new Error(`Invalid JSON format: ${error.message}`);
  }
};

/**
 * Create a backup ZIP file with data and receipts (v1.0.0 format)
 * Uses nested transportRecords architecture
 * @param {Object} data - Backup data object (from BackupService.createBackupData)
 * @param {Object} data.backup - Backup metadata including version 1.0.0
 * @param {Object} data.data - App data with nested transportRecords
 * @param {Array} data.data.trips - Trips with nested transportRecords
 * @param {string[]} receiptFiles - Array of receipt file names to include
 * @returns {Promise<Blob>} ZIP file as Blob
 */
export const createBackupZip = async (data, receiptFiles = []) => {
  const zip = new JSZip();
  
  // Add backup JSON (already in v1.0.0 format from BackupService)
  zip.file('backup.json', JSON.stringify(data, null, 2));
  
  // Add receipts folder if there are receipts
  if (receiptFiles.length > 0) {
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
