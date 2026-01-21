/**
 * Month names in German
 */
export const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

/**
 * Short month names in German
 */
export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
];

/**
 * Get month name by index (0-11)
 * @param {number} index - Month index (0-11)
 * @returns {string} Month name
 */
export const getMonthName = (index) => MONTH_NAMES[index] || '';

/**
 * Get short month name by index (0-11)
 * @param {number} index - Month index (0-11)
 * @returns {string} Short month name
 */
export const getMonthNameShort = (index) => MONTH_NAMES_SHORT[index] || '';
