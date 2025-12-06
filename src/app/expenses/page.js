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
    setIsFullScreen
  } = useExpenses();

  const handleFormSubmit = (e) => {
    handleSubmit(e, (newId) => {
      setHighlightId(newId);
      setTimeout(() => setHighlightId(null), 2000);
    });
  };

  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  const totalAmount = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-8 py-8 container-custom">
      <p className="text-muted-foreground">
        Erfassen Sie hier Ihre tatsächlichen Ausgaben (z.B. Mittagessen, Snacks), die nicht steuerlich absetzbar sind. 
        Vergleichen Sie diese mit Ihren erhaltenen Verpflegungspauschalen, um zu sehen, ob sich die Pauschale für Sie "lohnt".
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6 lg:col-span-1">
          <ExpenseForm 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleFormSubmit}
          />
        </div>

        {/* Right Column: List & Stats */}
        <div className="lg:col-span-2">
          <ExpenseList 
            filteredEntries={filteredEntries}
            deleteExpenseEntry={deleteExpenseEntry}
            selectedYear={selectedYear}
            setIsFullScreen={setIsFullScreen}
            monthlyExpenses={monthlyExpenses}
            monthNames={monthNames}
            highlightId={highlightId}
          />
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-200">
          <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-card/50 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Ausgaben {selectedYear}</h2>
              <button 
                onClick={() => setIsFullScreen(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
            <div className="max-w-5xl mx-auto w-full rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-auto min-h-0">
                <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-secondary text-muted-foreground font-medium border-b border-border sticky top-0 z-20">
                  <tr>
                    <th className="p-4">Datum</th>
                    <th className="p-4">Beschreibung</th>
                    <th className="p-4 sticky right-0 top-0 bg-secondary z-30 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Betrag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-medium">{formatDate(entry.date)}</td>
                      <td className="p-4">{entry.description}</td>
                      <td className="p-4 font-bold sticky right-0 bg-card z-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">{entry.amount.toFixed(2)} €</td>
                    </tr>
                  ))}
                  {filteredEntries.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        Keine Einträge für {selectedYear} gefunden
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-secondary font-bold border-t border-border sticky bottom-0 z-20">
                  <tr>
                    <td colSpan={2} className="px-4 py-1 text-right">Gesamtsumme:</td>
                    <td className="px-4 py-1 font-bold sticky right-0 bottom-0 bg-secondary z-30 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
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
  );
}
