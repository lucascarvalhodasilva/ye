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
