import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * Hook to manage trip list data and operations.
 */
export const useTripList = () => {
  const { 
    mealEntries, 
    deleteMealEntry, 
    mileageEntries, 
    deleteMileageEntry, 
    selectedYear 
  } = useAppContext();

  const filteredMealEntries = useMemo(() => 
    mealEntries
      .filter(entry => new Date(entry.date).getFullYear() === parseInt(selectedYear))
      .sort((a, b) => new Date(b.date) - new Date(a.date)), 
  [mealEntries, selectedYear]);

  const handleDeleteEntry = (entryId, entryDate, entryEndDate) => {
    deleteMealEntry(entryId);
    
    // Delete by relatedMealId
    const relatedMileage = mileageEntries.filter(m => m.relatedMealId === entryId);
    if (relatedMileage.length > 0) {
      relatedMileage.forEach(m => deleteMileageEntry(m.id));
    } else {
      // Fallback for legacy entries
      const legacyMileage = mileageEntries.filter(m => 
        !m.relatedMealId && 
        (m.date === entryDate || (entryEndDate && m.date === entryEndDate))
      );
      legacyMileage.forEach(m => deleteMileageEntry(m.id));
    }
  };

  return {
    filteredMealEntries,
    mileageEntries,
    handleDeleteEntry,
    selectedYear
  };
};
