import React, { useState } from 'react';
import { formatDate } from '@/utils/dateFormatter';

const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/**
 * @typedef {Object} TripEntry
 * @property {number|string} id - Unique identifier
 * @property {string} date - Start date
 * @property {string} [endDate] - End date for multi-day trips
 * @property {string} startTime - Start time
 * @property {string} endTime - End time
 * @property {number} duration - Duration in hours
 * @property {number} mealAllowance - Meal allowance amount
 * @property {Array} [transportRecords] - Nested transport records
 * @property {number} [sumTransportAllowances] - Precomputed transport cost sum
 */

/**
 * @typedef {Object} FullScreenTableViewProps
 * @property {boolean} isOpen - Whether the view is open
 * @property {Function} onClose - Function to close the view
 * @property {TripEntry[]} tripEntries - Trip entries for the selected year
 * @property {string|number} selectedYear - Currently selected year
 */

/**
 * Calculates total meal allowance for an entry including transport costs
 */
function calculateEntryTotal(entry) {
  // With nested structure, transport sum is precomputed
  const transportSum = entry.sumTransportAllowances || 0;
  
  return {
    mileageSum: transportSum, // Keep name for compatibility
    totalMealAllowance: entry.mealAllowance + transportSum
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
  tripEntries, 
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
  const entriesByMonth = tripEntries.reduce((acc, entry) => {
    const month = new Date(entry.date).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(entry);
    return acc;
  }, {});

  // Calculate totals per month
  const monthlyTotals = Object.keys(entriesByMonth).reduce((acc, month) => {
    acc[month] = entriesByMonth[month].reduce((sum, entry) => {
      const { totalMealAllowance } = calculateEntryTotal(entry);
      return sum + totalMealAllowance;
    }, 0);
    return acc;
  }, {});

  // Calculate mileage totals per month
  const monthlyMileageTotals = Object.keys(entriesByMonth).reduce((acc, month) => {
    acc[month] = entriesByMonth[month].reduce((sum, entry) => {
      const { mileageSum } = calculateEntryTotal(entry);
      return sum + mileageSum;
    }, 0);
    return acc;
  }, {});

  // Calculate meal allowance totals per month
  const monthlyMealAllowanceTotals = Object.keys(entriesByMonth).reduce((acc, month) => {
    acc[month] = entriesByMonth[month].reduce((sum, entry) => {
      return sum + (entry.mealAllowance || 0);
    }, 0);
    return acc;
  }, {});

  const totalSum = tripEntries.reduce((sum, entry) => {
    const { totalMealAllowance } = calculateEntryTotal(entry);
    return sum + totalMealAllowance;
  }, 0);

  const totalMileage = tripEntries.reduce((sum, entry) => {
    const { mileageSum } = calculateEntryTotal(entry);
    return sum + mileageSum;
  }, 0);

  const totalMealAllowance = tripEntries.reduce((sum, entry) => {
    return sum + (entry.mealAllowance || 0);
  }, 0);

  // Sort all entries by date for flat table view
  const sortedEntries = [...tripEntries].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="fixed inset-0 bg-background z-9999 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-card border-b border-border">
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div>
                <h2 className="text-base font-semibold text-foreground">Fahrtenbuch {selectedYear}</h2>
                <p className="text-xs text-muted-foreground">{tripEntries.length} {tripEntries.length === 1 ? 'Eintrag' : 'Einträge'}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-[10px] text-muted-foreground">EINTRÄGE</p>
              <p className="text-lg font-semibold">{tripEntries.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <p className="text-[10px] text-blue-600 font-medium">FAHRTKOSTEN</p>
              <p className="text-lg font-semibold text-blue-600">{totalMileage.toFixed(2)}€</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <p className="text-[10px] text-emerald-700 font-medium">GESAMT ABZUG</p>
              <p className="text-lg font-semibold text-emerald-700">{totalSum.toFixed(2)}€</p>
            </div>
          </div>

          <div className="h-1" />
        </div>
      </div>
      
      {/* Table Content */}
      <div className="flex-1 overflow-auto pb-[env(safe-area-inset-bottom)] px-4 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead className="sticky top-0 z-20">
            <tr className="bg-muted text-muted-foreground">
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs">#</th>
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs">Datum</th>
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs">Beginn</th>
              <th className="border border-border px-3 py-2 text-left font-semibold text-xs">Ende</th>
              <th className="border border-border px-3 py-2 text-right font-semibold text-xs">Dauer (h)</th>
              <th className="border border-border px-3 py-2 text-right font-semibold text-xs">Verpflegung (€)</th>
              <th className="border border-border px-3 py-2 text-right font-semibold text-xs">Reisekosten (€)</th>
              <th className="border border-border px-3 py-2 text-right font-semibold text-xs bg-muted">Gesamt (€)</th>
            </tr>
          </thead>
          <tbody>
            {tripEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-border px-3 py-8 text-center text-muted-foreground">
                  Keine Einträge für {selectedYear}
                </td>
              </tr>
            ) : (
              Object.keys(entriesByMonth)
                .sort((a, b) => Number(a) - Number(b))
                .map((month) => {
                  const monthEntries = entriesByMonth[month];
                  const isCollapsed = collapsedMonths[month];
                  
                  return (
                    <React.Fragment key={month}>
                      {/* Month Header Row */}
                      <tr 
                        className="bg-primary/10 cursor-pointer hover:bg-primary/15 transition-colors"
                        onClick={() => toggleMonth(month)}
                      >
                        <td className="border border-border px-3 py-2">
                          <svg 
                            className={`w-4 h-4 text-primary transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </td>
                        <td colSpan={4} className="border border-border px-3 py-2 font-semibold text-foreground">
                          {monthNames[month]} <span className="font-normal text-muted-foreground text-xs">({monthEntries.length})</span>
                        </td>
                        <td className="border border-border px-3 py-2 text-right font-semibold text-emerald-600">
                          {monthlyMealAllowanceTotals[month].toFixed(2)}
                        </td>
                        <td className="border border-border px-3 py-2 text-right font-semibold text-blue-600">
                          {monthlyMileageTotals[month].toFixed(2)}
                        </td>
                        <td className="border border-border px-3 py-2 text-right font-bold text-foreground bg-primary/5">
                          {monthlyTotals[month].toFixed(2)}
                        </td>
                      </tr>
                      
                      {/* Month Entries */}
                      {!isCollapsed && monthEntries.map((entry, idx) => {
                        const { mileageSum, totalMealAllowance } = calculateEntryTotal(entry);
                        const isMultiDay = entry.endDate && entry.endDate !== entry.date;
                        const rowNumber = monthEntries.indexOf(entry) + 1;

                        return (
                          <tr key={entry.id || idx} className="hover:bg-muted/30 transition-colors">
                            <td className="border border-border px-3 py-2 text-muted-foreground text-xs">
                              {rowNumber}
                            </td>
                            <td className="border border-border px-3 py-2 text-foreground">
                              {formatDate(entry.date)}
                              {isMultiDay && (
                                <span className="text-muted-foreground text-xs ml-1">→ {formatDate(entry.endDate)}</span>
                              )}
                            </td>
                            <td className="border border-border px-3 py-2 text-foreground font-mono text-xs">
                              {entry.startTime}
                            </td>
                            <td className="border border-border px-3 py-2 text-foreground font-mono text-xs">
                              {entry.endTime}
                            </td>
                            <td className="border border-border px-3 py-2 text-right text-foreground tabular-nums">
                              {(entry.duration || 0).toFixed(1)}
                            </td>
                            <td className="border border-border px-3 py-2 text-right tabular-nums">
                              <span className={entry.mealAllowance > 0 ? 'text-emerald-600' : 'text-muted-foreground'}>
                                {(entry.mealAllowance || 0).toFixed(2)}
                              </span>
                            </td>
                            <td className="border border-border px-3 py-2 text-right tabular-nums">
                              <span className={mileageSum > 0 ? 'text-blue-600' : 'text-muted-foreground'}>
                                {mileageSum.toFixed(2)}
                              </span>
                            </td>
                            <td className="border border-border px-3 py-2 text-right font-semibold text-foreground bg-muted/20 tabular-nums">
                              {totalMealAllowance.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
      {/* Footer pinned to bottom of the overlay */}
      <div className="shrink-0 border-t border-border bg-card/95 backdrop-blur-sm px-4 py-3 pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
        <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-sm text-foreground tabular-nums">
          <span className="font-semibold">Gesamtsumme {selectedYear}</span>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground">Verpflegung</span>
              <span className="text-base font-semibold text-emerald-600">{totalMealAllowance.toFixed(2)} €</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground">Fahrtkosten</span>
              <span className="text-base font-semibold text-blue-600">{totalMileage.toFixed(2)} €</span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[11px] text-muted-foreground">Gesamt</span>
              <span className="text-base font-semibold text-foreground">{totalSum.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
