"use client";
import { useState } from 'react';
import { useEquipmentForm } from './_features/hooks/useEquipmentForm';
import { useEquipmentList } from './_features/hooks/useEquipmentList';
import EquipmentForm from './_features/components/EquipmentForm';
import EquipmentList from './_features/components/EquipmentList';
import { formatDate } from '@/utils/dateFormatter';

export default function EquipmentPage() {
  const [highlightId, setHighlightId] = useState(null);
  const {
    formData,
    setFormData,
    tempReceipt,
    setTempReceipt,
    removeReceipt,
    showCameraOptions,
    setShowCameraOptions,
    nameSuggestions,
    takePicture,
    handleSubmit,
    submitError,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges
  } = useEquipmentForm();

  const handleFormSubmit = (e) => {
    handleSubmit(e, (newId) => {
      setHighlightId(newId);
      setTimeout(() => setHighlightId(null), 2000);
    });
  };

  const {
    filteredEquipmentEntries,
    deleteEquipmentEntry,
    selectedYear,
    isFullScreen,
    setIsFullScreen,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt
  } = useEquipmentList();

  const totalDeductible = filteredEquipmentEntries.reduce((sum, entry) => sum + entry.deductibleAmount, 0);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex flex-col gap-8 py-8 max-w-6xl mx-auto w-full" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        <p className="text-gray-600 text-sm sm:text-base">Verwalten Sie Ihre Arbeitsmittel und GWG (Geringwertige Wirtschaftsgüter).</p>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form */}
          <div className="flex flex-col gap-6 lg:col-span-1 scroll-mt-32" id="equipment-form-container">
          <EquipmentForm 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleFormSubmit}
            tempReceipt={tempReceipt}
            setTempReceipt={setTempReceipt}
            removeReceipt={removeReceipt}
            showCameraOptions={showCameraOptions}
            setShowCameraOptions={setShowCameraOptions}
            nameSuggestions={nameSuggestions}
            takePicture={takePicture}
            submitError={submitError}
            editingId={editingId}
            cancelEdit={cancelEdit}
            hasChanges={hasChanges}
          />
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2">
          <EquipmentList 
            filteredEquipmentEntries={filteredEquipmentEntries}
            deleteEquipmentEntry={deleteEquipmentEntry}
            selectedYear={selectedYear}
            setIsFullScreen={setIsFullScreen}
            handleViewReceipt={handleViewReceipt}
            highlightId={highlightId}
            onEdit={(entry) => {
              startEdit(entry);
              setTimeout(() => {
                const formContainer = document.getElementById('equipment-form-container');
                if (formContainer) {
                  formContainer.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 100);
            }}
          />
        </div>
        </div>

        {/* Full Screen Modal */}
        {isFullScreen && (
          <div className="fixed inset-0 bg-white z-9999 flex flex-col animate-in fade-in duration-200">
            <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-white/80 backdrop-blur-sm border-b border-gray-100">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-gray-900">Arbeitsmittel {selectedYear}</h2>
                <button 
                  onClick={() => setIsFullScreen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col min-h-0 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pl-[calc(1rem+env(safe-area-inset-left))] pr-[calc(1rem+env(safe-area-inset-right))]">
              <div className="max-w-5xl mx-auto w-full rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-auto min-h-0">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 sticky top-0 z-20">
                    <tr>
                      <th className="p-4">Datum</th>
                      <th className="p-4">Gegenstand</th>
                      <th className="p-4">Preis</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right sticky right-0 top-0 z-30 bg-gray-50 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Absetzbar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredEquipmentEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{formatDate(entry.date)}</td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{entry.name}</div>
                          {entry.receiptFileName && (
                            <button 
                              onClick={() => handleViewReceipt(entry.receiptFileName)}
                              className="text-xs text-blue-600 hover:underline mt-1"
                            >
                              Beleg anzeigen
                            </button>
                          )}
                        </td>
                        <td className="p-4 text-gray-600">{entry.price.toFixed(2)} €</td>
                        <td className="p-4 text-gray-500">{entry.status}</td>
                        <td className="p-4 text-right font-bold text-blue-600 sticky right-0 bg-white z-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">{entry.deductibleAmount.toFixed(2)} €</td>
                      </tr>
                    ))}
                    {filteredEquipmentEntries.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          Keine Einträge für {selectedYear} gefunden
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold border-t border-gray-200 sticky bottom-0 z-20">
                    <tr>
                      <td colSpan={4} className="px-4 py-1 text-right text-gray-900">Gesamtsumme:</td>
                      <td className="px-4 py-1 text-right text-blue-600 sticky right-0 bottom-0 bg-gray-50 z-30 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
                        {totalDeductible.toFixed(2)} €
                      </td>
                    </tr>
                  </tfoot>
                </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Viewer Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-9999 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingReceipt(null)}>
            <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
              <img 
                src={viewingReceipt} 
                alt="Beleg" 
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                onClick={() => setViewingReceipt(null)}
                className="mt-4 px-6 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-full font-medium transition-colors shadow-lg"
              >
                Schließen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
