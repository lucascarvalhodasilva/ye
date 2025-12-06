import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function ExpenseList({ 
  filteredEntries, 
  deleteExpenseEntry, 
  selectedYear, 
  setIsFullScreen,
  monthlyExpenses,
  monthNames,
  highlightId
}) {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, entry: null });

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`expense-row-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-primary/20');
        setTimeout(() => {
          element.classList.remove('bg-primary/20');
        }, 2000);
      }
    }
  }, [highlightId, filteredEntries]);

  return (
    <div className="space-y-6">
      {/* Monthly Summary */}
      <div className="card-modern">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Monatliche Übersicht</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x scrollbar-hide">
          {monthlyExpenses.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2">Keine Ausgaben in diesem Jahr.</div>
          ) : (
            monthlyExpenses.map(({ month, amount }) => (
              <div 
                key={month}
                className="flex-none w-32 h-20 rounded-lg border border-border bg-card p-3 flex flex-col justify-between snap-start shadow-sm"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {monthNames[month]}
                </span>
                <span className="text-lg font-bold text-foreground">
                  {amount.toFixed(2)} €
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* List */}
      <div className="card-modern h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Ausgabenliste</h2>
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
                <th className="whitespace-nowrap text-left">Beschreibung</th>
                <th className="whitespace-nowrap text-right">Betrag</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center text-muted-foreground py-8">Keine Ausgaben für {selectedYear} vorhanden.</td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr 
                    key={entry.id} 
                    id={`expense-row-${entry.id}`}
                    className="hover:bg-secondary/20 transition-colors duration-500 cursor-pointer"
                    onClick={() => setDeleteConfirmation({ isOpen: true, entry })}
                  >
                    <td className="p-4">
                      <div className="font-medium text-foreground">{entry.description}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.date)}</div>
                    </td>
                    <td className="whitespace-nowrap font-bold text-right p-4">{entry.amount.toFixed(2)} €</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, entry: null })}
        onConfirm={() => {
          if (deleteConfirmation.entry) {
            deleteExpenseEntry(deleteConfirmation.entry.id);
          }
        }}
        title="Eintrag löschen"
        message={deleteConfirmation.entry ? `Möchten Sie die Ausgabe "${deleteConfirmation.entry.description}" vom ${formatDate(deleteConfirmation.entry.date)} wirklich löschen?` : ''}
      />
    </div>
  );
}
