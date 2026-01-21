"use client";
import { useState } from 'react';
import { useExpenses } from './_features/hooks/useExpenses';
import ExpenseForm from './_features/components/ExpenseForm';
import ExpenseList from './_features/components/ExpenseList';
import { formatDate } from '@/utils/dateFormatter';

export default function ExpensesPage() {
  const [highlightId, setHighlightId] = useState(null);
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
    tempExpenseReceipt,
    showExpenseCameraOptions,
    setShowExpenseCameraOptions,
    takeExpensePicture,
    removeExpenseReceipt,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges
  } = useExpenses();

  const handleFormSubmit = (e) => {
    handleSubmit(e, (newId) => {
      setHighlightId(newId);
      setTimeout(() => setHighlightId(null), 2000);
    });
  };

  const handleEdit = (entry) => {
    startEdit(entry);
    setTimeout(() => {
      document.getElementById('expense-form-container')?.scrollIntoView({ behavior: 'smooth' }) 
        || window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col gap-8 px-4 py-8 w-full max-w-6xl mx-auto">
        
        {/* Page Description */}
        <p className="text-sm text-gray-600 sm:text-base">
          Erfassen Sie hier Ihre tatsächlichen Ausgaben (z.B. Mittagessen, Snacks), die nicht steuerlich absetzbar sind. 
          Vergleichen Sie diese mit Ihren erhaltenen Verpflegungspauschalen, um zu sehen, ob sich die Pauschale für Sie "lohnt".
        </p>
      
        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Form Column */}
          <section id="expense-form-container" className="scroll-mt-32 lg:col-span-1">
            <ExpenseForm 
              formData={formData}
              setFormData={setFormData}
              handleSubmit={handleFormSubmit}
              submitError={submitError}
              tempExpenseReceipt={tempExpenseReceipt}
              showExpenseCameraOptions={showExpenseCameraOptions}
              setShowExpenseCameraOptions={setShowExpenseCameraOptions}
              takeExpensePicture={takeExpensePicture}
              removeExpenseReceipt={removeExpenseReceipt}
              editingId={editingId}
              cancelEdit={cancelEdit}
              hasChanges={hasChanges}
            />
          </section>

          {/* List Column */}
          <section className="lg:col-span-2">
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
            />
          </section>
        </div>

        {/* Full Screen Table Modal */}
        {isFullScreen && (
          <div className="fixed inset-0 z-9999 flex flex-col bg-white animate-in fade-in duration-200">
            
            {/* Modal Header */}
            <header 
              className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm"
              style={{ 
                paddingTop: 'env(safe-area-inset-top)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)'
              }}
            >
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ausgaben {selectedYear}
                </h2>
                <button 
                  onClick={() => setIsFullScreen(false)}
                  className="p-2 rounded-full text-gray-600 transition-colors hover:bg-gray-100"
                  aria-label="Schließen"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>
            
            {/* Modal Body */}
            <div 
              className="flex flex-1 flex-col min-h-0 py-4"
              style={{ 
                paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
                paddingLeft: 'calc(1rem + env(safe-area-inset-left))',
                paddingRight: 'calc(1rem + env(safe-area-inset-right))'
              }}
            >
              <div className="flex flex-col h-full w-full max-w-5xl mx-auto overflow-hidden rounded-xl shadow-sm">
                <div className="flex-1 overflow-auto min-h-0">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="sticky top-0 z-20 border-b border-gray-100 bg-gray-50 font-medium text-gray-500">
                      <tr>
                        <th className="p-4">Datum</th>
                        <th className="p-4">Beschreibung</th>
                        <th className="sticky right-0 top-0 z-30 p-4 bg-gray-50 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                          Betrag
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {filteredEntries.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-gray-500">
                            Keine Einträge für {selectedYear} gefunden
                          </td>
                        </tr>
                      ) : (
                        filteredEntries.map((entry) => (
                          <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-900">{formatDate(entry.date)}</td>
                            <td className="p-4 text-gray-600">{entry.description}</td>
                            <td className="sticky right-0 z-10 p-4 font-bold text-blue-600 bg-white shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                              {entry.amount.toFixed(2)} €
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="sticky bottom-0 z-20 border-t border-gray-200 bg-gray-50 font-bold">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right text-gray-900">Gesamtsumme:</td>
                        <td className="sticky right-0 bottom-0 z-30 px-4 py-3 font-bold text-blue-600 bg-gray-50 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                          {totalAmount.toFixed(2)} €
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
    </main>
  );
}
