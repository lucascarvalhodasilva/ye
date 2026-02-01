"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

const AppContext = createContext();

// ============================================
// ARCHITECTURE CONSTRAINT & TAX SEMANTICS
// ============================================
/**
 * TAX PERSPECTIVE:
 * From a tax standpoint, what matters is the HOURS AWAY FROM HOME WHILE WORKING.
 * The trip is the organizational unit that contains these work hours.
 * 
 * TWO TYPES OF TAX DEDUCTIONS (both tied to a trip):
 * 
 * 1. MEAL ALLOWANCES (Verpflegungspauschale)
 *    - CALCULATED FROM: Hours away from home (departureTime → returnTime)
 *    - Stored in: trip.mealAllowance
 *    - Tax logic: Time away from home ≥ 8h = €14, multi-day trips = more
 *    - User does NOT input this - it's computed from trip duration
 * 
 * 2. TRANSPORT ALLOWANCES (Fahrtkosten)
 *    - CALCULATED FROM: Distance traveled OR actual ticket costs
 *    - Stored in: trip.transportRecords[] (nested array)
 *    - Tax logic:
 *      • Car/Motorcycle/Bike: distance × rate (e.g., 100km × €0.30)
 *      • Public transport: User-provided actual ticket cost
 *    - Precomputed sum stored in: trip.sumTransportAllowances
 * 
 * DATA MODEL:
 * - tripEntries: Business activity containing ALL trip data
 *   {
 *     id, date, endDate, departureTime, returnTime,
 *     destination, purpose,
 *     mealAllowance: 14.00,              // Calculated from time
 *     transportRecords: [                // Nested transport data
 *       { id, date, distance, allowance, vehicleType, destination },
 *       { id, date, allowance, vehicleType: 'public_transport', ... }
 *     ],
 *     sumTransportAllowances: 171.00,    // Precomputed sum for performance
 *     isMultiDay
 *   }
 * 
 * NESTED STRUCTURE BENEFITS:
 * - Direct access: trip.transportRecords (no filtering needed)
 * - Performance: trip.sumTransportAllowances (no iteration needed)
 * - Data integrity: Transport records can't exist without parent trip
 * - Simpler queries: No joins needed - all trip data in one object
 * - Cleaner code: No relatedTripId foreign key management
 * 
 * ARCHITECTURAL CONSTRAINT:
 * Both meal and transport allowances can ONLY exist as part of a trip.
 * Standalone recording is NOT allowed - they have no tax basis without
 * the work hours context that a trip provides.
 */

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================
const ENABLE_MOCK_DATA = process.env.NODE_ENV === 'development'; // Only enabled in dev mode

const generateMockData = (currentYear) => {
  const mockTripEntries = [
    // ============================================
    // TRIP STRUCTURE NOTE (TAX DEDUCTIONS):
    // A trip represents WORK HOURS AWAY FROM HOME, which creates two tax deductions:
    // 
    // 1. MEAL ALLOWANCE (stored in mealAllowance field):
    //    - Calculated from: departureTime → returnTime duration
    //    - Example: >8h = €14, multi-day trips = more
    //    - User does NOT input - auto-calculated
    // 
    // 2. TRANSPORT ALLOWANCE (stored in transportRecords array - nested):
    //    - Calculated from: distance × rate OR actual ticket cost
    //    - Example: 100km car trip = 100 × €0.30 = €30.00
    //    - Car/bike: calculated; Public transport: user provides cost
    //    - sumTransportAllowances: Precomputed total for performance
    // 
    // Both are deductible ONLY because they occurred during work hours.
    // ============================================
    // January trips
    {
      id: 1001,
      date: `${currentYear}-01-06`,
      endDate: `${currentYear}-01-08`,
      departureTime: '06:30',
      returnTime: '20:00',
      destination: 'München',
      purpose: 'Kundentermin BMW',
      mealAllowance: 70.0, // 2 full days + 2 travel days
      transportRecords: [
        { id: 2001, date: `${currentYear}-01-06`, distance: 285, allowance: 85.50, vehicleType: 'car', destination: 'München' },
        { id: 2002, date: `${currentYear}-01-08`, distance: 285, allowance: 85.50, vehicleType: 'car', destination: 'München (Rückfahrt)' }
      ],
      sumTransportAllowances: 171.00,
      isMultiDay: true,
    },
    {
      id: 1002,
      date: `${currentYear}-01-15`,
      departureTime: '07:00',
      returnTime: '19:30',
      destination: 'Stuttgart',
      purpose: 'Messe Besuch',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2003, date: `${currentYear}-01-15`, distance: 210, allowance: 63.00, vehicleType: 'car', destination: 'Stuttgart' }
      ],
      sumTransportAllowances: 63.00,
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
      mealAllowance: 70.0,
      transportRecords: [
        { id: 2007, date: `${currentYear}-02-03`, distance: 470, allowance: 141.00, vehicleType: 'car', destination: 'Hamburg' },
        { id: 2008, date: `${currentYear}-02-05`, distance: 470, allowance: 141.00, vehicleType: 'car', destination: 'Hamburg (Rückfahrt)' }
      ],
      sumTransportAllowances: 282.00,
      isMultiDay: true,
    },
    {
      id: 1004,
      date: `${currentYear}-02-20`,
      departureTime: '08:00',
      returnTime: '18:00',
      destination: 'Frankfurt',
      purpose: 'Banktermin',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2009, date: `${currentYear}-02-20`, distance: 180, allowance: 54.00, vehicleType: 'car', destination: 'Frankfurt' }
      ],
      sumTransportAllowances: 54.00,
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
      mealAllowance: 126.0,
      transportRecords: [
        { id: 2010, date: `${currentYear}-03-10`, distance: 550, allowance: 165.00, vehicleType: 'car', destination: 'Berlin' },
        { id: 2011, date: `${currentYear}-03-14`, distance: 550, allowance: 165.00, vehicleType: 'car', destination: 'Berlin (Rückfahrt)' }
      ],
      sumTransportAllowances: 330.00,
      isMultiDay: true,
    },
    // April trips
    {
      id: 1006,
      date: `${currentYear}-04-07`,
      departureTime: '07:30',
      returnTime: '17:30',
      destination: 'Köln',
      purpose: 'Lieferantengespräch',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2012, date: `${currentYear}-04-07`, distance: 150, allowance: 45.00, vehicleType: 'car', destination: 'Köln' }
      ],
      sumTransportAllowances: 45.00,
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
      mealAllowance: 70.0,
      transportRecords: [
        { id: 2013, date: `${currentYear}-04-22`, distance: 220, allowance: 66.00, vehicleType: 'car', destination: 'Düsseldorf' },
        { id: 2014, date: `${currentYear}-04-24`, distance: 220, allowance: 66.00, vehicleType: 'car', destination: 'Düsseldorf (Rückfahrt)' }
      ],
      sumTransportAllowances: 132.00,
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
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2015, date: `${currentYear}-05-12`, distance: 165, allowance: 49.50, vehicleType: 'car', destination: 'Nürnberg' }
      ],
      sumTransportAllowances: 49.50,
      isMultiDay: false,
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
      mealAllowance: 140.0,
      transportRecords: [
        { id: 2016, date: `${currentYear}-06-02`, distance: 420, allowance: 126.00, vehicleType: 'car', destination: 'Wien' },
        { id: 2017, date: `${currentYear}-06-06`, distance: 420, allowance: 126.00, vehicleType: 'car', destination: 'Wien (Rückfahrt)' }
      ],
      sumTransportAllowances: 252.00,
      isMultiDay: true,
    },
    // July trips (Phase 1.1)
    {
      id: 1010,
      date: `${currentYear}-07-08`,
      departureTime: '07:30',
      returnTime: '18:00',
      destination: 'Essen',
      purpose: 'Technische Beratung',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2036, date: `${currentYear}-07-08`, distance: 65, allowance: 19.50, vehicleType: 'car', destination: 'Essen' }
      ],
      sumTransportAllowances: 19.50,
      isMultiDay: false
    },
    {
      id: 1011,
      date: `${currentYear}-07-22`,
      endDate: `${currentYear}-07-24`,
      departureTime: '06:00',
      returnTime: '20:00',
      destination: 'Salzburg',
      purpose: 'Sommerseminar',
      mealAllowance: 70.0,
      transportRecords: [
        { id: 2037, date: `${currentYear}-07-22`, distance: 260, allowance: 78.00, vehicleType: 'car', destination: 'Salzburg' },
        { id: 2038, date: `${currentYear}-07-24`, distance: 260, allowance: 78.00, vehicleType: 'car', destination: 'Salzburg (Rückfahrt)' }
      ],
      sumTransportAllowances: 156.00,
      isMultiDay: true,
    },
    // August trips (Phase 1.1)
    {
      id: 1012,
      date: `${currentYear}-08-05`,
      departureTime: '08:00',
      returnTime: '17:30',
      destination: 'Bonn',
      purpose: 'Behördentermin',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2039, date: `${currentYear}-08-05`, distance: 130, allowance: 39.00, vehicleType: 'car', destination: 'Bonn' }
      ],
      sumTransportAllowances: 39.00,
      isMultiDay: false
    },
    {
      id: 1013,
      date: `${currentYear}-08-19`,
      endDate: `${currentYear}-08-21`,
      departureTime: '06:30',
      returnTime: '19:30',
      destination: 'Graz',
      purpose: 'Strategiemeeting',
      mealAllowance: 70.0,
      transportRecords: [
        { id: 2040, date: `${currentYear}-08-19`, distance: 340, allowance: 102.00, vehicleType: 'car', destination: 'Graz' },
        { id: 2041, date: `${currentYear}-08-21`, distance: 340, allowance: 102.00, vehicleType: 'car', destination: 'Graz (Rückfahrt)' }
      ],
      sumTransportAllowances: 204.00,
      isMultiDay: true
    },
    // September trips (Phase 1.1)
    {
      id: 1014,
      date: `${currentYear}-09-05`,
      departureTime: '07:00',
      returnTime: '19:00',
      destination: 'Dresden',
      purpose: 'Herbstmesse Besuch',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2024, date: `${currentYear}-09-05`, distance: 195, allowance: 58.50, vehicleType: 'car', destination: 'Dresden' }
      ],
      sumTransportAllowances: 58.50,
      isMultiDay: false
    },
    {
      id: 1015,
      date: `${currentYear}-09-18`,
      endDate: `${currentYear}-09-20`,
      departureTime: '06:30',
      returnTime: '20:30',
      destination: 'Hannover',
      purpose: 'Produktpräsentation',
      mealAllowance: 70.0,
      transportRecords: [
        { id: 2025, date: `${currentYear}-09-18`, distance: 240, allowance: 72.00, vehicleType: 'car', destination: 'Hannover' },
        { id: 2026, date: `${currentYear}-09-20`, distance: 240, allowance: 72.00, vehicleType: 'car', destination: 'Hannover (Rückfahrt)' }
      ],
      sumTransportAllowances: 144.00,
      isMultiDay: true,
    },
    // October trips (Phase 1.1)
    {
      id: 1016,
      date: `${currentYear}-10-12`,
      endDate: `${currentYear}-10-15`,
      departureTime: '06:00',
      returnTime: '21:00',
      destination: 'Zürich',
      purpose: 'Internationale Konferenz',
      mealAllowance: 98.0,
      transportRecords: [
        { id: 2027, date: `${currentYear}-10-12`, distance: 310, allowance: 93.00, vehicleType: 'car', destination: 'Zürich' },
        { id: 2028, date: `${currentYear}-10-15`, distance: 310, allowance: 93.00, vehicleType: 'car', destination: 'Zürich (Rückfahrt)' }
      ],
      sumTransportAllowances: 186.00,
      isMultiDay: true
    },
    {
      id: 1017,
      date: `${currentYear}-10-25`,
      departureTime: '08:00',
      returnTime: '17:00',
      destination: 'Karlsruhe',
      purpose: 'Technisches Audit',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2029, date: `${currentYear}-10-25`, distance: 75, allowance: 22.50, vehicleType: 'car', destination: 'Karlsruhe' }
      ],
      sumTransportAllowances: 22.50,
      isMultiDay: false,
    },
    // November trips (Phase 1.1)
    {
      id: 1018,
      date: `${currentYear}-11-08`,
      departureTime: '08:00',
      returnTime: '18:00',
      destination: 'Bremen',
      purpose: 'Kundenmeeting',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2030, date: `${currentYear}-11-08`, distance: 130, allowance: 39.00, vehicleType: 'car', destination: 'Bremen' }
      ],
      sumTransportAllowances: 39.00,
      isMultiDay: false
    },
    {
      id: 1019,
      date: `${currentYear}-11-19`,
      endDate: `${currentYear}-11-21`,
      departureTime: '06:00',
      returnTime: '20:00',
      destination: 'Dortmund',
      purpose: 'Workshop Digitalisierung',
      mealAllowance: 70.0,
      transportRecords: [
        { id: 2031, date: `${currentYear}-11-19`, distance: 105, allowance: 31.50, vehicleType: 'car', destination: 'Dortmund' },
        { id: 2032, date: `${currentYear}-11-21`, distance: 105, allowance: 31.50, vehicleType: 'car', destination: 'Dortmund (Rückfahrt)' }
      ],
      sumTransportAllowances: 63.00,
      isMultiDay: true
    },
    // December trips (Phase 1.1)
    {
      id: 1020,
      date: `${currentYear}-12-05`,
      departureTime: '07:30',
      returnTime: '19:30',
      destination: 'Wiesbaden',
      purpose: 'Jahresplanung Meeting',
      mealAllowance: 14.0,
      transportRecords: [
        { id: 2033, date: `${currentYear}-12-05`, distance: 88, allowance: 26.40, vehicleType: 'car', destination: 'Wiesbaden' }
      ],
      sumTransportAllowances: 26.40,
      isMultiDay: false
    },
    {
      id: 1021,
      date: `${currentYear}-12-15`,
      endDate: `${currentYear}-12-18`,
      departureTime: '05:30',
      returnTime: '22:00',
      destination: 'Wien',
      purpose: 'Jahresabschluss-Workshop',
      mealAllowance: 98.0,
      transportRecords: [
        { id: 2034, date: `${currentYear}-12-15`, distance: 420, allowance: 126.00, vehicleType: 'car', destination: 'Wien' },
        { id: 2035, date: `${currentYear}-12-18`, distance: 420, allowance: 126.00, vehicleType: 'car', destination: 'Wien (Rückfahrt)' }
      ],
      sumTransportAllowances: 252.00,
      isMultiDay: true,
    }
  ];

  const mockMonthlyExpenses = [
    { id: 3001, year: currentYear, month: 1, amount: 180.00, note: 'Monatspauschale' }, // January - employer reimbursement
    { id: 3002, year: currentYear, month: 2, amount: 220.00, note: 'Monatspauschale' }, // February
    { id: 3003, year: currentYear, month: 3, amount: 350.00, note: 'Monatspauschale' }, // March
    { id: 3004, year: currentYear, month: 4, amount: 150.00, note: 'Monatspauschale' }, // April
    { id: 3005, year: currentYear, month: 5, amount: 45.00, note: 'Monatspauschale' },  // May
    { id: 3006, year: currentYear, month: 6, amount: 280.00, note: 'Monatspauschale' }, // June
    { id: 3007, year: currentYear, month: 7, amount: 120.00, note: 'Monatspauschale' }, // July
    { id: 3008, year: currentYear, month: 8, amount: 190.00, note: 'Monatspauschale' }, // August
    { id: 3009, year: currentYear, month: 9, amount: 240.00, note: 'Monatspauschale' }, // September
    { id: 3010, year: currentYear, month: 10, amount: 310.00, note: 'Monatspauschale' }, // October
    { id: 3011, year: currentYear, month: 11, amount: 175.00, note: 'Monatspauschale' }, // November
    { id: 3012, year: currentYear, month: 12, amount: 265.00, note: 'Monatspauschale' }  // December
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
    monthlyEmployerExpenses: mockMonthlyExpenses,
    equipmentEntries: mockEquipmentEntries,
    expenseEntries: mockExpenseEntries
  };
};

// Helper to delete receipt files (used for transport record receipts nested in trips)
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

// Helper to calculate sum of transport allowances from nested records
const calculateTransportSum = (transportRecords = []) => {
  return transportRecords.reduce((sum, record) => sum + (record.allowance || 0), 0);
};

export function AppProvider({ children}) {
  const [tripEntries, setTripEntries] = useState([]);
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
    const storedEquipment = localStorage.getItem('equipmentEntries');
    const storedExpenses = localStorage.getItem('expenseEntries');
    const storedMonthlyExpenses = localStorage.getItem('monthlyEmployerExpenses');
    const storedDefaultCommute = localStorage.getItem('defaultCommute');
    const storedTaxRates = localStorage.getItem('taxRates');

    // Load data from localStorage
    if (storedTrips) {
      const trips = JSON.parse(storedTrips);
      setTripEntries(trips);
    } else if (ENABLE_MOCK_DATA) {
      // Load mock data for development
      const mockData = generateMockData(new Date().getFullYear());
      setTripEntries(mockData.tripEntries);
      setMonthlyEmployerExpenses(mockData.monthlyEmployerExpenses);
      setEquipmentEntries(mockData.equipmentEntries);
      setExpenseEntries(mockData.expenseEntries);
    }

    if (storedEquipment) setEquipmentEntries(JSON.parse(storedEquipment));
    if (storedExpenses) setExpenseEntries(JSON.parse(storedExpenses));
    if (storedMonthlyExpenses) setMonthlyEmployerExpenses(JSON.parse(storedMonthlyExpenses));
    if (storedDefaultCommute) setDefaultCommute(JSON.parse(storedDefaultCommute));
    if (storedTaxRates) {
      const parsedRates = JSON.parse(storedTaxRates);
      setTaxRates(prev => ({ ...prev, ...parsedRates }));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('mealEntries', JSON.stringify(tripEntries));
  }, [tripEntries]);

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
    // Ensure transportRecords and sumTransportAllowances exist
    const newEntry = { 
      ...entry, 
      id: entry.id || Date.now(),
      transportRecords: entry.transportRecords || [],
      sumTransportAllowances: entry.sumTransportAllowances || 0
    };
    setTripEntries(prev => [...prev, newEntry]);
  };

  const deleteTripEntry = (id) => {
    // With nested structure, deleting trip automatically deletes transport records
    // No need for cascade deletion logic
    setTripEntries(prev => {
      const trip = prev.find(t => t.id === id);
      // Delete receipt files from transport records
      if (trip?.transportRecords) {
        trip.transportRecords.forEach(record => {
          if (record.receiptFileName) {
            deleteReceiptFiles(record.receiptFileName, record.date);
          }
        });
      }
      return prev.filter(e => e.id !== id);
    });
  };

  const updateTripEntry = (id, updatedEntry) => {
    setTripEntries(prev => prev.map(entry => {
      if (entry.id === id) {
        const updated = { ...entry, ...updatedEntry };
        // Recalculate sum if transportRecords changed
        if (updatedEntry.transportRecords) {
          updated.sumTransportAllowances = calculateTransportSum(updatedEntry.transportRecords);
        }
        return updated;
      }
      return entry;
    }));
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

  const updateMonthlyEmployerExpense = (id, updatedEntry) => {
    setMonthlyEmployerExpenses(prev => prev.map(entry => entry.id === id ? { ...entry, ...updatedEntry } : entry));
  };

  const deleteMonthlyEmployerExpense = (id) => {
    setMonthlyEmployerExpenses(prev => prev.filter(e => e.id !== id));
  };

  const getSpesenForYear = (year) => {
    return monthlyEmployerExpenses.filter(e => e.year === year);
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
      // Only support v1.0.0 format (trips with nested transportRecords)
      if (data.trips) {
        setTripEntries(data.trips || []);
      }
      
      if (data.equipment) setEquipmentEntries(data.equipment);
      if (data.equipmentEntries) setEquipmentEntries(data.equipmentEntries);
      if (data.expenses) setExpenseEntries(data.expenses);
      if (data.expenseEntries) setExpenseEntries(data.expenseEntries);
      if (data.monthlyEmployerExpenses) setMonthlyEmployerExpenses(data.monthlyEmployerExpenses);
      if (data.defaultCommute) setDefaultCommute(data.defaultCommute);
      if (data.taxRates) setTaxRates(data.taxRates);
      if (data.selectedYear) setSelectedYear(data.selectedYear);
      
      // Handle settings object format
      if (data.settings) {
        if (data.settings.monthlyEmployerExpenses) setMonthlyEmployerExpenses(data.settings.monthlyEmployerExpenses);
        if (data.settings.defaultCommute) setDefaultCommute(data.settings.defaultCommute);
        if (data.settings.taxRates) setTaxRates(data.settings.taxRates);
        if (data.settings.selectedYear) setSelectedYear(data.settings.selectedYear);
      }
      
      return true;
    } catch (e) {
      console.error("Import failed", e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      tripEntries, addTripEntry, deleteTripEntry, updateTripEntry,
      equipmentEntries, addEquipmentEntry, deleteEquipmentEntry, updateEquipmentEntry,
      expenseEntries, addExpenseEntry, deleteExpenseEntry,
      monthlyEmployerExpenses, addMonthlyEmployerExpense, updateMonthlyEmployerExpense, deleteMonthlyEmployerExpense, getSpesenForYear,
      defaultCommute, setDefaultCommute,
      taxRates, setTaxRates, getMileageRate,
      selectedYear, setSelectedYear,
      importData,
      // Helper for calculating transport sum
      calculateTransportSum,
      // Computed: years with data + current year
      getAvailableYears: () => {
        const currentYear = new Date().getFullYear();
        const yearsSet = new Set([currentYear]);
        
        // Extract years from trip entries
        tripEntries.forEach(entry => {
          if (entry.date) yearsSet.add(new Date(entry.date).getFullYear());
          if (entry.endDate) yearsSet.add(new Date(entry.endDate).getFullYear());
          // Extract years from nested transport records
          if (entry.transportRecords) {
            entry.transportRecords.forEach(record => {
              if (record.date) yearsSet.add(new Date(record.date).getFullYear());
            });
          }
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
