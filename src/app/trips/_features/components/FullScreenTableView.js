import React from 'react';
import { formatDate } from '@/utils/dateFormatter';

export default function FullScreenTableView({ 
  isOpen, 
  onClose, 
  filteredMealEntries, 
  mileageEntries, 
  selectedYear 
}) {
  if (!isOpen) return null;

  const totalSum = filteredMealEntries.reduce((sum, entry) => {
    const dayMileage = mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);
    const tripTo = dayMileage.find(m => m.date === entry.date && m.purpose && m.purpose.includes('Beginn'));
    const tripFrom = dayMileage.find(m => (m.date === (entry.endDate || entry.date)) && m.purpose && m.purpose.includes('Ende'));
    
    const amountTo = tripTo ? tripTo.allowance : 0;
    const amountFrom = tripFrom ? tripFrom.allowance : 0;
    const mileageSum = amountTo + amountFrom;
    return sum + entry.deductible + mileageSum;
  }, 0);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-200">
      <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Fahrtenbuch {selectedYear}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
        <div className="max-w-5xl w-full mx-auto rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary text-muted-foreground font-medium border-b border-border sticky top-0 z-20">
              <tr >
                <th className="p-4">Datum</th>
                <th className="p-4">Zeit</th>
                <th className="p-4">Dauer</th>
                <th className="p-4 text-right">Verpflegungspauschale</th>
                <th className="p-4 text-right">Reisekostenpauschale</th>
                <th className="p-4 text-right sticky right-0 top-0 z-30 bg-secondary shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Gesamt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredMealEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Keine Einträge für {selectedYear} gefunden
                  </td>
                </tr>
              ) : (
                filteredMealEntries.map((entry, idx) => {
                  // Find associated mileage entries for this date range
                  const dayMileage = mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);
                  const tripTo = dayMileage.find(m => m.date === entry.date && m.purpose && m.purpose.includes('Beginn'));
                  const tripFrom = dayMileage.find(m => (m.date === (entry.endDate || entry.date)) && m.purpose && m.purpose.includes('Ende'));
                  
                  const amountTo = tripTo ? tripTo.allowance : 0;
                  const amountFrom = tripFrom ? tripFrom.allowance : 0;
                  const mileageSum = amountTo + amountFrom;
                  const totalDeductible = entry.deductible + mileageSum;

                  const isMultiDay = entry.endDate && entry.endDate !== entry.date;

                  return (
                    <tr key={entry.id || idx} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-medium">
                        {formatDate(entry.date)}
                        {isMultiDay && <span className="text-xs text-muted-foreground block">bis {formatDate(entry.endDate)}</span>}
                      </td>
                      <td className="p-4">
                        {entry.startTime} - {entry.endTime}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {entry.duration.toFixed(1)} h
                      </td>
                      <td className="p-4 text-right">
                        {entry.deductible.toFixed(2)} €
                      </td>
                      <td className="p-4 text-right">
                        {mileageSum.toFixed(2)} €
                      </td>
                      <td className="p-4 text-right font-bold text-primary sticky right-0 bg-card z-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                        {totalDeductible.toFixed(2)} €
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-secondary  font-bold border-t border-border sticky bottom-0 z-20">
              <tr className='rounded-b-xl overflow-hidden' >
                <td colSpan={5} className="sticky rounded-bl-xl px-4 py-1 text-right">Gesamtsumme:</td>
                <td className="rounded-br-xl px-4 py-1 text-right text-primary sticky right-0 bottom-0 z-30 bg-secondary shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                  {totalSum.toFixed(2)} €
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
