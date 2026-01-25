"use client";
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Header() {
  const pathname = usePathname();
  const { 
    selectedYear, 
    setSelectedYear, 
    getAvailableYears,
    tripEntries = [],
    mileageEntries = [],
    expenseEntries = [],
    equipmentEntries = [],
    taxRates
  } = useAppContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Get years that have data + current year
  const years = getAvailableYears ? getAvailableYears() : [new Date().getFullYear()];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Filter entries by selected year
  const filteredTripEntries = tripEntries.filter(entry => {
    const entryYear = new Date(entry.date).getFullYear();
    return entryYear === selectedYear;
  });

  const filteredExpenseEntries = expenseEntries.filter(entry => {
    const entryYear = new Date(entry.date).getFullYear();
    return entryYear === selectedYear;
  });

  // Helper function to calculate equipment deductible for a specific year
  const calculateEquipmentDeductible = (entry, year, taxRates) => {
    const purchaseDate = new Date(entry.date);
    const purchaseYear = purchaseDate.getFullYear();
    const price = parseFloat(entry.price);
    const gwgLimit = taxRates?.gwgLimit || 952;
    
    // GWG: Full amount in purchase year only
    if (price <= gwgLimit) {
      return year === purchaseYear ? price : 0;
    }
    
    // Depreciating Assets
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

  // Calculate equipment entries with deductibles for selected year
  const equipmentWithDeductibles = equipmentEntries.map(entry => ({
    entry,
    deductible: calculateEquipmentDeductible(entry, selectedYear, taxRates)
  }));

  const filteredEquipmentEntries = equipmentWithDeductibles
    .filter(item => item.deductible > 0)
    .map(item => item.entry);

  // Calculate totals
  const tripTotal = filteredTripEntries.reduce((sum, entry) => {
    const relatedMileage = mileageEntries.filter(m => m.relatedTripId === entry.id);
    const dayMileage = relatedMileage.length > 0
      ? relatedMileage
      : mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);
    
    const tripTo = dayMileage.find(m => m.purpose && m.purpose.includes('Beginn'));
    const tripFrom = dayMileage.find(m => m.purpose && m.purpose.includes('Ende'));
    const amountTo = tripTo ? tripTo.allowance : 0;
    const amountFrom = tripFrom ? tripFrom.allowance : 0;
    
    const publicTransportEntries = dayMileage.filter(m => m.vehicleType === 'public_transport');
    const publicTransportSum = publicTransportEntries.reduce((s, m) => s + (m.allowance || 0), 0);
    
    const mileageSum = amountTo + amountFrom + publicTransportSum;
    return sum + (entry.deductible || 0) + mileageSum;
  }, 0);

  const expenseTotal = filteredExpenseEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
  const equipmentTotal = equipmentWithDeductibles
    .filter(item => item.deductible > 0)
    .reduce((sum, item) => sum + item.deductible, 0);

  const getPageConfig = () => {
    if (pathname === '/') return { 
      title: 'Dashboard', 
      icon: null,
      iconBg: '',
      iconColor: '',
      count: 0,
      total: 0,
      totalPrefix: '',
      totalColor: ''
    };
    if (pathname.startsWith('/trips')) return { 
      title: 'Fahrtenbuch',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      count: filteredTripEntries.length,
      total: tripTotal,
      totalPrefix: '+',
      totalColor: 'text-emerald-600'
    };
    if (pathname.startsWith('/equipment')) return { 
      title: 'Arbeitsmittel',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      count: filteredEquipmentEntries.length,
      total: equipmentTotal,
      totalPrefix: '+',
      totalColor: 'text-blue-600'
    };
    if (pathname.startsWith('/expenses')) return { 
      title: 'Ausgaben',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: 'bg-rose-500/10',
      iconColor: 'text-rose-600',
      count: filteredExpenseEntries.length,
      total: expenseTotal,
      totalPrefix: '-',
      totalColor: 'text-rose-600'
    };
    if (pathname.startsWith('/settings')) return { 
      title: 'Einstellungen',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      iconBg: 'bg-gray-500/10',
      iconColor: 'text-gray-600',
      count: 0,
      total: 0,
      totalPrefix: '',
      totalColor: ''
    };
    return { title: '', icon: null, iconBg: '', iconColor: '', count: 0, total: 0, totalPrefix: '', totalColor: '' };
  };

  const pageConfig = getPageConfig();

  // Scroll to top instantly on navigation to avoid leftover scroll positions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scrollTopNow = () => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      scrollTopNow();
      requestAnimationFrame(scrollTopNow);
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md pt-[env(safe-area-inset-top)] border-b border-gray-100 flex justify-center shrink-0">
      <div className="flex h-16 items-center justify-between max-w-4xl w-full px-4">
        <div className="flex items-center gap-3">
          {pageConfig.icon && (
            <div className={`w-10 h-10 rounded-xl ${pageConfig.iconBg} flex items-center justify-center ${pageConfig.iconColor}`}>
              {pageConfig.icon}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold tracking-tight text-gray-900">
              {pageConfig.title}
            </h1>
            {pageConfig.icon && pageConfig.count !== undefined && (
              <p className="text-xs text-muted-foreground">
                {pageConfig.count} Einträge • <span className={`${pageConfig.totalColor} font-medium`}>{pageConfig.totalPrefix}{pageConfig.total.toFixed(2)} €</span>
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-all duration-200 border border-gray-200 group active:scale-95"
            >
              <span className="text-sm font-bold text-blue-600">{selectedYear}</span>
              <svg 
                className={`w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-base transition-colors flex items-center justify-between
                      ${selectedYear === year 
                        ? 'bg-blue-50 text-blue-600 font-bold' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {year}
                    {selectedYear === year && (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
