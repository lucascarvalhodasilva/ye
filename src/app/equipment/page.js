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
    showCameraOptions,
    setShowCameraOptions,
    nameSuggestions,
    takePicture,
    handleSubmit
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
    <div className="space-y-8 py-8 container-custom">
      <p className="text-muted-foreground">Verwalten Sie Ihre Arbeitsmittel und GWG (Geringwertige Wirtschaftsgüter).</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="space-y-6 lg:col-span-1">
          <EquipmentForm 
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleFormSubmit}
            tempReceipt={tempReceipt}
            setTempReceipt={setTempReceipt}
            showCameraOptions={showCameraOptions}
            setShowCameraOptions={setShowCameraOptions}
            nameSuggestions={nameSuggestions}
            takePicture={takePicture}
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
          />
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col animate-in fade-in duration-200">
          <div className="pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] bg-card/50 backdrop-blur-sm border-b border-border">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-semibold">Arbeitsmittel {selectedYear}</h2>
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
                    <th className="p-4">Gegenstand</th>
                    <th className="p-4">Preis</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right sticky right-0 top-0 z-30 bg-secondary shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">Absetzbar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filteredEquipmentEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-medium">{formatDate(entry.date)}</td>
                      <td className="p-4">
                        <div className="font-medium">{entry.name}</div>
                        {entry.receiptFileName && (
                          <button 
                            onClick={() => handleViewReceipt(entry.receiptFileName)}
                            className="text-xs text-primary hover:underline mt-1"
                          >
                            Beleg anzeigen
                          </button>
                        )}
                      </td>
                      <td className="p-4">{entry.price.toFixed(2)} €</td>
                      <td className="p-4 text-muted-foreground">{entry.status}</td>
                      <td className="p-4 text-right font-bold text-primary sticky right-0 bg-card z-10 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">{entry.deductibleAmount.toFixed(2)} €</td>
                    </tr>
                  ))}
                  {filteredEquipmentEntries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        Keine Einträge für {selectedYear} gefunden
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-secondary font-bold border-t border-border sticky bottom-0 z-20">
                  <tr>
                    <td colSpan={4} className="px-4 py-1 text-right">Gesamtsumme:</td>
                    <td className="px-4 py-1 text-right text-primary sticky right-0 bottom-0 bg-secondary z-30 shadow-[-5px_0_10px_-5px_rgba(0,0,0,0.1)]">
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
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingReceipt(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <img 
              src={viewingReceipt} 
              alt="Beleg" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setViewingReceipt(null)}
              className="mt-4 px-6 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-full font-medium transition-colors shadow-lg"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
