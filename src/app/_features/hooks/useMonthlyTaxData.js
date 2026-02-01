import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * Custom hook to calculate monthly tax deductible data for the bar chart.
 * Calculates gross deductible, spesen, and net deductible for each month.
 * 
 * @param {number} year - The year to calculate data for
 * @returns {Array<Object>} Array of 12 monthly data objects with gross, spesen, and net values
 */
export const useMonthlyTaxData = (year) => {
  const { 
    tripEntries, 
    equipmentEntries, 
    monthlyEmployerExpenses,
    taxRates 
  } = useAppContext();

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return months.map(month => {
      // Filter data for this month
      const monthTrips = tripEntries.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
      
      // Calculate totals from trips (includes meal allowances and transport allowances)
      const tripsDeductible = monthTrips.reduce((sum, t) => {
        const mealAllowance = t.mealAllowance || 0;
        const transportSum = t.sumTransportAllowances || 0;
        return sum + mealAllowance + transportSum;
      }, 0);
      
      // Calculate equipment depreciation for this month
      const equipmentDeductible = calculateMonthlyEquipmentDepreciation(
        equipmentEntries, 
        month, 
        year, 
        taxRates
      );
      
      // Calculate gross deductible
      const grossDeductible = tripsDeductible + equipmentDeductible;
      
      // Get spesen for this month
      const monthSpesen = (monthlyEmployerExpenses || []).find(
        s => s.month === month && s.year === year
      );
      const spesenAmount = monthSpesen?.amount || 0;
      
      // Calculate net (never negative)
      const netDeductible = Math.max(0, grossDeductible - spesenAmount);
      
      return {
        month: getMonthName(month),
        gross: grossDeductible,
        spesen: spesenAmount,
        net: netDeductible
      };
    });
  }, [tripEntries, equipmentEntries, monthlyEmployerExpenses, year, taxRates]);

  return monthlyData;
};

/**
 * Calculate equipment depreciation for a specific month
 * @param {Array} equipment - All equipment entries
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @param {Object} taxRates - Tax rates configuration
 * @returns {number} Total depreciation for the month
 */
function calculateMonthlyEquipmentDepreciation(equipment, month, year, taxRates) {
  return equipment.reduce((sum, entry) => {
    const purchaseDate = new Date(entry.date);
    const purchaseMonth = purchaseDate.getMonth() + 1;
    const purchaseYear = purchaseDate.getFullYear();
    const price = parseFloat(entry.price);
    
    // GWG (Geringwertige Wirtschaftsgüter) - immediate deduction in purchase month
    if (price <= (taxRates?.gwgLimit || 952)) {
      return (month === purchaseMonth && year === purchaseYear) 
        ? sum + price 
        : sum;
    }
    
    // Regular depreciation over 3 years
    const usefulLifeYears = 3;
    const endDate = new Date(purchaseDate);
    endDate.setMonth(endDate.getMonth() + (usefulLifeYears * 12));
    
    const checkDate = new Date(year, month - 1, 1);
    
    // Equipment must be purchased before or in this month and not yet fully depreciated
    if (purchaseDate <= checkDate && checkDate < endDate) {
      const monthlyDepreciation = price / (usefulLifeYears * 12);
      return sum + monthlyDepreciation;
    }
    
    return sum;
  }, 0);
}

/**
 * Get short month name (Jan, Feb, etc.)
 * @param {number} month - Month number (1-12)
 * @returns {string} Short month name
 */
function getMonthName(month) {
  const monthNames = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];
  return monthNames[month - 1];
}
