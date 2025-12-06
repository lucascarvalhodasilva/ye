import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function TripList({ filteredMealEntries, mileageEntries, handleDeleteEntry, selectedYear, setIsFullScreen, highlightId }) {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, entry: null });
  
  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`trip-row-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-primary/20');
        setTimeout(() => {
          element.classList.remove('bg-primary/20');
        }, 2000);
      }
    }
  }, [highlightId, filteredMealEntries]);

  return (
    <div className="card-modern flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Fahrtenbuch</h2>
        <button 
          onClick={() => setIsFullScreen(true)}
          className="text-xs bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Vollbild
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-modern">
          <thead>
            <tr>
              <th className="whitespace-nowrap min-w-[110px]">Datum</th>
              <th className="whitespace-nowrap min-w-[130px] text-right">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            {filteredMealEntries.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center text-muted-foreground py-8">Keine Einträge für {selectedYear} vorhanden.</td>
              </tr>
            ) : (
              filteredMealEntries.map(entry => {
                const isMultiDay = entry.endDate && entry.endDate !== entry.date;
                
                // Calculate totals
                const dayMileage = mileageEntries.filter(m => m.date === entry.date || m.date === entry.endDate);
                const tripTo = dayMileage.find(m => m.date === entry.date && m.purpose && m.purpose.includes('Beginn'));
                const tripFrom = dayMileage.find(m => (m.date === (entry.endDate || entry.date)) && m.purpose && m.purpose.includes('Ende'));
                
                const amountTo = tripTo ? tripTo.allowance : 0;
                const amountFrom = tripFrom ? tripFrom.allowance : 0;
                const mileageSum = amountTo + amountFrom;
                const totalDeductible = entry.deductible + mileageSum;

                return (
                  <tr 
                    key={entry.id} 
                    id={`trip-row-${entry.id}`}
                    className="transition-colors duration-500 cursor-pointer hover:bg-secondary/50"
                    onClick={() => setDeleteConfirmation({ isOpen: true, entry })}
                  >
                    <td className="whitespace-nowrap font-medium p-4">
                      {formatDate(entry.date)}
                      {isMultiDay && <span className="text-xs text-muted-foreground block">bis {formatDate(entry.endDate)}</span>}
                    </td>
                    <td className="whitespace-nowrap p-4 text-right font-bold text-primary">{totalDeductible.toFixed(2)} €</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, entry: null })}
        onConfirm={() => {
          if (deleteConfirmation.entry) {
            handleDeleteEntry(
              deleteConfirmation.entry.id, 
              deleteConfirmation.entry.date, 
              deleteConfirmation.entry.endDate
            );
          }
        }}
        title="Eintrag löschen"
        message={deleteConfirmation.entry ? `Möchten Sie den Eintrag vom ${formatDate(deleteConfirmation.entry.date)} wirklich löschen?` : ''}
      />
    </div>
  );
}
