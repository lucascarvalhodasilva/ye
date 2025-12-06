/**
 * German Tax Logic (Verpflegungsmehraufwand)
 * Calculates the meal allowance based on trip duration and dates.
 * 
 * @param {string} startDateStr - YYYY-MM-DD
 * @param {string} startTimeStr - HH:MM
 * @param {string} endDateStr - YYYY-MM-DD
 * @param {string} endTimeStr - HH:MM
 * @param {Object} taxRates - Object containing tax rates (mealRate8h, mealRate24h)
 * @returns {Object} { duration: number, rate: number }
 */
export const calculateAllowance = (startDateStr, startTimeStr, endDateStr, endTimeStr, taxRates) => {
  const start = new Date(`${startDateStr}T${startTimeStr}`);
  const end = new Date(`${endDateStr || startDateStr}T${endTimeStr}`);
  
  let diff = (end - start) / 1000 / 60 / 60; // hours
  if (diff < 0) diff = 0;

  let rate = 0;
  
  const isSameDay = start.toDateString() === end.toDateString();

  if (isSameDay) {
    // One day trip: > 8h = 14€
    if (diff > 8) {
      rate = taxRates.mealRate8h;
    }
  } else {
    // Multi-day trip
    // Arrival day (Anreisetag): 14€ (no min duration)
    rate += taxRates.mealRate8h;
    
    // Departure day (Abreisetag): 14€ (no min duration)
    rate += taxRates.mealRate8h;
    
    // Full intermediate days (24h): 28€
    const oneDay = 24 * 60 * 60 * 1000;
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    
    const daysDiff = Math.round(Math.abs((startDateOnly - endDateOnly) / oneDay));
    const intermediateDays = Math.max(0, daysDiff - 1);
    
    rate += intermediateDays * taxRates.mealRate24h;
  }

  return { duration: diff, rate };
};

export const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
