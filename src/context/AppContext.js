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
      isMultiDay: true,
      receiptFileName: 'trip-receipt-1001.pdf'
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
      isMultiDay: true,
      receiptFileName: 'trip-receipt-1003.jpg'
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
      isMultiDay: true,
      receiptFileName: 'trip-receipt-1005.pdf'
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
      isMultiDay: false,
      receiptFileName: 'trip-receipt-1008.jpg'
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
      isMultiDay: true,
      receiptFileName: 'trip-receipt-1009.pdf'
    },
    // July trips (Phase 1.1)
    {
      id: 1010,
      date: `${currentYear}-07-08`,
      departureTime: '07:30',
      returnTime: '18:00',
      destination: 'Essen',
      purpose: 'Technische Beratung',
      deductible: 14.0,
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
      deductible: 70.0,
      isMultiDay: true,
      receiptFileName: 'trip-receipt-1011.pdf'
    },
    // August trips (Phase 1.1)
    {
      id: 1012,
      date: `${currentYear}-08-05`,
      departureTime: '08:00',
      returnTime: '17:30',
      destination: 'Bonn',
      purpose: 'Behördentermin',
      deductible: 14.0,
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
      deductible: 70.0,
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
      deductible: 14.0,
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
      deductible: 70.0,
      isMultiDay: true,
      receiptFileName: 'trip-receipt-1015.pdf'
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
      deductible: 98.0,
      isMultiDay: true
    },
    {
      id: 1017,
      date: `${currentYear}-10-25`,
      departureTime: '08:00',
      returnTime: '17:00',
      destination: 'Karlsruhe',
      purpose: 'Technisches Audit',
      deductible: 14.0,
      isMultiDay: false,
      receiptFileName: 'trip-receipt-1017.jpg'
    },
    // November trips (Phase 1.1)
    {
      id: 1018,
      date: `${currentYear}-11-08`,
      departureTime: '08:00',
      returnTime: '18:00',
      destination: 'Bremen',
      purpose: 'Kundenmeeting',
      deductible: 14.0,
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
      deductible: 70.0,
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
      deductible: 14.0,
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
      deductible: 98.0,
      isMultiDay: true,
      receiptFileName: 'trip-receipt-1021.pdf'
    }
  ];

  const mockMileageEntries = [
    // January - Car
    { id: 2001, date: `${currentYear}-01-06`, distance: 285, allowance: 85.50, vehicleType: 'car', relatedTripId: 1001, destination: 'München', receiptFileName: 'mileage-receipt-2001.pdf' },
    { id: 2002, date: `${currentYear}-01-08`, distance: 285, allowance: 85.50, vehicleType: 'car', relatedTripId: 1001, destination: 'München (Rückfahrt)' },
    { id: 2003, date: `${currentYear}-01-15`, distance: 210, allowance: 63.00, vehicleType: 'car', relatedTripId: 1002, destination: 'Stuttgart' },
    { id: 2004, date: `${currentYear}-01-13`, distance: 95, allowance: 28.50, vehicleType: 'car', relatedTripId: 1010, destination: 'Mannheim' },
    { id: 2005, date: `${currentYear}-01-17`, distance: 320, allowance: 96.00, vehicleType: 'car', relatedTripId: 1011, destination: 'Leipzig' },
    { id: 2006, date: `${currentYear}-01-19`, distance: 320, allowance: 96.00, vehicleType: 'car', relatedTripId: 1011, destination: 'Leipzig (Rückfahrt)' },
    // February - Car
    { id: 2007, date: `${currentYear}-02-03`, distance: 470, allowance: 141.00, vehicleType: 'car', relatedTripId: 1003, destination: 'Hamburg', receiptFileName: 'mileage-receipt-2007.jpg' },
    { id: 2008, date: `${currentYear}-02-05`, distance: 470, allowance: 141.00, vehicleType: 'car', relatedTripId: 1003, destination: 'Hamburg (Rückfahrt)' },
    { id: 2009, date: `${currentYear}-02-20`, distance: 180, allowance: 54.00, vehicleType: 'car', relatedTripId: 1004, destination: 'Frankfurt' },
    // March - Car
    { id: 2010, date: `${currentYear}-03-10`, distance: 550, allowance: 165.00, vehicleType: 'car', relatedTripId: 1005, destination: 'Berlin' },
    { id: 2011, date: `${currentYear}-03-14`, distance: 550, allowance: 165.00, vehicleType: 'car', relatedTripId: 1005, destination: 'Berlin (Rückfahrt)' },
    // April - Car & Bike
    { id: 2012, date: `${currentYear}-04-07`, distance: 150, allowance: 45.00, vehicleType: 'car', relatedTripId: 1006, destination: 'Köln' },
    { id: 2013, date: `${currentYear}-04-22`, distance: 220, allowance: 66.00, vehicleType: 'car', relatedTripId: 1007, destination: 'Düsseldorf' },
    { id: 2014, date: `${currentYear}-04-24`, distance: 220, allowance: 66.00, vehicleType: 'car', relatedTripId: 1007, destination: 'Düsseldorf (Rückfahrt)' },
    { id: 2021, date: `${currentYear}-04-15`, distance: 12, allowance: 0.60, vehicleType: 'bike', destination: 'Lokaler Kunde - Stadtmitte' },
    // May - Car, Motorcycle, Bike
    { id: 2015, date: `${currentYear}-05-12`, distance: 165, allowance: 49.50, vehicleType: 'car', relatedTripId: 1008, destination: 'Nürnberg', receiptFileName: 'mileage-receipt-2015.pdf' },
    { id: 2018, date: `${currentYear}-05-20`, distance: 45, allowance: 9.00, vehicleType: 'motorcycle', destination: 'Heidelberg - Kurzstrecke', receiptFileName: 'mileage-receipt-2018.jpg' },
    { id: 2022, date: `${currentYear}-05-03`, distance: 8, allowance: 0.40, vehicleType: 'bike', destination: 'Stadtbüro - Meeting' },
    // June - Car, Motorcycle
    { id: 2016, date: `${currentYear}-06-02`, distance: 420, allowance: 126.00, vehicleType: 'car', relatedTripId: 1009, destination: 'Wien' },
    { id: 2017, date: `${currentYear}-06-06`, distance: 420, allowance: 126.00, vehicleType: 'car', relatedTripId: 1009, destination: 'Wien (Rückfahrt)' },
    { id: 2019, date: `${currentYear}-06-10`, distance: 85, allowance: 17.00, vehicleType: 'motorcycle', destination: 'Karlsruhe - Kundentermin' },
    // July - Car
    { id: 2036, date: `${currentYear}-07-08`, distance: 65, allowance: 19.50, vehicleType: 'car', relatedTripId: 1010, destination: 'Essen' },
    { id: 2037, date: `${currentYear}-07-22`, distance: 260, allowance: 78.00, vehicleType: 'car', relatedTripId: 1011, destination: 'Salzburg', receiptFileName: 'mileage-receipt-2037.pdf' },
    { id: 2038, date: `${currentYear}-07-24`, distance: 260, allowance: 78.00, vehicleType: 'car', relatedTripId: 1011, destination: 'Salzburg (Rückfahrt)' },
    // August - Car, Motorcycle
    { id: 2039, date: `${currentYear}-08-05`, distance: 130, allowance: 39.00, vehicleType: 'car', relatedTripId: 1012, destination: 'Bonn' },
    { id: 2040, date: `${currentYear}-08-19`, distance: 340, allowance: 102.00, vehicleType: 'car', relatedTripId: 1013, destination: 'Graz' },
    { id: 2041, date: `${currentYear}-08-21`, distance: 340, allowance: 102.00, vehicleType: 'car', relatedTripId: 1013, destination: 'Graz (Rückfahrt)' },
    { id: 2020, date: `${currentYear}-08-15`, distance: 120, allowance: 24.00, vehicleType: 'motorcycle', destination: 'Freiburg - Workshop', receiptFileName: 'mileage-receipt-2020.pdf' },
    // September - Car, Bike
    { id: 2024, date: `${currentYear}-09-05`, distance: 195, allowance: 58.50, vehicleType: 'car', relatedTripId: 1014, destination: 'Dresden' },
    { id: 2025, date: `${currentYear}-09-18`, distance: 240, allowance: 72.00, vehicleType: 'car', relatedTripId: 1015, destination: 'Hannover' },
    { id: 2026, date: `${currentYear}-09-20`, distance: 240, allowance: 72.00, vehicleType: 'car', relatedTripId: 1015, destination: 'Hannover (Rückfahrt)' },
    { id: 2023, date: `${currentYear}-09-20`, distance: 15, allowance: 0.75, vehicleType: 'bike', destination: 'Nahversorgung - Büromaterial', receiptFileName: 'mileage-receipt-2023.jpg' },
    // October - Car
    { id: 2027, date: `${currentYear}-10-12`, distance: 310, allowance: 93.00, vehicleType: 'car', relatedTripId: 1016, destination: 'Zürich' },
    { id: 2028, date: `${currentYear}-10-15`, distance: 310, allowance: 93.00, vehicleType: 'car', relatedTripId: 1016, destination: 'Zürich (Rückfahrt)' },
    { id: 2029, date: `${currentYear}-10-25`, distance: 75, allowance: 22.50, vehicleType: 'car', relatedTripId: 1017, destination: 'Karlsruhe' },
    // November - Car
    { id: 2030, date: `${currentYear}-11-08`, distance: 130, allowance: 39.00, vehicleType: 'car', relatedTripId: 1018, destination: 'Bremen' },
    { id: 2031, date: `${currentYear}-11-19`, distance: 105, allowance: 31.50, vehicleType: 'car', relatedTripId: 1019, destination: 'Dortmund' },
    { id: 2032, date: `${currentYear}-11-21`, distance: 105, allowance: 31.50, vehicleType: 'car', relatedTripId: 1019, destination: 'Dortmund (Rückfahrt)' },
    // December - Car
    { id: 2033, date: `${currentYear}-12-05`, distance: 88, allowance: 26.40, vehicleType: 'car', relatedTripId: 1020, destination: 'Wiesbaden' },
    { id: 2034, date: `${currentYear}-12-15`, distance: 420, allowance: 126.00, vehicleType: 'car', relatedTripId: 1021, destination: 'Wien', receiptFileName: 'mileage-receipt-2034.pdf' },
    { id: 2035, date: `${currentYear}-12-18`, distance: 420, allowance: 126.00, vehicleType: 'car', relatedTripId: 1021, destination: 'Wien (Rückfahrt)' }
  ];

  const mockMonthlyExpenses = [
    { id: 3001, year: currentYear, month: 0, amount: 180.00 }, // January - employer reimbursement
    { id: 3002, year: currentYear, month: 1, amount: 220.00 }, // February
    { id: 3003, year: currentYear, month: 2, amount: 350.00 }, // March
    { id: 3004, year: currentYear, month: 3, amount: 150.00 }, // April
    { id: 3005, year: currentYear, month: 4, amount: 45.00 },  // May
    { id: 3006, year: currentYear, month: 5, amount: 280.00 }, // June
    { id: 3007, year: currentYear, month: 6, amount: 120.00 }, // July
    { id: 3008, year: currentYear, month: 7, amount: 190.00 }, // August
    { id: 3009, year: currentYear, month: 8, amount: 240.00 }, // September
    { id: 3010, year: currentYear, month: 9, amount: 310.00 }, // October
    { id: 3011, year: currentYear, month: 10, amount: 175.00 }, // November
    { id: 3012, year: currentYear, month: 11, amount: 265.00 }  // December
  ];

  const mockEquipmentEntries = [
    // Current year equipment
    { id: 4001, date: `${currentYear}-01-10`, name: 'Laptop Dell XPS 15', amount: 1899.00, category: 'IT-Ausstattung', depreciationYears: 3, receiptFileName: 'equipment-receipt-4001.pdf' },
    { id: 4002, date: `${currentYear}-02-15`, name: 'Monitor 27" 4K', amount: 449.00, category: 'IT-Ausstattung', depreciationYears: 0, receiptFileName: 'equipment-receipt-4002.pdf' },
    { id: 4003, date: `${currentYear}-03-20`, name: 'Bürostuhl ergonomisch', amount: 650.00, category: 'Büromöbel', depreciationYears: 0, receiptFileName: 'equipment-receipt-4003.jpg' },
    { id: 4004, date: `${currentYear}-04-05`, name: 'Externe Festplatte 2TB', amount: 89.00, category: 'IT-Ausstattung', depreciationYears: 0, receiptFileName: 'equipment-receipt-4004.pdf' },
    // GWG Boundary Cases (Phase 1.2)
    { id: 4005, date: `${currentYear}-05-10`, name: 'Stehtisch elektrisch', amount: 952.00, category: 'Büromöbel', depreciationYears: 0, receiptFileName: 'equipment-receipt-4005.pdf' },
    { id: 4006, date: `${currentYear}-06-01`, name: 'Konferenztisch hochwertig', amount: 953.00, category: 'Büromöbel', depreciationYears: 3, receiptFileName: 'equipment-receipt-4006.pdf' },
    { id: 4007, date: `${currentYear}-03-15`, name: 'Server Dell PowerEdge', amount: 4500.00, category: 'IT-Ausstattung', depreciationYears: 3, receiptFileName: 'equipment-receipt-4007.pdf' },
    { id: 4008, date: `${currentYear}-07-20`, name: 'Projektor HD', amount: 951.00, category: 'Präsentationstechnik', depreciationYears: 0, receiptFileName: 'equipment-receipt-4008.jpg' },
    // Previous year equipment - Year 2 of depreciation (Phase 1.5)
    { id: 4100, date: `${currentYear - 1}-03-15`, name: 'MacBook Pro 16" M2', amount: 2899.00, category: 'IT-Ausstattung', depreciationYears: 3, receiptFileName: 'equipment-receipt-4100.pdf' },
    { id: 4101, date: `${currentYear - 1}-08-20`, name: 'Drucker Multifunktion HP', amount: 1200.00, category: 'Büroausstattung', depreciationYears: 3, receiptFileName: 'equipment-receipt-4101.pdf' },
    // Two years ago - Year 3/final year of depreciation (Phase 1.5)
    { id: 4200, date: `${currentYear - 2}-05-10`, name: 'Monitor Setup 3x 27" Dell', amount: 1500.00, category: 'IT-Ausstattung', depreciationYears: 3, receiptFileName: 'equipment-receipt-4200.pdf' },
    { id: 4201, date: `${currentYear - 2}-11-05`, name: 'Schreibtisch höhenverstellbar', amount: 1100.00, category: 'Büromöbel', depreciationYears: 3, receiptFileName: 'equipment-receipt-4201.jpg' }
  ];

  const mockExpenseEntries = [
    { id: 5001, date: `${currentYear}-01-05`, description: 'Fachliteratur Steuerwesen', amount: 45.00, category: 'Bücher', receiptFileName: 'expense-receipt-5001.pdf' },
    { id: 5002, date: `${currentYear}-01-15`, description: 'Office 365 Jahresabo', amount: 99.00, category: 'Software', receiptFileName: 'expense-receipt-5002.pdf' },
    { id: 5003, date: `${currentYear}-01-22`, description: 'Druckerpapier & Toner', amount: 78.00, category: 'Büromaterial' },
    { id: 5004, date: `${currentYear}-02-03`, description: 'USB-C Adapter', amount: 29.90, category: 'IT-Zubehör', receiptFileName: 'expense-receipt-5004.jpg' },
    { id: 5005, date: `${currentYear}-02-14`, description: 'Visitenkarten 500 Stück', amount: 35.00, category: 'Marketing' },
    { id: 5006, date: `${currentYear}-02-28`, description: 'Webcam HD Logitech', amount: 89.00, category: 'IT-Zubehör', receiptFileName: 'expense-receipt-5006.pdf' },
    { id: 5007, date: `${currentYear}-03-07`, description: 'Arbeitshandschuhe 10er Pack', amount: 24.50, category: 'Arbeitskleidung' },
    { id: 5008, date: `${currentYear}-03-18`, description: 'Fachliteratur Projektmanagement', amount: 52.00, category: 'Bücher', receiptFileName: 'expense-receipt-5008.pdf' },
    { id: 5009, date: `${currentYear}-03-25`, description: 'Bildschirmreiniger Set', amount: 15.90, category: 'Büromaterial' },
    { id: 5010, date: `${currentYear}-04-02`, description: 'Kabelmanagement Schreibtisch', amount: 19.99, category: 'Büromaterial' },
    { id: 5011, date: `${currentYear}-04-12`, description: 'Präsentationsmaterial', amount: 67.50, category: 'Marketing', receiptFileName: 'expense-receipt-5011.jpg' },
    { id: 5012, date: `${currentYear}-04-28`, description: 'Antivirensoftware 1 Jahr', amount: 39.99, category: 'Software' },
    { id: 5013, date: `${currentYear}-05-08`, description: 'Schreibtischlampe LED', amount: 49.90, category: 'Büromöbel' },
    { id: 5014, date: `${currentYear}-05-19`, description: 'Bluetooth Maus', amount: 34.99, category: 'IT-Zubehör', receiptFileName: 'expense-receipt-5014.pdf' },
    { id: 5015, date: `${currentYear}-05-30`, description: 'Kalender & Planer 2026', amount: 18.50, category: 'Büromaterial' },
    { id: 5016, date: `${currentYear}-06-05`, description: 'Kopfhörer Noise Cancelling', amount: 159.00, category: 'IT-Zubehör', receiptFileName: 'expense-receipt-5016.pdf' },
    { id: 5017, date: `${currentYear}-06-16`, description: 'Cloud-Speicher Jahresabo', amount: 119.00, category: 'Software', receiptFileName: 'expense-receipt-5017.pdf' },
    { id: 5018, date: `${currentYear}-06-27`, description: 'Dokumentenhalter', amount: 22.90, category: 'Büromaterial' },
    { id: 5019, date: `${currentYear}-07-10`, description: 'Sicherheitsschuhe S3', amount: 89.00, category: 'Arbeitskleidung', receiptFileName: 'expense-receipt-5019.jpg' },
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
        
        // Extract years from equipment entries
        equipmentEntries.forEach(entry => {
          if (entry.purchaseDate) yearsSet.add(new Date(entry.purchaseDate).getFullYear());
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
