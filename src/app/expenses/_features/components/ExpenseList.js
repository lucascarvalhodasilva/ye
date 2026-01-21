import React, { useEffect, useState, useRef } from 'react';
import { formatDate } from '@/utils/dateFormatter';
import ConfirmationModal from '@/components/shared/ConfirmationModal';

/**
 * @typedef {Object} ExpenseEntry
 * @property {number|string} id - Unique identifier
 * @property {string} date - Entry date
 * @property {string} description - Expense description
 * @property {number} amount - Expense amount
 * @property {string} [receiptFileName] - Receipt file name if available
 */

/**
 * @typedef {Object} ExpenseListProps
 * @property {ExpenseEntry[]} filteredEntries - Filtered expense entries for the selected year
 * @property {Function} deleteExpenseEntry - Function to delete an entry
 * @property {string|number} selectedYear - Currently selected year
 * @property {Function} setIsFullScreen - Function to toggle fullscreen view
 * @property {Object} monthlyExpenses - Monthly expense totals
 * @property {string[]} monthNames - Array of month names
 * @property {number|string|null} highlightId - ID of entry to highlight
 * @property {Function} handleViewReceipt - Function to view a receipt
 * @property {string|null} viewingReceipt - Currently viewing receipt data
 * @property {Function} setViewingReceipt - Function to set viewing receipt
 * @property {Function} [onEdit] - Function to edit an entry
 * @property {Function} [onAddExpense] - Function to add a new expense
 */

/**
 * Displays a list of expenses with swipe-to-reveal actions for edit and delete.
 * Shows expense descriptions, dates, and amounts.
 * 
 * @param {ExpenseListProps} props - Component props
 * @returns {JSX.Element} The rendered expense list
 */
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
  onEdit,
  onAddExpense
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
            innerElement.classList.add('ring-2', 'ring-primary/50');
            setTimeout(() => {
              innerElement.classList.remove('scale-[1.02]');
              innerElement.classList.remove('ring-2', 'ring-primary/50');
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

  const actionsWidth = 120;
  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ausgaben</h2>
            <p className="text-[10px] text-muted-foreground">{filteredEntries.length} Einträge in {selectedYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullScreen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-all border border-border/50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Vollbild
          </button>
          {onAddExpense && (
            <button 
              onClick={onAddExpense}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-500/90 text-xs font-medium text-white transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Hinzufügen
            </button>
          )}
        </div>
      </div>

      {/* Total Summary */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border/30 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Gesamtausgaben {selectedYear}</span>
        <span className="text-sm font-bold text-rose-600">-{totalAmount.toFixed(2)} €</span>
      </div>

      {/* Expense List */}
      <div className="divide-y divide-border/30">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Keine Ausgaben für {selectedYear}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Erfassen Sie Ihre erste Ausgabe</p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isOpen = openSwipeId === entry.id;

            return (
              <div 
                key={entry.id}
                id={`expense-row-${entry.id}`}
                className="relative overflow-hidden bg-transparent"
                onMouseDown={(e) => handlePointerDown(e, entry.id)}
                onTouchStart={(e) => handlePointerDown(e, entry.id)}
                onMouseMove={handlePointerMove}
                onTouchMove={handlePointerMove}
              >
                {/* Swipe Actions */}
                <div 
                  className="absolute top-0 right-0 h-full flex items-center justify-end gap-2 pr-3 z-0"
                  style={{ width: `${actionsWidth}px` }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenSwipeId(null); onEdit && onEdit(entry); }}
                    className="w-12 h-12 bg-indigo-500/85 backdrop-blur-md hover:bg-indigo-500/95 text-white transition-all flex items-center justify-center active:scale-95 shadow-inner rounded-2xl"
                    aria-label="Eintrag bearbeiten"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setOpenSwipeId(null); 
                      setDeleteConfirmation({ isOpen: true, entry }); 
                    }}
                    className="w-12 h-12 bg-rose-500/85 backdrop-blur-md hover:bg-rose-500/95 text-white transition-all flex items-center justify-center active:scale-95 shadow-inner rounded-2xl"
                    aria-label="Eintrag löschen"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>

                {/* Card Content */}
                <div
                  id={`swipe-inner-${entry.id}`}
                  className="relative p-4 transition-transform duration-200 bg-card z-10"
                  onMouseUp={handlePointerUp}
                  onTouchEnd={handlePointerUp}
                >
                  <div className="flex items-center gap-4">
                    {/* Date Badge */}
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 bg-rose-500/10 text-rose-600">
                      <span className="text-lg font-bold leading-none">
                        {new Date(entry.date).getDate()}
                      </span>
                      <span className="text-[10px] uppercase font-medium mt-0.5 opacity-70">
                        {new Date(entry.date).toLocaleDateString('de-DE', { month: 'short' })}
                      </span>
                    </div>

                    {/* Expense Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {entry.description || 'Ausgabe'}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(entry.date)}</span>
                      </div>
                    </div>

                    {/* Amount & Receipt */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-base font-bold text-rose-600">
                        -{entry.amount.toFixed(2)} €
                      </span>
                      
                      {entry.receiptFileName && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReceipt(entry);
                          }}
                          className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors flex items-center justify-center"
                          aria-label="Beleg ansehen"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
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

      {/* Footer hint */}
      {filteredEntries.length > 0 && (
        <div className="p-3 bg-muted/20 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground/60 text-center">
            ← Nach links wischen zum Bearbeiten oder Löschen
          </p>
        </div>
      )}

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
              className="mt-4 px-6 py-2.5 font-medium rounded-xl bg-white text-gray-700 shadow-lg transition-colors hover:bg-gray-100"
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
    </div>
  );
}
                    