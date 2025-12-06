import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function EquipmentList({ 
  filteredEquipmentEntries, 
  deleteEquipmentEntry, 
  selectedYear, 
  setIsFullScreen, 
  handleViewReceipt,
  highlightId
}) {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, entry: null });

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`equipment-row-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('bg-primary/20');
        setTimeout(() => {
          element.classList.remove('bg-primary/20');
        }, 2000);
      }
    }
  }, [highlightId, filteredEquipmentEntries]);

  return (
    <div className="card-modern h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Arbeitsmittel</h2>
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
              <th className="whitespace-nowrap text-left">Gegenstand</th>
              <th className="whitespace-nowrap text-right">Preis</th>
            </tr>
          </thead>
          <tbody>
            {filteredEquipmentEntries.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center text-muted-foreground py-8">Keine Arbeitsmittel für {selectedYear} vorhanden.</td>
              </tr>
            ) : (
              filteredEquipmentEntries.map(entry => (
                <tr 
                  key={entry.id} 
                  id={`equipment-row-${entry.id}`}
                  className="hover:bg-secondary/20 transition-colors duration-500 cursor-pointer"
                  onClick={() => setDeleteConfirmation({ isOpen: true, entry })}
                >
                  <td className="p-4">
                    <div className="font-medium text-foreground">{entry.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{formatDate(entry.date)}</div>
                    {entry.receiptFileName && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewReceipt(entry.receiptFileName);
                        }}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-1"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Beleg
                      </button>
                    )}
                  </td>
                  <td className="whitespace-nowrap font-bold text-right p-4">{entry.price.toFixed(2)} €</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, entry: null })}
        onConfirm={() => {
          if (deleteConfirmation.entry) {
            deleteEquipmentEntry(deleteConfirmation.entry.id);
          }
        }}
        title="Eintrag löschen"
        message={deleteConfirmation.entry ? `Möchten Sie das Arbeitsmittel "${deleteConfirmation.entry.name}" vom ${formatDate(deleteConfirmation.entry.date)} wirklich löschen?` : ''}
      />
    </div>
  );
}
