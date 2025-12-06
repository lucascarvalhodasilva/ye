"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [mealEntries, setMealEntries] = useState([]);
  const [mileageEntries, setMileageEntries] = useState([]);
  const [equipmentEntries, setEquipmentEntries] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
  const [monthlyEmployerExpenses, setMonthlyEmployerExpenses] = useState([]);
  const [defaultCommute, setDefaultCommute] = useState({
    car: { active: true, distance: 0 },
    motorcycle: { active: false, distance: 0 },
    bike: { active: false, distance: 0 },
    public_transport: { active: false, cost: '' }
  });
  const [taxRates, setTaxRates] = useState({
    mealRate8h: 14.0,
    mealRate24h: 28.0,
    mileageRate: 0.30,
    mileageRateCar: 0.30,
    mileageRateMotorcycle: 0.20,
    mileageRateBike: 0.05,
    gwgLimit: 952.0
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Load from local storage on mount
  useEffect(() => {
    const storedMeals = localStorage.getItem('mealEntries');
    const storedMileage = localStorage.getItem('mileageEntries');
    const storedEquipment = localStorage.getItem('equipmentEntries');
    const storedExpenses = localStorage.getItem('expenseEntries');
    const storedMonthlyExpenses = localStorage.getItem('monthlyEmployerExpenses');
    const storedDefaultCommute = localStorage.getItem('defaultCommute');
    const storedTaxRates = localStorage.getItem('taxRates');
    const storedYear = localStorage.getItem('selectedYear');

    if (storedMeals) setMealEntries(JSON.parse(storedMeals));
    if (storedMileage) setMileageEntries(JSON.parse(storedMileage));
    if (storedEquipment) setEquipmentEntries(JSON.parse(storedEquipment));
    if (storedExpenses) setExpenseEntries(JSON.parse(storedExpenses));
    if (storedMonthlyExpenses) setMonthlyEmployerExpenses(JSON.parse(storedMonthlyExpenses));
    if (storedDefaultCommute) setDefaultCommute(JSON.parse(storedDefaultCommute));
    if (storedTaxRates) {
      const parsedRates = JSON.parse(storedTaxRates);
      setTaxRates(prev => ({ ...prev, ...parsedRates }));
    }
    if (storedYear) setSelectedYear(JSON.parse(storedYear));
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('mealEntries', JSON.stringify(mealEntries));
  }, [mealEntries]);

  useEffect(() => {
    localStorage.setItem('mileageEntries', JSON.stringify(mileageEntries));
  }, [mileageEntries]);

  useEffect(() => {
    localStorage.setItem('equipmentEntries', JSON.stringify(equipmentEntries));
  }, [equipmentEntries]);

  useEffect(() => {
    localStorage.setItem('expenseEntries', JSON.stringify(expenseEntries));
  }, [expenseEntries]);

  useEffect(() => {
    localStorage.setItem('monthlyEmployerExpenses', JSON.stringify(monthlyEmployerExpenses));
  }, [monthlyEmployerExpenses]);

  useEffect(() => {
    localStorage.setItem('defaultCommute', JSON.stringify(defaultCommute));
  }, [defaultCommute]);

  useEffect(() => {
    localStorage.setItem('taxRates', JSON.stringify(taxRates));
  }, [taxRates]);

  useEffect(() => {
    localStorage.setItem('selectedYear', JSON.stringify(selectedYear));
  }, [selectedYear]);

  const addMealEntry = (entry) => {
    const newEntry = { ...entry, id: entry.id || Date.now() };
    setMealEntries(prev => [...prev, newEntry]);
  };

  const deleteMealEntry = (id) => {
    setMealEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateMealEntry = (id, updatedEntry) => {
    setMealEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updatedEntry } : entry));
  };

  const addMileageEntry = (entry) => {
    setMileageEntries(prev => [...prev, { ...entry, id: Date.now() + Math.random() }]);
  };

  const deleteMileageEntry = (id) => {
    setMileageEntries(prev => prev.filter(e => e.id !== id));
  };

  const getMileageRate = (vehicleType) => {
    switch (vehicleType) {
      case 'motorcycle':
        return taxRates.mileageRateMotorcycle || 0.20;
      case 'bike':
        return taxRates.mileageRateBike || 0.05;
      case 'car':
      default:
        return taxRates.mileageRateCar || 0.30;
    }
  };

  const addEquipmentEntry = (entry) => {
    setEquipmentEntries(prev => [...prev, { ...entry, id: entry.id || Date.now() }]);
  };

  const deleteEquipmentEntry = (id) => {
    setEquipmentEntries(prev => prev.filter(e => e.id !== id));
  };

  const addMonthlyEmployerExpense = (entry) => {
    setMonthlyEmployerExpenses(prev => {
      const existingIndex = prev.findIndex(e => e.year === entry.year && e.month === entry.month);
      if (existingIndex >= 0) {
        const newArr = [...prev];
        newArr[existingIndex] = { ...newArr[existingIndex], ...entry };
        return newArr;
      }
      return [...prev, { ...entry, id: Date.now() }];
    });
  };

  const deleteMonthlyEmployerExpense = (id) => {
    setMonthlyEmployerExpenses(prev => prev.filter(e => e.id !== id));
  };

  const addExpenseEntry = (entry) => {
    setExpenseEntries(prev => [...prev, { ...entry, id: entry.id || Date.now() }]);
  };

  const deleteExpenseEntry = (id) => {
    setExpenseEntries(prev => prev.filter(e => e.id !== id));
  };

  const generateExampleData = () => {
    const now = Date.now();
    
    // Meals
    const meals = [
      // 2024
      { id: now + 1, date: '2024-05-15', endDate: '2024-05-15', startTime: '08:00', endTime: '20:00', duration: 12, rate: 14, deductible: 14, employerExpenses: 0 },
      { id: now + 2, date: '2024-11-20', endDate: '2024-11-20', startTime: '06:00', endTime: '18:00', duration: 12, rate: 14, deductible: 6, employerExpenses: 8 },
      // 2025
      { id: now + 3, date: '2025-01-10', endDate: '2025-01-10', startTime: '08:00', endTime: '17:00', duration: 9, rate: 14, deductible: 14, employerExpenses: 0 },
      { id: now + 4, date: '2025-03-15', endDate: '2025-03-16', startTime: '10:00', endTime: '10:00', duration: 24, rate: 28, deductible: 28, employerExpenses: 0 },
      // 2026
      { id: now + 5, date: '2026-02-01', endDate: '2026-02-01', startTime: '09:00', endTime: '18:00', duration: 9, rate: 14, deductible: 14, employerExpenses: 0 },
    ];

    // Mileage
    const mileage = [
      // 2024
      { id: now + 101, date: '2024-05-15', startLocation: 'Zuhause', endLocation: 'Kunde A', distance: 50, totalKm: 100, allowance: 30, purpose: 'Kundenbesuch' },
      // 2025
      { id: now + 102, date: '2025-01-10', startLocation: 'Zuhause', endLocation: 'Büro', distance: 20, totalKm: 40, allowance: 12, purpose: 'Pendeln' },
      { id: now + 103, date: '2025-03-15', startLocation: 'Zuhause', endLocation: 'Messe', distance: 200, totalKm: 400, allowance: 120, purpose: 'Messebesuch' },
      // 2026
      { id: now + 104, date: '2026-02-01', startLocation: 'Zuhause', endLocation: 'Schulung', distance: 30, totalKm: 60, allowance: 18, purpose: 'Fortbildung' },
    ];

    // Equipment
    const equipment = [
      // 2024
      { id: now + 201, name: 'Laptop 2024', category: 'Elektronik', date: '2024-06-01', price: 1200, reimbursed: false, deductibleAmount: 0, status: 'Abschreibung erforderlich (> 952€)' },
      // 2025
      { id: now + 202, name: 'Monitor', category: 'Elektronik', date: '2025-01-05', price: 300, reimbursed: false, deductibleAmount: 300, status: 'Sofort absetzbar (GWG)' },
      { id: now + 203, name: 'Bürostuhl', category: 'Möbel', date: '2025-02-20', price: 450, reimbursed: true, deductibleAmount: 0, status: 'Erstattet' },
      // 2026
      { id: now + 204, name: 'Fachbuch', category: 'Literatur', date: '2026-01-15', price: 50, reimbursed: false, deductibleAmount: 50, status: 'Sofort absetzbar (GWG)' },
    ];

    setMealEntries(prev => [...prev, ...meals]);
    setMileageEntries(prev => [...prev, ...mileage]);
    setEquipmentEntries(prev => [...prev, ...equipment]);
  };

  return (
    <AppContext.Provider value={{
      mealEntries, addMealEntry, deleteMealEntry, updateMealEntry,
      mileageEntries, addMileageEntry, deleteMileageEntry,
      equipmentEntries, addEquipmentEntry, deleteEquipmentEntry,
      expenseEntries, addExpenseEntry, deleteExpenseEntry,
      monthlyEmployerExpenses, addMonthlyEmployerExpense, deleteMonthlyEmployerExpense,
      defaultCommute, setDefaultCommute,
      taxRates, setTaxRates, getMileageRate,
      selectedYear, setSelectedYear,
      generateExampleData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
