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
      </div>
    </div>
  );
}
