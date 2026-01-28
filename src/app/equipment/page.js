"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useEquipmentForm } from './_features/hooks/useEquipmentForm';
import { useEquipmentList } from './_features/hooks/useEquipmentList';
import EquipmentForm from './_features/components/EquipmentForm';
import EquipmentList from './_features/components/EquipmentList';
import PDFViewer from '@/components/shared/PDFViewerDynamic';
import { formatDate } from '@/utils/dateFormatter';
import { useUIContext } from '@/context/UIContext';

export default function EquipmentPage() {
  const [highlightId, setHighlightId] = useState(null);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { pushModal, removeModal } = useUIContext();
  
  // Refs to store stable modal IDs
  const receiptModalIdRef = useRef(null);
  const equipmentModalIdRef = useRef(null);
  const fullscreenModalIdRef = useRef(null);

  const {
    formData,
    setFormData,
    tempReceipt,
    tempReceiptType,
    removeReceipt,
    takePicture,
    pickFile,
    handleSubmit,
    submitError,
    isSubmitting,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges
  } = useEquipmentForm();

  // Ref to hold latest cancelEdit function
  const cancelEditRef = useRef(cancelEdit);
  cancelEditRef.current = cancelEdit;

  const handleFormSubmit = (e) => {
    handleSubmit(e, (newId) => {
      setHighlightId(newId);
      setShowEquipmentModal(false);
      setTimeout(() => setHighlightId(null), 2000);
    });
  };

  // Close modal and cancel edit - memoized to prevent effect re-runs
  const handleModalClose = useCallback(() => {
    setShowEquipmentModal(false);
    cancelEditRef.current(); // Use ref to avoid dependency
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showEquipmentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showEquipmentModal]);

  const {
    filteredEquipmentEntries,
    deleteEquipmentEntry,
    selectedYear,
    isFullScreen,
    setIsFullScreen,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    generateDepreciationSchedule
  } = useEquipmentList();

  // Auto-close schedule card when opening form or receipt preview
  useEffect(() => {
    let timeoutId;
    if (showEquipmentModal || viewingReceipt) {
      if (scheduleOpen) {
        setScheduleOpen(false);
        timeoutId = setTimeout(() => setSelectedEquipment(null), 300);
      }
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showEquipmentModal, viewingReceipt, scheduleOpen]); // Only respond to modal/receipt state changes

  // Helper to close floating card first, then execute action
  const closeFloatingCardThen = (action) => {
    if (scheduleOpen) {
      setScheduleOpen(false);
      setTimeout(() => {
        setSelectedEquipment(null);
        action();
      }, 300);
    } else {
      action();
    }
  };

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
    if (showEquipmentModal) {
      const modalId = `equipment-form-${Date.now()}`;
      equipmentModalIdRef.current = modalId;
      pushModal(modalId, handleModalClose);
      return () => {
        if (equipmentModalIdRef.current) {
          removeModal(equipmentModalIdRef.current);
          equipmentModalIdRef.current = null;
        }
      };
    }
  }, [showEquipmentModal, handleModalClose, pushModal, removeModal]);

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

  const totalDeductible = filteredEquipmentEntries.reduce((sum, entry) => sum + (entry.deductibleAmount || 0), 0);

  return (
    <div className="bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 h-full overflow-hidden">
      <div 
        className="flex flex-col h-full max-w-6xl mx-auto w-full pt-4 pb-4"
        style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        {/* Full Width Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <EquipmentList 
            filteredEquipmentEntries={filteredEquipmentEntries}
            deleteEquipmentEntry={deleteEquipmentEntry}
            selectedYear={selectedYear}
            setIsFullScreen={setIsFullScreen}
            handleViewReceipt={(fileName) => closeFloatingCardThen(() => handleViewReceipt(fileName))}
            highlightId={highlightId}
            onEdit={async (entry) => {
              closeFloatingCardThen(async () => {
                await startEdit(entry);
                setShowEquipmentModal(true);
              });
            }}
            onAddEquipment={() => closeFloatingCardThen(() => setShowEquipmentModal(true))}
            generateDepreciationSchedule={generateDepreciationSchedule}
            scheduleOpen={scheduleOpen}
            setScheduleOpen={setScheduleOpen}
            selectedEquipment={selectedEquipment}
            setSelectedEquipment={setSelectedEquipment}
          />
        </div>

        {/* Equipment Form Modal */}
        {showEquipmentModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={handleModalClose}
          >
            <div 
              className="w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <EquipmentForm 
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleFormSubmit}
                tempReceipt={tempReceipt}
                tempReceiptType={tempReceiptType}
                removeReceipt={removeReceipt}
                takePicture={takePicture}
                pickFile={pickFile}
                submitError={submitError}
                isSubmitting={isSubmitting}
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
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Arbeitsmittel {selectedYear}</h2>
                    <p className="text-xs text-muted-foreground">{filteredEquipmentEntries.length} Einträge</p>
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
                <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-bold text-blue-600">{totalDeductible.toFixed(2)} €</span>
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
                        <th className="p-4 text-xs uppercase tracking-wider">Gegenstand</th>
                        <th className="p-4 text-xs uppercase tracking-wider">Preis</th>
                        <th className="p-4 text-xs uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs uppercase tracking-wider text-right sticky right-0 top-0 z-30 bg-muted/30 backdrop-blur-sm shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)]">Absetzbar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredEquipmentEntries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-12 text-center">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-sm text-muted-foreground">Keine Einträge für {selectedYear}</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredEquipmentEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex flex-col items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-blue-600 leading-none">
                                    {new Date(entry.date).getDate()}
                                  </span>
                                  <span className="text-[8px] uppercase text-blue-600/70 mt-0.5">
                                    {new Date(entry.date).toLocaleDateString('de-DE', { month: 'short' })}
                                  </span>
                                </div>
                                <span className="font-medium text-foreground">{formatDate(entry.date)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-foreground">{entry.name}</div>
                              {entry.receiptFileName && (
                                <button 
                                  onClick={() => handleViewReceipt(entry.receiptFileName)}
                                  className="text-xs text-blue-600 hover:underline mt-1"
                                >
                                  Beleg anzeigen
                                </button>
                              )}
                            </td>
                            <td className="p-4 text-muted-foreground">{(entry.price || 0).toFixed(2)} €</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded-lg ${
                                entry.status === 'GWG' 
                                  ? 'bg-emerald-500/10 text-emerald-600' 
                                  : 'bg-amber-500/10 text-amber-600'
                              }`}>
                                {entry.status}
                              </span>
                            </td>
                            <td className="p-4 text-right font-bold text-foreground sticky right-0 bg-card group-hover:bg-muted/20 z-10 shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)] transition-colors">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600">
                                {(entry.deductibleAmount || 0).toFixed(2)} €
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-muted/30 font-bold border-t border-border/50 sticky bottom-0 z-20">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-left text-foreground">
                          <span className="text-sm">Gesamtsumme {selectedYear}</span>
                        </td>
                        <td className="px-4 py-3 text-right sticky right-0 bottom-0 z-30 bg-muted/30 backdrop-blur-sm shadow-[-8px_0_16px_-8px_rgba(0,0,0,0.1)]">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-600 text-base font-bold">
                            {totalDeductible.toFixed(2)} €
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

        {/* Receipt Viewer Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-9999 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingReceipt(null)}>
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex flex-col items-center">
              {viewingReceipt.type === 'pdf' ? (
                <PDFViewer 
                  source={viewingReceipt.data}
                  onClose={() => setViewingReceipt(null)}
                />
              ) : (
                <>
                  <img 
                    src={viewingReceipt.data} 
                    alt="Beleg" 
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button 
                    onClick={() => setViewingReceipt(null)}
                    className="mt-4 px-6 py-2.5 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    Schließen
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
