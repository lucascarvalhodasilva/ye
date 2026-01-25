import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const useEquipmentList = () => {
  const { equipmentEntries, deleteEquipmentEntry, selectedYear, taxRates } = useAppContext();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const loadReceipt = async (fileName) => {
    try {
      const file = await Filesystem.readFile({
        path: `receipts/${fileName}`,
        directory: Directory.Documents
      });
      return `data:image/jpeg;base64,${file.data}`;
    } catch (e) {
      console.error('Error loading receipt:', e);
      return null;
    }
  };

  const handleViewReceipt = async (fileName) => {
    const base64 = await loadReceipt(fileName);
    if (base64) {
      setViewingReceipt(base64);
    } else {
      alert('Beleg konnte nicht geladen werden.');
    }
  };

  // Calculate deductible amount for each entry based on depreciation rules
  const calculateDeductible = (entry, forYear) => {
    const purchaseDate = new Date(entry.date);
    const purchaseYear = purchaseDate.getFullYear();
    const price = parseFloat(entry.price);
    const year = forYear || purchaseYear;
    
    // 1. GWG (<= Limit): Full amount in purchase year only
    if (price <= (taxRates?.gwgLimit || 952)) {
      return year === purchaseYear ? price : 0;
    }

    // 2. Depreciating Assets (> Limit)
    const usefulLifeYears = 3;
    const endYear = purchaseYear + usefulLifeYears; 
    
    if (year < purchaseYear || year > endYear) return 0;

    let monthsInYear = 0;
    
    if (year === purchaseYear) {
      monthsInYear = 12 - purchaseDate.getMonth();
    } else if (year < endYear) {
      monthsInYear = 12;
    } else if (year === endYear) {
      monthsInYear = purchaseDate.getMonth();
    }

    if (monthsInYear <= 0) return 0;

    const monthlyDepreciation = price / (usefulLifeYears * 12);
    return parseFloat((monthlyDepreciation * monthsInYear).toFixed(2));
  };

  // Generate complete depreciation schedule for an equipment entry
  const generateDepreciationSchedule = (entry) => {
    const purchaseDate = new Date(entry.date);
    const purchaseYear = purchaseDate.getFullYear();
    const price = parseFloat(entry.price);
    const gwgLimit = taxRates?.gwgLimit || 952;
    
    // GWG items: immediate deduction
    if (price <= gwgLimit) {
      return {
        type: 'GWG',
        years: [{
          year: purchaseYear,
          months: 12,
          monthlyRate: price,
          deduction: price,
          isCurrentYear: purchaseYear === selectedYear
        }],
        total: price,
        bookValue: purchaseYear <= selectedYear ? 0 : price,
        monthlyRate: price,
        purchaseMonth: purchaseDate.getMonth()
      };
    }
    
    // Depreciating assets
    const usefulLifeYears = 3;
    const totalMonths = usefulLifeYears * 12;
    const monthlyDepreciation = price / totalMonths;
    const schedule = [];
    
    for (let i = 0; i <= usefulLifeYears; i++) {
      const year = purchaseYear + i;
      const deduction = calculateDeductible(entry, year);
      
      if (deduction > 0) {
        let months;
        if (i === 0) {
          months = 12 - purchaseDate.getMonth();
        } else if (i === usefulLifeYears) {
          months = purchaseDate.getMonth();
        } else {
          months = 12;
        }
        
        schedule.push({
          year,
          months,
          monthlyRate: monthlyDepreciation,
          deduction,
          isCurrentYear: year === selectedYear
        });
      }
    }
    
    const totalDepreciation = schedule.reduce((sum, y) => sum + y.deduction, 0);
    const depreciatedSoFar = schedule
      .filter(y => y.year <= selectedYear)
      .reduce((sum, y) => sum + y.deduction, 0);
    
    return {
      type: 'Depreciation',
      monthlyRate: monthlyDepreciation,
      years: schedule,
      total: totalDepreciation,
      bookValue: price - depreciatedSoFar,
      totalMonths,
      purchaseMonth: purchaseDate.getMonth()
    };
  };

  const filteredEquipmentEntries = useMemo(() => {
    return equipmentEntries
      .filter(entry => {
        // Calculate deductible for the selected year
        const deductible = calculateDeductible(entry, selectedYear);
        // Only include entries with deduction in selected year
        return deductible > 0;
      })
      .map(entry => {
        const purchaseDate = new Date(entry.date);
        const purchaseYear = purchaseDate.getFullYear();
        const price = parseFloat(entry.price);
        
        // Calculate deductible for the selected year
        const deductible = calculateDeductible(entry, selectedYear);
        
        // For GWG items, show full amount
        if (price <= (taxRates?.gwgLimit || 952)) {
          return {
            ...entry,
            deductibleAmount: price,
            status: 'GWG (Sofortabzug)'
          };
        }

        // For depreciating assets, calculate based on selected year
        const usefulLifeYears = 3;
        const endYear = purchaseYear + usefulLifeYears;
        
        // Calculate months for the selected year
        let monthsInYear = 0;
        if (selectedYear === purchaseYear) {
          monthsInYear = 12 - purchaseDate.getMonth();
        } else if (selectedYear < endYear) {
          monthsInYear = 12;
        } else if (selectedYear === endYear) {
          monthsInYear = purchaseDate.getMonth();
        }

        return {
          ...entry,
          deductibleAmount: deductible,
          status: `Abschreibung ${selectedYear} (${monthsInYear} Mon.)`
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [equipmentEntries, taxRates, selectedYear]);

  return {
    filteredEquipmentEntries,
    deleteEquipmentEntry,
    selectedYear,
    isFullScreen,
    setIsFullScreen,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    generateDepreciationSchedule
  };
};
