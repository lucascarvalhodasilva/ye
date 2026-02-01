"use client";
import React, { useState, useEffect } from 'react';
import SpesenSideNav from './SpesenSideNav';
import TaxDeductibleChart from './TaxDeductibleChart';
import { useUIContext } from '@/context/UIContext';

/**
 * @typedef {'default' | 'negative' | 'clickable'} KPIVariant
 */

/**
 * A single KPI item displaying an icon, label, and value.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - The icon to display
 * @param {string} props.label - The label text for the KPI
 * @param {string} props.value - The formatted value to display
 * @param {KPIVariant} [props.variant='default'] - Visual variant ('default', 'negative', or 'clickable')
 * @param {Function} [props.onClick] - Optional click handler
 * @returns {JSX.Element} The rendered KPI item
 */
const KPIItem = ({ icon, label, value, variant = 'default', onClick }) => {
  const variants = {
    default: 'bg-gray-300/40 dark:bg-gray/5',
    negative: 'bg-red-50/80 dark:bg-red-400/10',
    clickable: 'bg-yellow-500/20 cursor-pointer hover:bg-yellow-500/60 hover:scale-105',
  };

  const textVariants = {
    default: 'text-foreground',
    negative: 'text-red-600 dark:text-red-400',
    clickable: 'text-foreground',
  };

  const iconVariants = {
    default: 'bg-primary/10 text-primary',
    negative: 'bg-primary/10 text-primary',
    clickable: 'bg-yellow-500/20 text-yellow-700',
  };

  return (
    <div 
      className={`${variants[variant]} rounded-xl p-4 flex items-center gap-4 transition-all ${onClick ? 'hover:scale-[1.02]' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`w-10 h-10 rounded-lg ${iconVariants[variant]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-[10px] uppercase font-medium tracking-wide truncate mb-1 text-muted-foreground`}>{label}</p>
        <p className={`text-sm font-bold ${textVariants[variant]} truncate`}>{value}</p>
      </div>
      {onClick && (
        <svg className="w-4 h-4 text-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
};
/**
 * @typedef {Object} DashboardKPIsProps
 * @property {number} selectedYear - The currently selected tax year
 * @property {number} grandTotal - Total tax-deductible amount
 * @property {number} totalTrips - Total trip costs (Verpflegung + Fahrtkosten)
 * @property {number} totalEquipment - Total work equipment costs (Arbeitsmittel)
 * @property {number} totalEmployerReimbursement - Total employer reimbursements (Spesen)
 * @property {number} totalExpenses - Total private expenses
 * @property {number} netTotal - Net balance after all calculations
 */

/**
 * Dashboard component displaying key performance indicators for tax deductions.
 * Shows the total deductible amount, individual categories, and private balance.
 * 
 * @param {DashboardKPIsProps} props - Component props
 * @returns {JSX.Element} The rendered dashboard KPIs
 * 
 * @example
 * <DashboardKPIs
 *   selectedYear={2025}
 *   grandTotal={5000}
 *   totalTrips={3700}
 *   totalEquipment={800}
 *   totalEmployerReimbursement={500}
 *   totalExpenses={300}
 *   netTotal={4700}
 * />
 */
export default function DashboardKPIs({ 
  selectedYear, 
  grandTotal, 
  totalTrips, 
  totalEquipment, 
  totalEmployerReimbursement, 
  totalExpenses, 
  netTotal 
}) {
  const [isSpesenSideNavOpen, setIsSpesenSideNavOpen] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const { pushModal, removeModal } = useUIContext();

  // Register/unregister spesen sidenav with back button handler
  useEffect(() => {
    if (isSpesenSideNavOpen) {
      pushModal('spesen-sidenav', () => setIsSpesenSideNavOpen(false));
    } else {
      removeModal('spesen-sidenav');
    }
  }, [isSpesenSideNavOpen, pushModal, removeModal]);

  return (
    <div className="space-y-7">
      {/* Main Tax Deductible Card */}
        <div className="rounded-2xl bg-linear-to-br from-primary/90 to-primary text-white shadow-lg p-3">
          <div 
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setIsChartExpanded(!isChartExpanded)}
            role="button"
            tabIndex={0}
          >
            <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Gesamt Absetzbar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-white/20 px-3 py-1 rounded-full font-medium">{selectedYear}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isChartExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <div className="mt-4 mb-2">
            <span className="text-4xl font-bold tracking-tight">{grandTotal.toFixed(2)}</span>
            <span className="text-2xl font-medium ml-1 opacity-80">€</span>
          </div>
          <p className="text-xs text-white/60">Steuerlich absetzbare Summe</p>
          
          {/* Monthly Tax Deductible Chart - Collapsible */}
          <div 
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isChartExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <TaxDeductibleChart year={selectedYear} />
          </div>
        </div>

        {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <KPIItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          }
          label="Dienstreisen"
          value={`${totalTrips.toFixed(2)} €`}
        />
        <KPIItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          label="Arbeitsmittel"
          value={`${totalEquipment.toFixed(2)} €`}
        />
        <KPIItem
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="AG Spesen"
          value={`${totalEmployerReimbursement.toFixed(2)} €`}
          variant="clickable"
          onClick={() => setIsSpesenSideNavOpen(true)}
        />
      </div>

      {/* Private Balance Card */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-medium text-muted-foreground">Private Bilanz</h3>
            <p className="text-[9px] text-muted-foreground/50">Nicht steuerlich relevant</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2.5 px-4 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground">Private Ausgaben</span>
            <span className="text-xs font-medium text-muted-foreground">-{totalExpenses.toFixed(2)} €</span>
          </div>
          
          <div className={`flex justify-between items-center py-3 px-4 rounded-xl ${
            netTotal >= 0 
              ? 'bg-emerald-50 dark:bg-emerald-500/10' 
              : 'bg-red-50 dark:bg-red-500/10'
          }`}>
            <span className="text-xs font-medium text-foreground">Gesamtbilanz</span>
            <span className={`text-base font-bold ${
              netTotal >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {netTotal >= 0 ? '+' : ''}{netTotal.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>

      {/* Spesen Side Navigation */}
      <SpesenSideNav
        isOpen={isSpesenSideNavOpen}
        onClose={() => setIsSpesenSideNavOpen(false)}
        year={selectedYear}
      />
    </div>
  );
}
