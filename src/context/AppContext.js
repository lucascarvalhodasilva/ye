"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

const AppContext = createContext();

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================
const ENABLE_MOCK_DATA = true; // Set to false to disable mock data

const generateMockData = (currentYear) => {
  const mockTripEntries = [
    // January trips
    {
      id: 1001,
      date: `${currentYear}-01-06`,
      endDate: `${currentYear}-01-08`,
      departureTime: '06:30',
      returnTime: '20:00',
      destination: 'München',
      purpose: 'Kundentermin BMW',
      deductible: 70.0, // 2 full days + 2 travel days
      isMultiDay: true
    },
    {
      id: 1002,
      date: `${currentYear}-01-15`,
      departureTime: '07:00',
      returnTime: '19:30',
      destination: 'Stuttgart',
      purpose: 'Messe Besuch',
      deductible: 14.0,
      isMultiDay: false
    },
    // February trips
    {
      id: 1003,
      date: `${currentYear}-02-03`,
      endDate: `${currentYear}-02-05`,
      departureTime: '05:45',
      returnTime: '21:00',
      destination: 'Hamburg',
      purpose: 'Workshop Team Nord',
      deductible: 70.0,
      isMultiDay: true
    },
    {
      id: 1004,
      date: `${currentYear}-02-20`,
      departureTime: '08:00',
      returnTime: '18:00',
      destination: 'Frankfurt',
      purpose: 'Banktermin',
      deductible: 14.0,
      isMultiDay: false
    },
    // March trips
    {
      id: 1005,
      date: `${currentYear}-03-10`,
      endDate: `${currentYear}-03-14`,
      departureTime: '06:00',
      returnTime: '22:00',
      destination: 'Berlin',
      purpose: 'Projektstart Kunde XYZ',
      deductible: 126.0,
      isMultiDay: true
    },
    // April trips
    {
      id: 1006,
      date: `${currentYear}-04-07`,
      departureTime: '07:30',
      returnTime: '17:30',
      destination: 'Köln',
      purpose: 'Lieferantengespräch',
      deductible: 14.0,
      isMultiDay: false
    },
    {
      id: 1007,
      date: `${currentYear}-04-22`,
      endDate: `${currentYear}-04-24`,
      departureTime: '06:00',
      returnTime: '19:00',
      destination: 'Düsseldorf',
      purpose: 'Schulung SAP',
      deductible: 70.0,
      isMultiDay: true
    },
    // May trips
    {
      id: 1008,
      date: `${currentYear}-05-12`,
      departureTime: '08:30',
      returnTime: '20:00',
      destination: 'Nürnberg',
      purpose: 'Audit Qualitätsmanagement',
      deductible: 14.0,
      isMultiDay: false
    },
    // June trips
    {
      id: 1009,
      date: `${currentYear}-06-02`,
      endDate: `${currentYear}-06-06`,
      departureTime: '05:30',
      returnTime: '21:30',
      destination: 'Wien',
      purpose: 'Internationale Konferenz',
      deductible: 140.0,
      isMultiDay: true
    },
    // Recent trips (December/January)
    {
      id: 1010,
      date: `${currentYear}-01-13`,
      departureTime: '07:00',
      returnTime: '18:30',
      destination: 'Mannheim',
      purpose: 'Vertriebsmeeting',
      deductible: 14.0,
      isMultiDay: false
    },
    {
      id: 1011,
      date: `${currentYear}-01-17`,
      endDate: `${currentYear}-01-19`,
      departureTime: '06:00',
      returnTime: '20:00',
      destination: 'Leipzig',
      purpose: 'Kundenworkshop',
      deductible: 70.0,
      isMultiDay: true
    }
  ];

  const mockMileageEntries = [
    // January
    { id: 2001, date: `${currentYear}-01-06`, distance: 285, allowance: 85.50, vehicleType: 'car', relatedTripId: 1001, destination: 'München' },
    { id: 2002, date: `${currentYear}-01-08`, distance: 285, allowance: 85.50, vehicleType: 'car', relatedTripId: 1001, destination: 'München (Rückfahrt)' },
    { id: 2003, date: `${currentYear}-01-15`, distance: 210, allowance: 63.00, vehicleType: 'car', relatedTripId: 1002, destination: 'Stuttgart' },
    { id: 2004, date: `${currentYear}-01-13`, distance: 95, allowance: 28.50, vehicleType: 'car', relatedTripId: 1010, destination: 'Mannheim' },
    { id: 2005, date: `${currentYear}-01-17`, distance: 320, allowance: 96.00, vehicleType: 'car', relatedTripId: 1011, destination: 'Leipzig' },
    { id: 2006, date: `${currentYear}-01-19`, distance: 320, allowance: 96.00, vehicleType: 'car', relatedTripId: 1011, destination: 'Leipzig (Rückfahrt)' },
    // February
    { id: 2007, date: `${currentYear}-02-03`, distance: 470, allowance: 141.00, vehicleType: 'car', relatedTripId: 1003, destination: 'Hamburg' },
    { id: 2008, date: `${currentYear}-02-05`, distance: 470, allowance: 141.00, vehicleType: 'car', relatedTripId: 1003, destination: 'Hamburg (Rückfahrt)' },
    { id: 2009, date: `${currentYear}-02-20`, distance: 180, allowance: 54.00, vehicleType: 'car', relatedTripId: 1004, destination: 'Frankfurt' },
    // March
    { id: 2010, date: `${currentYear}-03-10`, distance: 550, allowance: 165.00, vehicleType: 'car', relatedTripId: 1005, destination: 'Berlin' },
    { id: 2011, date: `${currentYear}-03-14`, distance: 550, allowance: 165.00, vehicleType: 'car', relatedTripId: 1005, destination: 'Berlin (Rückfahrt)' },
    // April
    { id: 2012, date: `${currentYear}-04-07`, distance: 150, allowance: 45.00, vehicleType: 'car', relatedTripId: 1006, destination: 'Köln' },
    { id: 2013, date: `${currentYear}-04-22`, distance: 220, allowance: 66.00, vehicleType: 'car', relatedTripId: 1007, destination: 'Düsseldorf' },
    { id: 2014, date: `${currentYear}-04-24`, distance: 220, allowance: 66.00, vehicleType: 'car', relatedTripId: 1007, destination: 'Düsseldorf (Rückfahrt)' },
    // May
    { id: 2015, date: `${currentYear}-05-12`, distance: 165, allowance: 49.50, vehicleType: 'car', relatedTripId: 1008, destination: 'Nürnberg' },
    // June
    { id: 2016, date: `${currentYear}-06-02`, distance: 420, allowance: 126.00, vehicleType: 'car', relatedTripId: 1009, destination: 'Wien' },
    { id: 2017, date: `${currentYear}-06-06`, distance: 420, allowance: 126.00, vehicleType: 'car', relatedTripId: 1009, destination: 'Wien (Rückfahrt)' }
  ];

  const mockMonthlyExpenses = [
    { id: 3001, year: currentYear, month: 0, amount: 180.00 }, // January - employer reimbursement
    { id: 3002, year: currentYear, month: 1, amount: 220.00 }, // February
    { id: 3003, year: currentYear, month: 2, amount: 350.00 }, // March
    { id: 3004, year: currentYear, month: 3, amount: 150.00 }, // April
    { id: 3005, year: currentYear, month: 4, amount: 45.00 },  // May
    { id: 3006, year: currentYear, month: 5, amount: 280.00 }  // June
  ];

  const mockEquipmentEntries = [
    { id: 4001, date: `${currentYear}-01-10`, name: 'Laptop Dell XPS 15', price: 1899.00, category: 'IT-Ausstattung', depreciationYears: 3 },
    { id: 4002, date: `${currentYear}-02-15`, name: 'Monitor 27" 4K', price: 449.00, category: 'IT-Ausstattung', depreciationYears: 0 },
    { id: 4003, date: `${currentYear}-03-20`, name: 'Bürostuhl ergonomisch', price: 650.00, category: 'Büromöbel', depreciationYears: 0 },
    { id: 4004, date: `${currentYear}-04-05`, name: 'Externe Festplatte 2TB', price: 89.00, category: 'IT-Ausstattung', depreciationYears: 0 }
  ];

  const mockExpenseEntries = [
    { id: 5001, date: `${currentYear}-01-05`, description: 'Fachliteratur Steuerwesen', amount: 45.00, category: 'Bücher' },
    { id: 5002, date: `${currentYear}-01-15`, description: 'Office 365 Jahresabo', amount: 99.00, category: 'Software' },
    { id: 5003, date: `${currentYear}-01-22`, description: 'Druckerpapier & Toner', amount: 78.00, category: 'Büromaterial' },
    { id: 5004, date: `${currentYear}-02-03`, description: 'USB-C Adapter', amount: 29.90, category: 'IT-Zubehör' },
    { id: 5005, date: `${currentYear}-02-14`, description: 'Visitenkarten 500 Stück', amount: 35.00, category: 'Marketing' },
    { id: 5006, date: `${currentYear}-02-28`, description: 'Webcam HD Logitech', amount: 89.00, category: 'IT-Zubehör' },
    { id: 5007, date: `${currentYear}-03-07`, description: 'Arbeitshandschuhe 10er Pack', amount: 24.50, category: 'Arbeitskleidung' },
    { id: 5008, date: `${currentYear}-03-18`, description: 'Fachliteratur Projektmanagement', amount: 52.00, category: 'Bücher' },
    { id: 5009, date: `${currentYear}-03-25`, description: 'Bildschirmreiniger Set', amount: 15.90, category: 'Büromaterial' },
    { id: 5010, date: `${currentYear}-04-02`, description: 'Kabelmanagement Schreibtisch', amount: 19.99, category: 'Büromaterial' },
    { id: 5011, date: `${currentYear}-04-12`, description: 'Präsentationsmaterial', amount: 67.50, category: 'Marketing' },
    { id: 5012, date: `${currentYear}-04-28`, description: 'Antivirensoftware 1 Jahr', amount: 39.99, category: 'Software' },
    { id: 5013, date: `${currentYear}-05-08`, description: 'Schreibtischlampe LED', amount: 49.90, category: 'Büromöbel' },
    { id: 5014, date: `${currentYear}-05-19`, description: 'Bluetooth Maus', amount: 34.99, category: 'IT-Zubehör' },
    { id: 5015, date: `${currentYear}-05-30`, description: 'Kalender & Planer 2026', amount: 18.50, category: 'Büromaterial' },
    { id: 5016, date: `${currentYear}-06-05`, description: 'Kopfhörer Noise Cancelling', amount: 159.00, category: 'IT-Zubehör' },
    { id: 5017, date: `${currentYear}-06-16`, description: 'Cloud-Speicher Jahresabo', amount: 119.00, category: 'Software' },
    { id: 5018, date: `${currentYear}-06-27`, description: 'Dokumentenhalter', amount: 22.90, category: 'Büromaterial' },
    { id: 5019, date: `${currentYear}-07-10`, description: 'Sicherheitsschuhe S3', amount: 89.00, category: 'Arbeitskleidung' },
    { id: 5020, date: `${currentYear}-07-21`, description: 'VPN Service 1 Jahr', amount: 59.00, category: 'Software' }
  ];

  return {
    tripEntries: mockTripEntries,
    mileageEntries: mockMileageEntries,
    monthlyEmployerExpenses: mockMonthlyExpenses,
    equipmentEntries: mockEquipmentEntries,
    expenseEntries: mockExpenseEntries
  };
};

// Helper to delete receipt files
const deleteReceiptFiles = async (receiptFileName, dateStr) => {
  if (!receiptFileName) return;

  try {
    // Delete from Directory.Documents (receipts folder)
    try {
      await Filesystem.deleteFile({
        path: `receipts/${receiptFileName}`,
        directory: Directory.Documents
      });
    } catch (e) {
      console.warn(`Failed to delete internal receipt ${receiptFileName}:`, e);
    }
  } catch (e) {
    console.error("Error in deleteReceiptFiles:", e);
  }
};

export function AppProvider({ children }) {
  const [tripEntries, setTripEntries] = useState([]);
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
    const storedTrips = localStorage.getItem('mealEntries');
    const storedMileage = localStorage.getItem('mileageEntries');
    const storedEquipment = localStorage.getItem('equipmentEntries');
    const storedExpenses = localStorage.getItem('expenseEntries');
    const storedMonthlyExpenses = localStorage.getItem('monthlyEmployerExpenses');
    const storedDefaultCommute = localStorage.getItem('defaultCommute');
    const storedTaxRates = localStorage.getItem('taxRates');
    const storedYear = localStorage.getItem('selectedYear');

    // Check if we have existing data
    const hasExistingData = storedTrips && JSON.parse(storedTrips).length > 0;

    if (hasExistingData) {
      // Load existing data from localStorage
      if (storedTrips) setTripEntries(JSON.parse(storedTrips));
      if (storedMileage) setMileageEntries(JSON.parse(storedMileage));
      if (storedEquipment) setEquipmentEntries(JSON.parse(storedEquipment));
      if (storedExpenses) setExpenseEntries(JSON.parse(storedExpenses));
      if (storedMonthlyExpenses) setMonthlyEmployerExpenses(JSON.parse(storedMonthlyExpenses));
    } else if (ENABLE_MOCK_DATA) {
      // Load mock data for development
      const mockData = generateMockData(new Date().getFullYear());
      setTripEntries(mockData.tripEntries);
      setMileageEntries(mockData.mileageEntries);
      setMonthlyEmployerExpenses(mockData.monthlyEmployerExpenses);
      setEquipmentEntries(mockData.equipmentEntries);
      setExpenseEntries(mockData.expenseEntries);
    }

    if (storedDefaultCommute) setDefaultCommute(JSON.parse(storedDefaultCommute));
    if (storedTaxRates) {
      const parsedRates = JSON.parse(storedTaxRates);
      setTaxRates(prev => ({ ...prev, ...parsedRates }));
    }
    // if (storedYear) setSelectedYear(JSON.parse(storedYear)); // Always start with current year
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('mealEntries', JSON.stringify(tripEntries));
  }, [tripEntries]);

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

  const addTripEntry = (entry) => {
    const newEntry = { ...entry, id: entry.id || Date.now() };
    setTripEntries(prev => [...prev, newEntry]);
  };

  const deleteTripEntry = (id) => {
    setTripEntries(prev => prev.filter(e => e.id !== id));
  };

  const updateTripEntry = (id, updatedEntry) => {
    setTripEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updatedEntry } : entry));
  };

  const addMileageEntry = (entry) => {
    setMileageEntries(prev => [...prev, { ...entry, id: Date.now() + Math.random() }]);
  };

  const deleteMileageEntry = (id) => {
    setMileageEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry && entry.receiptFileName) {
        deleteReceiptFiles(entry.receiptFileName, entry.date);
      }
      return prev.filter(e => e.id !== id);
    });
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

  const updateEquipmentEntry = (updatedEntry) => {
    setEquipmentEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  const deleteEquipmentEntry = (id) => {
    setEquipmentEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry && entry.receiptFileName) {
        deleteReceiptFiles(entry.receiptFileName, entry.date);
      }
      return prev.filter(e => e.id !== id);
    });
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
    setExpenseEntries(prev => {
      const entry = prev.find(e => e.id === id);
      if (entry && entry.receiptFileName) {
        deleteReceiptFiles(entry.receiptFileName, entry.date);
      }
      return prev.filter(e => e.id !== id);
    });
  };

  const importData = (data) => {
    if (!data) return false;
    
    try {
      if (data.mealEntries) setTripEntries(data.mealEntries);
      if (data.mileageEntries) setMileageEntries(data.mileageEntries);
      if (data.equipmentEntries) setEquipmentEntries(data.equipmentEntries);
      if (data.expenseEntries) setExpenseEntries(data.expenseEntries);
      if (data.monthlyEmployerExpenses) setMonthlyEmployerExpenses(data.monthlyEmployerExpenses);
      if (data.defaultCommute) setDefaultCommute(data.defaultCommute);
      if (data.taxRates) setTaxRates(data.taxRates);
      if (data.selectedYear) setSelectedYear(data.selectedYear);
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      tripEntries, addTripEntry, deleteTripEntry, updateTripEntry,
      mileageEntries, addMileageEntry, deleteMileageEntry,
      equipmentEntries, addEquipmentEntry, deleteEquipmentEntry, updateEquipmentEntry,
      expenseEntries, addExpenseEntry, deleteExpenseEntry,
      monthlyEmployerExpenses, addMonthlyEmployerExpense, deleteMonthlyEmployerExpense,
      defaultCommute, setDefaultCommute,
      taxRates, setTaxRates, getMileageRate,
      selectedYear, setSelectedYear,
      importData,
      // Computed: years with data + current year
      getAvailableYears: () => {
        const currentYear = new Date().getFullYear();
        const yearsSet = new Set([currentYear]);
        
        // Extract years from trip entries
        tripEntries.forEach(entry => {
          if (entry.date) yearsSet.add(new Date(entry.date).getFullYear());
          if (entry.endDate) yearsSet.add(new Date(entry.endDate).getFullYear());
        });
        
        // Extract years from mileage entries
        mileageEntries.forEach(entry => {
          if (entry.date) yearsSet.add(new Date(entry.date).getFullYear());
        });
        
        // Extract years from expense entries
        expenseEntries.forEach(entry => {
          if (entry.date) yearsSet.add(new Date(entry.date).getFullYear());
        });
        
        // Extract years from equipment entries - include all depreciation years
        equipmentEntries.forEach(entry => {
          if (entry.date) {
            const purchaseDate = new Date(entry.date);
            const purchaseYear = purchaseDate.getFullYear();
            const price = parseFloat(entry.price);
            const gwgLimit = taxRates?.gwgLimit || 952;
            
            // GWG items: only purchase year
            if (price <= gwgLimit) {
              yearsSet.add(purchaseYear);
            } else {
              // Depreciating assets: add all years with depreciation
              const usefulLifeYears = 3;
              const endYear = purchaseYear + usefulLifeYears;
              
              for (let year = purchaseYear; year <= endYear; year++) {
                // Calculate months for this year
                let monthsInYear = 0;
                if (year === purchaseYear) {
                  monthsInYear = 12 - purchaseDate.getMonth();
                } else if (year < endYear) {
                  monthsInYear = 12;
                } else if (year === endYear) {
                  monthsInYear = purchaseDate.getMonth();
                }
                
                if (monthsInYear > 0) {
                  yearsSet.add(year);
                }
              }
            }
          }
        });
        
        // Extract years from monthly employer expenses
        monthlyEmployerExpenses.forEach(entry => {
          if (entry.year) yearsSet.add(parseInt(entry.year));
        });
        
        return Array.from(yearsSet).sort((a, b) => b - a); // Sort descending (newest first)
      }
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
