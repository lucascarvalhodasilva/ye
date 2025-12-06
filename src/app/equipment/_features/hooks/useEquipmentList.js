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
        directory: Directory.Data
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

  const filteredEquipmentEntries = useMemo(() => {
    return equipmentEntries.map(entry => {
      const purchaseDate = new Date(entry.date);
      const purchaseYear = purchaseDate.getFullYear();
      const currentYear = parseInt(selectedYear);
      const price = parseFloat(entry.price);
      
      // 1. GWG (<= Limit): Show only in purchase year (full amount)
      if (price <= (taxRates?.gwgLimit || 952)) {
        return purchaseYear === currentYear ? entry : null;
      }

      // 2. Depreciating Assets (> Limit)
      const usefulLifeYears = 3;
      const endYear = purchaseYear + usefulLifeYears; 
      
      if (currentYear < purchaseYear || currentYear > endYear) return null;

      let monthsInCurrentYear = 0;
      
      if (currentYear === purchaseYear) {
        monthsInCurrentYear = 12 - purchaseDate.getMonth();
      } else if (currentYear < endYear) {
        monthsInCurrentYear = 12;
      } else if (currentYear === endYear) {
        monthsInCurrentYear = purchaseDate.getMonth();
      }

      if (monthsInCurrentYear <= 0) return null;

      const monthlyDepreciation = price / (usefulLifeYears * 12);
      const deductible = monthlyDepreciation * monthsInCurrentYear;

      return {
        ...entry,
        deductibleAmount: parseFloat(deductible.toFixed(2)),
        status: `Abschreibung ${currentYear} (${monthsInCurrentYear} Mon.)`
      };
    }).filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [equipmentEntries, selectedYear, taxRates]);

  return {
    filteredEquipmentEntries,
    deleteEquipmentEntry,
    selectedYear,
    isFullScreen,
    setIsFullScreen,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt
  };
};
