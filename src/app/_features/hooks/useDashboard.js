import { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export const useDashboard = () => {
  const { tripEntries, equipmentEntries, expenseEntries, monthlyEmployerExpenses, selectedYear, taxRates } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  // Filter entries by selected year
  const filteredTrips = useMemo(() => 
    tripEntries.filter(e => new Date(e.date).getFullYear() === selectedYear),
  [tripEntries, selectedYear]);

  const filteredExpenses = useMemo(() => 
    (expenseEntries || []).filter(e => new Date(e.date).getFullYear() === selectedYear),
  [expenseEntries, selectedYear]);

  const filteredMonthlyExpenses = useMemo(() => 
    (monthlyEmployerExpenses || []).filter(e => e.year === selectedYear),
  [monthlyEmployerExpenses, selectedYear]);

  const totalTrips = useMemo(() => 
    filteredTrips.reduce((sum, entry) => {
      const mealAllowance = entry.mealAllowance || 0;
      const transportSum = entry.sumTransportAllowances || 0;
      return sum + mealAllowance + transportSum;
    }, 0),
  [filteredTrips]);
  
  // Calculate Equipment Depreciation for Selected Year
  const totalEquipment = useMemo(() => equipmentEntries.reduce((sum, entry) => {
    const purchaseDate = new Date(entry.date);
    const purchaseYear = purchaseDate.getFullYear();
    const currentYear = parseInt(selectedYear);
    const price = parseFloat(entry.price);
    
    // GWG
    if (price <= (taxRates?.gwgLimit || 952)) {
        return purchaseYear === currentYear ? sum + price : sum;
    }
    
    // Depreciation
    const usefulLifeYears = 3;
    const endYear = purchaseYear + usefulLifeYears;
    
    if (currentYear < purchaseYear || currentYear > endYear) return sum;
    
    let monthsInCurrentYear = 0;
    if (currentYear === purchaseYear) {
        monthsInCurrentYear = 12 - purchaseDate.getMonth();
    } else if (currentYear < endYear) {
        monthsInCurrentYear = 12;
    } else if (currentYear === endYear) {
        monthsInCurrentYear = purchaseDate.getMonth();
    }
    
    if (monthsInCurrentYear <= 0) return sum;
    
    const monthlyDepreciation = price / (usefulLifeYears * 12);
    return sum + (monthlyDepreciation * monthsInCurrentYear);
  }, 0), [equipmentEntries, selectedYear, taxRates]);

  const totalEmployerReimbursement = useMemo(() => 
    filteredMonthlyExpenses.reduce((sum, entry) => sum + entry.amount, 0),
  [filteredMonthlyExpenses]);
  
  // Grand Total (Absetzbar) = (Trips + Equipment) - Employer Reimbursements
  const grandTotal = (totalTrips + totalEquipment) - totalEmployerReimbursement;

  // KPI Calculations for Expenses vs Allowances
  const totalExpenses = useMemo(() => 
    filteredExpenses.reduce((sum, entry) => sum + entry.amount, 0),
  [filteredExpenses]);
  
  // Net Result (Absetzbar - Private Ausgaben)
  const netTotal = grandTotal - totalExpenses;

  // Combine and sort recent activities
  const recentActivities = useMemo(() => {
    const activities = [
      ...tripEntries.map(e => ({ 
        ...e, 
        type: 'Reise', 
        amount: (e.mealAllowance || 0) + (e.sumTransportAllowances || 0) 
      })),
      ...equipmentEntries.map(e => ({ ...e, type: 'Arbeitsmittel', amount: e.deductibleAmount }))
    ];
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [tripEntries, equipmentEntries]);

  // Simulate initial data loading (in real app, this would wait for data fetch)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // Short delay to show skeleton on initial load
    
    return () => clearTimeout(timer);
  }, [selectedYear]); // Re-trigger when year changes

  return {
    selectedYear,
    grandTotal,
    totalTrips,
    totalEquipment,
    totalEmployerReimbursement,
    totalExpenses,
    netTotal,
    recentActivities,
    isLoading
  };
};
