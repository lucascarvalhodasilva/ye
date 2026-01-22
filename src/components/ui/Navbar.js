"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Navbar() {
  const pathname = usePathname();
  const { selectedYear, setSelectedYear, getAvailableYears } = useAppContext();
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

  const navItems = [
    { name: 'Dashboard', href: '/', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { name: 'Reisen', href: '/trips', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { name: 'Mittel', href: '/equipment', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )},
    { name: 'Optionen', href: '/settings', icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/trips')) return 'Fahrtenbuch';
    if (pathname.startsWith('/equipment')) return 'Arbeitsmittel';
    if (pathname.startsWith('/expenses')) return 'Ausgaben';
    if (pathname.startsWith('/settings')) return 'Einstellungen';
    return '';
  };

  // Scroll to top instantly on navigation to avoid leftover scroll positions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Try all targets to ensure we really jump to top on mobile
      const scrollTopNow = () => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      // Run immediately and once after paint to catch late layout shifts
      scrollTopNow();
      requestAnimationFrame(scrollTopNow);
    }
  }, [pathname]);

  return (
    <>
      {/* Top Bar: Page Title + Year Selector */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md pt-[env(safe-area-inset-top)] border-b border-gray-100 flex justify-center">
        <div className="flex h-16 items-center justify-between max-w-4xl w-full px-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {getPageTitle()}
          </h1>
          
          <div className="flex items-center gap-2">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium transition-all duration-200 border border-gray-200 group active:scale-95"
              >
                <span className="text-xs uppercase tracking-wider text-gray-500 group-hover:text-blue-600 transition-colors hidden sm:inline">Steuerjahr</span>
                <span className="text-base font-bold text-blue-600">{selectedYear}</span>
                <svg 
                  className={`w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 15l-6-6-6 6" />
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
      </nav>

      {/* Bottom Navigation - Always visible for Tablet App feel */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl bg-white/90 backdrop-blur-xl border-t border-gray-100 pb-[env(safe-area-inset-bottom)] px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.08)] overflow-visible">
        <div className="flex justify-around items-center h-20 px-6 max-w-md mx-auto relative">
          {/* Dashboard */}
          <Link 
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 active:scale-90 transition-all duration-200 group ${
              pathname === '/' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${pathname === '/' ? 'bg-blue-50 -translate-y-0.5' : 'group-hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Expenses */}
          <Link 
            href="/expenses"
            className={`flex flex-col items-center justify-center space-y-1 active:scale-90 transition-all duration-200 group ${
              pathname.startsWith('/expenses') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${pathname.startsWith('/expenses') ? 'bg-blue-50 -translate-y-0.5' : 'group-hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">Ausgaben</span>
          </Link>

          {/* Trips - Main Highlight */}
          <Link 
            href="/trips"
            className="relative -top-6 group flex flex-col items-center"
          >
            <div className={`flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
              pathname.startsWith('/trips') 
                ? 'bg-blue-600 text-white scale-105 ring-4 ring-white' 
                : 'bg-blue-600 text-white ring-4 ring-white hover:bg-blue-700'
            }`}>
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className={`text-[10px] font-medium mt-1 ${
              pathname.startsWith('/trips') ? 'text-blue-600' : 'text-gray-400'
            }`}>Fahrten</span>
          </Link>

          {/* Equipment */}
          <Link 
            href="/equipment"
            className={`flex flex-col items-center justify-center space-y-1 active:scale-90 transition-all duration-200 group ${
              pathname.startsWith('/equipment') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${pathname.startsWith('/equipment') ? 'bg-blue-50 -translate-y-0.5' : 'group-hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">Mittel</span>
          </Link>

          {/* Settings */}
          <Link 
            href="/settings"
            className={`flex flex-col items-center justify-center space-y-1 active:scale-90 transition-all duration-200 group ${
              pathname.startsWith('/settings') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all duration-300 ${pathname.startsWith('/settings') ? 'bg-blue-50 -translate-y-0.5' : 'group-hover:bg-gray-100'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-medium">Optionen</span>
          </Link>
        </div>
      </div>
      
   
    </>
  );
}
