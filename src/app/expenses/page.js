"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useExpenses } from './_features/hooks/useExpenses';
import ExpenseForm from './_features/components/ExpenseForm';
import ExpenseList from './_features/components/ExpenseList';
import { formatDate } from '@/utils/dateFormatter';
import { useUIContext } from '@/context/UIContext';

export default function ExpensesPage() {
  const [highlightId, setHighlightId] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const { pushModal, removeModal } = useUIContext();
  
  // Refs to store stable modal IDs
  const receiptModalIdRef = useRef(null);
  const expenseModalIdRef = useRef(null);
  const fullscreenModalIdRef = useRef(null);
  
  const {
    formData,
    setFormData,
    handleSubmit,
    filteredEntries,
    monthlyExpenses,
    deleteExpenseEntry,
    selectedYear,
    isFullScreen,
    setIsFullScreen,
    submitError,
    isSubmitting,
    tempExpenseReceipt,
    tempExpenseReceiptType,
    showExpenseCameraOptions,
    setShowExpenseCameraOptions,
    takeExpensePicture,
    pickExpenseFile,
    removeExpenseReceipt,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges
  } = useExpenses();

  // Ref to hold latest cancelEdit function
  const cancelEditRef = useRef(cancelEdit);
  cancelEditRef.current = cancelEdit;

  const handleFormSubmit = (e) => {
    handleSubmit(e, (newId) => {
      setHighlightId(newId);
      setShowExpenseModal(false);
      setTimeout(() => setHighlightId(null), 2000);
    });
  };

  // Close modal and cancel edit - memoized to prevent effect re-runs
  const handleModalClose = useCallback(() => {
    setShowExpenseModal(false);
    cancelEditRef.current(); // Use ref to avoid dependency
  }, []);

  const handleEdit = async (entry) => {
    await startEdit(entry);
    setShowExpenseModal(true);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showExpenseModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showExpenseModal]);

  // Register modals with UIContext
  useEffect(() => {
    if (viewingReceipt) {
      const modalId = `receipt-viewer-${Date.now()}`;
      receiptModalIdRef.current = modalId;
      pushModal(modalId, () => setViewingReceipt(null));
      return () => {
        if (receiptModalIdRef.current) {
          removeModal(receiptModalIdRef.current);
          receiptModalIdRef.current = null;
        }
      };
    }
  }, [viewingReceipt, pushModal, removeModal, setViewingReceipt]);

  useEffect(() => {
    if (showExpenseModal) {
      const modalId = `expense-form-${Date.now()}`;
      expenseModalIdRef.current = modalId;
      pushModal(modalId, handleModalClose);
      return () => {
        if (expenseModalIdRef.current) {
          removeModal(expenseModalIdRef.current);
          expenseModalIdRef.current = null;
        }
      };
    }
  }, [showExpenseModal, handleModalClose, pushModal, removeModal]);

  useEffect(() => {
    if (isFullScreen) {
      const modalId = `fullscreen-table-${Date.now()}`;
      fullscreenModalIdRef.current = modalId;
      pushModal(modalId, () => setIsFullScreen(false));
      return () => {
        if (fullscreenModalIdRef.current) {
          removeModal(fullscreenModalIdRef.current);
          fullscreenModalIdRef.current = null;
        }
      };
    }
  }, [isFullScreen, setIsFullScreen, pushModal, removeModal]);

  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 h-full overflow-hidden">
      <div 
        className="flex flex-col h-full max-w-6xl mx-auto w-full pt-4 pb-4"
        style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        {/* Full Width Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <ExpenseList 
            filteredEntries={filteredEntries}
            deleteExpenseEntry={deleteExpenseEntry}
            selectedYear={selectedYear}
            setIsFullScreen={setIsFullScreen}
            monthlyExpenses={monthlyExpenses}
            monthNames={monthNames}
            highlightId={highlightId}
            handleViewReceipt={handleViewReceipt}
            viewingReceipt={viewingReceipt}
            setViewingReceipt={setViewingReceipt}
            onEdit={handleEdit}
            onAddExpense={() => setShowExpenseModal(true)}
          />
        </div>

        {/* Expense Form Modal */}
        {showExpenseModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={handleModalClose}
          >
            <div 
              className="w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <ExpenseForm 
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleFormSubmit}
                submitError={submitError}
                isSubmitting={isSubmitting}
                tempExpenseReceipt={tempExpenseReceipt}
                tempExpenseReceiptType={tempExpenseReceiptType}
                takeExpensePicture={takeExpensePicture}
                pickExpenseFile={pickExpenseFile}
                removeExpenseReceipt={removeExpenseReceipt}
                editingId={editingId}
                cancelEdit={handleModalClose}
                hasChanges={hasChanges}
              />
            </div>
          </div>
        )}

        {/* Full Screen Table Modal */}
        {isFullScreen && (
          <div className="fixed inset-0 bg-background z-9999 flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-card/95 backdrop-blur-md border-b border-border/50">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Ausgaben {selectedYear}</h2>
                    <p className="text-xs text-muted-foreground">{filteredEntries.length} Einträge</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFullScreen(false)}
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
              <div className="max-w-5xl w-full mx-auto flex items-center justify-end">
                <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-rose-600">{totalAmount.toFixed(2)} €</span>
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
                        <th className="p-4 text-xs uppercase tracking-wider">Beschreibung</th>
                        <th className="p-4 text-xs uppercase tracking-wider text-right sticky right-0 top-0 z-30 bg-muted/30 backdrop-blur-sm shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)]">Betrag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-12 text-center">
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
                        filteredEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex flex-col items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-rose-600 leading-none">
                                    {new Date(entry.date).getDate()}
                                  </span>
                                  <span className="text-[8px] uppercase text-rose-600/70 mt-0.5">
                                    {new Date(entry.date).toLocaleDateString('de-DE', { month: 'short' })}
                                  </span>
                                </div>
                                <span className="font-medium text-foreground">{formatDate(entry.date)}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground">{entry.description}</td>
                            <td className="p-4 text-right font-bold text-foreground sticky right-0 bg-card group-hover:bg-muted/20 z-10 shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)] transition-colors">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600">
                                {entry.amount.toFixed(2)} €
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-muted/30 font-bold border-t border-border/50 sticky bottom-0 z-20">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-left text-foreground">
                          <span className="text-sm">Gesamtsumme {selectedYear}</span>
                        </td>
                        <td className="px-4 py-3 text-right sticky right-0 bottom-0 z-30 bg-muted/30 backdrop-blur-sm shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)]">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-600 text-base font-bold">
                            {totalAmount.toFixed(2)} €
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
