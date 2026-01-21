/**
 * Application configuration constants
 */

/**
 * Enable mock data for development
 * Set to false for production
 */
export const ENABLE_MOCK_DATA = true;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  MEAL_ENTRIES: 'mealEntries',
  MILEAGE_ENTRIES: 'mileageEntries',
  EQUIPMENT_ENTRIES: 'equipmentEntries',
  EXPENSE_ENTRIES: 'expenseEntries',
  MONTHLY_EMPLOYER_EXPENSES: 'monthlyEmployerExpenses',
  DEFAULT_COMMUTE: 'defaultCommute',
  TAX_RATES: 'taxRates',
  SELECTED_YEAR: 'selectedYear',
  MEALS_FORM_DATA: 'MEALS_FORM_DATA'
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
