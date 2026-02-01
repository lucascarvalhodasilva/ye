/**
 * Application configuration constants
 */

/**
 * Enable mock data for development only
 * Automatically disabled in production builds
 */
export const ENABLE_MOCK_DATA = process.env.NODE_ENV === 'development';

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  TRIP_ENTRIES: 'mealEntries',
  EQUIPMENT_ENTRIES: 'equipmentEntries',
  EXPENSE_ENTRIES: 'expenseEntries',
  MONTHLY_EMPLOYER_EXPENSES: 'monthlyEmployerExpenses',
  DEFAULT_COMMUTE: 'defaultCommute',
  TAX_RATES: 'taxRates',
  SELECTED_YEAR: 'selectedYear',
  TRIPS_FORM_DATA: 'TRIPS_FORM_DATA'
};

/**
 * File system paths
 */
export const FILE_PATHS = {
  RECEIPTS: 'receipts'
};

/**
 * Animation durations (ms)
 */
export const ANIMATION = {
  HIGHLIGHT_DURATION: 2000,
  FLASH_DURATION: 300,
  TRANSITION_DURATION: 200
};

/**
 * Swipe action configuration
 */
export const SWIPE_CONFIG = {
  ACTIONS_WIDTH: 120,
  TRIGGER_THRESHOLD: 0.33 // 1/3 of actions width to trigger
};
