import React, { useState } from 'react';
import { formatDate } from '@/utils/dateFormatter';

const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/**
 * @typedef {Object} MealEntry
 * @property {number|string} id - Unique identifier
 * @property {string} date - Start date
 * @property {string} [endDate] - End date for multi-day trips
 * @property {string} startTime - Start time
 * @property {string} endTime - End time
 * @property {number} duration - Duration in hours
 * @property {number} deductible - Deductible meal amount
 */

/**
 * @typedef {Object} MileageEntry
 * @property {number|string} id - Unique identifier
 * @property {string} date - Entry date
 * @property {number} [allowance] - Mileage allowance amount
 * @property {string} [vehicleType] - Type of vehicle used
 * @property {number|string} [relatedMealId] - Related meal entry ID
 * @property {string} [purpose] - Trip purpose
 */

/**
 * @typedef {Object} FullScreenTableViewProps
 * @property {boolean} isOpen - Whether the view is open
 * @property {Function} onClose - Function to close the view
 * @property {MealEntry[]} filteredMealEntries - Filtered meal entries for the selected year
 * @property {MileageEntry[]} mileageEntries - All mileage entries
 * @property {string|number} selectedYear - Currently selected year
 */

/**
 * Calculates total deductible for an entry including mileage
 */
function calculateEntryTotal(entry, mileageEntries) {
  const relatedMileage = mileageEntries.filter(m => m.relatedMealId === entry.id);
  const dayMileage = relatedMileage.length > 0
    ? relatedMileage
    : mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);

  const tripTo = dayMileage.find(m => m.purpose && m.purpose.includes('Beginn'));
  const tripFrom = dayMileage.find(m => m.purpose && m.purpose.includes('Ende'));
  const publicTransportEntries = dayMileage.filter(m => m.vehicleType === 'public_transport');
  
  const amountTo = tripTo ? tripTo.allowance : 0;
  const amountFrom = tripFrom ? tripFrom.allowance : 0;
  const publicTransportSum = publicTransportEntries.reduce((acc, m) => acc + (m.allowance || 0), 0);
  const mileageSum = amountTo + amountFrom + publicTransportSum;
  
  return {
    mileageSum,
    totalDeductible: entry.deductible + mileageSum
  };
}

/**
 * Full-screen table view for displaying all trip entries in a detailed table format.
 * Shows dates, times, durations, and calculated deductible amounts grouped by month.
 * 
 * @param {FullScreenTableViewProps} props - Component props
 * @returns {JSX.Element|null} The rendered table view or null if not open
 */
export default function FullScreenTableView({ 
  isOpen, 
  onClose, 
  filteredMealEntries, 
  mileageEntries, 
  selectedYear 
}) {
  const [collapsedMonths, setCollapsedMonths] = useState({});

  if (!isOpen) return null;

  const toggleMonth = (month) => {
    setCollapsedMonths(prev => ({
      ...prev,
      [month]: !prev[month]
    }));
  };

  // Group entries by month
  const entriesByMonth = filteredMealEntries.reduce((acc, entry) => {
    const month = new Date(entry.date).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  // Calculate totals per month
  const monthlyTotals = Object.keys(entriesByMonth).reduce((acc, month) => {
    acc[month] = entriesByMonth[month].reduce((sum, entry) => {
      const { totalDeductible } = calculateEntryTotal(entry, mileageEntries);
      return sum + totalDeductible;
    }, 0);
    return acc;
  }, {});

  const totalSum = filteredMealEntries.reduce((sum, entry) => {
    const { totalDeductible } = calculateEntryTotal(entry, mileageEntries);
    return sum + totalDeductible;
  }, 0);

  return (
    <div className="fixed inset-0 bg-background z-9999 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-card/95 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Fahrtenbuch {selectedYear}</h2>
              <p className="text-xs text-muted-foreground">{filteredMealEntries.length} Einträge</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-muted/50 transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Summary Bar */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border/30 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-muted-foreground">Verpflegung</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-muted-foreground">Reisekosten</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold text-emerald-600">{totalSum.toFixed(2)} €</span>
          </div>
        </div>
      </div>
      
      {/* Table Content */}
      <div className="flex-1 flex flex-col min-h-0 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
        <div className="max-w-5xl w-full mx-auto rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/30 text-muted-foreground font-medium border-b border-border/50 sticky top-0 z-20">
                <tr>
                  <th className="p-4 text-xs uppercase tracking-wider">Datum</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Zeit</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Dauer</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Verpflegung
                    </span>
                  </th>
                  <th className="p-4 text-xs uppercase tracking-wider text-right">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Reisekosten
                    </span>
                  </th>
                  <th className="p-4 text-xs uppercase tracking-wider text-right sticky right-0 top-0 z-30 bg-muted/30 backdrop-blur-sm shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)]">Gesamt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredMealEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-muted-foreground">Keine Einträge für {selectedYear}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  Object.keys(entriesByMonth)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((month) => (
                      <React.Fragment key={month}>
                        {/* Month Header */}
                        <tr 
                          className="bg-primary/5 border-y border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={() => toggleMonth(month)}
                        >
                          <td colSpan={5} className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <svg 
                                  className={`w-4 h-4 text-primary transition-transform duration-200 ${collapsedMonths[month] ? '-rotate-90' : 'rotate-0'}`} 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor" 
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <div>
                                <span className="font-semibold text-foreground">{monthNames[month]}</span>
                                <span className="text-xs text-muted-foreground ml-2">({entriesByMonth[month].length} Einträge)</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right sticky right-0 bg-primary/5 shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)]">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                              {monthlyTotals[month].toFixed(2)} €
                            </span>
                          </td>
                        </tr>
                        
                        {/* Month Entries */}
                        {!collapsedMonths[month] && entriesByMonth[month].map((entry, idx) => {
                          const { mileageSum, totalDeductible } = calculateEntryTotal(entry, mileageEntries);
                          const isMultiDay = entry.endDate && entry.endDate !== entry.date;

                          return (
                            <tr key={entry.id || idx} className="hover:bg-muted/20 transition-colors group">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex flex-col items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-primary leading-none">
                                      {new Date(entry.date).getDate()}
                                    </span>
                                    <span className="text-[8px] uppercase text-primary/70 mt-0.5">
                                      {new Date(entry.date).toLocaleDateString('de-DE', { month: 'short' })}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">{formatDate(entry.date)}</span>
                                    {isMultiDay && (
                                      <span className="text-xs text-muted-foreground block">→ {formatDate(entry.endDate)}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {entry.startTime} - {entry.endTime}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted/50 text-xs font-medium text-muted-foreground">
                                  {entry.duration.toFixed(1)} h
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <span className={`font-medium ${entry.deductible > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                                  {entry.deductible.toFixed(2)} €
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <span className={`font-medium ${mileageSum > 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                  {mileageSum.toFixed(2)} €
                                </span>
                              </td>
                              <td className="p-4 text-right font-bold text-foreground sticky right-0 bg-card group-hover:bg-muted/20 z-10 shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)] transition-colors">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600">
                                  {totalDeductible.toFixed(2)} €
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))
                )}
              </tbody>
              <tfoot className="bg-muted/30 font-bold border-t border-border/50 sticky bottom-0 z-20">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-left text-foreground">
                    <span className="text-sm">Gesamtsumme {selectedYear}</span>
                  </td>
                  <td className="px-4 py-3 text-right sticky right-0 bottom-0 z-30 bg-muted/30 backdrop-blur-sm shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)]">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 text-base font-bold">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {totalSum.toFixed(2)} €
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
