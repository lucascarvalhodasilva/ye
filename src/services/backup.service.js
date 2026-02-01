/**
 * Backup Service
 * Handles backup creation, parsing, validation and import for FleetProTax
 * Version: 1.0.0 - Initial release with nested transportRecords architecture
 */

import { Capacitor } from '@capacitor/core';
import JSZip from 'jszip';

// App version - should match package.json
const APP_VERSION = '1.0.0'; // Initial release with nested transportRecords
const BACKUP_VERSION = '1.0.0'; // Matches APP_VERSION
const BACKUP_FORMAT = 'fleetprotax-backup-v1';

/**
 * Get current platform
 * @returns {string} 'android' | 'ios' | 'web'
 */
const getPlatform = () => {
  const platform = Capacitor.getPlatform();
  return platform === 'android' ? 'android' : platform === 'ios' ? 'ios' : 'web';
};

/**
 * Generate backup filename with timestamp
 * Format: FleetProTax-Backup-YYYY-MM-DD-HH-mm.zip
 * @param {Date} date - Date object for timestamp
 * @returns {string} Formatted filename
 */
export const generateFileName = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `FleetProTax-Backup-${year}-${month}-${day}-${hours}-${minutes}.zip`;
};

/**
 * Calculate metadata from backup data (v1.0.0 - nested transportRecords)
 * @param {Object} data - Backup data object
 * @param {Array} data.trips - Trips with nested transportRecords
 * @param {Array} data.equipment - Equipment entries
 * @param {Array} data.expenses - Expense entries
 * @returns {Object} Metadata object with counts and date ranges
 */
const calculateMetadata = (data) => {
  const trips = data.trips || [];
  const equipment = data.equipment || [];
  const expenses = data.expenses || [];
  
  // Count total entries including nested transportRecords
  let transportRecordsCount = 0;
  trips.forEach(trip => {
    if (trip.transportRecords && Array.isArray(trip.transportRecords)) {
      transportRecordsCount += trip.transportRecords.length;
    }
  });
  
  const totalEntries = trips.length + transportRecordsCount + equipment.length + expenses.length;
  
  // Calculate date range from all entries with dates
  const allDates = [
    ...trips.map(t => t.date).filter(Boolean),
    ...trips.map(t => t.endDate).filter(Boolean),
    ...equipment.map(e => e.date).filter(Boolean),
    ...expenses.map(e => e.date).filter(Boolean)
  ].sort();
  
  const dateRange = allDates.length > 0 ? {
    start: allDates[0],
    end: allDates[allDates.length - 1]
  } : null;
  
  // Count receipts (including nested transport receipts)
  let transportReceiptsCount = 0;
  trips.forEach(trip => {
    if (trip.transportRecords && Array.isArray(trip.transportRecords)) {
      transportReceiptsCount += trip.transportRecords.filter(t => t.receiptFileName).length;
    }
  });
  
  const receiptsCount = 
    equipment.filter(e => e.receiptFileName).length +
    expenses.filter(e => e.receiptFileName).length +
    transportReceiptsCount;
  
  return {
    totalEntries,
    dateRange,
    hasReceipts: receiptsCount > 0,
    receiptsCount
  };
};

/**
 * Create backup data structure (v1.0.0 - nested transportRecords)
 * 
 * Data Structure:
 * - trips: Array of trip objects
 *   - id, destination, date, endDate, startTime, endTime
 *   - mealAllowance: CALCULATED from departureTime to returnTime
 *   - transportRecords: NESTED array of transport entries
 *     - id, distance, date, vehicleType, allowance, receiptFileName, purpose
 *   - sumTransportAllowances: PRECOMPUTED sum of transport allowances
 * - equipment: Array of equipment purchases
 * - expenses: Array of business expenses
 * - settings: Application settings (taxRates, commute defaults, etc.)
 * 
 * @param {Object} params - Backup parameters
 * @param {Array} params.trips - Business trip entries with nested transportRecords
 * @param {Array} params.equipment - Equipment purchase entries
 * @param {Array} params.expenses - Business expense entries
 * @param {Object} params.settings - Application settings
 * @returns {Object} Backup data structure with v1.0.0 format identifier
 */
export const createBackupData = ({
  trips = [],
  equipment = [],
  expenses = [],
  settings = {}
}) => {
  const createdAt = new Date().toISOString();
  
  const backupData = {
    app: {
      name: 'FleetProTax',
      version: APP_VERSION,
      platform: getPlatform()
    },
    backup: {
      version: BACKUP_VERSION,
      createdAt,
      format: BACKUP_FORMAT
    },
    data: {
      trips,
      equipment,
      expenses,
      settings
    },
    metadata: calculateMetadata({ trips, equipment, expenses })
  };
  
  return backupData;
};

/**
 * Validate backup data structure (v1.0.0 only)
 * @param {Object} data - Parsed backup data
 * @returns {Object} { isValid: boolean, errors: string[], version: string }
 */
export const validateBackup = (data) => {
  const errors = [];
  
  if (!data) {
    errors.push('Backup-Daten sind leer oder ungültig');
    return { isValid: false, errors, version: 'unknown' };
  }
  
  // Check for backup structure
  if (!data.backup || !data.backup.version) {
    errors.push('Backup-Version fehlt');
    return { isValid: false, errors, version: 'unknown' };
  }
  
  // Get backup version
  const version = data.backup?.version;
  
  // Only accept v1.0.0
  if (version !== '1.0.0') {
    errors.push(`Inkompatible Backup-Version: ${version} (erwartet: 1.0.0)`);
  }
  
  // Check app structure
  if (!data.app || !data.app.name) {
    errors.push('App-Informationen fehlen');
  }
  
  // Check data structure
  if (!data.data) {
    errors.push('Backup enthält keine Daten');
    return { isValid: false, errors, version };
  }
  
  // Validate required data fields exist (they can be empty arrays)
  const requiredFields = ['trips', 'equipment', 'expenses', 'settings'];
  requiredFields.forEach(field => {
    if (!(field in data.data)) {
      errors.push(`Pflichtfeld fehlt: ${field}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    version
  };
};

/**
 * Parse and validate backup from JSON string
 * @param {string} jsonString - JSON backup string
 * @returns {Object} { isValid: boolean, data: Object, metadata: Object, errors: string[] }
 */
export const parseBackup = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    const validation = validateBackup(parsed);
    
    return {
      isValid: validation.isValid,
      data: parsed,
      metadata: parsed.metadata || null,
      errors: validation.errors
    };
  } catch (error) {
    return {
      isValid: false,
      data: null,
      metadata: null,
      errors: [`JSON-Parse-Fehler: ${error.message}`]
    };
  }
};

/**
 * Create backup blob for export
 * @param {Object} backupData - Backup data structure
 * @param {JSZip} [zipInstance] - Optional existing zip instance to add backup to
 * @returns {Promise<Blob>} Backup ZIP blob
 */
export const createBackupBlob = async (backupData, zipInstance = null) => {
  const zip = zipInstance || new JSZip();
  
  // Add backup.json
  zip.file('backup.json', JSON.stringify(backupData, null, 2));
  
  // Generate blob
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
};

/**
 * Main service export
 */
const BackupService = {
  generateFileName,
  createBackupData,
  validateBackup,
  parseBackup,
  createBackupBlob,
  
  // Constants
  APP_VERSION,
  BACKUP_VERSION,
  BACKUP_FORMAT
};

export default BackupService;
