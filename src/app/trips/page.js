"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTripForm } from './_features/hooks/useTripForm';
import { useTripList } from './_features/hooks/useTripList';
import TripForm from './_features/components/TripForm';
import TripList from './_features/components/TripList';
import PDFViewer from '@/components/shared/PDFViewerDynamic';
import { useUIContext } from '@/context/UIContext';

export default function TripsPage() {
  const [highlightId, setHighlightId] = useState(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const currentMonth = new Date().getMonth();
  const { pushModal, removeModal } = useUIContext();
  
  // Refs to store stable modal IDs
  const receiptModalIdRef = useRef(null);
  const tripModalIdRef = useRef(null);

  const { 
    formData, 
    setFormData, 
    handleSubmit, 
    autoAddStationTrips, 
    setAutoAddStationTrips,
    submitError,
    isSubmitting,
    tempPublicTransportReceipt,
    tempPublicTransportReceiptType,
    takePublicTransportPicture,
    pickPublicTransportFile,
    removePublicTransportReceipt,
    editingId,
    startEdit,
    cancelEdit,
    hasChanges
  } = useTripForm();

  // Ref to hold latest cancelEdit function
  const cancelEditRef = useRef(cancelEdit);
  cancelEditRef.current = cancelEdit;

  // Close modal after successful submit
  const handleFormSubmit = (e) => {
    handleSubmit(e, (newId) => {
      setHighlightId(newId);
      setShowTripModal(false);
      // Clear highlight after animation
      setTimeout(() => setHighlightId(null), 2000);
    });
  };

  // Close modal and cancel edit - memoized to prevent effect re-runs
  const handleModalClose = useCallback(() => {
    setShowTripModal(false);
    cancelEditRef.current(); // Use ref to avoid dependency
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showTripModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showTripModal]);

  const { 
    tripEntries, 
    handleDeleteEntry, 
    selectedYear,
    viewingReceipt,
    setViewingReceipt,
    handleViewReceipt,
    isFullScreen,
    setIsFullScreen
  } = useTripList();

  // Register receipt viewer modal with UIContext
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

  // Register trip form modal with UIContext
  useEffect(() => {
    if (showTripModal) {
      const modalId = `trip-form-${Date.now()}`;
      tripModalIdRef.current = modalId;
      pushModal(modalId, handleModalClose);
      return () => {
        if (tripModalIdRef.current) {
          removeModal(tripModalIdRef.current);
          tripModalIdRef.current = null;
        }
      };
    }
  }, [showTripModal, handleModalClose, pushModal, removeModal]);

  return (
    <div className="bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 h-full overflow-hidden">
      <div 
        className="flex flex-col h-full max-w-6xl mx-auto w-full pt-4 pb-4"
        style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
      >
        {/* Full Width Content */}
        <div className="flex flex-col flex-1 min-h-0">
          <TripList 
            tripEntries={tripEntries}
            handleDeleteEntry={handleDeleteEntry}
            selectedYear={selectedYear}
            setIsFullScreen={setIsFullScreen}
            highlightId={highlightId}
            handleViewReceipt={handleViewReceipt}
            onEdit={async (entry) => {
              await startEdit(entry);
              setShowTripModal(true);
            }}
            onAddTrip={() => setShowTripModal(true)}
            isFullScreen={isFullScreen}
          />
        </div>

        {/* Trip Form Modal */}
        {showTripModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={handleModalClose}
          >
            <div 
              className="w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <TripForm 
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleFormSubmit}
                submitError={submitError}
                isSubmitting={isSubmitting}
                editingId={editingId}
                cancelEdit={handleModalClose}
                hasChanges={hasChanges}
                tempPublicTransportReceipt={tempPublicTransportReceipt}
                tempPublicTransportReceiptType={tempPublicTransportReceiptType}
                takePublicTransportPicture={takePublicTransportPicture}
                pickPublicTransportFile={pickPublicTransportFile}
                removePublicTransportReceipt={removePublicTransportReceipt}
              />
          </div>
        </div>
      )}

        {/* Receipt Viewer Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setViewingReceipt(null)}>
            <div className="relative max-w-3xl w-full h-full flex flex-col items-center">
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
                    onClick={e => e.stopPropagation()}
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
