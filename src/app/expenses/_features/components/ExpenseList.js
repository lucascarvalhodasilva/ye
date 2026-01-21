import React, { useEffect, useState, useRef } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/ConfirmationModal';
import MonthlySummary from './MonthlySummary';

export default function ExpenseList({ 
  filteredEntries, 
  deleteExpenseEntry, 
  selectedYear, 
  setIsFullScreen,
  monthlyExpenses,
  monthNames,
  highlightId,
  handleViewReceipt,
  viewingReceipt,
  setViewingReceipt,
  onEdit
}) {
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, entry: null });
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const swipeState = useRef({ id: null, startX: 0, translateX: 0, dragging: false });

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`expense-row-${highlightId}`);
      const innerElement = document.getElementById(`swipe-inner-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (innerElement) {
          innerElement.classList.add('transition-all', 'duration-300', 'ease-in-out');
          const flash = () => {
            innerElement.classList.add('scale-[1.02]');
            innerElement.classList.remove('bg-white');
            innerElement.classList.add('bg-blue-50');
            setTimeout(() => {
              innerElement.classList.remove('scale-[1.02]');
              innerElement.classList.remove('bg-blue-50');
              innerElement.classList.add('bg-white');
            }, 300);
          };
          
          flash();
          setTimeout(flash, 600);
        }
      }
    }
  }, [highlightId, filteredEntries]);

  const handlePointerDown = (e, id) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    swipeState.current = { id, startX: clientX, translateX: 0, dragging: true };
  };

  const handlePointerMove = (e) => {
    if (!swipeState.current.dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let delta = clientX - swipeState.current.startX;
    if (delta > 0) delta = 0;
    const maxSwipe = -actionsWidth;
    if (delta < maxSwipe) delta = maxSwipe;
    swipeState.current.translateX = delta;
    const el = document.getElementById(`swipe-inner-${swipeState.current.id}`);
    if (el) {
      el.style.transform = `translateX(${delta}px)`;
    }
  };

  const handlePointerUp = () => {
    if (!swipeState.current.dragging) return;
    const shouldOpen = swipeState.current.translateX < -(actionsWidth / 3);
    const id = swipeState.current.id;
    setOpenSwipeId(shouldOpen ? id : null);
    const el = document.getElementById(`swipe-inner-${id}`);
    if (el) {
      el.style.transform = `translateX(${shouldOpen ? -actionsWidth : 0}px)`;
    }
    swipeState.current = { id: null, startX: 0, translateX: 0, dragging: false };
  };

  useEffect(() => {
    const onPointerUp = () => handlePointerUp();
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, []);

  const actionsWidth = 170;

  return (
    <section className="space-y-6">
      {/* Monthly Summary */}
      <MonthlySummary monthlyExpenses={monthlyExpenses} monthNames={monthNames} />

      {/* List */}
      <article className="flex flex-col h-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ausgabenliste</h2>
          <button 
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Vollbild
          </button>
        </header>
        
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-500">
              Keine Ausgaben für {selectedYear} vorhanden.
            </div>
          ) : (
            filteredEntries.map(entry => {
              const isOpen = openSwipeId === entry.id;
              
              return (
                <div 
                  key={entry.id}
                  id={`expense-row-${entry.id}`}
                  className="relative overflow-hidden border-b border-gray-100 bg-white last:border-b-0"
                  onMouseDown={(e) => handlePointerDown(e, entry.id)}
                  onTouchStart={(e) => handlePointerDown(e, entry.id)}
                  onMouseMove={handlePointerMove}
                  onTouchMove={handlePointerMove}
                >
                  <div 
                    className="absolute top-0 right-0 z-0 flex h-full items-stretch"
                    style={{ width: `${actionsWidth}px` }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenSwipeId(null); onEdit && onEdit(entry); }}
                      className="w-1/2 text-sm font-medium bg-gray-500 text-white transition-colors hover:bg-gray-600"
                      aria-label="Eintrag bearbeiten"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setOpenSwipeId(null); 
                        setDeleteConfirmation({ isOpen: true, entry }); 
                      }}
                      className="w-1/2 text-sm font-medium bg-red-500 text-white transition-colors hover:bg-red-600"
                      aria-label="Eintrag löschen"
                    >
                      Löschen
                    </button>
                  </div>

                  <div
                    id={`swipe-inner-${entry.id}`}
                    className="relative z-10 px-4 bg-white transition-transform duration-200"
                    onMouseUp={handlePointerUp}
                    onTouchEnd={handlePointerUp}
                  >
                    <div className="flex items-center justify-between gap-3 h-20">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{entry.description}</span>
                        <span className="mt-0.5 text-xs text-gray-500">{formatDate(entry.date)}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-gray-900">{entry.amount.toFixed(2)} €</span>
                        {entry.receiptFileName && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewReceipt(entry);
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Beleg
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </article>

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div 
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setViewingReceipt(null)}
        >
          <div className="relative flex flex-col items-center max-w-4xl w-full max-h-[90vh]">
            <img 
              src={`data:image/jpeg;base64,${viewingReceipt}`} 
              alt="Beleg" 
              className="max-w-full max-h-[80vh] rounded-lg bg-black/50 shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setViewingReceipt(null)}
              className="mt-4 px-6 py-2 font-medium rounded-full bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
    </section>
  );
}
